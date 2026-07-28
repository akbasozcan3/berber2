const fs = require("fs");
const path = require("path");

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDirSync(s, d) : fs.copyFileSync(s, d);
  }
}

const root = path.resolve(__dirname, "..");
const standalone = path.join(root, ".next", "standalone");

if (!fs.existsSync(standalone)) {
  console.log("⚠  .next/standalone not found — skipping.");
  process.exit(0);
}

copyDirSync(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"));
console.log("✓ Copied .next/static → .next/standalone/.next/static");

copyDirSync(path.join(root, "public"), path.join(standalone, "public"));
console.log("✓ Copied public → .next/standalone/public");

fs.mkdirSync(path.join(standalone, "public", "uploads"), { recursive: true });
console.log("✓ Ensured .next/standalone/public/uploads exists");

const envSrc = path.join(root, ".env.local");
const envDest = path.join(standalone, ".env.local");
if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, envDest);
  console.log("✓ Copied .env.local → standalone");
}

console.log("✓ Post-build complete.");
