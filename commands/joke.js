import axios from "axios";

export default {
    name: "joke",
    description: "Get a random joke",
    category: "fun",
    
    async execute(message, client, args) {
        try {
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const response = await axios.get(
                "https://sniper-api-dsye.onrender.com/api/joke/random",
                {
                    timeout: 10000
                }
            );

            const jokeData = response.data;
            
            if (!jokeData.joke) {
                throw new Error('No joke received from API');
            }

            const jokeMessage = `
😂 *RANDOM JOKE*

${jokeData.joke}

🔗 _Provided by Sniper APIs_
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: jokeMessage,
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing joke command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Failed to fetch a joke. Please try again later!",
                },
                { quoted: message }
            );
        }
    },
};