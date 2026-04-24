import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChatErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chat Crash Details:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full bg-black flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Workspace Encountered an Error</h2>
          <p className="text-white/40 text-sm max-w-xs mb-8">
            Don&apos;t worry, your messages are safe. A quick reload should fix this.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
          >
            <RefreshCw size={18} />
            Reload Chat
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
