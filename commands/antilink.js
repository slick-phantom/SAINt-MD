import fs from 'fs';
import path from 'path';
import logger from "../utils/logger.js";

const SETTINGS_FILE = './antilink.json';

// Load antilink settings from JSON file
function loadSettings() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        logger.error('Error loading antilink settings:', error);
    }
    return {};
}

// Save antilink settings to JSON file
function saveSettings(settings) {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        logger.error('Error saving antilink settings:', error);
        return false;
    }
}

// Check if text contains links
function containsLinks(text) {
    if (!text) return false;
    
    const linkPatterns = [
        /https?:\/\/[^\s]+/gi, // http/https links
        /www\.[^\s]+/gi, // www links
        /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi, // domain patterns
        /bit\.ly\/[^\s]+/gi, // bit.ly
        /t\.me\/[^\s]+/gi, // telegram
        /wa\.me\/[^\s]+/gi, // whatsapp
        /chat\.whatsapp\.com\/[^\s]+/gi, // whatsapp groups
        /youtube\.com\/[^\s]+/gi, // youtube
        /youtu\.be\/[^\s]+/gi // youtube short
    ];
    
    return linkPatterns.some(pattern => pattern.test(text));
}

export default {
    name: "antilink",
    description: "Enable or disable anti-link protection in groups",
    category: "moderation",
    groupAdminOnly: true,
    
    async execute(message, client, args) {
        try {
            const chat = message.key.remoteJid;
            
            // Only work in groups
            if (!chat.endsWith('@g.us')) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ This command only works in groups!",
                    },
                    { quoted: message }
                );
                return;
            }

            const action = args[0]?.toLowerCase();
            const settings = loadSettings();

            if (!action || (action !== 'on' && action !== 'off')) {
                // Show current status
                const isEnabled = settings[chat] || false;
                
                await client.sendMessage(
                    chat,
                    { 
                        text: `🔗 *ANTI-LINK PROTECTION*\n\nCurrent Status: ${isEnabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n\nUsage:\n• *${this.name} on* - Enable protection\n• *${this.name} off* - Disable protection\n\nWhen enabled, I will delete any links posted in this group.`,
                    },
                    { quoted: message }
                );
                return;
            }

            if (action === 'on') {
                settings[chat] = true;
                if (saveSettings(settings)) {
                    await client.sendMessage(
                        chat,
                        { 
                            text: `🟢 *ANTI-LINK ENABLED!*\n\nI will now delete any links posted in this group. Users will be warned when their links are deleted.`,
                        },
                        { quoted: message }
                    );
                } else {
                    throw new Error('Failed to save settings');
                }
            } else if (action === 'off') {
                settings[chat] = false;
                if (saveSettings(settings)) {
                    await client.sendMessage(
                        chat,
                        { 
                            text: `🔴 *ANTI-LINK DISABLED!*\n\nUsers can now post links in this group.`,
                        },
                        { quoted: message }
                    );
                } else {
                    throw new Error('Failed to save settings');
                }
            }

        } catch (error) {
            logger.error('Error executing antilink command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                { 
                    text: "❌ Error updating anti-link settings. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Anti-link message handler - THIS IS THE KEY PART
export async function handleAntiLink(message, client) {
    try {
        const chat = message.key.remoteJid;
        
        // Only check in groups
        if (!chat.endsWith('@g.us')) return false;
        
        // Load settings
        const settings = loadSettings();
        
        // Check if anti-link is enabled for this group
        if (!settings[chat]) return false;
        
        // Extract message text
        const text = extractMessageText(message);
        if (!text) return false;
        
        // Check if message contains links
        if (containsLinks(text)) {
            const sender = message.key.participant || message.key.remoteJid;
            
            // Check if sender is admin (allow admins to post links)
            const isAdmin = await isUserAdmin(client, chat, sender);
            if (isAdmin) return false;
            
            // Delete the message
            await client.sendMessage(chat, {
                delete: message.key
            });
            
            // Warn the user
            await client.sendMessage(
                chat,
                { 
                    text: `⚠️ *LINK DETECTED!*\n\n@${sender.split('@')[0]} Links are not allowed in this group!`,
                    mentions: [sender]
                }
            );
            
            logger.info(`Deleted link message from ${sender} in group ${chat}`);
            return true;
        }
        
        return false;
    } catch (error) {
        logger.error('Error in anti-link handler:', error);
        return false;
    }
}

// Helper function to extract message text
function extractMessageText(message) {
    if (message.message?.conversation) {
        return message.message.conversation;
    }
    if (message.message?.extendedTextMessage?.text) {
        return message.message.extendedTextMessage.text;
    }
    if (message.message?.imageMessage?.caption) {
        return message.message.imageMessage.caption;
    }
    if (message.message?.videoMessage?.caption) {
        return message.message.videoMessage.caption;
    }
    return '';
}

// Helper function to check if user is admin
async function isUserAdmin(client, groupJid, userJid) {
    try {
        const groupMetadata = await client.groupMetadata(groupJid);
        const participant = groupMetadata.participants.find(p => p.id === userJid);
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (error) {
        logger.error('Error checking admin status:', error);
        return false;
    }
}

// Export functions for use in message handler
export { loadSettings, saveSettings, containsLinks };