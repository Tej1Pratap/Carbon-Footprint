import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Email verified successfully. You can now log in.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    setResendDisabled(true);
    setCountdown(60);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Verification code resent to your email.');
      } else {
        setError(data.error || 'Failed to resend code');
        setCountdown(0);
        setResendDisabled(false);
      }
    } catch (err) {
      setError('Could not connect to server');
      setCountdown(0);
      setResendDisabled(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Verify Email</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#4b5563' }}>
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div style={{ color: '#22c55e', textAlign: 'center', marginBottom: '15px', padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>{message}</div>}
        
        <form onSubmit={handleVerify}>
          <div className="input-group">
            <label style={{ textAlign: 'center', display: 'block' }}>Enter Verification Code</label>
            <input 
              type="text" 
              maxLength="6"
              value={code} 
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} 
              style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center', fontWeight: 'bold' }}
              placeholder="000000"
              required 
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || code.length !== 6}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={handleResend} 
            disabled={resendDisabled}
            style={{
              background: 'none',
              border: 'none',
              color: resendDisabled ? '#9ca3af' : '#22c55e',
              cursor: resendDisabled ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              textDecoration: 'underline'
            }}
          >
            {resendDisabled ? `Resend Code in ${countdown}s` : 'Resend Code'}
          </button>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
