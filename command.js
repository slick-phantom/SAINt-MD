import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CommandHandler {
  constructor() {
    this.commandsPath = path.join(__dirname, "../commands");
    this.commands = new Map();
  }

  // Load all command modules from the root commands directory
  async loadCommands() {
    try {
      // Check if commands directory exists
      if (!fs.existsSync(this.commandsPath)) {
        fs.mkdirSync(this.commandsPath, { recursive: true });
        logger.warn("Commands directory created. Please add command files.");
        return Array.from(this.commands.values());
      }

      const commandFiles = fs
        .readdirSync(this.commandsPath)
        .filter((file) => file.endsWith(".js") && file !== "index.js");

      logger.info(
        `Found ${commandFiles.length} command files: ${commandFiles.join(", ")}`
      );

      // Load commands sequentially
      for (const file of commandFiles) {
        try {
          const commandPath = path.join(this.commandsPath, file);
          const filePath = `file://${commandPath}`;

          // Import the command module
          const commandModule = await import(filePath);
          const command = commandModule.default || commandModule;

          if (command.name && typeof command.execute === "function") {
            this.commands.set(command.name, command);
            logger.info(`✅ Loaded command: ${command.name} from ${file}`);
          } else {
            logger.warn(
              `❌ Invalid command structure in ${file}: missing name or execute function`
            );
          }
        } catch (error) {
          logger.error(`Error loading command ${file}:`, error);
        }
      }

      logger.info(`Successfully loaded ${this.commands.size} commands`);
      return Array.from(this.commands.values());
    } catch (error) {
      logger.error("Error loading commands:", error);
      return [];
    }
  }

  // Get a specific command
  getCommand(name) {
    return this.commands.get(name.toLowerCase());
  }

  // Get all loaded commands
  getAllCommands() {
    return Array.from(this.commands.values());
  }

  // Get command names only
  getCommandNames() {
    return Array.from(this.commands.keys()).sort();
  }

  // Reload commands (useful for development)
  async reloadCommands() {
    logger.info("Reloading commands...");

    // Clear existing commands
    this.commands.clear();

    // Reload commands
    await this.loadCommands();

    logger.info(`Commands reloaded. Total: ${this.commands.size}`);
    return this.commands.size;
  }

  // Check if a command exists
  hasCommand(name) {
    return this.commands.has(name.toLowerCase());
  }

  // Execute a command directly
  async executeCommand(commandName, message, client, args) {
    const command = this.getCommand(commandName);
    if (!command) {
      throw new Error(`Command not found: ${commandName}`);
    }

    return await command.execute(message, client, args);
  }
}

export default CommandHandler;
