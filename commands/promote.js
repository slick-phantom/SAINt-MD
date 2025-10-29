
export default {
    name: "promote",
    description: "Promote user to group admin",
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
                        text: "❌ I need to be an admin to promote users!",
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
                        text: "❌ Please mention a user to promote!\n\nExample: promote @user",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if trying to promote yourself
            if (targetUser === (message.key.participant || message.key.remoteJid)) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ You cannot promote yourself!",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if trying to promote bot
            if (targetUser === client.user.id) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ I cannot promote myself!",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if target is already admin
            const targetIsAdmin = await isUserAdmin(client, chat, targetUser);
            if (targetIsAdmin) {
                await client.sendMessage(
                    chat,
                    { 
                        text: `❌ @${targetUser.split('@')[0]} is already an admin!`,
                        mentions: [targetUser]
                    },
                    { quoted: message }
                );
                return;
            }

            // Promote user to admin
            await client.groupParticipantsUpdate(
                chat,
                [targetUser],
                "promote"
            );

            await client.sendMessage(
                chat,
                { 
                    text: `⬆️ *USER PROMOTED!*\n\n@${targetUser.split('@')[0]} has been promoted to group admin! 🎉`,
                    mentions: [targetUser]
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing promote command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                { 
                    text: "❌ Error promoting user. Make sure I'm admin and the user exists in the group.",
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