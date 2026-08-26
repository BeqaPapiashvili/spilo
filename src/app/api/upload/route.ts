import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// 15 MB Maximum file size limit
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

// Comprehensive whitelist of safe MIME types and corresponding allowed extensions
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "text/plain": ".txt",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
  "application/x-rar-compressed": ".rar",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/x-msvideo": ".avi",
};

// Fallback safe extension check for mobile browsers that send application/octet-stream or empty MIME
const SAFE_EXTENSIONS: Record<string, string> = {
  ".jpg": ".jpg",
  ".jpeg": ".jpg",
  ".png": ".png",
  ".webp": ".webp",
  ".gif": ".gif",
  ".avif": ".avif",
  ".heic": ".heic",
  ".heif": ".heif",
  ".pdf": ".pdf",
  ".doc": ".doc",
  ".docx": ".docx",
  ".xls": ".xls",
  ".xlsx": ".xlsx",
  ".txt": ".txt",
  ".zip": ".zip",
  ".rar": ".rar",
  ".mp4": ".mp4",
  ".webm": ".webm",
  ".mov": ".mov",
};

/**
 * Uploads media buffer directly to Cloudinary if credentials exist in .env
 */
async function uploadToCloudinary(buffer: Buffer, mimeType: string, folder = "spilo"): Promise<string | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signaturePayload).digest("hex");

    const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;
    const formData = new FormData();
    formData.append("file", base64Data);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data?.secure_url) {
      return data.secure_url;
    }
    console.warn("[Cloudinary Upload Warning]:", data);
    return null;
  } catch (err) {
    console.error("[Cloudinary Upload Error]:", err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
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
      // 1. Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: `ფაილის ზომა (${(file.size / (1024 * 1024)).toFixed(1)}MB) აღემატება მაქსიმალურ ლიმიტს (15MB)`,
          },
          { status: 400 }
        );
      }

      if (file.size === 0) {
        return NextResponse.json(
          { success: false, error: "ცარიელი ფაილის ატვირთვა დაუშვებელია" },
          { status: 400 }
        );
      }

      // 2. Resolve safe extension from MIME or file extension
      const mimeType = (file.type || "").toLowerCase();
      let safeExtension = ALLOWED_MIME_TYPES[mimeType];

      if (!safeExtension && file.name) {
        const ext = path.extname(file.name).toLowerCase();
        safeExtension = SAFE_EXTENSIONS[ext];
      }

      if (!safeExtension) {
        return NextResponse.json(
          {
            success: false,
            error: `დაუშვებელი ფაილის ფორმატი (${file.type || file.name || "უცნობი"}). ნებადართულია მხოლოდ სურათები (JPG, PNG, WEBP, GIF, HEIC), ვიდეოები (MP4, MOV, WEBM) და დოკუმენტები (PDF, DOCX, XLSX, TXT, ZIP).`,
          },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 3. Try Cloudinary upload first if configured in environment
      const cloudinaryUrl = await uploadToCloudinary(buffer, mimeType || "application/octet-stream");
      if (cloudinaryUrl) {
        urls.push(cloudinaryUrl);
        continue;
      }

      // 4. Local Upload Storage
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
