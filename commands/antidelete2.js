import logger from "../utils/logger.js";

export default {
    name: "antidelete2",
    description: "Enable or disable AntiDelete2 (recover deleted messages)",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ AntiDelete2 can only be enabled in group chats." },
                    { quoted: message }
                );
                return;
            }

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please specify `on` or `off` to enable/disable AntiDelete2." },
                    { quoted: message }
                );
                return;
            }

            const option = args[0].toLowerCase();
            if (option !== "on" && option !== "off") {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Invalid option. Use `antidelete2 on` or `antidelete2 off`." },
                    { quoted: message }
                );
                return;
            }

            // Save AntiDelete2 setting in DB
            await db.set(`antidelete2_${chatId}`, option === "on");

            const response = `
${getAntiDeleteArt()}
🛡 *ANTIDELETE2 COMMAND EXECUTED*
${getAntiDeleteArt()}

✅ AntiDelete2 has been turned *${option.toUpperCase()}* for this group.  
⚡ Deleted messages will now be ${option === "on" ? "recovered and shown again" : "ignored"}.

${getAntiDeleteArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing antidelete2 command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running antidelete2 command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getAntiDeleteArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🛡─────────────────🛡",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
