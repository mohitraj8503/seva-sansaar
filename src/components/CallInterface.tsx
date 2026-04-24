"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Profile, Call } from '@/types';
import { clsx } from 'clsx';
import Image from 'next/image';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ConnectiaCrypto, getPrivateKey, getSharedSecret } from '@/utils/crypto';

type CallState = 'idle' | 'calling' | 'ringing' | 'connecting' | 'checking' | 'connected' | 'ended' | 'failed' | 'rejected';

interface CallInterfaceProps {
  currentUser: Profile;
  targetUser: Profile;
  type: 'outgoing' | 'incoming';
  onClose: () => void;
}

export const CallInterface = ({ currentUser, targetUser, type, onClose }: CallInterfaceProps) => {
  const [status, setStatus] = useState<CallState>(type === 'outgoing' ? 'calling' : 'ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPiP, setIsPiP] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const supabase = createClient();
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sharedSecretRef = useRef<Uint8Array | null>(null);

  // --- CRYPTO HELPERS ---
  const encryptSignaling = async (data: Record<string, unknown>) => {
    if (!sharedSecretRef.current) return null;
    return await ConnectiaCrypto.encrypt(JSON.stringify(data), sharedSecretRef.current);
  };

  const decryptSignaling = async (nonce: string, ciphertext: string) => {
    if (!sharedSecretRef.current) return null;
    const decrypted = await ConnectiaCrypto.decrypt(ciphertext, nonce, sharedSecretRef.current);
    return decrypted ? JSON.parse(decrypted) : null;
  };

  // --- CLEANUP ---
  const forceCleanup = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [supabase]);

  const handleEndCall = useCallback((reason: CallState = 'ended') => {
    setStatus(reason);
    // Broadcast end
    if (channelRef.current && sharedSecretRef.current) {
      encryptSignaling({ type: 'end' }).then(payload => {
        if (payload) {
          channelRef.current?.send({
            type: 'broadcast',
            event: 'signaling',
            payload
          });
        }
      });
    }
    setTimeout(() => {
      forceCleanup();
      onClose();
    }, 1500);
  }, [forceCleanup, onClose]);

  // --- WEBRTC CORE ---
  const initWebRTC = useCallback(async () => {
    try {
      setStatus('connecting');
      
      // 1. Get Secret
      const myPriv = getPrivateKey();
      if (!myPriv || !targetUser.public_key) throw new Error("Encryption keys missing");
      sharedSecretRef.current = await getSharedSecret(myPriv, targetUser.public_key, targetUser.id);

      // 2. Setup PC with TURN (Mandatory for production)
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          // Placeholder for TURN - In production, these would be injected via env or fetched from an API
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          }
        ]
      });
      pcRef.current = pc;

      // 3. Audio Priority + Video Fallback
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch (e) {
        console.warn("Video failed, falling back to audio only", e);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsVideoOff(true);
      }
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // 4. Signaling Handlers
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          const payload = await encryptSignaling({ type: 'ice', candidate: event.candidate });
          if (payload) {
            channelRef.current?.send({ type: 'broadcast', event: 'signaling', payload });
          }
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("ICE State:", pc.iceConnectionState);
        if (pc.iceConnectionState === 'checking') setStatus('checking');
        if (pc.iceConnectionState === 'connected') setStatus('connected');
        if (pc.iceConnectionState === 'failed') {
          setConnectionError("Connection Failed. Retrying...");
          pc.restartIce();
        }
        if (pc.iceConnectionState === 'disconnected') handleEndCall('ended');
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setStatus('connected');
        }
      };

      // 5. Signaling Channel Setup
      const channelId = `call_${[currentUser.id, targetUser.id].sort().join('_')}`;
      const channel = supabase.channel(channelId);
      channelRef.current = channel;

      // 6. OUTGOING: Notify partner to join the room (DATABASE-LESS)
      if (type === 'outgoing') {
        const callId = crypto.randomUUID();
        const partnerSignals = supabase.channel(`user_signals_${targetUser.id}`);
        partnerSignals.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await partnerSignals.send({
              type: 'broadcast',
              event: 'call_request',
              payload: { callId, callerId: currentUser.id }
            });
            supabase.removeChannel(partnerSignals);
          }
        });
      }

      channel.on('broadcast', { event: 'signaling' }, async ({ payload }) => {
        const data = await decryptSignaling(payload.nonce, payload.ciphertext);
        if (!data) return;

        if (data.type === 'offer' && type === 'incoming') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          const ansPayload = await encryptSignaling({ type: 'answer', answer });
          if (ansPayload) channel.send({ type: 'broadcast', event: 'signaling', payload: ansPayload });
        } 
        else if (data.type === 'answer' && type === 'outgoing') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } 
        else if (data.type === 'ice') {
          try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch (e) { console.error(e); }
        }
        else if (data.type === 'reject') {
          setStatus('rejected');
          setTimeout(() => handleEndCall('rejected'), 1000);
        }
        else if (data.type === 'end') {
          handleEndCall('ended');
        }
      }).subscribe(async (s) => {
        if (s === 'SUBSCRIBED') {
          if (type === 'outgoing') {
            // Wait a moment for partner to join before sending offer
            setTimeout(async () => {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              const offPayload = await encryptSignaling({ type: 'offer', offer });
              if (offPayload) channel.send({ type: 'broadcast', event: 'signaling', payload: offPayload });
            }, 1500);
          }
        }
      });

    } catch (err) {
      console.error("Call Init Error:", err);
      setConnectionError("Hardware access denied or network issue.");
      setTimeout(onClose, 3000);
    }
  }, [currentUser.id, targetUser.id, targetUser.public_key, type, handleEndCall, onClose, supabase]);

  useEffect(() => {
    initWebRTC();
    
    // Bulletproof cleanup listeners
    window.addEventListener('beforeunload', forceCleanup);
    return () => {
      window.removeEventListener('beforeunload', forceCleanup);
      forceCleanup();
    };
  }, [initWebRTC, forceCleanup]);

  // Timer
  useEffect(() => {
    if (status === 'connected') {
      timerIntervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [status]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
      }
    }
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={clsx(
        "fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center overscroll-none",
        isPiP ? "w-64 h-96 right-6 bottom-6 top-auto left-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10" : ""
      )}
    >
      {/* REMOTE VIDEO */}
      <div className="absolute inset-0 z-0">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      </div>

      {/* HEADER */}
      <div className="absolute top-16 left-0 right-0 z-10 flex flex-col items-center text-white p-4">
        <motion.div layoutId="avatar" className="w-24 h-24 rounded-full border-4 border-white/10 overflow-hidden mb-6 shadow-2xl shadow-indigo-500/20">
          <Image src={targetUser.avatar_url || "/default-avatar.png"} alt="" fill className="object-cover" />
        </motion.div>
        <h2 className="text-2xl font-black uppercase tracking-[0.2em] mb-2">{targetUser.name}</h2>
        
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10">
          {status === 'connected' ? (
            <span className="text-sm font-black font-mono text-green-400">{formatTimer(timer)}</span>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
              {status === 'checking' ? 'Optimizing Connection...' : 
               status === 'connecting' ? 'Securing Line...' : 
               status === 'calling' ? 'Calling...' : 
               status === 'ringing' ? 'Ringing...' : status}
            </span>
          )}
        </div>
      </div>

      {/* ERROR OVERLAY */}
      <AnimatePresence>
        {connectionError && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-500/90 backdrop-blur-xl px-6 py-4 rounded-3xl flex items-center gap-3 text-white z-50 border border-white/20"
          >
            <AlertCircle size={20} />
            <span className="text-sm font-bold">{connectionError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOCAL PREVIEW (PiP) */}
      {!isPiP && (
        <motion.div drag dragConstraints={{ left: -150, right: 150, top: -200, bottom: 200 }}
          className="absolute top-48 right-8 w-32 h-44 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 z-20"
        >
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center">
              <VideoOff size={20} className="text-white/20" />
            </div>
          )}
        </motion.div>
      )}

      {/* CONTROLS */}
      <div className="absolute bottom-16 left-0 right-0 z-30 flex items-center justify-center gap-6 px-8">
        <button onClick={toggleMute} className={clsx(
          "w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-3xl transition-all border border-white/10",
          isMuted ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
        )}>
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button onClick={toggleVideo} className={clsx(
          "w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-3xl transition-all border border-white/10",
          isVideoOff ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
        )}>
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <button onClick={() => handleEndCall()} className="w-20 h-20 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-rose-900/50 hover:bg-rose-700 transition-all active:scale-90 border-4 border-black">
          <PhoneOff size={36} />
        </button>

        <button onClick={() => setIsPiP(!isPiP)} className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center backdrop-blur-3xl hover:bg-white/20 border border-white/10">
          <Maximize2 size={24} />
        </button>
      </div>

      <p className="absolute bottom-6 text-[8px] font-black uppercase text-white/20 tracking-[0.4em]">Connectia Secure Line • End-to-End Encrypted</p>
    </motion.div>
  );
};

