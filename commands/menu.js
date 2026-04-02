import axios from "axios";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsDir = path.join(__dirname);

// Store user sessions for menu navigation
const userSessions = new Map();

export default {
    name: "menu",
    description: "Show all available commands with interactive buttons",
    category: "utility",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;
            const userId = message.key.participant || message.key.remoteJid;
            
            // React with ⚡ to show processing
            await client.sendMessage(chatId, {
                react: {
                    text: "⚡",
                    key: message.key
                }
            });

            // Get all commands
            const commands = await getAllCommands();
            const pages = chunkArray(commands, 10); // Increased to 10 per page
            const categories = groupCommandsByCategory(commands);
            
            // Determine page number
            let pageIndex = 0;
            if (args[0] && !isNaN(args[0])) {
                pageIndex = parseInt(args[0]) - 1;
            }
            
            if (pageIndex < 0) pageIndex = 0;
            if (pageIndex >= pages.length) pageIndex = pages.length - 1;
            
            const currentPage = pages[pageIndex];

            if (!currentPage || currentPage.length === 0) {
                await client.sendMessage(chatId, {
                    text: "❌ No commands found!"
                }, { quoted: message });
                return;
            }

            // Store user session for button handling
            userSessions.set(userId, {
                pageIndex,
                totalPages: pages.length,
                timestamp: Date.now()
            });

            // Clean up old sessions
            cleanupSessions();

            // Create menu message with modern design
            const caption = createModernMenu(currentPage, pageIndex, pages.length, commands.length, categories);
            const buttons = createNavigationButtons(pageIndex, pages.length);

            // Send menu with reaction
            const menuMessage = await client.sendMessage(chatId, {
                text: caption,
                ...buttons
            }, { quoted: message });

            // React to the menu message with 📜
            await client.sendMessage(chatId, {
                react: {
                    text: "📜",
                    key: menuMessage.key
                }
            });
            // send channel link
            const link = "https://whatsapp.com/channel/0029VbCoGmm8kyyJg9kcBV3m"
            await client.SendMessage(chatId, {
                text: link }, { quoted: message });

        } catch (error) {
            console.error('Menu command error:', error);
            
            // React with ❌ on error
            await client.sendMessage(chatId, {
                react: {
                    text: "❌",
                    key: message.key
                }
            });
            
            await client.sendMessage(chatId, {
                text: "❌ Failed to load menu. Please try again later."
            }, { quoted: message });
        }
    }
};

// Function to handle button interactions
export async function handleMenuButton(client, message, selectedButton) {
    try {
        const userId = message.key.participant || message.key.remoteJid;
        const session = userSessions.get(userId);
        
        if (!session) {
            await client.sendMessage(message.key.remoteJid, {
                text: "💫 Session expired. Please use `menu` command again."
            }, { quoted: message });
            return;
        }

        let newPageIndex = session.pageIndex;
        
        switch (selectedButton) {
            case 'menu_prev':
                newPageIndex = Math.max(0, session.pageIndex - 1);
                break;
            case 'menu_next':
                newPageIndex = Math.min(session.totalPages - 1, session.pageIndex + 1);
                break;
            case 'menu_first':
                newPageIndex = 0;
                break;
            case 'menu_last':
                newPageIndex = session.totalPages - 1;
                break;
            case 'menu_refresh':
                // Keep same page, just refresh
                break;
            default:
                return;
        }

        // Update session
        session.pageIndex = newPageIndex;
        session.timestamp = Date.now();
        userSessions.set(userId, session);

        // Get commands for the new page
        const commands = await getAllCommands();
        const pages = chunkArray(commands, 10);
        const categories = groupCommandsByCategory(commands);
        const currentPage = pages[newPageIndex];

        if (!currentPage) {
            await client.sendMessage(message.key.remoteJid, {
                text: "❌ Page not found!"
            }, { quoted: message });
            return;
        }

        // Create updated menu
        const caption = createModernMenu(currentPage, newPageIndex, session.totalPages, commands.length, categories);
        const buttons = createNavigationButtons(newPageIndex, session.totalPages);

        const updatedMenu = await client.sendMessage(message.key.remoteJid, {
            text: caption,
            ...buttons
        }, { quoted: message });

        // React with 🔄 to show refresh
        await client.sendMessage(message.key.remoteJid, {
            react: {
                text: "🔄",
                key: updatedMenu.key
            }
        });

    } catch (error) {
        console.error('Menu button handler error:', error);
        await client.sendMessage(message.key.remoteJid, {
            text: "❌ Error navigating menu. Please use `menu` command again."
        }, { quoted: message });
    }
}

function createModernMenu(commands, currentPage, totalPages, totalCommands, categories) {
    let caption = `🌟 *SAVY DNI X BOT - COMMAND MENU*\n\n`;
    
    // Statistics
    caption += `📊 *Statistics*\n`;
    caption += `├ Total Commands: ${totalCommands}\n`;
    caption += `├ Categories: ${Object.keys(categories).length}\n`;
    caption += `└ Current Page: ${currentPage + 1}/${totalPages}\n\n`;
    
    // Category breakdown (quick overview)
    caption += `🗂️ *Categories*\n`;
    Object.entries(categories).forEach(([category, cmds]) => {
        caption += `├ ${getCategoryEmoji(category)} ${category}: ${cmds.length} commands\n`;
    });
    
    caption += `\n────────────────────\n\n`;
    
    // Current page commands
    caption += `📝 *Commands on This Page*\n\n`;
    
    // Group current page commands by category
    const pageCategories = {};
    commands.forEach(cmd => {
        if (!pageCategories[cmd.category]) {
            pageCategories[cmd.category] = [];
        }
        pageCategories[cmd.category].push(cmd);
    });

    // Display commands in a clean format
    Object.entries(pageCategories).forEach(([category, cmds]) => {
        caption += `${getCategoryEmoji(category)} *${category.toUpperCase()}*\n`;
        cmds.forEach(cmd => {
            caption += `  ╰─ 🎯 *${cmd.name}* - ${cmd.description}\n`;
        });
        caption += `\n`;
    });

    // Navigation help
    caption += `────────────────────\n`;
    caption += `🎮 *Navigation*\n`;
    caption += `• Use buttons below to browse pages\n`;
    caption += `• Or type: \`menu <page>\`\n`;
    caption += `• Example: \`menu 2\`\n\n`;
    
    caption += `💡 *Quick Start*\n`;
    caption += `• \`help <command>\` for details\n`;
    caption += `• \`joke\` - Get a random joke\n`;
    caption += `• \`lyrics <song>\` - Find lyrics\n`;
    caption += `• \`weather <city>\` - Check weather\n\n`;
    
    caption += `⚡ *Enjoy using the bot!*`;

    return caption;
}

function getCategoryEmoji(category) {
    const emojiMap = {
        'music': '🎵',
        'fun': '🎮',
        'utility': '🛠️',
        'image': '🖼️',
        'download': '📥',
        'game': '🎲',
        'ai': '🤖',
        'social': '👥',
        'tools': '🔧',
        'general': '📁'
    };
    return emojiMap[category.toLowerCase()] || '📌';
}

function createNavigationButtons(currentPage, totalPages) {
    const buttons = [
        { buttonId: 'menu_first', buttonText: { displayText: '⏮️ First' }, type: 1 },
        { buttonId: 'menu_prev', buttonText: { displayText: '⬅️ Prev' }, type: 1 },
        { buttonId: 'menu_refresh', buttonText: { displayText: '🔄 Refresh' }, type: 1 },
        { buttonId: 'menu_next', buttonText: { displayText: 'Next ➡️' }, type: 1 },
        { buttonId: 'menu_last', buttonText: { displayText: 'Last ⏭️' }, type: 1 }
    ];

    return {
        buttons: buttons,
        headerType: 1
    };
}

function groupCommandsByCategory(commands) {
    const categories = {};
    commands.forEach(cmd => {
        if (!categories[cmd.category]) {
            categories[cmd.category] = [];
        }
        categories[cmd.category].push(cmd);
    });
    return categories;
}

async function getAllCommands() {
    try {
        const files = fs.readdirSync(commandsDir);
        const commands = [];

        for (const file of files) {
            if (file.endsWith('.js') && file !== 'menu.js' && file !== 'help.js') {
                const commandName = file.replace('.js', '');
                try {
                    const commandPath = path.join(commandsDir, file);
                    const commandModule = await import(`file://${commandPath}`);
                    
                    if (commandModule.default) {
                        const cmd = commandModule.default;
                        commands.push({
                            name: cmd.name || commandName,
                            description: cmd.description || 'No description available',
                            category: cmd.category || 'general'
                        });
                    }
                } catch (error) {
                    console.error(`Error loading command ${file}:`, error);
                    commands.push({
                        name: commandName,
                        description: 'Command description not available',
                        category: 'general'
                    });
                }
            }
        }

        // Sort commands by category and name
        return commands.sort((a, b) => {
            if (a.category === b.category) {
                return a.name.localeCompare(b.name);
            }
            return a.category.localeCompare(b.category);
        });

    } catch (error) {
        console.error('Error reading commands directory:', error);
        return [];
    }
}

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

function cleanupSessions() {
    const now = Date.now();
    const TEN_MINUTES = 10 * 60 * 1000;
    
    for (const [userId, session] of userSessions.entries()) {
        if (now - session.timestamp > TEN_MINUTES) {
            userSessions.delete(userId);
        }
    }
}
