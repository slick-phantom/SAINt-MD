import logger from "../utils/logger.js";

export default {
    name: "essay",
    description: "Generate a structured essay on a given topic",
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
                        text: `📖 *ESSAY COMMAND*\n\nUsage:\n• essay [topic]\n• Reply to any message with: essay\n\nExamples:\n• essay The importance of education\n• essay Climate change and its impact\n• essay Technology in modern society`,
                    },
                    { quoted: message }
                );
                return;
            }

            const topic = args.join(" ") || quotedText;

            if (!topic) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No topic provided. Please add a subject or reply to a message with: essay",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate essay content
            const result = await generateEssay(topic);

            const response = `
${getEssayArt()}
📖 *ESSAY*
${getEssayArt()}

📝 *Topic:* ${topic}

${result}

${getEssayArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing essay command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating essay. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Simple essay generator
async function generateEssay(topic) {
    try {
        return `**Introduction**  
${topic} is a subject of great importance in today’s world. It influences individuals, communities, and societies in profound ways.

**Body**  
The relevance of ${topic} can be seen in everyday life. It shapes decisions, drives innovation, and impacts global progress. By understanding its challenges and opportunities, people can adapt and thrive. Furthermore, ${topic} connects with broader issues such as culture, economy, and sustainability.

**Conclusion**  
In conclusion, ${topic} remains a vital area of discussion. By embracing its lessons and applying them thoughtfully, we can build a better future for generations to come.`;
    } catch (error) {
        logger.error("Error generating essay:", error);
        return "Unable to generate essay.";
    }
}

// Decorative art for essay messages
function getEssayArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📖─────────────────📖",
        "⊱──────── 📝 ────────⊰",
        "»»────── ✍️ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
