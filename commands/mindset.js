import logger from "../utils/logger.js";

export default {
    name: "mindset",
    description: "Generate categorized mindset affirmations (Growth, Resilience, Focus)",
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
                        text: `🧠 *MINDSET COMMAND*\n\nUsage:\n• mindset [theme]\n• Reply to any message with: mindset\n\nExamples:\n• mindset Growth\n• mindset Discipline\n• mindset Positivity`,
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
                        text: "❌ No theme provided. Please add a subject or reply to a message with: mindset",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized affirmations
            const results = await generateMindset(theme);

            const response = `
${getMindsetArt()}
🧠 *MINDSET SHIFT*
${getMindsetArt()}

📝 *Theme:* ${theme}

💡 *Growth:*  
${results.growth}

💡 *Resilience:*  
${results.resilience}

💡 *Focus:*  
${results.focus}

${getMindsetArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing mindset command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating mindset shift. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized mindset generator
async function generateMindset(theme) {
    try {
        const growth = `Growth in ${theme} means embracing challenges as opportunities to learn.`;
        const resilience = `Resilience in ${theme} is bouncing back stronger every time you fall.`;
        const focus = `Focus in ${theme} is the art of saying no to distractions and yes to progress.`;

        return { growth, resilience, focus };
    } catch (error) {
        logger.error("Error generating mindset affirmations:", error);
        return { growth: "Unable to generate.", resilience: "Unable to generate.", focus: "Unable to generate." };
    }
}

// Decorative art for mindset messages
function getMindsetArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🧠─────────────────🧠",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
