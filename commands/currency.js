import axios from "axios";

export default {
    name: "currency",
    description: "Convert between different currencies",
    category: "utility",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;

            if (!args || args.length < 3) {
                await client.sendMessage(chatId, {
                    text: `💱 *CURRENCY CONVERTER*\n\nConvert between 160+ currencies!\n\nUsage: currency [amount] [from] [to]\n\nExamples:\n• currency 100 USD EUR\n• currency 5000 NGN USD\n• currency 1 BTC USD\n• currency 50 EUR GBP\n\n💡 Supported: USD, EUR, GBP, NGN, JPY, CAD, AUD, INR, CNY, BTC, ETH\n\n📊 Use "currency rates" to see popular exchange rates`
                }, { quoted: message });
                return;
            }

            if (args[0]?.toLowerCase() === 'rates') {
                return await showExchangeRates(client, chatId, message);
            }

            const amount = parseFloat(args[0]);
            const fromCurrency = args[1].toUpperCase();
            const toCurrency = args[2].toUpperCase();

            if (isNaN(amount) || amount <= 0) {
                await client.sendMessage(chatId, {
                    text: "❌ Please provide a valid amount!\nExample: currency 100 USD EUR"
                }, { quoted: message });
                return;
            }

            await client.sendPresenceUpdate("composing", chatId);

            const conversion = await convertCurrency(amount, fromCurrency, toCurrency);

            if (!conversion) {
                await client.sendMessage(chatId, {
                    text: `❌ Failed to convert ${fromCurrency} to ${toCurrency}.\nPlease check the currency codes and try again.`
                }, { quoted: message });
                return;
            }

            const currencyMessage = `
💱 *CURRENCY CONVERTED* 💱

💰 ${amount.toLocaleString()} ${fromCurrency} = 
💵 *${conversion.result.toLocaleString()} ${toCurrency}*

📊 Exchange Rate: 1 ${fromCurrency} = ${conversion.rate} ${toCurrency}
🕒 Last Updated: ${conversion.lastUpdated}

💡 *Next:* Try converting other amounts!
            `.trim();

            await client.sendMessage(chatId, {
                text: currencyMessage
            }, { quoted: message });

        } catch (error) {
            console.error('Currency command error:', error);
            await client.sendMessage(chatId, {
                text: "❌ Currency conversion failed. Please try again later."
            }, { quoted: message });
        }
    }
};

async function convertCurrency(amount, from, to) {
    try {
        // Use ExchangeRate-API
        const response = await axios.get(
            `https://api.exchangerate-api.com/v4/latest/${from}`,
            {
                timeout: 10000
            }
        );

        const data = response.data;
        const rate = data.rates[to];
        
        if (!rate) {
            throw new Error('Currency not supported');
        }

        return {
            result: amount * rate,
            rate: rate.toFixed(6),
            lastUpdated: new Date(data.time_last_updated * 1000).toLocaleString()
        };

    } catch (error) {
        console.error('Currency API error:', error);
        
        // Fallback to alternative API
        return await fallbackCurrencyConvert(amount, from, to);
    }
}

async function fallbackCurrencyConvert(amount, from, to) {
    try {
        const response = await axios.get(
            `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
            {
                timeout: 8000
            }
        );

        const data = response.data;
        const rate = data.rates[to];
        
        return {
            result: amount * rate,
            rate: rate.toFixed(6),
            lastUpdated: new Date().toLocaleString()
        };

    } catch (fallbackError) {
        console.error('Fallback currency API failed:', fallbackError);
        return null;
    }
}

async function showExchangeRates(client, chatId, message) {
    try {
        const response = await axios.get(
            "https://api.exchangerate-api.com/v4/latest/USD",
            {
                timeout: 10000
            }
        );

        const data = response.data;
        const popularCurrencies = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'NGN', 'INR', 'CNY'];
        
        let ratesMessage = `📊 *POPULAR EXCHANGE RATES* 📊\n\n`;
        ratesMessage += `Base: 1 USD 💵\n\n`;
        
        popularCurrencies.forEach(currency => {
            if (data.rates[currency]) {
                ratesMessage += `💵 ${currency}: ${data.rates[currency].toFixed(4)}\n`;
            }
        });

        ratesMessage += `\n💡 Use: currency [amount] [from] [to]\nExample: currency 100 USD EUR`;

        await client.sendMessage(chatId, {
            text: ratesMessage
        }, { quoted: message });

    } catch (error) {
        console.error('Rates error:', error);
        await client.sendMessage(chatId, {
            text: "❌ Failed to fetch exchange rates."
        }, { quoted: message });
    }
}