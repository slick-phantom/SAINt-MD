// botinfo.js
// Command: Show detailed bot information

export default {
    name: "botinfo",
    description: "Display detailed information about the bot",
    ownerOnly: false,
    groupOnly: false,
    adminOnly: false,
    botAdminRequired: false,

    async execute(message, client, args) {
        const jid = message.key.remoteJid;

        const botInfo = {
            version: "1.0.0",
            features: [
                "User management",
                "Role assignment",
                "Playlist management",
                "Custom commands"
            ],
            developer: {
                name: "Dexxtiny",
                channel: "https://whatsapp.com/channel/0029VbCoGmm8kyyJg9kcBV3m"
            },
            statistics: {
                uptime: "12 hours",
                totalUsers: 500,
                totalCommandsUsed: 1500,
                feedbackScore: "4.8/5"
            },
            lastUpdated: "2026-04-01 16:26:11 UTC"
        };

        const infoText = `🤖 *Bot Information*\n
📌 Version: ${botInfo.version}
🛠 Features: ${botInfo.features.join(", ")}
👨‍💻 Developer: ${botInfo.developer.name}
🔗 Channel: ${botInfo.developer.channel}

📊 Statistics:
- Uptime: ${botInfo.statistics.uptime}
- Total Users: ${botInfo.statistics.totalUsers}
- Commands Used: ${botInfo.statistics.totalCommandsUsed}
- Feedback Score: ${botInfo.statistics.feedbackScore}

🕒 Last Updated: ${botInfo.lastUpdated}`;

        await client.sendMessage(jid, { text: infoText }, { quoted: message });
    }
};
