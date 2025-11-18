// redis.js - Session Restorer
import Redis from 'ioredis';
import fs from 'fs/promises';
import path from 'path';

class RedisSessionRestorer {
    constructor() {
        this.redis = new Redis({
            host: 'redis-14715.c262.us-east-1-3.ec2.cloud.redislabs.com',
            port: 14715,
            username: 'default',
            password: 'oGRykO7ZnVfaKgjBBiD6bZQpiLlWYUhv',
            tls: {} // Required for Redis Cloud
        });

        this.redis.on('connect', () => {
            console.log('✅ Connected to Redis Cloud');
        });

        this.redis.on('error', (err) => {
            console.error('❌ Redis error:', err);
        });
    }

    /**
     * Restore session from Redis to sessions folder
     */
    async restoreSession() {
        try {
            // Get session ID from environment variable
            const sessionId = process.env.SESSION_ID;
            if (!sessionId) {
                throw new Error('❌ SESSION_ID environment variable is required');
            }

            console.log(`🔍 Looking for session: ${sessionId}`);

            // Search for matching files in Redis
            const keys = await this.redis.keys(`*${sessionId}*/creds.json`);
            
            if (keys.length === 0) {
                throw new Error(`❌ No session found matching: ${sessionId}`);
            }

            // Use the first matching key
            const matchingKey = keys[0];
            console.log(`✅ Found session: ${matchingKey}`);

            // Download the creds data from Redis
            const credsData = await this.redis.get(matchingKey);
            if (!credsData) {
                throw new Error(`❌ Session data is empty for: ${matchingKey}`);
            }

            // Parse the JSON to validate it
            const parsedCreds = JSON.parse(credsData);
            console.log(`📥 Downloaded session data for: ${parsedCreds.me?.id || 'unknown'}`);

            // Create sessions folder if it doesn't exist
            const sessionsDir = './sessions';
            await fs.mkdir(sessionsDir, { recursive: true });

            // Save as creds.json in sessions folder
            const credsPath = path.join(sessionsDir, 'creds.json');
            await fs.writeFile(credsPath, JSON.stringify(parsedCreds, null, 2));
            
            console.log(`✅ Session restored to: ${credsPath}`);
            console.log(`📁 File created: creds.json`);

            return {
                success: true,
                sessionId: matchingKey.replace('/creds.json', ''),
                filePath: credsPath,
                creds: parsedCreds
            };

        } catch (error) {
            console.error('❌ Session restoration failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Search for available sessions in Redis
     */
    async searchSessions(searchPattern = '') {
        try {
            const pattern = searchPattern ? `*${searchPattern}*/creds.json` : '*/creds.json';
            const keys = await this.redis.keys(pattern);
            const sessions = keys.map(key => ({
                sessionId: key.replace('/creds.json', ''),
                key: key
            }));
            
            console.log(`🔍 Found ${sessions.length} sessions matching: ${searchPattern || 'all'}`);
            return sessions;
        } catch (error) {
            console.error('❌ Search failed:', error);
            return [];
        }
    }

    /**
     * Close Redis connection
     */
    async close() {
        await this.redis.quit();
        console.log('🔒 Redis connection closed');
    }
}

// Create and export singleton instance
const redisRestorer = new RedisSessionRestorer();
export default redisRestorer;