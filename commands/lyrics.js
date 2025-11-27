import axios from "axios";

export default {
    name: "lyrics",
    description: "Get song lyrics",
    category: "music",
    
    async execute(message, client, args) {
        try {
            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "🎵 *LYRICS FINDER*\n\nUsage: lyrics [song name or artist]\n\nExamples:\n• lyrics blinding lights\n• lyrics the weeknd\n• lyrics shape of you\n• lyrics remember asake",
                    },
                    { quoted: message }
                );
                return;
            }

            const query = args.join(" ");
            
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Use Sniper API search endpoint
            const response = await axios.get(
                `https://sniper-api-lyrics.onrender.com/api/lyrics/search?q=${encodeURIComponent(query)}`,
                {
                    timeout: 15000
                }
            );

            const lyricsData = response.data;
            
            if (!lyricsData.lyrics || lyricsData.error) {
                throw new Error('No lyrics found');
            }

            // Truncate lyrics if too long for WhatsApp
            const truncatedLyrics = lyricsData.lyrics.length > 3500 
                ? lyricsData.lyrics.substring(0, 3500) + "...\n\n📖 *Lyrics were truncated due to length*" 
                : lyricsData.lyrics;

            const lyricsMessage = `
🎵 *${lyricsData.title || query.toUpperCase()}*

👤 *Artist:* ${lyricsData.artist || 'Unknown'}

${truncatedLyrics}

🔗 _Provided by Sniper APIs_
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: lyricsMessage,
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing lyrics command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: `❌ Could not find lyrics for: "${args.join(' ')}"\n\n💡 Try:\n• Different spelling\n• Just the song name\n• Just the artist name\n• Part of the song title`,
                },
                { quoted: message }
            );
        }
    },
};