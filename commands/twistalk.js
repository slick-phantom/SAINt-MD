import logger from "../utils/logger.js";
import fetch from "node-fetch";

export default {
    name: "twiststalk",
    description: "Fetch Twitch profile details for a user",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a Twitch username." },
                    { quoted: message }
                );
                return;
            }

            const username = args[0];

            // Example API endpoint (replace with a real Twitch scraper API)
            const res = await fetch(`https://api.popcat.xyz/twitch?user=${username}`);
            if (!res.ok) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Could not fetch data for Twitch user *${username}*.` },
                    { quoted: message }
                );
                return;
            }

            const data = await res.json();

            const response = `
${getTwistStalkArt()}
🎮 *TWISTSTALK COMMAND EXECUTED*
${getTwistStalkArt()}

👤 Username: *${data.username}*  
📝 Display Name: *${data.display_name || "N/A"}*  
👥 Followers: *${data.followers}*  
👀 Views: *${data.views}*  
📝 Bio: ${data.bio || "No bio set"}  
🔗 Profile: https://twitch.tv/${data.username}

${getTwistStalkArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing twiststalk command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running twiststalk command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getTwistStalkArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎮─────────────────🎮",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
