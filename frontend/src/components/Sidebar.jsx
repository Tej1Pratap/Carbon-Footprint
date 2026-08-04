import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, BarChart2, Target, Lightbulb, Trophy, Award, Clock, Settings, LogOut, User, ChevronsLeft, ChevronsRight, Shield, HelpCircle } from 'lucide-react';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'ADMIN';

  const menuGroups = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} className="text-emerald-500 group-hover:text-emerald-600 transition-colors" /> },
        { name: 'Activity Logging', path: '/activity', icon: <PlusCircle size={20} className="text-blue-500 group-hover:text-blue-600 transition-colors" /> },
        { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} className="text-indigo-500 group-hover:text-indigo-600 transition-colors" /> },
      ]
    },
    {
      title: 'GOALS & INSIGHTS',
      items: [
        { name: 'Sustainability Goals', path: '/goals', icon: <Target size={20} className="text-purple-500 group-hover:text-purple-600 transition-colors" /> },
        { name: 'Recommendations', path: '/recommendations', icon: <Lightbulb size={20} className="text-amber-500 group-hover:text-amber-600 transition-colors" /> },
      ]
    },
    {
      title: 'COMMUNITY',
      items: [
        { name: 'Community Leaderboard', path: '/leaderboard', icon: <Trophy size={20} className="text-orange-500 group-hover:text-orange-600 transition-colors" /> },
        { name: 'Badges', path: '/badges', icon: <Award size={20} className="text-pink-500 group-hover:text-pink-600 transition-colors" /> },
      ]
    },
    {
      title: 'HISTORY',
      items: [
        { name: 'Activity History', path: '/history', icon: <Clock size={20} className="text-slate-500 group-hover:text-slate-600 transition-colors" /> },
      ]
    },
    {
      title: 'HELP',
      items: [
        { name: 'Help', path: '/support', icon: <HelpCircle size={20} className="text-cyan-500 group-hover:text-cyan-600 transition-colors" /> },
      ]
    }
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        sidebar ${isCollapsed ? 'collapsed' : ''} flex flex-col bg-white border-r border-slate-100 h-screen py-6 transition-all duration-300 w-64
        fixed md:relative z-[70] md:z-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between px-6 mb-8">
          <div className="flex items-center">
            <i className="fas fa-leaf text-green-500 text-xl mr-2"></i>
            {!isCollapsed && <span className="font-bold text-slate-800 text-lg tracking-tight">Carbon Footprint</span>}
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:block p-1.5 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
            {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1.5 text-slate-400 hover:text-slate-600">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
      
      <div className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-hide">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && <p className="text-[11px] font-bold text-slate-400 tracking-wider mb-2 px-4">{group.title}</p>}
            {group.items.map((item, index) => (
              <NavLink 
                key={index} 
                to={item.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center px-4 py-2.5 rounded-r-xl transition-colors ${isActive ? 'bg-[#f0fdf4] text-green-600 border-l-[3px] border-green-500' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-l-[3px] border-transparent'}`}
                title={isCollapsed ? item.name : ''}
              >
                <div className="shrink-0">{item.icon}</div>
                {!isCollapsed && <span className="ml-3.5 font-medium text-[15px]">{item.name}</span>}
              </NavLink>
            ))}
          </div>
        ))}
        
        {isAdmin && (
          <div className="space-y-1 pt-2">
            {!isCollapsed && <p className="text-[11px] font-bold text-slate-400 tracking-wider mb-2 px-4">ADMIN</p>}
            <NavLink to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-2.5 rounded-r-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 border-l-[3px] border-transparent transition-colors">
              <Shield size={20} />
              {!isCollapsed && <span className="ml-3.5 font-medium text-[15px]">Admin Panel</span>}
            </NavLink>
          </div>
        )}
      </div>

    </div>
    </>
  );
};

export default Sidebar;
