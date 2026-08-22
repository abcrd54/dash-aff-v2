import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function run(args: string[]): Promise<void> {
  const process = Bun.spawn([Bun.argv[0], ...args], {
    cwd: join(import.meta.dir, ".."),
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await process.exited;
  if (exitCode !== 0) throw new Error(`Command failed: bun ${args.join(" ")}`);
}

const projectRoot = join(import.meta.dir, "..");
const outputDirectory = await mkdtemp(join(tmpdir(), "dash-aff-check-"));
const bundlePath = join(outputDirectory, "app.js");

try {
  await run(["x", "tsc", "--noEmit"]);
  await run(["test"]);
  await run(["run", "build:css"]);
  await run(["build", "src/index.tsx", "--target", "bun", "--minify", "--outfile", bundlePath]);

  const [bundle, css] = await Promise.all([
    stat(bundlePath),
    stat(join(projectRoot, "public/css/main.css")),
  ]);
  console.log(`CHECK_OK bundle=${bundle.size}B css=${css.size}B`);
} finally {
  await rm(outputDirectory, { recursive: true, force: true });
}
