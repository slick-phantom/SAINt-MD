
export default {
    name: "tagall",
    description: "Mention all group members",
    category: "utility",
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
/*
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
*/
            const customMessage = args.join(" ") || "📢 *ATTENTION EVERYONE!* 📢";
            
            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Get all group members
            const groupMembers = await getGroupMembers(client, chat);
            
            if (groupMembers.length === 0) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ Could not fetch group members.",
                    },
                    { quoted: message }
                );
                return;
            }

            // Split into chunks of 20 mentions (WhatsApp limit)
            const chunks = splitIntoChunks(groupMembers, 20);
            
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                let messageText = "";
                
                if (i === 0) {
                    // First chunk includes custom message
                    messageText = `📢 ━━━━━━━━━━━━━━━━━ 📢\n\n${customMessage}\n\n`;
                }
                
                // Add mentions for this chunk
                chunk.forEach(member => {
                    messageText += `@${member.split('@')[0]} `;
                });

                // Add progress indicator for multiple chunks
                if (chunks.length > 1) {
                    messageText += `\n\n📋 Part ${i + 1}/${chunks.length}`;
                }

                await client.sendMessage(
                    chat,
                    { 
                        text: messageText,
                        mentions: chunk
                    }
                );

                // Small delay between chunks to avoid rate limiting
                if (i < chunks.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            // Send completion message
            if (chunks.length > 1) {
                await client.sendMessage(
                    chat,
                    { 
                        text: `✅ Successfully mentioned all ${groupMembers.length} members!`,
                    }
                );
            }

        } catch (error) {
            console.error('Error executing tagall command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                { 
                    text: "❌ Error mentioning members. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Get all group members (excluding bots)
async function getGroupMembers(client, groupJid) {
    try {
        const groupMetadata = await client.groupMetadata(groupJid);
        const participants = groupMetadata.participants;
        
        // Filter out bots and return member IDs
        return participants
            .filter(participant => !isLikelyBot(participant.id))
            .map(participant => participant.id);
            
    } catch (error) {
        console.error('Error getting group members:', error);
        return [];
    }
}

// Check if user is likely a bot
function isLikelyBot(userJid) {
    const botIndicators = [
        'g.us', // Group itself
        '0@s.whatsapp.net', // System
        'status@broadcast' // Status
    ];
    
    return botIndicators.some(indicator => userJid.includes(indicator));
}

// Split array into chunks
function splitIntoChunks(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

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