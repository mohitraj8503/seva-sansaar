import { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Profile } from '@/types';

const supabase = createClient();

interface UseChatMediaProps {
  currentUser: Profile | null;
  activePartner: Profile | null;
  sendMessage: (text: string, type: 'text' | 'image' | 'audio' | 'file' | 'video' | 'call', fileUrl?: string) => void;
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

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1200;
        if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.8);
      };
    });
  };

  const uploadFile = async (file: File, type: string) => {
    if (!currentUser) return { publicUrl: null };
    let fileToUpload: File | Blob = file;
    if (file.type.startsWith('image/')) fileToUpload = await compressImage(file);

    const path = `${currentUser.id}/${type}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { error } = await supabase.storage.from('chat-media').upload(path, fileToUpload);
    if (error) return { publicUrl: null };
    const { data } = supabase.storage.from('chat-media').getPublicUrl(path);
    return { publicUrl: data.publicUrl };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    for (const file of files) {
      let actualType: 'image' | 'video' | 'file' = 'file';
      if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name)) actualType = 'image';
      else if (file.type.startsWith('video/') || /\.(mp4|mov|avi|wmv)$/i.test(file.name)) actualType = 'video';

      const { publicUrl } = await uploadFile(file, actualType);
      if (publicUrl) sendMessage(file.name, actualType, publicUrl);
    }
  };

  return {
    isRecording, recordingSeconds, isUploadingAudio,
    startRecording, stopRecording, handleFileSelect
  };
};
