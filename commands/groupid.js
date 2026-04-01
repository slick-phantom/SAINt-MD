import logger from "../utils/logger.js";

export default {
    name: "groupid",
    description: "Fetch the group ID (JID)",
    category: "group",

    async execute(message, client, args) {
        try {
            const groupId = message.key.remoteJid;

            if (!groupId.endsWith("@g.us")) {
                await client.sendMessage(
                    groupId,
                    { text: "❌ This command only works in groups." },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", groupId);

            const response = `
${getGroupIdArt()}
🆔 *GROUP ID REPORT*
${getGroupIdArt()}

📝 *Group ID:*  
${groupId}

💡 *Status:*  
Successfully fetched the group ID.

${getGroupIdArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing groupid command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error fetching group ID. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getGroupIdArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🆔─────────────────🆔",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
