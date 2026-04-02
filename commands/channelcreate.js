import logger from "../utils/logger.js";

export default {
    name: "channelcreate",
    description: "Create a new WhatsApp channel",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 2) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a channel name and description.\nExample: channelcreate TechUpdates 'Latest tech news and tips'" },
                    { quoted: message }
                );
                return;
            }

            const channelName = args[0];
            const channelDescription = args.slice(1).join(" ");

            // Save channel info in DB (simulate creation)
            const channelId = `channel_${Date.now()}`;
            await db.set(channelId, {
                name: channelName,
                description: channelDescription,
                creator: message.pushName || "Unknown",
                createdAt: new Date().toISOString(),
            });

            const response = `
${getChannelArt()}
📢 *CHANNELCREATE COMMAND EXECUTED*
${getChannelArt()}

✅ Channel created successfully!  
📌 Name: *${channelName}*  
📝 Description: ${channelDescription}  
👤 Creator: ${message.pushName || "Unknown"}  
🆔 Channel ID: ${channelId}

${getChannelArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing channelcreate command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running channelcreate command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getChannelArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📢─────────────────📢",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
