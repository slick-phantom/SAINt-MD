import logger from "../utils/logger.js";

export default {
    name: "blog",
    description: "Generate a short blog-style post",
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
                        text: `✍️ *BLOG COMMAND*\n\nUsage:\n• blog [topic]\n• Reply to any message with: blog\n\nExamples:\n• blog The future of AI\n• blog Tips for staying productive\n• blog Why small businesses matter`,
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
                        text: "❌ No topic provided. Please add a subject or reply to a message with: blog",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate blog content
            const result = await generateBlog(topic);

            const response = `
${getBlogArt()}
✍️ *BLOG POST*
${getBlogArt()}

📝 *Topic:* ${topic}

${result}

${getBlogArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing blog command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating blog post. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Simple blog generator
async function generateBlog(topic) {
    try {
        return `Today, let’s talk about *${topic}*. It’s a subject that continues to inspire curiosity and spark conversations. By exploring its challenges and opportunities, we can better understand how it shapes our lives and future. Remember, every idea starts small — but with passion and persistence, it can grow into something remarkable.`;
    } catch (error) {
        logger.error("Error generating blog:", error);
        return "Unable to generate blog post.";
    }
}

// Decorative art for blog messages
function getBlogArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📝─────────────────📝",
        "⊱──────── ✍️ ────────⊰",
        "»»────── 📖 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
