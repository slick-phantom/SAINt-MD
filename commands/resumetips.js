import logger from "../utils/logger.js";

export default {
    name: "resumetips",
    description: "Generate categorized resume improvement tips (Content, Formatting, Impact)",
    category: "career",

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
                        text: `📄 *RESUMETIPS COMMAND*\n\nUsage:\n• resumetips [role/industry]\n• Reply to any message with: resumetips\n\nExamples:\n• resumetips Software Engineer\n• resumetips Marketing Manager\n• resumetips Data Analyst`,
                    },
                    { quoted: message }
                );
                return;
            }

            const role = args.join(" ") || quotedText;

            if (!role) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No role/industry provided. Please type a role or reply to a message with: resumetips",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized resume tips
            const results = await generateResumeTips(role);

            const response = `
${getResumeArt()}
📄 *RESUME TIPS*
${getResumeArt()}

📝 *Role/Industry:* ${role}

💡 *Content:*  
${results.content}

💡 *Formatting:*  
${results.formatting}

💡 *Impact:*  
${results.impact}

${getResumeArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing resumetips command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating resume tips. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized resume tips generator
async function generateResumeTips(role) {
    try {
        const content = `Highlight measurable achievements in ${role}, not just responsibilities — numbers and results stand out.`;
        const formatting = `Keep your ${role} resume clean with consistent fonts, bullet points, and clear section headings.`;
        const impact = `Tailor your ${role} resume to each job description, emphasizing skills and experiences that match the role.`;

        return { content, formatting, impact };
    } catch (error) {
        logger.error("Error generating resume tips:", error);
        return { content: "Unable to generate.", formatting: "Unable to generate.", impact: "Unable to generate." };
    }
}

// Decorative art for resumetips messages
function getResumeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📄─────────────────📄",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📝 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
