export default {
    name: "delete",
    description: "Delete bot messages or quoted messages",
    category: "utility",
    groupAdminOnly: true, // This is all you need
    
    async execute(message, client, args) {
        try {
            const chat = message.key.remoteJid;
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo;

            // Check if it's a quoted message
            if (quotedMessage && quotedMessage.stanzaId) {
                const isBotMessage = await isMessageFromBot(client, quotedMessage);

                // Since message.js already verified user is admin, they can delete any message
                // OR if it's a bot message, anyone can delete it
                if (isBotMessage) {
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
                        text: "❌ You can only delete messages sent by this bot.",
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

// Check if message is from bot
async function isMessageFromBot(client, quotedContext) {
    try {
        return quotedContext.participant === client.user.id;
    } catch (error) {
        console.error('Error checking bot message:', error);
        return false;
    }
}