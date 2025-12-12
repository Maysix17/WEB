import React, { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class PermissionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Permission error boundary caught an error:', error, errorInfo);

    // Check if it's a chart rendering error and don't show the fallback for those
    if (error.message.includes('toFixed') || error.message.includes('chart') || error.message.includes('Recharts')) {
      // Reset the error state so the component can continue rendering
      this.setState({ hasError: false });
      return;
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong with permissions. Please refresh the page.</div>;
    }

    return this.props.children;
  }
}

export default PermissionErrorBoundary;