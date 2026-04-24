import React from 'react';
import { Loader2, AlertCircle, CheckCheck } from 'lucide-react';
import { clsx } from 'clsx';

interface MessageStatusTicksProps {
  status: 'sent' | 'delivered' | 'seen' | 'sending' | 'failed';
  isOverlay?: boolean;
}

export const MessageStatusTicks = ({ status, isOverlay }: MessageStatusTicksProps) => {
  if (status === 'sending') return <Loader2 size={12} className={clsx("animate-spin", isOverlay ? "text-white/40" : "text-gray-300")} />;
  if (status === 'failed') return <AlertCircle size={12} className="text-rose-500" />;
  if (status === 'sent') return <CheckCheck size={14} className={clsx(isOverlay ? "text-white/40" : "text-gray-300")} />;
  if (status === 'delivered') return <CheckCheck size={14} className={clsx(isOverlay ? "text-white/60" : "text-gray-500")} />;
  if (status === 'seen') return <CheckCheck size={14} className={clsx(isOverlay ? "text-indigo-300" : "text-blue-400")} />;
  return null;
};
