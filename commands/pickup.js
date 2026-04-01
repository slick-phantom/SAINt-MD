import logger from "../utils/logger.js";

export default {
    name: "pickup",
    description: "Generate styled pickup lines",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "General Pickup Line";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `💘 *PICKUP COMMAND*\n\nUsage:\n• pickup [theme]\n• Reply to any message with: pickup\n\nExamples:\n• pickup nerdy\n• pickup romantic\n• pickup funny`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const results = await generatePickup(theme);

            const response = `
${getPickupArt()}
💘 *PICKUP REPORT*
${getPickupArt()}

📝 *Theme:* ${theme}

💡 *Line:*  
${results.line}

💡 *Style:*  
${results.style}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getPickupArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing pickup command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating pickup line. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

async function generatePickup(theme) {
    try {
        const line = `💬 "${theme}" pickup line: Are you a keyboard? Because you're just my type.`;
        const style = `🎨 "${theme}" style: playful and witty.`;
        const mood = `✨ "${theme}" mood: lighthearted and charming.`;
        const status = `📊 "${theme}" pickup line is popular and fun.`;

        return { line, style, mood, status };
    } catch (error) {
        logger.error("Error generating pickup info:", error);
        return { line: "Unable to generate.", style: "Unable to generate.", mood: "Unable to generate.", status: "Unable to generate." };
    }
}

function getPickupArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "💘─────────────────💘",
        "⊱──────── 💬 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
