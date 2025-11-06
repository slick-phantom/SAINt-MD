
import fs from 'fs';

const CAPTCHA_FILE = './captcha_settings.json';
const PENDING_USERS = new Map();

// Load CAPTCHA settings
function loadCaptchaSettings() {
    try {
        if (fs.existsSync(CAPTCHA_FILE)) {
            return JSON.parse(fs.readFileSync(CAPTCHA_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading CAPTCHA settings:', error);
    }
    return {};
}

// Save CAPTCHA settings
function saveCaptchaSettings(settings) {
    try {
        fs.writeFileSync(CAPTCHA_FILE, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving CAPTCHA settings:', error);
        return false;
    }
}

export default {
    name: "captcha",
    description: "Enable CAPTCHA verification for new members",
    category: "moderation",
    groupAdminOnly: true,
    
    async execute(message, client, args) {
        try {
            const chat = message.key.remoteJid;
            
            if (!chat.endsWith('@g.us')) {
                await client.sendMessage(chat, { 
                    text: "❌ This command only works in groups!" 
                }, { quoted: message });
                return;
            }
/*
            const isAdmin = await isUserAdmin(client, chat, message.key.participant || message.key.remoteJid);
            if (!isAdmin) {
                await client.sendMessage(chat, { 
                    text: "❌ You need to be an admin to use this command!" 
                }, { quoted: message });
                return;
            }
*/
            const action = args[0]?.toLowerCase();
            const settings = loadCaptchaSettings();

            if (!action || (action !== 'on' && action !== 'off')) {
                const isEnabled = settings[chat] || false;
                
                await client.sendMessage(chat, { 
                    text: `🛡️ *CAPTCHA PROTECTION*\n\nStatus: ${isEnabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n\nUsage:\n• captcha on - Enable protection\n• captcha off - Disable protection\n\nNew members will need to solve a simple CAPTCHA to chat.`
                }, { quoted: message });
                return;
            }

            if (action === 'on') {
                settings[chat] = true;
                if (saveCaptchaSettings(settings)) {
                    await client.sendMessage(chat, { 
                        text: `🟢 *CAPTCHA ENABLED!*\n\nNew members will now need to verify they are human before chatting.`
                    }, { quoted: message });
                }
            } else {
                settings[chat] = false;
                if (saveCaptchaSettings(settings)) {
                    await client.sendMessage(chat, { 
                        text: `🔴 *CAPTCHA DISABLED!*\n\nNew members can chat without verification.`
                    }, { quoted: message });
                }
            }

        } catch (error) {
            console.error('Error in captcha command:', error);
            await client.sendMessage(message.key.remoteJid, { 
                text: "❌ Error updating CAPTCHA settings." 
            }, { quoted: message });
        }
    },
};

// Generate simple math CAPTCHA
function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    switch (operator) {
        case '+': answer = num1 + num2; break;
        case '-': answer = num1 - num2; break;
        case '*': answer = num1 * num2; break;
    }
    
    return {
        question: `Solve: ${num1} ${operator} ${num2} = ?`,
        answer: answer.toString(),
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
}

// Send CAPTCHA to new member
export async function sendCaptchaToNewMember(client, groupJid, userJid) {
    try {
        const settings = loadCaptchaSettings();
        if (!settings[groupJid]) return; // CAPTCHA not enabled
        
        const captcha = generateCaptcha();
        PENDING_USERS.set(userJid, { ...captcha, groupJid });
        
        await client.sendMessage(groupJid, {
            text: `👋 Welcome @${userJid.split('@')[0]}!\n\n🛡️ *VERIFICATION REQUIRED*\n\n${captcha.question}\n\nYou have 5 minutes to solve this CAPTCHA to continue chatting.`,
            mentions: [userJid]
        });
        
        // Auto-remove after 5 minutes if not solved
        setTimeout(() => {
            if (PENDING_USERS.has(userJid)) {
                PENDING_USERS.delete(userJid);
                client.groupParticipantsUpdate(groupJid, [userJid], "remove")
                    .catch(error => console.error('Auto-remove failed:', error));
            }
        }, 5 * 60 * 1000);
        
    } catch (error) {
        console.error('Error sending CAPTCHA:', error);
    }
}

// Verify CAPTCHA answer
export async function verifyCaptcha(client, message) {
    try {
        const userJid = message.key.participant || message.key.remoteJid;
        const userAnswer = message.message?.conversation?.trim();
        
        if (!PENDING_USERS.has(userJid) || !userAnswer) return false;
        
        const captchaData = PENDING_USERS.get(userJid);
        
        // Check if expired
        if (Date.now() > captchaData.expires) {
            PENDING_USERS.delete(userJid);
            await client.sendMessage(captchaData.groupJid, {
                text: `❌ @${userJid.split('@')[0]} verification timeout! User removed.`,
                mentions: [userJid]
            });
            await client.groupParticipantsUpdate(captchaData.groupJid, [userJid], "remove");
            return true;
        }
        
        // Check answer
        if (userAnswer === captchaData.answer) {
            PENDING_USERS.delete(userJid);
            await client.sendMessage(captchaData.groupJid, {
                text: `✅ @${userJid.split('@')[0]} verified successfully! Welcome to the group! 🎉`,
                mentions: [userJid]
            });
            return true;
        } else {
            await client.sendMessage(captchaData.groupJid, {
                text: `❌ @${userJid.split('@')[0]} wrong answer! Try again.`,
                mentions: [userJid]
            });
            return true; // Still handled, just wrong answer
        }
        
    } catch (error) {
        console.error('Error verifying CAPTCHA:', error);
        return false;
    }
}

// Helper function to check if user is admin
async function isUserAdmin(client, groupJid, userJid) {
    try {
        const groupMetadata = await client.groupMetadata(groupJid);
        const user = groupMetadata.participants.find(p => p.id === userJid);
        return user && (user.admin === 'admin' || user.admin === 'superadmin');
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

export { loadCaptchaSettings, PENDING_USERS };