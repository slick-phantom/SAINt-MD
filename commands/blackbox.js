import logger from "../utils/logger.js";

export default {
    name: "blackbox",
    description: "Generate mysterious or clever responses",
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
                        text: `🕵️ *BLACKBOX COMMAND*\n\nUsage:\n• blackbox [question]\n• Reply to any message with: blackbox\n\nExamples:\n• blackbox What is the secret of success?\n• blackbox Tell me something hidden\n• blackbox Solve this mystery`,
                    },
                    { quoted: message }
                );
                return;
            }

            const input = args.join(" ") || quotedText;

            if (!input) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No input provided. Please ask a question or reply to a message with: blackbox",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate mysterious response
            const result = await generateBlackbox(input);

            const response = `
${getBlackboxArt()}
🕵️ *BLACKBOX RESPONSE*
${getBlackboxArt()}

❓ *Your Question:*  
${input}

🔮 *Answer:*  
${result}

${getBlackboxArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing blackbox command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating blackbox response. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Simple mysterious response generator
async function generateBlackbox(input) {
    try {
        const responses = [
            "The answer lies within you.",
            "Sometimes silence speaks louder than words.",
            "Every mystery hides a lesson.",
            "Look closer — the truth is in plain sight.",
            "The path forward is hidden in the past."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    } catch (error) {
        logger.error("Error generating blackbox response:", error);
        return "Unable to generate mysterious response.";
    }
}

// Decorative art for blackbox messages
function getBlackboxArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🕵️─────────────────🕵️",
        "⊱──────── 🔮 ────────⊰",
        "»»────── ❓ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
