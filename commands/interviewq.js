import logger from "../utils/logger.js";

export default {
    name: "interviewq",
    description: "Generate interview questions (general, technical, behavioral, or mixed)",
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
                        text: `🎤 *INTERVIEWQ COMMAND*\n\nUsage:\n• interviewq [category]\n• Reply to any message with: interviewq\n\nAvailable categories: general, technical, behavioral, mixed\n\nExamples:\n• interviewq general\n• interviewq technical\n• interviewq behavioral\n• interviewq mixed`,
                    },
                    { quoted: message }
                );
                return;
            }

            const category = args[0].toLowerCase() || quotedText;

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate interview questions
            const result = await generateInterviewQuestions(category);

            const response = `
${getInterviewArt()}
🎤 *INTERVIEW QUESTIONS*
${getInterviewArt()}

📌 *Category:* ${category}

❓ *Sample Questions:*  
${result.map((q, i) => `${i + 1}. ${q}`).join("\n")}

${getInterviewArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing interviewq command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating interview questions. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Interview question generator
async function generateInterviewQuestions(category) {
    try {
        const general = [
            "Tell me about yourself.",
            "Why do you want to work here?",
            "What are your strengths and weaknesses?",
            "Where do you see yourself in five years?",
            "Why should we hire you?"
        ];

        const technical = [
            "Explain a complex technical problem you solved.",
            "What programming languages are you most comfortable with?",
            "How do you approach debugging?",
            "Describe your experience with databases.",
            "What’s your process for learning new technologies?"
        ];

        const behavioral = [
            "Describe a time you worked in a team.",
            "Tell me about a challenge you faced and how you overcame it.",
            "Give an example of when you showed leadership.",
            "How do you handle conflict at work?",
            "Describe a time you failed and what you learned."
        ];

        if (category === "general") return general;
        if (category === "technical") return technical;
        if (category === "behavioral") return behavioral;
        if (category === "mixed") {
            // Mix categories: 10 questions total
            return [
                ...general.slice(0, 3),
                ...technical.slice(0, 3),
                ...behavioral.slice(0, 4)
            ];
        }

        // Default fallback
        return general;
    } catch (error) {
        logger.error("Error generating interview questions:", error);
        return ["Unable to generate interview questions."];
    }
}

// Decorative art for interviewq messages
function getInterviewArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎤─────────────────🎤",
        "⊱──────── ❓ ────────⊰",
        "»»────── 💼 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
