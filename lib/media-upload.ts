import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

function blobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return token || undefined;
}

/** Persist an image to Blob (prod) or local public/uploads (dev). */
export async function saveUploadedImage(file: File, uploadedBy: string) {
  const mimeType = file.type || "application/octet-stream";
  if (!mimeType.startsWith("image/")) {
    throw new Error("Only image uploads are allowed.");
  }

  const stamp = Date.now();
  const filename = `${stamp}-${safeFileName(file.name || "image")}`;
  const token = blobToken();

  if (token) {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      token,
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

  // Vercel serverless FS is read-only — never mkdir/write under /var/task.
  if (process.env.VERCEL) {
    throw new Error(
      "Image uploads require BLOB_READ_WRITE_TOKEN. Create a Blob store in the Vercel project and set the token for Production (and Preview if needed).",
    );
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
