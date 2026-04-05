import './settings.js';
import { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    jidDecode, 
    delay 
} from "@whiskeysockets/baileys";
import { Boom } from '@hapi/boom';
import fs from 'fs';
import chalk from 'chalk';
import pino from 'pino';
import readline from 'readline';
import NodeCache from "node-cache";
import path from 'path';
import { fileURLToPath } from 'url';
import { handleMessages, handleGroupParticipantUpdate, handleStatus } from './main.js';
import store from './lib/lightweight_store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize store
store.readFromFile();
setInterval(() => store.writeToFile(), 10000);

// Memory optimization
setInterval(() => {
    if (global.gc) global.gc();
}, 60000);

setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024;
    if (used > 400) {
        console.log(chalk.red('⚠️ RAM too high, restarting...'));
        process.exit(1);
    }
}, 30000);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startXeonBotInc() {
    try {
        const { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        const msgRetryCounterCache = new NodeCache();

        const XeonBotInc = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            msgRetryCounterCache,
            getMessage: async (key) => {
                let msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || "";
            }
        });

        XeonBotInc.ev.on('creds.update', saveCreds);
        store.bind(XeonBotInc.ev);

        // Pairing Code Implementation
        if (!XeonBotInc.authState.creds.registered) {
            console.clear();
            const phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`\nPlease type your WhatsApp number 😍\nFormat: 2348123456789 : `)));
            const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
            
            setTimeout(async () => {
                try {
                    let code = await XeonBotInc.requestPairingCode(cleanNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.white.bold(code));
                } catch (err) {
                    console.error('Pairing Error:', err);
                }
            }, 3000);
        }

        // Connection Handling
        XeonBotInc.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect } = s;
            if (connection === 'open') {
                console.log(chalk.yellow(`\n🌿 Connected to => ${XeonBotInc.user.id}`));
            }
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) startXeonBotInc();
            }
        });

        // Message Listener
        XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek.message) return;
                
                // Route to main.js
                await handleMessages(XeonBotInc, chatUpdate, true);
            } catch (err) {
                console.error("Error in messages.upsert:", err);
            }
        });

        // Custom Functions
        XeonBotInc.decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return decode.user && decode.server && decode.user + '@' + decode.server || jid;
            } else return jid;
        };

        return XeonBotInc;
    } catch (error) {
        console.error('Fatal Error:', error);
        setTimeout(startXeonBotInc, 5000);
    }
}

startXeonBotInc();
