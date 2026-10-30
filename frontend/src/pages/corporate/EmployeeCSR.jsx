import React, { useState, useEffect } from 'react';
import { HeartHandshake, Calendar, Users, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const EmployeeCSR = ({ isDarkMode }) => {
  const [projects, setProjects] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [hoursToLog, setHoursToLog] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` };
      
      const [projRes, partRes] = await Promise.all([
        fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/corporate/csr/projects', { headers }),
        fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/corporate/csr/my-participations', { headers })
      ]);
      
      if (projRes.ok) setProjects(await projRes.json());
      if (partRes.ok) setMyParticipations(await partRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoin = async (id) => {
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com')}/api/corporate/csr/projects/${id}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
      } else {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogHours = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com')}/api/corporate/csr/projects/${activeProjectId}/log-hours`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` 
        },
        body: JSON.stringify({ hours: parseInt(hoursToLog) })
      });
      
      if (res.ok) {
        setShowLogModal(false);
        setHoursToLog('');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getMyParticipation = (projectId) => {
    return myParticipations.find(p => p.project.id === projectId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">CSR Projects</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            Join company volunteer initiatives and log your impact hours.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className={`flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-slate-50/50 border-slate-300 text-slate-500'}`}>
          <HeartHandshake size={48} className="mb-4 opacity-50" />
          <h3 className="text-lg font-bold mb-2">No Projects Available</h3>
          <p className="text-sm text-center max-w-sm mb-6">Your organization hasn't created any CSR projects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => {
            const myPart = getMyParticipation(p.project.id);
            return (
              <motion.div 
                key={p.project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-200 shadow-md'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${p.project.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : p.project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {p.project.status.replace('_', ' ')}
                  </span>
                  {myPart && (
                    <span className="flex items-center text-xs font-bold text-pink-500 bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded-full">
                      <CheckCircle size={14} className="mr-1" /> Joined
                    </span>
                  )}
                </div>
                
                <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{p.project.name}</h3>
                <p className={`text-xs font-semibold mb-3 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>{p.project.category}</p>
                <p className={`text-sm mb-4 flex-1 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  {p.project.description}
                </p>
                
                <div className={`py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-center text-sm mb-4">
                    <div className="flex items-center text-slate-500 dark:text-gray-400">
                      <Calendar size={14} className="mr-1.5" />
                      {p.project.projectDate ? new Date(p.project.projectDate).toLocaleDateString() : 'TBD'}
                    </div>
                    {myPart && (
                      <div className="flex items-center font-bold text-amber-500">
                        <Clock size={14} className="mr-1" /> {myPart.hoursLogged} hrs logged
                      </div>
                    )}
                  </div>
                  
                  {myPart ? (
                    <button 
                      onClick={() => { setActiveProjectId(p.project.id); setShowLogModal(true); }}
                      className="w-full py-2.5 rounded-xl font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 transition-colors"
                    >
                      Log More Hours
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleJoin(p.project.id)}
                      className="w-full py-2.5 rounded-xl font-bold bg-pink-600 text-white hover:bg-pink-700 transition-colors shadow-lg shadow-pink-600/20"
                    >
                      Join Project
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Log Hours Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Log Volunteer Hours</h2>
            <form onSubmit={handleLogHours} className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Hours Spent *</label>
                <input 
                  type="number" required min="1" value={hoursToLog} onChange={e => setHoursToLog(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                  placeholder="e.g. 4"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowLogModal(false)} className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all active:scale-95">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCSR;
