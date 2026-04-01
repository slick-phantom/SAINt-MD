import logger from "../utils/logger.js";

export default {
    name: "setwarn",
    description: "Set maximum warnings allowed before action",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            if (args.length < 1 || isNaN(args[0])) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a valid number of warnings (e.g., 3, 5, 10)." },
                    { quoted: message }
                );
                return;
            }

            const warnLimit = parseInt(args[0]);

            // Save warning limit in DB
            db.setConfig("warnLimit", warnLimit);

            const response = `
${getWarnArt()}
⚠️ *SETWARN SUCCESSFUL*
${getWarnArt()}

✅ Warning limit has been updated.  
📌 New limit: *${warnLimit} warnings*  
⚡ Users exceeding this will trigger moderation action.

${getWarnArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing setwarn command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running setwarn command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getWarnArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "⚠️─────────────────⚠️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
