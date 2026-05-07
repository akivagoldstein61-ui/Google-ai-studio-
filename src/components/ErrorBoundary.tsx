import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface Props {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

/**
 * Top-level error boundary.
 *
 * Catches uncaught render/runtime errors from child components and
 * presents a calm, accessible recovery screen rather than letting React
 * unmount to a blank page. Errors are logged to console (and to Sentry
 * if `window.Sentry` is present) without exposing stack traces to users.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, errorInfo);

    // Optional Sentry integration if loaded
    const w = window as any;
    if (w.Sentry?.captureException) {
      try {
        w.Sentry.captureException(error, { extra: errorInfo });
      } catch {
        // swallow
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      return (
        <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6 text-[#2D2926]" dir="rtl">
          <div className="max-w-md text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF7E5] text-[#D4AF37] flex items-center justify-center">
              <AlertTriangle size={28} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-serif italic">משהו השתבש</h1>
              <p className="text-sm text-[#8C7E6E] leading-relaxed">
                אירעה שגיאה לא צפויה. הצוות שלנו יודע, ואנחנו מתנצלים על אי-הנוחות.
                ניתן לנסות שוב או לרענן את העמוד.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 h-12 rounded-2xl bg-[#2D2926] text-white font-bold flex items-center gap-2"
              >
                <RefreshCw size={14} /> נסה שוב
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 h-12 rounded-2xl bg-white border border-[#E8E0D8] text-[#6B5E52] font-bold"
              >
                רענן
              </button>
            </div>
            <p className="text-[10px] text-[#C4B5A5]">
              קוד שגיאה: <code className="font-mono" dir="ltr">{this.state.error.name}</code>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
