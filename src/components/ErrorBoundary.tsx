import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Shivani Graphics:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear potentially corrupt cached transient items
      const keysToRemove = [
        'shivani_cached_notifications_v1',
        'shivani_seen_notifications_v1'
      ];
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
    window.location.hash = '';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Website Reloading / Refresh Required
            </h1>
            <p className="text-sm text-slate-600 mb-6">
              Shivani Graphics online portal encounter kiya ek temporary load issue. Niche diye button par click karke reload karein.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#50007c] text-white font-semibold shadow-md hover:bg-[#3d0060] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Website
              </button>
              <button
                onClick={() => {
                  window.location.hash = '';
                  this.setState({ hasError: false, error: null });
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
