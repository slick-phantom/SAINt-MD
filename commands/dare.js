[file name]: dare.js
[file content begin]
import axios from "axios";

export default {
    name: "dare",
    description: "Get random dare challenges from API",
    category: "fun",
    
    async execute(message, client, args) {
        try {
            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Get dare from Truth or Dare API
            const response = await axios.get(
                "https://api.truthordarebot.xyz/v1/dare",
                {
                    timeout: 10000
                }
            );

            const dare = response.data;
            
            const dareMessage = `
${getDareArt()}

🎯 *DARE CHALLENGE* 🎯

${dare.question}

📊 Rating: ${dare.rating}
🎪 Type: ${dare.type}

💡 Complete this dare and tag the person who gave it to you!
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: dareMessage,
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing dare command:', error);
            
            // Fallback dares if API fails
            const fallbackDares = [
                "Do 10 pushups right now and send a video!",
                "Send the last emoji you used to the group",
                "Tell an embarrassing story about yourself",
                "Speak in an accent for the next 3 messages",
                "Send a voice note singing your favorite song",
                "Let the group choose your profile picture for 24 hours"
            ];
            
            const randomDare = fallbackDares[Math.floor(Math.random() * fallbackDares.length)];
            
            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: `🎯 *DARE CHALLENGE*\n\n${randomDare}\n\n💡 Complete this dare!`,
                },
                { quoted: message }
            );
        }
    },
};

// ASCII art for dare
function getDareArt() {
    const arts = [
        "🎯 ━━━━━━━━━━━━━━━━━ 🎯",
        "🔥 ⋅⋅⋅⋅⋅ DARE ⋅⋅⋅⋅⋅ 🔥",
        "⚡ ─────────────────── ⚡"
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
[file content end]