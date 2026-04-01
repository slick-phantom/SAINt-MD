import axios from "axios";
import logger from "../utils/logger.js";

export default {
    name: "claudeai",
    description: "Ask Claude AI any question or request",
    category: "ai",

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
                        text: `🤖 *CLAUDE AI COMMAND*\n\nUsage:\n• claudeai [prompt]\n• Reply to any message with: claudeai\n\nExamples:\n• claudeai Write a motivational quote\n• claudeai Explain blockchain simply\n• claudeai Summarize this text (reply to a message)`,
                    },
                    { quoted: message }
                );
                return;
            }

            const prompt = args.join(" ") || quotedText;

            if (!prompt) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No prompt provided. Please type a question or reply to a message with: claudeai",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Call Claude AI
            const result = await askClaude(prompt);

            if (!result) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ Could not generate a response. Please try again later.",
                    },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getClaudeArt()}
🤖 *CLAUDE AI RESPONSE*
${getClaudeArt()}

📝 *Prompt:*  
${prompt}

💡 *Answer:*  
${result}

${getClaudeArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing claudeai command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating response. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Function to call Claude AI API
async function askClaude(prompt) {
    try {
        const apiKey = process.env.CLAUDE_API_KEY;

        if (!apiKey) {
            logger.error("CLAUDE_API_KEY is not set in environment variables");
            return null;
        }

        const response = await axios.post(
            "https://api.anthropic.com/v1/messages",
            {
                model: "claude-3-opus-20240229", // You can change to other Claude models
                max_tokens: 500,
                messages: [
                    { role: "user", content: prompt }
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                timeout: 20000,
            }
        );

        return response.data.content?.[0]?.text?.trim() || null;
    } catch (error) {
        logger.error("Error calling Claude AI API:", error);
        return null;
    }
}

// Decorative art for Claude AI messages
function getClaudeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🤖─────────────────🤖",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📝 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
