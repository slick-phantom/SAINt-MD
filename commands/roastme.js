import logger from "../utils/logger.js";

export default {
    name: "roastme",
    description: "Generate categorized playful roasts directed at the user (Savage, Playful, Light Tease)",
    category: "fun",

    async execute(message, client, args) {
        try {
            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized roasts
            const results = await generateRoastMe();

            const response = `
${getRoastArt()}
🔥 *ROAST ME MODE*
${getRoastArt()}

💡 *Savage:*  
${results.savage}

💡 *Playful:*  
${results.playful}

💡 *Light Tease:*  
${results.tease}

${getRoastArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing roastme command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating roast. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized RoastMe generator
async function generateRoastMe() {
    try {
        const savage = "You’ve got the energy of a phone at 1% — always about to shut down.";
        const playful = "You’re like a software update — nobody asked, but here you are!";
        const tease = "You bring the same excitement as a loading bar stuck at 99%.";

        return { savage, playful, tease };
    } catch (error) {
        logger.error("Error generating roastme:", error);
        return { savage: "Unable to generate.", playful: "Unable to generate.", tease: "Unable to generate." };
    }
}

// Decorative art for roastme messages
function getRoastArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔥─────────────────🔥",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎭 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
