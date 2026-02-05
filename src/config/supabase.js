import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://nrpdilyrrryrikjignzw.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ycGRpbHlycnJ5cmlramlnbnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzM4MTUsImV4cCI6MjA4NTYwOTgxNX0.pSG9N1UNIkyqe3nsZsXjFY4Ovvs1wtpzwrwQklQ6NiI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for image operations
export const uploadImage = async (file, bucket = 'menu-images', folder = 'food-items') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    throw error;
  }
};

// Delete image from Supabase
export const deleteImage = async (imageUrl, bucket = 'menu-images') => {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(2).join('/'); // Remove bucket name and public prefix

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image from Supabase:', error);
    throw error;
  }
};

// Update image (delete old and upload new)
export const updateImage = async (oldImageUrl, newFile, bucket = 'menu-images', folder = 'food-items') => {
  try {
    // Delete old image if it exists
    if (oldImageUrl && !oldImageUrl.includes('placeholder')) {
      await deleteImage(oldImageUrl, bucket);
    }

    // Upload new image
    return await uploadImage(newFile, bucket, folder);
  } catch (error) {
    console.error('Error updating image in Supabase:', error);
    throw error;
  }
};
