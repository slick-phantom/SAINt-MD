import logger from "../utils/logger.js";

export default {
    name: "translate",
    description: "Translate text or quoted messages into another language",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            if (!args || args.length < 2) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌐 *TRANSLATE COMMAND*\n\nUsage:\n• translate [target_language] [text]\n• Reply to any message with: translate [target_language]\n\nExamples:\n• translate French Hello, how are you?\n• translate Spanish Good morning\n• translate German Thank you very much`,
                    },
                    { quoted: message }
                );
                return;
            }

            const targetLang = args[0];
            const inputText = args.slice(1).join(" ") || quotedText;

            if (!inputText) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No text provided. Please type text or reply to a message with: translate [language]",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate translation
            const results = await generateTranslation(inputText, targetLang);

            const response = `
${getTranslateArt()}
🌐 *TRANSLATION RESULT*
${getTranslateArt()}

📝 *Original:*  
${inputText}

💡 *Translated (${targetLang}):*  
${results}

${getTranslateArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing translate command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error translating message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Translation generator (placeholder logic)
async function generateTranslation(text, targetLang) {
    try {
        // Placeholder: integrate with translation API (Google Translate, DeepL, etc.)
        return `[${targetLang} translation of]: ${text}`;
    } catch (error) {
        logger.error("Error generating translation:", error);
        return "Unable to generate translation.";
    }
}

// Decorative art for translate messages
function getTranslateArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌐─────────────────🌐",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📖 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
