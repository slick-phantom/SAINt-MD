import logger from "../utils/logger.js";

export default {
    name: "removebadword",
    description: "Remove a word from the bot's bad word filter list",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide the word you want to remove from the bad word list." },
                    { quoted: message }
                );
                return;
            }

            const badWord = args[0].toLowerCase();

            // Fetch existing bad words
            let badWords = await db.get("badWords") || [];

            if (!badWords.includes(badWord)) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ The word *${badWord}* is not in the bad word list.` },
                    { quoted: message }
                );
                return;
            }

            // Remove the bad word
            badWords = badWords.filter(word => word !== badWord);
            await db.set("badWords", badWords);

            const response = `
${getRemoveBadWordArt()}
🚫 *REMOVEBADWORD COMMAND EXECUTED*
${getRemoveBadWordArt()}

✅ Word removed successfully.  
📌 Removed Bad Word: *${badWord}*  
⚡ Remaining bad words tracked: *${badWords.length}*

${getRemoveBadWordArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing removebadword command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running removebadword command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getRemoveBadWordArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🚫─────────────────🚫",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
