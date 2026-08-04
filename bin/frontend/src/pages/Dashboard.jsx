import React, { useEffect, useState } from 'react';
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
