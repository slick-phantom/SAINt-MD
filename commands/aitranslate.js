import axios from "axios";
import logger from "../utils/logger.js";

export default {
    name: "aitranslate",
    description: "Translate any text into any language using AI",
    category: "tools",

    async execute(message, client, args) {
        try {
            // Check if replying to a message (translate quoted text)
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌍 *AI TRANSLATOR*\n\nUsage:\n• aitranslate [language]: [text]\n• Reply to any message with: aitranslate [language]\n\nExamples:\n• aitranslate french: Good morning everyone\n• aitranslate yoruba: I love you\n• aitranslate spanish: How are you doing today?\n• aitranslate arabic: Welcome to Nigeria\n• aitranslate igbo: My name is John\n\n🌐 *Supported Languages (and more):*\nEnglish, French, Spanish, Arabic, Yoruba, Igbo, Hausa, Swahili, Portuguese, German, Chinese, Japanese, Korean, Russian, Italian, Hindi, Turkish, and 100+ more!`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Parse language and text from args
            // Format: aitranslate [language]: [text]  OR  aitranslate [language] (when replying)
            const fullInput = args.join(" ");
            let targetLanguage = "";
            let textToTranslate = "";

            if (fullInput.includes(":")) {
                const colonIndex = fullInput.indexOf(":");
                targetLanguage = fullInput.substring(0, colonIndex).trim();
                textToTranslate = fullInput.substring(colonIndex + 1).trim();
            } else {
                // No colon — language only, use quoted message text
                targetLanguage = fullInput.trim();
                textToTranslate = quotedText || "";
            }

            if (!targetLanguage) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ Please specify a target language.\n\nExample: aitranslate french: Hello world",
                    },
                    { quoted: message }
                );
                return;
            }

            if (!textToTranslate) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No text to translate.\n\nProvide text after the language:\n• aitranslate spanish: Hello world\n\nOr reply to a message with:\n• aitranslate spanish",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Translate using OpenAI
            const result = await translateText(textToTranslate, targetLanguage);

            if (!result) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `❌ Could not translate to *${targetLanguage}*.\n\nMake sure the language name is correct and try again.`,
                    },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getTranslateArt()}
🌍 *AI TRANSLATOR*
${getTranslateArt()}

🔤 *Original (${result.detectedLanguage}):*
${textToTranslate}

🌐 *Translated (${result.targetLanguage}):*
${result.translation}

${result.pronunciation ? `🗣️ *Pronunciation:*\n${result.pronunciation}\n` : ""}${result.note ? `💡 *Note:*\n${result.note}\n` : ""}
${getTranslateArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing aitranslate command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error translating text. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Translate text using OpenAI API
async function translateText(text, targetLanguage) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            logger.error("OPENAI_API_KEY is not set in environment variables");
            return null;
        }

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert multilingual translator. 
Respond ONLY with a JSON object in this exact format, no extra text:
{
  "detectedLanguage": "Detected language name",
  "targetLanguage": "Full proper name of target language",
  "translation": "The translated text here",
  "pronunciation": "Romanized pronunciation guide if target language uses non-Latin script, otherwise empty string",
  "note": "A short cultural or translation note if relevant, otherwise empty string"
}
Rules:
- Detect the source language automatically
- Translate naturally and accurately, preserving tone and meaning
- For African languages (Yoruba, Igbo, Hausa, Swahili etc.), include tone marks where applicable
- For languages with non-Latin scripts (Arabic, Chinese, Japanese, Korean, Hindi, Russian etc.), include romanized pronunciation
- Keep the note short (1 sentence max) and only include it if genuinely useful
- Never refuse to translate — always attempt it`,
                    },
                    {
                        role: "user",
                        content: `Translate the following text to ${targetLanguage}:\n\n${text}`,
                    },
                ],
                max_tokens: 500,
                temperature: 0.3,
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

        if (!parsed.translation) return null;

        return {
            detectedLanguage: parsed.detectedLanguage || "Unknown",
            targetLanguage: parsed.targetLanguage || targetLanguage,
            translation: parsed.translation,
            pronunciation: parsed.pronunciation || "",
            note: parsed.note || "",
        };

    } catch (error) {
        logger.error("Error calling OpenAI API for translation:", error);
        return null;
    }
}

// Decorative art for translate messages
function getTranslateArt() {
    const arts = [
        "🌍·─────────────────·🌎",
        "✦━━━━━━━━━━━━━━━━━✦",
        "🗺️────────────────🗺️",
        "⊱──────── 🌐 ────────⊰",
        "»»────── 💬 ──────««",
    ];

    return arts[Math.floor(Math.random() * arts.length)];
}
