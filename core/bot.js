// bot.js
import {
  makeWASocket,
  fetchLatestBaileysVersion,
  Browsers,
  useSingleFileAuthState,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import CommandHandler from "./handlers/command.js";
import MessageHandler from "./handlers/message.js";
import pino from "pino";
import logger from "./utils/logger.js";

async function startBot() {
  try {
    logger.info("🚀 Starting WhatsApp Bot...");

    // Ensure creds.json exists
    const { state, saveState } = useSingleFileAuthState("./session/creds.json");
    if (!state || !state.creds) {
      logger.error("❌ No creds.json found in session folder. Please log in first.");
      return;
    }

    // Fetch latest Baileys version (fallback if fails)
    let version;
    try {
      version = await fetchLatestBaileysVersion();
    } catch (error) {
      logger.warn("⚠️ Failed to fetch latest version, using fallback");
      version = { version: [4, 0, 0] };
    }

    // Create WhatsApp client
    const client = makeWASocket({
      version: version.version || [4, 0, 0],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
          state.keys,
          pino({ level: "fatal" }).child({ level: "fatal" })
        ),
      },
      logger: pino({ level: "silent" }),
      browser: Browsers.ubuntu("Firefox"),
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      defaultQueryTimeoutMs: 60000,
      connectTimeoutMs: 60000,
    });

    // Save updated creds automatically
    client.ev.on("creds.update", saveState);

    // Initialize handlers
    const bot = { client };
    const commandHandler = new CommandHandler();
    await commandHandler.loadCommands();

    const messageHandler = new MessageHandler(bot, commandHandler);
    messageHandler.initialize();

    logger.info(`✅ Bot initialized with ${commandHandler.getAllCommands().length} commands`);

    // Connection events
    client.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "open") {
        logger.info("✅ Connected to WhatsApp successfully!");
      }

      if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
        logger.warn(`Connection closed. Reconnect: ${shouldReconnect}`);
        if (shouldReconnect) {
          setTimeout(() => {
            logger.info("🔄 Attempting to reconnect...");
            startBot().catch((err) => logger.error("Reconnection failed:", err));
          }, 5000);
        }
      }
    });
  } catch (error) {
    logger.error("❌ Error starting bot:", error);
  }
}

// Run bot
startBot();
