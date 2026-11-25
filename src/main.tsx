import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class InstitutionalErrorBoundary extends (React.Component as any) {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("KM100 Application Crash:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem("km100_facilities_v1");
      localStorage.removeItem("km100_inventory_rooms_v1");
      localStorage.removeItem("km100_inventory_items_v1");
      localStorage.removeItem("km100_inventory_columns_v1");
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
              !
            </div>
            <h2 className="text-lg font-heading font-bold text-slate-900">
              KM100 Inventory System Recovery
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              An unexpected render issue was safely intercepted. You can reload
              or reset the local cache to restore standard institutional
              defaults.
            </p>
            {this.state.error && (
              <pre className="text-[11px] bg-slate-100 p-2.5 rounded-lg text-left overflow-x-auto text-rose-700 font-mono max-h-32">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-xs font-semibold text-white transition-colors"
              >
                Reset Cache &amp; Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global uncaught error listener to prevent blank white screens
window.addEventListener("error", (event) => {
  console.error("KM100 Uncaught Exception:", event.error || event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("KM100 Unhandled Promise Rejection:", event.reason);
});

// Remove static HTML preloader immediately on React bundle execution
const preloader = document.getElementById("initial-loading");
if (preloader) {
  preloader.remove();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <InstitutionalErrorBoundary>
      <App />
    </InstitutionalErrorBoundary>
  </React.StrictMode>,
);
