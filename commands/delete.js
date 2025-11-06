
export default {
    name: "delete",
    description: "Delete bot messages or quoted messages",
    category: "utility",
    groupAdminOnly: true,
    
    async execute(message, client, args) {
        try {
            const chat = message.key.remoteJid;
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo;

            // Check if it's a quoted message
            if (quotedMessage && quotedMessage.stanzaId) {
                const isAdmin = await isUserAdmin(client, chat, message.key.participant || message.key.remoteJid);
                const isBotMessage = await isMessageFromBot(client, quotedMessage);

                // Allow deleting if: user is admin OR message is from bot
                if (isAdmin || isBotMessage) {
                    try {
                        await client.sendMessage(chat, {
                            delete: {
                                id: quotedMessage.stanzaId,
                                participant: quotedMessage.participant,
                                remoteJid: chat,
                                fromMe: quotedMessage.participant === client.user.id
                            }
                        });

                        // Send confirmation (will be deleted soon)
                        const confirmMsg = await client.sendMessage(
                            chat,
                            { 
                                text: "✅ Message deleted successfully!",
                            },
                            { quoted: message }
                        );

                        // Delete confirmation after 3 seconds
                        setTimeout(async () => {
                            try {
                                await client.sendMessage(chat, {
                                    delete: confirmMsg.key
                                });
                            } catch (e) {
                                // Ignore error if confirmation already deleted
                            }
                        }, 3000);

                        return;
                    } catch (deleteError) {
                        console.error('Error deleting message:', deleteError);
                    }
                }
            }

            // If no quoted message or cannot delete
            if (!quotedMessage) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ Please quote the message you want to delete!\n\nReply to any message with 'delete' to remove it.",
                    },
                    { quoted: message }
                );
            } else {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ You can only delete:\n• Messages sent by this bot\n• Any messages (if you're admin)",
                    },
                    { quoted: message }
                );
            }

        } catch (error) {
            console.error('Error executing delete command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                { 
                    text: "❌ Error deleting message. I may not have permission to delete that message.",
                },
                { quoted: message }
            );
        }
    },
};

// Check if user is admin (for groups)
async function isUserAdmin(client, groupJid, userJid) {
    try {
        if (!groupJid.endsWith('@g.us')) return false;
        
        const groupMetadata = await client.groupMetadata(groupJid);
        const participants = groupMetadata.participants;
        const user = participants.find(p => p.id === userJid);
        return user && (user.admin === 'admin' || user.admin === 'superadmin');
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Check if message is from bot
async function isMessageFromBot(client, quotedContext) {
    try {
        return quotedContext.participant === client.user.id;
    } catch (error) {
        console.error('Error checking bot message:', error);
        return false;
    }
}
