import axios from "axios";
import fs from "fs";
import path from "path";

const MONITOR_FILE = './monitor.json';

// Load monitored sites from JSON file
function loadMonitors() {
    try {
        if (fs.existsSync(MONITOR_FILE)) {
            const data = fs.readFileSync(MONITOR_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading monitors:', error);
    }
    return {};
}

// Save monitored sites to JSON file
function saveMonitors(monitors) {
    try {
        fs.writeFileSync(MONITOR_FILE, JSON.stringify(monitors, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving monitors:', error);
        return false;
    }
}

export default {
    name: "uptime",
    description: "Monitor website uptime like UptimeRobot",
    category: "monitoring",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;
            const userId = message.key.participant || message.key.remoteJid;

            if (!args || args.length === 0) {
                return await showUptimeDashboard(client, chatId, userId, message);
            }

            const action = args[0].toLowerCase();

            switch (action) {
                case 'add':
                    return await addMonitor(client, chatId, userId, args.slice(1), message);
                case 'remove':
                    return await removeMonitor(client, chatId, userId, args.slice(1), message);
                case 'list':
                    return await listMonitors(client, chatId, userId, message);
                case 'status':
                    return await checkStatus(client, chatId, userId, args.slice(1), message);
                case 'alerts':
                    return await manageAlerts(client, chatId, userId, args.slice(1), message);
                case 'report':
                    return await generateReport(client, chatId, userId, args.slice(1), message);
                case 'pause':
                    return await pauseMonitor(client, chatId, userId, args.slice(1), message);
                case 'resume':
                    return await resumeMonitor(client, chatId, userId, args.slice(1), message);
                default:
                    return await showUptimeHelp(client, chatId, message);
            }

        } catch (error) {
            console.error('Uptime command error:', error);
            await client.sendMessage(chatId, {
                text: "❌ Uptime monitor error. Please try again."
            }, { quoted: message });
        }
    }
};

async function showUptimeDashboard(client, chatId, userId, message) {
    const monitors = loadMonitors();
    const userMonitors = Object.entries(monitors)
        .filter(([url, site]) => site.userId === userId && site.active !== false)
        .slice(0, 10);

    if (userMonitors.length === 0) {
        return await showUptimeHelp(client, chatId, message);
    }

    let dashboard = `🌐 *UPTIME MONITOR DASHBOARD*\n\n`;
    let allUp = true;

    for (const [url, site] of userMonitors) {
        const status = await checkSingleStatus(url);
        const uptimePercent = calculateUptime(site.history || []);
        
        dashboard += `${status.online ? '🟢' : '🔴'} *${site.name || url}*\n`;
        dashboard += `📊 Uptime: ${uptimePercent}%\n`;
        dashboard += `⏱️ Response: ${status.responseTime}ms\n`;
        dashboard += `🕒 Last Check: ${new Date().toLocaleTimeString()}\n`;
        
        if (!status.online) {
            dashboard += `❌ ${status.error || 'Site down'}\n`;
            allUp = false;
        }
        
        dashboard += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    }

    dashboard += `💡 Commands: uptime add, uptime list, uptime status [url]`;

    await client.sendMessage(chatId, {
        text: dashboard
    }, { quoted: message });
}

async function addMonitor(client, chatId, userId, args, message) {
    if (args.length < 1) {
        await client.sendMessage(chatId, {
            text: "❌ Usage: uptime add [website-url] [friendly-name]\n\nExample:\n• uptime add https://google.com Google\n• uptime add https://myapp.com My App"
        }, { quoted: message });
        return;
    }

    const url = normalizeUrl(args[0]);
    const name = args.slice(1).join(' ') || url;

    if (!isValidUrl(url)) {
        await client.sendMessage(chatId, {
            text: "❌ Invalid URL! Please provide a valid website URL starting with http:// or https://"
        }, { quoted: message });
        return;
    }

    const monitors = loadMonitors();
    
    // Check if user has too many monitors
    const userMonitorCount = Object.values(monitors).filter(site => site.userId === userId).length;
    if (userMonitorCount >= 10) {
        await client.sendMessage(chatId, {
            text: "❌ Monitor limit reached! You can monitor up to 10 websites. Remove some with: uptime remove [url]"
        }, { quoted: message });
        return;
    }

    // Check if URL already monitored by this user
    if (monitors[url] && monitors[url].userId === userId) {
        await client.sendMessage(chatId, {
            text: `❌ You're already monitoring ${url}!`
        }, { quoted: message });
        return;
    }

    // Test the URL first
    await client.sendMessage(chatId, {
        text: "🔍 Testing website availability..."
    }, { quoted: message });

    const testStatus = await checkSingleStatus(url);
    
    if (!testStatus.online) {
        await client.sendMessage(chatId, {
            text: `❌ Cannot add monitor! Website is not accessible:\n${testStatus.error}`
        }, { quoted: message });
        return;
    }

    // Add to monitors
    monitors[url] = {
        userId: userId,
        name: name,
        url: url,
        added: new Date().toISOString(),
        active: true,
        history: [],
        alertSettings: {
            notifyOnDown: true,
            notifyOnUp: true
        }
    };

    if (saveMonitors(monitors)) {
        await client.sendMessage(chatId, {
            text: `✅ *MONITOR ADDED!*\n\n🌐 ${name}\n🔗 ${url}\n\n📊 Now monitoring every 5 minutes\n🔔 You'll get alerts if site goes down\n\nView all monitors: uptime list`
        }, { quoted: message });
    } else {
        throw new Error('Failed to save monitor');
    }
}

async function removeMonitor(client, chatId, userId, args, message) {
    if (args.length < 1) {
        await client.sendMessage(chatId, {
            text: "❌ Usage: uptime remove [website-url]\n\nView your monitors: uptime list"
        }, { quoted: message });
        return;
    }

    const url = normalizeUrl(args[0]);
    const monitors = loadMonitors();

    if (!monitors[url] || monitors[url].userId !== userId) {
        await client.sendMessage(chatId, {
            text: "❌ Monitor not found! Use 'uptime list' to see your monitors."
        }, { quoted: message });
        return;
    }

    const siteName = monitors[url].name;
    delete monitors[url];

    if (saveMonitors(monitors)) {
        await client.sendMessage(chatId, {
            text: `🗑️ *MONITOR REMOVED*\n\n🌐 ${siteName}\n🔗 ${url}\n\nNo longer monitoring this website.`
        }, { quoted: message });
    }
}

async function listMonitors(client, chatId, userId, message) {
    const monitors = loadMonitors();
    const userMonitors = Object.entries(monitors)
        .filter(([url, site]) => site.userId === userId);

    if (userMonitors.length === 0) {
        await client.sendMessage(chatId, {
            text: "📭 You're not monitoring any websites yet!\n\nAdd one with: uptime add [website-url]"
        }, { quoted: message });
        return;
    }

    let list = `📋 *YOUR WEBSITE MONITORS* (${userMonitors.length}/10)\n\n`;

    userMonitors.forEach(([url, site], index) => {
        const status = site.active === false ? '⏸️ Paused' : '🟢 Active';
        list += `${index + 1}. ${site.name}\n`;
        list += `   🔗 ${url}\n`;
        list += `   📅 Added: ${new Date(site.added).toLocaleDateString()}\n`;
        list += `   ${status}\n`;
        list += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    });

    list += `💡 Commands:\n• uptime status [url] - Check now\n• uptime remove [url] - Remove\n• uptime pause [url] - Pause monitoring`;

    await client.sendMessage(chatId, {
        text: list
    }, { quoted: message });
}

async function checkStatus(client, chatId, userId, args, message) {
    const monitors = loadMonitors();
    let url;

    if (args.length > 0) {
        url = normalizeUrl(args[0]);
        if (!monitors[url] || monitors[url].userId !== userId) {
            await client.sendMessage(chatId, {
                text: "❌ Monitor not found! Use 'uptime list' to see your monitors."
            }, { quoted: message });
            return;
        }
    } else {
        // Check all user monitors
        const userMonitors = Object.entries(monitors)
            .filter(([url, site]) => site.userId === userId && site.active !== false);

        if (userMonitors.length === 0) {
            await client.sendMessage(chatId, {
                text: "📭 No active monitors found!"
            }, { quoted: message });
            return;
        }

        let statusReport = `🔍 *IMMEDIATE STATUS CHECK*\n\n`;
        
        for (const [url, site] of userMonitors) {
            const status = await checkSingleStatus(url);
            statusReport += `${status.online ? '🟢' : '🔴'} ${site.name}\n`;
            statusReport += `⏱️ ${status.responseTime}ms | ${status.statusCode}\n`;
            if (!status.online) {
                statusReport += `❌ ${status.error}\n`;
            }
            statusReport += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        }

        await client.sendMessage(chatId, {
            text: statusReport
        }, { quoted: message });
        return;
    }

    const site = monitors[url];
    const status = await checkSingleStatus(url);

    let statusMessage = `🔍 *STATUS CHECK: ${site.name}*\n\n`;
    statusMessage += `🌐 ${url}\n`;
    statusMessage += `Status: ${status.online ? '🟢 ONLINE' : '🔴 OFFLINE'}\n`;
    statusMessage += `Response: ${status.responseTime}ms\n`;
    statusMessage += `HTTP: ${status.statusCode}\n`;
    
    if (status.online) {
        statusMessage += `🕒 Checked: ${new Date().toLocaleString()}\n`;
    } else {
        statusMessage += `❌ Error: ${status.error}\n`;
    }

    // Add uptime history
    const uptimePercent = calculateUptime(site.history || []);
    statusMessage += `\n📊 Historical Uptime: ${uptimePercent}%`;

    await client.sendMessage(chatId, {
        text: statusMessage
    }, { quoted: message });
}

// Background monitoring function
async function checkAllMonitors() {
    const monitors = loadMonitors();
    const activeMonitors = Object.entries(monitors).filter(([url, site]) => site.active !== false);

    for (const [url, site] of activeMonitors) {
        try {
            const status = await checkSingleStatus(url);
            const timestamp = new Date().toISOString();
            
            // Add to history
            if (!site.history) site.history = [];
            site.history.push({
                timestamp: timestamp,
                online: status.online,
                responseTime: status.responseTime,
                statusCode: status.statusCode
            });
            
            // Keep only last 1000 checks (about 3 days)
            if (site.history.length > 1000) {
                site.history = site.history.slice(-1000);
            }
            
            // Check for status changes and send alerts
            await checkStatusChange(url, site, status);
            
        } catch (error) {
            console.error(`Error monitoring ${url}:`, error);
        }
    }
    
    saveMonitors(monitors);
}

async function checkSingleStatus(url) {
    const startTime = Date.now();
    
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            validateStatus: null // Don't throw on HTTP errors
        });
        
        const responseTime = Date.now() - startTime;
        const online = response.status < 400; // Consider 4xx/5xx as offline
        
        return {
            online: online,
            statusCode: response.status,
            responseTime: responseTime,
            error: online ? null : `HTTP ${response.status}`
        };
        
    } catch (error) {
        return {
            online: false,
            statusCode: 0,
            responseTime: Date.now() - startTime,
            error: error.code === 'ECONNABORTED' ? 'Timeout' : 'Connection failed'
        };
    }
}

function calculateUptime(history) {
    if (history.length === 0) return 100;
    
    const onlineChecks = history.filter(check => check.online).length;
    return Math.round((onlineChecks / history.length) * 100);
}

function normalizeUrl(url) {
    if (!url.startsWith('http')) {
        return 'https://' + url;
    }
    return url;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

async function showUptimeHelp(client, chatId, message) {
    const helpText = `
🌐 *UPTIME ROBOT - WEBSITE MONITORING* 🌐

Monitor your websites 24/7 and get instant alerts!

*Commands:*
• uptime add [url] [name] - Add website to monitor
• uptime remove [url] - Remove monitor
• uptime list - Show your monitors
• uptime status - Check all sites now
• uptime status [url] - Check specific site
• uptime pause [url] - Pause monitoring
• uptime resume [url] - Resume monitoring
• uptime report - Get uptime report

*Examples:*
• uptime add https://myapp.com My App
• uptime add google.com Google
• uptime status
• uptime remove https://myapp.com

*Features:*
✅ 24/7 monitoring
✅ 5-minute checks
✅ Instant downtime alerts
✅ Response time tracking
✅ Uptime history
✅ 10 websites per user

Add your first website: uptime add [your-website]
    `.trim();

    await client.sendMessage(chatId, {
        text: helpText
    }, { quoted: message });
}

// Start the monitoring loop
setInterval(() => {
    checkAllMonitors();
}, 5 * 60 * 1000); // Check every 5 minutes

// Export for testing
export { loadMonitors, saveMonitors, checkSingleStatus };