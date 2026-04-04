import 'dotenv/config';
import startSaint from './core/bot.js';
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
        res.end('SAINT MD IS ACTIVE ✅');
    }
});

async function initializeBot() {
    try {
        displayBanner();
        
        const supabaseRestorer = supabaseSessionRestorer;
        
        // 1. FIRST: Check if local session exists
        const hasLocalSession = sessionExists();
        
        if (hasLocalSession) {
            console.log(`\x1b[32m%s\x1b[0m`, `✅ Local session found in ./sessions/`);
            console.log(`\x1b[34m%s\x1b[0m`, `🔍 Using existing local session...`);
        } else {
            console.log(`\x1b[33m%s\x1b[0m`, `⚠️ No local session found.`);
            
            // 2. ONLY try Supabase restoration if NO local session exists
            if (process.env.SESSION_ID) {
                console.log(`\x1b[34m%s\x1b[0m`, `🔍 Supabase: Attempting to restore session [${process.env.SESSION_ID}]`);
                
                try {
                    const restoreResult = await supabaseRestorer.restoreSession();
                    
                    if (restoreResult && restoreResult.success) {
                        console.log(`\x1b[32m%s\x1b[0m`, `✅ Supabase: Session restored successfully!`);
                    } else {
                        console.log(`\x1b[31m%s\x1b[0m`, `❌ Supabase: Restore failed: ${restoreResult?.error || 'Unknown error'}`);
                        console.log(`\x1b[33m%s\x1b[0m`, `💡 You'll need to scan the QR code to create a new session.`);
                    }
                } catch (supabaseError) {
                    console.log(`\x1b[31m%s\x1b[0m`, `❌ Supabase error: ${supabaseError.message}`);
                    console.log(`\x1b[33m%s\x1b[0m`, `💡 Continuing without Supabase restore...`);
                }
            } else {
                console.log(`\x1b[33m%s\x1b[0m`, `💡 No SESSION_ID in .env. Will create new session via QR code.`);
            }
        }
        
        // 3. Final check: Do we have a session now?
        const sessionExistsNow = sessionExists();
        
        if (!sessionExistsNow) {
            console.log(`\x1b[36m%s\x1b[0m`, `\n📱 No existing session found. A QR code will be generated for you to scan.\n`);
            console.log(`\x1b[33m%s\x1b[0m`, `⚠️ Make sure you have WhatsApp open and ready to scan the QR code.\n`);
        } else {
            const stats = fs.statSync(path.join(__dirname, "sessions", "creds.json"));
            const fileSize = (stats.size / 1024).toFixed(2);
            console.log(`\x1b[32m%s\x1b[0m`, `✅ Session file found (${fileSize} KB)`);
        }
        
        // 4. Start the Bot
        console.log(`\x1b[35m%s\x1b[0m`, "\n🚀 INITIALIZING SAINT MD CORE...");
        console.log(`\x1b[36m%s\x1b[0m`, "═".repeat(50));
        
        await startSaint();
        
    } catch (error) {
        console.error(`\x1b[31m%s\x1b[0m`, "FATAL ERROR during startup:", error.message);
        console.error(error.stack);
        
        // Don't exit immediately, give chance to retry
        console.log(`\x1b[33m%s\x1b[0m`, "\n🔄 Restarting in 5 seconds...");
        setTimeout(() => {
            initializeBot();
        }, 5000);
    }
}

function displayBanner() {
    console.log(`\x1b[36m%s\x1b[0m`, "\n" + "═".repeat(55));
    console.log(`\x1b[36m%s\x1b[0m`, "🤖          SAINT MD WHATSAPP BOT (PRO)          🤖");
    console.log(`\x1b[36m%s\x1b[0m`, "═".repeat(55));
    console.log(`\x1b[33m%s\x1b[0m`, `📡 Version: 2.0.0 | Status: Initializing...`);
    console.log(`\x1b[36m%s\x1b[0m`, "═".repeat(55));
}

function sessionExists() {
    const sessionPath = path.join(__dirname, "sessions", "creds.json");
    const sessionDir = path.join(__dirname, "sessions");
    
    // Check if directory exists first
    if (!fs.existsSync(sessionDir)) {
        return false;
    }
    
    // Check if creds.json exists
    if (!fs.existsSync(sessionPath)) {
        return false;
    }
    
    // Check if file has content (not empty)
    try {
        const stats = fs.statSync(sessionPath);
        if (stats.size === 0) {
            console.log(`\x1b[33m%s\x1b[0m`, `⚠️ creds.json exists but is empty`);
            return false;
        }
        return true;
    } catch (err) {
        return false;
    }
}

function gracefulShutdown(signal) {
    console.log("\n");
    console.log(`\x1b[33m%s\x1b[0m`, `🛑 Shutting down (Signal: ${signal})...`);
    
    // Close server
    if (server && server.close) {
        server.close(() => {
            console.log(`\x1b[32m%s\x1b[0m`, `✅ Server closed gracefully`);
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
    
    // Force exit after 5 seconds if not closed
    setTimeout(() => {
        console.log(`\x1b[31m%s\x1b[0m`, `⚠️ Force exiting...`);
        process.exit(1);
    }, 5000);
}

// Start HTTP server then Initialize Bot
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\x1b[32m%s\x1b[0m`, `📡 Uptime service active on port ${PORT}`);
    console.log(`\x1b[32m%s\x1b[0m`, `🌐 Health check: http://localhost:${PORT}/ping`);
    initializeBot();
});

// System Event Listeners
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
    console.error(`\x1b[31m%s\x1b[0m`, "UNCAUGHT EXCEPTION:", error.message);
    console.error(error.stack);
});

process.on("unhandledRejection", (reason) => {
    console.error(`\x1b[31m%s\x1b[0m`, "UNHANDLED REJECTION:", reason);
});