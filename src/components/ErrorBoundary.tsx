import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleClearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  render(): ReactNode {
    const state = (this as any).state as ErrorBoundaryState;
    const props = (this as any).props as ErrorBoundaryProps;

    if (state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800/90 rounded-2xl border border-slate-700 p-8 shadow-2xl text-center space-y-6 backdrop-blur-xl">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-400 shadow-inner">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-100">Pemulihan Aplikasi BCI</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Aplikasi telah mendeteksi potensi pemutakhiran antarmuka. Sistem pemulihan otomatis aktif untuk mencegah hilangnya data Anda.
              </p>
            </div>

            {state.error && (
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-left overflow-hidden">
                <p className="text-[11px] font-mono text-red-300 truncate">
                  {state.error.message || "Unknown error"}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleClearCache}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-slate-600"
              >
                <Home className="w-4 h-4" />
                Reset Sesi
              </button>
            </div>
          </div>
        </div>
      );
    }

    return props.children;
  }
}
