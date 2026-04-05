import { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import readline from "readline";
import fs from "fs";
import CommandHandler from "./utils/command.js";
import logger from "./utils/logger.js";

// Visual Helpers
const banner = `
\x1b[36m*******************************************
* WHATSAPP BOT INITIALIZED         *
* Powered by Baileys & Gemini       *
*******************************************\x1b[0m
`;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    console.clear();
    console.log(banner);

    // 1. Get User Configuration
    const prefix = await question("\x1b[33m[?] Enter your desired command prefix (e.g., ! or .): \x1b[0m") || "!";
    console.log(`\x1b[32m[✓] Prefix set to: ${prefix}\x1b[0m\n`);

    // 2. Initialize Command Handler
    const handler = new CommandHandler();
    await handler.loadCommands();

    // 3. Setup Auth State
    const sessionDir = './session';
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
    });

    // 4. Pairing Code Logic (Skip if session exists)
    if (!sock.authState.creds.registered) {
        console.log("\x1b[35m[!] No existing session found. Preparing Pairing Code...\x1b[0m");
        const phoneNumber = await question("\x1b[33m[?] Enter your phone number (with country code): \x1b[0m");
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\n\x1b[42m\x1b[30m YOUR PAIRING CODE: ${code} \x1b[0m\n`);
    } else {
        console.log("\x1b[32m[✓] Existing session detected. Connecting...\x1b[0m");
    }

    // 5. Connection Updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("\x1b[31m[!] Connection lost. Reconnecting...\x1b[0m");
                startBot();
            }
        } else if (connection === 'open') {
            console.log("\x1b[32m\x1b[1m[SUCCESS] Bot is now online and listening for commands!\x1b[0m\n");
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // 6. Message Handling (With Self-Response Support)
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const m = messages[0];
        if (!m.message) return;

        const jid = m.key.remoteJid;
        const text = m.message.conversation || 
                     m.message.extendedTextMessage?.text || 
                     m.message.imageMessage?.caption || "";

        // If it starts with the prefix, process it
        if (text.startsWith(prefix)) {
            const args = text.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            // Interactive Console Log for incoming commands
            const sender = m.key.fromMe ? "YOU (Owner)" : m.pushName || jid;
            console.log(`\x1b[34m[CMD] ${sender} used: ${commandName}\x1b[0m`);

            try {
                if (handler.hasCommand(commandName)) {
                    await handler.executeCommand(commandName, m, sock, args);
                }
            } catch (error) {
                logger.error(`Error executing ${commandName}:`, error);
            }
        }
    });
}

startBot();
