import logger from "../utils/logger.js";

export default {
    name: "antibot",
    description: "Enable or disable anti-bot protection in groups",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ AntiBot can only be enabled in group chats." },
                    { quoted: message }
                );
                return;
            }

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please specify `on` or `off` to enable/disable AntiBot." },
                    { quoted: message }
                );
                return;
            }

            const option = args[0].toLowerCase();
            if (option !== "on" && option !== "off") {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Invalid option. Use `antibot on` or `antibot off`." },
                    { quoted: message }
                );
                return;
            }

            // Save AntiBot setting in DB
            await db.set(`antibot_${chatId}`, option === "on");

            const response = `
${getAntiBotArt()}
🤖 *ANTIBOT COMMAND EXECUTED*
${getAntiBotArt()}

✅ AntiBot has been turned *${option.toUpperCase()}* for this group.  
⚡ Bots joining will now be ${option === "on" ? "detected and removed automatically" : "ignored"}.

${getAntiBotArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing antibot command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running antibot command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getAntiBotArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🤖─────────────────🤖",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
