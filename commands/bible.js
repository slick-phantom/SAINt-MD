import logger from "../utils/logger.js";
import axios from "axios";

export default {
    name: "bible",
    description: "Fetch Bible verses by reference",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a Bible reference (e.g., John 3:16)." },
                    { quoted: message }
                );
                return;
            }

            const reference = args.join(" ");

            // Example API call (you can replace with your preferred Bible API)
            const apiUrl = `https://bible-api.com/${encodeURIComponent(reference)}`;
            const { data } = await axios.get(apiUrl);

            if (!data || !data.text) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Could not find verse for: ${reference}` },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getBibleArt()}
📖 *BIBLE VERSE*
${getBibleArt()}

🔹 Reference: *${data.reference}*  
🔹 Verse: ${data.text.trim()}

${getBibleArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing bible command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running bible command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getBibleArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📖─────────────────📖",
        "⊱──────── ✝️ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
