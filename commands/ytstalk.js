import logger from "../utils/logger.js";
import fetch from "node-fetch";

export default {
    name: "ytstalk",
    description: "Fetch YouTube channel details for a user",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a YouTube channel username or ID." },
                    { quoted: message }
                );
                return;
            }

            const channel = args[0];

            // Example API endpoint (replace with a real YouTube scraper API or YouTube Data API key)
            const res = await fetch(`https://api.popcat.xyz/youtube?user=${channel}`);
            if (!res.ok) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Could not fetch data for YouTube channel *${channel}*.` },
                    { quoted: message }
                );
                return;
            }

            const data = await res.json();

            const response = `
${getYtStalkArt()}
▶️ *YTSTALK COMMAND EXECUTED*
${getYtStalkArt()}

📌 Channel Name: *${data.name || "N/A"}*  
👥 Subscribers: *${data.subscribers || "N/A"}*  
🎬 Videos: *${data.videos || "N/A"}*  
👀 Views: *${data.views || "N/A"}*  
📝 Description: ${data.description || "No description"}  
🔗 Channel Link: https://youtube.com/${data.id || channel}

${getYtStalkArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing ytstalk command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running ytstalk command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getYtStalkArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "▶️─────────────────▶️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
