import { supabase } from '@/lib/supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadProfileImage(
  userId: string,
  imageUri: string
): Promise<UploadResult> {
  try {
    // Get the file extension from the URI
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const fileName = `${userId}/profile_${Date.now()}.${fileExtension}`;

    // Convert the image URI to a blob for upload
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('profilePic')
      .upload(fileName, blob, {
        contentType: `image/${fileExtension}`,
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        success: false,
        error: `Failed to upload image: ${error.message}`,
      };
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('profilePic')
      .getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while uploading the image.',
    };
  }
}

export async function updateUserAvatar(
  userId: string,
  avatarUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (error) {
      console.error('Database update error:', error);
      return {
        success: false,
        error: `Failed to update profile: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Update error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating your profile.',
    };
  }
}