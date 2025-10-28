[file name]: song.js
[file content begin]
import axios from "axios";
import fs from "fs";
import { promisify } from "util";
import { exec } from "child_process";
const execAsync = promisify(exec);

export default {
    name: "song",
    description: "Download and send any song",
    category: "music",
    
    async execute(message, client, args) {
        try {
            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "🎵 *SONG DOWNLOADER*\n\nUsage: song [song name]\n\nExamples:\n• song shape of you ed sheeran\n• song asake remember\n• song oliver twist\n• song latest burna boy",
                    },
                    { quoted: message }
                );
                return;
            }

            const query = args.join(" ");
            
            // Show typing indicator
            await client.sendMessage(
                message.key.remoteJid,
                { text: "🔍 Searching for: " + query + "\n⏳ Downloading..." },
                { quoted: message }
            );

            // Download the song
            const songPath = await downloadSong(query);

            if (!songPath) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ Could not download: " + query + "\n\nTry a different song name or check spelling.",
                    },
                    { quoted: message }
                );
                return;
            }

            // Read the audio file
            const audioBuffer = fs.readFileSync(songPath);

            // Send the audio file
            await client.sendMessage(
                message.key.remoteJid,
                {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    fileName: `${query.replace(/[^a-z0-9]/gi, '_')}.mp3`,
                    ptt: false
                },
                { quoted: message }
            );

            // Clean up the file
            fs.unlinkSync(songPath);

        } catch (error) {
            console.error('Error executing song command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error downloading song. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Download song using yt-dlp
async function downloadSong(query) {
    try {
        const tempDir = './temp_songs';
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const fileName = `song_${Date.now()}`;
        const filePath = `${tempDir}/${fileName}.mp3`;

        // Search and download using yt-dlp
        const command = `yt-dlp --extract-audio --audio-format mp3 --audio-quality 0 --output "${tempDir}/${fileName}.%(ext)s" "ytsearch1:${query}" --force-overwrites --no-playlist`;
        
        await execAsync(command, { timeout: 60000 }); // 60 second timeout

        // Check if file was created
        if (fs.existsSync(filePath)) {
            return filePath;
        }

        // Try alternative filename pattern
        const altPath = `${tempDir}/${fileName}.m4a`;
        if (fs.existsSync(altPath)) {
            return altPath;
        }

        return null;

    } catch (error) {
        console.error('Error downloading song:', error);
        return null;
    }
}

// Alternative method using external API (if yt-dlp fails)
async function downloadSongAlternative(query) {
    try {
        // You can integrate with APIs like:
        // - Deezer API
        // - Spotify downloader APIs  
        // - YouTube Music API
        // - JioSaavn API (for Indian songs)
        
        // Example placeholder - implement based on available API
        const response = await axios.get(`https://api.example.com/download?q=${encodeURIComponent(query)}`, {
            timeout: 30000,
            responseType: 'stream'
        });

        const tempPath = `./temp_songs/song_${Date.now()}.mp3`;
        const writer = fs.createWriteStream(tempPath);
        
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(tempPath));
            writer.on('error', reject);
        });
        
    } catch (error) {
        console.error('Alternative download failed:', error);
        return null;
    }
}
[file content end]