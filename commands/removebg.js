import axios from "axios";
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
    name: "removebg",
    description: "Remove background from images",
    category: "tools",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;
            let imageUrl = null;
            
            // Check if args contain a URL
            if (args.length > 0) {
                const url = args.join(' ');
                if (isValidUrl(url)) {
                    imageUrl = url;
                } else {
                    return await client.sendMessage(chatId, { 
                        text: '❌ Invalid URL provided.\n\nUsage: removebg https://example.com/image.jpg' 
                    }, { quoted: message });
                }
            } else {
                // Try to get image from message or quoted message
                imageUrl = await getQuotedOrOwnImageUrl(client, message);
                
                if (!imageUrl) {
                    return await client.sendMessage(chatId, { 
                        text: '📸 *Remove Background Command*\n\nUsage:\n• removebg <image_url>\n• Reply to an image with removebg\n• Send image with removebg\n\nExample: removebg https://example.com/image.jpg' 
                    }, { quoted: message });
                }
            }

            // Send processing message
            await client.sendMessage(chatId, {
                text: '🔄 Removing background... This may take a few seconds.'
            }, { quoted: message });

            // Call the remove background API
            const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageUrl)}`;
            
            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.status === 200 && response.data) {
                // Send the processed image
                await client.sendMessage(chatId, {
                    image: response.data,
                    caption: '✨ *Background removed successfully!*\n\nTransparent PNG image ready to use.'
                }, { quoted: message });
            } else {
                throw new Error('Failed to process image');
            }

        } catch (error) {
            console.error('RemoveBG Error:', error.message);
            
            let errorMessage = '❌ Failed to remove background.';
            
            if (error.response?.status === 429) {
                errorMessage = '⏰ Rate limit exceeded. Please try again later.';
            } else if (error.response?.status === 400) {
                errorMessage = '❌ Invalid image URL or format.';
            } else if (error.response?.status === 500) {
                errorMessage = '🔧 Server error. Please try again later.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = '⏰ Request timeout. Please try again.';
            } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
                errorMessage = '🌐 Network error. Please check your connection.';
            }
            
            await client.sendMessage(chatId, { 
                text: errorMessage 
            }, { quoted: message });
        }
    }
};

// Helper function to get image from message or quoted message
async function getQuotedOrOwnImageUrl(client, message) {
    try {
        // 1) Quoted image (highest priority)
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted?.imageMessage) {
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            // Upload to telegra.ph for URL
            return await uploadToTelegraph(buffer);
        }

        // 2) Image in the current message
        if (message.message?.imageMessage) {
            const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            return await uploadToTelegraph(buffer);
        }

        return null;
    } catch (error) {
        console.error('Error getting image URL:', error);
        return null;
    }
}

// Upload image to telegra.ph to get URL
async function uploadToTelegraph(buffer) {
    try {
        const formData = new FormData();
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        formData.append('file', blob);
        
        const response = await axios.post('https://telegra.ph/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 15000
        });
        
        if (response.data && response.data[0] && response.data[0].src) {
            return `https://telegra.ph${response.data[0].src}`;
        }
        return null;
    } catch (error) {
        console.error('Upload to telegraph failed:', error);
        return null;
    }
}

// Helper function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}