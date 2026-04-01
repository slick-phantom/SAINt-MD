import logger from "../utils/logger.js";

export default {
    name: "antibug",
    description: "Enable anti-bug protection in groups",
    category: "security",

    async execute(message, client, args, db) {
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

            // Enable AntiBug mode in DB
            db.setConfig("antiBug", true);

            const response = `
${getBugArt()}
🛡️ *ANTIBUG MODE ENABLED*
${getBugArt()}

✅ Suspicious bug messages will now be blocked.  
⚡ Protection active for this group.

${getBugArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing antibug command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running antibug command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Decorative art
function getBugArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🛡️─────────────────🛡️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
