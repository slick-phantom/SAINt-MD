import logger from "../utils/logger.js";

export default {
    name: "summarize",
    description: "Generate categorized summaries (Brief, Detailed, Bullet Points)",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const inputText = args.join(" ") || quotedText;

            if (!inputText) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📝 *SUMMARIZE COMMAND*\n\nUsage:\n• summarize [text]\n• Reply to any message with: summarize\n\nExamples:\n• summarize The quick brown fox jumps over the lazy dog.\n• summarize Reply to a long message with: summarize`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized summaries
            const results = await generateSummaries(inputText);

            const response = `
${getSummarizeArt()}
📝 *SUMMARY GENERATOR*
${getSummarizeArt()}

💡 *Original:*  
${inputText}

💡 *Brief:*  
${results.brief}

💡 *Detailed:*  
${results.detailed}

💡 *Bullet Points:*  
${results.bullets}

${getSummarizeArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing summarize command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating summary. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized summary generator
async function generateSummaries(text) {
    try {
        const brief = text.length > 100 ? text.slice(0, 80) + "..." : text;
        const detailed = text.length > 200 ? text.slice(0, 150) + "..." : text;
        const bullets = `• ${text.split(".").slice(0, 3).join(".\n• ")}`;

        return { brief, detailed, bullets };
    } catch (error) {
        logger.error("Error generating summaries:", error);
        return { brief: "Unable to generate.", detailed: "Unable to generate.", bullets: "Unable to generate." };
    }
}

// Decorative art for summarize messages
function getSummarizeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📝─────────────────📝",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📚 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
