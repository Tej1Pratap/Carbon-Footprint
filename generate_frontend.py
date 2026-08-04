import os

base_dir = r"c:\Users\Admin\OneDrive\Desktop\Carbon Footprint\frontend\src\pages"
os.makedirs(base_dir, exist_ok=True)

files = {}

files['ActivityLogging.jsx'] = """import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ActivityLogging = () => {
  const [category, setCategory] = useState('Transport');
  const [activityType, setActivityType] = useState('Car');
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState('km');
  const [message, setMessage] = useState('');
  
  const handleSave = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:8080/api/activity/log', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category, activityType, quantity, unit })
      });
      if (response.ok) {
        const data = await response.json();
        setMessage(`Success! Emissions added: ${data.emissionsKgCo2} kg CO2e`);
      } else {
        setMessage('Error saving activity');
      }
    } catch (err) {
      setMessage('Server error');
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#10b981' }}>Activity Logging</h2>
      {message && <div style={{ marginBottom: '15px', color: '#10b981' }}>{message}</div>}
      <form onSubmit={handleSave}>
        <div className="input-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px' }}>
            <option>Transport</option>
            <option>Electricity</option>
            <option>Food</option>
            <option>Shopping</option>
          </select>
        </div>
        <div className="input-group">
          <label>Activity Type</label>
          <input type="text" value={activityType} onChange={(e) => setActivityType(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Unit</label>
          <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary">Save Activity</button>
      </form>
    </div>
  );
};
export default ActivityLogging;
"""

files['Login.jsx'] = """import React, { useState } from 'react';
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
"""

files['Dashboard.jsx'] = """import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityLogging from './ActivityLogging';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) navigate('/login');
    else setUser(JSON.parse(userStr));
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="glass-card" style={{ maxWidth: '800px', marginBottom: '20px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#10b981' }}>Welcome back, {user.username}!</h3>
        </div>
      </div>
      <ActivityLogging />
    </div>
  );
};
export default Dashboard;
"""

for rel_path, content in files.items():
    with open(os.path.join(base_dir, rel_path), "w") as f:
        f.write(content)
print("Generated Frontend Files")
