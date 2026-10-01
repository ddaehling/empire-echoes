import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const manifest = JSON.parse(
  await readFile(path.join(output, "build-manifest.json"), "utf8"),
);
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const appDocuments = new Set([
  "vendor/README.md",
  "next/vendor/README.md",
  "journey/vendor/README.md",
  "data/geo/README.md",
  "journey/assets/teacher-handout.pdf",
]);
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
  ".LICENSE",
]);
const publicFiles = new Set([
  "index.html",
  "licenses/index.html",
  "licenses/NOTICE.txt",
  "licenses/source-sans-3-OFL.txt",
  "licenses/source-serif-4-OFL.txt",
  "licenses/ibm-plex-mono-OFL.txt",
]);
const actual = [];
async function walk(directory, relative = "") {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.posix.join(relative, entry.name);
    assert(!entry.isSymbolicLink(), `Published symlink: ${file}`);
    if (entry.isDirectory()) await walk(path.join(directory, entry.name), file);
    else actual.push(file);
  }
}
await walk(output);
assert.deepEqual(
  actual.sort(),
  [...Object.keys(manifest.files), ".nojekyll", "build-manifest.json"].sort(),
  "Output differs from its public manifest",
);

// Verify the entire source snapshot, including its unpublished documentation.
const frozen = JSON.parse(
  await readFile(path.join(root, manifest.snapshot, "manifest.json"), "utf8"),
);
for (const [file, expected] of Object.entries(frozen.files)) {
  assert.equal(
    sha256(await readFile(path.join(root, manifest.snapshot, file))),
    expected,
    `Frozen snapshot changed: ${file}`,
  );
}

let references = 0;
async function checkReference(from, reference) {
  reference = reference.trim().replaceAll("&amp;", "&");
  if (
    !reference ||
    reference.startsWith("#") ||
    /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference) ||
    reference.includes("${")
  )
    return;
  assert(
    !reference.startsWith("/"),
    `Root-relative URL loses GitHub Pages prefix: ${from} → ${reference}`,
  );
  const target = new URL(
    reference,
    `https://static.invalid/${from}`,
  ).pathname.slice(1);
  const location = path.join(output, decodeURIComponent(target));
  try {
    const info = await stat(location);
    if (info.isDirectory()) await stat(path.join(location, "index.html"));
  } catch {
    throw new Error(`Missing public dependency: ${from} → ${reference}`);
  }
  references += 1;
}

for (const [file, record] of Object.entries(manifest.files)) {
  assert(
    !file
      .split("/")
      .some(
        (part) =>
          part.startsWith(".") ||
          ["docs", "Downloads", "node_modules", "tools", "progress"].includes(
            part,
          ),
      ),
    `Private path published: ${file}`,
  );
  const appPrefix = file.startsWith("app/")
    ? "app/"
    : `${manifest.snapshot}/app/`;
  const appFile = file.startsWith(appPrefix)
    ? file.slice(appPrefix.length)
    : null;
  assert(
    publicFiles.has(file) ||
      (appFile &&
        (runtimeExtensions.has(path.extname(file)) ||
          appDocuments.has(appFile))),
    `File outside public allowlist: ${file}`,
  );
  assert(
    !file.endsWith("/download-metadata.json"),
    `Raw download cache published: ${file}`,
  );
  const bytes = await readFile(path.join(output, file));
  assert.equal(bytes.length, record.bytes, `Size mismatch: ${file}`);
  assert.equal(sha256(bytes), record.sha256, `Output hash mismatch: ${file}`);
  assert.equal(
    sha256(await readFile(path.join(root, record.source))),
    record.sha256,
    `Source changed since build: ${file}`,
  );
  if (appPrefix.startsWith("snapshots/") && appFile)
    assert.equal(
      record.sha256,
      frozen.files[`app/${appFile}`],
      `Snapshot output changed: ${file}`,
    );
  if (
    [".html", ".css", ".js", ".mjs", ".json", ".md", ".txt"].includes(
      path.extname(file),
    )
  ) {
    const source = bytes.toString("utf8");
    assert(
      !/\/Users\/[^\s/]+\/(?:Downloads|Documents)\//.test(source),
      `Local source path published: ${file}`,
    );
    if (file.endsWith(".html")) {
      for (const match of source.matchAll(
        /\b(?:src|href)\s*=\s*["']([^"']+)["']/g,
      ))
        await checkReference(file, match[1]);
    }
    if (file.endsWith(".css")) {
      for (const match of source.matchAll(
        /url\(\s*["']?([^\s"')]+)["']?\s*\)/g,
      ))
        await checkReference(file, match[1]);
    }
    if (/\.(?:m?js)$/.test(file)) {
      const withoutComments = source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");
      for (const match of withoutComments.matchAll(
        /(?:\bfrom\s*|\bimport\s*\(?\s*)["'](\.{1,2}\/[^"']+)["']/g,
      ))
        await checkReference(file, match[1]);
    }
  }
}

for (const prefix of ["app", `${manifest.snapshot}/app`]) {
  for (const file of [
    "index.html",
    "next/index.html",
    "journey/index.html",
    "journey/js/main.js",
    "journey/assets/teacher-handout.pdf",
    "data/geo/units-coarse.topo.json",
    "assets/fonts/source-sans-3-var-roman-latin.woff2",
  ]) {
    assert(
      manifest.files[`${prefix}/${file}`],
      `Missing required app asset: ${prefix}/${file}`,
    );
  }
}
assert.equal((await readFile(path.join(output, ".nojekyll"))).length, 0);
console.log(
  `Verified ${Object.keys(manifest.files).length} public files, ${references} local references and ${Object.keys(frozen.files).length} exact frozen snapshot files.`,
);
