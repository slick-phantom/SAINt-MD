import logger from "../utils/logger.js";

export default {
    name: "scan",
    description: "Generate categorized scan/diagnostic messages (Integrity, Performance, Security, Status)",
    category: "utility",

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
                        text: `📡 *SCAN COMMAND*\n\nUsage:\n• scan [target]\n• Reply to any message with: scan\n\nExamples:\n• scan Destiny\n• scan SAINt-MD\n• scan System`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized scan info
            const results = await generateScan(target);

            const response = `
${getScanArt()}
📡 *SCAN REPORT*
${getScanArt()}

📝 *Target:* ${target}

💡 *Integrity:*  
${results.integrity}

💡 *Performance:*  
${results.performance}

💡 *Security:*  
${results.security}

💡 *Status:*  
${results.status}

${getScanArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing scan command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating scan message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized scan info generator
async function generateScan(target) {
    try {
        const integrity = `🛡️ ${target} integrity check passed successfully.`;
        const performance = `⚡ ${target} performance is stable and optimized.`;
        const security = `🔒 ${target} security scan shows no vulnerabilities.`;
        const status = `📊 ${target} is active and operational.`;

        return { integrity, performance, security, status };
    } catch (error) {
        logger.error("Error generating scan info:", error);
        return { integrity: "Unable to generate.", performance: "Unable to generate.", security: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for scan messages
function getScanArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📡─────────────────📡",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🛡️ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
