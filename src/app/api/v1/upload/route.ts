import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/server/config/env";
import { deleteFileFromStorage } from "@/server/shared/utils/storage.utils";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
const BUCKET_NAME = "documents";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "kyc";
    const oldUrl = formData.get("oldUrl") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { message: "No file provided for upload." } },
        { status: 400 }
      );
    }

    // Validate mime type
    const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid file format. Please upload JPEG, PNG, or WebP image." } },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: { message: "File size exceeds 10MB limit." } },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop() || "jpg";
    const uniqueFileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    let publicUrl: string | null = null;

    try {
      // 1. Try uploading to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(uniqueFileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uniqueFileName);
        publicUrl = urlData.publicUrl;

        // If upload succeeded and an old file URL was provided, delete the old file from storage!
        if (oldUrl) {
          await deleteFileFromStorage(oldUrl);
        }
      }
    } catch (supabaseErr) {
      console.warn("[SUPABASE_STORAGE_WARNING] Direct upload failed, using Data URI fallback:", supabaseErr);
    }

    // 2. High-reliability fallback: If bucket is not public/setup, create compressed Data URI
    if (!publicUrl) {
      const base64Data = buffer.toString("base64");
      publicUrl = `data:${file.type};base64,${base64Data}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
      },
    });
  } catch (error) {
    console.error("[UPLOAD_EXCEPTION]", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : "Failed to upload file." },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { success: false, error: { message: "Missing url parameter" } },
        { status: 400 }
      );
    }

    const deleted = await deleteFileFromStorage(url);
    return NextResponse.json({
      success: true,
      data: { deleted },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : "Failed to delete file." },
      },
      { status: 500 }
    );
  }
}
