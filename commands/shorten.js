import axios from "axios";
import logger from "../utils/logger.js";

export default {
  name: "shorten",
  description: "Shorten long URLs",
  category: "utility",
  async execute(message, client, args) {
    try {
      if (!args || args.length === 0) {
        await client.sendMessage(
          message.key.remoteJid,
          {
            text: "❌ *Usage:* !shorten [url]\n\nExample: !shorten https://example.com/very/long/url/path",
          },
          { quoted: message }
        );
        return;
      }

      const longUrl = args[0];

      // Validate URL
      if (!isValidUrl(longUrl)) {
        await client.sendMessage(
          message.key.remoteJid,
          {
            text: "❌ Invalid URL. Please provide a valid URL starting with http:// or https://",
          },
          { quoted: message }
        );
        return;
      }

      // Show typing indicator
      await client.sendPresenceUpdate("composing", message.key.remoteJid);

      // Shorten URL using cleanuri.com
      const shortUrl = await shortenUrl(longUrl);

      const response = `
🔗 *URL SHORTENER*

📤 Original:
${longUrl}

📥 Shortened:
${shortUrl}

💡 *Pro Tip:* Use shortened URLs for cleaner sharing!
            `.trim();

      await client.sendMessage(
        message.key.remoteJid,
        {
          text: response,
        },
        { quoted: message }
      );
    } catch (error) {
      logger.error("Error executing shorten command:", error);

      await client.sendMessage(
        message.key.remoteJid,
        {
          text: "❌ Error shortening URL. Please try again later.",
        },
        { quoted: message }
      );
    }
  },
};

// Validate URL format
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

// Shorten URL using cleanuri.com API
async function shortenUrl(longUrl) {
  try {
    const response = await axios.post(
      "https://cleanuri.com/api/v1/shorten",
      {
        url: longUrl,
      },
      {
        timeout: 10000,
      }
    );

    return response.data.result_url;
  } catch (error) {
    console.error("Error shortening URL:", error);
    throw new Error("URL shortening service unavailable");
  }
}
