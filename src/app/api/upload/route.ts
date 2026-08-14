import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const files: File[] = data.getAll("files") as File[];

    if (!files || files.length === 0) {
      // Check for single file
      const singleFile = data.get("file") as File;
      if (singleFile) {
        files.push(singleFile);
      } else {
        return NextResponse.json({ error: "ფაილი არ არის არჩეული" }, { status: 400 });
      }
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Clean filename and generate unique name
      const ext = path.extname(file.name) || ".png";
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${cleanName}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
      
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      urls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ success: true, urls, url: urls[0] });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "ფაილის ატვირთვა ვერ მოხერხდა" }, { status: 500 });
  }
}
