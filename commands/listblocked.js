import logger from "../utils/logger.js";

export default {
    name: "listblocked",
    description: "Show all users currently blocked by the bot",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            // Fetch blocked contacts
            const blockedContacts = await client.fetchBlocklist();

            if (!blockedContacts || blockedContacts.length === 0) {
                await client.sendMessage(
                    chatId,
                    { text: "✅ No users are currently blocked." },
                    { quoted: message }
                );
                return;
            }

            const blockedList = blockedContacts
                .map((user, index) => `🔹 ${index + 1}. ${user.split("@")[0]}`)
                .join("\n");

            const response = `
${getListBlockedArt()}
🚫 *BLOCKED USERS LIST*
${getListBlockedArt()}

${blockedList}

⚡ Total blocked: *${blockedContacts.length}*

${getListBlockedArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing listblocked command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running listblocked command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getListBlockedArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🚫─────────────────🚫",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
