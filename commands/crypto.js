import axios from "axios";
import logger from "../utils/logger.js";

// Coin mapping for common abbreviations
const coinMappings = {
  btc: "bitcoin",
  eth: "ethereum",
  bnb: "binancecoin",
  xrp: "ripple",
  ada: "cardano",
  sol: "solana",
  doge: "dogecoin",
  dot: "polkadot",
  matic: "matic-network",
  shib: "shiba-inu",
  usdt: "tether",
  usdc: "usd-coin",
  dai: "dai",
  ltc: "litecoin",
  bch: "bitcoin-cash",
  atom: "cosmos",
  link: "chainlink",
  uni: "uniswap",
  avax: "avalanche-2",
  etc: "ethereum-classic",
  xlm: "stellar",
  xmr: "monero",
  xtz: "tezos",
};

export default {
  name: "crypto",
  description: "Get cryptocurrency prices and market information for any coin",
  category: "finance",
  async execute(message, client, args) {
    try {
      if (!args || args.length === 0) {
        await client.sendMessage(
          message.key.remoteJid,
          {
            text:
              "❌ *Usage:* !crypto [coin symbol or name]\n\n" +
              "💡 *Examples:*\n" +
              "• `!crypto btc` - Bitcoin price\n" +
              "• `!crypto ethereum` - Ethereum price\n" +
              "• `!crypto btc eth sol` - Multiple coins\n" +
              "• `!crypto dogecoin` - Any coin by name\n\n" +
              "🌐 *Supported:* Any cryptocurrency on CoinGecko",
          },
          { quoted: message }
        );
        return;
      }

      // Show typing indicator
      await client.sendPresenceUpdate("composing", message.key.remoteJid);

      const coins = args.map((coin) => coin.toLowerCase());

      // Handle multiple coins
      if (coins.length > 1) {
        await showMultipleCoins(coins, message, client);
        return;
      }

      // Single coin lookup
      const coinId = coins[0];
      await showCoinDetails(coinId, message, client);
    } catch (error) {
      logger.error("Error executing crypto command:", error);

      await client.sendMessage(
        message.key.remoteJid,
        {
          text:
            "❌ *Error fetching cryptocurrency data*\n\n" +
            "This might be because:\n" +
            "• The coin symbol/name was incorrect\n" +
            "• CoinGecko API is temporarily unavailable\n" +
            "• You entered an unsupported cryptocurrency\n\n" +
            "💡 Try using the exact coin name or common symbol",
        },
        { quoted: message }
      );
    }
  },
};

// Show detailed information for a single coin
async function showCoinDetails(coinId, message, client) {
  try {
    // Convert common abbreviations to CoinGecko IDs
    const formattedCoinId = coinMappings[coinId] || coinId;

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${formattedCoinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );

    const data = response.data;
    const marketData = data.market_data;

    const price = marketData.current_price.usd;
    const change24h = marketData.price_change_percentage_24h;
    const marketCap = marketData.market_cap.usd;
    const volume24h = marketData.total_volume.usd;
    const ath = marketData.ath.usd;
    const athChange = marketData.ath_change_percentage.usd;
    const rank = data.market_cap_rank;

    const changeIcon = change24h >= 0 ? "📈" : "📉";
    const changeColor = change24h >= 0 ? "🟢" : "🔴";

    // Format large numbers
    const formatNumber = (num) => {
      if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
      if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
      if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
      if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
      return num.toFixed(2);
    };

    const messageText = `
💰 *${data.name} (${data.symbol.toUpperCase()})*

• 💵 *Price:* $${price.toLocaleString()}
• ${changeIcon} *24h Change:* ${changeColor} ${change24h.toFixed(2)}%
• 🏦 *Market Cap:* $${formatNumber(marketCap)} (Rank #${rank})
• 📊 *24h Volume:* $${formatNumber(volume24h)}
• 🚀 *All-Time High:* $${ath.toLocaleString()} (${athChange.toFixed(2)}%)

📈 *Market Data Provided by CoinGecko*
        `.trim();

    await client.sendMessage(
      message.key.remoteJid,
      {
        text: messageText,
      },
      { quoted: message }
    );

    // Send channel promotion after price info
    await sendChannelPromotion(message, client, data.name);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: `❌ *Cryptocurrency not found*\n\n"${coinId}" is not available or doesn't exist on CoinGecko.\n\n💡 Try these alternatives:\n• Use the full coin name (e.g., "bitcoin" instead of "btc")\n• Check your spelling\n• Use common symbols (btc, eth, etc.)`,
        },
        { quoted: message }
      );
    } else {
      throw error;
    }
  }
}

// Show multiple coins in a compact format
async function showMultipleCoins(coins, message, client) {
  try {
    // Convert common abbreviations and filter out invalid ones
    const coinIds = coins.map((coin) => coinMappings[coin] || coin).join(",");

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    );

    let messageText = "📊 *Cryptocurrency Prices*\n\n";

    for (const coin of coins) {
      const coinId = coinMappings[coin] || coin;
      const data = response.data[coinId];

      if (data) {
        const changeIcon = data.usd_24h_change >= 0 ? "📈" : "📉";
        const changeColor = data.usd_24h_change >= 0 ? "🟢" : "🔴";

        messageText += `• ${coin.toUpperCase()}: $${data.usd.toLocaleString()} ${changeIcon} ${changeColor} ${data.usd_24h_change.toFixed(
          2
        )}%\n`;
      } else {
        messageText += `• ${coin.toUpperCase()}: ❌ Not found\n`;
      }
    }

    messageText += "\n💡 Use `!crypto [coin]` for detailed info";

    await client.sendMessage(
      message.key.remoteJid,
      {
        text: messageText,
      },
      { quoted: message }
    );

    // Send channel promotion after price info
    await sendChannelPromotion(message, client, "multiple cryptocurrencies");
  } catch (error) {
    if (error.response && error.response.status === 404) {
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: "❌ *One or more cryptocurrencies not found*\n\nPlease check your symbols and try again. Use common abbreviations or full coin names.",
        },
        { quoted: message }
      );
    } else {
      throw error;
    }
  }
}

// Send channel promotion message
async function sendChannelPromotion(message, client, coinName) {
  await client.sendMessage(
    message.key.remoteJid,
    {
      text:
        `📢 *Get Professional Crypto Signals*\n\n` +
        `Interested in ${coinName} trading signals and expert analysis?\n\n` +
        `🔔 *Join our official channel for:*\n` +
        `• Daily trading signals\n` +
        `• Market analysis & insights\n` +
        `• Early project announcements\n` +
        `• Expert technical analysis\n` +
        `• Portfolio management tips\n\n` +
        `📱 *Join now:* https://whatsapp.com/channel/0029VbBNepmLY6d2gd7NfA07\n\n` +
        `💎 *Premium features include:*\n` +
        `• Entry/exit points\n` +
        `• Stop-loss recommendations\n` +
        `• Market sentiment analysis\n` +
        `• Regular updates\n` +
        `• Community support`,
    },
    { quoted: message }
  );
}
