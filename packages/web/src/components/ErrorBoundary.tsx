/**
 * Error Boundary Component
 * Cattura errori React e mostra UI di fallback
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    this.setState({ errorInfo });

    // Log to external service in production
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service (Sentry, etc.)
      console.error('[ErrorBoundary] Would log to error service:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-2">
              Qualcosa è andato storto
            </h1>

            {/* Description */}
            <p className="text-slate-400 mb-6">
              Si è verificato un errore imprevisto. Prova a ricaricare la pagina o torna alla dashboard.
            </p>

            {/* Error details (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-left">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
                Ricarica pagina
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
              >
                <Home className="w-4 h-4" />
                Vai alla Dashboard
              </button>
            </div>

            {/* Try again link */}
            <button
              onClick={this.handleReset}
              className="mt-4 text-sm text-slate-500 hover:text-slate-400 transition"
            >
              Riprova senza ricaricare
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook per usare error boundary con React Query
 */
export function useErrorHandler() {
  return (error: Error) => {
    console.error('[useErrorHandler]', error);
    // Potremmo mostrare un toast qui
  };
}
