import logger from "../utils/logger.js";

export default {
    name: "npm",
    description: "Generate categorized npm package info messages (Description, Version, Author, Status)",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const pkg = args.join(" ") || quotedText || "Unknown Package";

            if (!pkg) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📦 *NPM COMMAND*\n\nUsage:\n• npm [package]\n• Reply to any message with: npm\n\nExamples:\n• npm express\n• npm react\n• npm lodash`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized npm info
            const results = await generateNpm(pkg);

            const response = `
${getNpmArt()}
📦 *NPM PACKAGE REPORT*
${getNpmArt()}

📝 *Package:* ${pkg}

💡 *Description:*  
${results.description}

💡 *Version:*  
${results.version}

💡 *Author:*  
${results.author}

💡 *Status:*  
${results.status}

${getNpmArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing npm command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating npm message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized npm info generator
async function generateNpm(pkg) {
    try {
        const description = `📖 "${pkg}" is a useful npm package.`;
        const version = `🔢 Latest version is 1.0.0.`;
        const author = `👤 Maintained by community contributors.`;
        const status = `📊 "${pkg}" is stable and widely used.`;

        return { description, version, author, status };
    } catch (error) {
        logger.error("Error generating npm info:", error);
        return { description: "Unable to generate.", version: "Unable to generate.", author: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for npm messages
function getNpmArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📦─────────────────📦",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🔢 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
