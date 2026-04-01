import logger from "../utils/logger.js";

export default {
    name: "weatherday",
    description: "Generate categorized daily weather info messages (Conditions, Temperature, Wind, Forecast)",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const location = args.join(" ") || quotedText || "Unknown Location";

            if (!location) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌦️ *WEATHERDAY COMMAND*\n\nUsage:\n• weatherday [location]\n• Reply to any message with: weatherday\n\nExamples:\n• weatherday Lagos\n• weatherday New York\n• weatherday Tokyo`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized weather info
            const results = await generateWeather(location);

            const response = `
${getWeatherArt()}
🌦️ *DAILY WEATHER REPORT*
${getWeatherArt()}

📍 *Location:* ${location}

💡 *Conditions:*  
${results.conditions}

💡 *Temperature:*  
${results.temperature}

💡 *Wind:*  
${results.wind}

💡 *Forecast:*  
${results.forecast}

${getWeatherArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing weatherday command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating weatherday message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized weather generator
async function generateWeather(location) {
    try {
        const conditions = `☁️ ${location} is partly cloudy today.`;
        const temperature = `🌡️ Average temperature is around 28°C.`;
        const wind = `💨 Winds are light, about 10 km/h.`;
        const forecast = `📊 Expect mild conditions with no major changes.`;

        return { conditions, temperature, wind, forecast };
    } catch (error) {
        logger.error("Error generating weather info:", error);
        return { conditions: "Unable to generate.", temperature: "Unable to generate.", wind: "Unable to generate.", forecast: "Unable to generate." };
    }
}

// Decorative art for weather messages
function getWeatherArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌦️─────────────────🌦️",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌡️ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
