import os

src_dir = r"c:\Users\Admin\OneDrive\Desktop\Carbon Footprint\frontend\src"
pages_dir = os.path.join(src_dir, "pages")
files = {}

# Analytics
files['Analytics.jsx'] = """import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:8080/api/analytics/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setData(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  if (!data) return <div>Loading analytics...</div>;

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Your Emissions Analytics</h2>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
        Total Emissions: <strong>{data.totalEmissions.toFixed(2)} kg CO2e</strong>
      </p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
        <div style={{ width: '300px', height: '300px' }}>
          <h3 style={{ textAlign: 'center', color: '#64748b' }}>By Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {data.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ width: '400px', height: '300px' }}>
          <h3 style={{ textAlign: 'center', color: '#64748b' }}>Bar Breakdown</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
"""

# Activity History
files['ActivityHistory.jsx'] = """import React, { useEffect, useState } from 'react';

const ActivityHistory = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const token = sessionStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:8080/api/activity/logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setLogs(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchLogs();
  }, []);

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Activity History</h2>
      {logs.length === 0 ? <p>No activities logged yet.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Category</th>
              <th style={{ padding: '12px' }}>Type</th>
              <th style={{ padding: '12px' }}>Emissions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}>{new Date(log.logDate).toLocaleDateString()}</td>
                <td style={{ padding: '12px' }}>{log.category}</td>
                <td style={{ padding: '12px' }}>{log.activityType} ({log.quantity} {log.unit})</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#ef4444' }}>+{log.emissionsKgCo2.toFixed(2)} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default ActivityHistory;
"""

# Goals
files['SustainabilityGoals.jsx'] = """import React, { useEffect, useState } from 'react';

const SustainabilityGoals = () => {
  const [goals, setGoals] = useState([]);
  const [desc, setDesc] = useState('');
  const [target, setTarget] = useState('');

  const fetchGoals = async () => {
    const token = sessionStorage.getItem('token');
    const res = await fetch('http://localhost:8080/api/goals', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setGoals(await res.json());
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    await fetch('http://localhost:8080/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ description: desc, targetKgCo2: target, deadline: new Date().toISOString().split('T')[0] })
    });
    fetchGoals();
    setDesc('');
    setTarget('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#22c55e' }}>Set a New Goal</h2>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
            <label>Description</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Keep transport under 50kg" required />
          </div>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Target (kg CO2e)</label>
            <input type="number" value={target} onChange={e => setTarget(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>Add Goal</button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Current Goals</h2>
        {goals.map(g => (
          <div key={g.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>{g.description}</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Target: {g.targetKgCo2} kg | Status: {g.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SustainabilityGoals;
"""

# Leaderboard
files['Leaderboard.jsx'] = """import React, { useEffect, useState } from 'react';

const Leaderboard = () => {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    const fetchBoard = async () => {
      const token = sessionStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:8080/api/user/leaderboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setBoard(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchBoard();
  }, []);

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#22c55e', marginBottom: '20px' }}><i className="fas fa-trophy"></i> Community Leaderboard</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
            <th style={{ padding: '12px' }}>Rank</th>
            <th style={{ padding: '12px' }}>User</th>
            <th style={{ padding: '12px' }}>Activities Logged</th>
            <th style={{ padding: '12px' }}>Total Emissions (Lowest is Best)</th>
          </tr>
        </thead>
        <tbody>
          {board.map((user, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '1.2rem', color: idx === 0 ? '#fbbf24' : '#64748b' }}>#{idx + 1}</td>
              <td style={{ padding: '12px' }}>{user.username}</td>
              <td style={{ padding: '12px' }}>{user.logsCount}</td>
              <td style={{ padding: '12px', color: '#22c55e', fontWeight: 'bold' }}>{user.totalEmissions.toFixed(2)} kg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Leaderboard;
"""

# Settings
files['Settings.jsx'] = """import React, { useState } from 'react';

const Settings = () => {
  const [pref, setPref] = useState('Balanced');
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    const res = await fetch('http://localhost:8080/api/user/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ sustainabilityPreference: pref })
    });
    if (res.ok) setMsg("Settings updated successfully!");
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Settings</h2>
      {msg && <p style={{ color: '#22c55e' }}>{msg}</p>}
      <form onSubmit={handleSave}>
        <div className="input-group">
          <label>Sustainability Focus</label>
          <select value={pref} onChange={e => setPref(e.target.value)}>
            <option>Balanced</option>
            <option>Aggressive Reduction</option>
            <option>Cost Saving</option>
          </select>
        </div>
        <button className="btn-primary" type="submit">Save Preferences</button>
      </form>
    </div>
  );
};
export default Settings;
"""

# Badges and Recommendations
files['Badges.jsx'] = """import React from 'react';
const Badges = () => (
  <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
    <h2 style={{ color: '#22c55e' }}>Your Badges</h2>
    <div style={{ marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
      <i className="fas fa-medal" style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '10px' }}></i>
      <p style={{ color: '#64748b' }}>Complete more goals to earn badges!</p>
    </div>
  </div>
);
export default Badges;
"""

files['Recommendations.jsx'] = """import React from 'react';
const Recommendations = () => (
  <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
    <h2 style={{ color: '#22c55e' }}>Smart Recommendations</h2>
    <ul style={{ lineHeight: '1.8', color: '#334155', marginTop: '20px' }}>
      <li><i className="fas fa-car" style={{ color: '#22c55e', width: '30px' }}></i> Try carpooling twice a week to reduce transport emissions by 20%.</li>
      <li><i className="fas fa-lightbulb" style={{ color: '#eab308', width: '30px' }}></i> Switch to LED bulbs in your living room.</li>
      <li><i className="fas fa-utensils" style={{ color: '#ef4444', width: '30px' }}></i> Incorporate one plant-based meal into your daily routine.</li>
    </ul>
  </div>
);
export default Recommendations;
"""

# App.jsx Update
files['../App.jsx'] = """import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ActivityLogging from './pages/ActivityLogging';
import Analytics from './pages/Analytics';
import ActivityHistory from './pages/ActivityHistory';
import SustainabilityGoals from './pages/SustainabilityGoals';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import Badges from './pages/Badges';
import Recommendations from './pages/Recommendations';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/activity" element={<DashboardLayout><ActivityLogging /></DashboardLayout>} />
        <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
        <Route path="/goals" element={<DashboardLayout><SustainabilityGoals /></DashboardLayout>} />
        <Route path="/recommendations" element={<DashboardLayout><Recommendations /></DashboardLayout>} />
        <Route path="/leaderboard" element={<DashboardLayout><Leaderboard /></DashboardLayout>} />
        <Route path="/badges" element={<DashboardLayout><Badges /></DashboardLayout>} />
        <Route path="/history" element={<DashboardLayout><ActivityHistory /></DashboardLayout>} />
        <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
      </Routes>
    </Router>
  );
}
export default App;
"""

for rel_path, content in files.items():
    with open(os.path.join(pages_dir, rel_path), "w") as f:
        f.write(content)
print("Generated Frontend Features")
