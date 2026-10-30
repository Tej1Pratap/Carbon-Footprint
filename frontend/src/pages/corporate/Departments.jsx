import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit2, Trash2, Search, Building2, Users, X, Mail } from 'lucide-react';

const Departments = ({ isDarkMode }) => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for viewing employees in a department
  const [viewingDept, setViewingDept] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` };
      
      const [deptRes, empRes] = await Promise.all([
        fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/corporate/management/departments', { headers }),
        fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/corporate/management/employees', { headers })
      ]);
      
      if (!deptRes.ok || !empRes.ok) throw new Error('Failed to fetch data');
      
      setDepartments(await deptRes.json());
      setEmployees(await empRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingDept 
        ? `${(import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com')}/api/corporate/management/departments/${editingDept.id}`
        : `${(import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com')}/api/corporate/management/departments`;
      const method = editingDept ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save department');
      }
      
      setShowModal(false);
      setEditingDept(null);
      setFormData({ name: '', description: '' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this department?')) return;
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com')}/api/corporate/management/departments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ name: dept.name, description: dept.description || '' });
    } else {
      setEditingDept(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const filteredDepts = departments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Get employees for a specific department
  const getEmployeesInDept = (deptId) => {
    return employees.filter(emp => emp.department && emp.department.id === deptId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Departments</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            Manage your organization's departmental structure and view assigned employees.
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" />
          Add Department
        </button>
      </div>

      {/* Search Bar */}
      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-200 shadow-md'}`}>
        <div className="relative">
          <Search size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`} />
          <input 
            type="text" 
            placeholder="Search departments..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-purple-500/20 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white'}`}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredDepts.length === 0 ? (
        <div className={`flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-slate-50/50 border-slate-300 text-slate-500'}`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-slate-400 shadow-sm'}`}>
            <Building2 size={32} />
          </div>
          <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>No Departments Found</h3>
          <p className="text-sm text-center max-w-sm mb-6">Create departments to organize your employees and track specific carbon footprints.</p>
          <button onClick={() => openModal()} className="text-purple-600 font-semibold hover:text-purple-700 flex items-center">
            <Plus size={16} className="mr-1" /> Create your first department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map(dept => {
            const deptEmployees = getEmployeesInDept(dept.id);
            return (
              <div key={dept.id} className={`group flex flex-col p-6 rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-1 ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20 hover:shadow-purple-900/10 hover:border-purple-500/30' : 'bg-white border-slate-200 shadow-md hover:shadow-purple-500/5 hover:border-purple-200'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-gray-700 text-purple-400 group-hover:bg-purple-900/30 group-hover:text-purple-300' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100 group-hover:text-purple-700'}`}>
                    <Briefcase size={24} />
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(dept)} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400' : 'hover:bg-slate-100 text-slate-400 hover:text-blue-600'}`}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(dept.id)} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-slate-100 text-slate-400 hover:text-red-600'}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{dept.name}</h3>
                <p className={`text-sm mb-6 flex-1 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  {dept.description || 'No description provided.'}
                </p>
                
                <div className={`pt-4 border-t flex items-center justify-between text-sm ${isDarkMode ? 'border-gray-700' : 'border-slate-100'}`}>
                  <div className="flex items-center space-x-1.5">
                    <Users size={16} className={isDarkMode ? 'text-gray-400' : 'text-slate-400'} />
                    <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{deptEmployees.length} Employees</span>
                  </div>
                  <button 
                    onClick={() => setViewingDept(dept)}
                    className={`font-semibold transition-colors ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                  >
                    View All
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {editingDept ? 'Edit Department' : 'Add Department'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Department Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-purple-500/20 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-500 focus:bg-white'}`}
                  placeholder="e.g. Information Technology"
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Description</label>
                <textarea 
                  rows="3"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-purple-500/20 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-500 focus:bg-white'}`}
                  placeholder="Brief description of the department's role..."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all active:scale-95">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employees Modal */}
      {viewingDept && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className={`w-full max-w-2xl p-6 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  <Building2 size={22} className="mr-2 text-purple-500" />
                  {viewingDept.name}
                </h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  {getEmployeesInDept(viewingDept.id).length} Employees Assigned
                </p>
              </div>
              <button 
                onClick={() => setViewingDept(null)}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-slate-200 bg-slate-50/50'}`}>
              {getEmployeesInDept(viewingDept.id).length === 0 ? (
                <div className="p-8 text-center">
                  <p className={isDarkMode ? 'text-gray-500' : 'text-slate-400'}>No employees have been assigned to this department yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {getEmployeesInDept(viewingDept.id).map(emp => (
                    <li key={emp.memberId} className={`p-4 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-white'}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${emp.role === 'ORG_ADMIN' ? 'bg-blue-500' : 'bg-indigo-400'}`}>
                          {emp.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{emp.username}</div>
                          <div className={`text-xs flex items-center mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                            <Mail size={12} className="mr-1" /> {emp.email}
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${emp.role === 'ORG_ADMIN' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-blue-100 text-blue-700') : (isDarkMode ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-800' : 'bg-indigo-100 text-indigo-700')}`}>
                        {emp.role.replace('_', ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="pt-6">
              <button 
                onClick={() => setViewingDept(null)} 
                className={`w-full py-2.5 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
