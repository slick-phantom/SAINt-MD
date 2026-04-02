import logger from "../utils/logger.js";

export default {
    name: "antilink",
    description: "Enable or disable AntiLink protection in groups",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ AntiLink can only be enabled in group chats." },
                    { quoted: message }
                );
                return;
            }

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please specify `on` or `off` to enable/disable AntiLink." },
                    { quoted: message }
                );
                return;
            }

            const option = args[0].toLowerCase();
            if (option !== "on" && option !== "off") {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Invalid option. Use `antilink on` or `antilink off`." },
                    { quoted: message }
                );
                return;
            }

            // Save AntiLink setting in DB
            await db.set(`antilink_${chatId}`, option === "on");

            const response = `
${getAntiLinkArt()}
🔗 *ANTILINK COMMAND EXECUTED*
${getAntiLinkArt()}

✅ AntiLink has been turned *${option.toUpperCase()}* for this group.  
⚡ Links will now be ${option === "on" ? "detected and blocked automatically" : "ignored"}.

${getAntiLinkArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing antilink command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running antilink command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getAntiLinkArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔗─────────────────🔗",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
