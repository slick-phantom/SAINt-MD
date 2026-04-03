import 'dotenv/config';
import logger from '../utils/logger.js';

const prefix = process.env.PREFIX || '!';
const ownerNumber = process.env.OWNER_NUMBER + "@s.whatsapp.net";

// Helper to safely extract text from any message type
function extractMessageContent(msg) {
    if (!msg.message) return "";

    // Unwrap ephemeral/viewOnce wrappers
    if (msg.message.ephemeralMessage) {
        msg.message = msg.message.ephemeralMessage.message;
    }
    if (msg.message.viewOnceMessage) {
        msg.message = msg.message.viewOnceMessage.message;
    }

    return msg.message.conversation ||
           msg.message.extendedTextMessage?.text ||
           msg.message.imageMessage?.caption ||
           msg.message.videoMessage?.caption ||
           msg.message.documentMessage?.caption ||
           "";
}

export default async (sock, m, handler) => {
    try {
        const msg = m.messages?.[0];
        if (!msg || msg.key.fromMe) return; // ignore bot’s own messages

        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');
        const messageContent = extractMessageContent(msg);

        // Ignore if no prefix
        if (!messageContent.startsWith(prefix)) return;

        // Parse command and args
        const args = messageContent.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        const command = handler.getCommand(commandName);
        if (!command) return;

        // --- Metadata & Permissions ---
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === ownerNumber;

        let groupMetadata = isGroup ? await sock.groupMetadata(jid).catch(() => null) : null;
        let participants = groupMetadata?.participants || [];
        let admins = participants.filter(p => p.admin !== null).map(p => p.id);

        const isSenderAdmin = admins.includes(sender);
        const botId = sock.user.id.split(':')[0] + "@s.whatsapp.net";
        const isBotAdmin = admins.includes(botId);

        // --- Validation Checks ---
        if (command.ownerOnly && !isOwner) {
            return sock.sendMessage(jid, { text: "❌ This command is restricted to the Bot Owner." }, { quoted: msg });
        }
        if (command.groupOnly && !isGroup) {
            return sock.sendMessage(jid, { text: "❌ This command can only be used in groups." }, { quoted: msg });
        }
        if (command.adminOnly && !isSenderAdmin && !isOwner) {
            return sock.sendMessage(jid, { text: "❌ You must be a group admin to use this." }, { quoted: msg });
        }
        if (command.botAdminRequired && !isBotAdmin) {
            return sock.sendMessage(jid, { text: "❌ I need to be an admin to perform this action." }, { quoted: msg });
        }

        // --- Execute Command ---
        logger.info(`⚡ Command "${commandName}" executed by ${sender} in ${isGroup ? 'Group' : 'Private'}`);

        await command.execute(sock, msg, {
            args,
            isGroup,
            isOwner,
            isAdmin: isSenderAdmin,
            isBotAdmin,
            payload: messageContent
        });

    } catch (error) {
        logger.error("💥 Error in message handler:", error);
    }
};
