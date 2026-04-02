import logger from "../utils/logger.js";

export default {
    name: "channelname",
    description: "Update the name of a WhatsApp channel",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 2) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a channel ID and a new name.\nExample: channelname channel_12345 TechUpdates" },
                    { quoted: message }
                );
                return;
            }

            const channelId = args[0];
            const newName = args.slice(1).join(" ");

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

            // Update channel name
            channel.name = newName;
            await db.set(channelId, channel);

            const response = `
${getChannelNameArt()}
📝 *CHANNELNAME COMMAND EXECUTED*
${getChannelNameArt()}

✅ Channel name updated successfully!  
🆔 Channel ID: ${channelId}  
📌 New Name: *${newName}*  
👤 Updated By: ${message.pushName || "Unknown"}  

${getChannelNameArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing channelname command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running channelname command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getChannelNameArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📝─────────────────📝",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
