import dotenv from 'dotenv';
dotenv.config();

const settings = {
    authorizedNumbers: process.env.AUTHORIZED_NUMBER 
        ? process.env.OWNER_NUMBER.split(',').map(a => a.trim())
        : ["2347088246238"],
    
    bot: {
        name: "Savy DNI",
        prefix: process.env.PREFIX || "!",
        adminPrefix: "#",
        maxCommandHistory: parseInt(process.env.MAX_COMMAND_HISTORY) || 100,
    },
    
    features: {
        crypto: true,
        betting: true,
        wallpaper: true,
        livescore: true,
        quote: true,
        shorten: true,
        translate: true,
    },
    
    api: {
        coingecko: {
            baseURL: "https://api.coingecko.com/api/v3",
            timeout: 10000,
        },
        livescore: {
            baseURL: "https://live-football-api.com",
            apiKey: "LFA-CE1876-6BE3E5-F21926",
            timeout: 8000,
        },
    },
};

// Console logs for debugging
console.log('🤖 BOT CONFIGURATION LOADED:');
console.log(`📱 Authorized Number(s): ${settings.authorizedNumbers.join(', ')}`);
console.log(`🔧 Bot Prefix: ${settings.bot.prefix}`);
console.log(`👑 Admin Prefix: ${settings.bot.adminPrefix}`);
console.log(`📊 Max Command History: ${settings.bot.maxCommandHistory}`);
console.log('✅ Features Enabled:');
Object.entries(settings.features).forEach(([feature, enabled]) => {
    console.log(`   ${enabled ? '🟢' : '🔴'} ${feature}: ${enabled}`);
});
console.log('🌐 API Endpoints Configured:');
console.log(`   📈 CoinGecko: ${settings.api.coingecko.baseURL}`);
console.log(`   ⚽ LiveScore: ${settings.api.livescore.baseURL}`);
console.log('═════════════════════════════════════════════════');

export default settings;
