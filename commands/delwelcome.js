import logger from "../utils/logger.js";

export default {
    name: "delwelcome",
    description: "Enable automatic deletion of welcome/join messages",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Enable DelWelcome mode in DB
            db.setConfig("delWelcome", true);

            const response = `
${getWelcomeArt()}
🙅 *DELWELCOME MODE ENABLED*
${getWelcomeArt()}

✅ Welcome/join group messages will now be auto-deleted.  
⚡ Active until disabled.

${getWelcomeArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing delwelcome command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running delwelcome command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getWelcomeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🙅─────────────────🙅",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
