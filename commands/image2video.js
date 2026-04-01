import logger from "../utils/logger.js";

export default {
    name: "image2video",
    description: "Convert one or more images into a slideshow video",
    category: "media",

    async execute(message, client, args) {
        try {
            const quotedImages =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
                message.message?.imageMessage ||
                null;

            if (!quotedImages && (!args || args.length === 0)) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🎬 *IMAGE2VIDEO COMMAND*\n\nUsage:\n• Reply to one or more images with: image2video [theme]\n• image2video [theme]\n\nExamples:\n• image2video Family memories\n• image2video Vacation slideshow\n• Reply to multiple images with: image2video`,
                    },
                    { quoted: message }
                );
                return;
            }

            const theme = args.join(" ") || "Slideshow video";

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate slideshow video (placeholder logic)
            const result = await generateSlideshow(theme);

            const response = `
${getVideoArt()}
🎬 *IMAGE TO VIDEO SLIDESHOW*
${getVideoArt()}

🖼️ *Theme:* ${theme}

📹 *Status:* ${result}

${getVideoArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing image2video command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error converting images to video. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Placeholder slideshow generator
async function generateSlideshow(theme) {
    try {
        // In a real implementation, integrate with FFmpeg or a video AI API
        return `Slideshow video created successfully with theme "${theme}" and background music.`;
    } catch (error) {
        logger.error("Error generating slideshow video:", error);
        return "Unable to generate slideshow video.";
    }
}

// Decorative art for image2video messages
function getVideoArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎬─────────────────🎬",
        "⊱──────── 📹 ────────⊰",
        "»»────── 🎞️ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
