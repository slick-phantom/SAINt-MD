import axios from "axios";

export default {
    name: "ip",
    description: "Show your current IP address and location information",
    category: "utility",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Get IP information from multiple APIs for reliability
            const ipInfo = await getIPInformation();

            if (!ipInfo) {
                throw new Error('Failed to fetch IP information');
            }

            const ipMessage = `
🌐 *YOUR IP INFORMATION* 🌐

📡 *IP Address:* \`${ipInfo.ip}\`
📍 *Country:* ${ipInfo.country} (${ipInfo.countryCode})
🏙️ *City:* ${ipInfo.city}
🌍 *Region:* ${ipInfo.region}
📮 *Postal Code:* ${ipInfo.postal || 'N/A'}
🕐 *Timezone:* ${ipInfo.timezone}
📡 *ISP:* ${ipInfo.isp}
🛜 *Organization:* ${ipInfo.org || 'N/A'}

📍 *Location:* 
Lat: ${ipInfo.lat}, Lon: ${ipInfo.lon}

🔒 *Security Info:*
• Proxy: ${ipInfo.proxy ? '✅ Yes' : '❌ No'}
• Hosting: ${ipInfo.hosting ? '✅ Yes' : '❌ No'}
• Mobile: ${ipInfo.mobile ? '✅ Yes' : '❌ No'}

💡 *Note:* This shows your public IP, not exact location.
            `.trim();

            await client.sendMessage(
                chatId,
                {
                    text: ipMessage,
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('IP command error:', error);
            
            await client.sendMessage(
                chatId,
                {
                    text: "❌ Failed to fetch IP information. Please check your internet connection and try again.",
                },
                { quoted: message }
            );
        }
    },
};

async function getIPInformation() {
    try {
        // Primary API - ipapi.co
        const response = await axios.get(
            "https://ipapi.co/json/",
            {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        const data = response.data;
        
        return {
            ip: data.ip,
            country: data.country_name,
            countryCode: data.country_code,
            city: data.city,
            region: data.region,
            postal: data.postal,
            timezone: data.timezone,
            isp: data.org,
            org: data.org,
            lat: data.latitude,
            lon: data.longitude,
            proxy: data.proxy || false,
            hosting: false, // Will get from fallback
            mobile: false
        };

    } catch (error) {
        console.error('Primary IP API failed:', error);
        return await getIPFallback();
    }
}

async function getIPFallback() {
    try {
        // Fallback 1 - ipify for simple IP
        const ipResponse = await axios.get(
            "https://api.ipify.org?format=json",
            {
                timeout: 8000
            }
        );

        // Fallback 2 - ip-api.com for detailed info
        const detailResponse = await axios.get(
            "http://ip-api.com/json/",
            {
                timeout: 8000
            }
        );

        const detailData = detailResponse.data;
        
        return {
            ip: ipResponse.data.ip,
            country: detailData.country,
            countryCode: detailData.countryCode,
            city: detailData.city,
            region: detailData.regionName,
            postal: detailData.zip,
            timezone: detailData.timezone,
            isp: detailData.isp,
            org: detailData.org,
            lat: detailData.lat,
            lon: detailData.lon,
            proxy: detailData.proxy || false,
            hosting: detailData.hosting || false,
            mobile: detailData.mobile || false
        };

    } catch (fallbackError) {
        console.error('Fallback IP APIs failed:', fallbackError);
        
        // Final fallback - simple IP only
        const finalResponse = await axios.get(
            "https://api.myip.com/",
            {
                timeout: 5000
            }
        );

        const finalData = finalResponse.data;
        
        return {
            ip: finalData.ip,
            country: finalData.country,
            countryCode: finalData.cc,
            city: 'Unknown',
            region: 'Unknown',
            postal: 'N/A',
            timezone: 'Unknown',
            isp: 'Unknown',
            org: 'Unknown',
            lat: 'N/A',
            lon: 'N/A',
            proxy: false,
            hosting: false,
            mobile: false
        };
    }
}