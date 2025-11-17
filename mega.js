// mega.js (UPDATED - looks for session ID in filename)
import mega from 'megajs';
import fs from 'fs';
import path from 'path';

class MegaSessionManager {
    constructor() {
        this.sessionId = process.env.SESSION_ID;
        this.masterEmail = process.env.MEGA_MASTER_EMAIL;
        this.masterPassword = process.env.MEGA_MASTER_PASSWORD;
        this.sessionDir = './sessions';
    }

    async initialize() {
        try {
            // Check if SESSION_ID is set
            if (!this.sessionId) {
                throw new Error('SESSION_ID environment variable is not set');
            }
            if (!this.masterEmail) {
                throw new Error('MEGA_MASTER_EMAIL environment variable is not set');
            }
            if (!this.masterPassword) {
                throw new Error('MEGA_MASTER_PASSWORD environment variable is not set');
            }

            console.log(`🔍 Looking for files containing: ${this.sessionId}`);

            // Ensure session directory exists
            this.ensureSessionDirectory();

            // Connect to MEGA storage
            const storage = await this.connectToMega();

            // Find files that contain our SESSION_ID in the filename
            const matchingFiles = await this.findFilesBySessionId(storage, this.sessionId);
            
            if (matchingFiles.length === 0) {
                throw new Error(`No files found containing session ID: ${this.sessionId}`);
            }

            // Download the first matching file and rename to creds.json
            const credsFile = matchingFiles[0];
            await this.downloadAndRenameFile(credsFile, path.join(this.sessionDir, 'creds.json'));

            console.log('✅ Creds file successfully downloaded from MEGA storage');
            console.log(`✅ Saved to: ${path.join(this.sessionDir, 'creds.json')}`);

            return {
                success: true,
                sessionId: this.sessionId,
                originalFileName: credsFile.name,
                destination: path.join(this.sessionDir, 'creds.json')
            };

        } catch (error) {
            console.error('❌ Error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async connectToMega() {
        return new Promise((resolve, reject) => {
            console.log('🔗 Connecting to MEGA storage...');

            const storage = mega({
                email: this.masterEmail,
                password: this.masterPassword,
                autologin: true
            });

            storage.on('ready', () => {
                console.log('✅ Connected to MEGA storage successfully');
                resolve(storage);
            });

            storage.on('error', (error) => {
                reject(new Error(`MEGA connection failed: ${error.message}`));
            });

            // Timeout after 15 seconds
            setTimeout(() => {
                reject(new Error('MEGA connection timeout'));
            }, 15000);
        });
    }

    async findFilesBySessionId(storage, sessionId) {
        const matchingFiles = [];
        
        // Search through all files in MEGA storage
        for (const file of storage.files) {
            // Look for files that contain the session ID in their filename
            if (!file.directory && file.name.includes(sessionId)) {
                console.log(`✅ Found matching file: ${file.name}`);
                matchingFiles.push(file);
            }
        }

        return matchingFiles;
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