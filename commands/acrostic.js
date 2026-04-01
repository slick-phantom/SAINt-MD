export default {
  name: "acrostic",
  description: "Create an acrostic from the provided word or sentence.",
  category: "fun",

  async execute(message, client, args) {
    try {
      const chatId = message.key.remoteJid;
      if (!args || args.length === 0) {
        await client.sendMessage(
          chatId,
          {
            text: `✍️ *Usage:* acrostic <word or phrase>\n\n_Example:_ acrostic Hello`
          },
          { quoted: message }
        );
        return;
      }

      const phrase = args.join(' ').toUpperCase();
      let lines = [];

      // If phrase has spaces, acrostic each word vertically
      if (phrase.includes(' ')) {
        lines.push('🅰️ *Acrostic Words*');
        for (const word of phrase.split(' ')) {
          lines.push(
            `\n*${word}*`
          );
          for (const letter of word) {
            lines.push(`    ➤ *${letter}*`);
          }
        }
      } else {
        lines.push('🅰️ *Acrostic*');
        for (const letter of phrase) {
          lines.push(`➤ *${letter}*`);
        }
      }

      let response =
`╔═══════════════════════════╗
║      🎨 *ACROSTIC* 🎨      ║
╚═══════════════════════════╝

${lines.join('\n')}
${'═'.repeat(28)}
ℹ️ _Each letter, a new beginning_`;

      await client.sendMessage(
        chatId,
        { text: response },
        { quoted: message }
      );
    } catch (error) {
      console.error("Error executing acrostic command:", error);
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: `❌ Error creating acrostic.\n\nError: ${error.message}`
        },
        { quoted: message }
      );
    }
  }
};
