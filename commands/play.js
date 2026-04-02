import logger from "../utils/logger.js";
import fetch from "node-fetch";

export default {
    name: "play",
    description: "Search and play audio/video from YouTube",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("recording", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a song or video name.\nExample: play Shape of You" },
                    { quoted: message }
                );
                return;
            }

            const query = args.join(" ");

            // Example API endpoint (replace with a real YouTube downloader/search API)
            const res = await fetch(`https://api.popcat.xyz/youtube?q=${encodeURIComponent(query)}`);
            if (!res.ok) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Could not fetch results for *${query}*.` },
                    { quoted: message }
                );
                return;
            }

            const data = await res.json();

            const response = `
${getPlayArt()}
▶️ *PLAY COMMAND EXECUTED*
${getPlayArt()}

🎵 Title: *${data.title}*  
👤 Channel: *${data.channel}*  
⏱ Duration: *${data.duration}*  
👀 Views: *${data.views}*  
🔗 Link: ${data.url}

${getPlayArt()}
            `.trim();

            // Send video/audio link
            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing play command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running play command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getPlayArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "▶️─────────────────▶️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── 🎶 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
