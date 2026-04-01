import logger from "../utils/logger.js";

export default {
    name: "keithai",
    description: "KeithAI persona that responds in different tones",
    category: "ai",

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
                        text: `🤖 *KEITHAI COMMAND*\n\nUsage:\n• keithai [prompt]\n• Reply to any message with: keithai\n\nKeithAI supports tones: motivational, humorous, philosophical\n\nExamples:\n• keithai motivational Success\n• keithai humorous Work stress\n• keithai philosophical Life and time`,
                    },
                    { quoted: message }
                );
                return;
            }

            const tone = args[0].toLowerCase();
            const prompt = args.slice(1).join(" ") || quotedText;

            if (!prompt) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No prompt provided. Please type a request or reply to a message with: keithai [tone] [prompt]",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate KeithAI response
            const result = await generateKeithAIResponse(tone, prompt);

            const response = `
${getKeithArt()}
🤖 *KEITHAI RESPONSE*
${getKeithArt()}

📝 *Prompt:* ${prompt}  
🎨 *Tone:* ${tone}

💡 *KeithAI Says:*  
${result}

${getKeithArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing keithai command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating KeithAI response. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// KeithAI persona response generator with tones
async function generateKeithAIResponse(tone, prompt) {
    try {
        const motivational = [
            `Success isn’t about speed, it’s about direction. Keep moving forward with purpose.`,
            `Dreams don’t work unless you do. Stay consistent, and KeithAI believes in you.`,
            `Every challenge is a stepping stone to greatness.`
        ];

        const humorous = [
            `Work stress? Just rename your boss to "Bug" and debug them.`,
            `Life is like Wi-Fi — sometimes it disconnects, but you just reconnect.`,
            `If opportunity doesn’t knock, build a door… and add a funny welcome mat.`
        ];

        const philosophical = [
            `Time flows like a river; we can’t stop it, but we can choose how to sail.`,
            `Life is a puzzle — every piece matters, even the ones we don’t understand yet.`,
            `The meaning of existence lies not in answers, but in the questions we dare to ask.`
        ];

        switch (tone) {
            case "motivational":
                return motivational[Math.floor(Math.random() * motivational.length)];
            case "humorous":
                return humorous[Math.floor(Math.random() * humorous.length)];
            case "philosophical":
                return philosophical[Math.floor(Math.random() * philosophical.length)];
            default:
                return `KeithAI responds: "${prompt}" — but please specify a tone (motivational, humorous, philosophical).`;
        }
    } catch (error) {
        logger.error("Error generating KeithAI response:", error);
        return "KeithAI is thinking... but couldn’t generate a response.";
    }
}

// Decorative art for KeithAI messages
function getKeithArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🤖─────────────────🤖",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🚀 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
