import { cp, copyFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "..");
const source = path.join(repoRoot, "climate-risk-observatory");
const destination = path.join(appRoot, "public", "climate-risk-observatory");

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(path.join(source, "assets"), path.join(destination, "assets"), { recursive: true });

const entries = await readdir(source, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isFile() || entry.name === "index.html" || entry.name.startsWith(".")) continue;
  await copyFile(path.join(source, entry.name), path.join(destination, entry.name));
}
console.log("Prepared legacy research pages, scripts, styles and paper files for the Astro build.");
