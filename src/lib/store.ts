// Storage abstraction — uses Netlify Blobs when deployed, local files when developing
// This means you can test locally AND it works on the real website
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const IS_NETLIFY = !!process.env.NETLIFY;

// ---- Netlify Blobs helpers ----
async function getNetlifyStore(storeName: string) {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: storeName, consistency: "strong" });
}

// ---- Local file helpers ----
const DATA_DIR = path.join(process.cwd(), "data");

async function readLocalFile(filename: string): Promise<string | null> {
  try {
    return await readFile(path.join(DATA_DIR, filename), "utf-8");
  } catch {
    return null;
  }
}

async function writeLocalFile(filename: string, data: string): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(path.join(DATA_DIR, filename), data);
}

// ---- Public API ----

// Read JSON data by key
export async function getData(key: string): Promise<string | null> {
  if (IS_NETLIFY) {
    const store = await getNetlifyStore("workout-data");
    return await store.get(key, { type: "text" });
  }
  return readLocalFile(`${key}.json`);
}

// Write JSON data by key
export async function setData(key: string, value: string): Promise<void> {
  if (IS_NETLIFY) {
    const store = await getNetlifyStore("workout-data");
    await store.set(key, value);
  } else {
    await writeLocalFile(`${key}.json`, value);
  }
}

// Upload a binary file (video), returns a URL to access it
export async function uploadFile(
  filename: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  if (IS_NETLIFY) {
    const store = await getNetlifyStore("workout-uploads");
    // Convert Buffer to Uint8Array for Netlify Blobs compatibility
    const uint8 = new Uint8Array(data);
    await store.set(filename, uint8 as unknown as string);
    return `/api/video/${encodeURIComponent(filename)}`;
  } else {
    // Save locally to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), data);
    return `/uploads/${filename}`;
  }
}

// Read a binary file (for serving uploaded videos on Netlify)
export async function getFile(filename: string): Promise<ArrayBuffer | null> {
  if (IS_NETLIFY) {
    const store = await getNetlifyStore("workout-uploads");
    return await store.get(filename, { type: "arrayBuffer" });
  }
  return null; // Local files are served directly from /public/uploads
}
