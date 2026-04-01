import axios from "axios";
import logger from "../utils/logger.js";

export default {
    name: "poem",
    description: "Generate a beautiful AI-written poem on any topic",
    category: "creative",

    async execute(message, client, args) {
        try {
            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "🎭 *POEM GENERATOR*\n\nUsage: poem [topic or prompt]\n\nExamples:\n• poem love and heartbreak\n• poem the ocean at night\n• poem Nigeria my home\n• poem friendship haiku\n• poem motivational rhyme",
                    },
                    { quoted: message }
                );
                return;
            }

            const topic = args.join(" ");

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate poem using OpenAI
            const poem = await generatePoem(topic);

            if (!poem) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ Could not generate a poem for: " + topic + "\n\nTry a different topic or rephrase your prompt.",
                    },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getPoemArt()}

🎭 *POEM: ${topic.toUpperCase()}*

${poem.text}

✍️ *Style:* ${poem.style}
${getPoemArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing poem command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating poem. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Generate poem using OpenAI API
async function generatePoem(topic) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            logger.error("OPENAI_API_KEY is not set in environment variables");
            return null;
        }

        // Detect if user requested a specific style
        const lowerTopic = topic.toLowerCase();
        let style = "Free Verse";
        let styleInstruction = "a beautiful free verse poem";

        if (lowerTopic.includes("haiku")) {
            style = "Haiku";
            styleInstruction = "a haiku (5-7-5 syllable structure, three lines only)";
        } else if (lowerTopic.includes("sonnet")) {
            style = "Sonnet";
            styleInstruction = "a Shakespearean sonnet (14 lines, ABAB CDCD EFEF GG rhyme scheme)";
        } else if (lowerTopic.includes("rhyme") || lowerTopic.includes("rhyming")) {
            style = "Rhyming";
            styleInstruction = "a fun rhyming poem with an AABB or ABAB rhyme scheme";
        } else if (lowerTopic.includes("motivational") || lowerTopic.includes("inspire")) {
            style = "Motivational";
            styleInstruction = "a short, punchy motivational poem with vivid imagery";
        } else if (lowerTopic.includes("acrostic")) {
            style = "Acrostic";
            styleInstruction = "an acrostic poem where the first letter of each line spells out the main subject";
        }

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a gifted poet. Write only the poem — no titles, no introductions, no explanations, no quotation marks. Just the poem text itself.",
                    },
                    {
                        role: "user",
                        content: `Write ${styleInstruction} about: ${topic}. Keep it under 20 lines and suitable for WhatsApp.`,
                    },
                ],
                max_tokens: 400,
                temperature: 0.9,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                timeout: 20000,
            }
        );

        const poemText = response.data.choices?.[0]?.message?.content?.trim();

        if (!poemText) return null;

        return {
            text: poemText,
            style: style,
        };

    } catch (error) {
        logger.error("Error calling OpenAI API for poem:", error);
        return null;
    }
}

// Decorative art for poem messages
function getPoemArt() {
    const arts = [
        "🌸✦·····················✦🌸",
        "❦━━━━━━━━━━━━━━━━❦",
        "✿°.·*·.°✿°.·*·.°✿°.·*·.°✿",
        "♡⋆｡˚ ⋆꩜.ꪆ₊ ⊹₊꩜ ˚｡⋆♡",
        "⊱────── ✧ ──────⊰",
    ];

    return arts[Math.floor(Math.random() * arts.length)];
}
