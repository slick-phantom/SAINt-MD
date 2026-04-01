import logger from "../utils/logger.js";

export default {
    name: "truthdetector",
    description: "Detect truth or lie in a playful way",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const statement = args.join(" ") || quotedText || "Unknown statement";

            if (!statement) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🔍 *TRUTHDETECTOR COMMAND*\n\nUsage:\n• truthdetector [statement]\n• Reply to any message with: truthdetector\n\nExamples:\n• truthdetector I love coding\n• truthdetector Cats can fly\n• truthdetector Today is lucky`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const results = await detectTruth(statement);

            const response = `
${getTruthArt()}
🔍 *TRUTHDETECTOR REPORT*
${getTruthArt()}

📝 *Statement:* ${statement}

💡 *Verdict:*  
${results.verdict}

💡 *Confidence:*  
${results.confidence}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getTruthArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing truthdetector command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running truthdetector. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

async function detectTruth(statement) {
    try {
        const verdicts = [
            "✅ Truth detected!",
            "❌ Lie detected!",
            "🤔 Unclear, could be either.",
            "⚖️ Half-truth spotted."
        ];
        const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];

        const confidence = "Confidence level: Medium 🔄";
        const mood = "Playful and lighthearted.";
        const status = "For fun only — not scientific.";

        return { verdict, confidence, mood, status };
    } catch (error) {
        logger.error("Error generating truthdetector info:", error);
        return { verdict: "Unable to detect.", confidence: "N/A", mood: "N/A", status: "N/A" };
    }
}

function getTruthArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔍─────────────────🔍",
        "⊱──────── ✅ ────────⊰",
        "»»────── ❌ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
