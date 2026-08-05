import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trash2, Plus, AlertTriangle, ShieldCheck, Trophy, CalendarCheck, Leaf, Globe, Star, Target, Search } from 'lucide-react';

const PREDEFINED_BADGES = [
  { name: 'Weekly Starter', icon: 'leaf' },
  { name: 'Weekly Champion', icon: 'star' },
  { name: 'Monthly Consistent', icon: 'calendar-check' },
  { name: 'Monthly Master', icon: 'trophy' },
  { name: 'Yearly Eco Warrior', icon: 'globe' },
  { name: 'Yearly Climate Hero', icon: 'shield-check' },
  { name: 'Goal Achiever', icon: 'target' },
  { name: 'Goal Crusher', icon: 'award' }
];

const AdminBadges = ({ isDarkMode }) => {
  const [badges, setBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [awardForm, setAwardForm] = useState({ userId: '', name: 'Weekly Starter', icon: 'leaf' });
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, targetId: null });

  useEffect(() => {
    fetchBadges();
    fetchUsers();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/badges/all', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBadges(data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        if (data.length > 0) {
          setAwardForm(prev => ({ ...prev, userId: data[0].id.toString() }));
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleAwardSubmit = async () => {
    if (!awardForm.userId) return alert('Select a user');
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/badges/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(awardForm)
      });
      if (res.ok) {
        setIsAwardModalOpen(false);
        fetchBadges();
      } else {
        alert('Failed to award badge');
      }
    } catch (err) { console.error(err); }
  };

  const handleRevoke = async (id) => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + `/api/badges/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchBadges();
      }
    } catch (err) { console.error(err); }
    setConfirmModal({ isOpen: false, targetId: null });
  };

  const filteredBadges = useMemo(() => {
    return badges.filter(b => {
      const term = searchTerm.toLowerCase();
      const userName = b.user?.username?.toLowerCase() || '';
      const userEmail = b.user?.email?.toLowerCase() || '';
      const badgeName = b.name.toLowerCase();
      return userName.includes(term) || userEmail.includes(term) || badgeName.includes(term);
    });
  }, [badges, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Badge Management</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>View and manage achievements across all users.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => setIsAwardModalOpen(true)} className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 flex items-center space-x-2 font-medium">
            <Plus size={18} />
            <span>Award Badge Manually</span>
          </button>
        </motion.div>
      </div>

      {/* Table Container */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border overflow-visible transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.2)]' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
        
        {/* Toolbar */}
        <div className={`p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-slate-100'}`}>
          <div className={`relative w-full md:w-80 rounded-xl border transition-all duration-300 ${isDarkMode ? 'bg-gray-900/50 border-gray-700 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary' : 'bg-slate-50 border-slate-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white'}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by user or badge name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-transparent border-none focus:outline-none text-sm rounded-xl placeholder-slate-400 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-900/80 backdrop-blur-md text-slate-400 border-gray-700' : 'bg-slate-50/90 backdrop-blur-md text-slate-500 border-slate-200'} border-b uppercase text-xs font-bold tracking-wider`}>
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Badge</th>
                <th className="px-6 py-4">Date Earned</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-slate-100'}`}>
              <AnimatePresence>
                {filteredBadges.map((badge, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    key={badge.id} 
                    className={`transition-colors group ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="px-6 py-4 font-medium">{badge.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img src={`https://ui-avatars.com/api/?name=${badge.user?.username}&background=random&color=fff&rounded=true`} alt="User" className="w-8 h-8 rounded-full shadow-sm" />
                        <div>
                          <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{badge.user?.username}</div>
                          <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{badge.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <i className={`fas fa-${badge.icon}`}></i>
                        </div>
                        <span className="font-semibold text-primary">{badge.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {new Date(badge.earnedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setConfirmModal({ isOpen: true, targetId: badge.id })} className="px-3 py-1.5 rounded-lg text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 transition-colors">
                        Revoke
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredBadges.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-16 text-center flex flex-col items-center justify-center text-slate-500">
              <Award size={48} className="mb-4 text-slate-300 dark:text-gray-600" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No Badges Found</h3>
              <p className="text-sm mt-2 max-w-sm">No users have earned badges yet, or your search didn't match any records.</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Award Modal */}
      <AnimatePresence>
        {isAwardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsAwardModalOpen(false)}></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-100'}`}>
              <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Award Badge Manually</h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Select User</label>
                  <select 
                    value={awardForm.userId} 
                    onChange={e => setAwardForm({...awardForm, userId: e.target.value})} 
                    className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Select Badge</label>
                  <select 
                    value={awardForm.name} 
                    onChange={e => {
                      const selected = PREDEFINED_BADGES.find(b => b.name === e.target.value);
                      setAwardForm({...awardForm, name: selected.name, icon: selected.icon});
                    }} 
                    className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    {PREDEFINED_BADGES.map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button onClick={() => setIsAwardModalOpen(false)} className={`flex-1 py-3 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  Cancel
                </button>
                <button onClick={handleAwardSubmit} className="flex-1 py-3 rounded-xl font-medium text-white bg-primary hover:bg-green-600 shadow-lg shadow-primary/30 transition-all">
                  Award Badge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setConfirmModal({ isOpen: false, targetId: null })}></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-100'}`}>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4 mx-auto">
                <AlertTriangle size={24} />
              </div>
              <h3 className={`text-xl font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Revoke Badge?</h3>
              <p className={`text-center text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Are you sure you want to revoke this badge from the user? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button onClick={() => setConfirmModal({ isOpen: false, targetId: null })} className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  Cancel
                </button>
                <button onClick={() => handleRevoke(confirmModal.targetId)} className="flex-1 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all">
                  Revoke
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBadges;
