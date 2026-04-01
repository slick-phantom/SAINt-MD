import logger from "../utils/logger.js";

export default {
    name: "imagine",
    description: "Generate categorized imagination info messages (Visual, Mood, Theme, Status)",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const concept = args.join(" ") || quotedText || "Unknown Concept";

            if (!concept) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌌 *IMAGINE COMMAND*\n\nUsage:\n• imagine [concept/idea]\n• Reply to any message with: imagine\n\nExamples:\n• imagine future city\n• imagine flying cars\n• imagine magical forest`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized imagination info
            const results = await generateImagine(concept);

            const response = `
${getImagineArt()}
🌌 *IMAGINATION REPORT*
${getImagineArt()}

📝 *Concept:* ${concept}

💡 *Visual:*  
${results.visual}

💡 *Mood:*  
${results.mood}

💡 *Theme:*  
${results.theme}

💡 *Status:*  
${results.status}

${getImagineArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing imagine command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating imagine message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized imagination generator
async function generateImagine(concept) {
    try {
        const visual = `🎨 "${concept}" appears as a vivid mental picture.`;
        const mood = `✨ "${concept}" carries a unique emotional tone.`;
        const theme = `🌌 "${concept}" reflects a creative theme.`;
        const status = `📊 "${concept}" inspires imagination and wonder.`;

        return { visual, mood, theme, status };
    } catch (error) {
        logger.error("Error generating imagine info:", error);
        return { visual: "Unable to generate.", mood: "Unable to generate.", theme: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for imagine messages
function getImagineArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌌─────────────────🌌",
        "⊱──────── 💡 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
