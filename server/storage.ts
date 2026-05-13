import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Diretório local para armazenamento de arquivos
// Nota: Para Vercel, o ideal é usar S3. Mas para funcionamento básico fora do Manus:
const LOCAL_STORAGE_DIR = path.resolve(process.cwd(), "client", "public", "uploads");

if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const fileName = path.basename(key);
  const filePath = path.join(LOCAL_STORAGE_DIR, fileName);
  
  // Ensure subdirectories exist if any
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, Buffer.from(data as any));
  
  return { key, url: `/uploads/${fileName}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const fileName = path.basename(key);
  return { key, url: `/uploads/${fileName}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  const fileName = path.basename(key);
  return `/uploads/${fileName}`;
}
