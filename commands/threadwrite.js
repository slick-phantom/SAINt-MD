import logger from "../utils/logger.js";

export default {
    name: "threadwrite",
    description: "Generate Twitter/X-style threads based on a topic",
    category: "creative",

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
                        text: `🧵 *THREADWRITE COMMAND*\n\nUsage:\n• threadwrite [topic]\n• Reply to any message with: threadwrite\n\nExamples:\n• threadwrite AI in Education\n• threadwrite Healthy Habits\n• threadwrite Startup Lessons`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate thread
            const results = await generateThread(topic);

            const response = `
${getThreadArt()}
🧵 *THREAD GENERATOR*
${getThreadArt()}

📝 *Topic:* ${topic}

💡 *Thread:*  
${results.join("\n\n")}

${getThreadArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing threadwrite command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating thread. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Thread generator
async function generateThread(topic) {
    try {
        const threads = [
            `1/ Let’s talk about ${topic}. It’s shaping the way we think and act every day.`,
            `2/ The first key idea: ${topic} isn’t just theory — it’s practical and affects real lives.`,
            `3/ One challenge with ${topic} is misunderstanding. Breaking it down makes it easier.`,
            `4/ The future of ${topic} looks promising, but it requires awareness and adaptation.`,
            `5/ Final thought: ${topic} is not just a trend, it’s a movement. Stay curious, stay engaged.`
        ];
        return threads;
    } catch (error) {
        logger.error("Error generating thread:", error);
        return ["Unable to generate thread."];
    }
}

// Decorative art for thread messages
function getThreadArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🧵─────────────────🧵",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
