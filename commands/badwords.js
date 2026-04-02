import logger from "../utils/logger.js";

export default {
    name: "badwords",
    description: "Show all words in the bot's bad word filter list",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            // Fetch bad words from database
            const badWords = await db.get("badWords") || [];

            if (badWords.length === 0) {
                await client.sendMessage(
                    chatId,
                    { text: "✅ No bad words are currently being tracked." },
                    { quoted: message }
                );
                return;
            }

            const badWordList = badWords
                .map((word, index) => `🔹 ${index + 1}. ${word}`)
                .join("\n");

            const response = `
${getBadWordsArt()}
🚫 *BAD WORDS LIST*
${getBadWordsArt()}

${badWordList}

⚡ Total bad words tracked: *${badWords.length}*

${getBadWordsArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing badwords command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running badwords command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getBadWordsArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🚫─────────────────🚫",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
