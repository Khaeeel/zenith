import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

/** Persist an image to Blob (prod) or local public/uploads (dev). */
export async function saveUploadedImage(file: File, uploadedBy: string) {
  const mimeType = file.type || "application/octet-stream";
  if (!mimeType.startsWith("image/")) {
    throw new Error("Only image uploads are allowed.");
  }

  const stamp = Date.now();
  const filename = `${stamp}-${safeFileName(file.name || "image")}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return db.mediaAsset.create({
      data: {
        url: blob.url,
        pathname: blob.pathname,
        mimeType,
        alt: file.name,
        uploadedBy,
      },
    });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return db.mediaAsset.create({
    data: {
      url: `/uploads/${filename}`,
      pathname: `local/uploads/${filename}`,
      mimeType,
      alt: file.name,
      uploadedBy,
    },
  });
}
