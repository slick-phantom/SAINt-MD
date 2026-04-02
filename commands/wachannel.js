import logger from "../utils/logger.js";
import fetch from "node-fetch";

export default {
    name: "wachannel",
    description: "Fetch WhatsApp channel details",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a WhatsApp channel username or ID." },
                    { quoted: message }
                );
                return;
            }

            const channel = args[0];

            // Example API endpoint (replace with a real WhatsApp channel scraper API)
            const res = await fetch(`https://api.popcat.xyz/wachannel?user=${channel}`);
            if (!res.ok) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Could not fetch data for WhatsApp channel *${channel}*.` },
                    { quoted: message }
                );
                return;
            }

            const data = await res.json();

            const response = `
${getWaChannelArt()}
📢 *WACHANNEL COMMAND EXECUTED*
${getWaChannelArt()}

📌 Channel Name: *${data.name || "N/A"}*  
📝 Description: ${data.description || "No description"}  
👥 Followers: *${data.followers || "N/A"}*  
🔗 Channel Link: ${data.link || "N/A"}

${getWaChannelArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing wachannel command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running wachannel command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getWaChannelArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📢─────────────────📢",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
