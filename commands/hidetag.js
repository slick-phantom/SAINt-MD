import logger from "../utils/logger.js";

export default {
    name: "hidetag",
    description: "Tag all group members silently",
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

            const metadata = await client.groupMetadata(groupId);
            const members = metadata.participants.map(p => p.id);

            const announcement = args.join(" ") || "Hidden tag alert!";

            const response = `
${getHidetagArt()}
👤 *HIDETAG REPORT*
${getHidetagArt()}

📝 *Message:*  
${announcement}

💡 *Status:*  
All members tagged silently.

${getHidetagArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                {
                    text: response,
                    mentions: members
                },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing hidetag command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running hidetag. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getHidetagArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👤─────────────────👤",
        "⊱──────── 📢 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
