import logger from "../utils/logger.js";

export default {
    name: "itunes",
    description: "Generate categorized iTunes-style messages (New Release, Playlist, Album)",
    category: "entertainment",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const subject = args.join(" ") || quotedText || "New Track";

            if (!subject) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🎵 *ITUNES COMMAND*\n\nUsage:\n• itunes [song/album/playlist]\n• Reply to any message with: itunes\n\nExamples:\n• itunes Summer Vibes\n• itunes Chill Beats\n• itunes Party Mix`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized iTunes messages
            const results = await generateItunes(subject);

            const response = `
${getItunesArt()}
🎵 *ITUNES DROP*
${getItunesArt()}

📝 *Subject:* ${subject}

💡 *New Release:*  
${results.newRelease}

💡 *Playlist:*  
${results.playlist}

💡 *Album:*  
${results.album}

${getItunesArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing itunes command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating iTunes message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized iTunes message generator
async function generateItunes(subject) {
    try {
        const newRelease = `🎶 ${subject} just dropped — fresh vibes, stream it now.`;
        const playlist = `🔥 ${subject} added to the ultimate playlist — perfect for any mood.`;
        const album = `📀 ${subject} album release — a full journey through sound and emotion.`;

        return { newRelease, playlist, album };
    } catch (error) {
        logger.error("Error generating iTunes message:", error);
        return { newRelease: "Unable to generate.", playlist: "Unable to generate.", album: "Unable to generate." };
    }
}

// Decorative art for iTunes messages
function getItunesArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎵─────────────────🎵",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎶 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
