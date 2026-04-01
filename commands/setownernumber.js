import logger from "../utils/logger.js";

export default {
    name: "setownernumber",
    description: "Set a new phone number for the bot owner",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a new phone number for the owner." },
                    { quoted: message }
                );
                return;
            }

            const newOwnerNumber = args[0];

            // Save new owner number in DB
            db.setConfig("ownerNumber", newOwnerNumber);

            const response = `
${getOwnerNumberArt()}
📱 *SETOWNERNUMBER SUCCESSFUL*
${getOwnerNumberArt()}

✅ Owner number has been updated.  
📌 New owner number: *${newOwnerNumber}*  
⚡ Active until changed again.

${getOwnerNumberArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing setownernumber command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running setownernumber command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getOwnerNumberArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📱─────────────────📱",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
