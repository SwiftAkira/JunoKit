'use client';

import { useEffect, useState } from 'react';

export default function HealthPage() {
  const [clientTime, setClientTime] = useState<string>('');
  const [apiTest, setApiTest] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('🏥 Health page loaded at:', new Date().toISOString());
    setClientTime(new Date().toISOString());

    // Test the debug API
    fetch('/api/debug')
      .then(res => res.json())
      .then(data => {
        console.log('🔍 API debug response:', data);
        setApiTest(data);
      })
      .catch(err => {
        console.error('❌ API debug error:', err);
        setError(err.message);
      });
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace',
      backgroundColor: '#1a1a1a',
      color: '#00ff00',
      minHeight: '100vh'
    }}>
      <h1>🏥 JunoKit Health Check</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>✅ Static Page Working</h2>
        <p>If you can see this, static pages are working!</p>
        <p>Client Time: {clientTime}</p>
        <p>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🔍 API Test</h2>
        {apiTest ? (
          <div>
            <p>✅ API is working!</p>
            <pre style={{ 
              backgroundColor: '#333', 
              padding: '10px', 
              borderRadius: '5px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {JSON.stringify(apiTest, null, 2)}
            </pre>
          </div>
        ) : error ? (
          <div>
            <p>❌ API Error: {error}</p>
          </div>
        ) : (
          <p>⏳ Testing API...</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🔧 Environment Info</h2>
        <p>Build Time: {process.env.NEXT_PUBLIC_BUILD_TIME || 'Not set'}</p>
        <p>Environment: {process.env.NODE_ENV}</p>
        <p>Window Location: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
      </div>

      <div>
        <h2>📱 Quick Links</h2>
        <ul>
          <li><a href="/" style={{ color: '#00ff00' }}>Home Page</a></li>
          <li><a href="/api/debug" style={{ color: '#00ff00' }}>Debug API</a></li>
          <li><a href="/login" style={{ color: '#00ff00' }}>Login Page</a></li>
        </ul>
      </div>
    </div>
  );
} 