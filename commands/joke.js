import axios from 'axios';

export default {
    name: 'joke',
    description: 'Get a random joke to brighten your day',
    async execute(message, client, args) {
        try {
            // Show typing indicator
            await client.sendPresenceUpdate('composing', message.key.remoteJid);
            
            // Fetch a random joke from an API
            const response = await axios.get('https://v2.jokeapi.dev/joke/Any?safe-mode');
            const jokeData = response.data;
            
            let jokeText;
            
            if (jokeData.type === 'twopart') {
                jokeText = `😂 ${jokeData.setup}\n\n${jokeData.delivery}`;
            } else {
                jokeText = `😂 ${jokeData.joke}`;
            }
            
            // Format the joke with box styling
            const lines = jokeText.split('\n');
            const maxLineLength = Math.max(...lines.map(line => line.length));
            const boxWidth = Math.min(maxLineLength + 8, 40); // Limit width for WhatsApp
            
            // Create the box dynamically based on content
            let formattedJoke = `╔${'═'.repeat(boxWidth)}╗\n`;
            formattedJoke += `║${' '.repeat(Math.floor((boxWidth - 10) / 2))}😂 JOKE ${' '.repeat(Math.ceil((boxWidth - 10) / 2))}║\n`;
            formattedJoke += `╠${'═'.repeat(boxWidth)}╣\n`;
            
            // Add joke content
            for (const line of lines) {
                const padding = boxWidth - line.length - 2;
                const leftPadding = Math.floor(padding / 2);
                const rightPadding = Math.ceil(padding / 2);
                formattedJoke += `║${' '.repeat(leftPadding)}${line}${' '.repeat(rightPadding)}║\n`;
            }
            
            // Add footer
            formattedJoke += `╠${'═'.repeat(boxWidth)}╣\n`;
            formattedJoke += `║${' '.repeat(Math.floor((boxWidth - 22) / 2))}Hope that made you laugh!${' '.repeat(Math.ceil((boxWidth - 22) / 2))}║\n`;
            formattedJoke += `╚${'═'.repeat(boxWidth)}╝`;

            // Send the joke
            await client.sendMessage(message.key.remoteJid, { 
                text: formattedJoke 
            }, { 
                quoted: message 
            });
            
            // Log the joke command usage
            console.log(`Joke command executed by ${message.key.remoteJid} at ${new Date().toISOString()}`);
            
        } catch (error) {
            console.error('Error executing joke command:', error);
            
            // Send error message to user
            await client.sendMessage(message.key.remoteJid, { 
                text: '❌ Error fetching a joke. Please try again later.' 
            }, { 
                quoted: message 
            });
        }
    }
};