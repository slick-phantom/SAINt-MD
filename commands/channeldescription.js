import logger from "../utils/logger.js";

export default {
    name: "channeldescription",
    description: "Update the description of a WhatsApp channel",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 2) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a channel ID and a new description.\nExample: channeldescription channel_12345 'Latest updates and news'" },
                    { quoted: message }
                );
                return;
            }

            const channelId = args[0];
            const newDescription = args.slice(1).join(" ");

            // Fetch channel info from DB
            const channel = await db.get(channelId);
            if (!channel) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Channel with ID *${channelId}* not found.` },
                    { quoted: message }
                );
                return;
            }

            // Update description
            channel.description = newDescription;
            await db.set(channelId, channel);

            const response = `
${getChannelDescArt()}
📢 *CHANNELDESCRIPTION COMMAND EXECUTED*
${getChannelDescArt()}

✅ Channel description updated successfully!  
📌 Channel Name: *${channel.name}*  
📝 New Description: ${newDescription}  
👤 Updated By: ${message.pushName || "Unknown"}  

${getChannelDescArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing channeldescription command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running channeldescription command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getChannelDescArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📢─────────────────📢",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
