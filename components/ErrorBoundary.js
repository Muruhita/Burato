import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error('ErrorBoundary caught:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#eaeaea', fontFamily: 'ui-monospace, monospace', background: '#0a0a0a', minHeight: '100vh' }}>
          <div style={{ fontSize: '48px', color: '#ff4444', marginBottom: '20px' }}>СБОЙ СИСТЕМЫ</div>
          <p style={{ color: '#888', marginBottom: '30px' }}>Компонент вызвал критическую ошибку. Пожалуйста, обновите страницу.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px' }}>
            ОБНОВИТЬ СТРАНИЦУ
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
