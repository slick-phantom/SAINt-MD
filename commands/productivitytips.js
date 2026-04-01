import logger from "../utils/logger.js";

export default {
    name: "productivitytips",
    description: "Generate categorized productivity tips (Focus, Time Management, Energy)",
    category: "wisdom",

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
                        text: `⚡ *PRODUCTIVITYTIPS COMMAND*\n\nUsage:\n• productivitytips [theme]\n• Reply to any message with: productivitytips\n\nExamples:\n• productivitytips Study\n• productivitytips Work\n• productivitytips Morning routine`,
                    },
                    { quoted: message }
                );
                return;
            }

            const theme = args.join(" ") || quotedText;

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No theme provided. Please add a subject or reply to a message with: productivitytips",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized tips
            const results = await generateProductivityTips(theme);

            const response = `
${getTipsArt()}
⚡ *PRODUCTIVITY TIPS*
${getTipsArt()}

📝 *Theme:* ${theme}

💡 *Focus:*  
${results.focus}

💡 *Time Management:*  
${results.time}

💡 *Energy:*  
${results.energy}

${getTipsArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing productivitytips command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating productivity tips. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized productivity tips generator
async function generateProductivityTips(theme) {
    try {
        const focus = `Eliminate distractions when working on ${theme} — silence notifications and set clear priorities.`;
        const time = `Break ${theme} tasks into smaller chunks and use the Pomodoro technique to stay consistent.`;
        const energy = `Stay energized during ${theme} by hydrating, stretching, and taking short breaks to recharge.`;

        return { focus, time, energy };
    } catch (error) {
        logger.error("Error generating productivity tips:", error);
        return { focus: "Unable to generate.", time: "Unable to generate.", energy: "Unable to generate." };
    }
}

// Decorative art for productivitytips messages
function getTipsArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "⚡─────────────────⚡",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📈 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
