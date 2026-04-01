import logger from "../utils/logger.js";

export default {
    name: "darkmeme",
    description: "Generate categorized dark meme info messages (Punchline, Tone, Mood, Status)",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Unknown Meme Theme";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🕶️ *DARKMEME COMMAND*\n\nUsage:\n• darkmeme [theme]\n• Reply to any message with: darkmeme\n\nExamples:\n• darkmeme Monday mornings\n• darkmeme exams\n• darkmeme coffee addiction`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized dark meme info
            const results = await generateDarkMeme(theme);

            const response = `
${getDarkMemeArt()}
🕶️ *DARK MEME REPORT*
${getDarkMemeArt()}

📝 *Theme:* ${theme}

💡 *Punchline:*  
${results.punchline}

💡 *Tone:*  
${results.tone}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getDarkMemeArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing darkmeme command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating darkmeme message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized dark meme generator
async function generateDarkMeme(theme) {
    try {
        const punchline = `😂 "${theme}" is the kind of joke that hits too close to home.`;
        const tone = `🕶️ "${theme}" carries a sarcastic, edgy vibe.`;
        const mood = `✨ "${theme}" feels ironic yet relatable.`;
        const status = `📊 "${theme}" is trending in meme culture.`;

        return { punchline, tone, mood, status };
    } catch (error) {
        logger.error("Error generating darkmeme info:", error);
        return { punchline: "Unable to generate.", tone: "Unable to generate.", mood: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for dark meme messages
function getDarkMemeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🕶️─────────────────🕶️",
        "⊱──────── 💡 ────────⊰",
        "»»────── 😂 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
