import axios from "axios";

export default {
  name: "aifix",
  description: "Suggest an AI-based fix for your code or bug description.",
  category: "tools",

  async execute(message, client, args) {
    try {
      const chatId = message.key.remoteJid;
      if (!args || args.length === 0) {
        await client.sendMessage(
          chatId,
          {
            text:
              "🛠️ *Usage:* aifix <describe your bug or paste broken code>\n\n_Example:_ aifix TypeError: cannot read property 'x' of undefined"
          },
          { quoted: message }
        );
        return;
      }

      const input = args.join(" ");

      // Load your API key from environment variables
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        await client.sendMessage(
          chatId,
          {
            text: "❌ OpenAI API key not found. Please add OPENAI_API_KEY to your .env file."
          },
          { quoted: message }
        );
        return;
      }

      // Prepare OpenAI API call
      let aiResponse = "No fix found.";
      try {
        const openaiRes = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are an expert programmer. Analyze the user's bug report or broken code and suggest a concise fix or improvement." },
              { role: "user", content: `Fix this bug or issue:\n${input}` }
            ]
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`
            }
          }
        );

        aiResponse = openaiRes.data.choices[0].message.content.trim();
      } catch (err) {
        console.error("OpenAI error:", err?.response?.data || err.message);
        aiResponse = "❌ Sorry, the OpenAI API request failed.";
      }

      const fixMsg =
`╔═══════════════════════════════════╗
║    🛠️ *AI BUG FIX SUGGESTION* 🛠️   ║
╚═══════════════════════════════════╝

🔎 *Problem:*
${input}
${'─'.repeat(32)}
💡 *AI Suggests:*
${aiResponse}

${'═'.repeat(32)}
_Advice is AI-generated – review before using!_
`;

      await client.sendMessage(
        chatId,
        { text: fixMsg },
        { quoted: message }
      );
    } catch (error) {
      console.error("Error in aifix command:", error);
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: `❌ Error with aifix command.\n\nError: ${error.message}`
        },
        { quoted: message }
      );
    }
  }
};
