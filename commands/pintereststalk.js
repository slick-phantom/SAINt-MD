import logger from "../utils/logger.js";
import fetch from "node-fetch";

export default {
    name: "pintereststalk",
    description: "Fetch Pinterest profile details for a user",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a Pinterest username." },
                    { quoted: message }
                );
                return;
            }

            const username = args[0];

            // Example API endpoint (replace with a real Pinterest scraper API)
            const res = await fetch(`https://api.popcat.xyz/pinterest?user=${username}`);
            if (!res.ok) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Could not fetch data for Pinterest user *${username}*.` },
                    { quoted: message }
                );
                return;
            }

            const data = await res.json();

            const response = `
${getPinterestArt()}
📌 *PINTERESTSTALK COMMAND EXECUTED*
${getPinterestArt()}

👤 Username: *${data.username}*  
📝 Name: *${data.full_name || "N/A"}*  
👥 Followers: *${data.followers || "N/A"}*  
👥 Following: *${data.following || "N/A"}*  
📌 Pins: *${data.pins || "N/A"}*  
📝 Bio: ${data.biography || "No bio set"}  
🔗 Profile: https://pinterest.com/${data.username}

${getPinterestArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing pintereststalk command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running pintereststalk command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getPinterestArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📌─────────────────📌",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
