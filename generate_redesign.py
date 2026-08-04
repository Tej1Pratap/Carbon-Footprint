import os

src_dir = r"c:\Users\Admin\OneDrive\Desktop\Carbon Footprint\frontend\src"
components_dir = os.path.join(src_dir, "components")
pages_dir = os.path.join(src_dir, "pages")
os.makedirs(components_dir, exist_ok=True)
os.makedirs(pages_dir, exist_ok=True)

files = {}

# CSS Update
files['index.css'] = """@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

:root {
  --primary: #22c55e;
  --primary-hover: #16a34a;
  --bg-main: #f3f4f6;
  --bg-surface: #ffffff;
  --text-main: #334155;
  --text-muted: #64748b;
  --border: #e2e8f0;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-main);
  color: var(--text-main);
}

/* Authentication Pages */
.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-main);
}

.card {
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card h2 { text-align: center; margin-bottom: 24px; color: var(--text-main); }

.input-group { margin-bottom: 20px; }
.input-group label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 8px; color: var(--text-main); }
.input-group input, .input-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 1rem;
  color: var(--text-main);
  background: #fff;
  transition: border-color 0.2s;
  outline: none;
}
.input-group input:focus, .input-group select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.btn-primary:hover { background-color: var(--primary-hover); }

.auth-link {
  display: block;
  text-align: center;
  margin-top: 20px;
  font-size: 0.875rem;
  color: var(--primary);
  text-decoration: none;
}
.error-message { color: #ef4444; font-size: 0.875rem; text-align: center; margin-bottom: 15px; }

/* Dashboard Layout */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid var(--border);
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 0 24px 20px 24px;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-main);
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item i { margin-right: 12px; width: 20px; text-align: center; }
.nav-item:hover { background-color: #f8fafc; color: var(--text-main); }
.nav-item.active {
  color: var(--primary);
  background-color: rgba(34, 197, 94, 0.05);
  border-left-color: var(--primary);
}
.nav-item.active i { color: var(--primary); }

.main-content {
  flex: 1;
  padding: 40px;
  background: var(--bg-main);
  overflow-y: auto;
}
"""

# Layout Components
files['components/Sidebar.jsx'] = """import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-home' },
    { name: 'Activity Logging', path: '/activity', icon: 'fas fa-plus-circle' },
    { name: 'Analytics', path: '/analytics', icon: 'fas fa-chart-line' },
    { name: 'Sustainability Goals', path: '/goals', icon: 'fas fa-bullseye' },
    { name: 'Recommendations', path: '/recommendations', icon: 'fas fa-lightbulb' },
    { name: 'Community Leaderboard', path: '/leaderboard', icon: 'fas fa-trophy' },
    { name: 'Badges', path: '/badges', icon: 'fas fa-medal' },
    { name: 'Activity History', path: '/history', icon: 'fas fa-clock' },
    { name: 'Settings', path: '/settings', icon: 'fas fa-cog' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <i className="fas fa-leaf" style={{ color: '#22c55e', marginRight: '8px' }}></i>
        Carbon Footprint
      </div>
      <div className="nav-links">
        {navItems.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <i className={item.icon}></i>
            {item.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
"""

files['components/DashboardLayout.jsx'] = """import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
"""

# Pages
files['pages/ActivityLogging.jsx'] = """import React, { useState } from 'react';

const ActivityLogging = () => {
  const [category, setCategory] = useState('Transport');
  const [activityType, setActivityType] = useState('Bike');
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ category, activityType, quantity, unit })
      });
      if (response.ok) {
        const data = await response.json();
        setMessage(`Success! Emissions logged: ${data.emissionsKgCo2.toFixed(2)} kg CO2e`);
      } else {
        setMessage('Error saving activity');
      }
    } catch (err) {
      setMessage('Server error');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#22c55e', marginBottom: '30px', textAlign: 'center' }}>Activity Logging</h2>
      {message && <div style={{ color: '#22c55e', textAlign: 'center', marginBottom: '20px', fontWeight: '500' }}>{message}</div>}
      
      <form onSubmit={handleSave}>
        <div className="input-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Transport</option>
            <option>Electricity</option>
            <option>Food</option>
            <option>Shopping</option>
          </select>
        </div>
        
        <div className="input-group">
          <label>Activity Type</label>
          <select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
            <option>Bike</option>
            <option>Car</option>
            <option>Flight</option>
            <option>Public Transit</option>
          </select>
        </div>
        
        <div className="input-group">
          <label>Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
        </div>
        
        <div className="input-group">
          <label>Unit</label>
          <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} required />
        </div>
        
        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Save Activity</button>
      </form>
    </div>
  );
};
export default ActivityLogging;
"""

files['pages/Login.jsx'] = """import React, { useState } from 'react';
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
        navigate('/activity');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) { setError('Could not connect to server'); } 
    finally { setLoading(false); }
  };
  
  return (
    <div className="auth-container">
      <div className="card">
        <h2>Welcome Back</h2>
        {error && <div className="error-message">{error}</div>}
        {message && <div style={{ color: '#22c55e', textAlign: 'center', marginBottom: '10px' }}>{message}</div>}
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
        <Link to="/register" className="auth-link">Don't have an account? Create one</Link>
      </div>
    </div>
  );
};
export default Login;
"""

files['pages/Register.jsx'] = """import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) { navigate('/login'); } 
      else { const data = await response.json(); setError(data.error || 'Registration failed'); }
    } catch (err) { setError('Could not connect to server'); }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary">Sign Up</button>
        </form>
        <Link to="/login" className="auth-link">Already have an account? Sign in</Link>
      </div>
    </div>
  );
};
export default Register;
"""

files['pages/Dashboard.jsx'] = """import React from 'react';
const Dashboard = () => {
  return (
    <div>
      <h2 style={{color: '#334155'}}>Dashboard Overview</h2>
      <p style={{color: '#64748b', marginTop: '10px'}}>Welcome to your carbon footprint dashboard. Select an option from the sidebar to get started.</p>
    </div>
  );
};
export default Dashboard;
"""

files['App.jsx'] = """import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ActivityLogging from './pages/ActivityLogging';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/activity" element={<DashboardLayout><ActivityLogging /></DashboardLayout>} />
        <Route path="/analytics" element={<DashboardLayout><h2>Analytics Content</h2></DashboardLayout>} />
        <Route path="/goals" element={<DashboardLayout><h2>Goals Content</h2></DashboardLayout>} />
        <Route path="/recommendations" element={<DashboardLayout><h2>Recommendations Content</h2></DashboardLayout>} />
        <Route path="/leaderboard" element={<DashboardLayout><h2>Leaderboard Content</h2></DashboardLayout>} />
        <Route path="/badges" element={<DashboardLayout><h2>Badges Content</h2></DashboardLayout>} />
        <Route path="/history" element={<DashboardLayout><h2>History Content</h2></DashboardLayout>} />
        <Route path="/settings" element={<DashboardLayout><h2>Settings Content</h2></DashboardLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
"""

for rel_path, content in files.items():
    with open(os.path.join(src_dir, rel_path), "w") as f:
        f.write(content)
print("Generated Redesigned Frontend")
