import {
  makeWASocket,
  fetchLatestBaileysVersion,
  Browsers,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
} from "sdnight"; // ✅ CHANGED: Use your fork instead of @whiskeysockets/baileys
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
      
      // ✅ CHANGED: Better error handling for version fetch
      let version;
      try {
        version = await fetchLatestBaileysVersion();
      } catch (error) {
        logger.warn('Failed to fetch latest version, using default');
        version = { version: [4, 0, 0] }; // Fallback version
      }

      // Create WhatsApp client
      this.client = makeWASocket({
        version: version.version || [4, 0, 0],
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(
            state.keys,
            pino({ level: "fatal" }).child({ level: "fatal" })
          ),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: Browsers.ubuntu("Firefox"),
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
      });

      // ✅ NEW: Store auth state for LID extraction
      this.client.authState = state;

      // Set up event handlers
      this.setupEventHandlers(saveCreds);

      // Initialize handlers
      await this.initializeHandlers();

      // ✅ NEW: Initialize moderation systems after commands are loaded
      await this.initializeModerationSystems();

      // Update session info
      this.authManager.updateSessionInfo(phoneNumber, {
        status: "active",
        lastActive: new Date().toISOString(),
      });

      // ✅ NEW: Log LID information for debugging
      this.logSessionInfo();

      return this.client;
    } catch (error) {
      logger.error("Error initializing bot:", error.message);
      throw error;
    }
  }

  // ✅ NEW: Log session information including LID
  logSessionInfo() {
    try {
      if (this.client?.authState?.creds?.me) {
        const { id, lid } = this.client.authState.creds.me;
        logger.info(`📱 Session Info - Phone: ${id}, LID: ${lid}`);
        
        // Update message handler with LID info
        if (this.messageHandler) {
          this.messageHandler.botLid = lid;
          this.messageHandler.botPhone = id;
        }
      }
    } catch (error) {
      logger.error('Error logging session info:', error);
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

  // ✅ NEW: Initialize moderation systems
  async initializeModerationSystems() {
    try {
      // Get all loaded commands
      const commands = this.commandHandler.getAllCommands();
      
      // Initialize anti-link system if available
      const antilinkCommand = commands.find(cmd => cmd.name === 'antilink');
      if (antilinkCommand && antilinkCommand.initialize) {
        await antilinkCommand.initialize(this.client);
        logger.info("✅ Anti-link system initialized");
      }

      // Initialize captcha system if available  
      const captchaCommand = commands.find(cmd => cmd.name === 'captcha');
      if (captchaCommand && captchaCommand.initialize) {
        await captchaCommand.initialize(this.client);
        logger.info("✅ CAPTCHA system initialized");
      }

    } catch (error) {
      logger.error("Error initializing moderation systems:", error);
    }
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

    // ✅ NEW: Listen for group participants update (for CAPTCHA)
    this.client.ev.on("group-participants.update", async (update) => {
      try {
        const { id, participants, action } = update;
        
        // When new members join
        if (action === 'add') {
          const captchaCommand = this.commandHandler?.getCommand('captcha');
          if (captchaCommand?.handleNewMembers) {
            for (const participant of participants) {
              await captchaCommand.handleNewMembers(this.client, id, participant);
            }
          }
        }
      } catch (error) {
        logger.error('Error handling group participants update:', error);
      }
    });

    // ✅ NEW: Handle connection errors better
    this.client.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        logger.info('QR code received - ready for scanning');
      }
      
      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
        logger.warn(`Connection closed. Reconnect: ${shouldReconnect}`);
        
        if (shouldReconnect) {
          setTimeout(() => {
            logger.info('Attempting to reconnect...');
            this.initialize().catch(error => {
              logger.error('Reconnection failed:', error);
            });
          }, 5000);
        }
      }
    });
  }

  // Handle connection updates
  handleConnectionUpdate(update) {
    const { connection } = update;

    if (connection === "open") {
      this.isConnected = true;
      logger.success("✅ Savy DNI X Connected to WhatsApp!");
      
      // ✅ NEW: Log connection details
      this.logConnectionDetails();
    }
  }

  // ✅ NEW: Log connection details
  logConnectionDetails() {
    try {
      if (this.client?.user) {
        logger.info(`🤖 Connected as: ${this.client.user?.name || 'Unknown'}`);
        logger.info(`📱 User ID: ${this.client.user?.id || 'Unknown'}`);
      }
    } catch (error) {
      logger.error('Error logging connection details:', error);
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
      // ✅ NEW: Add LID info to status
      lidInfo: this.messageHandler?.extractLidFromCreds() || 'Unknown'
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