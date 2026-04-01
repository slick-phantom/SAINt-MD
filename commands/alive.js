import os from "os";
import process from "process";

export default {
  name: "alive",
  description: "Check if bot is alive and running",
  category: "utility",
  async execute(message, client, args) {
    try {
      // Calculate uptime
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      // Memory usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memUsagePercent = (usedMem / totalMem) * 100;

      // CPU information
      const cpus = os.cpus();
      const cpuCores = cpus.length;

      // Format memory values
      const formatMemory = (bytes) => {
        const units = ["B", "KB", "MB", "GB", "TB"];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
          size /= 1024;
          unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
      };

      // Create the caption
      const caption = `
🟢 *BOT IS ALIVE* 🟢

✅ *Status:* Online & Running
⏰ *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s

💾 *Memory:* ${formatMemory(usedMem)} / ${formatMemory(totalMem)}
📊 *Memory Usage:* ${memUsagePercent.toFixed(2)}%

🧠 *CPU Cores:* ${cpuCores}
⚙️ *Platform:* ${os.platform()}/${os.arch()}

🤖 *Bot:* SAINt-MD
🚀 *Status:* Operational & Ready
      `.trim();

      // Send the message
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: caption
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("Error executing alive command:", error);
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: "❌ Error checking bot status.",
        },
        { quoted: message }
      );
    }
  },
};
