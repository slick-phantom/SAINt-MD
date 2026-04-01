import logger from "../utils/logger.js";

export default {
    name: "apk",
    description: "Generate categorized APK-style release notes (Feature, Fix, Upgrade)",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const subject = args.join(" ") || quotedText || "New APK";

            if (!subject) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📦 *APK COMMAND*\n\nUsage:\n• apk [feature/topic]\n• Reply to any message with: apk\n\nExamples:\n• apk Dark Mode\n• apk Performance Boost\n• apk Bug Fixes`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized APK notes
            const results = await generateApk(subject);

            const response = `
${getApkArt()}
📦 *APK DROP*
${getApkArt()}

📝 *Subject:* ${subject}

💡 *Feature:*  
${results.feature}

💡 *Fix:*  
${results.fix}

💡 *Upgrade:*  
${results.upgrade}

${getApkArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing apk command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating APK message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized APK generator
async function generateApk(subject) {
    try {
        const feature = `✨ ${subject} added — enjoy the brand new functionality at your fingertips.`;
        const fix = `🐞 ${subject} issue resolved — smoother experience, fewer glitches.`;
        const upgrade = `🚀 ${subject} optimized — faster, cleaner, and more powerful than before.`;

        return { feature, fix, upgrade };
    } catch (error) {
        logger.error("Error generating APK message:", error);
        return { feature: "Unable to generate.", fix: "Unable to generate.", upgrade: "Unable to generate." };
    }
}

// Decorative art for APK messages
function getApkArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📦─────────────────📦",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🚀 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
