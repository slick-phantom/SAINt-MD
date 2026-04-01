import logger from "../utils/logger.js";

export default {
    name: "shinobu",
    description: "Generate categorized Shinobu info messages (Appearance, Personality, Role, Status)",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Unknown Shinobu";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🦋 *SHINOBU COMMAND*\n\nUsage:\n• shinobu [theme]\n• Reply to any message with: shinobu\n\nExamples:\n• shinobu demon slayer\n• shinobu cute\n• shinobu warrior`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized Shinobu info
            const results = await generateShinobu(theme);

            const response = `
${getShinobuArt()}
🦋 *SHINOBU REPORT*
${getShinobuArt()}

📝 *Theme:* ${theme}

💡 *Appearance:*  
${results.appearance}

💡 *Personality:*  
${results.personality}

💡 *Role:*  
${results.role}

💡 *Status:*  
${results.status}

${getShinobuArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing shinobu command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating Shinobu message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized Shinobu generator
async function generateShinobu(theme) {
    try {
        const appearance = `🎨 "${theme}" Shinobu is elegant with butterfly motifs.`;
        const personality = `🦋 "${theme}" Shinobu is calm yet sharp-witted.`;
        const role = `⚔️ "${theme}" Shinobu plays a vital role in battles.`;
        const status = `📊 "${theme}" Shinobu is beloved in anime culture.`;

        return { appearance, personality, role, status };
    } catch (error) {
        logger.error("Error generating Shinobu info:", error);
        return { appearance: "Unable to generate.", personality: "Unable to generate.", role: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for Shinobu messages
function getShinobuArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🦋─────────────────🦋",
        "⊱──────── 💡 ────────⊰",
        "»»────── ⚔️ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
