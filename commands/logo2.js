import logger from "../utils/logger.js";

export default {
    name: "logo",
    description: "Generate categorized logo info messages (Style, Symbolism, Mood, Status)",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const text = args.join(" ") || quotedText || "Unknown Logo";

            if (!text) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🖼️ *LOGO COMMAND*\n\nUsage:\n• logo [word/brand]\n• Reply to any message with: logo\n\nExamples:\n• logo Destiny\n• logo SAINt-MD\n• logo Power`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized logo info
            const results = await generateLogo(text);

            const response = `
${getLogoArt()}
🖼️ *LOGO REPORT*
${getLogoArt()}

📝 *Text:* ${text}

💡 *Style:*  
${results.style}

💡 *Symbolism:*  
${results.symbolism}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getLogoArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing logo command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating logo message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized logo generator
async function generateLogo(text) {
    try {
        const style = `🎨 "${text}" is styled with bold design.`;
        const symbolism = `🔮 "${text}" carries symbolic meaning in its form.`;
        const mood = `✨ "${text}" conveys a strong emotional tone.`;
        const status = `📊 "${text}" stands out as a recognizable logo.`;

        return { style, symbolism, mood, status };
    } catch (error) {
        logger.error("Error generating logo info:", error);
        return { style: "Unable to generate.", symbolism: "Unable to generate.", mood: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for logo messages
function getLogoArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🖼️─────────────────🖼️",
        "⊱──────── 💡 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
