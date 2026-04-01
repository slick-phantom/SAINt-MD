import logger from "../utils/logger.js";

export default {
    name: "thankyoumsg",
    description: "Generate categorized thank-you messages (Formal, Casual, Heartfelt)",
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
                        text: `🙏 *THANKYOU COMMAND*\n\nUsage:\n• thankyoumsg [person/occasion]\n• Reply to any message with: thankyoumsg\n\nExamples:\n• thankyoumsg Volunteers\n• thankyoumsg Birthday Wishes\n• thankyoumsg Team Support`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized thank-you messages
            const results = await generateThankYou(subject);

            const response = `
${getThankArt()}
🙏 *THANK-YOU MESSAGE GENERATOR*
${getThankArt()}

📝 *Subject:* ${subject}

💡 *Formal:*  
${results.formal}

💡 *Casual:*  
${results.casual}

💡 *Heartfelt:*  
${results.heartfelt}

${getThankArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing thankyoumsg command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating thank-you message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized thank-you message generator
async function generateThankYou(subject) {
    try {
        const formal = `I sincerely thank ${subject} for their invaluable contribution and dedication.`;
        const casual = `Big thanks to ${subject}! You really came through and made things awesome.`;
        const heartfelt = `From the bottom of my heart, thank you ${subject}. Your kindness and support mean more than words can express.`;

        return { formal, casual, heartfelt };
    } catch (error) {
        logger.error("Error generating thank-you message:", error);
        return { formal: "Unable to generate.", casual: "Unable to generate.", heartfelt: "Unable to generate." };
    }
}

// Decorative art for thank-you messages
function getThankArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🙏─────────────────🙏",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
