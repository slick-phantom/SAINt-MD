import logger from "../utils/logger.js";

export default {
    name: "movie",
    description: "Generate categorized movie info messages (Overview, Genre, Cast, Release)",
    category: "entertainment",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const movieTitle = args.join(" ") || quotedText || "Unknown Movie";

            if (!movieTitle) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🎬 *MOVIE COMMAND*\n\nUsage:\n• movie [title]\n• Reply to any message with: movie\n\nExamples:\n• movie Inception\n• movie Titanic\n• movie The Matrix`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized movie info
            const results = await generateMovie(movieTitle);

            const response = `
${getMovieArt()}
🎬 *MOVIE DATA*
${getMovieArt()}

📝 *Title:* ${movieTitle}

💡 *Overview:*  
${results.overview}

💡 *Genre:*  
${results.genre}

💡 *Cast:*  
${results.cast}

💡 *Release:*  
${results.release}

${getMovieArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing movie command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating movie message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized movie info generator
async function generateMovie(title) {
    try {
        const overview = `📖 ${title} is a cinematic experience with a unique storyline.`;
        const genre = `🎭 ${title} belongs to a popular film genre.`;
        const cast = `🌟 ${title} features a notable cast of actors.`;
        const release = `📅 ${title} was released in theaters to global audiences.`;

        return { overview, genre, cast, release };
    } catch (error) {
        logger.error("Error generating movie info:", error);
        return { overview: "Unable to generate.", genre: "Unable to generate.", cast: "Unable to generate.", release: "Unable to generate." };
    }
}

// Decorative art for movie messages
function getMovieArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎬─────────────────🎬",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
