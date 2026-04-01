import logger from "../utils/logger.js";

export default {
    name: "abstract",
    description: "Generate categorized abstract concept info messages (Philosophical, Artistic, Metaphorical, Status)",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const concept = args.join(" ") || quotedText || "Unknown Concept";

            if (!concept) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🎨 *ABSTRACT COMMAND*\n\nUsage:\n• abstract [concept/idea]\n• Reply to any message with: abstract\n\nExamples:\n• abstract love\n• abstract chaos\n• abstract freedom`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized abstract info
            const results = await generateAbstract(concept);

            const response = `
${getAbstractArt()}
🎨 *ABSTRACT CONCEPT REPORT*
${getAbstractArt()}

📝 *Concept:* ${concept}

💡 *Philosophical:*  
${results.philosophical}

💡 *Artistic:*  
${results.artistic}

💡 *Metaphorical:*  
${results.metaphorical}

💡 *Status:*  
${results.status}

${getAbstractArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing abstract command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating abstract message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized abstract generator
async function generateAbstract(concept) {
    try {
        const philosophical = `📖 "${concept}" represents a deeper truth about existence.`;
        const artistic = `🎨 "${concept}" can be expressed through shapes, colors, and forms.`;
        const metaphorical = `✨ "${concept}" symbolizes human emotions and experiences.`;
        const status = `📊 "${concept}" remains timeless and open to interpretation.`;

        return { philosophical, artistic, metaphorical, status };
    } catch (error) {
        logger.error("Error generating abstract info:", error);
        return { philosophical: "Unable to generate.", artistic: "Unable to generate.", metaphorical: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for abstract messages
function getAbstractArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎨─────────────────🎨",
        "⊱──────── 💡 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
