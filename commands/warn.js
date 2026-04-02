import logger from "../utils/logger.js";

export default {
    name: "warn",
    description: "Issue a warning to a specific user",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Warn command can only be used in group chats." },
                    { quoted: message }
                );
                return;
            }

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide the number or mention the user you want to warn." },
                    { quoted: message }
                );
                return;
            }

            const targetNumber = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

            // Fetch existing warnings
            let warns = await db.get(`warns_${chatId}`) || [];

            // Add new warning
            warns.push({ user: targetNumber, date: new Date().toISOString() });
            await db.set(`warns_${chatId}`, warns);

            const response = `
${getWarnArt()}
⚠️ *WARN COMMAND EXECUTED*
${getWarnArt()}

✅ Warning issued successfully.  
📌 Target: *${args[0]}*  
⚡ Total warnings for this user: *${warns.filter(w => w.user === targetNumber).length}*

${getWarnArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing warn command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running warn command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getWarnArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "⚠️─────────────────⚠️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
