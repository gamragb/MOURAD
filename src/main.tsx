import React, { Component, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: 20, color: 'red', background: '#fee', height: '100vh', overflow: 'auto'}}>
        <h1>Something went wrong.</h1>
        <pre style={{whiteSpace: 'pre-wrap'}}>{this.state.error && this.state.error.toString()}</pre>
        <pre style={{whiteSpace: 'pre-wrap'}}>{this.state.error && this.state.error.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-client-id.apps.googleusercontent.com'}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
