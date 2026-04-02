import logger from "../utils/logger.js";
import os from "os";

export default {
    name: "botuptime",
    description: "Show how long the bot has been running",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            // Calculate uptime
            const uptimeSeconds = process.uptime();
            const hours = Math.floor(uptimeSeconds / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            const seconds = Math.floor(uptimeSeconds % 60);

            const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

            const response = `
${getUptimeArt()}
⏱ *BOT UPTIME*
${getUptimeArt()}

✅ The bot has been running for:  
📌 *${uptimeString}*

⚡ Stable and active since last restart.

${getUptimeArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing botuptime command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running botuptime command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getUptimeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "⏱─────────────────⏱",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
