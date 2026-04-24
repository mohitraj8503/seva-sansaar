"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PhoneOff, Mic, MicOff, Loader2, Video, VideoOff, Maximize2, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Profile, Call } from '@/types';
import { clsx } from 'clsx';
import Image from 'next/image';
import { RealtimeChannel } from '@supabase/supabase-js';

interface CallInterfaceProps {
  currentUser: Profile;
  targetUser: Profile;
  type: 'outgoing' | 'incoming';
  onClose: () => void;
  incomingCall?: Call;
}

export const CallInterface = ({ currentUser, targetUser, type, onClose, incomingCall }: CallInterfaceProps) => {
  const [status, setStatus] = useState<'calling' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected' | 'missed'>(
    type === 'outgoing' ? 'calling' : 'ringing'
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timer, setTimer] = useState(0);
  const [callId, setCallId] = useState<string | null>(incomingCall?.id || null);
  const [isPiP, setIsPiP] = useState(false);

  const supabase = createClient();
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // useEffect moved below for declaration order

  useEffect(() => {
    if (status === 'connected') {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [status]);

  const initCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      });
      pcRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setStatus('connected');
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: { candidate: event.candidate, to: targetUser.id }
          });
        }
      };

      // Set up signaling channel
      const channel = supabase.channel(`call-signaling-${callId || 'new'}`);
      channelRef.current = channel;

      channel.on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload.to === currentUser.id && pcRef.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        }
      }).subscribe();

      if (type === 'outgoing') {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const { data, error } = await supabase.from('calls').insert({
          caller_id: currentUser.id,
          receiver_id: targetUser.id,
          offer: offer,
          status: 'ringing',
          type: 'video'
        }).select().single();

        if (error) throw error;
        setCallId(data.id);

        // Listen for answer
        supabase.channel(`call-update-${data.id}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls', filter: `id=eq.${data.id}` }, async (payload) => {
            const updatedCall = payload.new as Call;
            if (updatedCall.status === 'accepted' && updatedCall.answer) {
              await pc.setRemoteDescription(new RTCSessionDescription(updatedCall.answer));
              setStatus('connected');
            } else if (updatedCall.status === 'rejected' || updatedCall.status === 'ended') {
              setStatus(updatedCall.status);
              setTimeout(onClose, 2000);
            }
          }).subscribe();
      } else if (incomingCall && incomingCall.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await supabase.from('calls').update({ answer, status: 'accepted' }).eq('id', incomingCall.id);
        setStatus('connected');
      }
    } catch (err) {
      console.error('Call initialization failed:', err);
      onClose();
    }
  }, [callId, currentUser.id, incomingCall, onClose, supabase, targetUser.id, type]);

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await (navigator.mediaDevices as unknown as { getDisplayMedia: (constraints: { video: boolean }) => Promise<MediaStream> }).getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const videoTrack = screenStream.getVideoTracks()[0];
        
        if (pcRef.current) {
          const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        }
        
        videoTrack.onended = () => { stopScreenShare(); };
        setIsScreenSharing(true);
      } catch (err) { console.error('Screen share failed:', err); }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (localStreamRef.current && pcRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(videoTrack);
    }
    setIsScreenSharing(false);
  }, []);

  const endCall = useCallback(async () => {
    stopScreenShare();
    if (pcRef.current) pcRef.current.close();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    if (callId) {
      await supabase.from('calls').update({ status: 'ended', duration_sec: timer }).eq('id', callId);
    }
    setStatus('ended');
    setTimeout(onClose, 1000);
  }, [callId, onClose, stopScreenShare, supabase, timer]);

  useEffect(() => {
    initCall();
    return () => {
      endCall();
    };
  }, [initCall, endCall]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className={clsx(
        "fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center transition-all duration-500",
        isPiP ? "w-64 h-96 right-6 bottom-6 top-auto left-auto rounded-3xl overflow-hidden shadow-2xl" : ""
      )}
    >
      {/* BACKGROUND VIDEO (REMOTE) */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* HEADER INFO */}
      <div className="absolute top-12 left-0 right-0 z-10 flex flex-col items-center text-white">
        <motion.div 
          initial={{ y: -20 }} 
          animate={{ y: 0 }}
          className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden mb-4 shadow-xl relative"
        >
          <Image src={targetUser.avatar_url || "/default-avatar.png"} alt="" fill className="object-cover" />
        </motion.div>
        <h2 className="text-2xl font-black uppercase tracking-widest mb-1">{targetUser.name}</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full">
           {status === 'connected' ? (
             <span className="text-xs font-black font-mono">{formatTimer(timer)}</span>
           ) : (
             <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">{status}...</span>
           )}
        </div>
      </div>

      {/* LOCAL PREVIEW */}
      <motion.div 
        drag
        dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
        className="absolute top-32 right-6 w-32 h-48 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 z-20 cursor-move"
      >
        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        {isVideoOff && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-white/50">
            <VideoOff size={24} />
          </div>
        )}
      </motion.div>

      {/* CONTROLS */}
      <div className="absolute bottom-16 left-0 right-0 z-30 flex items-center justify-center gap-6">
        <button 
          onClick={toggleMute}
          className={clsx(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all backdrop-blur-md",
            isMuted ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button 
          onClick={toggleVideo}
          className={clsx(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all backdrop-blur-md",
            isVideoOff ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <button 
          onClick={endCall}
          className="w-18 h-18 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-rose-900/50 hover:bg-rose-700 transition-all active:scale-90"
        >
          <PhoneOff size={32} />
        </button>

        <button 
          onClick={toggleScreenShare}
          className={clsx(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all backdrop-blur-md",
            isScreenSharing ? "bg-green-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          <Monitor size={24} />
        </button>

        <button 
          onClick={() => setIsPiP(!isPiP)}
          className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-white/20"
        >
          <Maximize2 size={24} className={isPiP ? "rotate-180" : ""} />
        </button>
      </div>

      <AnimatePresence>
        {status === 'connecting' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center"
          >
            <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
            <p className="text-white font-black uppercase tracking-widest text-xs">Securing Connection...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
