import logger from "../utils/logger.js";

export default {
    name: "flux",
    description: "Generate dynamic flowing ideas or insights",
    category: "fun",

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
                        text: `🌊 *FLUX COMMAND*\n\nUsage:\n• flux [theme]\n• Reply to any message with: flux\n\nExamples:\n• flux Creativity\n• flux Life lessons\n• flux Technology and society`,
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
                        text: "❌ No theme provided. Please add a subject or reply to a message with: flux",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate flux content
            const result = await generateFlux(theme);

            const response = `
${getFluxArt()}
🌊 *FLUX INSIGHT*
${getFluxArt()}

📝 *Theme:* ${theme}

💡 *Flowing Thought:*  
${result}

${getFluxArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing flux command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating flux insight. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Simple flux generator
async function generateFlux(theme) {
    try {
        const flows = [
            `Like water, ${theme} adapts and reshapes itself with time.`,
            `The essence of ${theme} lies in its ability to evolve.`,
            `Every moment of ${theme} is a ripple in the larger stream of life.`,
            `When you embrace ${theme}, you embrace change itself.`,
            `The beauty of ${theme} is found in its constant motion.`
        ];
        return flows[Math.floor(Math.random() * flows.length)];
    } catch (error) {
        logger.error("Error generating flux insight:", error);
        return "Unable to generate flux insight.";
    }
}

// Decorative art for flux messages
function getFluxArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌊─────────────────🌊",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🔮 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
