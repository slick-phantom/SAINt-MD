import logger from "../utils/logger.js";

export default {
    name: "autotype",
    description: "Enable automatic typing presence for the bot",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            // Enable AutoType mode in DB
            db.setConfig("autoType", true);

            // Simulate typing presence immediately
            await client.sendPresenceUpdate("composing", chatId);

            const response = `
${getTypeArt()}
⌨️ *AUTOTYPE MODE ENABLED*
${getTypeArt()}

✅ Bot will now automatically show typing presence.  
⚡ Active until disabled.

${getTypeArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing autotype command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running autotype command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getTypeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "⌨️─────────────────⌨️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
