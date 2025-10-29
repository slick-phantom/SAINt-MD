
import axios from "axios";

export default {
    name: "imagine",
    description: "Generate AI images from text using ShizoAPI",
    category: "fun",
    
    async execute(message, client, args) {
        try {
            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "🎨 *AI IMAGE GENERATOR*\n\nUsage: imagine [your prompt]\n\nExamples:\n• imagine a beautiful sunset over mountains\n• imagine a cyberpunk city at night\n• imagine a cute cat wearing sunglasses",
                    },
                    { quoted: message }
                );
                return;
            }

            const prompt = args.join(" ");
            
            // Send processing message
            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "🎨 Generating your image... Please wait 10-20 seconds.",
                },
                { quoted: message }
            );

            // Enhance the prompt with quality keywords
            const enhancedPrompt = enhancePrompt(prompt);

            // Make API request to ShizoAPI
            const response = await axios.get(
                `https://shizoapi.onrender.com/api/ai/imagine?apikey=shizo&query=${encodeURIComponent(enhancedPrompt)}`,
                {
                    responseType: 'arraybuffer',
                    timeout: 30000 // 30 second timeout
                }
            );

            // Convert response to buffer
            const imageBuffer = Buffer.from(response.data);

            // Send the generated image
            await client.sendMessage(
                message.key.remoteJid,
                {
                    image: imageBuffer,
                    caption: `🎨 *AI Generated Image*\n\nPrompt: "${prompt}"\n\nPowered by ShizoAPI`
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing imagine command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Failed to generate image. The API might be busy or your prompt was too complex. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Function to enhance the prompt with quality keywords
function enhancePrompt(prompt) {
    const qualityEnhancers = [
        'high quality',
        'detailed',
        'masterpiece', 
        'best quality',
        'ultra realistic',
        '4k',
        'highly detailed',
        'professional photography',
        'cinematic lighting',
        'sharp focus',
        'trending on artstation',
        'unreal engine',
        'octane render'
    ];

    // Randomly select 3-4 enhancers
    const numEnhancers = Math.floor(Math.random() * 2) + 3;
    const selectedEnhancers = qualityEnhancers
        .sort(() => Math.random() - 0.5)
        .slice(0, numEnhancers);

    return `${prompt}, ${selectedEnhancers.join(', ')}`;
}