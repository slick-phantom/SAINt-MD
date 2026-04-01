import logger from "../utils/logger.js";

export default {
    name: "pitch",
    description: "Generate categorized persuasive pitches (Investor, Customer, Casual)",
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
                        text: `🎤 *PITCH COMMAND*\n\nUsage:\n• pitch [idea/product]\n• Reply to any message with: pitch\n\nExamples:\n• pitch EcoBottle\n• pitch SmartWatch\n• pitch Startup idea for delivery app`,
                    },
                    { quoted: message }
                );
                return;
            }

            const idea = args.join(" ") || quotedText;

            if (!idea) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No idea provided. Please type a product/idea or reply to a message with: pitch",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized pitches
            const results = await generatePitch(idea);

            const response = `
${getPitchArt()}
🎤 *ELEVATOR PITCH*
${getPitchArt()}

💡 *Idea:* ${idea}

📢 *Investor Pitch:*  
${results.investor}

📢 *Customer Pitch:*  
${results.customer}

📢 *Casual Pitch:*  
${results.casual}

${getPitchArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing pitch command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating pitch. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized pitch generator
async function generatePitch(idea) {
    try {
        const investor = `${idea} represents a scalable opportunity with strong market demand, clear differentiation, and high growth potential.`;
        const customer = `${idea} makes your life easier, smarter, and more enjoyable — designed with you in mind.`;
        const casual = `${idea} is cool, simple, and fun — something you’ll love using every day.`;

        return { investor, customer, casual };
    } catch (error) {
        logger.error("Error generating pitch:", error);
        return { investor: "Unable to generate.", customer: "Unable to generate.", casual: "Unable to generate." };
    }
}

// Decorative art for pitch messages
function getPitchArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎤─────────────────🎤",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🚀 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
