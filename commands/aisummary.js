import axios from "axios";
import logger from "../utils/logger.js";

export default {
    name: "aisummary",
    description: "Summarize any text, topic, article, or long content using AI",
    category: "education",

    async execute(message, client, args) {
        try {
            // Check if replying to a message (summarize quoted text)
            const quotedText = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation
                || message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text
                || null;

            if (!args || args.length === 0) {
                if (!quotedText) {
                    await client.sendMessage(
                        message.key.remoteJid,
                        {
                            text: "📝 *AI SUMMARY*\n\nUsage:\n• aisummary [text or topic]\n• Reply to any message with: aisummary\n\nExamples:\n• aisummary the French Revolution\n• aisummary [paste a long article]\n• aisummary short: World War 2\n• aisummary bullet: benefits of exercise\n• aisummary eli5: how does the internet work",
                        },
                        { quoted: message }
                    );
                    return;
                }
            }

            // Use quoted text if no args provided
            const input = quotedText && (!args || args.length === 0)
                ? quotedText
                : args.join(" ");

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate summary using OpenAI
            const summary = await generateSummary(input);

            if (!summary) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ Could not summarize: " + input.substring(0, 60) + "...\n\nTry rephrasing or providing more context.",
                    },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getSummaryArt()}
📝 *AI SUMMARY*
🎯 *Mode:* ${summary.mode}
${getSummaryArt()}

${summary.text}

${summary.keyPoints ? `🔑 *KEY POINTS:*\n${summary.keyPoints}\n` : ""}
${summary.verdict ? `⚡ *IN ONE LINE:*\n${summary.verdict}\n` : ""}
${getSummaryArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing aisummary command:", error);

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

// Generate summary using OpenAI API
async function generateSummary(input) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            logger.error("OPENAI_API_KEY is not set in environment variables");
            return null;
        }

        // Detect summary mode from input keywords
        const lowerInput = input.toLowerCase();
        let mode = "Standard";
        let modeInstruction = "a clear and concise summary";

        if (lowerInput.startsWith("short:") || lowerInput.includes("short summary") || lowerInput.includes("brief")) {
            mode = "Short";
            modeInstruction = "a very short 2-3 sentence summary";
        } else if (lowerInput.startsWith("bullet:") || lowerInput.includes("bullet points") || lowerInput.includes("bullets")) {
            mode = "Bullet Points";
            modeInstruction = "a bullet point summary with 5-7 key points";
        } else if (lowerInput.startsWith("eli5:") || lowerInput.includes("eli5") || lowerInput.includes("simple") || lowerInput.includes("explain like")) {
            mode = "ELI5 (Simple)";
            modeInstruction = "a simple explanation as if talking to a 10-year-old, using everyday language and analogies";
        } else if (lowerInput.startsWith("detailed:") || lowerInput.includes("detailed") || lowerInput.includes("in depth")) {
            mode = "Detailed";
            modeInstruction = "a detailed and comprehensive summary covering all major points";
        } else if (lowerInput.startsWith("academic:") || lowerInput.includes("academic") || lowerInput.includes("scholarly")) {
            mode = "Academic";
            modeInstruction = "an academic-style summary with formal tone covering main arguments and conclusions";
        }

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert at summarizing content clearly and accurately. 
Respond ONLY with a JSON object in this exact format, no extra text:
{
  "mode": "${mode}",
  "text": "The main summary text here",
  "keyPoints": "• Point 1\\n• Point 2\\n• Point 3",
  "verdict": "One single sentence that captures the entire thing"
}
Rules:
- Keep the main summary text between 80-250 words depending on mode
- keyPoints should have 3-5 bullet points (use • symbol)
- verdict must be one sentence only
- Be accurate, neutral, and informative
- If given a topic rather than text, summarize based on your knowledge`,
                    },
                    {
                        role: "user",
                        content: `Write ${modeInstruction} for the following:\n\n${input}`,
                    },
                ],
                max_tokens: 700,
                temperature: 0.5,
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

        if (!parsed.text) return null;

        return {
            mode: parsed.mode || mode,
            text: parsed.text,
            keyPoints: parsed.keyPoints || "",
            verdict: parsed.verdict || "",
        };

    } catch (error) {
        logger.error("Error calling OpenAI API for summary:", error);
        return null;
    }
}

// Decorative art for summary messages
function getSummaryArt() {
    const arts = [
        "📋·─────────────────·📋",
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔖────────────────🔖",
        "⊱──────── 📝 ────────⊰",
        "»»────── 🧠 ──────««",
    ];

    return arts[Math.floor(Math.random() * arts.length)];
}
