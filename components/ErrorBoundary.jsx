import React from 'react';
import ErrorPage from './ErrorPage';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
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
        <div className="fixed inset-0">
          <ErrorPage type="unexpected" error={this.state.error} />
        </div>
      );
    }
    return this.props.children;
  }
}
