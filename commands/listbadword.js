import logger from "../utils/logger.js";

export default {
    name: "listbadword",
    description: "List all currently active bad words in the filter",
    category: "security",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            // Retrieve bad words list from DB
            const badWords = db.getConfig("badWordsList") || [];

            if (badWords.length === 0) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ No bad words are currently set in the filter." },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getBadWordArt()}
📜 *LISTBADWORD*
${getBadWordArt()}

✅ Active bad words in filter:  
${badWords.map(w => `- ${w}`).join("\n")}

⚡ Use \`deletebadword word1 word2\` to add more.  
⚡ Use \`delsudo\` or similar commands to manage permissions.

${getBadWordArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing listbadword command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running listbadword command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getBadWordArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📜─────────────────📜",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
