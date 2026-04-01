import logger from "../utils/logger.js";

export default {
    name: "userid",
    description: "Get the WhatsApp ID (JID) of yourself or a quoted user",
    category: "group",

    async execute(message, client, args) {
        try {
            const groupId = message.key.remoteJid;

            // Detect quoted message
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.participant;

            // If quoted, get that user's ID; otherwise, get sender's ID
            const targetId = quotedMsg || message.key.participant || message.key.remoteJid;

            await client.sendPresenceUpdate("composing", groupId);

            const response = `
${getUserArt()}
🆔 *USER ID FETCHED*
${getUserArt()}

👤 Target: ${quotedMsg ? "Quoted User" : "You"}  
📌 WhatsApp JID:  
${targetId}

💡 Status: User ID retrieved successfully.
${getUserArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing userid command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running userid command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getUserArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🆔─────────────────🆔",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
