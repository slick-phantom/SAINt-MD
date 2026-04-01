import logger from "../utils/logger.js";

export default {
    name: "savestatus",
    description: "Generate save-status style messages",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const status = args.join(" ") || quotedText || "New Status";

            if (!status) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `💾 *SAVESTATUS COMMAND*\n\nUsage:\n• savestatus [status]\n• Reply to any message with: savestatus\n\nExamples:\n• savestatus Happy Weekend\n• savestatus New Profile Pic\n• savestatus Travel Diaries`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate save-status message
            const results = await generateSaveStatus(status);

            const response = `
${getSaveStatusArt()}
💾 *STATUS SAVER*
${getSaveStatusArt()}

📝 *Status:* ${status}

💡 *Saved:*  
${results}

${getSaveStatusArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing savestatus command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error saving status. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Save-status message generator
async function generateSaveStatus(status) {
    try {
        const messages = [
            `💾 Status saved: "${status}" — pinned for later.`,
            `⭐ Highlighted: "${status}" — locked in memory.`,
            `📌 "${status}" — captured and stored.`,
            `📝 Saved update: "${status}" — quick access anytime.`,
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    } catch (error) {
        logger.error("Error generating save-status message:", error);
        return "Unable to generate save-status message.";
    }
}

// Decorative art for save-status messages
function getSaveStatusArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "💾─────────────────💾",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📌 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
