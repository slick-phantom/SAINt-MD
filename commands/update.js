import axios from 'axios';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import semver from 'semver';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    name: "update",
    description: "Check for bot updates and new features",
    category: "utility",
    async execute(message, client, args) {
        try {
            // Show typing indicator
            await client.sendPresenceUpdate('composing', message.key.remoteJid);
            
            // Get current version from package.json
            let currentVersion = "unknown";
            try {
                const packagePath = join(__dirname, '../package.json');
                const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
                currentVersion = packageJson.version || "unknown";
            } catch (error) {
                console.error('Error reading package.json:', error);
            }
            
            // Fetch repository information from GitLab API using Project ID
            let repoInfo = {};
            try {
                const response = await axios.get(
                    'https://gitlab.com/api/v4/projects/75665783/repository/tags',
                    {
                        timeout: 10000,
                        headers: {
                            'User-Agent': 'savy.DNI.x'
                        }
                    }
                );
                
                if (response.data && response.data.length > 0) {
                    // Get the latest tag (assuming tags are version numbers)
                    const latestTag = response.data[0];
                    repoInfo.latestVersion = latestTag.name.replace(/^v/, '');
                    repoInfo.commitMessage = latestTag.commit.message || "No release notes";
                } else {
                    // Fallback to using the default branch commit
                    const commitResponse = await axios.get(
                        'https://gitlab.com/api/v4/projects/75665783/repository/commits/main'
                    );
                    repoInfo.latestVersion = "unknown";
                    repoInfo.commitMessage = commitResponse.data.title || "No recent updates";
                }
            } catch (error) {
                console.error('Error fetching GitLab data:', error);
                repoInfo.latestVersion = "unknown";
                repoInfo.commitMessage = "Unable to fetch update information";
            }
            
            // Check if update is available
            let updateAvailable = false;
            let updateType = "none";
            
            if (currentVersion !== "unknown" && repoInfo.latestVersion !== "unknown") {
                if (semver.gt(repoInfo.latestVersion, currentVersion)) {
                    updateAvailable = true;
                    
                    // Determine update type
                    const currentMajor = semver.major(currentVersion);
                    const latestMajor = semver.major(repoInfo.latestVersion);
                    
                    if (latestMajor > currentMajor) {
                        updateType = "major";
                    } else if (semver.minor(repoInfo.latestVersion) > semver.minor(currentVersion)) {
                        updateType = "minor";
                    } else {
                        updateType = "patch";
                    }
                }
            }
            
            // Format the response
            const updateMessage = formatUpdateMessage(
                currentVersion, 
                repoInfo.latestVersion, 
                updateAvailable, 
                updateType,
                repoInfo.commitMessage
            );
            
            // Send the update information
            await client.sendMessage(
                message.key.remoteJid,
                { text: updateMessage },
                { quoted: message }
            );
            
        } catch (error) {
            console.error('Error checking for updates:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                { 
                    text: '❌ Could not check for updates. Please try again later.' 
                },
                { quoted: message }
            );
        }
    }
};

// Format the update message
function formatUpdateMessage(currentVersion, latestVersion, updateAvailable, updateType, changes) {
    let message = `🔄 *savy.DNI.x Update Check*\n\n`;
    
    message += `📋 Current Version: v${currentVersion}\n`;
    message += `🚀 Latest Version: v${latestVersion}\n\n`;
    
    if (updateAvailable) {
        // Add appropriate emoji based on update type
        let updateEmoji = "🔧";
        if (updateType === "major") updateEmoji = "⚠️";
        if (updateType === "minor") updateEmoji = "✨";
        
        message += `${updateEmoji} *${updateType.toUpperCase()} Update Available!*\n\n`;
        message += `📝 *Recent Changes:*\n${changes}\n\n`;
        message += `💡 *Update Instructions:*\n`;
        message += `Simply restart the deployment process and updates will be automatically applied.\n`;
        message += `The system will fetch the latest version during deployment.\n`;
        
        if (updateType === "major") {
            message += `\n⚠️ *Note: Major updates may contain breaking changes.*\n`;
            message += `Please review the changes before updating.`;
        }
    } else {
        message += `✅ You're running the latest version!\n\n`;
        message += `📝 *Recent Activity:*\n${changes}\n\n`;
        message += `🔄 Updates are automatically managed through the deployment system.`;
    }
    
    return message;
}