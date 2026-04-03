import 'dotenv/config';
import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';


import CommandHandler from './command.js';
import messageHandler from './message.js';

export default async function startSaint() {
    console.log("\x1b[36m%s\x1b[0m", "💠--------------------------------------------------💠");
    console.log("\x1b[35m%s\x1b[0m", "✨ SAINT MD: Igniting the engines...");
    console.log("\x1b[36m%s\x1b[0m", "💠--------------------------------------------------💠");

    const handler = new CommandHandler();
    await handler.loadCommands();

    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    const { version } = await fetchLatestBaileysVersion();

    // Silent logger override
    

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys),
        },
        browser: ['Chrome', 'Windows', '10.0'],
        syncFullHistory: false,
        markOnlineOnConnect: true,
        logger: pino({ level: 'silent' })// ensures Baileys stays quiet
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("\x1b[33m%s\x1b[0m", "♻️ Saint MD: Connection lost. Reconnecting...");
                startSaint(); 
            }
        } else if (connection === 'open') {
            console.log("\x1b[36m%s\x1b[0m", "💠--------------------------------------------------💠");
            console.log("\x1b[32m%s\x1b[0m", "✅ SAINT MD IS ONLINE 🌟");
            console.log(`🤖 Bot       : Saint MD`);
            console.log(`📡 Prefix    : ${process.env.PREFIX}`);
            console.log("🎉 Status    : Bot Connected Successfully 🎉");
            console.log("🔗 Channel   : https://whatsapp.com/channel/0029VbCoGmm8kyyJg9kcBV3m");
            console.log("\x1b[36m%s\x1b[0m", "💠--------------------------------------------------💠");

            // Send welcome with channel button
            sock.sendMessage(process.env.OWNER_NUMBER + "@s.whatsapp.net", {
                text: "🚀 *Saint MD is now connected successfully!* 🎉\n\nStay updated by joining our official channel 👇",
                footer: "Saint MD Bot",
                buttons: [
                    { buttonId: "join_channel", buttonText: { displayText: "📢 Join Channel" }, type: 1 }
                ],
                headerType: 1
            });
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // Robust extraction
        if (msg.message.ephemeralMessage) msg.message = msg.message.ephemeralMessage.message;
        if (msg.message.viewOnceMessage) msg.message = msg.message.viewOnceMessage.message;

        const messageContent = msg.message.conversation ||
                               msg.message.extendedTextMessage?.text ||
                               msg.message.imageMessage?.caption ||
                               msg.message.videoMessage?.caption ||
                               msg.message.documentMessage?.caption ||
                               "";

        const prefix = process.env.PREFIX || "!";

        if (messageContent.startsWith(prefix)) {
            const commandName = messageContent.slice(prefix.length).trim().split(/ +/)[0].toLowerCase();
            console.log("\x1b[34m%s\x1b[0m", `📩 [Saint MD] Command Received: ${prefix}${commandName}`);
            await messageHandler(sock, m, handler);
        }
    });

    return sock;
}
