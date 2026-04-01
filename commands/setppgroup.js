import logger from "../utils/logger.js";

export default {
    name: "setppgroup",
    description: "Set or update the group profile picture",
    category: "group",

    async execute(message, client, args) {
        try {
            const groupId = message.key.remoteJid;

            if (!groupId.endsWith("@g.us")) {
                await client.sendMessage(
                    groupId,
                    { text: "❌ This command only works in groups." },
                    { quoted: message }
                );
                return;
            }

            // Detect quoted image
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedImage = quotedMsg?.imageMessage;

            if (!quotedImage) {
                await client.sendMessage(
                    groupId,
                    {
                        text: `🖼️ *SETPPGROUP COMMAND*\n\nUsage:\n• Reply to an image with: setppgroup\n\nExample:\n• (Reply to a photo) setppgroup`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", groupId);

            try {
                // Download the quoted image
                const buffer = await client.downloadMediaMessage({ message: quotedImage });

                // Update group profile picture
                await client.updateProfilePicture(groupId, buffer);

                const response = `
${getPPArt()}
🖼️ *GROUP PROFILE PICTURE UPDATED*
${getPPArt()}

✅ Group photo changed successfully.  
👥 Visible to all members.

${getPPArt()}
                `.trim();

                await client.sendMessage(
                    groupId,
                    { text: response },
                    { quoted: message }
                );
            } catch (err) {
                logger.error("Error updating group profile picture:", err);
                await client.sendMessage(
                    groupId,
                    { text: "❌ Unable to update group profile picture. Make sure you are an admin." },
                    { quoted: message }
                );
            }
        } catch (error) {
            logger.error("Error executing setppgroup command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running setppgroup command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getPPArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🖼️─────────────────🖼️",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
