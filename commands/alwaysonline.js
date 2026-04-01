import logger from "../utils/logger.js";

export default {
    name: "alwaysonline",
    description: "Keep the bot always showing online",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const groupId = message.key.remoteJid;

            await client.sendPresenceUpdate("available", groupId);

            // Save setting to DB so bot stays online
            db.setConfig("alwaysOnline", true);

            const response = `
${getOnlineArt()}
🌐 *ALWAYSONLINE MODE ENABLED*
${getOnlineArt()}

✅ Bot will now always appear online.  
⚡ Status: Active until disabled.

${getOnlineArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing alwaysonline command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running alwaysonline command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getOnlineArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌐─────────────────🌐",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
