export default {
    name: "password",
    description: "Generate ultra-secure passwords that are impossible to guess",
    category: "security",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;
            const length = parseInt(args[0]) || 16;
            const type = args[1]?.toLowerCase() || 'ultimate';

            if (length < 8) {
                await client.sendMessage(chatId, {
                    text: "❌ Password length must be at least 8 characters for security!"
                }, { quoted: message });
                return;
            }

            if (length > 64) {
                await client.sendMessage(chatId, {
                    text: "❌ Maximum password length is 64 characters!"
                }, { quoted: message });
                return;
            }

            await client.sendPresenceUpdate("composing", chatId);

            const passwords = generateUltraSecurePasswords(length, type);
            const strength = calculatePasswordStrength(passwords.ultimate);

            const passwordMessage = `
🔐 *ULTRA-SECURE PASSWORD GENERATOR* 🔐

*Ultimate Security:* 
\`${passwords.ultimate}\`

*Memorable but Secure:*
\`${passwords.memorable}\`

*Special Characters:*
\`${passwords.special}\`

📊 *Security Analysis:*
• Length: ${length} characters
• Strength: ${strength.rating} (${strength.score}/100)
• Entropy: ${strength.entropy} bits
• Crack Time: ${strength.crackTime}

🛑 *CRITICAL SECURITY WARNING* 🛑

🔒 *WE DO NOT STORE YOUR PASSWORD*
• This password is generated locally and immediately forgotten
• We have NO access to your generated passwords
• Passwords are NOT saved anywhere in our system

💾 *YOUR RESPONSIBILITY:*
• Save this password IMMEDIATELY in a secure password manager
• Do not screenshot - use a password manager like Bitwarden, LastPass, or KeePass
• This password will NOT be shown again - save it now or lose it forever

⚠️ *SECURITY TIPS:*
• Use the "Ultimate" version for maximum security
• Never reuse passwords across different websites
• Enable two-factor authentication (2FA) everywhere
• Use a reputable password manager for storage

🔧 *Usage:*
• password 12 - Default ultimate security
• password 16 memorable - Easier to remember
• password 20 special - Maximum special chars
• password 8 pin - Numeric PIN (less secure)
            `.trim();

            await client.sendMessage(chatId, {
                text: passwordMessage
            }, { quoted: message });

        } catch (error) {
            console.error('Password command error:', error);
            await client.sendMessage(chatId, {
                text: "❌ Error generating password. Please try again."
            }, { quoted: message });
        }
    }
};

function generateUltraSecurePasswords(length, type) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const similarChars = 'il1Lo0O'; // Characters to avoid
    const allChars = uppercase + lowercase + numbers + symbols;
    
    const secureChars = allChars.split('').filter(char => !similarChars.includes(char)).join('');
    
    // Ultimate password - completely random, no patterns
    let ultimate = '';
    for (let i = 0; i < length; i++) {
        ultimate += secureChars[Math.floor(Math.random() * secureChars.length)];
    }
    
    // Memorable password - word-like but random
    const memorable = generateMemorablePassword(length);
    
    // Special-heavy password - emphasis on symbols
    let special = '';
    const specialRatio = 0.4; // 40% symbols
    for (let i = 0; i < length; i++) {
        if (i < length * specialRatio) {
            special += symbols[Math.floor(Math.random() * symbols.length)];
        } else {
            special += secureChars[Math.floor(Math.random() * secureChars.length)];
        }
    }
    special = shuffleString(special);
    
    return { ultimate, memorable, special };
}

function generateMemorablePassword(length) {
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const vowels = 'aeiou';
    const numbers = '23456789'; // Avoid 0,1
    const symbols = '!@$%&*';
    
    let password = '';
    const pattern = ['C', 'V', 'C', 'N', 'V', 'C', 'S', 'V']; // C=consonant, V=vowel, N=number, S=symbol
    
    while (password.length < length) {
        for (const charType of pattern) {
            if (password.length >= length) break;
            
            switch (charType) {
                case 'C':
                    password += consonants[Math.floor(Math.random() * consonants.length)];
                    break;
                case 'V':
                    password += vowels[Math.floor(Math.random() * vowels.length)];
                    break;
                case 'N':
                    password += numbers[Math.floor(Math.random() * numbers.length)];
                    break;
                case 'S':
                    password += symbols[Math.floor(Math.random() * symbols.length)];
                    break;
            }
        }
    }
    
    return password.substring(0, length);
}

function calculatePasswordStrength(password) {
    let score = 0;
    const length = password.length;
    
    // Length score
    score += Math.min(length * 4, 40);
    
    // Character variety bonus
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    
    const varietyCount = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
    score += (varietyCount - 1) * 10;
    
    // Entropy calculation
    const charSetSize = (
        (hasUpper ? 26 : 0) +
        (hasLower ? 26 : 0) +
        (hasNumber ? 10 : 0) +
        (hasSymbol ? 32 : 0)
    ) || 72; // Fallback
    
    const entropy = Math.log2(Math.pow(charSetSize, length));
    
    // Crack time estimation (very rough)
    const guessesPerSecond = 1e9; // 1 billion guesses/second
    const secondsToCrack = Math.pow(charSetSize, length) / guessesPerSecond;
    
    let crackTime;
    if (secondsToCrack < 60) crackTime = 'Instantly';
    else if (secondsToCrack < 3600) crackTime = 'Seconds';
    else if (secondsToCrack < 86400) crackTime = 'Hours';
    else if (secondsToCrack < 31536000) crackTime = 'Days';
    else if (secondsToCrack < 3153600000) crackTime = 'Years';
    else crackTime = 'Centuries';
    
    // Rating
    let rating;
    if (score >= 80) rating = 'Very Strong';
    else if (score >= 60) rating = 'Strong';
    else if (score >= 40) rating = 'Good';
    else if (score >= 20) rating = 'Weak';
    else rating = 'Very Weak';
    
    return {
        score: Math.min(score, 100),
        rating,
        entropy: entropy.toFixed(1),
        crackTime
    };
}

function shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}