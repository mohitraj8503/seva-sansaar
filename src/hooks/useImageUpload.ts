/**
 * A9 – Client-side image upload hook for Firebase Storage
 * Uploads via the /api/upload-image route (which uses Admin SDK).
 * Returns { url, storagePath, uploading, error, upload }
 */
'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase/client';

interface UploadResult {
  url: string;
  storagePath: string;
}

interface UseImageUploadReturn {
  uploading: boolean;
  error: string | null;
  upload: (file: File) => Promise<UploadResult | null>;
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function upload(file: File): Promise<UploadResult | null> {
    setUploading(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-image', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Upload failed');
      }

      const result: UploadResult = await res.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { uploading, error, upload };
}
