import logger from "../utils/logger.js";

export default {
    name: "cleanmode",
    description: "Enable or disable CleanMode (auto-delete bot messages)",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please specify `on` or `off` to enable/disable CleanMode." },
                    { quoted: message }
                );
                return;
            }

            const option = args[0].toLowerCase();
            if (option !== "on" && option !== "off") {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Invalid option. Use `cleanmode on` or `cleanmode off`." },
                    { quoted: message }
                );
                return;
            }

            // Save CleanMode setting in DB
            await db.set(`cleanmode_${chatId}`, option === "on");

            const response = `
${getCleanArt()}
🧹 *CLEANMODE COMMAND EXECUTED*
${getCleanArt()}

✅ CleanMode has been turned *${option.toUpperCase()}* for this chat.  
⚡ Bot messages will now be ${option === "on" ? "auto-deleted after a short delay" : "kept normally"}.

${getCleanArt()}
            `.trim();

            const sentMsg = await client.sendMessage(chatId, { text: response }, { quoted: message });

            // If CleanMode is ON, auto-delete after 10 seconds
            if (option === "on") {
                setTimeout(async () => {
                    try {
                        await client.sendMessage(chatId, { delete: sentMsg.key });
                    } catch (err) {
                        logger.error("Error auto-deleting message in CleanMode:", err);
                    }
                }, 10000);
            }

        } catch (error) {
            logger.error("Error executing cleanmode command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running cleanmode command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getCleanArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🧹─────────────────🧹",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
