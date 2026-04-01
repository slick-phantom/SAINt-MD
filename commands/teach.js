import logger from "../utils/logger.js";

export default {
    name: "teach",
    description: "Generate categorized teaching explanations (Simple, Analogy, Step-by-Step)",
    category: "educational",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const topic = args.join(" ") || quotedText;

            if (!topic) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📚 *TEACH COMMAND*\n\nUsage:\n• teach [topic]\n• Reply to any message with: teach\n\nExamples:\n• teach Photosynthesis\n• teach Gravity\n• teach Blockchain`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized teaching explanations
            const results = await generateTeachings(topic);

            const response = `
${getTeachArt()}
📚 *TEACH MODE*
${getTeachArt()}

📝 *Topic:* ${topic}

💡 *Simple:*  
${results.simple}

💡 *Analogy:*  
${results.analogy}

💡 *Step-by-Step:*  
${results.steps}

${getTeachArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing teach command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating teaching explanation. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized teaching generator
async function generateTeachings(topic) {
    try {
        const simple = `${topic} is a basic concept that explains how something works in everyday life.`;
        const analogy = `Think of ${topic} like a bridge: it connects what you already know to something new.`;
        const steps = `To understand ${topic}, follow these steps:\n1. Identify the main idea.\n2. Break it into smaller parts.\n3. Apply it to real-life situations.`;

        return { simple, analogy, steps };
    } catch (error) {
        logger.error("Error generating teachings:", error);
        return { simple: "Unable to generate.", analogy: "Unable to generate.", steps: "Unable to generate." };
    }
}

// Decorative art for teach messages
function getTeachArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📚─────────────────📚",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎓 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
