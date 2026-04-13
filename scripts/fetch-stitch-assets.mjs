/**
 * Downloads Stitch HTML + screenshots for reference screens.
 *
 * Prerequisites:
 *   1. Create an API key: https://stitch.withgoogle.com/settings
 *   2. Set STITCH_API_KEY in the environment
 *
 * Usage (PowerShell):
 *   $env:STITCH_API_KEY="your-key"; node scripts/fetch-stitch-assets.mjs
 *
 * Outputs under design/stitch/<slug>/ (screenshot.png, code.html, response.json)
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "design", "stitch");

const MCP = "https://stitch.googleapis.com/mcp";
const PROJECT_ID = "2058661730364516950";

const SCREENS = [
  {
    slug: "design-system",
    screenId: "asset-stub-assets-08c2e025645b49bfa6f107f2ef25e236-1776061454442",
  },
  { slug: "food-feed-vibrant", screenId: "cf21fa6e6f6743188dc0607217c26134" },
  { slug: "post-detail-vibrant", screenId: "0581b036a1e244e290c7c8b64682a575" },
  { slug: "create-meetup-vibrant", screenId: "7c6a78767852449bbb52fd1329fe0d7d" },
  { slug: "user-profile-vibrant", screenId: "1ee35c50a8f342fd8c79b9865ceadf1b" },
];

function unwrapPayload(body) {
  if (body?.error) {
    const msg =
      typeof body.error === "string"
        ? body.error
        : body.error?.message ?? JSON.stringify(body.error);
    throw new Error(msg);
  }
  const inner = body?.result ?? body;
  if (inner?.isError && inner?.content?.[0]?.text) {
    throw new Error(inner.content[0].text);
  }
  const text = inner?.content?.[0]?.text;
  if (typeof text === "string") {
    try {
      return JSON.parse(text);
    } catch {
      return inner;
    }
  }
  return inner;
}

async function stitchCall(apiKey, name, args) {
  const res = await fetch(MCP, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify({
      method: "tools/call",
      params: { name, arguments: args },
    }),
  });
  const raw = await res.text();
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(`Non-JSON response (${res.status}): ${raw.slice(0, 500)}`);
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${raw.slice(0, 500)}`);
  }
  return unwrapPayload(json);
}

function collectDownloadUrls(obj, found = {}) {
  if (!obj || typeof obj !== "object") return found;
  if (obj.htmlCode?.downloadUrl) found.html = obj.htmlCode.downloadUrl;
  if (obj.screenshot?.downloadUrl) found.screenshot = obj.screenshot.downloadUrl;
  if (obj.figmaExport?.downloadUrl) found.figma = obj.figmaExport.downloadUrl;
  for (const v of Object.values(obj)) {
    if (v && typeof v === "object") collectDownloadUrls(v, found);
  }
  return found;
}

async function downloadTo(url, destPath) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Download failed ${res.status} for ${url.slice(0, 80)}…`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
}

async function main() {
  const apiKey = process.env.STITCH_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "Missing STITCH_API_KEY. Get a key at https://stitch.withgoogle.com/settings then run:\n" +
        "  PowerShell: $env:STITCH_API_KEY=\"...\"; node scripts/fetch-stitch-assets.mjs"
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  for (const { slug, screenId } of SCREENS) {
    const name = `projects/${PROJECT_ID}/screens/${screenId}`;
    console.log(`Fetching ${slug}…`);
    const data = await stitchCall(apiKey, "get_screen", {
      name,
      projectId: PROJECT_ID,
      screenId,
    });

    const dir = join(OUT_DIR, slug);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "response.json"), JSON.stringify(data, null, 2), "utf8");

    const urls = collectDownloadUrls(data);
    if (urls.screenshot) {
      await downloadTo(urls.screenshot, join(dir, "screenshot.png"));
      console.log(`  → ${dir}/screenshot.png`);
    } else {
      console.warn(`  (no screenshot URL in response for ${slug})`);
    }
    if (urls.html) {
      await downloadTo(urls.html, join(dir, "code.html"));
      console.log(`  → ${dir}/code.html`);
    } else {
      console.warn(`  (no html download URL for ${slug})`);
    }
    if (urls.figma) {
      await downloadTo(urls.figma, join(dir, "export.fig"));
      console.log(`  → ${dir}/export.fig`);
    }
  }

  console.log(`\nDone. Reference files in ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
