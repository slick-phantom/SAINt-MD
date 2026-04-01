import logger from "../utils/logger.js";

export default {
    name: "stalk",
    description: "Generate categorized profile info messages (Overview, Activity, Vibe, Status)",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const target = args.join(" ") || quotedText || "Unknown Target";

            if (!target) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `👀 *STALK COMMAND*\n\nUsage:\n• stalk [name/handle]\n• Reply to any message with: stalk\n\nExamples:\n• stalk Destiny\n• stalk SAINt-MD\n• stalk Anonymous`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized stalk info
            const results = await generateStalk(target);

            const response = `
${getStalkArt()}
👀 *PROFILE DATA*
${getStalkArt()}

📝 *Target:* ${target}

💡 *Overview:*  
${results.overview}

💡 *Activity:*  
${results.activity}

💡 *Vibe:*  
${results.vibe}

💡 *Status:*  
${results.status}

${getStalkArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing stalk command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating stalk message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized stalk info generator
async function generateStalk(target) {
    try {
        const overview = `📖 ${target} is a notable profile with unique presence.`;
        const activity = `📌 ${target} shows consistent activity and engagement.`;
        const vibe = `✨ ${target} gives off a distinctive vibe.`;
        const status = `🔒 ${target} is currently active and visible.`;

        return { overview, activity, vibe, status };
    } catch (error) {
        logger.error("Error generating stalk info:", error);
        return { overview: "Unable to generate.", activity: "Unable to generate.", vibe: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for stalk messages
function getStalkArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👀─────────────────👀",
        "⊱──────── 💡 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
