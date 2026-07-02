import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a file to the 'invoices' bucket.
 * Files are stored under: invoices/{userId}/{timestamp}-{filename}
 * @returns the file path — save this in your database
 */
export async function uploadInvoiceFile(file: File, userId: string): Promise<string> {
  const filePath = `${userId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("invoices")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return data.path;
}

/**
 * Get a temporary signed URL to view or download a private file.
 * URL expires in 1 hour by default.
 */
export async function getInvoiceSignedUrl(
  filePath: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from("invoices")
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) throw new Error(`Failed to get URL: ${error.message}`);
  return data.signedUrl;
}

/**
 * Delete a file from the 'invoices' bucket.
 */
export async function deleteInvoiceFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from("invoices")
    .remove([filePath]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}

/**
 * List all uploaded files for a specific user.
 */
export async function listUserInvoiceFiles(userId: string) {
  const { data, error } = await supabase.storage
    .from("invoices")
    .list(userId, {
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) throw new Error(`List failed: ${error.message}`);
  return data;
}
