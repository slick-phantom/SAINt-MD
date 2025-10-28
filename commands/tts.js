import axios from "axios";
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export default {
    name: "tts",
    description: "Convert text to speech audio",
    category: "utility",
    async execute(message, client, args) {
        try {
            // Show typing indicator
            await client.sendPresenceUpdate('composing', message.key.remoteJid);
            
            // Check if text was provided
            if (!args || args.length === 0) {
                await client.sendMessage(message.key.remoteJid, { 
                    text: '❌ Please provide text to convert to speech.\n\nExample: !tts Hello how are you?' 
                }, { 
                    quoted: message 
                });
                return;
            }
            
            const text = args.join(" ");
            
            // Limit text length to avoid abuse
            if (text.length > 200) {
                await client.sendMessage(message.key.remoteJid, { 
                    text: '❌ Text too long. Please keep it under 200 characters.' 
                }, { 
                    quoted: message 
                });
                return;
            }
            
            // Ensure temp directory exists
            const tempDir = join(process.cwd(), 'temp');
            if (!existsSync(tempDir)) {
                mkdirSync(tempDir, { recursive: true });
            }
            
            // Generate TTS audio
            const audioBuffer = await generateTTS(text);
            const filePath = join(tempDir, `${Date.now()}.mp3`);
            
            // Save temporarily
            writeFileSync(filePath, audioBuffer);
            
            // Send as audio message
            await client.sendMessage(message.key.remoteJid, {
                audio: { url: filePath },
                mimetype: 'audio/mpeg',
                ptt: true, // Push-to-talk (voice message)
            }, {
                quoted: message
            });
            
            // Clean up after a delay
            setTimeout(() => {
                try {
                    if (existsSync(filePath)) {
                        unlinkSync(filePath);
                    }
                } catch (error) {
                    console.error('Error deleting temp file:', error);
                }
            }, 5000);
            
        } catch (error) {
            console.error('Error executing TTS command:', error);
            
            await client.sendMessage(message.key.remoteJid, { 
                text: '❌ Error generating speech. Please try again later.' 
            }, { 
                quoted: message 
            });
        }
    }
};

// Generate TTS using Google's API
async function generateTTS(text) {
    try {
        // Google TTS API endpoint
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
        
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Error generating TTS:', error);
        throw new Error('TTS generation failed');
    }
}