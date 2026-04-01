import logger from "../utils/logger.js";

export default {
    name: "borders",
    description: "Generate categorized decorative borders (Elegant, Minimal, Bold)",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const content = args.join(" ") || quotedText || "Bordered Text";

            if (!content) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🖼️ *BORDERS COMMAND*\n\nUsage:\n• borders [text]\n• Reply to any message with: borders\n\nExamples:\n• borders Important Notice\n• borders Quote of the Day\n• borders Announcement`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized borders
            const results = await generateBorders(content);

            const response = `
${results.elegant.top}
${results.elegant.side} ${content} ${results.elegant.side}
${results.elegant.bottom}

${results.minimal.top}
${results.minimal.side} ${content} ${results.minimal.side}
${results.minimal.bottom}

${results.bold.top}
${results.bold.side} ${content} ${results.bold.side}
${results.bold.bottom}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing borders command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating bordered message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized border generator
async function generateBorders(content) {
    try {
        const elegant = {
            top: "✦━━━━━━━━━━━━━━━━━✦",
            side: "┃",
            bottom: "✦━━━━━━━━━━━━━━━━━✦"
        };
        const minimal = {
            top: "───────",
            side: "|",
            bottom: "───────"
        };
        const bold = {
            top: "█▀▀▀▀▀▀▀▀▀▀▀█",
            side: "█",
            bottom: "█▄▄▄▄▄▄▄▄▄▄▄█"
        };

        return { elegant, minimal, bold };
    } catch (error) {
        logger.error("Error generating borders:", error);
        return {
            elegant: { top: "━━━", side: "|", bottom: "━━━" },
            minimal: { top: "---", side: "|", bottom: "---" },
            bold: { top: "###", side: "#", bottom: "###" }
        };
    }
}
