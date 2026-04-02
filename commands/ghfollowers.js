import logger from "../utils/logger.js";
import fetch from "node-fetch";

export default {
    name: "ghfollowers",
    description: "Get the number of GitHub followers for a user",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a GitHub username." },
                    { quoted: message }
                );
                return;
            }

            const username = args[0];

            // Fetch GitHub user data
            const res = await fetch(`https://api.github.com/users/${username}`);
            if (!res.ok) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Could not fetch data for GitHub user *${username}*.` },
                    { quoted: message }
                );
                return;
            }

            const data = await res.json();

            const response = `
${getGhFollowersArt()}
🐙 *GHFOLLOWERS COMMAND EXECUTED*
${getGhFollowersArt()}

👤 Username: *${data.login}*  
👥 Followers: *${data.followers}*  
📌 Profile: ${data.html_url}

${getGhFollowersArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing ghfollowers command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running ghfollowers command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getGhFollowersArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🐙─────────────────🐙",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
