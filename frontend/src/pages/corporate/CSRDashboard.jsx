import React, { useState, useEffect } from 'react';
import { HeartHandshake, Plus, Edit2, Trash2, Calendar, Users, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const CSRDashboard = ({ isDarkMode }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: '', description: '', projectDate: '', budget: '', beneficiariesCount: ''
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/corporate/csr/projects', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      if (res.ok) setProjects(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingProject 
        ? `${import.meta.env.VITE_API_URL}/api/corporate/csr/projects/${editingProject.id}`
        : `${import.meta.env.VITE_API_URL}/api/corporate/csr/projects`;
      const method = editingProject ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        beneficiariesCount: formData.beneficiariesCount ? parseInt(formData.beneficiariesCount) : 0
      };
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save project');
      
      setShowModal(false);
      setEditingProject(null);
      setFormData({ name: '', category: '', description: '', projectDate: '', budget: '', beneficiariesCount: '' });
      fetchProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this CSR project? All participation data will also be deleted.')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/corporate/csr/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      if (res.ok) fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        category: project.category,
        description: project.description || '',
        projectDate: project.projectDate || '',
        budget: project.budget || '',
        beneficiariesCount: project.beneficiariesCount || ''
      });
    } else {
      setEditingProject(null);
      setFormData({ name: '', category: '', description: '', projectDate: '', budget: '', beneficiariesCount: '' });
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">CSR Dashboard</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            Manage Corporate Social Responsibility projects and track volunteer participation.
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="inline-flex items-center justify-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-xl shadow-lg shadow-pink-600/20 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" />
          Create Project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className={`flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-slate-50/50 border-slate-300 text-slate-500'}`}>
          <HeartHandshake size={48} className="mb-4 opacity-50" />
          <h3 className="text-lg font-bold mb-2">No CSR Projects</h3>
          <p className="text-sm text-center max-w-sm mb-6">Create a volunteer project for your employees to join.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <motion.div 
              key={p.project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20 hover:border-pink-500/30' : 'bg-white border-slate-200 shadow-md hover:border-pink-300'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${p.project.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : p.project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                  {p.project.status.replace('_', ' ')}
                </span>
                <div className="flex space-x-2">
                  <button onClick={() => openModal(p.project)} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(p.project.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{p.project.name}</h3>
              <p className={`text-xs font-semibold mb-3 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>{p.project.category}</p>
              
              <p className={`text-sm mb-4 flex-1 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                {p.project.description}
              </p>
              
              <div className={`grid grid-cols-2 gap-4 py-4 border-t border-b mb-4 ${isDarkMode ? 'border-gray-700' : 'border-slate-100'}`}>
                <div className="flex flex-col">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Volunteers</span>
                  <div className="flex items-center font-semibold mt-1">
                    <Users size={14} className="mr-1.5 text-indigo-500" />
                    {p.participantsCount}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Hours Logged</span>
                  <div className="flex items-center font-semibold mt-1">
                    <Clock size={14} className="mr-1.5 text-amber-500" />
                    {p.totalHours} h
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Budget</span>
                  <div className="flex items-center font-semibold mt-1">
                    <DollarSign size={14} className="text-emerald-500" />
                    {p.project.budget || 0}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Date</span>
                  <div className="flex items-center font-semibold mt-1 text-sm">
                    <Calendar size={14} className="mr-1.5 text-blue-500" />
                    {p.project.projectDate ? new Date(p.project.projectDate).toLocaleDateString() : 'TBD'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{editingProject ? 'Edit Project' : 'Create CSR Project'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Project Name *</label>
                <input 
                  type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Category *</label>
                <select 
                  required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="">Select category...</option>
                  <option value="Environmental Cleanup">Environmental Cleanup</option>
                  <option value="Tree Planting">Tree Planting</option>
                  <option value="Community Education">Community Education</option>
                  <option value="Food Bank Volunteering">Food Bank Volunteering</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Description</label>
                <textarea 
                  rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Date</label>
                  <input 
                    type="date" value={formData.projectDate} onChange={e => setFormData({...formData, projectDate: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Budget ($)</label>
                  <input 
                    type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-600/30 transition-all active:scale-95">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSRDashboard;
