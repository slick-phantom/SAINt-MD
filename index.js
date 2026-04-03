import dotenv from 'dotenv';
dotenv.config();

import SavyDniXBot from './core/bot.js';
import logger from './utils/logger.js';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import supabaseSessionRestorer from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// HTTP Server for Uptime Checks
const server = http.createServer((req, res) => {
    if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'OK',
            service: 'SAINT MD',
            time: new Date().toISOString()
        }));
    } else {
        res.writeHead(200);
        res.end('SAINT MD ✅');
    }
});

async function initializeBot() {
    try {
        displayBanner();
        
        const supabaseRestorer = supabaseSessionRestorer;
        
        if (process.env.SESSION_ID) {
            console.log(`🔍 Supabase: Attempting to restore session [${process.env.SESSION_ID}]`);
            const restoreResult = await supabaseRestorer.restoreSession();
            
            if (restoreResult.success) {
                console.log(`✅ Supabase: Session restored successfully!`);
            } else {
                console.log(`❌ Supabase: Restore failed: ${restoreResult.error}`);
                console.log("💡 Falling back to local session check...");
            }
        } else {
            console.log("ℹ️ No SESSION_ID in .env, checking local /sessions/ folder...");
        }
        
        // Wait a brief moment for filesystem sync if needed
        if (!sessionExists()) {
            console.log("\n❌ Authentication Failure: No WhatsApp session found.");
            console.log("💡 Fixes:");
            console.log("   1. Check your Supabase credentials (URL/KEY)");
            console.log("   2. Ensure SESSION_ID matches an ID in your Supabase bucket");
            console.log("   3. Or manually place creds.json in: ./sessions/");
            
            const availableSessions = await supabaseRestorer.searchSessions();
            if (availableSessions && availableSessions.length > 0) {
                console.log("\n📋 Found these Session IDs in Supabase:");
                availableSessions.forEach(session => {
                    console.log(`   📁 ID: ${session.sessionId}`);
                });
                console.log("\n💡 Set one of these as your SESSION_ID in your hosting environment.");
            }
            
            // Clean up connection before exit
            if (supabaseRestorer.close) await supabaseRestorer.close();
            process.exit(1);
        }
        
        logger.info("Initializing Savy DNI Bot Core...");
        const bot = new SavyDniXBot();
        await bot.initialize();
        
        logger.success("🚀 SUCCESS: Bot is connected to WhatsApp!");
        
        const status = bot.getStatus();
        console.log("\n📊 SYSTEM REPORT:");
        console.log(`   Connection:  ${status.isConnected ? "CONNECTED ✅" : "DISCONNECTED ❌"}`);
        console.log(`   Source:      ${process.env.SESSION_ID ? "Cloud (Supabase)" : "Local Storage"}`);
        console.log(`   Commands:    ${status.commandCount} loaded`);
        console.log(`   Web Server:  Port ${PORT} ✅`);
        
        // Only close if your Supabase restorer has a close method (usually not needed for Supabase JS client)
        if (supabaseRestorer.close) await supabaseRestorer.close();
        
    } catch (error) {
        logger.error("FATAL ERROR during startup:", error.message);
        process.exit(1);
    }
}

function displayBanner() {
    console.log("\n" + "═".repeat(50));
    console.log("🤖        SAINT MD WHATSAPP BOT (Supabase Edition)      🤖");
    console.log("═".repeat(50));
}

function sessionExists() {
    // Ensure the path points to where your supabase.js downloads the file
    const sessionPath = path.join(__dirname, "sessions", "creds.json");
    return fs.existsSync(sessionPath);
}

function gracefulShutdown(signal) {
    console.log("\n");
    logger.info(`Shutting down (Signal: ${signal})...`);
    server.close(() => {
        console.log('🛑 HTTP Server Offline');
        process.exit(0);
    });
}

// Start HTTP server then Init Bot
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Uptime service active on port ${PORT}`);
    initializeBot();
});

// System Event Listeners
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
    logger.error("UNCAUGHT EXCEPTION:", error);
});
process.on("unhandledRejection", (reason, promise) => {
    logger.error("UNHANDLED REJECTION:", reason);
});
