import logger from "../utils/logger.js";

export default {
    name: "block",
    description: "Block a user from messaging the bot",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide the number or mention the user you want to block." },
                    { quoted: message }
                );
                return;
            }

            const targetNumber = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

            // Block the user
            await client.updateBlockStatus(targetNumber, "block");

            const response = `
${getBlockArt()}
🚫 *BLOCK COMMAND EXECUTED*
${getBlockArt()}

✅ User has been blocked successfully.  
📌 Target: *${args[0]}*  
⚡ They can no longer message the bot.

${getBlockArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing block command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running block command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getBlockArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🚫─────────────────🚫",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
