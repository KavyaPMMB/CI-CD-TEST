import { execSync } from "node:child_process";

const ports = [5000, 5173];

function run(command) {
  try {
    return execSync(command, { stdio: ["ignore", "pipe", "pipe"] }).toString();
  } catch {
    return "";
  }
}

function killPortsWindows() {
  for (const port of ports) {
    const output = run(`netstat -ano -p tcp | findstr :${port}`);
    const pids = new Set();
    output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const parts = line.split(/\s+/);
        const state = parts[3];
        const pid = parts[4];
        if (state === "LISTENING" && pid) pids.add(pid);
      });

    [...pids].forEach((pid) => run(`taskkill /PID ${pid} /F`));
  }
}

function killPortsUnix() {
  for (const port of ports) {
    const output = run(`lsof -ti tcp:${port}`);
    const pids = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    pids.forEach((pid) => run(`kill -9 ${pid}`));
  }
}

if (process.platform === "win32") killPortsWindows();
else killPortsUnix();

console.log("Ports cleaned:", ports.join(", "));
