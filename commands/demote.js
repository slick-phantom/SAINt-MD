[file name]: demote.js
[file content begin]
export default {
    name: "demote",
    description: "Demote user from group admin",
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
                        text: "❌ I need to be an admin to demote users!",
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
                        text: "❌ Please mention a user to demote!\n\nExample: demote @user",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if trying to demote yourself
            if (targetUser === (message.key.participant || message.key.remoteJid)) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ You cannot demote yourself!",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if trying to demote bot
            if (targetUser === client.user.id) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ I cannot demote myself!",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if target is not admin
            const targetIsAdmin = await isUserAdmin(client, chat, targetUser);
            if (!targetIsAdmin) {
                await client.sendMessage(
                    chat,
                    { 
                        text: `❌ @${targetUser.split('@')[0]} is not an admin!`,
                        mentions: [targetUser]
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if target is group creator (superadmin)
            const groupMetadata = await client.groupMetadata(chat);
            const targetParticipant = groupMetadata.participants.find(p => p.id === targetUser);
            if (targetParticipant?.admin === 'superadmin') {
                await client.sendMessage(
                    chat,
                    { 
                        text: `❌ Cannot demote group creator!`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Demote user from admin
            await client.groupParticipantsUpdate(
                chat,
                [targetUser],
                "demote"
            );

            await client.sendMessage(
                chat,
                { 
                    text: `⬇️ *USER DEMOTED!*\n\n@${targetUser.split('@')[0]} has been demoted from admin role.`,
                    mentions: [targetUser]
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing demote command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                { 
                    text: "❌ Error demoting user. Make sure I'm admin and the user exists in the group.",
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