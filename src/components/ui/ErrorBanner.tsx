import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import type { ReactNode } from "react";

interface ErrorBannerProps {
  message: string;
  description?: string;
  variant?: "error" | "warning" | "info";
  onClose?: () => void;
  action?: ReactNode;
  className?: string;
}

export default function ErrorBanner({
  message,
  description,
  variant = "error",
  onClose,
  action,
  className = "",
}: ErrorBannerProps) {
  const variants = {
    error: {
      bg: "bg-red-50 border-red-200",
      icon: <AlertCircle className="h-5 w-5 text-red-600" aria-hidden />,
      title: "text-red-800",
      desc: "text-red-700",
    },
    warning: {
      bg: "bg-amber-50 border-amber-200",
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />,
      title: "text-amber-800",
      desc: "text-amber-700",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: <Info className="h-5 w-5 text-blue-600" aria-hidden />,
      title: "text-blue-800",
      desc: "text-blue-700",
    },
  };

  const v = variants[variant];

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 ${v.bg} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="shrink-0">{v.icon}</div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${v.title}`}>{message}</p>
        {description && <p className={`mt-1 text-sm ${v.desc}`}>{description}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md p-1 transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
