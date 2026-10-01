import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const snapshot = "snapshots/2026-10-01-before-simplification";
const runtimeExtensions = new Set([
  ".html",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".svg",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".woff",
  ".woff2",
]);
const publicAppDocuments = new Set([
  "vendor/README.md",
  "next/vendor/README.md",
  "journey/vendor/README.md",
  "data/geo/README.md",
  "journey/assets/teacher-handout.pdf",
]);
const publicFiles = [
  "licenses/index.html",
  "licenses/NOTICE.txt",
  "licenses/source-sans-3-OFL.txt",
  "licenses/source-serif-4-OFL.txt",
  "licenses/ibm-plex-mono-OFL.txt",
];

async function appFiles(directory, relative = "") {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const name = path.posix.join(relative, item.name);
    if (item.isSymbolicLink())
      throw new Error(`Refusing to publish a symbolic link: ${name}`);
    if (item.name.startsWith(".")) continue;
    if (item.isDirectory())
      files.push(...(await appFiles(path.join(directory, item.name), name)));
    else if (
      item.isFile() &&
      name !== "journey/assets/territories/download-metadata.json" &&
      (runtimeExtensions.has(path.extname(name)) ||
        name.endsWith(".LICENSE") ||
        publicAppDocuments.has(name))
    )
      files.push(name);
  }
  return files.sort();
}

// Only named public inputs are copied. Never publish the repository root,
// source PDFs, research documents, screenshots, node_modules or tool caches.
const inputs = [{ source: "index.html", destination: "index.html" }];
for (const appRoot of ["app", `${snapshot}/app`]) {
  for (const file of await appFiles(path.join(root, appRoot))) {
    inputs.push({
      source: `${appRoot}/${file}`,
      destination: `${appRoot}/${file}`,
    });
  }
}
for (const file of publicFiles)
  inputs.push({ source: file, destination: file });

// Validate all inputs before replacing a previous build.
for (const input of inputs) await readFile(path.join(root, input.source));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const manifest = { format: 1, snapshot, files: {} };
let totalBytes = 0;
for (const input of inputs.sort((a, b) =>
  a.destination.localeCompare(b.destination),
)) {
  const source = path.join(root, input.source);
  const destination = path.join(output, input.destination);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination);
  const bytes = await readFile(destination);
  totalBytes += bytes.length;
  manifest.files[input.destination] = {
    source: input.source,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}
await writeFile(path.join(output, ".nojekyll"), "");
await writeFile(
  path.join(output, "build-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(
  `Built ${inputs.length} public files (${(totalBytes / 1024 / 1024).toFixed(1)} MiB) in dist/.`,
);
console.log(
  "Current: app/journey/ · Frozen: snapshots/2026-10-01-before-simplification/app/journey/",
);
