import logger from "../utils/logger.js";

export default {
    name: "landscape",
    description: "Generate categorized landscape info messages (Visual, Nature, Mood, Status)",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Unknown Landscape";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🏞️ *LANDSCAPE COMMAND*\n\nUsage:\n• landscape [theme]\n• Reply to any message with: landscape\n\nExamples:\n• landscape desert\n• landscape mountain valley\n• landscape tropical beach`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized landscape info
            const results = await generateLandscape(theme);

            const response = `
${getLandscapeArt()}
🏞️ *LANDSCAPE REPORT*
${getLandscapeArt()}

📝 *Theme:* ${theme}

💡 *Visual:*  
${results.visual}

💡 *Nature:*  
${results.nature}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getLandscapeArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing landscape command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating landscape message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized landscape generator
async function generateLandscape(theme) {
    try {
        const visual = `🎨 "${theme}" appears as a breathtaking view.`;
        const nature = `🌿 "${theme}" is shaped by natural elements.`;
        const mood = `✨ "${theme}" conveys peace and wonder.`;
        const status = `📊 "${theme}" is admired worldwide.`;

        return { visual, nature, mood, status };
    } catch (error) {
        logger.error("Error generating landscape info:", error);
        return { visual: "Unable to generate.", nature: "Unable to generate.", mood: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for landscape messages
function getLandscapeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🏞️─────────────────🏞️",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌿 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
