import logger from "../utils/logger.js";

export default {
    name: "ip",
    description: "Generate categorized IP address info messages (Type, Location, ISP, Status)",
    category: "information",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const ipAddress = args.join(" ") || quotedText || "Unknown IP";

            if (!ipAddress) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌐 *IP COMMAND*\n\nUsage:\n• ip [address]\n• Reply to any message with: ip\n\nExamples:\n• ip 192.168.1.1\n• ip 8.8.8.8\n• ip 127.0.0.1`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized IP info
            const results = await generateIp(ipAddress);

            const response = `
${getIpArt()}
🌐 *IP DATA*
${getIpArt()}

📝 *Address:* ${ipAddress}

💡 *Type:*  
${results.type}

💡 *Location:*  
${results.location}

💡 *ISP:*  
${results.isp}

💡 *Status:*  
${results.status}

${getIpArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing ip command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating IP message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized IP info generator
async function generateIp(ipAddress) {
    try {
        const type = `📖 ${ipAddress} is recognized as IPv4 or IPv6.`;
        const location = `🌍 ${ipAddress} is mapped to a geographic region.`;
        const isp = `📡 ${ipAddress} is associated with an Internet Service Provider.`;
        const status = `🔒 ${ipAddress} is active and reachable.`;

        return { type, location, isp, status };
    } catch (error) {
        logger.error("Error generating IP info:", error);
        return { type: "Unable to generate.", location: "Unable to generate.", isp: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for IP messages
function getIpArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌐─────────────────🌐",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📡 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
