import logger from "../utils/logger.js";

export default {
    name: "vv2",
    description: "Resend the last view-once media in chat",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            // Check if the last message contains view-once media
            const lastMessage = message.message;
            if (!lastMessage?.viewOnceMessage) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ No view-once media detected in the last message." },
                    { quoted: message }
                );
                return;
            }

            // Extract the actual media from viewOnceMessage
            const mediaMessage = lastMessage.viewOnceMessage.message;

            // Resend the media back to chat
            await client.sendMessage(chatId, mediaMessage, { quoted: message });

            const response = `
${getVV2Art()}
👁 *VV2 COMMAND EXECUTED*
${getVV2Art()}

✅ Last view-once media has been resent.  
⚡ You can now view it again without restriction.

${getVV2Art()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing vv2 command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running vv2 command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getVV2Art() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👁─────────────────👁",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
