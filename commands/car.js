import logger from "../utils/logger.js";

export default {
    name: "car",
    description: "Generate categorized car facts info messages (Engine, Performance, Design, Status)",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const car = args.join(" ") || quotedText || "Unknown Car";

            if (!car) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🚗 *CAR COMMAND*\n\nUsage:\n• car [model/type]\n• Reply to any message with: car\n\nExamples:\n• car Tesla Model S\n• car Toyota Corolla\n• car BMW M3`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized car info
            const results = await generateCar(car);

            const response = `
${getCarArt()}
🚗 *CAR FACTS REPORT*
${getCarArt()}

📝 *Car:* ${car}

💡 *Engine:*  
${results.engine}

💡 *Performance:*  
${results.performance}

💡 *Design:*  
${results.design}

💡 *Status:*  
${results.status}

${getCarArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing car command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating car message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized car facts generator
async function generateCar(car) {
    try {
        const engine = `⚙️ ${car} features a powerful engine setup.`;
        const performance = `🏎️ ${car} delivers impressive speed and handling.`;
        const design = `🎨 ${car} has a sleek and modern design.`;
        const status = `📊 ${car} is popular among drivers worldwide.`;

        return { engine, performance, design, status };
    } catch (error) {
        logger.error("Error generating car info:", error);
        return { engine: "Unable to generate.", performance: "Unable to generate.", design: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for car messages
function getCarArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🚗─────────────────🚗",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🏎️ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
