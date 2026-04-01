import logger from "../utils/logger.js";

export default {
    name: "poll",
    description: "Create a poll in the group",
    category: "group",

    async execute(message, client, args) {
        try {
            const groupId = message.key.remoteJid;

            if (!groupId.endsWith("@g.us")) {
                await client.sendMessage(
                    groupId,
                    { text: "❌ This command only works in groups." },
                    { quoted: message }
                );
                return;
            }

            if (args.length < 3) {
                await client.sendMessage(
                    groupId,
                    {
                        text: `📊 *POLL COMMAND*\n\nUsage:\n• poll [question] | [option1] | [option2] | [option3...]\n\nExample:\n• poll Best programming language? | JavaScript | Python | Go`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", groupId);

            // Split args into question and options
            const input = args.join(" ").split("|").map(s => s.trim());
            const question = input[0];
            const options = input.slice(1);

            if (options.length < 2) {
                await client.sendMessage(
                    groupId,
                    { text: "❌ Please provide at least two options for the poll." },
                    { quoted: message }
                );
                return;
            }

            await client.sendMessage(
                groupId,
                {
                    poll: {
                        name: question,
                        values: options
                    }
                },
                { quoted: message }
            );

            await client.sendMessage(
                groupId,
                {
                    text: `
${getPollArt()}
📊 *POLL CREATED*
${getPollArt()}

📝 Question: ${question}  
🔢 Options: ${options.join(", ")}

💡 Status: Poll launched successfully.
${getPollArt()}
                    `.trim()
                },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing poll command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error creating poll. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getPollArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📊─────────────────📊",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
