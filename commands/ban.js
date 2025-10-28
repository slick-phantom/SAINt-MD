[file name]: ban.js
[file content begin]
export default {
    name: "ban",
    description: "Remove users from the group",
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

            // Check if bot is admin
            const botIsAdmin = await isUserAdmin(client, chat, client.user.id);
            if (!botIsAdmin) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ I need to be an admin to remove users!",
                    },
                    { quoted: message }
                );
                return;
            }

            const targetUser = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];

            if (!targetUser || !targetUser.includes('@')) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ Please mention a user to remove!\n\nExample: ban @user",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if trying to remove yourself
            if (targetUser === (message.key.participant || message.key.remoteJid)) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ You cannot remove yourself!",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if trying to remove bot
            if (targetUser === client.user.id) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ I cannot remove myself!",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if target is admin
            const targetIsAdmin = await isUserAdmin(client, chat, targetUser);
            if (targetIsAdmin) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ I cannot remove another admin!",
                    },
                    { quoted: message }
                );
                return;
            }

            // Get reason
            const reason = args.slice(1).join(' ') || 'No reason provided';

            // Remove user from group
            await client.groupParticipantsUpdate(
                chat,
                [targetUser],
                "remove"
            );

            await client.sendMessage(
                chat,
                { 
                    text: `🔨 *USER REMOVED!*\n\n@${targetUser.split('@')[0]} has been removed from the group.\n\nReason: ${reason}`,
                    mentions: [targetUser]
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing ban command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                { 
                    text: "❌ Error removing user. Make sure I'm admin and the user exists in the group.",
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
        console.error('Error checking admin status:', error);
        return false;
    }
}
[file content end]