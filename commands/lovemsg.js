import logger from "../utils/logger.js";

export default {
    name: "lovemsg",
    description: "Generate categorized love messages (Romantic, Cute, Deep)",
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
                        text: `❤️ *LOVEMSG COMMAND*\n\nUsage:\n• lovemsg [theme]\n• Reply to any message with: lovemsg\n\nExamples:\n• lovemsg Forever love\n• lovemsg Long distance\n• lovemsg Secret crush`,
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
                        text: "❌ No theme provided. Please add a subject or reply to a message with: lovemsg",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized love messages
            const results = await generateLoveMessages(theme);

            const response = `
${getLoveArt()}
❤️ *LOVE MESSAGES*
${getLoveArt()}

📝 *Theme:* ${theme}

💌 *Romantic:*  
${results.romantic}

💌 *Cute:*  
${results.cute}

💌 *Deep:*  
${results.deep}

${getLoveArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing lovemsg command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating love messages. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized love message generator
async function generateLoveMessages(theme) {
    try {
        const romantic = `Every heartbeat whispers your name, and with ${theme}, my world feels complete.`;
        const cute = `You’re my favorite notification, ${theme} makes me smile every time.`;
        const deep = `Love isn’t just a feeling — it’s a choice, and I’ll choose ${theme} for the rest of my life.`;

        return { romantic, cute, deep };
    } catch (error) {
        logger.error("Error generating love messages:", error);
        return { romantic: "Unable to generate.", cute: "Unable to generate.", deep: "Unable to generate." };
    }
}

// Decorative art for lovemsg messages
function getLoveArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "❤️─────────────────❤️",
        "⊱──────── 💌 ────────⊰",
        "»»────── 🌹 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
