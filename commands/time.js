import moment from 'moment-timezone';

export default {
  name: "time",
  description: "Display current time in multiple timezones with beautiful formatting",
  category: "utility",
  
  async execute(message, client, args) {
    try {
      const chatId = message.key.remoteJid;
      
      // Get current time in different timezones
      const timezones = [
        { zone: 'UTC', emoji: '🌍' },
        { zone: 'America/New_York', emoji: '🗽' },
        { zone: 'Europe/London', emoji: '🇬🇧' },
        { zone: 'Asia/Tokyo', emoji: '🗾' },
        { zone: 'Asia/Dubai', emoji: '🇦🇪' },
        { zone: 'Australia/Sydney', emoji: '🦘' },
        { zone: 'Asia/Kolkata', emoji: '🇮🇳' },
        { zone: 'America/Los_Angeles', emoji: '🌴' }
      ];

      let timeMessage = `
╔════════════════════════════════════╗
║     🕐 *WORLD TIME DISPLAY* 🕐     ║
╚════════════════════════════════════╝

`;

      // Add local system time
      const localTime = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      
      timeMessage += `📱 *LOCAL SYSTEM TIME*
${localTime.toLocaleDateString('en-US', options)}

`;

      // Add timezone information
      timeMessage += `🌐 *INTERNATIONAL TIMEZONES*
`;
      timeMessage += `${'═'.repeat(34)}

`;

      for (const tz of timezones) {
        try {
          const time = moment().tz(tz.zone);
          const timeStr = time.format('HH:mm:ss');
          const dateStr = time.format('DD MMM YYYY');
          const dayStr = time.format('dddd');
          
          timeMessage += `${tz.emoji} *${tz.zone.split('/').pop()}*
`;
          timeMessage += `   ⏰ ${timeStr}
`;
          timeMessage += `   📅 ${dateStr}
`;
          timeMessage += `   📆 ${dayStr}

`;
        } catch (error) {
          console.error(`Error getting time for ${tz.zone}:`, error);
        }
      }

      // Add current timestamp info
      const timestamp = Math.floor(Date.now() / 1000);
      timeMessage += `${'═'.repeat(34)}

`;
      timeMessage += `⏱️ *TIMESTAMP INFO*
`;
      timeMessage += `   Unix Timestamp: \\`${timestamp}\\n`;
      timeMessage += `   Milliseconds: \\`${Date.now()}\\n`;

      // Add useful info
      timeMessage += `💡 *TIME ZONES*
`;
      timeMessage += `   • UTC: Coordinated Universal Time
`;
      timeMessage += `   • EST: Eastern Standard Time
`;
      timeMessage += `   • GMT: Greenwich Mean Time
`;
      timeMessage += `   • IST: Indian Standard Time
`;
      timeMessage += `   • JST: Japan Standard Time

`;

      timeMessage += `🤖 Bot Name: SAINt-MD
`;
      timeMessage += `✨ Version: 1.0.0`;

      await client.sendMessage(
        chatId,
        {
          text: timeMessage
        },
        { quoted: message }
      );

    } catch (error) {
      console.error("Error executing time command:", error);
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: `❌ Error retrieving time information.\n\nError Details: ${error.message}`
        },
        { quoted: message }
      );
    }
  }
};