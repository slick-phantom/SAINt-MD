import logger from "../utils/logger.js";

export default {
    name: "groupsettings",
    description: "Change group settings (who can edit group info)",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ GroupSettings can only be used in group chats." },
                    { quoted: message }
                );
                return;
            }

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please specify `admins` or `all` to set who can edit group info." },
                    { quoted: message }
                );
                return;
            }

            const option = args[0].toLowerCase();
            if (option !== "admins" && option !== "all") {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Invalid option. Use `groupsettings admins` or `groupsettings all`." },
                    { quoted: message }
                );
                return;
            }

            // Update group settings
            await client.groupSettingUpdate(chatId, option === "admins" ? "locked" : "unlocked");

            const response = `
${getGroupSettingsArt()}
⚙️ *GROUPSETTINGS COMMAND EXECUTED*
${getGroupSettingsArt()}

✅ Group settings updated successfully.  
📌 Now *${option === "admins" ? "only admins" : "all members"}* can edit group info (subject, description, picture).

${getGroupSettingsArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing groupsettings command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running groupsettings command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getGroupSettingsArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "⚙️─────────────────⚙️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
