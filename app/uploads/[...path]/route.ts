import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePathList = resolvedParams.path;
    if (!filePathList || filePathList.length === 0) {
      return new Response("Not Found", { status: 404 });
    }

    // Prevent directory traversal attacks
    const safePath = filePathList.map(p => p.replace(/\.\./g, "")).join("/");
    
    // Resolve absolute path to file in public/uploads
    const absolutePath = path.join(process.cwd(), "public", "uploads", safePath);

    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    const fileBuffer = await readFile(absolutePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}
