const { execSync } = require('child_process');

const freePort = (port = 5000) => {
  const isWin = process.platform === 'win32';
  console.log(`🔍 Checking for processes using port ${port}...`);

  try {
    if (isWin) {
      // Find PID on Windows
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      const lines = output.trim().split('\n');
      const pids = new Set();

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        // On Windows netstat -ano: Protocol, Local Address, Foreign Address, State, PID
        if (parts.length >= 5 && parts[1].endsWith(`:${port}`) && parts[3] === 'LISTENING') {
          const pid = parts[4];
          if (pid && pid !== '0' && parseInt(pid, 10) !== process.pid) {
            pids.add(pid);
          }
        }
      }

      if (pids.size === 0) {
        console.log(`✅ Port ${port} is already free.`);
        return;
      }

      for (const pid of pids) {
        try {
          console.log(`🛑 Terminating process with PID ${pid} occupying port ${port}...`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`✅ Successfully terminated PID ${pid}.`);
        } catch (killErr) {
          console.warn(`⚠️ Could not kill PID ${pid}: ${killErr.message}`);
        }
      }
    } else {
      // Unix/Linux/macOS
      try {
        execSync(`npx --yes kill-port ${port}`, { stdio: 'inherit' });
        console.log(`✅ Port ${port} freed.`);
      } catch {
        execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
      }
    }
  } catch (err) {
    console.log(`ℹ️ Port ${port} is already free or no matching process found.`);
  }
};

if (require.main === module) {
  const targetPort = process.env.PORT || process.argv[2] || 5000;
  freePort(targetPort);
}

module.exports = freePort;
