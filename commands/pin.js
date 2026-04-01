import logger from "../utils/logger.js";

export default {
    name: "pin",
    description: "Generate categorized pin-style notes (Reminder, Highlight, Quote)",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const note = args.join(" ") || quotedText || "Pinned Note";

            if (!note) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📌 *PIN COMMAND*\n\nUsage:\n• pin [note]\n• Reply to any message with: pin\n\nExamples:\n• pin Meeting at 10 AM\n• pin Remember to call client\n• pin Quote of the day`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized pin notes
            const results = await generatePin(note);

            const response = `
${getPinArt()}
📌 *PINNED NOTE*
${getPinArt()}

📝 *Note:* ${note}

💡 *Reminder:*  
${results.reminder}

💡 *Highlight:*  
${results.highlight}

💡 *Quote:*  
${results.quote}

${getPinArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing pin command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating pin message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized pin generator
async function generatePin(note) {
    try {
        const reminder = `📌 Reminder: ${note} — don’t forget this task.`;
        const highlight = `⭐ Highlight: ${note} — marked as important.`;
        const quote = `💬 Quote: "${note}" — pinned for inspiration.`;

        return { reminder, highlight, quote };
    } catch (error) {
        logger.error("Error generating pin message:", error);
        return { reminder: "Unable to generate.", highlight: "Unable to generate.", quote: "Unable to generate." };
    }
}

// Decorative art for pin messages
function getPinArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📌─────────────────📌",
        "⊱──────── 💡 ────────⊰",
        "»»────── ⭐ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
