import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { useMultiFileAuthState } from "@whiskeysockets/baileys";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AuthManager {
  constructor() {
    this.sessionsDir = path.join(__dirname, "../sessions");
    this.ensureSessionsDir();
  }

  // Ensure sessions directory exists
  ensureSessionsDir() {
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  // Check if we have any sessions
  hasSessions() {
    try {
      return fs.existsSync(path.join(this.sessionsDir, "creds.json"));
    } catch (error) {
      console.error("Error checking sessions:", error);
      return false;
    }
  }

  // Initialize WhatsApp client with existing session
  async initializeClient() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(
        this.sessionsDir
      );
      return { state, saveCreds };
    } catch (error) {
      console.error("Error initializing client:", error);
      throw error;
    }
  }

  // Get session statistics
  getSessionStats() {
    try {
      const hasSession = this.hasSessions();
      return {
        total: hasSession ? 1 : 0,
        sessions: hasSession ? [{ status: "active" }] : [],
      };
    } catch (error) {
      console.error("Error getting session stats:", error);
      return { total: 0, sessions: [] };
    }
  }

  // Get the default session (always the single session)
  getDefaultSession() {
    return "default";
  }

  // Update session information
  updateSessionInfo(phoneNumber, updates) {
    // Not needed for external creds.json approach
    return true;
  }
}

export default AuthManager;
