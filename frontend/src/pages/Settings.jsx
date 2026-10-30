import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSettingsPage = location.pathname.includes('settings');
  
  const [pref, setPref] = useState('Balanced');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [password, setPassword] = useState('');
  
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [goalAlerts, setGoalAlerts] = useState(true);
  const [leaderboardAlerts, setLeaderboardAlerts] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);
  const [metric, setMetric] = useState('kg');
  
  const [msg, setMsg] = useState('');
  const [user, setUser] = useState({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const userStr = (localStorage.getItem('user') || sessionStorage.getItem('user'));
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      setUsername(u.username || '');
      setEmail(u.email || '');
      setPref(u.sustainabilityPreference || 'Balanced');
      setMobile(u.phone || '');
      setProfilePicture(u.profilePicture || '');
      
      setEmailAlerts(u.emailAlerts ?? true);
      setGoalAlerts(u.goalAlerts ?? true);
      setLeaderboardAlerts(u.leaderboardAlerts ?? false);
      setPublicProfile(u.publicProfile ?? true);
      setMetric(u.metric || 'kg');
      
      if (u.username) {
        const parts = u.username.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.length > 1 ? parts.slice(1).join(' ') : '');
      }
    }
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    
    // Send all fields to the backend
    const payload = { 
      sustainabilityPreference: pref,
      emailAlerts,
      goalAlerts,
      leaderboardAlerts,
      publicProfile,
      metric
    };
    
    if (profilePicture) payload.profilePicture = profilePicture;
    if (password) payload.password = password;
    
    // Reconstruct username from first and last name if they modified it
    const newUsername = `${firstName} ${lastName}`.trim();
    if (newUsername) payload.username = newUsername;

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setMsg("Settings updated successfully!");
        
        // Update localStorage
        const userStr = (localStorage.getItem('user') || sessionStorage.getItem('user'));
        if (userStr) {
          const u = JSON.parse(userStr);
          if (payload.username) u.username = payload.username;
          u.sustainabilityPreference = pref;
          if (profilePicture) u.profilePicture = profilePicture;
          u.emailAlerts = emailAlerts;
          u.goalAlerts = goalAlerts;
          u.leaderboardAlerts = leaderboardAlerts;
          u.publicProfile = publicProfile;
          u.metric = metric;
          localStorage.setItem('user', JSON.stringify(u));
          setUser(u);
          setUsername(u.username);
        }
        setPassword('');
        setTimeout(() => setMsg(''), 3000);
      } else {
        setMsg("Failed to update settings.");
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setMsg("An error occurred.");
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleExportCsv = async () => {
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/activity/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length === 0) {
          alert("No activity data to export.");
          return;
        }
        
        // Convert to CSV
        const headers = Object.keys(data[0]).join(',');
        const csvRows = data.map(row => Object.values(row).map(val => `"${val}"`).join(','));
        const csvString = [headers, ...csvRows].join('\n');
        
        // Trigger download
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carbon_footprint_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to export data.");
      }
    } catch (err) {
      console.error("Export error:", err);
      alert("An error occurred during export.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.");
    if (!confirmed) return;

    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/user/delete', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        localStorage.clear();
        navigate('/login');
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting your account.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'User')}&background=22c55e&color=fff`;

  return (
    <div className="-mt-10 -mx-10 min-h-[calc(100vh-80px)] font-sans" style={{ backgroundColor: '#f4f6f8' }}>
      {/* Banner */}
      <div className={`w-full h-48 ${location.pathname.includes('corporate') ? 'bg-blue-600' : 'bg-emerald-500'}`}></div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-6 px-10 max-w-7xl mx-auto pb-12" style={{ marginTop: '-4rem' }}>
        
        {/* Left Column: Profile Card */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center relative">
          
          {/* Overlapping Avatar */}
          <div 
            className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden absolute cursor-pointer group z-20" 
            style={{ top: '-3rem' }}
            onClick={() => setIsImageModalOpen(true)}
          >
            <img 
              src={profilePicture || defaultAvatar} 
              alt="Profile" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <i className="fas fa-search-plus text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </div>
          </div>
          
          <div className="mt-14 flex flex-col items-center w-full">
            <input type="file" id="avatarUpload" className="hidden" accept="image/*" onChange={handleImageChange} />
            <button 
              type="button" 
              onClick={() => document.getElementById('avatarUpload').click()}
              className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 mb-4 transition-colors">
              <i className="fas fa-camera mr-1"></i> Change Avatar
            </button>
            
            <h2 className="text-lg font-bold text-gray-800 text-center uppercase tracking-wide leading-tight mb-1">
              {firstName} {lastName}
            </h2>
            <p className="text-emerald-500 font-medium text-sm mb-6">@{username.replace(/\s+/g, '').toLowerCase() || 'username'}</p>
            
            <div className="w-full space-y-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-5 flex justify-center"><i className="fas fa-envelope text-gray-400"></i></div>
                <span className="truncate">{email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 flex justify-center"><i className="fas fa-phone text-gray-400"></i></div>
                <span>{mobile || '+91 98731 27515'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 flex justify-center"><i className="fas fa-calendar-alt text-gray-400"></i></div>
                <span>Member since {user.registrationDate ? new Date(user.registrationDate).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}) : 'July 8, 2026'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-2 mb-8">
            <i className={`fas ${isSettingsPage ? 'fa-sliders-h' : 'fa-user-cog'} text-emerald-500 text-xl`}></i>
            <h3 className="text-xl font-bold text-gray-800">{isSettingsPage ? 'Preferences & Settings' : 'Account Settings'}</h3>
          </div>
          
          {msg && (
            <div className={`mb-6 p-4 ${msg.includes('error') || msg.includes('Failed') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'} rounded-lg border flex items-center gap-2`}>
              <i className={`fas ${msg.includes('error') || msg.includes('Failed') ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
              {msg}
            </div>
          )}
          
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
              
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">First Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400"><i className="far fa-user"></i></span>
                  <input type="text" className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium text-gray-700" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. MANOJ" />
                </div>
              </div>
              
              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Last Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400"><i className="far fa-user"></i></span>
                  <input type="text" className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium text-gray-700" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. KUMAR" />
                </div>
              </div>
              
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400"><i className="fas fa-at"></i></span>
                  <input type="text" className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium text-gray-700" value={username.replace(/\s+/g, '').toLowerCase()} readOnly disabled />
                </div>
              </div>
              
              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mobile Number</label>
                <div className="relative flex items-center border border-gray-200 rounded-lg focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 bg-white">
                  <span className="pl-3 pr-2 text-gray-400 border-r border-gray-200 py-2.5 text-xs flex items-center bg-gray-50 rounded-l-lg">
                    <img src="https://flagcdn.com/w20/in.png" alt="IN" className="w-5 h-3.5 inline-block opacity-90" />
                  </span>
                  <input type="text" className="w-full px-3 py-2 outline-none text-sm font-medium text-gray-700 bg-transparent" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+91 98731 27515" />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Gender</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400"><i className="fas fa-venus-mars"></i></span>
                  <select className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium text-gray-700 bg-white appearance-none" value={gender} onChange={e => setGender(e.target.value)}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  <span className="absolute right-3 top-3 text-gray-400 pointer-events-none text-xs"><i className="fas fa-chevron-down"></i></span>
                </div>
              </div>
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400"><i className="far fa-envelope"></i></span>
                  <input type="email" className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm font-medium cursor-not-allowed" value={email} readOnly />
                </div>
              </div>

              {/* Change Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex justify-between">
                  <span>Change Password</span>
                  <span className="text-[10px] text-gray-400 font-normal normal-case">(Leave blank to keep current)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400"><i className="fas fa-lock"></i></span>
                  <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium text-gray-700 bg-white" />
                </div>
              </div>
            </div>

            {/* Sustainability Preferences */}
            <div className="space-y-1.5 mb-8 pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                Sustainability Preferences
                <i className="fas fa-info-circle text-gray-300"></i>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-emerald-500"><i className="fas fa-leaf"></i></span>
                <select className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium text-gray-700 bg-white appearance-none" value={pref} onChange={e => setPref(e.target.value)}>
                  <option value="Balanced">Balanced - Moderate lifestyle changes</option>
                  <option value="Aggressive Reduction">Aggressive Reduction - Maximize impact</option>
                  <option value="Cost Saving">Cost Saving - Eco-friendly choices that save money</option>
                </select>
                <span className="absolute right-3 top-3.5 text-gray-400 pointer-events-none text-xs"><i className="fas fa-chevron-down"></i></span>
              </div>
              <p className="text-xs text-emerald-600 mt-2 bg-emerald-50 inline-block px-3 py-1.5 rounded-md border border-emerald-100">
                <i className="fas fa-check-circle mr-1"></i> Share your eco-friendly lifestyle choices (e.g. Vegan diet, Zero-waste).
              </p>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-4 mb-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-bell text-emerald-500 text-lg"></i>
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Notification Preferences</h4>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Weekly Email Summaries</p>
                  <p className="text-xs text-gray-500 mt-0.5">Receive a weekly breakdown of your carbon footprint.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Goal Milestone Alerts</p>
                  <p className="text-xs text-gray-500 mt-0.5">Get notified when you hit sustainability milestones.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={goalAlerts} onChange={() => setGoalAlerts(!goalAlerts)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Leaderboard Updates</p>
                  <p className="text-xs text-gray-500 mt-0.5">Alerts when you are passed on the community leaderboard.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={leaderboardAlerts} onChange={() => setLeaderboardAlerts(!leaderboardAlerts)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Privacy & Display */}
            <div className="space-y-4 mb-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-shield-alt text-emerald-500 text-lg"></i>
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Privacy & Display</h4>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Public Leaderboard Profile</p>
                  <p className="text-xs text-gray-500 mt-0.5">Allow others to see your avatar and score on the leaderboard.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={publicProfile} onChange={() => setPublicProfile(!publicProfile)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-1.5 mt-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Display Metric</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400"><i className="fas fa-weight-hanging"></i></span>
                  <select className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium text-gray-700 bg-white appearance-none" value={metric} onChange={e => setMetric(e.target.value)}>
                    <option value="kg">Kilograms (kg CO₂e)</option>
                    <option value="lbs">Pounds (lbs CO₂e)</option>
                    <option value="tonnes">Tonnes (t CO₂e)</option>
                  </select>
                  <span className="absolute right-3 top-3 text-gray-400 pointer-events-none text-xs"><i className="fas fa-chevron-down"></i></span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-4 mb-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-exclamation-triangle text-red-500 text-lg"></i>
                <h4 className="text-sm font-bold text-red-500 uppercase tracking-wide">Danger Zone</h4>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Export My Data</p>
                  <p className="text-xs text-gray-500 mt-0.5">Download a CSV of your carbon footprint history.</p>
                </div>
                <button type="button" onClick={handleExportCsv} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors shadow-sm bg-white">
                  Export CSV
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Delete Account</p>
                  <p className="text-xs text-gray-500 mt-0.5">Permanently delete your account and all data.</p>
                </div>
                <button type="button" onClick={handleDeleteAccount} className="px-4 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold transition-colors shadow-sm bg-white">
                  Delete Account
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button type="button" className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-bold tracking-wide transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm font-bold tracking-wide transition-colors shadow-sm shadow-emerald-500/30">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              onClick={() => setIsImageModalOpen(false)}
            >
              <i className="fas fa-times text-3xl"></i>
            </button>
            <img 
              src={profilePicture || defaultAvatar.replace('size=', 'sz=').concat('&size=512')} 
              alt="Profile Full Screen" 
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain border-4 border-white/20" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
