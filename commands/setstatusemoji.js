import logger from "../utils/logger.js";

export default {
    name: "setstatusemoji",
    description: "Set a new emoji for the bot's status",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide an emoji to set as the bot's status." },
                    { quoted: message }
                );
                return;
            }

            const newEmoji = args[0];

            // Save new status emoji in DB
            db.setConfig("statusEmoji", newEmoji);

            const response = `
${getEmojiArt()}
😀 *SETSTATUSEMOJI SUCCESSFUL*
${getEmojiArt()}

✅ Bot status emoji has been updated.  
📌 New emoji: ${newEmoji}  
⚡ Active until changed again.

${getEmojiArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing setstatusemoji command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running setstatusemoji command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getEmojiArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "😀─────────────────😀",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
