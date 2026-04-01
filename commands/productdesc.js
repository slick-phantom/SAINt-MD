import logger from "../utils/logger.js";

export default {
    name: "productdesc",
    description: "Generate categorized product descriptions (Professional, Casual, Luxury)",
    category: "business",

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
                        text: `🛍️ *PRODUCTDESC COMMAND*\n\nUsage:\n• productdesc [product name]\n• Reply to any message with: productdesc\n\nExamples:\n• productdesc EcoBottle\n• productdesc SmartWatch\n• productdesc Organic Soap`,
                    },
                    { quoted: message }
                );
                return;
            }

            const product = args.join(" ") || quotedText;

            if (!product) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No product name provided. Please type a product name or reply to a message with: productdesc",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized product descriptions
            const results = await generateProductDescriptions(product);

            const response = `
${getProductArt()}
🛍️ *PRODUCT DESCRIPTION*
${getProductArt()}

📦 *Product:* ${product}

💡 *Professional:*  
${results.professional}

💡 *Casual:*  
${results.casual}

💡 *Luxury:*  
${results.luxury}

${getProductArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing productdesc command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating product description. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized product description generator
async function generateProductDescriptions(product) {
    try {
        const professional = `${product} delivers reliable performance and efficiency, designed to meet the needs of professionals and businesses with precision.`;
        const casual = `${product} makes everyday life easier and more enjoyable — simple, fun, and built for convenience.`;
        const luxury = `${product} embodies elegance and exclusivity, crafted with premium materials to offer a truly refined experience.`;

        return { professional, casual, luxury };
    } catch (error) {
        logger.error("Error generating product descriptions:", error);
        return { professional: "Unable to generate.", casual: "Unable to generate.", luxury: "Unable to generate." };
    }
}

// Decorative art for productdesc messages
function getProductArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🛍️─────────────────🛍️",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📦 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
