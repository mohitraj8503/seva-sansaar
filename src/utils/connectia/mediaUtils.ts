import imageCompression from 'browser-image-compression';
import { encode } from 'blurhash';

export const MediaUtils = {
  /**
   * Compresses an image file for chat usage.
   */
  compressImage: async (file: File) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      initialQuality: 0.7,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Compression failed', error);
      return file;
    }
  },

  /**
   * Generates a tiny thumbnail for instant preview.
   */
  generateThumbnail: async (file: File) => {
    const options = {
      maxSizeMB: 0.02, // ~20KB
      maxWidthOrHeight: 200,
      useWebWorker: true,
      initialQuality: 0.5,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Thumbnail generation failed', error);
      return null;
    }
  },

  /**
   * Gets image dimensions from a file.
   */
  getImageDimensions: (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const dimensions = { width: img.width, height: img.height };
        URL.revokeObjectURL(img.src);
        resolve(dimensions);
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
    });
  },

  /**
   * Generates a BlurHash string for an image file.
   */
  generateBlurHash: async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        // Resize for performance
        canvas.width = 32;
        canvas.height = 32;
        ctx.drawImage(img, 0, 0, 32, 32);

        const imageData = ctx.getImageData(0, 0, 32, 32);
        const hash = encode(imageData.data, imageData.width, imageData.height, 4, 4);
        
        URL.revokeObjectURL(img.src);
        resolve(hash);
      };
      img.onerror = () => resolve(null);
    });
  }
};
