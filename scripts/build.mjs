import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(label, cmd, args, extraEnv = {}) {
  console.log(`\n> ${label}`);
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NODE_OPTIONS: [process.env.NODE_OPTIONS, "--max-old-space-size=4096"].filter(Boolean).join(" "),
      ...extraEnv,
    },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("pre-build", "node", ["scripts/pre-build.mjs"]);
run("next build", "npx", ["next", "build"]);
run("post-build", "node", ["scripts/post-build.js"]);

console.log("\n✓ Build tamamlandi.");
