// src/components/ErrorBoundary.jsx - Global Resilient Error Boundary
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DineQR Global Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 selection:bg-amber-500 selection:text-slate-950">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl font-black">
              ⚡
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black text-white">Something went wrong</h1>
              <p className="text-xs text-slate-400">
                The application encountered an unexpected runtime state. Your local business data and settings remain safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left overflow-x-auto text-[11px] font-mono text-rose-300">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer border border-slate-700"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
