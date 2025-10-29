import {
  makeWASocket,
  fetchLatestBaileysVersion,
  Browsers,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import AuthManager from "./auth.js";
import MessageHandler from "./handlers/message.js";
import CommandHandler from "./handlers/command.js";
import pino from "pino";
import logger from "../utils/logger.js";

class SavyDNIXBot {
  constructor() {
    this.authManager = new AuthManager();
    this.client = null;
    this.isConnected = false;
    this.messageHandler = null;
    this.commandHandler = null;
  }

  // Initialize the bot with existing session
  async initialize() {
    try {
      logger.info("Initializing Savy DNI X Bot...");

      // Check if we have any sessions
      if (!this.authManager.hasSessions()) {
        throw new Error(
          "No sessions available. Please add a creds.json file to the sessions folder."
        );
      }

      // Get the default session
      const phoneNumber = this.authManager.getDefaultSession();
      logger.info(`Using session: ${phoneNumber}`);

      // Initialize client with existing session
      const { state, saveCreds } = await this.authManager.initializeClient(
        phoneNumber
      );
      const { version } = await fetchLatestBaileysVersion();

      // Create WhatsApp client
      this.client = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(
            state.keys,
            pino({ level: "fatal" }).child({ level: "fatal" })
          ),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: Browsers.windows("Chrome"),
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
      });

      // Set up event handlers
      this.setupEventHandlers(saveCreds);

      // Initialize handlers
      await this.initializeHandlers();

      // Update session info
      this.authManager.updateSessionInfo(phoneNumber, {
        status: "active",
        lastActive: new Date().toISOString(),
      });

      return this.client;
    } catch (error) {
      logger.error("Error initializing bot:", error.message);
      throw error;
    }
  }

  // Initialize message and command handlers
  async initializeHandlers() {
    // Initialize message handler
    this.messageHandler = new MessageHandler(this);

    // Initialize command handler
    this.commandHandler = new CommandHandler();

    // Load all commands
    const commands = await this.commandHandler.loadCommands();

    // Register all commands with the message handler
    commands.forEach((command) => {
      this.messageHandler.registerCommand(command.name, command);
    });

    logger.info(`Registered ${commands.length} commands`);
  }

  // Set up event handlers
  setupEventHandlers(saveCreds) {
    this.client.ev.on("connection.update", (update) => {
      this.handleConnectionUpdate(update);
    });

    // Save credentials when updated
    this.client.ev.on("creds.update", saveCreds);

    // Handle messages through our message handler
    this.client.ev.on("messages.upsert", ({ messages }) => {
      if (this.messageHandler) {
        this.messageHandler.handleIncomingMessages(messages);
      }
    });
  }

  // Handle connection updates
  handleConnectionUpdate(update) {
    const { connection } = update;

    if (connection === "open") {
      this.isConnected = true;
      logger.success("✅ Savy DNI X Connected to WhatsApp!");
    }
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      sessionCount: this.authManager.getSessionStats().total,
      commandCount: this.commandHandler
        ? this.commandHandler.getAllCommands().length
        : 0,
    };
  }

  // Graceful shutdown
  async shutdown() {
    logger.info("Shutting down Savy DNI X Bot...");

    if (this.client) {
      try {
        await this.client.ws.close();
        logger.info("WhatsApp connection closed");
      } catch (error) {
        logger.error("Error closing connection:", error);
      }
    }

    logger.info("Bot shutdown complete");
  }
}

export default SavyDNIXBot;