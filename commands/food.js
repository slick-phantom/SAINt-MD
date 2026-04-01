import logger from "../utils/logger.js";

export default {
    name: "food",
    description: "Generate categorized food facts info messages (Origin, Ingredients, Taste, Status)",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const food = args.join(" ") || quotedText || "Unknown Food";

            if (!food) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🍽️ *FOOD COMMAND*\n\nUsage:\n• food [dish/ingredient]\n• Reply to any message with: food\n\nExamples:\n• food Jollof Rice\n• food Pizza\n• food Sushi`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized food info
            const results = await generateFood(food);

            const response = `
${getFoodArt()}
🍽️ *FOOD FACTS REPORT*
${getFoodArt()}

📝 *Food:* ${food}

💡 *Origin:*  
${results.origin}

💡 *Ingredients:*  
${results.ingredients}

💡 *Taste:*  
${results.taste}

💡 *Status:*  
${results.status}

${getFoodArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing food command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating food message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized food facts generator
async function generateFood(food) {
    try {
        const origin = `🌍 ${food} originates from a rich culinary tradition.`;
        const ingredients = `🥗 ${food} is made with flavorful ingredients.`;
        const taste = `✨ ${food} offers a unique taste experience.`;
        const status = `📊 ${food} is loved worldwide.`;

        return { origin, ingredients, taste, status };
    } catch (error) {
        logger.error("Error generating food info:", error);
        return { origin: "Unable to generate.", ingredients: "Unable to generate.", taste: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for food messages
function getFoodArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🍽️─────────────────🍽️",
        "⊱──────── 💡 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
