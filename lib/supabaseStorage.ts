import { supabase } from './supabaseClient';

export interface UploadResult {
  success: boolean;
  data?: {
    path: string;
    fullPath: string;
    publicUrl: string;
  };
  error?: string;
}

/**
 * Upload file to Supabase Storage bucket
 * @param file - File object to upload
 * @param bucketName - Name of the storage bucket
 * @param folderPath - Optional folder path within bucket
 * @returns Promise<UploadResult>
 */
export async function uploadFileToStorage(
  file: File,
  bucketName: string = 'asus-pvp-master-media',
  folderPath: string = 'asus-acp-registration-form-store-photo-submission'
): Promise<UploadResult> {
  try {
    // Generate unique filename to prevent conflicts
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Construct file path
    const filePath = `${folderPath}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      };
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      success: true,
      data: {
        path: filePath,
        fullPath: data.path,
        publicUrl: urlData.publicUrl
      }
    };

  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
}

/**
 * Delete file from Supabase Storage bucket
 * @param filePath - Path of file to delete
 * @param bucketName - Name of the storage bucket
 * @returns Promise<boolean>
 */
export async function deleteFileFromStorage(
  filePath: string,
  bucketName: string = 'asus-pvp-master-media'
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Get public URL for a file in storage
 * @param filePath - Path of the file
 * @param bucketName - Name of the storage bucket
 * @returns string - Public URL
 */
export function getFilePublicUrl(
  filePath: string,
  bucketName: string = 'asus-pvp-master-media'
): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}
