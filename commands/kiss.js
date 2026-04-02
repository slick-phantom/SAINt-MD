import logger from "../utils/logger.js";

export default {
    name: "kiss",
    description: "Send a playful kiss to another user",
    category: "fun",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please mention or provide the number of the user you want to kiss." },
                    { quoted: message }
                );
                return;
            }

            const target = args[0];
            const sender = message.pushName || "Someone";

            const response = `
${getKissArt()}
💋 *KISS COMMAND EXECUTED*
${getKissArt()}

${sender} just sent a sweet kiss to ${target}!  
⚡ Spread the love and positivity 💕

${getKissArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing kiss command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running kiss command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getKissArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "💋─────────────────💋",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ❤️ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
