import logger from "../utils/logger.js";

export default {
    name: "scriptwrite",
    description: "Generate categorized short scripts (Comedy, Drama, Pitch)",
    category: "creative",

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
                        text: `🎬 *SCRIPTWRITE COMMAND*\n\nUsage:\n• scriptwrite [theme]\n• Reply to any message with: scriptwrite\n\nExamples:\n• scriptwrite Coffee Shop\n• scriptwrite Startup Pitch\n• scriptwrite Comedy Skit`,
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
                        text: "❌ No theme provided. Please type a theme or reply to a message with: scriptwrite",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized scripts
            const results = await generateScripts(theme);

            const response = `
${getScriptArt()}
🎬 *SCRIPTWRITE*
${getScriptArt()}

📝 *Theme:* ${theme}

💡 *Comedy:*  
${results.comedy}

💡 *Drama:*  
${results.drama}

💡 *Pitch:*  
${results.pitch}

${getScriptArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing scriptwrite command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating script. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized script generator
async function generateScripts(theme) {
    try {
        const comedy = `Scene: ${theme}\n\nCharacter A: "I swear this coffee is decaf."\nCharacter B: "Then why am I vibrating like a washing machine?"`;
        const drama = `Scene: ${theme}\n\nCharacter A: "You left me when I needed you most."\nCharacter B: "I never left — you just stopped looking."`;
        const pitch = `Scene: ${theme}\n\nPresenter: "Imagine a world where ${theme} solves everyday problems."\nAudience: "Tell us more!"`;

        return { comedy, drama, pitch };
    } catch (error) {
        logger.error("Error generating scripts:", error);
        return { comedy: "Unable to generate.", drama: "Unable to generate.", pitch: "Unable to generate." };
    }
}

// Decorative art for scriptwrite messages
function getScriptArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎬─────────────────🎬",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎭 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
