import logger from "../utils/logger.js";

export default {
    name: "goalplan",
    description: "Generate a structured plan to achieve a goal",
    category: "tools",

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
                        text: `🎯 *GOALPLAN COMMAND*\n\nUsage:\n• goalplan [goal]\n• Reply to any message with: goalplan\n\nExamples:\n• goalplan Learn web development\n• goalplan Start a fitness routine\n• goalplan Save money for a car`,
                    },
                    { quoted: message }
                );
                return;
            }

            const goal = args.join(" ") || quotedText;

            if (!goal) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No goal provided. Please add a goal or reply to a message with: goalplan",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate goal plan
            const result = await generateGoalPlan(goal);

            const response = `
${getGoalArt()}
🎯 *GOAL PLAN*
${getGoalArt()}

🏆 *Goal:* ${goal}

1️⃣ *Define Objective*  
${result.objective}

2️⃣ *Steps to Achieve*  
${result.steps}

3️⃣ *Timeline*  
${result.timeline}

4️⃣ *Resources Needed*  
${result.resources}

5️⃣ *Motivation*  
${result.motivation}

${getGoalArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing goalplan command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating goal plan. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Simple goal plan generator
async function generateGoalPlan(goal) {
    try {
        return {
            objective: `Clearly define what "${goal}" means to you.`,
            steps: `Break down "${goal}" into small, actionable tasks.`,
            timeline: `Set a realistic timeline (e.g., 3–6 months).`,
            resources: `Books, online courses, mentors, or savings depending on "${goal}".`,
            motivation: `Remind yourself daily why "${goal}" matters to you.`,
        };
    } catch (error) {
        logger.error("Error generating goal plan:", error);
        return {
            objective: "Unable to generate objective.",
            steps: "Unable to generate steps.",
            timeline: "Unable to generate timeline.",
            resources: "Unable to generate resources.",
            motivation: "Unable to generate motivation.",
        };
    }
}

// Decorative art for goalplan messages
function getGoalArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎯─────────────────🎯",
        "⊱──────── 🏆 ────────⊰",
        "»»────── 📈 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
