import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Simple logger class
class Logger {
  constructor() {
    this.logFile = path.join(logsDir, "bot.log");
  }

  // Get current timestamp
  getTimestamp() {
    return new Date().toISOString();
  }

  // Write to log file
  writeToFile(level, message) {
    const logEntry = `[${this.getTimestamp()}] [${level.toUpperCase()}] ${message}\n`;

    fs.appendFile(this.logFile, logEntry, (err) => {
      if (err) {
        console.error("Failed to write to log file:", err);
      }
    });
  }

  // Log methods
  info(message) {
    const logMessage = `${colors.blue}🤖 INFO:${colors.reset} ${message}`;
    console.log(logMessage);
    this.writeToFile("info", message);
  }

  success(message) {
    const logMessage = `${colors.green}✅ SUCCESS:${colors.reset} ${message}`;
    console.log(logMessage);
    this.writeToFile("success", message);
  }

  warn(message) {
    const logMessage = `${colors.yellow}⚠️ WARN:${colors.reset} ${message}`;
    console.log(logMessage);
    this.writeToFile("warn", message);
  }

  error(message, error = null) {
    const logMessage = `${colors.red}❌ ERROR:${colors.reset} ${message}`;
    console.log(logMessage);

    if (error) {
      console.error(`${colors.red}Stack:${colors.reset}`, error.stack || error);
    }

    this.writeToFile("error", error ? `${message} - ${error.stack}` : message);
  }

  debug(message) {
    if (process.env.DEBUG === "true") {
      const logMessage = `${colors.magenta}🐛 DEBUG:${colors.reset} ${message}`;
      console.log(logMessage);
      this.writeToFile("debug", message);
    }
  }

  // Specialized loggers
  command(message) {
    const logMessage = `${colors.cyan}⌨️ COMMAND:${colors.reset} ${message}`;
    console.log(logMessage);
    this.writeToFile("command", message);
  }

  message(message) {
    if (process.env.DEBUG === "true") {
      const logMessage = `${colors.white}💬 MESSAGE:${colors.reset} ${message}`;
      console.log(logMessage);
      this.writeToFile("message", message);
    }
  }

  connection(message) {
    const logMessage = `${colors.blue}📡 CONNECTION:${colors.reset} ${message}`;
    console.log(logMessage);
    this.writeToFile("connection", message);
  }
}

// Create and export a single instance
const logger = new Logger();
export default logger;
