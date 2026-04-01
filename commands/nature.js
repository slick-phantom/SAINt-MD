import logger from "../utils/logger.js";

export default {
    name: "nature",
    description: "Generate categorized nature info messages (Visual, Elements, Mood, Status)",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Unknown Nature";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌿 *NATURE COMMAND*\n\nUsage:\n• nature [theme]\n• Reply to any message with: nature\n\nExamples:\n• nature rainforest\n• nature ocean waves\n• nature desert dunes`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized nature info
            const results = await generateNature(theme);

            const response = `
${getNatureArt()}
🌿 *NATURE REPORT*
${getNatureArt()}

📝 *Theme:* ${theme}

💡 *Visual:*  
${results.visual}

💡 *Elements:*  
${results.elements}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getNatureArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing nature command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating nature message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized nature generator
async function generateNature(theme) {
    try {
        const visual = `🎨 "${theme}" appears as a stunning natural scene.`;
        const elements = `🌍 "${theme}" is shaped by earth’s elements.`;
        const mood = `✨ "${theme}" conveys harmony and wonder.`;
        const status = `📊 "${theme}" is admired for its beauty worldwide.`;

        return { visual, elements, mood, status };
    } catch (error) {
        logger.error("Error generating nature info:", error);
        return { visual: "Unable to generate.", elements: "Unable to generate.", mood: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for nature messages
function getNatureArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌿─────────────────🌿",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌍 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
