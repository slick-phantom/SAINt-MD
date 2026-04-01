import logger from "../utils/logger.js";

export default {
    name: "mediatag",
    description: "Send media while tagging all group members with optional caption",
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

            // Detect quoted media
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quotedMsg) {
                await client.sendMessage(
                    groupId,
                    {
                        text: `🎬 *MEDIATAG COMMAND*\n\nUsage:\n• Reply to a media message with: mediatag [caption]\n\nExamples:\n• (Reply to an image) mediatag Important update!\n• (Reply to a video) mediatag Watch this carefully.`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", groupId);

            const caption = args.join(" ") || "Media forwarded with hidden tags.";

            // Forward the quoted media while tagging everyone
            await client.sendMessage(
                groupId,
                {
                    forward: quotedMsg,
                    mentions: members,
                    caption: caption
                },
                { quoted: message }
            );

            await client.sendMessage(
                groupId,
                {
                    text: `
${getMediaTagArt()}
🎬 *MEDIA TAG REPORT*
${getMediaTagArt()}

✅ Media forwarded successfully.  
📝 Caption: ${caption}  
👥 All members tagged.

${getMediaTagArt()}
                    `.trim(),
                    mentions: members
                },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing mediatag command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running mediatag. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getMediaTagArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎬─────────────────🎬",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
