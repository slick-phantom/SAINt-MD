[file name]: antilink.js
[file content begin]
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

export default {
    name: "antilink",
    description: "Enable or disable anti-link protection in groups",
    category: "moderation",
    
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

            // Check if user has admin permissions
            const isAdmin = await isUserAdmin(client, chat, message.key.participant || message.key.remoteJid);
            if (!isAdmin) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ You need to be an admin to use this command!",
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
                        text: `🔗 *ANTI-LINK PROTECTION*\n\nCurrent Status: ${isEnabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n\nUsage:\n• antilink on - Enable protection\n• antilink off - Disable protection\n\nWhen enabled, I will delete any links posted in this group.`,
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
                            text: `🟢 *ANTI-LINK ENABLED!*\n\nI will now delete any links posted in this group.`,
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

// Helper function to check if user is admin
async function isUserAdmin(client, groupJid, userJid) {
    try {
        const groupMetadata = await client.groupMetadata(groupJid);
        const participants = groupMetadata.participants;
        const user = participants.find(p => p.id === userJid);
        return user && (user.admin === 'admin' || user.admin === 'superadmin');
    } catch (error) {
        logger.error('Error checking admin status:', error);
        return false;
    }
}

// Export functions for use in message handler
export { loadSettings, saveSettings };
[file content end]