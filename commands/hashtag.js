import logger from "../utils/logger.js";

export default {
    name: "hashtag",
    description: "Generate styled hashtags for social media posts",
    category: "tools",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            if (!args || args.length < 2) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `#️⃣ *HASHTAG COMMAND*\n\nUsage:\n• hashtag [style] [topic]\n• Reply to any message with: hashtag [style]\n\nAvailable styles: trending, motivational, funny, professional\n\nExamples:\n• hashtag trending Travel\n• hashtag motivational Fitness\n• hashtag funny Cats\n• hashtag professional Business growth`,
                    },
                    { quoted: message }
                );
                return;
            }

            const style = args[0].toLowerCase();
            const topic = args.slice(1).join(" ") || quotedText;

            if (!topic) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No topic provided. Please add a subject after the style (e.g., hashtag trending Travel).",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate hashtags
            const result = await generateHashtags(style, topic);

            const response = `
${getHashtagArt()}
#️⃣ *HASHTAG SUGGESTIONS*
${getHashtagArt()}

📝 *Topic:* ${topic}  
🎨 *Style:* ${style}

✨ *Hashtags:*  
${result.join(" ")}

${getHashtagArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing hashtag command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating hashtags. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Styled hashtag generator
async function generateHashtags(style, topic) {
    try {
        const base = topic.replace(/\s+/g, "");

        switch (style) {
            case "trending":
                return [`#${base}`, `#${base}Trend`, `#Viral${base}`, `#${base}Buzz`, `#${base}2026`];
            case "motivational":
                return [`#${base}Goals`, `#${base}Journey`, `#StayInspired`, `#KeepGoing${base}`, `#DreamBig${base}`];
            case "funny":
                return [`#${base}Memes`, `#LOL${base}`, `#${base}Humor`, `#Crazy${base}`, `#${base}Mood`];
            case "professional":
                return [`#${base}Business`, `#${base}Growth`, `#${base}Strategy`, `#${base}Success`, `#${base}Network`];
            default:
                return [`#${base}`, `#${base}Life`, `#${base}Vibes`, `#${base}Journey`, `#${base}Inspiration`];
        }
    } catch (error) {
        logger.error("Error generating hashtags:", error);
        return ["#UnableToGenerate"];
    }
}

// Decorative art for hashtag messages
function getHashtagArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "#️⃣─────────────────#️⃣",
        "⊱──────── ✨ ────────⊰",
        "»»────── 📲 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
