// mega.js (FIXED - Proper file iteration)
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
            // Check if SESSION_ID is set
            if (!this.sessionId) {
                console.log('ℹ️  No SESSION_ID set, skipping Mega download');
                return { success: true, skipped: true };
            }
            if (!this.masterEmail || !this.masterPassword) {
                console.log('ℹ️  Mega credentials not set, skipping Mega download');
                return { success: true, skipped: true };
            }

            console.log(`🔍 Looking for files containing: ${this.sessionId}`);

            // Ensure session directory exists
            this.ensureSessionDirectory();

            // Connect to MEGA storage
            console.log('🔗 Connecting to MEGA storage...');
            this.storage = await new Promise((resolve, reject) => {
                const storage = new Storage({
                    email: this.masterEmail,
                    password: this.masterPassword
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

            // Search for the matching file
            const matchingFile = await this.findFileBySessionId(this.sessionId);
            
            if (!matchingFile) {
                console.log(`ℹ️  No files found containing session ID: ${this.sessionId}`);
                this.storage.close();
                return { success: true, skipped: true };
            }

            // Download and rename the file
            await this.downloadAndRenameFile(matchingFile, path.join(this.sessionDir, 'creds.json'));
            
            console.log('✅ Creds file successfully downloaded from MEGA storage');
            console.log(`✅ Saved to: ${path.join(this.sessionDir, 'creds.json')}`);

            this.storage.close();

            return {
                success: true,
                sessionId: this.sessionId,
                originalFileName: matchingFile.name,
                destination: path.join(this.sessionDir, 'creds.json')
            };

        } catch (error) {
            console.error('❌ Mega Error:', error.message);
            if (this.storage) {
                this.storage.close();
            }
            return {
                success: false,
                error: error.message
            };
        }
    }

    async findFileBySessionId(sessionId) {
        return new Promise((resolve, reject) => {
            // Get files from root directory
            this.storage.root.children((err, children) => {
                if (err) {
                    reject(new Error(`Failed to get files: ${err.message}`));
                    return;
                }

                console.log(`📁 Found ${children.length} items in root directory`);

                // Search through all children
                for (const child of children) {
                    console.log(`🔍 Checking: ${child.name} (type: ${child.directory ? 'folder' : 'file'})`);
                    
                    // Check if it's a file and name contains sessionId
                    if (!child.directory && child.name && child.name.includes(sessionId)) {
                        console.log(`✅ Found matching file: ${child.name}`);
                        resolve(child);
                        return;
                    }
                }

                console.log(`ℹ️  No matching files found for: ${sessionId}`);
                resolve(null);
            });
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