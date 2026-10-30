import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, UserCircle, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleTranslate from './GoogleTranslate';
import Chatbot from './Chatbot';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!(localStorage.getItem('token') || sessionStorage.getItem('token'))) {
      navigate('/login');
    } else {
      fetchNotifications();
    }
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setNotifications(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      navigate('/login');
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
      await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + `/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
      await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + `/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const userString = (localStorage.getItem('user') || sessionStorage.getItem('user'));
  const user = userString ? JSON.parse(userString) : null;
  const username = user?.username || 'User';
  const profilePic = user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=22c55e&color=fff`;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="relative h-20 px-4 md:px-8 flex items-center justify-between md:justify-end bg-white border-b border-slate-200 shadow-sm z-40 flex-shrink-0">
          
          {/* Hamburger Menu (Mobile Only) */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-500 hover:text-green-600 focus:outline-none"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>

          <div className="flex items-center space-x-2 md:space-x-6">
            
            {/* Language Selector */}
            <div className="flex items-center mt-1">
              <GoogleTranslate />
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors focus:outline-none"
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-slate-700">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-green-600 hover:text-green-700 font-medium focus:outline-none">Mark all as read</button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-slate-500 text-sm">No notifications yet.</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => !n.read && markAsRead(n.id)} 
                          className={`p-4 border-b border-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-green-50/40 hover:bg-green-50/70' : 'hover:bg-slate-50'}`}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-1 rounded-full p-1.5 h-fit flex items-center justify-center w-8 h-8 ${n.type === 'BADGE' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                              {n.type === 'BADGE' ? <i className="fas fa-medal text-sm"></i> : <i className="fas fa-bullseye text-sm"></i>}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm leading-tight ${!n.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{n.message}</p>
                              <p className="text-xs text-slate-400 mt-1.5">{new Date(n.createdAt).toLocaleString()}</p>
                            </div>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div 
                className="flex items-center space-x-3 pl-6 border-l border-slate-200 cursor-pointer group" 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-slate-700 leading-none group-hover:text-green-600 transition-colors">{username}</p>
                  <p className="text-xs text-slate-500 mt-1">EcoTrack User</p>
                </div>
                <img 
                  src={profilePic} 
                  alt={username} 
                  className="w-10 h-10 rounded-full shadow-sm object-cover border-2 border-transparent group-hover:border-green-500 transition-colors" 
                />
              </div>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 mt-3 w-56 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border overflow-hidden z-50 p-2 bg-white border-slate-100">
                    <Link to="/profile" onClick={() => setShowProfileDropdown(false)} className="flex items-center space-x-3 p-3 rounded-xl transition-colors hover:bg-slate-50">
                      <UserCircle size={18} className="text-slate-400" />
                      <span className="text-sm font-medium">Profile</span>
                    </Link>
                    <Link to="/settings" onClick={() => setShowProfileDropdown(false)} className="flex items-center space-x-3 p-3 rounded-xl transition-colors hover:bg-slate-50">
                      <Settings size={18} className="text-slate-400" />
                      <span className="text-sm font-medium">Settings</span>
                    </Link>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 rounded-xl transition-colors text-red-500 hover:bg-red-50">
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Floating AI Chatbot */}
        <Chatbot />
      </div>
    </div>
  );
};

export default DashboardLayout;
