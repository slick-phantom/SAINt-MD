// mega.js (FIXED - proper Mega API usage)
import * as mega from 'megajs';
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

            // Connect to MEGA storage and search for files
            const matchingFile = await this.findFileBySessionId(this.sessionId);
            
            if (!matchingFile) {
                console.log(`ℹ️  No files found containing session ID: ${this.sessionId}`);
                return { success: true, skipped: true };
            }

            // Download the matching file and rename to creds.json
            await this.downloadAndRenameFile(matchingFile, path.join(this.sessionDir, 'creds.json'));

            console.log('✅ Creds file successfully downloaded from MEGA storage');
            console.log(`✅ Saved to: ${path.join(this.sessionDir, 'creds.json')}`);

            return {
                success: true,
                sessionId: this.sessionId,
                originalFileName: matchingFile.name,
                destination: path.join(this.sessionDir, 'creds.json')
            };

        } catch (error) {
            console.error('❌ Mega Error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async findFileBySessionId(sessionId) {
        return new Promise((resolve, reject) => {
            console.log('🔗 Connecting to MEGA storage...');

            const storage = new mega.Storage({
                email: this.masterEmail,
                password: this.masterPassword,
                autologin: true
            });

            storage.on('ready', () => {
                console.log('✅ Connected to MEGA storage successfully');
                
                try {
                    // Get root directory and search for files
                    const root = storage.root;
                    
                    // Use the proper Mega API to get files
                    root.getChildren((err, files) => {
                        if (err) {
                            reject(new Error(`Failed to get files: ${err.message}`));
                            return;
                        }

                        // Search for files containing the session ID
                        for (const file of files) {
                            if (!file.directory && file.name.includes(sessionId)) {
                                console.log(`✅ Found matching file: ${file.name}`);
                                storage.close();
                                resolve(file);
                                return;
                            }
                        }

                        console.log(`ℹ️  No matching files found for: ${sessionId}`);
                        storage.close();
                        resolve(null);
                    });
                } catch (error) {
                    storage.close();
                    reject(error);
                }
            });

            storage.on('error', (error) => {
                reject(new Error(`MEGA connection failed: ${error.message}`));
            });

            // Timeout after 15 seconds
            setTimeout(() => {
                storage.close();
                reject(new Error('MEGA connection timeout'));
            }, 15000);
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