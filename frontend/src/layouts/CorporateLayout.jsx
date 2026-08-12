import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Users, Briefcase, Activity, BarChart, Leaf, Target, Lightbulb, 
  Award, HeartHandshake, FileText, Bell, Settings, UserCircle, LogOut, Menu, X, Sun, Moon, ChevronLeft, ChevronRight, HelpCircle,
  Home, PlusCircle, Trophy, Clock
} from 'lucide-react';
import GoogleTranslate from '../components/GoogleTranslate';
import Chatbot from '../components/Chatbot';

const CorporateLayout = ({ children }) => {
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

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      navigate('/login');
    }
  };

  const corporateRole = localStorage.getItem('corporateRole') || 'EMPLOYEE';
  const isCorpAdmin = corporateRole === 'ORG_ADMIN' || corporateRole === 'CSR_MANAGER';
  const orgName = localStorage.getItem('corporateOrgName');

  let menuGroups = [];

  const personalGroup = {
    title: 'PERSONAL TRACKING',
    items: [
      { name: 'Dashboard', path: '/corporate/personal/dashboard', icon: <Home size={20} className="text-emerald-500" /> },
      { name: 'Activity Logging', path: '/corporate/personal/activity', icon: <PlusCircle size={20} className="text-blue-500" /> },
      { name: 'Analytics', path: '/corporate/personal/analytics', icon: <Activity size={20} className="text-indigo-500" /> },
      { name: 'Leaderboard', path: '/corporate/personal/leaderboard', icon: <Trophy size={20} className="text-orange-500" /> },
      { name: 'Goals', path: '/corporate/personal/goals', icon: <Target size={20} className="text-emerald-600" /> },
      { name: 'Badges', path: '/corporate/personal/badges', icon: <Award size={20} className="text-pink-500" /> },
      { name: 'Recommendations', path: '/corporate/personal/recommendations', icon: <Lightbulb size={20} className="text-amber-500" /> },
      { name: 'Activity History', path: '/corporate/personal/history', icon: <Clock size={20} className="text-slate-500" /> },
    ]
  };

  if (isCorpAdmin) {
    menuGroups = [
      {
        title: 'ORGANIZATION',
        items: [
          { name: 'Corporate Dashboard', path: '/corporate', icon: <Building2 size={20} className="text-blue-600" /> },
          { name: 'Employees', path: '/corporate/employees', icon: <Users size={20} className="text-indigo-500" /> },
          { name: 'Departments', path: '/corporate/departments', icon: <Briefcase size={20} className="text-purple-500" /> },
          { name: 'Activity Management', path: '/corporate/employee-activity', icon: <Activity size={20} className="text-emerald-500" /> },
          { name: 'Badges', path: '/corporate/badges', icon: <Award size={20} className="text-pink-500" /> },
        ]
      },
      {
        title: 'CARBON FOOTPRINT',
        items: [
          { name: 'Scope Analytics', path: '/corporate/scopes', icon: <BarChart size={20} className="text-orange-500" /> },
          { name: 'Emission Factors', path: '/corporate/emission-factors', icon: <Leaf size={20} className="text-green-500" /> },
        ]
      },
      {
        title: 'SUSTAINABILITY',
        items: [
          { name: 'Corporate Goals', path: '/corporate/goals', icon: <Target size={20} className="text-emerald-500" /> },
          { name: 'Benchmarking', path: '/corporate/benchmarking', icon: <Award size={20} className="text-yellow-500" /> },
          { name: 'Recommendations', path: '/corporate/recommendations', icon: <Lightbulb size={20} className="text-amber-500" /> },
        ]
      },
      {
        title: 'CSR MANAGEMENT',
        items: [
          { name: 'CSR Dashboard', path: '/corporate/csr', icon: <HeartHandshake size={20} className="text-pink-500" /> },
          { name: 'Reports', path: '/corporate/reports', icon: <FileText size={20} className="text-cyan-500" /> },
          { name: 'Help / Support', path: '/corporate/support', icon: <HelpCircle size={20} className="text-indigo-400" /> },
        ]
      }
    ];
  } else {
    menuGroups = [
      personalGroup,
      {
        title: 'CSR MANAGEMENT',
        items: [
          { name: 'My CSR Activities', path: '/corporate/csr', icon: <HeartHandshake size={20} className="text-pink-500" /> },
          { name: 'Help / Support', path: '/corporate/personal/support', icon: <HelpCircle size={20} className="text-indigo-400" /> },
        ]
      }
    ];
  }

  const userString = (localStorage.getItem('user') || sessionStorage.getItem('user'));
  const user = userString ? JSON.parse(userString) : null;
  const username = user?.username || (isCorpAdmin ? 'Org Admin' : 'Employee');
  const profilePic = user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=2563eb&color=fff`;

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
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Building2 size={24} className="text-white" />
            </div>
            {(!isCollapsed || sidebarOpen) && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold tracking-wide whitespace-nowrap">
                CSR<span className="text-blue-600">Portal</span>
              </motion.span>
            )}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-800"><X size={24} /></button>
        </div>

        {/* Desktop Collapse Toggle on Border */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className={`hidden lg:flex absolute -right-3.5 top-7 w-7 h-7 items-center justify-center rounded-full border shadow-sm z-50 transition-all hover:scale-110 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-slate-300 hover:text-white' : 'bg-white border-slate-200 shadow-md text-slate-500 hover:text-slate-900'}`}
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
                const isActive = location.pathname === item.path || (item.path !== '/corporate' && location.pathname.startsWith(item.path));
                return (
                  <Link key={item.name} to={item.path} className="block relative group" title={(isCollapsed && !sidebarOpen) ? item.name : ''}>
                    {isActive && (
                      <motion.div layoutId="active-nav-corp" className={`absolute inset-0 bg-gradient-to-r ${isDarkMode ? 'from-blue-600/20 to-indigo-600/10' : 'from-blue-600/10 to-indigo-600/5'} rounded-r-xl shadow-[inset_3px_0_0_0_#2563eb]`} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                    )}
                    
                    <div className={`relative flex items-center px-3 py-2.5 rounded-r-xl transition-all duration-200 ${isActive ? 'text-blue-600' : isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-gray-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'} ${isCollapsed && !sidebarOpen ? 'justify-center space-x-0' : 'space-x-3.5'}`}>
                      <div className="shrink-0">{item.icon}</div>
                      {(!isCollapsed || sidebarOpen) && <span className={`font-medium text-[15px] whitespace-nowrap truncate ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className={`h-20 px-6 md:px-8 flex items-center justify-between backdrop-blur-xl border-b z-30 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900/70 border-gray-800' : 'bg-white/70 border-slate-200/60 shadow-sm'}`}>
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg lg:hidden text-slate-500 hover:bg-slate-100"><Menu size={24} /></button>
            {orgName && !isCorpAdmin && (
              <div className="hidden md:flex items-center px-3 py-1.5 bg-blue-50/50 border border-blue-100 rounded-full text-blue-700 text-sm font-medium">
                <Building2 size={16} className="mr-2" />
                Associated with {orgName}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center mt-1">
              <GoogleTranslate />
            </div>

            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 ${isDarkMode ? 'text-yellow-400 hover:bg-gray-800' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2.5 rounded-full transition-all duration-300 hover:scale-110 ${isDarkMode ? 'text-slate-400 hover:bg-gray-800' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}>
                <Bell size={20} />
              </button>
            </div>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-gray-700 mx-2"></div>
            
            <div className="relative" ref={profileRef}>
              <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold leading-none group-hover:text-blue-600 transition-colors">{username}</p>
                  <p className="text-xs text-slate-500 mt-1">{isCorpAdmin ? 'Org Admin' : 'Employee'}</p>
                </div>
                <img src={profilePic} alt="Admin" className="w-10 h-10 rounded-full shadow-sm object-cover border-2 border-transparent group-hover:border-blue-600/50 transition-all duration-300 group-hover:scale-105" />
              </div>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }} className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border overflow-hidden z-50 p-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-100'}`}>
                    <Link to="/corporate/settings" onClick={() => setShowProfileDropdown(false)} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50'}`}>
                      <Settings size={18} className="text-slate-400" />
                      <span className="text-sm font-medium">Org Settings</span>
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

export default CorporateLayout;
