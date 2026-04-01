import logger from "../utils/logger.js";

export default {
    name: "roastai",
    description: "Generate categorized AI roasts (Savage, Playful, Light Tease)",
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
                        text: `🔥 *ROASTAI COMMAND*\n\nUsage:\n• roastai [word/theme]\n• Reply to any message with: roastai\n\nExamples:\n• roastai Coffee\n• roastai Cats\n• roastai Coding`,
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
                        text: "❌ No theme provided. Please type a word/theme or reply to a message with: roastai",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized roasts
            const results = await generateRoasts(theme);

            const response = `
${getRoastArt()}
🔥 *AI ROAST*
${getRoastArt()}

📝 *Theme:* ${theme}

💡 *Savage:*  
${results.savage}

💡 *Playful:*  
${results.playful}

💡 *Light Tease:*  
${results.tease}

${getRoastArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing roastai command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating roast. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized roast generator
async function generateRoasts(theme) {
    try {
        const savage = `${theme}? Even Windows Vista had more fans.`;
        const playful = `${theme} is like a puppy — cute, but still chewing on the furniture.`;
        const tease = `${theme} tries, but it’s the participation trophy of life.`;

        return { savage, playful, tease };
    } catch (error) {
        logger.error("Error generating roasts:", error);
        return { savage: "Unable to generate.", playful: "Unable to generate.", tease: "Unable to generate." };
    }
}

// Decorative art for roastai messages
function getRoastArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔥─────────────────🔥",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎭 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
