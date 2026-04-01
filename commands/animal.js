import logger from "../utils/logger.js";

export default {
    name: "animal",
    description: "Generate categorized animal facts info messages (Habitat, Diet, Behavior, Status)",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const animal = args.join(" ") || quotedText || "Unknown Animal";

            if (!animal) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🦁 *ANIMAL COMMAND*\n\nUsage:\n• animal [name]\n• Reply to any message with: animal\n\nExamples:\n• animal lion\n• animal elephant\n• animal eagle`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized animal info
            const results = await generateAnimal(animal);

            const response = `
${getAnimalArt()}
🦁 *ANIMAL FACTS REPORT*
${getAnimalArt()}

📝 *Animal:* ${animal}

💡 *Habitat:*  
${results.habitat}

💡 *Diet:*  
${results.diet}

💡 *Behavior:*  
${results.behavior}

💡 *Status:*  
${results.status}

${getAnimalArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing animal command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating animal message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized animal facts generator
async function generateAnimal(animal) {
    try {
        const habitat = `🌍 ${animal} lives in diverse environments across the world.`;
        const diet = `🍽️ ${animal} has a diet suited to its survival.`;
        const behavior = `✨ ${animal} exhibits unique behaviors in the wild.`;
        const status = `📊 ${animal} is part of the ecological balance.`;

        return { habitat, diet, behavior, status };
    } catch (error) {
        logger.error("Error generating animal info:", error);
        return { habitat: "Unable to generate.", diet: "Unable to generate.", behavior: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for animal messages
function getAnimalArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🦁─────────────────🦁",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌍 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
