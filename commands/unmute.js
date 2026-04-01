import logger from "../utils/logger.js";

export default {
    name: "unmute",
    description: "Unmute the group so members can chat again",
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

            try {
                // Allow all participants to send messages again
                await client.groupSettingUpdate(groupId, "not_announcement");

                const response = `
${getUnmuteArt()}
🔊 *GROUP UNMUTED*
${getUnmuteArt()}

✅ Members can now send messages freely.  
👥 Chat is open again.

${getUnmuteArt()}
                `.trim();

                await client.sendMessage(
                    groupId,
                    { text: response },
                    { quoted: message }
                );
            } catch (err) {
                logger.error("Error unmuting group:", err);
                await client.sendMessage(
                    groupId,
                    { text: "❌ Unable to unmute group. Make sure you are an admin." },
                    { quoted: message }
                );
            }
        } catch (error) {
            logger.error("Error executing unmute command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running unmute command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getUnmuteArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔊─────────────────🔊",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
