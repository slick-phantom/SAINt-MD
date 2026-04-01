import logger from "../utils/logger.js";

export default {
    name: "delsudo",
    description: "Remove a user from the sudo list",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide the user ID or number to remove from sudo." },
                    { quoted: message }
                );
                return;
            }

            const target = args[0];

            // Remove sudo user from DB
            const result = db.removeSudo(target);

            if (result) {
                const response = `
${getSudoArt()}
🗑️ *DELSUDO SUCCESSFUL*
${getSudoArt()}

✅ User \`${target}\` has been removed from the sudo list.  
⚡ They no longer have elevated permissions.

${getSudoArt()}
                `.trim();

                await client.sendMessage(
                    chatId,
                    { text: response },
                    { quoted: message }
                );
            } else {
                await client.sendMessage(
                    chatId,
                    { text: `❌ User \`${target}\` was not found in the sudo list.` },
                    { quoted: message }
                );
            }

        } catch (error) {
            logger.error("Error executing delsudo command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running delsudo command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getSudoArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🗑️─────────────────🗑️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
