// Storage abstraction — tries Netlify Blobs first, falls back to local files
// This ensures data persists on Netlify (serverless) and works locally for dev
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

// ---- Netlify Blobs helpers ----
async function getNetlifyStore(storeName: string) {
  try {
    const { getStore } = await import("@netlify/blobs");
    return getStore({ name: storeName, consistency: "strong" });
  } catch {
    return null;
  }
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

// Read JSON data by key — tries Netlify Blobs first, then local files
export async function getData(key: string): Promise<string | null> {
  // Always try Netlify Blobs first (works on Netlify, fails gracefully elsewhere)
  try {
    const store = await getNetlifyStore("workout-data");
    if (store) {
      const result = await store.get(key, { type: "text" });
      if (result !== null) return result;
    }
  } catch (err) {
    console.log(`[store] Netlify Blobs read failed for "${key}", falling back to local:`, err);
  }

  // Fall back to local files
  return readLocalFile(`${key}.json`);
}

// Write JSON data by key — tries Netlify Blobs first, then local files
export async function setData(key: string, value: string): Promise<void> {
  // Always try Netlify Blobs first
  try {
    const store = await getNetlifyStore("workout-data");
    if (store) {
      await store.set(key, value);
      return; // Success — don't also write locally
    }
  } catch (err) {
    console.log(`[store] Netlify Blobs write failed for "${key}", falling back to local:`, err);
  }

  // Fall back to local files
  await writeLocalFile(`${key}.json`, value);
}

// Upload a binary file (video), returns a URL to access it
export async function uploadFile(
  filename: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  try {
    const store = await getNetlifyStore("workout-uploads");
    if (store) {
      const uint8 = new Uint8Array(data);
      await store.set(filename, uint8 as unknown as string);
      return `/api/video/${encodeURIComponent(filename)}`;
    }
  } catch (err) {
    console.log(`[store] Netlify Blobs upload failed, falling back to local:`, err);
  }

  // Fall back to local
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), data);
  return `/uploads/${filename}`;
}

// Read a binary file (for serving uploaded videos)
export async function getFile(filename: string): Promise<ArrayBuffer | null> {
  try {
    const store = await getNetlifyStore("workout-uploads");
    if (store) {
      return await store.get(filename, { type: "arrayBuffer" });
    }
  } catch {
    // Not on Netlify
  }
  return null;
}
