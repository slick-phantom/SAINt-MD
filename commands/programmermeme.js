import logger from "../utils/logger.js";

export default {
    name: "programmermeme",
    description: "Generate categorized programmer meme info messages (Setup, Punchline, Mood, Status)",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Unknown Meme";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `💻 *PROGRAMMER MEME COMMAND*\n\nUsage:\n• programmermeme [theme]\n• Reply to any message with: programmermeme\n\nExamples:\n• programmermeme debugging\n• programmermeme coffee\n• programmermeme infinite loop`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized programmer meme info
            const results = await generateProgrammerMeme(theme);

            const response = `
${getProgrammerMemeArt()}
💻 *PROGRAMMER MEME REPORT*
${getProgrammerMemeArt()}

📝 *Theme:* ${theme}

💡 *Setup:*  
${results.setup}

💡 *Punchline:*  
${results.punchline}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getProgrammerMemeArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing programmermeme command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating programmer meme message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized programmer meme generator
async function generateProgrammerMeme(theme) {
    try {
        const setup = `🖥️ "${theme}" starts with a classic coding scenario.`;
        const punchline = `😂 "${theme}" ends with a funny programmer twist.`;
        const mood = `✨ "${theme}" meme captures developer humor.`;
        const status = `📊 "${theme}" meme is relatable in coding culture.`;

        return { setup, punchline, mood, status };
    } catch (error) {
        logger.error("Error generating programmer meme info:", error);
        return { setup: "Unable to generate.", punchline: "Unable to generate.", mood: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for programmer meme messages
function getProgrammerMemeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "💻─────────────────💻",
        "⊱──────── 😂 ────────⊰",
        "»»────── ☕ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
