import logger from "../utils/logger.js";

export default {
    name: "showwelcome",
    description: "Enable showing of welcome/join messages",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            // Disable DelWelcome mode in DB
            db.setConfig("delWelcome", false);

            const response = `
${getWelcomeArt()}
🙆 *SHOWWELCOME MODE ENABLED*
${getWelcomeArt()}

✅ Welcome/join group messages will now be shown normally.  
⚡ Active until changed again.

${getWelcomeArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing showwelcome command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running showwelcome command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getWelcomeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🙆─────────────────🙆",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
