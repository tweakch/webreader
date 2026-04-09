import React from 'react';
import { RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 overflow-y-auto p-4">
          {/* Decorative background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-amber-100/40 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-orange-100/30 rounded-full blur-3xl" />
          </div>

          {/* Main content */}
          <div className="relative max-w-lg w-full">
            {/* Error illustration placeholder */}
            <div className="mb-8 flex justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-6xl">📖</div>
              </div>
            </div>

            {/* Error content card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 pt-8 pb-6">
                <h1 className="text-3xl font-serif font-bold text-white mb-2">
                  Oops!
                </h1>
                <p className="text-amber-50 text-lg">
                  Something unexpected happened
                </p>
              </div>

              {/* Body */}
              <div className="px-6 py-8">
                <p className="text-amber-900 mb-6 leading-relaxed">
                  We're sorry, but the application encountered an unexpected error.
                  Don't worry—this is usually a temporary issue that can be fixed by reloading the page.
                </p>

                {/* Error details toggle */}
                {this.state.error && (
                  <div className="mb-6">
                    <button
                      onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
                      className="text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-1 mb-2"
                    >
                      <span>{this.state.showDetails ? '▼' : '▶'}</span>
                      Technical details
                    </button>
                    {this.state.showDetails && (
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <pre className="text-xs text-amber-800 overflow-auto max-h-40 font-mono">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Reload button */}
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <RotateCcw size={18} />
                  Reload Page
                </button>

                {/* Help text */}
                <p className="text-xs text-amber-600 text-center mt-4">
                  If the problem persists, please try clearing your browser cache or contacting support.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
