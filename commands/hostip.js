import logger from "../utils/logger.js";
import os from "os";

export default {
    name: "hostip",
    description: "Show the host machine's IP address",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            // Get network interfaces
            const interfaces = os.networkInterfaces();
            let ipAddresses = [];

            for (const name of Object.keys(interfaces)) {
                for (const iface of interfaces[name]) {
                    if (iface.family === "IPv4" && !iface.internal) {
                        ipAddresses.push(iface.address);
                    }
                }
            }

            if (ipAddresses.length === 0) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ No external IPv4 address found." },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getHostIPArt()}
🌐 *HOST IP INFORMATION*
${getHostIPArt()}

✅ Host machine IP(s):  
${ipAddresses.map(ip => `📌 ${ip}`).join("\n")}

⚡ Useful for debugging and server checks.

${getHostIPArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing hostip command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running hostip command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getHostIPArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌐─────────────────🌐",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
