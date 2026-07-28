import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Windows'ta 4GB heap + Turbopack derlemesi RAM/GPU'yu tüketip sistemi kilitleyebiliyor.
// Varsayılan: 1536 MB. Artırmak için: BUILD_MEMORY_MB=2048 npm run build
const totalRamGb = os.totalmem() / 1024 ** 3;
const defaultMemoryMb = totalRamGb <= 8 ? 1280 : 1536;
const memoryMb = Math.min(
  Number(process.env.BUILD_MEMORY_MB || defaultMemoryMb),
  Math.max(1024, Math.floor(totalRamGb * 1024 * 0.35)),
);

function run(label, cmd, args, extraEnv = {}) {
  console.log(`\n> ${label}`);
  if (label === "next build") {
    console.log(`  Bellek limiti: ${memoryMb} MB (BUILD_MEMORY_MB ile degistirilebilir)`);
  }

  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NODE_OPTIONS: [
        process.env.NODE_OPTIONS,
        `--max-old-space-size=${memoryMb}`,
      ]
        .filter(Boolean)
        .join(" "),
      NEXT_TELEMETRY_DISABLED: "1",
      ...extraEnv,
    },
  });

  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("pre-build", "node", ["scripts/pre-build.mjs"]);
run("next build", "npx", ["next", "build"], {
  NEXT_DISABLE_SOURCEMAP: process.env.NEXT_DISABLE_SOURCEMAP ?? "1",
});
run("post-build", "node", ["scripts/post-build.js"]);

console.log("\n✓ Build tamamlandi.");
