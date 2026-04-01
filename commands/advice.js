import logger from "../utils/logger.js";

export default {
    name: "advice",
    description: "Generate styled advice messages",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "General Advice";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `💡 *ADVICE COMMAND*\n\nUsage:\n• advice [theme]\n• Reply to any message with: advice\n\nExamples:\n• advice success\n• advice friendship\n• advice coding`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const results = await generateAdvice(theme);

            const response = `
${getAdviceArt()}
💡 *ADVICE REPORT*
${getAdviceArt()}

📝 *Theme:* ${theme}

💡 *Tip:*  
${results.tip}

💡 *Approach:*  
${results.approach}

💡 *Mindset:*  
${results.mindset}

💡 *Status:*  
${results.status}

${getAdviceArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing advice command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating advice message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

async function generateAdvice(theme) {
    try {
        const tip = `🎯 "${theme}" advice: focus on small, consistent steps.`;
        const approach = `🛠️ "${theme}" approach: stay flexible and open-minded.`;
        const mindset = `✨ "${theme}" mindset: cultivate patience and positivity.`;
        const status = `📊 "${theme}" advice is timeless and widely valued.`;

        return { tip, approach, mindset, status };
    } catch (error) {
        logger.error("Error generating advice info:", error);
        return { tip: "Unable to generate.", approach: "Unable to generate.", mindset: "Unable to generate.", status: "Unable to generate." };
    }
}

function getAdviceArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "💡─────────────────💡",
        "⊱──────── 🎯 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
