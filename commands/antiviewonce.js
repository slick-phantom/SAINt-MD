import logger from "../utils/logger.js";

export default {
    name: "antiviewonce",
    description: "Disable view-once media, making it permanent",
    category: "security",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Enable AntiViewOnce mode in DB
            db.setConfig("antiViewOnce", true);

            const response = `
${getViewOnceArt()}
👁️ *ANTIVIEWONCE MODE ENABLED*
${getViewOnceArt()}

✅ View-once media will now be saved as normal files.  
⚡ Protection active for this group.

${getViewOnceArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing antiviewonce command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running antiviewonce command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getViewOnceArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👁️─────────────────👁️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
