import logger from "../utils/logger.js";

export default {
    name: "delete",
    description: "Delete a quoted message in chat",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            // Check if a quoted message exists
            const quoted = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
            const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

            if (!quoted) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Please reply to the message you want to delete." },
                    { quoted: message }
                );
                return;
            }

            // Delete the quoted message
            await client.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: false, id: quoted, participant: quotedParticipant } });

            const response = `
${getDeleteArt()}
🗑 *DELETE COMMAND EXECUTED*
${getDeleteArt()}

✅ The quoted message has been deleted successfully.  
⚡ Clean and moderated chat maintained.

${getDeleteArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing delete command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running delete command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getDeleteArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🗑─────────────────🗑",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
