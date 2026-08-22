import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireAdminSession } from "@/lib/jwt";
import { recordAuditLog } from "@/lib/audit";

// 10 MB Maximum file size limit
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Strict whitelist of safe MIME types and corresponding allowed extensions
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "application/pdf": ".pdf",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce verified admin session
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;


    const data = await request.formData();
    const files: File[] = data.getAll("files") as File[];

    if (!files || files.length === 0) {
      const singleFile = data.get("file") as File;
      if (singleFile) {
        files.push(singleFile);
      } else {
        return NextResponse.json(
          { success: false, error: "ფაილი არ არის არჩეული" },
          { status: 400 }
        );
      }
    }

    // Limit maximum files uploaded in a single batch (max 10)
    if (files.length > 10) {
      return NextResponse.json(
        { success: false, error: "ერთდროულად მაქსიმუმ 10 ფაილის ატვირთვაა შესაძლებელი" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      // 2. Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: `ფაილის ზომა (${(file.size / (1024 * 1024)).toFixed(1)}MB) აღემატება მაქსიმალურ ლიმიტს (10MB)` },
          { status: 400 }
        );
      }

      if (file.size === 0) {
        return NextResponse.json(
          { success: false, error: "ცარიელი ფაილის ატვირთვა დაუშვებელია" },
          { status: 400 }
        );
      }

      // 3. Strict MIME type validation (blocks SVG XSS, HTML, Executables, PHP, JS scripts)
      const mimeType = file.type?.toLowerCase();
      const safeExtension = ALLOWED_MIME_TYPES[mimeType];

      if (!safeExtension) {
        return NextResponse.json(
          {
            success: false,
            error: `დაუშვებელი ფაილის ფორმატი (${file.type || "უცნობი"}). ნებადართულია მხოლოდ JPG, PNG, WEBP, GIF, AVIF, PDF, MP4.`,
          },
          { status: 400 }
        );
      }

      // 4. Sanitize and randomize filename (prevents directory traversal and file overwrites)
      const randomId = crypto.randomUUID();
      const safeFileName = `upload_${Date.now()}_${randomId}${safeExtension}`;
      const destinationPath = path.join(uploadDir, safeFileName);

      // Verify resolved path stays strictly within uploads directory
      if (!destinationPath.startsWith(uploadDir)) {
        return NextResponse.json(
          { success: false, error: "არასწორი ფაილის გზა (Path traversal detected)" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await writeFile(destinationPath, buffer);
      urls.push(`/uploads/${safeFileName}`);
    }

    return NextResponse.json({
      success: true,
      urls,
      url: urls[0],
      message: "ფაილი წარმატებით აიტვირთა",
    });
  } catch (error: any) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ფაილის ატვირთვა ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}
