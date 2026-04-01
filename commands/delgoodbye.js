import logger from "../utils/logger.js";

export default {
    name: "delgoodbye",
    description: "Enable automatic deletion of goodbye/left messages",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Enable DelGoodbye mode in DB
            db.setConfig("delGoodbye", true);

            const response = `
${getGoodbyeArt()}
👋 *DELGOODBYE MODE ENABLED*
${getGoodbyeArt()}

✅ Goodbye/left group messages will now be auto-deleted.  
⚡ Active until disabled.

${getGoodbyeArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing delgoodbye command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running delgoodbye command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getGoodbyeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👋─────────────────👋",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
