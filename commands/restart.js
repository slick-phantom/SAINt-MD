import logger from "../utils/logger.js";
import process from "process";

export default {
    name: "restart",
    description: "Restart the bot process",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            const response = `
${getRestartArt()}
🔄 *RESTART COMMAND EXECUTED*
${getRestartArt()}

✅ Bot is restarting now...  
⚡ Please wait a few seconds for it to come back online.

${getRestartArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

            // Delay slightly before exiting
            setTimeout(() => {
                process.exit(0);
            }, 3000);

        } catch (error) {
            logger.error("Error executing restart command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running restart command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getRestartArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔄─────────────────🔄",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
