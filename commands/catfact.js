import logger from "../utils/logger.js";

export default {
    name: "catfact",
    description: "Generate styled cat facts",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "General Cat Fact";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🐾 *CATFACT COMMAND*\n\nUsage:\n• catfact [theme]\n• Reply to any message with: catfact\n\nExamples:\n• catfact sleep\n• catfact whiskers\n• catfact history`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const results = await generateCatFact(theme);

            const response = `
${getCatFactArt()}
🐾 *CATFACT REPORT*
${getCatFactArt()}

📝 *Theme:* ${theme}

💡 *Fact:*  
${results.fact}

💡 *Behavior:*  
${results.behavior}

💡 *Trivia:*  
${results.trivia}

💡 *Status:*  
${results.status}

${getCatFactArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing catfact command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating cat fact message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

async function generateCatFact(theme) {
    try {
        const fact = `🐱 "${theme}" fact: Cats sleep 12–16 hours a day.`;
        const behavior = `😺 "${theme}" behavior: Cats use whiskers to sense space.`;
        const trivia = `✨ "${theme}" trivia: Ancient Egyptians worshipped cats.`;
        const status = `📊 "${theme}" cat fact is fascinating and widely loved.`;

        return { fact, behavior, trivia, status };
    } catch (error) {
        logger.error("Error generating cat fact info:", error);
        return { fact: "Unable to generate.", behavior: "Unable to generate.", trivia: "Unable to generate.", status: "Unable to generate." };
    }
}

function getCatFactArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🐾─────────────────🐾",
        "⊱──────── 😺 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
