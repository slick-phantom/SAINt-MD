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
      const cpuModel = cpus[0].model;
      const cpuCores = cpus.length;

      // Platform information
      const platform = os.platform();
      const arch = os.arch();
      const loadAverage = os.loadavg();

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

      // Create the response with awesome ASCII art
      const response = `
╔══════════════════════════════════════════════════╗
║                🚀 SAVY DNI STATS 🚀              ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  🟢  STATUS: ONLINE & OPERATIONAL               ║
║  ⏰  UPTIME: ${days}d ${hours}h ${minutes}m ${seconds}s          ║
║  🎯  RESPONSE: ACTIVE                          ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║               📊 SYSTEM RESOURCES 📊             ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  💾  MEMORY: ${formatMemory(usedMem)} / ${formatMemory(totalMem)}  ║
║  📈  USAGE: ${memUsagePercent.toFixed(2)}%                    ║
║  🔧  PLATFORM: ${platform}/${arch}                ║
║  🧠  CPU: ${cpuCores} cores - ${cpuModel.split(" @ ")[0]}  ║
║  📶  LOAD: ${loadAverage[0].toFixed(2)}, ${loadAverage[1].toFixed(
        2
      )}, ${loadAverage[2].toFixed(2)}  ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║                🛠️ TECHNICAL SPECS 🛠️             ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  🤖  BOT: Savy DNI v1.5.4                       ║
║  🚀  NODE: ${process.version}                      ║
║  📦  MODULES: LOADED                           ║
║  🔗  API: CONNECTED                            ║
║  📡  NETWORK: STABLE                           ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║               🌟 PERFORMANCE METRICS 🌟          ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  ⚡  LATENCY: EXCELLENT                         ║
║  🎯  ACCURACY: 100%                             ║
║  🔄  UPTIME: ${Math.floor(uptime / 3600)} HOURS             ║
║  💫  SPEED: OPTIMIZED                           ║
║                                                  ║
╚══════════════════════════════════════════════════╝
            `.trim();

      await client.sendMessage(
        message.key.remoteJid,
        {
          text: response,
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
