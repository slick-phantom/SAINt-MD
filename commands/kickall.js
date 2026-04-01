import logger from "../utils/logger.js";

export default {
    name: "kickall",
    description: "Remove all members from a group",
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

            const metadata = await client.groupMetadata(groupId);

            // Collect all participants except the bot itself and the group owner
            const botId = client.user.id;
            const ownerId = metadata.owner || null;

            const membersToKick = metadata.participants
                .map(p => p.id)
                .filter(id => id !== botId && id !== ownerId);

            if (membersToKick.length < 1) {
                await client.sendMessage(
                    groupId,
                    { text: "⚠️ No members available to kick." },
                    { quoted: message }
                );
                return;
            }

            await client.groupParticipantsUpdate(groupId, membersToKick, "remove");

            const response = `
${getKickAllArt()}
👢 *KICKALL REPORT*
${getKickAllArt()}

📝 *Removed Members:*  
${membersToKick.map(m => `@${m.split("@")[0]}`).join(" ")}

💡 *Status:*  
All non-admin members removed successfully.

${getKickAllArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                {
                    text: response,
                    mentions: membersToKick
                },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing kickall command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error removing all members. Make sure you have admin rights.",
                },
                { quoted: message }
            );
        }
    },
};

function getKickAllArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👢─────────────────👢",
        "⊱──────── ⚠️ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
