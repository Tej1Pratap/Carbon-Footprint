import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Search, Building2, UserPlus, Mail, Calendar } from 'lucide-react';

const Employees = ({ isDarkMode }) => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [selectedDeptForAdd, setSelectedDeptForAdd] = useState('');
  const [selectedRoleForAdd, setSelectedRoleForAdd] = useState('EMPLOYEE');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` };
      
      const [empRes, deptRes] = await Promise.all([
        fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/corporate/management/employees', { headers }),
        fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/corporate/management/departments', { headers })
      ]);
      
      if (!empRes.ok || !deptRes.ok) throw new Error('Failed to fetch data');
      
      setEmployees(await empRes.json());
      setDepartments(await deptRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const payload = { email: addEmail, role: selectedRoleForAdd };
      if (selectedDeptForAdd) payload.departmentId = selectedDeptForAdd;
      
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/corporate/management/employees', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to add employee');
      }
      
      setShowAddModal(false);
      setAddEmail('');
      setSelectedDeptForAdd('');
      setSelectedRoleForAdd('EMPLOYEE');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignDepartment = async (memberId, deptId) => {
    try {
      const payload = deptId ? { departmentId: deptId } : {};
      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com')}/api/corporate/management/employees/${memberId}/department`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to assign department');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this employee from the organization?')) return;
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com')}/api/corporate/management/employees/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to remove');
      }
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter ? (emp.department && emp.department.id.toString() === deptFilter) : true;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Employees</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            Manage members, assign departments, and track participation.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <UserPlus size={18} className="mr-2" />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-200 shadow-md'}`}>
        <div className="relative flex-1">
          <Search size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white'}`}
          />
        </div>
        <div className="w-full md:w-64">
          <select 
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500 focus:bg-white'}`}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-200 shadow-md'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'bg-gray-900/50 border-gray-700 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No employees found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp.memberId} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${emp.role === 'ORG_ADMIN' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-blue-100 text-blue-700') : (isDarkMode ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-800' : 'bg-indigo-100 text-indigo-700')}`}>
                        {emp.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={emp.department ? emp.department.id : ''}
                        onChange={(e) => handleAssignDepartment(emp.memberId, e.target.value)}
                        className={`text-sm px-2 py-1.5 rounded-lg border outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                      >
                        <option value="">Unassigned</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm flex items-center ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                        <Calendar size={14} className="mr-1.5" />
                        {new Date(emp.joinedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleRemove(emp.memberId)} 
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' : 'text-slate-400 hover:text-red-600 hover:bg-slate-100'}`}
                        title="Remove Employee"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <UserPlus size={24} className="mr-2 text-indigo-500" />
              Add Employee
            </h2>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'} mb-4`}>
                Enter the email address of the employee. They must have already created a personal EcoTrack account, or one will be created automatically.
              </p>
              <div className={`p-3 rounded-xl border flex items-start gap-3 ${isDarkMode ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-100'}`}>
                <div className={`mt-0.5 p-1 rounded-full ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                  <UserPlus size={16} />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>Default Password</h4>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-indigo-200/70' : 'text-indigo-700/80'}`}>
                    If an account is created, the default password is: <span className="font-bold font-mono">Welcome@123</span><br />
                    They can change this password later in their profile settings.
                  </p>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Employee Email *</label>
                <input 
                  type="email" 
                  required
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500 focus:bg-white'}`}
                  placeholder="employee@company.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Employee Role</label>
                <select 
                  value={selectedRoleForAdd}
                  onChange={(e) => setSelectedRoleForAdd(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500 focus:bg-white'}`}
                >
                  <option value="EMPLOYEE">Standard Employee</option>
                  <option value="ORG_ADMIN">Organization Admin</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>Assign Department (Optional)</label>
                <select 
                  value={selectedDeptForAdd}
                  onChange={(e) => setSelectedDeptForAdd(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500 focus:bg-white'}`}
                >
                  <option value="">Unassigned</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
