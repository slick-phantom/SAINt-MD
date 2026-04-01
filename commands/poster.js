import logger from "../utils/logger.js";

export default {
    name: "poster",
    description: "Generate categorized poster info messages (Design, Message, Mood, Status)",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Unknown Poster";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🖼️ *POSTER COMMAND*\n\nUsage:\n• poster [theme]\n• Reply to any message with: poster\n\nExamples:\n• poster movie night\n• poster concert\n• poster motivational quote`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized poster info
            const results = await generatePoster(theme);

            const response = `
${getPosterArt()}
🖼️ *POSTER REPORT*
${getPosterArt()}

📝 *Theme:* ${theme}

💡 *Design:*  
${results.design}

💡 *Message:*  
${results.message}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getPosterArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing poster command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating poster message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized poster generator
async function generatePoster(theme) {
    try {
        const design = `🎨 "${theme}" poster features bold visuals.`;
        const message = `💬 "${theme}" poster conveys a clear message.`;
        const mood = `✨ "${theme}" poster sets an inspiring tone.`;
        const status = `📊 "${theme}" poster is impactful and eye-catching.`;

        return { design, message, mood, status };
    } catch (error) {
        logger.error("Error generating poster info:", error);
        return { design: "Unable to generate.", message: "Unable to generate.", mood: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for poster messages
function getPosterArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🖼️─────────────────🖼️",
        "⊱──────── 💡 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
