import logger from "../utils/logger.js";

export default {
    name: "limerick",
    description: "Generate a fun limerick poem based on a theme",
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
                        text: `🎭 *LIMERICK COMMAND*\n\nUsage:\n• limerick [theme]\n• Reply to any message with: limerick\n\nExamples:\n• limerick Adventure\n• limerick Love\n• limerick Technology`,
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
                        text: "❌ No theme provided. Please add a subject or reply to a message with: limerick",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate limerick
            const result = await generateLimerick(theme);

            const response = `
${getLimerickArt()}
🎭 *LIMERICK POEM*
${getLimerickArt()}

📝 *Theme:* ${theme}

${result}

${getLimerickArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing limerick command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating limerick. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Simple limerick generator
async function generateLimerick(theme) {
    try {
        const limericks = [
            `There once was a tale of ${theme},\nThat sparkled with laughter and gleam,\nIt danced through the night,\nWith joy shining bright,\nA story that felt like a dream.`,
            `A curious soul loved ${theme},\nExploring each path and each stream,\nWith courage so bold,\nTheir journey unfolds,\nA life full of wonder supreme.`,
            `In the land where ${theme} grew,\nThe skies were a radiant blue,\nWith friends by their side,\nThey traveled with pride,\nAnd found every moment was new.`,
            `A limerick about ${theme} today,\nBrings smiles in a whimsical way,\nIt rhymes with delight,\nAnd keeps spirits light,\nChasing all worries away.`
        ];
        return limericks[Math.floor(Math.random() * limericks.length)];
    } catch (error) {
        logger.error("Error generating limerick:", error);
        return "Unable to generate limerick.";
    }
}

// Decorative art for limerick messages
function getLimerickArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎭─────────────────🎭",
        "⊱──────── ✒️ ────────⊰",
        "»»────── 📜 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
