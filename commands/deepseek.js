import logger from "../utils/logger.js";

export default {
    name: "deepseek",
    description: "Generate deep, introspective reflections based on a theme",
    category: "wisdom",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌌 *DEEPSEEK COMMAND*\n\nUsage:\n• deepseek [theme]\n• Reply to any message with: deepseek\n\nExamples:\n• deepseek Purpose\n• deepseek Happiness\n• deepseek Time`,
                    },
                    { quoted: message }
                );
                return;
            }

            const theme = args.join(" ") || quotedText;

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No theme provided. Please add a subject or reply to a message with: deepseek",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate deep reflections
            const results = await generateDeepSeek(theme);

            const response = `
${getDeepSeekArt()}
🌌 *DEEPSEEK REFLECTION*
${getDeepSeekArt()}

📝 *Theme:* ${theme}

💡 *Insights:*  
${results.map((msg, i) => `${i + 1}. ${msg}`).join("\n")}

${getDeepSeekArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing deepseek command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating deep reflection. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Deep reflection generator
async function generateDeepSeek(theme) {
    try {
        const reflections = [
            `In ${theme}, the answers often lie not in what we see, but in what we feel.`,
            `The essence of ${theme} is not to be solved, but to be lived.`,
            `Every journey through ${theme} reveals more about ourselves than the destination.`,
            `The paradox of ${theme} is that its depth grows the more we seek.`,
            `To understand ${theme}, we must first embrace silence and listen inward.`
        ];
        // Return 3 random reflections
        return reflections.sort(() => 0.5 - Math.random()).slice(0, 3);
    } catch (error) {
        logger.error("Error generating deep reflections:", error);
        return ["Unable to generate deep reflections."];
    }
}

// Decorative art for deepseek messages
function getDeepSeekArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌌─────────────────🌌",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌠 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
