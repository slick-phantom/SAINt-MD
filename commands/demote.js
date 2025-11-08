export default {
    name: "demote",
    description: "Demote user from group admin",
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

            const targetUser = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];

            if (!targetUser || !targetUser.includes('@')) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ Please mention a user to demote!\n\nExample: !demote @user",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if trying to demote yourself
            const sender = message.key.participant || message.key.remoteJid;
            if (targetUser === sender) {
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

            // Get group metadata once
            const groupMetadata = await client.groupMetadata(chat);
            const targetParticipant = groupMetadata.participants.find(p => p.id === targetUser);
            
            // Check if target is not admin
            if (!targetParticipant || !(targetParticipant.admin === 'admin' || targetParticipant.admin === 'superadmin')) {
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
            if (targetParticipant.admin === 'superadmin') {
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
                    text: "❌ Error demoting user. Make sure the user exists in the group.",
                },
                { quoted: message }
            );
        }
    },
};