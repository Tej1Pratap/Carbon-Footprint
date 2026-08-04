import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgetPassword = async () => {
    if (!email) return setError("Please enter your email first to reset password");
    const newPass = prompt("Enter your new password:");
    if (!newPass) return;
    try {
      const response = await fetch('http://localhost:8080/api/auth/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: newPass }),
      });
      if (response.ok) {
        setMessage("Password reset successfully. You can now log in.");
      } else {
        setError("Error resetting password");
      }
    } catch(err) {
      setError("Server error");
    }
  };

  return (
    <div className="glass-card">
      <h2>Welcome Back</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div style={{ color: '#10b981', textAlign: 'center', marginBottom: '10px' }}>{message}</div>}
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button onClick={handleForgetPassword} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}>Forget Password?</button>
      </div>
      <Link to="/register" className="auth-link">Don't have an account? Create one</Link>
    </div>
  );
};
export default Login;
