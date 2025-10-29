import axios from "axios";

export default {
    name: "fact",
    description: "Get random interesting facts",
    category: "education",
    
    async execute(message, client, args) {
        try {
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const response = await axios.get(
                "https://uselessfacts.jsph.pl/random.json?language=en",
                {
                    timeout: 10000
                }
            );

            const fact = response.data;
            
            const factMessage = `
🧠 *RANDOM FACT*

${fact.text}

📚 _Source: ${fact.source}_
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: factMessage,
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing fact command:', error);
            
            const fallbackFacts = [
                "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
                "Octopuses have three hearts. Two pump blood through the gills, while the third pumps it through the rest of the body.",
                "Bananas are berries, but strawberries aren't.",
                "A day on Venus is longer than a year on Venus. It takes Venus 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.",
                "The shortest war in history was between Britain and Zanzibar in 1896. It lasted only 38 minutes."
            ];
            
            const randomFact = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
            
            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: `🧠 *RANDOM FACT*\n\n${randomFact}`,
                },
                { quoted: message }
            );
        }
    },
};