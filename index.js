/*
ort dotenv from 'dotenv';
dotenv.config();

import Bot from './core/bot.js';
import logger from './utils/logger.js';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import redisSessionRestorer from './redis.js'; // Replace Mega with Redis

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create HTTP server FIRST (outside the function)
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'OK',
            service: 'Savy DNI Bot',
            time: new Date().toISOString()
        }));
    } else {
        res.writeHead(200);
        res.end('Savy DNI Bot ✅');
    }
});

async function initializeBot() {
    try {
        displayBanner();
        
        // Initialize Redis session restorer
        const redisRestorer =  redisSessionRestorer()import dotenv from 'dotenv
        */

import Bot from './core/bot.js';
import logger from './utils/logger.js';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import redisSessionRestorer from './redis.js'; // Replace Mega with Redis

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create HTTP server FIRST (outside the function)
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'OK',
            service: 'Savy DNI Bot',
            time: new Date().toISOString()
        }));
    } else {
        res.writeHead(200);
        res.end('Savy DNI Bot ✅');
    }
});

async function initializeBot() {
    try {
        displayBanner();
        
        // Initialize Redis session restorer
        const redisRestorer =  redisSessionRestorer;
        
        // Check if SESSION_ID is provided in environment
        if (process.env.SESSION_ID) {
            console.log(`🔍 Attempting to restore session: ${process.env.SESSION_ID}`);
            const restoreResult = await redisRestorer.restoreSession();
            
            if (restoreResult.success) {
                console.log(`✅ Session restored: ${restoreResult.sessionId}`);
            } else {
                console.log(`❌ Redis session restore failed: ${restoreResult.error}`);
                console.log("💡 Falling back to local session check...");
            }
        } else {
            console.log("ℹ️  No SESSION_ID provided, checking for local session...");
        }
        
        // Check if session exists after Redis restore attempt
        if (!sessionExists()) {
            console.log("\n❌ No WhatsApp session found.");
            console.log("\n💡 To use this bot:");
            console.log("   1. Visit the pairing service to get a session");
            console.log("   2. Set SESSION_ID in .env to restore from Redis");
            console.log("   3. Or place creds.json in the sessions/ folder");
            console.log("\n📁 Current sessions directory: ./sessions/");
            
            // Show available sessions in Redis
            const availableSessions = await redisRestorer.searchSessions();
            if (availableSessions.length > 0) {
                console.log("\n📋 Available sessions in Redis:");
                availableSessions.forEach(session => {
                    console.log(`   📁 ${session.sessionId}`);
                });
                console.log("\n💡 Copy any session ID above and set it as SESSION_ID in .env");
            }
            
            await redisRestorer.close();
            process.exit(1);
        }
        
        logger.info("Starting Savy DNI Bot...");
        
        // Initialize and start the bot
        const bot = new Bot();
        await bot.initialize();
        
        logger.success("✅ Bot is now running and connected to WhatsApp!");
        
        // Display bot status
        const status = bot.getStatus();
        console.log("\n📊 Bot Status:");
        console.log(`   Connected: ${status.isConnected ? "✅" : "❌"}`);
        console.log(`   Session: ${process.env.SESSION_ID ? "🔄 Restored from Redis" : "📁 Local file"}`);
        console.log(`   Commands: ${status.commandCount}`);
        console.log(`   Ping Server: ✅ Running on port ${PORT}`);
        console.log("\n💡 The bot is now running. Press Ctrl+C to stop.");
        
        // Close Redis connection
        await redisRestorer.close();
        
    } catch (error) {
        logger.error("Failed to start bot:", error.message);
        
        if (error.message.includes("No sessions available") || error.message.includes("creds.json")) {
            console.log("\n❌ Session authentication failed.");
            console.log("\n💡 The creds.json file may be invalid or expired.");
            console.log("   Please obtain a new creds.json file from the pairing service.");
        } else {
            console.log("\n💡 Error details:", error.message);
        }
        process.exit(1);
    }
}

function displayBanner() {
    console.log("\n" + "═".repeat(50));
    console.log("🤖  S A V Y   D N I   W H A T S A P P   B O T  🤖");
    console.log("═".repeat(50));
}

function sessionExists() {
    try {
        return fs.existsSync(path.join(__dirname, "sessions", "creds.json"));
    } catch (error) {
        logger.error("Error checking session:", error);
        return false;
    }
}

function gracefulShutdown(signal) {
    console.log("\n");
    logger.info(`Received ${signal}, shutting down...`);
    server.close(() => {
        console.log('🛑 HTTP server closed');
        process.exit(0);
    });
}

// Start the HTTP server FIRST
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Ping server running on port ${PORT}`);
    console.log(`🌐 Uptime check: https://your-app.onrender.com/ping`);
    
    // THEN initialize the bot
    initializeBot();
});

// Process event handlers
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
});
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});;
        
        // Check if SESSION_ID is provided in environment
        if (process.env.SESSION_ID) {
            console.log(`🔍 Attempting to restore session: ${process.env.SESSION_ID}`);
            const restoreResult = await redisRestorer.restoreSession();
            
            if (restoreResult.success) {
                console.log(`✅ Session restored: ${restoreResult.sessionId}`);
            } else {
                console.log(`❌ Redis session restore failed: ${restoreResult.error}`);
                console.log("💡 Falling back to local session check...");
            }
        } else {
            console.log("ℹ️  No SESSION_ID provided, checking for local session...");
        }
        
        // Check if session exists after Redis restore attempt
        if (!sessionExists()) {
            console.log("\n❌ No WhatsApp session found.");
            console.log("\n💡 To use this bot:");
            console.log("   1. Visit the pairing service to get a session");
            console.log("   2. Set SESSION_ID in .env to restore from Redis");
            console.log("   3. Or place creds.json in the sessions/ folder");
            console.log("\n📁 Current sessions directory: ./sessions/");
            
            // Show available sessions in Redis
            const availableSessions = await redisRestorer.searchSessions();
            if (availableSessions.length > 0) {
                console.log("\n📋 Available sessions in Redis:");
                availableSessions.forEach(session => {
                    console.log(`   📁 ${session.sessionId}`);
                });
                console.log("\n💡 Copy any session ID above and set it as SESSION_ID in .env");
            }
            
            await redisRestorer.close();
            process.exit(1);
        }
        
        logger.info("Starting Savy DNI Bot...");
        
        // Initialize and start the bot
        const bot = new Bot();
        await bot.initialize();
        
        logger.success("✅ Bot is now running and connected to WhatsApp!");
        
        // Display bot status
        const status = bot.getStatus();
        console.log("\n📊 Bot Status:");
        console.log(`   Connected: ${status.isConnected ? "✅" : "❌"}`);
        console.log(`   Session: ${process.env.SESSION_ID ? "🔄 Restored from Redis" : "📁 Local file"}`);
        console.log(`   Commands: ${status.commandCount}`);
        console.log(`   Ping Server: ✅ Running on port ${PORT}`);
        console.log("\n💡 The bot is now running. Press Ctrl+C to stop.");
        
        // Close Redis connection
        await redisRestorer.close();
        
    } catch (error) {
        logger.error("Failed to start bot:", error.message);
        
        if (error.message.includes("No sessions available") || error.message.includes("creds.json")) {
            console.log("\n❌ Session authentication failed.");
            console.log("\n💡 The creds.json file may be invalid or expired.");
            console.log("   Please obtain a new creds.json file from the pairing service.");
        } else {
            console.log("\n💡 Error details:", error.message);
        }
        process.exit(1);
    }
}

function displayBanner() {
    console.log("\n" + "═".repeat(50));
    console.log("🤖  S A V Y   D N I   W H A T S A P P   B O T  🤖");
    console.log("═".repeat(50));
}

function sessionExists() {
    try {
        return fs.existsSync(path.join(__dirname, "sessions", "creds.json"));
    } catch (error) {
        logger.error("Error checking session:", error);
        return false;
    }
}

function gracefulShutdown(signal) {
    console.log("\n");
    logger.info(`Received ${signal}, shutting down...`);
    server.close(() => {
        console.log('🛑 HTTP server closed');
        process.exit(0);
    });
}

// Start the HTTP server FIRST
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Ping server running on port ${PORT}`);
    console.log(`🌐 Uptime check: https://your-app.onrender.com/ping`);
    
    // THEN initialize the bot
    initializeBot();
});

// Process event handlers
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
});
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});