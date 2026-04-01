import logger from "../utils/logger.js";

export default {
    name: "toast",
    description: "Generate short celebratory toast speeches",
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
                        text: `🥂 *TOAST COMMAND*\n\nUsage:\n• toast [person/occasion]\n• Reply to any message with: toast\n\nExamples:\n• toast Wedding\n• toast Graduation\n• toast Team Success`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate toast
            const results = await generateToast(subject);

            const response = `
${getToastArt()}
🥂 *TOAST GENERATOR*
${getToastArt()}

📝 *Subject:* ${subject}

💡 *Toast:*  
${results}

${getToastArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing toast command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating toast. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Toast generator
async function generateToast(subject) {
    try {
        const toasts = [
            `Here’s to ${subject} — may this moment be filled with joy, laughter, and unforgettable memories.`,
            `Raise your glasses to ${subject}! A celebration of love, success, and the bright future ahead.`,
            `To ${subject}: may your journey continue with happiness, strength, and endless blessings.`
        ];
        return toasts[Math.floor(Math.random() * toasts.length)];
    } catch (error) {
        logger.error("Error generating toast:", error);
        return "Unable to generate toast.";
    }
}

// Decorative art for toast messages
function getToastArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🥂─────────────────🥂",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
