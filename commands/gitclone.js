import logger from "../utils/logger.js";

export default {
    name: "gitclone",
    description: "Generate categorized Git clone commands (HTTPS, SSH, GitLab)",
    category: "developer",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const repo = args.join(" ") || quotedText || "example-repo";

            if (!repo) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `💻 *GITCLONE COMMAND*\n\nUsage:\n• gitclone [repository]\n• Reply to any message with: gitclone\n\nExamples:\n• gitclone my-awesome-project\n• gitclone portfolio-site\n• gitclone api-service`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized Git clone commands
            const results = await generateGitClone(repo);

            const response = `
${getGitArt()}
💻 *GIT CLONE GENERATOR*
${getGitArt()}

📝 *Repository:* ${repo}

💡 *HTTPS:*  
${results.https}

💡 *SSH:*  
${results.ssh}

💡 *GitLab:*  
${results.gitlab}

${getGitArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing gitclone command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating Git clone command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized Git clone generator
async function generateGitClone(repo) {
    try {
        const https = `git clone https://github.com/username/${repo}.git`;
        const ssh = `git clone git@github.com:username/${repo}.git`;
        const gitlab = `git clone https://gitlab.com/username/${repo}.git`;

        return { https, ssh, gitlab };
    } catch (error) {
        logger.error("Error generating Git clone command:", error);
        return { https: "Unable to generate.", ssh: "Unable to generate.", gitlab: "Unable to generate." };
    }
}

// Decorative art for Git clone messages
function getGitArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "💻─────────────────💻",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🔧 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
