import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Activity, Leaf, Target, Lightbulb, 
  Award, BarChart3, Trophy, Bell, Settings, UserCircle, LogOut, Menu, X, Search, Sun, Moon, ChevronLeft, ChevronRight, HelpCircle
} from 'lucide-react';
import GoogleTranslate from '../components/GoogleTranslate';
import Chatbot from '../components/Chatbot';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileDropdown(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setNotifications(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch(import.meta.env.VITE_API_URL + '/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.map(n => ({...n, read: true})));
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuGroups = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} className="text-emerald-500 group-hover:scale-110 transition-transform duration-300" /> },
        { name: 'User Management', path: '/admin/users', icon: <Users size={20} className="text-blue-500 group-hover:scale-110 transition-transform duration-300" /> },
        { name: 'Activity Management', path: '/admin/activity', icon: <Activity size={20} className="text-indigo-500 group-hover:scale-110 transition-transform duration-300" /> },
      ]
    },
    {
      title: 'DATA & CONTENT',
      items: [
        { name: 'Emission Factors', path: '/admin/emission-factors', icon: <Leaf size={20} className="text-green-500 group-hover:scale-110 transition-transform duration-300" /> },
        { name: 'Sustainability Goals', path: '/admin/goals', icon: <Target size={20} className="text-purple-500 group-hover:scale-110 transition-transform duration-300" /> },
        { name: 'Recommendations', path: '/admin/recommendations', icon: <Lightbulb size={20} className="text-amber-500 group-hover:scale-110 transition-transform duration-300" /> },
      ]
    },
    {
      title: 'COMMUNITY & REPORTS',
      items: [
        { name: 'Leaderboard', path: '/admin/leaderboard', icon: <Trophy size={20} className="text-orange-500 group-hover:scale-110 transition-transform duration-300" /> },
        { name: 'Badges', path: '/admin/badges', icon: <Award size={20} className="text-pink-500 group-hover:scale-110 transition-transform duration-300" /> },
        { name: 'Reports & Analytics', path: '/admin/reports', icon: <BarChart3 size={20} className="text-cyan-500 group-hover:scale-110 transition-transform duration-300" /> },
        { name: 'Help', path: '/admin/support', icon: <HelpCircle size={20} className="text-red-500 group-hover:scale-110 transition-transform duration-300" /> },
      ]
    }
  ];

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const username = user?.username || 'Admin User';
  const profilePic = user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=16a34a&color=fff`;

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#f8fafc] text-slate-800'} font-sans transition-colors duration-300`}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 280,
          x: sidebarOpen ? 0 : (window.innerWidth < 1024 ? (sidebarOpen ? 0 : -280) : 0)
        }}
        className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col backdrop-blur-xl border-r shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors duration-300 ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/60 border-slate-200/60'} ${!sidebarOpen ? 'max-lg:-translate-x-full lg:translate-x-0' : ''}`}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center h-20 px-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-slate-100'} ${isCollapsed && !sidebarOpen ? 'justify-center px-0' : 'justify-between'}`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Leaf size={24} className="text-white" />
            </div>
            {(!isCollapsed || sidebarOpen) && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold tracking-wide whitespace-nowrap">
                Carbon<span className="text-primary">Footprint</span>
              </motion.span>
            )}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-800"><X size={24} /></button>
        </div>

        {/* Desktop Collapse Toggle on Border */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className={`hidden lg:flex absolute -right-3.5 top-7 w-7 h-7 items-center justify-center rounded-full border shadow-sm z-50 transition-all hover:scale-110 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'}`}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Sidebar Links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-4 space-y-6 custom-scrollbar relative">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {(!isCollapsed || sidebarOpen) && (
                <p className={`text-[11px] font-bold tracking-wider mb-2 px-3 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                return (
                  <Link key={item.name} to={item.path} className="block relative group" title={(isCollapsed && !sidebarOpen) ? item.name : ''}>
                    {isActive && (
                      <motion.div layoutId="active-nav" className={`absolute inset-0 bg-gradient-to-r ${isDarkMode ? 'from-green-500/20 to-emerald-500/10' : 'from-green-500/10 to-emerald-500/5'} rounded-r-xl shadow-[inset_3px_0_0_0_#16a34a]`} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                    )}
                    
                    <div className={`relative flex items-center px-3 py-2.5 rounded-r-xl transition-all duration-200 ${isActive ? 'text-primary' : isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-gray-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'} ${isCollapsed && !sidebarOpen ? 'justify-center space-x-0' : 'space-x-3.5'}`}>
                      <div className="shrink-0">{item.icon}</div>
                      {(!isCollapsed || sidebarOpen) && <span className={`font-medium text-[15px] whitespace-nowrap truncate ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>}
                    </div>
                    
                    {/* Tooltip for collapsed mode */}
                    {isCollapsed && !sidebarOpen && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity shadow-xl">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom padding for custom scrollbar spacing if needed */}
        <div className="h-4 flex-shrink-0"></div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className={`h-20 px-6 md:px-8 flex items-center justify-between backdrop-blur-xl border-b z-30 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900/70 border-gray-800' : 'bg-white/70 border-slate-200/60 shadow-sm'}`}>
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg lg:hidden text-slate-500 hover:bg-slate-100"><Menu size={24} /></button>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Language Selector */}
            <div className="flex items-center mt-1">
              <GoogleTranslate />
            </div>

            {/* Dark Mode Toggle */}
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 ${isDarkMode ? 'text-yellow-400 hover:bg-gray-800' : 'text-slate-500 hover:text-primary hover:bg-green-50'}`}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2.5 rounded-full transition-all duration-300 hover:scale-110 ${isDarkMode ? 'text-slate-400 hover:bg-gray-800' : 'text-slate-500 hover:text-primary hover:bg-green-50'}`}>
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-gray-900 rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }} className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border overflow-hidden z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'}`}>
                    <div className="p-4 border-b flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/50 dark:border-gray-700">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      <button onClick={markAllRead} className="text-xs text-primary font-medium hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">No new notifications.</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-4 border-b last:border-0 ${n.read ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-700/50' : 'bg-green-50/50')} ${isDarkMode ? 'border-gray-700' : 'border-slate-100'}`}>
                            <p className={`text-sm ${!n.read ? 'font-semibold' : ''}`}>{n.message}</p>
                            <span className="text-xs text-slate-500 mt-1 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-gray-700 mx-2"></div>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">{username}</p>
                  <p className="text-xs text-slate-500 mt-1">Super Admin</p>
                </div>
                <img src={profilePic} alt="Admin" className="w-10 h-10 rounded-full shadow-sm object-cover border-2 border-transparent group-hover:border-primary/50 transition-all duration-300 group-hover:scale-105" />
              </div>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }} className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border overflow-hidden z-50 p-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'}`}>
                    <Link to="/admin/profile" onClick={() => setShowProfileDropdown(false)} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50'}`}>
                      <UserCircle size={18} className="text-slate-400" />
                      <span className="text-sm font-medium">Profile</span>
                    </Link>
                    <Link to="/admin/settings" onClick={() => setShowProfileDropdown(false)} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50'}`}>
                      <Settings size={18} className="text-slate-400" />
                      <span className="text-sm font-medium">Settings</span>
                    </Link>
                    <div className="h-px bg-slate-100 dark:bg-gray-700 my-1"></div>
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 rounded-xl transition-colors text-danger hover:bg-red-50 dark:hover:bg-red-900/20">
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content with Framer Motion Page Transition */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {React.cloneElement(children, { isDarkMode })}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
};

export default AdminLayout;
