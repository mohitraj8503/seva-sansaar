import { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Profile } from '@/types';
import { MediaUtils } from '@/utils/connectia/mediaUtils';

const supabase = createClient();

interface UseChatMediaProps {
  currentUser: Profile | null;
  activePartner: Profile | null;
  sendMessage: (
    text: string, 
    type: 'text' | 'image' | 'audio' | 'file' | 'video' | 'call', 
    fileUrl?: string,
    retryId?: string,
    metadata?: { thumbnailUrl?: string | null, width?: number, height?: number, blurHash?: string }
  ) => void;
  handleTyping: (state: 'typing' | 'recording' | null) => void;
  setToast: (msg: string | null) => void;
}

export const useChatMedia = ({
  currentUser, sendMessage, handleTyping, setToast
}: UseChatMediaProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      handleTyping('recording');

      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Recording start error:', err);
      setToast("Could not access microphone");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    setIsRecording(false);
    handleTyping(null);
    setIsUploadingAudio(true);

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        try {
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());

          if (audioChunksRef.current.length === 0 || recordingSeconds < 1) {
            setIsUploadingAudio(false);
            resolve();
            return;
          }

          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
          const fileName = `${currentUser?.id}/${Date.now()}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from('chat-media')
            .upload(fileName, audioBlob, { contentType: mimeType, cacheControl: '3600' });

          if (uploadError) {
            setToast("Failed to upload audio");
            setIsUploadingAudio(false);
            resolve();
            return;
          }

          const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(fileName);
          const durationText = `${Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:${(recordingSeconds % 60).toString().padStart(2, '0')}`;
          
          sendMessage(durationText, 'audio', urlData.publicUrl);

        } catch (err) {
          console.error('Recording stop error:', err);
        } finally {
          setIsUploadingAudio(false);
          setRecordingSeconds(0);
          audioChunksRef.current = [];
          mediaRecorderRef.current = null;
          resolve();
        }
      };
      mediaRecorderRef.current!.stop();
    });
  };



  const uploadFile = async (file: File | Blob, type: string, originalName: string) => {
    if (!currentUser) return { publicUrl: null };
    const path = `${currentUser.id}/${type}-${Date.now()}-${originalName.replace(/\s+/g, '_')}`;
    const { error } = await supabase.storage.from('chat-media').upload(path, file);
    if (error) return { publicUrl: null };
    const { data } = supabase.storage.from('chat-media').getPublicUrl(path);
    return { publicUrl: data.publicUrl };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    for (const file of files) {
      let actualType: 'image' | 'video' | 'file' = 'file';
      if (file.type.startsWith('image/')) actualType = 'image';
      else if (file.type.startsWith('video/')) actualType = 'video';

      if (actualType === 'image') {
        try {
          // 1. Get dimensions
          const dimensions = await MediaUtils.getImageDimensions(file);
          
          // 2. Compress, generate thumbnail, and generate blurhash in parallel
          const [compressedBlob, thumbnailBlob, blurHash] = await Promise.all([
            MediaUtils.compressImage(file),
            MediaUtils.generateThumbnail(file),
            MediaUtils.generateBlurHash(file)
          ]);

          // 3. Upload both
          const [mainResult, thumbResult] = await Promise.all([
            uploadFile(compressedBlob, 'image', file.name),
            thumbnailBlob ? uploadFile(thumbnailBlob, 'thumb', `thumb_${file.name}`) : Promise.resolve({ publicUrl: null })
          ]);

          if (mainResult.publicUrl) {
            sendMessage('', 'image', mainResult.publicUrl, undefined, {
              thumbnailUrl: thumbResult.publicUrl,
              width: dimensions.width,
              height: dimensions.height,
              blurHash: blurHash || undefined
            });
          }
        } catch (err) {
          console.error('Image processing failed', err);
          setToast("Failed to process image");
        }
      } else {
        const { publicUrl } = await uploadFile(file, actualType, file.name);
        if (publicUrl) sendMessage(file.name, actualType, publicUrl);
      }
    }
  };

  return {
    isRecording, recordingSeconds, isUploadingAudio,
    startRecording, stopRecording, handleFileSelect
  };
};
