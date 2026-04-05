/**
 * Saint Bot - A WhatsApp Bot
 * Copyright (c) 2025 Slick
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * 
 * Credits:
 * - Baileys Library by @adiwajshing
 * - Pair Code implementation inspired by TechGod143 & DGXEON
 */
import './settings.js';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import chalk from 'chalk';
import FileType from 'file-type';
import path from 'path';
import axios from 'axios';
import { handleMessages, handleGroupParticipantUpdate, handleStatus } from './main.js';
import PhoneNumber from 'awesome-phonenumber';
import { imageToWebp, videoToWebp, writeExifImg, writeExifVid } from './lib/exif.js';
import { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, sleep, reSize } from './lib/myfunc.js';
import pkg from '@whiskeysockets/baileys';
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = pkg;
import NodeCache from 'node-cache';
import pino from 'pino';
import readline from 'readline';
import { parsePhoneNumber } from 'libphonenumber-js';
import { PHONENUMBER_MCC } from '@whiskeysockets/baileys/lib/Utils/generics.js';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import lightweight store
import store from './lib/lightweight_store.js';

// Initialize store
store.readFromFile();
import settings from './settings.js';
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000);

// Memory optimization - Force garbage collection if available
setInterval(() => {
    if (global.gc) {
        global.gc();
        console.log('🧹 Garbage collection completed');
    }
}, 60000);

// Memory monitoring - Restart if RAM gets too high
setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024;
    if (used > 400) {
        console.log('⚠️ RAM too high (>400MB), restarting bot...');
        process.exit(1);
    }
}, 30000);

let phoneNumber = "911234567890";
let owner = JSON.parse(fs.readFileSync('./data/owner.json'));

global.botname = "SAINT BOT";
global.themeemoji = "•";
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");

// Only create readline interface if we're in an interactive environment
const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
const question = (text) => {
    if (rl) {
        return new Promise((resolve) => rl.question(text, resolve));
    } else {
        return Promise.resolve(settings.ownerNumber || phoneNumber);
    }
};

async function startSaintBot() {
    try {
        let { version, isLatest } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        const msgRetryCounterCache = new NodeCache();

        const SaintBot = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: !pairingCode,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            getMessage: async (key) => {
                let jid = jidNormalizedUser(key.remoteJid);
                let msg = await store.loadMessage(jid, key.id);
                return msg?.message || "";
            },
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
        });

        // Save credentials when they update
        SaintBot.ev.on('creds.update', saveCreds);

        store.bind(SaintBot.ev);

        // Message handling
        SaintBot.ev.on('messages.upsert', async chatUpdate => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek.message) return;
                mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    await handleStatus(SaintBot, chatUpdate);
                    return;
                }
                
                if (!SaintBot.public && !mek.key.fromMe && chatUpdate.type === 'notify') {
                    const isGroup = mek.key?.remoteJid?.endsWith('@g.us');
                    if (!isGroup) return;
                }
                if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;

                if (SaintBot?.msgRetryCounterCache) {
                    SaintBot.msgRetryCounterCache.clear();
                }

                try {
                    await handleMessages(SaintBot, chatUpdate, true);
                } catch (err) {
                    console.error("Error in handleMessages:", err);
                }
            } catch (err) {
                console.error("Error in messages.upsert:", err);
            }
        });

        // Add these event handlers for better functionality
        SaintBot.decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return decode.user && decode.server && decode.user + '@' + decode.server || jid;
            } else return jid;
        };

        SaintBot.ev.on('contacts.update', update => {
            for (let contact of update) {
                let id = SaintBot.decodeJid(contact.id);
                if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
            }
        });

        SaintBot.getName = (jid, withoutContact = false) => {
            let id = SaintBot.decodeJid(jid);
            withoutContact = SaintBot.withoutContact || withoutContact;
            let v;
            if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
                v = store.contacts[id] || {};
                if (!(v.name || v.subject)) v = SaintBot.groupMetadata(id) || {};
                resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'));
            });
            else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === SaintBot.decodeJid(SaintBot.user.id) ?
                SaintBot.user :
                (store.contacts[id] || {});
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international');
        };

        SaintBot.public = true;
        SaintBot.serializeM = (m) => smsg(SaintBot, m, store);

        // Handle pairing code
        if (pairingCode && !SaintBot.authState.creds.registered) {
            if (useMobile) throw new Error('Cannot use pairing code with mobile api');

            let phoneNumberInput;
            if (!!global.phoneNumber) {
                phoneNumberInput = global.phoneNumber;
            } else {
                phoneNumberInput = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFormat: 6281376552730 (without + or spaces) : `)));
            }

            phoneNumberInput = phoneNumberInput.replace(/[^0-9]/g, '');

            const pn = await import('awesome-phonenumber');
            if (!pn.default('+' + phoneNumberInput).isValid()) {
                console.log(chalk.red('Invalid phone number. Please enter your full international number.'));
                process.exit(1);
            }

            setTimeout(async () => {
                try {
                    let code = await SaintBot.requestPairingCode(phoneNumberInput);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)));
                    console.log(chalk.yellow(`\nPlease enter this code in your WhatsApp app:\n1. Open WhatsApp\n2. Go to Settings > Linked Devices\n3. Tap "Link a Device"\n4. Enter the code shown above`));
                } catch (error) {
                    console.error('Error requesting pairing code:', error);
                    console.log(chalk.red('Failed to get pairing code.'));
                }
            }, 3000);
        }

        // Connection handling
        SaintBot.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect, qr } = s;
            
            if (qr) {
                console.log(chalk.yellow('📱 QR Code generated. Please scan with WhatsApp.'));
            }
            
            if (connection === 'connecting') {
                console.log(chalk.yellow('🔄 Connecting to WhatsApp...'));
            }
            
            if (connection == "open") {
                console.log(chalk.magenta(` `));
                console.log(chalk.yellow(`🌿 Connected to => ` + JSON.stringify(SaintBot.user, null, 2)));

                await delay(1999);
                console.log(chalk.yellow(`\n\n                  ${chalk.bold.blue(`[ ${global.botname || 'SAINT BOT'} ]`)}\n\n`));
                console.log(chalk.cyan(`< ================================================== >`));
                console.log(chalk.magenta(`\n${global.themeemoji || '•'} BOT NAME: SAINT BOT`));
                console.log(chalk.magenta(`${global.themeemoji || '•'} CREATOR: Slick`));
                console.log(chalk.magenta(`${global.themeemoji || '•'} WA NUMBER: ${owner}`));
                console.log(chalk.green(`${global.themeemoji || '•'} 🤖 Bot Connected Successfully! ✅`));
                console.log(chalk.blue(`Bot Version: ${settings.version}`));
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                
                console.log(chalk.red(`Connection closed, reconnecting ${shouldReconnect}`));
                
                if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                    try {
                        rmSync('./session', { recursive: true, force: true });
                        console.log(chalk.yellow('Session folder deleted. Please re-authenticate.'));
                    } catch (error) {
                        console.error('Error deleting session:', error);
                    }
                }
                
                if (shouldReconnect) {
                    console.log(chalk.yellow('Reconnecting...'));
                    await delay(5000);
                    startSaintBot();
                }
            }
        });

        // ANTI-CALL IS COMPLETELY REMOVED
        
        SaintBot.ev.on('group-participants.update', async (update) => {
            await handleGroupParticipantUpdate(SaintBot, update);
        });

        return SaintBot;
    } catch (error) {
        console.error('Error in startSaintBot:', error);
        await delay(5000);
        startSaintBot();
    }
}

// Start the bot with error handling
startSaintBot().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

const file = path.resolve(process.argv[1]);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${file}`));
    import(`${file}?update=${Date.now()}`);
});
