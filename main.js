/**
 * Saint Bot - A WhatsApp Bot
 * Copyright (c) 2025 Slick
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

// 🧹 Fix for ENOSPC / temp overflow in hosted panels
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Redirect temp storage away from system /tmp
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

// Auto-cleaner every 3 hours
setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => { });
                }
            });
        }
    });
}, 3 * 60 * 60 * 1000);

import settings from './settings.js';
import CommandHandler from './command.js';

// Initialize command handler
const commandHandler = new CommandHandler();

// Global settings
global.packname = settings.packname;
global.author = settings.author;

// Get newsletter context from settings
const getNewsletterContext = () => {
    if (settings.newsletter?.jid && settings.newsletter?.name) {
        return {
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: settings.newsletter.jid,
                    newsletterName: settings.newsletter.name,
                    serverMessageId: -1
                }
            }
        };
    }
    return {};
};

async function handleMessages(sock, messageUpdate, printLog) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId?.endsWith('@g.us');
        const isFromMe = message.key.fromMe;

        // Handle button responses
        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            
            if (buttonId === 'channel') {
                await sock.sendMessage(chatId, {
                    text: `📢 *Join our Channel:*\n${settings.channelLink || ''}`,
                    ...getNewsletterContext()
                });
                return;
            } else if (buttonId === 'owner') {
                const ownerCmd = commandHandler.getCommand('owner');
                if (ownerCmd) await ownerCmd.execute(message, sock, []);
                return;
            }
        }

        // Extract user message
        const userMessage = (
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            ''
        ).trim();

        const rawText = userMessage;

        // Log command usage
        if (userMessage.startsWith('.')) {
            console.log(`📝 Command: ${userMessage} in ${isGroup ? chatId : 'private'}`);
        }

        // Handle non-command messages
        if (!userMessage.startsWith('.')) {
            return;
        }

        // Parse command
        const args = rawText.slice(1).trim().split(/\s+/);
        const commandName = args[0].toLowerCase();
        const commandArgs = args.slice(1);

        // Get and execute command
        const command = commandHandler.getCommand(commandName);
        
        if (command) {
            try {
                await command.execute(message, sock, commandArgs);
            } catch (error) {
                console.error(`Error executing ${commandName}:`, error);
                await sock.sendMessage(chatId, {
                    text: '❌ Error executing command!',
                    ...getNewsletterContext()
                });
            }
        }
    } catch (error) {
        console.error('❌ Error in message handler:', error.message);
    }
}

async function handleGroupParticipantUpdate(sock, update) {
    // Let individual commands handle this if they want
    // For example, welcome/goodbye commands can listen for this
}

async function handleStatus(sock, status) {
    // Let individual commands handle status updates
}

// Load commands and export
await commandHandler.loadCommands();
console.log(`✅ Loaded ${commandHandler.getCommandNames().length} commands`);

export {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus
};
