"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Profile, Call } from '@/types';

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
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [timer, setTimer] = useState(0);
  const [callId, setCallId] = useState<string | null>(incomingCall?.id || null);
  const [isLogCreated, setIsLogCreated] = useState(false);

  const supabase = createClient();
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initCall();
    return () => {
      endCall();
    };
  }, []);

  useEffect(() => {
    if (status === 'connected') {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [status]);

  const initCall = async () => {
    try {
      // 1. Get local stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      // 2. Setup PeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      // Add tracks
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Handle remote tracks
      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
        setStatus('connected');
      };

      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate && callId) {
          // In a real implementation, you'd send ICE candidates via a separate table or jsonb array
          // For simplicity in this demo, we'll assume STUN handles it or use the offer/answer exchange
        }
      };

      if (type === 'outgoing') {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const { data, error } = await supabase.from('calls').insert({
          caller_id: currentUser.id,
          receiver_id: targetUser.id,
          offer: offer,
          status: 'ringing'
        }).select().single();

        if (error) throw error;
        setCallId(data.id);

        // Listen for answer
        const channel = supabase.channel(`call-${data.id}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls', filter: `id=eq.${data.id}` }, async (payload) => {
            const updatedCall = payload.new as Call;
            if (updatedCall.status === 'accepted' && updatedCall.answer) {
              await pc.setRemoteDescription(new RTCSessionDescription(updatedCall.answer));
            } else if (updatedCall.status === 'rejected' || updatedCall.status === 'ended') {
              setStatus(updatedCall.status);
              setTimeout(onClose, 2000);
            }
          })
          .subscribe();
      } else if (type === 'incoming' && incomingCall) {
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await supabase.from('calls').update({
          answer: answer,
          status: 'accepted'
        }).eq('id', incomingCall.id);

        // Listen for end
        const channel = supabase.channel(`call-${incomingCall.id}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls', filter: `id=eq.${incomingCall.id}` }, (payload) => {
            if (payload.new.status === 'ended') {
              setStatus('ended');
              setTimeout(onClose, 2000);
            }
          })
          .subscribe();
      }
    } catch (err) {
      console.error('Call initialization failed:', err);
      onClose();
    }
  };

  const createCallLog = async (finalStatus: string, duration: number) => {
    if (isLogCreated) return;
    setIsLogCreated(true);
    
    let logStatus = 'ended';
    if (finalStatus === 'missed') logStatus = 'missed';
    if (finalStatus === 'rejected') logStatus = 'declined';
    
    const durationText = duration > 0 ? `${Math.floor(duration / 60)}m ${duration % 60}s` : '';

    await supabase.from('messages').insert({
      sender_id: type === 'outgoing' ? currentUser.id : targetUser.id,
      receiver_id: type === 'outgoing' ? targetUser.id : currentUser.id,
      text: logStatus === 'missed' ? 'Missed call' : 
            logStatus === 'declined' ? 'Call declined' : 
            `Call ended • ${durationText}`,
      type: 'call',
      status: 'seen'
    });
  };

  const endCall = async () => {
    const finalStatus = timer === 0 && status !== 'connected' ? 'missed' : 'ended';
    
    if (callId) {
      await supabase.from('calls').update({ 
        status: finalStatus,
        ended_at: new Date().toISOString(),
        duration_sec: timer
      }).eq('id', callId);
    }

    await createCallLog(finalStatus, timer);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    setStatus(finalStatus as 'ended' | 'missed');
    setTimeout(onClose, 2000);
  };

  const handleReject = async () => {
    if (callId) {
      await supabase.from('calls').update({ status: 'rejected' }).eq('id', callId);
    }
    setStatus('rejected');
    setTimeout(onClose, 1000);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-between p-12 text-white"
    >
      <audio ref={remoteAudioRef} autoPlay />

      {/* Header */}
      <div className="flex flex-col items-center gap-4 mt-12">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 relative">
          <img 
            src={targetUser.avatar_url || "/default-avatar.png"} 
            alt={targetUser.name}
            className="w-full h-full object-cover"
          />
          {status === 'connecting' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="animate-spin" />
            </div>
          )}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{targetUser.name}</h2>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">
            {status === 'calling' ? 'Calling...' :
             status === 'ringing' ? 'Ringing...' : 
             status === 'connecting' ? 'Connecting...' : 
             status === 'connected' ? formatTime(timer) : 
             status === 'rejected' ? 'Call Rejected' : 
             status === 'missed' ? 'Missed Call' : 'Call Ended'}
          </p>
        </div>
      </div>

      {/* Visualizer Placeholder */}
      <div className="flex items-center gap-1 h-20">
        {[...Array(12)].map((_, i) => (
          <motion.div 
            key={i}
            animate={{ height: status === 'connected' ? [10, 40, 10] : 10 }}
            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
            className="w-1 bg-indigo-500 rounded-full"
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-12 mb-12 w-full">
        <div className="flex items-center justify-center gap-8 w-full">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button 
            onClick={status === 'ringing' ? handleReject : endCall}
            className="w-20 h-20 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-2xl shadow-rose-500/20 active:scale-90 transition-all"
          >
            <PhoneOff size={32} />
          </button>

          <button 
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isSpeaker ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isSpeaker ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>

        <div className="w-full max-w-[200px] h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            animate={{ x: [-200, 200] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-1/2 h-full bg-indigo-500/50 blur-sm"
          />
        </div>
      </div>
    </motion.div>
  );
};
