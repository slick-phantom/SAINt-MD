import makeWASocket, { 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    useMultiFileAuthState, 
    jidDecode 
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import fs from 'fs';

import CommandHandler from './command.js';
import messageHandler from './message.js';

async function startSaint() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./sessions');
        const { version } = await fetchLatestBaileysVersion();
        const handler = new CommandHandler();
        await handler.loadCommands();

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            browser: ['Ubuntu', 'Chrome', '20.0.04'],
            auth: state,
            markOnlineOnConnect: true,
            syncFullHistory: false,
            printQRInTerminal: true
        });

        // Save creds
        sock.ev.on('creds.update', saveCreds);

        // --- Helpers ---
        sock.decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return decode.user && decode.server ? decode.user + '@' + decode.server : jid;
            } else return jid;
        };

        sock.ev.on('contacts.update', (update) => {
            for (let contact of update) {
                let id = sock.decodeJid(contact.id);
                if (sock.store && sock.store.contacts) sock.store.contacts[id] = { id, name: contact.notify };
            }
        });

        sock.getName = (jid, withoutContact = false) => {
            jid = sock.decodeJid(jid);
            withoutContact = sock.withoutContact || withoutContact;
            let v;
            if (jid.endsWith('@g.us')) {
                v = sock.store?.contacts[jid] || {};
                return v.name || v.subject || jid;
            } else {
                v = jid === '0@s.whatsapp.net'
                    ? { id: jid, name: 'WhatsApp' }
                    : jid === sock.decodeJid(sock.user.id)
                        ? sock.user
                        : (sock.store?.contacts[jid] || {});
                return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || jid;
            }
        };

        sock.public = true;

        // --- Connection handling ---
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('📱 QR Code received - Scan with WhatsApp');
            }

            if (connection === 'connecting') {
                console.log('🔄 Connecting to WhatsApp...');
            }

            if (connection === 'open') {
                console.log('✅ Bot Connected Successfully!');
                console.log('📱 Bot Number:', sock.user.id);

                try {
                    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    await sock.sendMessage(botNumber, {
                        text: `🤖 Bot Connected Successfully!\n\n⏰ Time: ${new Date().toLocaleString()}\n✅ Status: Online and Ready!\n\n🔗 Join our WhatsApp channel:\nhttps://whatsapp.com/channel/0029VbCoGmm8kyyJg9kcBV3m`
                    });
                } catch (error) {
                    console.error('Error sending connection message:', error.message);
                }
            }

            if (connection === 'close') {
                const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                if (reason === DisconnectReason.loggedOut) {
                    console.log('❌ Logged out. Please re-authenticate.');
                    try {
                        fs.rmSync('./sessions', { recursive: true, force: true });
                        console.log('Session folder deleted.');
                    } catch (err) {
                        console.error('Error deleting session:', err);
                    }
                } else {
                    console.log('♻️ Connection lost. Reconnecting...');
                    startSaint();
                }
            }
        });

        // --- Anticall handler ---
        const antiCallNotified = new Set();
        sock.ev.on('call', async (calls) => {
            for (const call of calls) {
                const callerJid = call.from || call.peerJid || call.chatId;
                if (!callerJid) continue;
                try {
                    if (!antiCallNotified.has(callerJid)) {
                        antiCallNotified.add(callerJid);
                        setTimeout(() => antiCallNotified.delete(callerJid), 60000);
                        await sock.sendMessage(callerJid, { text: '📵 Calls are not allowed. You will be blocked.' });
                    }
                    setTimeout(async () => {
                        try { await sock.updateBlockStatus(callerJid, 'block'); } catch {}
                    }, 800);
                } catch {}
            }
        });

        // --- Group participants update ---
        sock.ev.on('group-participants.update', async (update) => {
            console.log('👥 Group participants update:', update);
        });

        // --- FIXED MESSAGE HANDLER for Baileys 6.4.0 ---
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            console.log(`📨 Messages event | Type: ${type} | Count: ${messages.length}`);
            
            // ONLY process new messages (not history)
            if (type !== 'notify') {
                console.log(`⏭️ Skipping ${type} messages (not new)`);
                return;
            }
            
            // Loop through ALL messages (not just first)
            for (const msg of messages) {
                try {
                    // Skip own messages
                    if (msg.key.fromMe) {
                        console.log('⏭️ Skipping own message');
                        continue;
                    }
                    
                    // Check if message exists
                    if (!msg.message) {
                        console.log('⚠️ No message property, skipping');
                        continue;
                    }
                    
                    // Handle undecryptable messages (WhatsApp bug)
                    if (msg.messageStubType === 2) {
                        console.log('⚠️ Undecryptable message (stub type 2) - WhatsApp bug');
                        continue;
                    }
                    
                    // Log received message
                    const jid = msg.key.remoteJid;
                    const name = sock.getName(jid);
                    console.log(`💬 Message from ${name} (${jid})`);
                    
                    // Call your message handler with the full event structure
                    // Passing chatUpdate format compatible with your message.js
                    const chatUpdate = {
                        messages: [msg],
                        type: type
                    };
                    
                    await messageHandler(sock, chatUpdate, handler);
                    
                } catch (err) {
                    console.error('Error processing message:', err);
                }
            }
        });

        return sock;
        
    } catch (error) {
        console.error('Error in startSaint:', error);
        await new Promise(res => setTimeout(res, 5000));
        startSaint();
    }
}

export default startSaint;
