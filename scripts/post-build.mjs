/**
 * Next.js standalone output does not automatically copy .next/static or public.
 * This script handles those assets after every production build.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const standaloneDir = path.join(root, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.log("Standalone output not found; skipping post-build copy.");
  process.exit(0);
}

const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
copyDirSync(staticSrc, staticDest);
console.log("Copied .next/static to .next/standalone/.next/static");

const publicSrc = path.join(root, "public");
const publicDest = path.join(standaloneDir, "public");
copyDirSync(publicSrc, publicDest);
console.log("Copied public to .next/standalone/public");

const uploadsDir = path.join(standaloneDir, "public", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
console.log("Ensured .next/standalone/public/uploads exists");

const envSrc = path.join(root, ".env.local");
const envDest = path.join(standaloneDir, ".env.local");
if (fs.existsSync(envSrc) && !fs.existsSync(envDest)) {
  fs.copyFileSync(envSrc, envDest);
  console.log("Copied .env.local to .next/standalone/.env.local");
} else if (fs.existsSync(envDest)) {
  console.log(".env.local already exists in standalone");
}

console.log("Post-build complete.");
