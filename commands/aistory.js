import axios from "axios";
import logger from "../utils/logger.js";

export default {
    name: "aistory",
    description: "Generate a creative AI short story on any topic or prompt",
    category: "creative",

    async execute(message, client, args) {
        try {
            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "📖 *AI STORY GENERATOR*\n\nUsage: aistory [topic or prompt]\n\nExamples:\n• aistory a boy who discovers magic\n• aistory horror: alone in the dark\n• aistory romance: love in Lagos\n• aistory funny: my goat ate my homework\n• aistory thriller: the missing key",
                    },
                    { quoted: message }
                );
                return;
            }

            const prompt = args.join(" ");

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate story using OpenAI
            const story = await generateStory(prompt);

            if (!story) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ Could not generate a story for: " + prompt + "\n\nTry a different prompt or topic.",
                    },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getStoryArt()}
📖 *${story.title.toUpperCase()}*
🎭 *Genre:* ${story.genre}
${getStoryArt()}

${story.text}

${getStoryArt()}
✍️ *THE END*
${getStoryArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing aistory command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating story. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Generate story using OpenAI API
async function generateStory(prompt) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            logger.error("OPENAI_API_KEY is not set in environment variables");
            return null;
        }

        // Detect genre from prompt keywords
        const lowerPrompt = prompt.toLowerCase();
        let genre = "Adventure";
        let genreInstruction = "an engaging adventure short story";

        if (lowerPrompt.startsWith("horror:") || lowerPrompt.includes("horror") || lowerPrompt.includes("scary") || lowerPrompt.includes("ghost")) {
            genre = "Horror";
            genreInstruction = "a spine-chilling horror short story with a scary twist ending";
        } else if (lowerPrompt.startsWith("romance:") || lowerPrompt.includes("romance") || lowerPrompt.includes("love") || lowerPrompt.includes("crush")) {
            genre = "Romance";
            genreInstruction = "a heartwarming romantic short story";
        } else if (lowerPrompt.startsWith("funny:") || lowerPrompt.includes("funny") || lowerPrompt.includes("comedy") || lowerPrompt.includes("hilarious")) {
            genre = "Comedy";
            genreInstruction = "a funny and humorous short story that will make people laugh";
        } else if (lowerPrompt.startsWith("thriller:") || lowerPrompt.includes("thriller") || lowerPrompt.includes("mystery") || lowerPrompt.includes("detective")) {
            genre = "Thriller";
            genreInstruction = "a gripping thriller short story with suspense and an unexpected twist";
        } else if (lowerPrompt.includes("fantasy") || lowerPrompt.includes("magic") || lowerPrompt.includes("wizard") || lowerPrompt.includes("dragon")) {
            genre = "Fantasy";
            genreInstruction = "a vivid fantasy short story with magical elements";
        } else if (lowerPrompt.includes("scifi") || lowerPrompt.includes("sci-fi") || lowerPrompt.includes("space") || lowerPrompt.includes("robot") || lowerPrompt.includes("future")) {
            genre = "Sci-Fi";
            genreInstruction = "an imaginative sci-fi short story set in the future";
        } else if (lowerPrompt.includes("moral") || lowerPrompt.includes("lesson") || lowerPrompt.includes("fable") || lowerPrompt.includes("children")) {
            genre = "Fable";
            genreInstruction = "a short moral fable story with a clear life lesson at the end";
        }

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are a creative storyteller. When given a prompt, respond ONLY with a JSON object in this exact format, no extra text:
{
  "title": "Story Title Here",
  "genre": "${genre}",
  "text": "Full story text here with paragraphs separated by \\n\\n"
}
Rules:
- Keep the story between 150-300 words
- Make it engaging with a clear beginning, middle, and end
- Use vivid descriptions and dialogue where appropriate
- Match the tone to the genre
- No inappropriate or adult content`,
                    },
                    {
                        role: "user",
                        content: `Write ${genreInstruction} about: ${prompt}`,
                    },
                ],
                max_tokens: 700,
                temperature: 0.85,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                timeout: 20000,
            }
        );

        const content = response.data.choices?.[0]?.message?.content?.trim();
        if (!content) return null;

        // Safely parse JSON response
        const clean = content.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        if (!parsed.title || !parsed.text) return null;

        return {
            title: parsed.title,
            genre: parsed.genre || genre,
            text: parsed.text,
        };

    } catch (error) {
        logger.error("Error calling OpenAI API for story:", error);
        return null;
    }
}

// Decorative art for story messages
function getStoryArt() {
    const arts = [
        "📜·─────────────────·📜",
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌙────────────────🌙",
        "⊱──────── ✨ ────────⊰",
        "»»────── 📖 ──────««",
    ];

    return arts[Math.floor(Math.random() * arts.length)];
}
