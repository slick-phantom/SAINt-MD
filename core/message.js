import 'dotenv/config';
import logger from '../utils/logger.js';

const prefix = process.env.PREFIX || '!';

export default async (sock, msg, handler) => {
    try {
        // msg is the raw message from Baileys
        if (!msg || !msg.message) return;
        
        // Extract text from message
        let messageContent = "";
        const messageObj = msg.message;
        
        // Handle different message types in Baileys 6.4.0
        if (messageObj.conversation) {
            messageContent = messageObj.conversation;
        } 
        else if (messageObj.extendedTextMessage?.text) {
            messageContent = messageObj.extendedTextMessage.text;
        }
        else if (messageObj.ephemeralMessage?.message) {
            // Handle disappearing messages
            const ephemeral = messageObj.ephemeralMessage.message;
            messageContent = ephemeral.conversation || ephemeral.extendedTextMessage?.text || "";
        }
        else if (messageObj.viewOnceMessage?.message) {
            // Handle view once messages
            const viewOnce = messageObj.viewOnceMessage.message;
            messageContent = viewOnce.conversation || viewOnce.extendedTextMessage?.text || "";
        }
        else if (messageObj.imageMessage?.caption) {
            messageContent = messageObj.imageMessage.caption;
        }
        else if (messageObj.videoMessage?.caption) {
            messageContent = messageObj.videoMessage.caption;
        }
        else if (messageObj.documentMessage?.caption) {
            messageContent = messageObj.documentMessage.caption;
        }
        
        // If no text content, ignore
        if (!messageContent) return;
        
        const sender = msg.key.remoteJid;
        const isGroup = sender.endsWith('@g.us');
        console.log(`💬 Message from ${sender}${isGroup ? ' (group)' : ''}: "${messageContent}"`);
        
        // Check if message starts with prefix
        if (!messageContent.startsWith(prefix)) return;
        
        // Parse command
        const args = messageContent.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift()?.toLowerCase();
        
        if (!commandName) return;
        
        console.log(`🎯 Command detected: ${prefix}${commandName}`);
        console.log(`📝 Arguments: ${args.join(' ') || 'none'}`);
        
        // Get command from handler
        const command = handler.getCommand(commandName);
        
        if (!command) {
            console.log(`❌ Unknown command: ${commandName}`);
            return await sock.sendMessage(sender, { 
                text: `❓ Unknown command: ${prefix}${commandName}` 
            }, { quoted: msg });
        }
        
        // Log command execution
        logger.info(`⚡ Command "${commandName}" executed by ${sender}`);
        
        // Execute command with correct order: (msg, sock, args)
        await command.execute(msg, sock, args);
        
    } catch (error) {
        logger.error("💥 Error in message handler:", error);
        console.error("Error details:", error.stack);
        
        const jid = msg?.key?.remoteJid;
        if (jid) {
            try {
                await sock.sendMessage(jid, { text: "⚠️ Oops, something went wrong while processing your command." });
            } catch (err) {
                console.error("Failed to send error message:", err);
            }
        }
    }
};
