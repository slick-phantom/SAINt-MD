import logger from "../utils/logger.js";

export default {
    name: "setprefix",
    description: "Set a new command prefix for the bot",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a new prefix (e.g., !, ., ?)." },
                    { quoted: message }
                );
                return;
            }

            const newPrefix = args[0];

            // Save new prefix in DB
            db.setConfig("commandPrefix", newPrefix);

            const response = `
${getPrefixArt()}
🔧 *SETPREFIX SUCCESSFUL*
${getPrefixArt()}

✅ Bot command prefix has been updated.  
📌 New prefix: *${newPrefix}*  
⚡ Active until changed again.

${getPrefixArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing setprefix command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running setprefix command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getPrefixArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔧─────────────────🔧",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
