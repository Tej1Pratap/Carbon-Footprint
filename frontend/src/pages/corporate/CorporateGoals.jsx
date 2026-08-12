import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Trash2, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const CorporateGoals = ({ isDarkMode }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    description: '', 
    targetReductionPercentage: '', 
    baselineEmissions: '', 
    deadline: '' 
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/corporate/goals', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      if (res.ok) setGoals(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        description: formData.description,
        targetReductionPercentage: parseFloat(formData.targetReductionPercentage),
        baselineEmissions: parseFloat(formData.baselineEmissions),
        deadline: formData.deadline
      };
      
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/corporate/goals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save goal');
      
      setShowModal(false);
      setFormData({ description: '', targetReductionPercentage: '', baselineEmissions: '', deadline: '' });
      fetchGoals();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/corporate/goals/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/corporate/goals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      if (res.ok) fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ON_TRACK': return <TrendingUp size={20} className="text-emerald-500" />;
      case 'AT_RISK': return <AlertTriangle size={20} className="text-amber-500" />;
      case 'ACHIEVED': return <CheckCircle size={20} className="text-blue-500" />;
      case 'EXPIRED': return <Clock size={20} className="text-gray-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Corporate Goals</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            Set and track organization-wide sustainability targets.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" />
          Add Goal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className={`flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-slate-50/50 border-slate-300 text-slate-500'}`}>
          <Target size={48} className="mb-4 opacity-50" />
          <h3 className="text-lg font-bold mb-2">No Goals Set</h3>
          <p className="text-sm text-center max-w-sm mb-6">Create your first sustainability target to track organizational progress.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <motion.div 
              key={goal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex flex-col p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-200 shadow-md'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                    {getStatusIcon(goal.status)}
                  </div>
                  <select 
                    value={goal.status}
                    onChange={(e) => handleUpdateStatus(goal.id, e.target.value)}
                    className={`text-sm font-bold bg-transparent outline-none cursor-pointer ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                  >
                    <option value="ON_TRACK">On Track</option>
                    <option value="AT_RISK">At Risk</option>
                    <option value="ACHIEVED">Achieved</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>
                <button onClick={() => handleDelete(goal.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
              
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {goal.description}
              </h3>
              
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between text-sm">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-slate-500'}>Target Reduction:</span>
                  <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>{goal.targetReductionPercentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-slate-500'}>Baseline:</span>
                  <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>{goal.baselineEmissions} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-slate-500'}>Deadline:</span>
                  <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>{new Date(goal.deadline).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="w-full bg-slate-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${goal.status === 'ACHIEVED' ? 'bg-blue-500' : goal.status === 'AT_RISK' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: goal.status === 'ACHIEVED' ? '100%' : '50%' }}
                ></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Create Corporate Goal</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Description *</label>
                <input 
                  type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                  placeholder="e.g. Reduce scope 2 emissions by 20%"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Reduction Target (%) *</label>
                  <input 
                    type="number" required min="1" max="100" value={formData.targetReductionPercentage} onChange={e => setFormData({...formData, targetReductionPercentage: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Baseline (kg CO₂) *</label>
                  <input 
                    type="number" required min="1" value={formData.baselineEmissions} onChange={e => setFormData({...formData, baselineEmissions: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Deadline *</label>
                <input 
                  type="date" required value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateGoals;
