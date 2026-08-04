import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid or missing password reset token.');
    }
  }, [location]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Password reset failed');
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
        <h2>Enter New Password</h2>
        <p style={{ color: '#64748b', marginBottom: '20px', textAlign: 'center' }}>
          Please enter your new password below.
        </p>
        {error && <div className="error-message">{error}</div>}
        {message && <div style={{ color: '#22c55e', textAlign: 'center', marginBottom: '10px', background: '#dcfce7', padding: '10px', borderRadius: '6px' }}>{message}</div>}
        
        <form onSubmit={handleReset}>
          <div className="input-group">
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={!token || !!message} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !token || !!message}>
            {loading ? 'Resetting...' : 'Save New Password'}
          </button>
        </form>
        <Link to="/login" className="auth-link">Back to Sign In</Link>
      </div>
    </div>
  );
};

export default ResetPassword;
