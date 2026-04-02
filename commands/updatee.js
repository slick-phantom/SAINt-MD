import logger from "../utils/logger.js";
import { exec } from "child_process";
import process from "process";

export default {
    name: "update",
    description: "Update the bot by pulling latest code and restarting",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            const response = `
${getUpdateArt()}
🔄 *UPDATE COMMAND EXECUTED*
${getUpdateArt()}

✅ Bot is fetching latest updates...  
⚡ Please wait while it restarts with new changes.

${getUpdateArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

            // Run git pull to fetch updates
            exec("git pull", (error, stdout, stderr) => {
                if (error) {
                    logger.error("Error pulling updates:", error);
                    client.sendMessage(chatId, { text: "❌ Error pulling updates. Check server logs." }, { quoted: message });
                    return;
                }

                logger.info("Update output:", stdout);

                // Restart bot after pulling updates
                setTimeout(() => {
                    process.exit(0);
                }, 3000);
            });

        } catch (error) {
            logger.error("Error executing update command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running update command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getUpdateArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔄─────────────────🔄",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
