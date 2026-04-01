import logger from "../utils/logger.js";

export default {
    name: "mistral",
    description: "Generate sharp, poetic, and insightful responses in Mistral style",
    category: "ai",

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
                        text: `🌬️ *MISTRAL COMMAND*\n\nUsage:\n• mistral [prompt]\n• Reply to any message with: mistral\n\nExamples:\n• mistral Write about resilience\n• mistral Share wisdom on love\n• mistral Create a poetic reflection`,
                    },
                    { quoted: message }
                );
                return;
            }

            const prompt = args.join(" ") || quotedText;

            if (!prompt) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No prompt provided. Please type a request or reply to a message with: mistral",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate Mistral-style response
            const result = await generateMistralResponse(prompt);

            const response = `
${getMistralArt()}
🌬️ *MISTRAL RESPONSE*
${getMistralArt()}

📝 *Prompt:* ${prompt}

💡 *Mistral Says:*  
${result}

${getMistralArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing mistral command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating Mistral response. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Mistral persona response generator
async function generateMistralResponse(prompt) {
    try {
        const responses = [
            `Like the mistral wind, ${prompt} cuts sharp but clears the sky.`,
            `In ${prompt}, strength is found in silence and clarity.`,
            `The mistral whispers: ${prompt} is both storm and renewal.`,
            `Swift as the wind, ${prompt} reshapes the path ahead.`,
            `Mistral reminds us: ${prompt} is fleeting, yet transformative.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    } catch (error) {
        logger.error("Error generating Mistral response:", error);
        return "Mistral is silent... unable to respond.";
    }
}

// Decorative art for Mistral messages
function getMistralArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌬️─────────────────🌬️",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌌 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
