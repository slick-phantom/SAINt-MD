import logger from "../utils/logger.js";

export default {
    name: "programming",
    description: "Generate categorized programming snippets (Beginner, Intermediate, Advanced)",
    category: "coding",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `💻 *PROGRAMMING COMMAND*\n\nUsage:\n• programming [topic]\n• Reply to any message with: programming\n\nExamples:\n• programming JavaScript loop\n• programming Python function\n• programming SQL query`,
                    },
                    { quoted: message }
                );
                return;
            }

            const topic = args.join(" ") || quotedText;

            if (!topic) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No topic provided. Please type a programming topic or reply to a message with: programming",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized snippets
            const results = await generateProgrammingSnippets(topic);

            const response = `
${getProgrammingArt()}
💻 *PROGRAMMING SNIPPETS*
${getProgrammingArt()}

📝 *Topic:* ${topic}

💡 *Beginner:*  
${results.beginner}

💡 *Intermediate:*  
${results.intermediate}

💡 *Advanced:*  
${results.advanced}

${getProgrammingArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing programming command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating programming snippets. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized programming snippet generator
async function generateProgrammingSnippets(topic) {
    try {
        const beginner = `Python Example:\n\ndef greet(name):\n    print("Hello", name)\n\ngreet("Destiny")`;
        const intermediate = `JavaScript Example:\n\nfunction factorial(n) {\n  if (n === 0) return 1;\n  return n * factorial(n - 1);\n}\nconsole.log(factorial(5));`;
        const advanced = `SQL Example:\n\nWITH ranked_sales AS (\n  SELECT product_id, SUM(amount) AS total,\n         RANK() OVER (ORDER BY SUM(amount) DESC) AS rank\n  FROM sales\n  GROUP BY product_id\n)\nSELECT * FROM ranked_sales WHERE rank <= 3;`;

        return { beginner, intermediate, advanced };
    } catch (error) {
        logger.error("Error generating programming snippets:", error);
        return { beginner: "Unable to generate.", intermediate: "Unable to generate.", advanced: "Unable to generate." };
    }
}

// Decorative art for programming messages
function getProgrammingArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "💻─────────────────💻",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🔧 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
