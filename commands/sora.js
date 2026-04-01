import logger from "../utils/logger.js";

export default {
    name: "sora",
    description: "Generate cinematic scene ideas based on a theme",
    category: "creative",

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
                        text: `🎥 *SORA COMMAND*\n\nUsage:\n• sora [theme]\n• Reply to any message with: sora\n\nExamples:\n• sora Futuristic City\n• sora Ocean Adventure\n• sora Space Battle`,
                    },
                    { quoted: message }
                );
                return;
            }

            const theme = args.join(" ") || quotedText;

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No theme provided. Please type a theme or reply to a message with: sora",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate cinematic scenes
            const results = await generateSoraScenes(theme);

            const response = `
${getSoraArt()}
🎥 *SORA CINEMATIC SCENES*
${getSoraArt()}

📝 *Theme:* ${theme}

💡 *Opening Scene:*  
${results.opening}

💡 *Climax Scene:*  
${results.climax}

💡 *Closing Scene:*  
${results.closing}

${getSoraArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing sora command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating cinematic scenes. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Cinematic scene generator
async function generateSoraScenes(theme) {
    try {
        const opening = `Scene opens with ${theme} bathed in golden light, setting the tone with breathtaking visuals.`;
        const climax = `The tension peaks as ${theme} erupts into chaos — every frame charged with emotion.`;
        const closing = `Final shot: ${theme} fades into silence, leaving a lasting impression of wonder.`;

        return { opening, climax, closing };
    } catch (error) {
        logger.error("Error generating Sora scenes:", error);
        return { opening: "Unable to generate.", climax: "Unable to generate.", closing: "Unable to generate." };
    }
}

// Decorative art for sora messages
function getSoraArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎥─────────────────🎥",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌌 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
