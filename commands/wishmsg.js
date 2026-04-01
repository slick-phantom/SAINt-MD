import logger from "../utils/logger.js";

export default {
    name: "wishmsg",
    description: "Generate categorized wish messages (Formal, Casual, Heartfelt)",
    category: "social",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const subject = args.join(" ") || quotedText;

            if (!subject) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌸 *WISHMSG COMMAND*\n\nUsage:\n• wishmsg [person/occasion]\n• Reply to any message with: wishmsg\n\nExamples:\n• wishmsg Birthday\n• wishmsg Success\n• wishmsg Friendship`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized wishes
            const results = await generateWish(subject);

            const response = `
${getWishArt()}
🌸 *WISH MESSAGE GENERATOR*
${getWishArt()}

📝 *Subject:* ${subject}

💡 *Formal:*  
${results.formal}

💡 *Casual:*  
${results.casual}

💡 *Heartfelt:*  
${results.heartfelt}

${getWishArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing wishmsg command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating wish message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized wish generator
async function generateWish(subject) {
    try {
        const formal = `Wishing ${subject} continued success, prosperity, and fulfillment in all endeavors.`;
        const casual = `Cheers to ${subject}! Hope your day is full of fun and good vibes.`;
        const heartfelt = `From the bottom of my heart, I wish ${subject} endless happiness, love, and blessings.`;

        return { formal, casual, heartfelt };
    } catch (error) {
        logger.error("Error generating wish message:", error);
        return { formal: "Unable to generate.", casual: "Unable to generate.", heartfelt: "Unable to generate." };
    }
}

// Decorative art for wish messages
function getWishArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌸─────────────────🌸",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
