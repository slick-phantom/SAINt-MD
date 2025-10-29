import dotenv from "dotenv";
import SavyDNIXBot from "./core/bot.js";
import logger from "./utils/logger.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Display startup banner
function showBanner() {
  console.log("\n" + "═".repeat(50));
  console.log("🤖  S A V Y   D N I   W H A T S A P P   B O T  🤖");
  console.log("═".repeat(50));
}

// Check if creds.json exists in sessions folder (ES Modules version)
function hasSession() {
  try {
    const sessionsDir = path.join(__dirname, "sessions");

    // Check if sessions directory exists
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
      return false;
    }

    // Check if creds.json exists
    return fs.existsSync(path.join(sessionsDir, "creds.json"));
  } catch (error) {
    logger.error("Error checking session:", error);
    return false;
  }
}

// Start the bot
async function startBot() {
  try {
    showBanner();

    if (!hasSession()) {
      console.log("\n❌ No WhatsApp session found.");
      console.log("\n💡 To use this bot:");
      console.log(
        "   1. Obtain a valid creds.json file from the pairing service"
      );
      console.log("   2. Place it in the sessions/ folder");
      console.log("   3. Restart the bot");
      console.log("\n📁 Current sessions directory: ./sessions/");
      process.exit(1);
    }

    logger.info("Starting Savy DNI Bot...");

    const bot = new SavyDNIXBot();
    await bot.initialize();

    logger.success("✅ Bot is now running and connected to WhatsApp!");

    // Display bot status
    const status = bot.getStatus();
    console.log("\n📊 Bot Status:");
    console.log(`   Connected: ${status.isConnected ? "✅" : "❌"}`);
    console.log(`   Session: ✅ Found and loaded`);
    console.log(`   Commands: ${status.commandCount}`);

    console.log("\n💡 The bot is now running. Press Ctrl+C to stop.");
  } catch (error) {
    logger.error("Failed to start bot:", error.message);

    if (
      error.message.includes("No sessions available") ||
      error.message.includes("creds.json")
    ) {
      console.log("\n❌ Session authentication failed.");
      console.log("\n💡 The creds.json file may be invalid or expired.");
      console.log(
        "   Please obtain a new creds.json file from the pairing service."
      );
    } else {
      console.log("\n💡 Error details:", error.message);
    }
    process.exit(1);
  }
}

// Handle graceful shutdown
function shutdown(signal) {
  console.log("\n");
  logger.info(`Received ${signal}, shutting down...`);
  process.exit(0);
}

// Handle process signals
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start the application
startBot();
