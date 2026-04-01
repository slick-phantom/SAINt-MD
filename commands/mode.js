import logger from "../utils/logger.js";

export default {
    name: "mode",
    description: "Switch bot operating mode (public/private/group-only)",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please specify a mode: `public`, `private`, or `group`." },
                    { quoted: message }
                );
                return;
            }

            const mode = args[0].toLowerCase();

            if (!["public", "private", "group"].includes(mode)) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Invalid mode. Available options: `public`, `private`, `group`." },
                    { quoted: message }
                );
                return;
            }

            // Save mode in DB
            db.setConfig("botMode", mode);

            const response = `
${getModeArt()}
⚙️ *MODE CHANGED*
${getModeArt()}

✅ Bot mode is now set to: *${mode.toUpperCase()}*  
⚡ Active until changed again.

${getModeArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing mode command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running mode command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getModeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "⚙️─────────────────⚙️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
