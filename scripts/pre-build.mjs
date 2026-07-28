import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standalone = path.join(root, ".next", "standalone");

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function stopPort(port) {
  const pids = new Set();
  try {
    const out = execSync(`netstat -ano | findstr ":${port}"`, { encoding: "utf8" });
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts.at(-1);
      if (pid && pid !== "0") pids.add(pid);
    }
  } catch {
    return false;
  }

  if (pids.size === 0) return false;

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F /T`, { stdio: "ignore" });
      console.log(`✓ Port ${port} süreci durduruldu (PID ${pid})`);
    } catch {
      console.log(`⚠ PID ${pid} durdurulamadi — build penceresini kapatip tekrar deneyin.`);
    }
  }
  return true;
}

function waitForUnlock(dir, attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    try {
      if (!fs.existsSync(dir)) return true;
      fs.accessSync(dir, fs.constants.W_OK);
      return true;
    } catch {
      sleep(400);
    }
  }
  return !fs.existsSync(dir);
}

console.log("Build öncesi kontrol...");
const stopped = stopPort(3000);
if (stopped) sleep(800);
waitForUnlock(standalone);
console.log("✓ Build için hazır.");
