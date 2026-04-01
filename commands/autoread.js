import logger from "../utils/logger.js";

export default {
    name: "autoread",
    description: "Enable automatic reading of incoming messages",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Enable AutoRead mode in DB
            db.setConfig("autoRead", true);

            const response = `
${getReadArt()}
👀 *AUTOREAD MODE ENABLED*
${getReadArt()}

✅ All incoming messages will now be marked as read automatically.  
⚡ Active until disabled.

${getReadArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing autoread command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running autoread command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getReadArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👀─────────────────👀",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
