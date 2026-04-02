import logger from "../utils/logger.js";

export default {
    name: "channelid",
    description: "Fetch the unique ID of a WhatsApp channel",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a channel name.\nExample: channelid TechUpdates" },
                    { quoted: message }
                );
                return;
            }

            const channelName = args[0];

            // Search channel in DB
            const channels = await db.getAll();
            const channelEntry = Object.entries(channels).find(
                ([id, data]) => data.name?.toLowerCase() === channelName.toLowerCase()
            );

            if (!channelEntry) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Channel *${channelName}* not found.` },
                    { quoted: message }
                );
                return;
            }

            const [channelId, channelData] = channelEntry;

            const response = `
${getChannelIdArt()}
🆔 *CHANNELID COMMAND EXECUTED*
${getChannelIdArt()}

📌 Channel Name: *${channelData.name}*  
🆔 Channel ID: ${channelId}  
📝 Description: ${channelData.description || "No description"}  
👤 Creator: ${channelData.creator || "Unknown"}  
📅 Created At: ${channelData.createdAt || "N/A"}

${getChannelIdArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing channelid command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running channelid command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getChannelIdArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🆔─────────────────🆔",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
