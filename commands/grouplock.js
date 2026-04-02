import logger from "../utils/logger.js";

export default {
    name: "grouplock",
    description: "Lock or unlock group so only admins can send messages",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ GroupLock can only be used in group chats." },
                    { quoted: message }
                );
                return;
            }

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please specify `lock` or `unlock` to restrict or allow group messaging." },
                    { quoted: message }
                );
                return;
            }

            const option = args[0].toLowerCase();
            if (option !== "lock" && option !== "unlock") {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Invalid option. Use `grouplock lock` or `grouplock unlock`." },
                    { quoted: message }
                );
                return;
            }

            // Lock or unlock group
            await client.groupSettingUpdate(chatId, option === "lock" ? "announcement" : "not_announcement");

            const response = `
${getGroupLockArt()}
🔒 *GROUPLOCK COMMAND EXECUTED*
${getGroupLockArt()}

✅ Group has been *${option.toUpperCase()}ED*.  
⚡ ${option === "lock" ? "Only admins can send messages now." : "All members can send messages again."}

${getGroupLockArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing grouplock command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running grouplock command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getGroupLockArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔒─────────────────🔒",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
