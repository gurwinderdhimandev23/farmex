import { createClient } from "@supabase/supabase-js";
import { env } from "@/server/config/env";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
const BUCKET_NAME = "documents";

/**
 * Deletes a file from Supabase Storage given its full public URL or relative path.
 */
export async function deleteFileFromStorage(urlOrPath?: string | null): Promise<boolean> {
  if (!urlOrPath) return false;

  // Ignore data URIs or local placeholder images
  if (urlOrPath.startsWith("data:") || urlOrPath.startsWith("/images/")) {
    return false;
  }

  try {
    let filePath = urlOrPath;

    // If it is a full Supabase URL, extract the bucket-relative path
    // e.g. https://xyz.supabase.co/storage/v1/object/public/documents/kyc/123-abc.jpg
    if (urlOrPath.includes(`/storage/v1/object/public/${BUCKET_NAME}/`)) {
      filePath = urlOrPath.split(`/storage/v1/object/public/${BUCKET_NAME}/`)[1];
    } else if (urlOrPath.includes(`/storage/v1/object/sign/${BUCKET_NAME}/`)) {
      filePath = urlOrPath.split(`/storage/v1/object/sign/${BUCKET_NAME}/`)[1].split("?")[0];
    }

    if (!filePath) return false;

    // Decode URL component in case of encoded characters
    filePath = decodeURIComponent(filePath);

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (error) {
      console.warn(`[STORAGE_DELETE_WARN] Failed to delete ${filePath}:`, error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn(`[STORAGE_DELETE_ERROR] Exception deleting ${urlOrPath}:`, err);
    return false;
  }
}
