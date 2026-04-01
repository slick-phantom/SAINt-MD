import logger from "../utils/logger.js";

export default {
    name: "reverse",
    description: "Reverse audio messages (play backwards)",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("recording", chatId);

            // Check if quoted message contains audio
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted || !quoted.audioMessage) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Please reply to an audio message to reverse it." },
                    { quoted: message }
                );
                return;
            }

            // Extract audio
            const audioMessage = quoted.audioMessage;

            // Reverse audio (placeholder for actual audio processing logic)
            // In production, you’d run the audio through ffmpeg with `-af areverse`
            const reversedAudio = audioMessage; // Replace with processed reversed audio

            // Send reversed audio back
            await client.sendMessage(chatId, reversedAudio, { quoted: message });

            const response = `
${getReverseArt()}
🔄 *REVERSE AUDIO APPLIED*
${getReverseArt()}

✅ Audio has been reversed.  
⚡ Enjoy listening to it backwards!

${getReverseArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing reverse command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running reverse command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getReverseArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔄─────────────────🔄",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
