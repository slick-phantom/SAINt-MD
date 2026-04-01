import logger from "../utils/logger.js";

export default {
    name: "analyze",
    description: "Analyze text for word count, sentiment, and keywords",
    category: "tools",

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
                        text: `📊 *AI ANALYZER*\n\nUsage:\n• analyze [text]\n• Reply to any message with: analyze\n\nExamples:\n• analyze This is a test sentence\n• analyze I love programming\n• analyze Copilot makes learning fun`,
                    },
                    { quoted: message }
                );
                return;
            }

            const fullInput = args.join(" ");
            const textToAnalyze = fullInput.trim() || quotedText;

            if (!textToAnalyze) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No text to analyze. Provide text directly or reply to a message with: analyze",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Perform analysis
            const result = await analyzeText(textToAnalyze);

            if (!result) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ Could not analyze the text. Please try again later.",
                    },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getAnalyzeArt()}
📊 *AI ANALYZER*
${getAnalyzeArt()}

🔤 *Input:*
${textToAnalyze}

📝 *Word Count:* ${result.wordCount}
🔡 *Character Count:* ${result.charCount}
😊 *Sentiment Score:* ${result.sentiment}
🔑 *Keywords:* ${result.keywords.join(", ")}

${getAnalyzeArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing analyze command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error analyzing text. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Simple text analysis function
async function analyzeText(text) {
    try {
        const words = text.split(/\s+/);
        const wordCount = words.length;
        const charCount = text.length;

        // Very basic sentiment (positive if contains "love", negative if "hate")
        let sentiment = 0;
        if (text.toLowerCase().includes("love")) sentiment = 1;
        if (text.toLowerCase().includes("hate")) sentiment = -1;

        // Keywords (longer words only)
        const keywords = words.filter(w => w.length > 4).slice(0, 5);

        return {
            wordCount,
            charCount,
            sentiment,
            keywords,
        };
    } catch (error) {
        logger.error("Error analyzing text:", error);
        return null;
    }
}

// Decorative art for analyzer messages
function getAnalyzeArt() {
    const arts = [
        "📊·───────────────·📈",
        "✦━━━━━━━━━━━━━━━━━✦",
        "🧠────────────────🧠",
        "⊱──────── 📉 ────────⊰",
        "»»────── 🔍 ──────««",
    ];

    return arts[Math.floor(Math.random() * arts.length)];
}
