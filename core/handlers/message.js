import settings from "../../config/settings.js";
import logger from "../../utils/logger.js";

class MessageHandler {
  constructor(bot) {
    this.bot = bot;
    this.commands = new Map();
    this.commandHistory = [];
  }

  // Initialize message handler
  initialize() {
    // Listen for incoming messages
    this.bot.client.ev.on("messages.upsert", ({ messages }) => {
      this.handleIncomingMessages(messages);
    });

    logger.info("Message handler initialized");
  }

  // Register a command
  registerCommand(name, handler) {
    this.commands.set(name, handler);
    logger.debug(`Command registered: ${name}`);
  }

  // Handle incoming messages
  async handleIncomingMessages(messages) {
    for (const message of messages) {
      try {
        if (!message.message) continue;

        // Get message details
        const jid = message.key.remoteJid;
        const text = this.extractMessageText(message);
        const sender = message.key.participant || jid;

        // Check if message is from an authorized number
        if (!this.isAuthorized(sender)) {
          logger.debug(`Ignoring message from unauthorized sender: ${sender}`);
          continue;
        }

        // Check if message is a command
        if (this.isCommand(text)) {
          await this.processCommand(text, jid, message);
        } else {
          // Handle regular messages (optional)
          await this.handleRegularMessage(text, jid, message);
        }
      } catch (error) {
        logger.error("Error handling message:", error);
      }
    }
  }

  // Extract text from different message types
  extractMessageText(message) {
    if (message.message.conversation) {
      return message.message.conversation;
    }
    if (message.message.extendedTextMessage?.text) {
      return message.message.extendedTextMessage.text;
    }
    if (message.message.imageMessage?.caption) {
      return message.message.imageMessage.caption;
    }
    return "";
  }

  // Check if sender is authorized
  isAuthorized(sender) {
    // Extract phone number from JID
    const phoneNumber = sender.split("@")[0].replace(/\D/g, "");

    // Check if number is in authorized list
    const isAuthorized = settings.authorizedNumbers.includes(phoneNumber);

    if (!isAuthorized) {
      logger.warn(`Unauthorized access attempt from: ${phoneNumber}`);
    }

    return isAuthorized;
  }

  // Check if message is a command
  isCommand(text) {
    return text && text.startsWith(settings.bot.prefix);
  }

  // Process command
  async processCommand(fullCommand, jid, originalMessage) {
    try {
      // Parse command
      const [command, ...args] = fullCommand
        .slice(settings.bot.prefix.length)
        .split(" ");
      const commandName = command.toLowerCase();

      logger.info(`Processing command: ${commandName} from ${jid}`);

      // Add to command history
      this.addToHistory({
        command: commandName,
        args,
        jid,
        timestamp: new Date().toISOString(),
      });

      // Check if command exists
      if (!this.commands.has(commandName)) {
        await this.sendMessage(
          jid,
          {
            text: `❌ Unknown command: ${commandName}\n\nUse !help to see available commands.`,
          },
          originalMessage
        );
        return;
      }

      // Check if command is group-only and message is from private chat
      const commandHandler = this.commands.get(commandName);
      if (commandHandler.groupOnly && !jid.includes('@g.us')) {
        await this.sendMessage(
          jid,
          {
            text: `❌ This command can only be used in groups.`,
          },
          originalMessage
        );
        return;
      }

      // Check if command is private-only and message is from group
      if (commandHandler.privateOnly && jid.includes('@g.us')) {
        await this.sendMessage(
          jid,
          {
            text: `❌ This command can only be used in private chats.`,
          },
          originalMessage
        );
        return;
      }

      // Execute command
      await commandHandler.execute(originalMessage, this.bot.client, args);
    } catch (error) {
      logger.error(`Error processing command: ${fullCommand}`, error);

      await this.sendMessage(
        jid,
        {
          text: "❌ An error occurred while processing your command. Please try again later.",
        },
        originalMessage
      );
    }
  }
/*
  // Handle regular messages (optional)
  async handleRegularMessage(text, jid, originalMessage) {
    // Auto-reply for greetings
    if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
      await this.sendMessage(
        jid,
        {
          text: `👋 Hello! I'm Savy DNI X bot. Use ${settings.bot.prefix}help to see what I can do!`
        },
        originalMessage
      );
    }
  }
*/
  // Send message helper
  async sendMessage(jid, content, quotedMessage = null) {
    try {
      const options = quotedMessage ? { quoted: quotedMessage } : {};
      await this.bot.client.sendMessage(jid, content, options);
    } catch (error) {
      logger.error(`Error sending message to ${jid}:`, error);
      throw error;
    }
  }

  // Add command to history
  addToHistory(entry) {
    this.commandHistory.unshift(entry);
    // Keep only the most recent commands
    if (this.commandHistory.length > settings.bot.maxCommandHistory) {
      this.commandHistory.pop();
    }
  }

  // Get command history
  getCommandHistory(limit = 10) {
    return this.commandHistory.slice(0, limit);
  }

  // Get available commands
  getAvailableCommands() {
    return Array.from(this.commands.keys()).sort();
  }
}

export default MessageHandler;