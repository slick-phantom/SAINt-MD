export default {
  name: "clearchat",
  description: "Clear all messages in the chat (Admin only)",
  category: "moderation",
  groupAdminOnly: true,

  async execute(message, client, args) {
    try {
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith("@g.us");

      // Check if it's a group
      if (!isGroup) {
        await client.sendMessage(chatId, {
          text: "❌ This command only works in groups!",
        }, { quoted: message });
        return;
      }

      // React with processing emoji
      await client.sendMessage(chatId, {
        react: {
          text: "⏳",
          key: message.key,
        },
      });

      // Get chat info
      const chatMetadata = await client.groupMetadata(chatId);
      const totalMembers = chatMetadata.participants.length;

      // Send confirmation message before clearing
      const warningMsg = await client.sendMessage(chatId, {
        text: `⚠️ *WARNING* ⚠️\n\nChat will be cleared in 3 seconds!\n\n*Group:* ${chatMetadata.subject}\n*Members:* ${totalMembers}\n*Status:* Processing...`,
      });

      // Wait 3 seconds before clearing (giving time to see the warning)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Get all messages (fetch recent messages)
      const messages = await client.loadConversation(chatId, 50);

      // Delete messages
      let deletedCount = 0;
      for (const msg of messages) {
        try {
          await client.sendMessage(chatId, {
            delete: msg.key,
          });
          deletedCount++;
        } catch (err) {
          // Continue if one message fails to delete
          console.error("Error deleting message:", err);
        }
      }

      // Delete the warning message
      try {
        await client.sendMessage(chatId, {
          delete: warningMsg.key,
        });
      } catch (e) {
        // Ignore if can't delete
      }

      // Send completion message
      const completionMsg = await client.sendMessage(chatId, {
        text: `✅ *Chat Cleared Successfully*\n\n*Messages Deleted:* ${deletedCount}\n*Group:* ${chatMetadata.subject}\n*Cleared By:* @${message.key.participant.split("@\")[0]}\n*Time:* ${new Date().toLocaleTimeString()}`,
      });

      // React with success emoji
      await client.sendMessage(chatId, {
        react: {
          text: "✅",
          key: message.key,
        },
      });

      // Delete completion message after 10 seconds
      setTimeout(async () => {
        try {
          await client.sendMessage(chatId, {
            delete: completionMsg.key,
          });
        } catch (e) {
          // Ignore error
        }
      }, 10000);

    } catch (error) {
      console.error("Error executing clearchat command:", error);

      await client.sendMessage(message.key.remoteJid, {
        text: "❌ Error clearing chat. Make sure I'm an admin and have necessary permissions.",
      }, { quoted: message });
    }
  },
};