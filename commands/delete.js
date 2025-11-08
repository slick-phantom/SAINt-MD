export default {
    name: "delete",
    description: "Delete any harmful or inappropriate messages",
    category: "moderation",
    groupAdminOnly: true,
    
    async execute(message, client, args) {
        try {
            const chat = message.key.remoteJid;
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo;

            // Check if it's a quoted message
            if (quotedMessage && quotedMessage.stanzaId) {
                try {
                    // ✅ Delete ANY quoted message (since user is already verified as admin)
                    await client.sendMessage(chat, {
                        delete: {
                            id: quotedMessage.stanzaId,
                            remoteJid: chat,
                            fromMe: false, // Always false since we're deleting others' messages
                            participant: quotedMessage.participant
                        }
                    });

                    // Send confirmation
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
                    await client.sendMessage(
                        chat,
                        { 
                            text: "❌ Failed to delete message. I need to be admin to delete messages.",
                        },
                        { quoted: message }
                    );
                    return;
                }
            }

            // If no quoted message
            await client.sendMessage(
                chat,
                { 
                    text: "❌ Please reply to the message you want to delete!\n\nUsage: Reply to any message with '!delete'",
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing delete command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                { 
                    text: "❌ Error deleting message. Please try again.",
                },
                { quoted: message }
            );
        }
    },
};