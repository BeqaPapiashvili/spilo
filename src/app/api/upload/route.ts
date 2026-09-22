import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireAdminSession, getAuthSession } from "@/lib/jwt";
import { resolveIdentity, jsonWithIdentity } from "@/lib/identity";
import { enforceRateLimit } from "@/lib/rateLimit";
import { ADMIN_ROLES } from "@/lib/permissions";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const GUEST_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ADMIN_MIME_TYPES: Record<string, string> = {
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
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

const PUBLIC_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

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
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await resolveIdentity(request);
    const session = await getAuthSession(request);
    const isAdmin = Boolean(session?.role && ADMIN_ROLES.includes(session.role));

    if (!isAdmin && !identity.userId && !identity.sessionId) {
      return NextResponse.json({ success: false, error: "ავტორიზაცია აუცილებელია" }, { status: 401 });
    }

    const rate = await enforceRateLimit(request, {
      namespace: isAdmin ? "upload_admin" : "upload_public",
      identifier: identity.userId || identity.sessionId || "anon",
      limit: isAdmin ? 40 : 10,
      windowSeconds: 15 * 60,
      customMessage: "ატვირთვის ლიმიტი გადაჭარბებულია. გთხოვთ სცადოთ მოგვიანებით.",
    });
    if (!rate.success && rate.response) return rate.response;

    if (isAdmin) {
      const { errorResponse } = await requireAdminSession(request);
      if (errorResponse) return errorResponse;
    }

    const data = await request.formData();
    const files: File[] = data.getAll("files") as File[];

    if (!files || files.length === 0) {
      const singleFile = data.get("file") as File;
      if (singleFile) {
        files.push(singleFile);
      } else {
        return jsonWithIdentity({ success: false, error: "ფაილი არ არის არჩეული" }, identity, {
          status: 400,
        });
      }
    }

    if (files.length > (isAdmin ? 10 : 3)) {
      return jsonWithIdentity(
        { success: false, error: "ერთდროულად ძალიან ბევრი ფაილია არჩეული" },
        identity,
        { status: 400 }
      );
    }

    const allowList = isAdmin ? ADMIN_MIME_TYPES : PUBLIC_MIME_TYPES;
    const maxSize = isAdmin ? MAX_FILE_SIZE_BYTES : GUEST_MAX_FILE_SIZE_BYTES;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (file.size > maxSize || file.size === 0) {
        return jsonWithIdentity(
          {
            success: false,
            error: file.size === 0
              ? "ცარიელი ფაილის ატვირთვა დაუშვებელია"
              : `ფაილის ზომა აღემატება ლიმიტს (${Math.round(maxSize / (1024 * 1024))}MB)`,
          },
          identity,
          { status: 400 }
        );
      }

      const mimeType = (file.type || "").toLowerCase();
      const safeExtension = allowList[mimeType];
      if (!safeExtension) {
        return jsonWithIdentity(
          {
            success: false,
            error: isAdmin
              ? "დაუშვებელი ფაილის ფორმატი"
              : "სტუმარს შეუძლია მხოლოდ სურათის ატვირთვა (JPG, PNG, WEBP, GIF)",
          },
          identity,
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const cloudinaryUrl = await uploadToCloudinary(buffer, mimeType || "application/octet-stream");
      if (cloudinaryUrl) {
        urls.push(cloudinaryUrl);
        continue;
      }

      const randomId = crypto.randomUUID();
      const safeFileName = `upload_${Date.now()}_${randomId}${safeExtension}`;
      const destinationPath = path.join(uploadDir, safeFileName);
      const resolved = path.resolve(destinationPath);
      if (!resolved.startsWith(path.resolve(uploadDir))) {
        return jsonWithIdentity({ success: false, error: "არასწორი ფაილის გზა" }, identity, {
          status: 400,
        });
      }

      await writeFile(destinationPath, buffer);
      urls.push(`/uploads/${safeFileName}`);
    }

    return jsonWithIdentity(
      {
        success: true,
        urls,
        url: urls[0],
        message: "ფაილი წარმატებით აიტვირთა",
      },
      identity
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "ფაილის ატვირთვა ვერ მოხერხდა";
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
