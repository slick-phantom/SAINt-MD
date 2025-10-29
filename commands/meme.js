import axios from "axios";

export default {
    name: "meme",
    description: "Get random memes or create custom memes",
    category: "fun",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;

            // If no args, send random meme
            if (!args || args.length === 0) {
                return await sendRandomMeme(client, chatId, message);
            }

            // If args provided, try to create custom meme
            if (args[0]?.toLowerCase() === 'create' && args.length >= 3) {
                return await createCustomMeme(client, chatId, message, args.slice(1));
            }

            // Show help
            await client.sendMessage(chatId, {
                text: `😂 *MEME COMMAND*\n\nGet random memes:\n• meme\n\nCreate custom meme:\n• meme create [template] [top text] | [bottom text]\n\nExamples:\n• meme\n• meme create drake "good option" | "bad option"\n• meme create doge "such wow" | "very amazing"`
            }, { quoted: message });

        } catch (error) {
            console.error('Meme command error:', error);
            await client.sendMessage(chatId, {
                text: "❌ Failed to get meme. Please try again later."
            }, { quoted: message });
        }
    }
};

async function sendRandomMeme(client, chatId, message) {
    try {
        await client.sendPresenceUpdate("composing", chatId);

        // Get random meme from API
        const response = await axios.get(
            "https://meme-api.com/gimme",
            {
                timeout: 15000
            }
        );

        const meme = response.data;
        
        // Download meme image
        const imageResponse = await axios.get(meme.url, {
            responseType: 'arraybuffer',
            timeout: 15000
        });

        const imageBuffer = Buffer.from(imageResponse.data);

        await client.sendMessage(chatId, {
            image: imageBuffer,
            caption: `😂 *MEME*\n\n📛 Title: ${meme.title}\n👤 Author: u/${meme.author}\n🔗 Source: ${meme.postLink}\n🎯 Subreddit: r/${meme.subreddit}`
        }, { quoted: message });

    } catch (error) {
        console.error('Random meme error:', error);
        
        // Fallback: Use alternative meme API
        try {
            const fallbackResponse = await axios.get(
                "https://some-random-api.com/meme",
                {
                    timeout: 10000
                }
            );

            const fallbackMeme = fallbackResponse.data;
            const fallbackImage = await axios.get(fallbackMeme.image, {
                responseType: 'arraybuffer'
            });

            await client.sendMessage(chatId, {
                image: Buffer.from(fallbackImage.data),
                caption: `😂 *MEME*\n\n📛 ${fallbackMeme.caption || 'Random Meme'}\n💬 ${fallbackMeme.category || 'Funny'}`
            }, { quoted: message });

        } catch (fallbackError) {
            console.error('Fallback meme also failed:', fallbackError);
            throw new Error('All meme APIs failed');
        }
    }
}

async function createCustomMeme(client, chatId, message, args) {
    try {
        await client.sendPresenceUpdate("composing", chatId);

        const template = args[0].toLowerCase();
        const text = args.slice(1).join(' ');
        
        // Split text into top and bottom parts
        const parts = text.split('|').map(part => part.trim());
        const topText = parts[0] || '';
        const bottomText = parts[1] || '';

        if (!topText) {
            await client.sendMessage(chatId, {
                text: "❌ Please provide text for the meme!\n\nExample: meme create drake 'good idea' | 'bad idea'"
            }, { quoted: message });
            return;
        }

        // Available meme templates
        const templates = {
            'drake': 'drake',
            'doge': 'doge',
            'distracted': 'distracted-boyfriend',
            'button': 'button',
            'exit': 'one-does-not-simply',
            'changemind': 'change-my-mind',
            'facts': 'uno-draw-25',
            'patrick': 'patrick',
            'spongebob': 'spongebob',
            'womanyelling': 'woman-yelling-at-cat'
        };

        const templateId = templates[template] || template;

        // Generate meme using imgflip API or similar
        const memeUrl = await generateCustomMeme(templateId, topText, bottomText);

        if (memeUrl) {
            const imageResponse = await axios.get(memeUrl, {
                responseType: 'arraybuffer',
                timeout: 15000
            });

            await client.sendMessage(chatId, {
                image: Buffer.from(imageResponse.data),
                caption: `🎨 *CUSTOM MEME*\n\n📝 Template: ${template}\n🔤 Top: ${topText}${bottomText ? `\n🔤 Bottom: ${bottomText}` : ''}`
            }, { quoted: message });
        } else {
            throw new Error('Meme generation failed');
        }

    } catch (error) {
        console.error('Custom meme error:', error);
        await client.sendMessage(chatId, {
            text: "❌ Failed to create custom meme. The template might not exist or the service is down.\n\nAvailable templates: drake, doge, distracted, button, exit, changemind, facts, patrick, spongebob, womanyelling"
        }, { quoted: message });
    }
}

async function generateCustomMeme(templateId, topText, bottomText) {
    try {
        // Using imgflip API (free tier available)
        const response = await axios.post('https://api.imgflip.com/caption_image', new URLSearchParams({
            template_id: getTemplateId(templateId),
            username: 'imgflip_hub', // Free public account
            password: 'imgflip_hub',
            text0: topText,
            text1: bottomText
        }), {
            timeout: 20000
        });

        if (response.data.success) {
            return response.data.data.url;
        }
        return null;
    } catch (error) {
        console.error('Imgflip API error:', error);
        return null;
    }
}

function getTemplateId(templateName) {
    const templateIds = {
        'drake': '181913649',
        'doge': '8072285',
        'distracted-boyfriend': '112126428',
        'button': '87743020',
        'one-does-not-simply': '61579',
        'change-my-mind': '129242436',
        'uno-draw-25': '217743513',
        'patrick': '61580',
        'spongebob': '102156234',
        'woman-yelling-at-cat': '188390779'
    };
    
    return templateIds[templateName] || '181913649'; // Default to drake
}