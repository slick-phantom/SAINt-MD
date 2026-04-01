import logger from "../utils/logger.js";

export default {
    name: "haiku",
    description: "Generate a haiku poem on a given theme",
    category: "fun",

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
                        text: `🌸 *HAIKU COMMAND*\n\nUsage:\n• haiku [theme]\n• Reply to any message with: haiku\n\nExamples:\n• haiku Nature\n• haiku Love\n• haiku Technology`,
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
                        text: "❌ No theme provided. Please add a subject or reply to a message with: haiku",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate haiku
            const result = await generateHaiku(theme);

            const response = `
${getHaikuArt()}
🌸 *HAIKU POEM*
${getHaikuArt()}

📝 *Theme:* ${theme}

${result}

${getHaikuArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing haiku command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating haiku. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Simple haiku generator
async function generateHaiku(theme) {
    try {
        const haikus = [
            `Gentle winds whisper,\n${theme} flows through silent streams,\nPeace in every breath.`,
            `Under moonlit skies,\n${theme} blooms with quiet grace,\nDreams drift into dawn.`,
            `Soft echoes of time,\n${theme} dances in the night air,\nHope begins anew.`,
            `Golden rays of sun,\n${theme} awakens tender hearts,\nLife sings endlessly.`,
            `Silent autumn leaves,\n${theme} rests upon the still earth,\nCalm embraces all.`
        ];
        return haikus[Math.floor(Math.random() * haikus.length)];
    } catch (error) {
        logger.error("Error generating haiku:", error);
        return "Unable to generate haiku.";
    }
}

// Decorative art for haiku messages
function getHaikuArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌸─────────────────🌸",
        "⊱──────── 📝 ────────⊰",
        "»»────── 🍃 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
