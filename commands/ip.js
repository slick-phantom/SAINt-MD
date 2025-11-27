import axios from "axios";

export default {
    name: "ip",
    description: "Show your current IP address and location information",
    category: "utility",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Get IP information - this will show YOUR location in Nigeria
            const ipInfo = await getIPInformation();

            if (!ipInfo) {
                throw new Error('Failed to fetch IP information');
            }

            const ipMessage = `
🌐 *YOUR IP INFORMATION* 🌐

📡 *IP Address:* \`${ipInfo.ip}\`
📍 *Country:* ${ipInfo.country} ${getCountryFlag(ipInfo.countryCode)}
🏙️ *City:* ${ipInfo.city}
🌍 *Region:* ${ipInfo.region}
📮 *Postal Code:* ${ipInfo.postal || 'N/A'}
🕐 *Timezone:* ${ipInfo.timezone}
📡 *ISP:* ${ipInfo.isp}
🛜 *Organization:* ${ipInfo.org || 'N/A'}

📍 *Coordinates:* 
Lat: ${ipInfo.lat}, Lon: ${ipInfo.lon}

🔒 *Connection Info:*
• Proxy/VPN: ${ipInfo.proxy ? '⚠️ Detected' : '✅ No'}
• Hosting: ${ipInfo.hosting ? '⚠️ Yes' : '✅ No'}
• Mobile: ${ipInfo.mobile ? '📱 Yes' : '💻 No'}

${ipInfo.country === 'Nigeria' ? '🇳🇬 *Detected: You are in Nigeria* 🇳🇬' : '⚠️ *Location may be inaccurate*'}

💡 *Note:* Shows your public IP address location.
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
        // Use APIs that detect client IP properly (not server IP)
        const apis = [
            {
                name: "ipapi.co",
                url: "https://ipapi.co/json/",
                processor: (data) => ({
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
                    hosting: false,
                    mobile: false
                })
            },
            {
                name: "ip-api.com",
                url: "http://ip-api.com/json/",
                processor: (data) => ({
                    ip: data.query,
                    country: data.country,
                    countryCode: data.countryCode,
                    city: data.city,
                    region: data.regionName,
                    postal: data.zip,
                    timezone: data.timezone,
                    isp: data.isp,
                    org: data.org,
                    lat: data.lat,
                    lon: data.lon,
                    proxy: data.proxy || false,
                    hosting: data.hosting || false,
                    mobile: data.mobile || false
                })
            },
            {
                name: "ipinfo.io",
                url: "https://ipinfo.io/json",
                processor: (data) => ({
                    ip: data.ip,
                    country: data.country,
                    countryCode: data.country,
                    city: data.city,
                    region: data.region,
                    postal: data.postal,
                    timezone: data.timezone,
                    isp: data.org,
                    org: data.org,
                    lat: data.loc ? data.loc.split(',')[0] : 'N/A',
                    lon: data.loc ? data.loc.split(',')[1] : 'N/A',
                    proxy: false,
                    hosting: false,
                    mobile: false
                })
            }
        ];

        // Try each API until one works
        for (const api of apis) {
            try {
                console.log(`Trying ${api.name}...`);
                const response = await axios.get(api.url, {
                    timeout: 8000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'application/json'
                    }
                });

                const ipInfo = api.processor(response.data);
                
                // Log for debugging
                console.log(`IP API ${api.name} returned:`, {
                    ip: ipInfo.ip,
                    country: ipInfo.country,
                    city: ipInfo.city
                });

                return ipInfo;

            } catch (apiError) {
                console.log(`${api.name} failed:`, apiError.message);
                continue;
            }
        }

        throw new Error('All IP APIs failed');

    } catch (error) {
        console.error('All IP APIs failed:', error);
        
        // Final simple fallback
        try {
            const response = await axios.get("https://api.ipify.org?format=json", {
                timeout: 5000
            });
            
            return {
                ip: response.data.ip,
                country: 'Unknown',
                countryCode: '??',
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
        } catch (finalError) {
            throw new Error('Cannot determine IP address');
        }
    }
}

function getCountryFlag(countryCode) {
    if (!countryCode || countryCode === '??') return '';
    
    // Convert country code to flag emoji
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    
    return String.fromCodePoint(...codePoints);
}

// Test function to verify location
async function testIPLocation() {
    try {
        const testResponse = await axios.get("http://ip-api.com/json/");
        const data = testResponse.data;
        console.log('🔍 IP Location Test:');
        console.log('IP:', data.query);
        console.log('Country:', data.country);
        console.log('City:', data.city);
        console.log('ISP:', data.isp);
        console.log('──────────────');
    } catch (error) {
        console.log('Test failed:', error.message);
    }
}

// Uncomment to test when needed
// testIPLocation();