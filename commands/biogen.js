import logger from "../utils/logger.js";

export default {
    name: "biogen",
    description: "Generate a short bio or introduction",
    category: "tools",

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
                        text: `📝 *BIOGEN COMMAND*\n\nUsage:\n• biogen [details]\n• Reply to any message with: biogen\n\nExamples:\n• biogen Software engineer passionate about AI\n• biogen Student of economics, loves football\n• biogen Entrepreneur building sustainable businesses`,
                    },
                    { quoted: message }
                );
                return;
            }

            const inputDetails = args.join(" ") || quotedText;

            if (!inputDetails) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No details provided. Please add some information about yourself or reply to a message with: biogen",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate bio
            const result = await generateBio(inputDetails);

            const response = `
${getBioArt()}
📝 *BIOGEN RESULT*
${getBioArt()}

👤 *Generated Bio:*
${result}

${getBioArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing biogen command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating bio. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Simple bio generator
async function generateBio(details) {
    try {
        // Basic template — can be expanded with AI integration
        return `I am ${details}. I strive to grow, connect, and make a positive impact wherever I go.`;
    } catch (error) {
        logger.error("Error generating bio:", error);
        return "Unable to generate bio.";
    }
}

// Decorative art for bio messages
function getBioArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👤─────────────────👤",
        "⊱──────── 📝 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
