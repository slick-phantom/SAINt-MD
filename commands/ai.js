import axios from "axios";

export default {
  name: "ai",
  description: "Get an AI-powered response using OpenAI's API.",
  category: "tools",

  async execute(message, client, args) {
    try {
      const chatId = message.key.remoteJid;
      if (!args || args.length === 0) {
        await client.sendMessage(
          chatId,
          {
            text:
              "🤖 *Usage:* ai <your prompt>\n\n_Example:_ ai Write a poem about code"
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

      // Call OpenAI's API
      let aiResponse = "No reply.";
      try {
        const openaiRes = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: input }
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

      const aiMsg =
`╔════════════════════════════════╗
║      🤖 *AI ASSISTANT* 🤖      ║
╚════════════════════════════════╝

💭 *Prompt:*
${input}
${'─'.repeat(32)}
📋 *AI’s Response:*
${aiResponse}

${'═'.repeat(32)}
*AI by OpenAI – Powered by SAINt-MD*
`;

      await client.sendMessage(
        chatId,
        { text: aiMsg },
        { quoted: message }
      );

    } catch (error) {
      console.error("Error in ai command:", error);
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: `❌ Error with AI command.\n\nError: ${error.message}`
        },
        { quoted: message }
      );
    }
  }
};
