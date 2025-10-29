import axios from "axios";

// Store active temp emails
const tempEmails = new Map();

export default {
    name: "temp",
    description: "Generate temporary email addresses and receive emails",
    category: "utility",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;
            const userId = message.key.participant || message.key.remoteJid;

            if (args[0]?.toLowerCase() === 'inbox') {
                return await checkInbox(client, chatId, userId, message);
            }

            if (args[0]?.toLowerCase() === 'delete') {
                return await deleteTempEmail(client, chatId, userId, message);
            }

            if (args[0]?.toLowerCase() === 'list') {
                return await listActiveEmails(client, chatId, userId, message);
            }

            // Generate new temp email
            await generateTempEmail(client, chatId, userId, message);

        } catch (error) {
            console.error('Temp email error:', error);
            await client.sendMessage(chatId, {
                text: "❌ Error with temporary email service. Please try again later."
            }, { quoted: message });
        }
    }
};

async function generateTempEmail(client, chatId, userId, message) {
    try {
        await client.sendPresenceUpdate("composing", chatId);

        // Generate temp email using 1secmail API
        const response = await axios.get(
            "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1",
            {
                timeout: 10000
            }
        );

        const email = response.data[0];
        
        // Store email with user info
        tempEmails.set(userId, {
            email: email,
            createdAt: Date.now(),
            messages: [],
            lastChecked: Date.now()
        });

        const emailMessage = `
📧 *TEMPORARY EMAIL CREATED* 📧

📮 *Email Address:* 
\`${email}\`

⏰ *Valid for:* 24 hours
📥 *Check inbox:* temp inbox
🗑️ *Delete email:* temp delete
📋 *Your emails:* temp list

💡 *Use this email for:*
• Signing up for websites
• Verifying accounts
• Avoiding spam
• Temporary registrations

⚠️ *Important:*
• Emails auto-delete after 24h
• Don't use for important accounts
• Check inbox regularly
        `.trim();

        await client.sendMessage(chatId, {
            text: emailMessage
        }, { quoted: message });

    } catch (error) {
        console.error('Email generation error:', error);
        throw error;
    }
}

async function checkInbox(client, chatId, userId, message) {
    try {
        const userEmail = tempEmails.get(userId);
        
        if (!userEmail) {
            await client.sendMessage(chatId, {
                text: "❌ You don't have an active temporary email!\n\nGenerate one with: temp"
            }, { quoted: message });
            return;
        }

        await client.sendPresenceUpdate("composing", chatId);

        // Check for new emails
        const [username, domain] = userEmail.email.split('@');
        const response = await axios.get(
            `https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`,
            {
                timeout: 15000
            }
        );

        const emails = response.data;
        userEmail.lastChecked = Date.now();

        if (!emails || emails.length === 0) {
            await client.sendMessage(chatId, {
                text: `📭 *INBOX EMPTY*\n\nEmail: \`${userEmail.email}\`\n\nNo new messages in your temporary inbox.`
            }, { quoted: message });
            return;
        }

        // Get full message details for each email
        let inboxMessage = `📬 *INBOX - ${userEmail.email}*\n\n`;
        
        for (const email of emails.slice(0, 10)) { // Limit to 10 emails
            const messageDetail = await axios.get(
                `https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${email.id}`,
                {
                    timeout: 15000
                }
            );

            const detail = messageDetail.data;
            
            inboxMessage += `📧 *From:* ${detail.from}\n`;
            inboxMessage += `📝 *Subject:* ${detail.subject || 'No Subject'}\n`;
            inboxMessage += `🕒 *Date:* ${new Date(detail.date).toLocaleString()}\n`;
            
            // Show preview of message body (first 100 chars)
            const preview = detail.textBody ? 
                detail.textBody.substring(0, 100) + (detail.textBody.length > 100 ? '...' : '') : 
                'No text content';
            
            inboxMessage += `📄 *Preview:* ${preview}\n`;
            inboxMessage += `━━━━━━━━━━━━━━━━━━━━\n\n`;

            // Store message in user's email data
            if (!userEmail.messages.find(msg => msg.id === email.id)) {
                userEmail.messages.push({
                    id: email.id,
                    from: detail.from,
                    subject: detail.subject,
                    date: detail.date,
                    body: detail.textBody
                });
            }
        }

        if (emails.length > 10) {
            inboxMessage += `📊 ...and ${emails.length - 10} more emails\n`;
        }

        inboxMessage += `\n💡 Use "temp inbox" again to check for new messages.`;

        await client.sendMessage(chatId, {
            text: inboxMessage
        }, { quoted: message });

    } catch (error) {
        console.error('Inbox check error:', error);
        throw error;
    }
}

async function deleteTempEmail(client, chatId, userId, message) {
    const userEmail = tempEmails.get(userId);
    
    if (!userEmail) {
        await client.sendMessage(chatId, {
            text: "❌ You don't have an active temporary email to delete!"
        }, { quoted: message });
        return;
    }

    tempEmails.delete(userId);
    
    await client.sendMessage(chatId, {
        text: `🗑️ *EMAIL DELETED*\n\nTemporary email \`${userEmail.email}\` has been deleted.\n\nGenerate a new one with: temp`
    }, { quoted: message });
}

async function listActiveEmails(client, chatId, userId, message) {
    const userEmail = tempEmails.get(userId);
    
    if (!userEmail) {
        await client.sendMessage(chatId, {
            text: "❌ You don't have an active temporary email!\n\nGenerate one with: temp"
        }, { quoted: message });
        return;
    }

    const emailAge = Math.floor((Date.now() - userEmail.createdAt) / (1000 * 60 * 60));
    const hoursLeft = 24 - emailAge;

    const listMessage = `
📋 *YOUR TEMPORARY EMAIL*

📮 *Address:* \`${userEmail.email}\`
⏰ *Created:* ${new Date(userEmail.createdAt).toLocaleString()}
🕒 *Age:* ${emailAge}h (${hoursLeft}h remaining)
📬 *Messages received:* ${userEmail.messages.length}
🔍 *Last checked:* ${new Date(userEmail.lastChecked).toLocaleString()}

💡 *Commands:*
• temp inbox - Check messages
• temp delete - Delete this email
• temp - Generate new email
    `.trim();

    await client.sendMessage(chatId, {
        text: listMessage
    }, { quoted: message });
}

// Cleanup old emails every hour
setInterval(() => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    for (const [userId, emailData] of tempEmails.entries()) {
        if (now - emailData.createdAt > twentyFourHours) {
            tempEmails.delete(userId);
            console.log(`Cleaned up expired email for user: ${userId}`);
        }
    }
}, 60 * 60 * 1000); // Run every hour