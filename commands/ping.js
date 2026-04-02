import os from "os";
import process from "process";

export default {
  name: "ping",
  description: "Check bot status and system information",
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
🤖 *SAINT MD Status Report*

⏰ *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s

💾 *Memory Usage:* ${formatMemory(usedMem)} / ${formatMemory(totalMem)}
📈 *Memory Usage:* ${memUsagePercent.toFixed(2)}%

🧠 *CPU Cores:* ${cpuCores} cores
⚡ *Platform:* ${os.platform()}/${os.arch()}

🟢 *Status:* Online & Operational
🚀 *Performance:* Optimized
      `.trim();

      // Send image with caption
      await client.sendMessage(
        message.key.remoteJid,
        {
          image: { url: "https://i.postimg.cc/3R33G2hC/50153989-E437-4D89-B4BE-25C6DF37B61B.png" },
          caption: caption
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("Error executing ping command:", error);
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: "❌ Error retrieving system information.",
        },
        { quoted: message }
      );
    }
  },
};
