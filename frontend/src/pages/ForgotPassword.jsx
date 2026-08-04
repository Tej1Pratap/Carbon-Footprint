import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Password reset link has been sent to your email! (Check backend console if testing locally)');
      } else {
        setError(data.error || 'Request failed');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Reset Password</h2>
        <p style={{ color: '#64748b', marginBottom: '20px', textAlign: 'center' }}>
          Enter your email to receive a password reset link.
        </p>
        {error && <div className="error-message">{error}</div>}
        {message && <div style={{ color: '#22c55e', textAlign: 'center', marginBottom: '10px', background: '#dcfce7', padding: '10px', borderRadius: '6px' }}>{message}</div>}
        <form onSubmit={handleReset}>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>
        <Link to="/login" className="auth-link">Back to Sign In</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
