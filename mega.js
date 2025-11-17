// mega.js
import { Storage } from 'megajs';
import fs from 'fs';
import path from 'path';

class MegaSessionManager {
  constructor() {
    this.sessionId = process.env.SESSION_ID;
    this.masterEmail = process.env.MEGA_MASTER_EMAIL;
    this.masterPassword = process.env.MEGA_MASTER_PASSWORD;
    this.sessionDir = './sessions';
    this.storage = null;
  }

  async initialize() {
    try {
      if (!this.sessionId) {
        console.log('ℹ️ No SESSION_ID set, skipping Mega download');
        return { success: true, skipped: true };
      }
      if (!this.masterEmail || !this.masterPassword) {
        console.log('ℹ️ Mega credentials not set, skipping Mega download');
        return { success: true, skipped: true };
      }

      console.log(`🔍 Looking for file: ${this.sessionId}/creds.json`);

      this.ensureSessionDirectory();

      // Connect to MEGA
      console.log('🔗 Connecting to MEGA storage...');
      this.storage = await new Promise((resolve, reject) => {
        const storage = new Storage({
          email: this.masterEmail,
          password: this.masterPassword,
        });

        storage.on('ready', () => {
          console.log('✅ Connected to MEGA storage successfully');
          resolve(storage);
        });

        storage.on('error', (error) => {
          reject(new Error(`MEGA connection failed: ${error.message}`));
        });

        setTimeout(() => {
          reject(new Error('MEGA connection timeout'));
        }, 15000);
      });

      // Search for exact match
      const matchingFile = await this.findFileByExactName(
        `${this.sessionId}/creds.json`
      );

      if (!matchingFile) {
        console.log(`ℹ️ No file found: ${this.sessionId}/creds.json`);
        this.storage.close();
        return { success: true, skipped: true };
      }

      // Download and rename
      await this.downloadAndRenameFile(
        matchingFile,
        path.join(this.sessionDir, 'creds.json')
      );

      console.log('✅ Creds file successfully downloaded from MEGA storage');
      console.log(`✅ Saved to: ${path.join(this.sessionDir, 'creds.json')}`);

      this.storage.close();

      return {
        success: true,
        sessionId: this.sessionId,
        originalFileName: matchingFile.name,
        destination: path.join(this.sessionDir, 'creds.json'),
      };
    } catch (error) {
      console.error('❌ Mega Error:', error.message);
      if (this.storage) {
        this.storage.close();
      }
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async findFileByExactName(targetName) {
    return new Promise((resolve) => {
      const children = this.storage.root.children || [];
      console.log(`📁 Found ${children.length} items in root directory`);

      for (const child of children) {
        console.log(`🔍 Checking: ${child.name}`);
        if (!child.directory && child.name === targetName) {
          console.log(`✅ Found exact match: ${child.name}`);
          resolve(child);
          return;
        }
      }

      console.log(`ℹ️ No exact match found for: ${targetName}`);
      resolve(null);
    });
  }

  async downloadAndRenameFile(file, destinationPath) {
    return new Promise((resolve, reject) => {
      console.log(`📥 Downloading: ${file.name} → creds.json`);

      const stream = file.download();
      const writeStream = fs.createWriteStream(destinationPath);

      stream.pipe(writeStream);

      writeStream.on('finish', () => {
        console.log(`✅ File renamed to: creds.json`);
        resolve();
      });

      writeStream.on('error', (error) => {
        reject(new Error(`Download failed: ${error.message}`));
      });

      stream.on('error', (error) => {
        reject(new Error(`Download stream error: ${error.message}`));
      });
    });
  }

  ensureSessionDirectory() {
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
      console.log(`📁 Created directory: ${this.sessionDir}`);
    }
  }
}

export default MegaSessionManager;

// Example usage (uncomment if you want to run directly):
// const manager = new MegaSessionManager();
// manager.initialize().then(console.log).catch(console.error);
