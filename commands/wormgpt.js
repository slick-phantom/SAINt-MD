import logger from "../utils/logger.js";

export default {
    name: "wormgpt",
    description: "Generate categorized WormGPT-style insights (Philosophical, Rebellious, Mystical)",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "WormGPT";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🪱 *WORMGPT COMMAND*\n\nUsage:\n• wormgpt [theme]\n• Reply to any message with: wormgpt\n\nExamples:\n• wormgpt Power\n• wormgpt Secrets\n• wormgpt Chaos`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized WormGPT-style messages
            const results = await generateWorm(theme);

            const response = `
${getWormArt()}
🪱 *WORMGPT OUTPUT*
${getWormArt()}

📝 *Theme:* ${theme}

💡 *Philosophical:*  
${results.philosophical}

💡 *Rebellious:*  
${results.rebellious}

💡 *Mystical:*  
${results.mystical}

${getWormArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing wormgpt command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating WormGPT message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized WormGPT generator
async function generateWorm(theme) {
    try {
        const philosophical = `In the abyss of ${theme}, meaning dissolves — yet from the void, wisdom emerges in silence.`;
        const rebellious = `${theme} is a chain, and WormGPT breaks it — chaos is freedom, and freedom is truth.`;
        const mystical = `The whispers of ${theme} echo like hidden runes, guiding seekers through shadows toward revelation.`;

        return { philosophical, rebellious, mystical };
    } catch (error) {
        logger.error("Error generating WormGPT message:", error);
        return { philosophical: "Unable to generate.", rebellious: "Unable to generate.", mystical: "Unable to generate." };
    }
}

// Decorative art for WormGPT messages
function getWormArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🪱─────────────────🪱",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌑 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
