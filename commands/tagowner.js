import logger from "../utils/logger.js";

export default {
    name: "tagowner",
    description: "Tag the group owner with a custom message",
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

            await client.sendPresenceUpdate("composing", groupId);

            const metadata = await client.groupMetadata(groupId);
            const ownerId = metadata.owner;

            if (!ownerId) {
                await client.sendMessage(
                    groupId,
                    { text: "❌ No owner found for this group." },
                    { quoted: message }
                );
                return;
            }

            const customMessage = args.length > 0 
                ? args.join(" ") 
                : "👑 Tagging the group owner...";

            const response = `
${getOwnerArt()}
👑 *GROUP OWNER TAG ALERT*
${getOwnerArt()}

📝 Message:  
${customMessage}

👑 Owner tagged successfully.
${getOwnerArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                {
                    text: response,
                    mentions: [ownerId]
                },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing tagowner command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running tagowner command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getOwnerArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👑─────────────────👑",
        "⊱──────── 📢 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
