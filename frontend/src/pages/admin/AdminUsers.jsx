import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit, Trash2, Shield, ShieldOff, MoreVertical, Plus, Filter, Download, UserCheck, UserX, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

const AdminUsers = ({ isDarkMode }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'USER' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, targetIds: [] });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  const [sortOrder, setSortOrder] = useState('NEWEST');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-dropdown-btn') && !e.target.closest('.action-dropdown-menu')) {
        setOpenDropdownId(null);
      }
      if (!e.target.closest('.filter-dropdown-container')) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/admin/users', {
        headers: { 'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAction = async (action, ids = selectedIds) => {
    if (!ids.length) return;
    try {
      await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/admin/users/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}`
        },
        body: JSON.stringify({ action, ids })
      });
      setSelectedIds([]);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
    setConfirmModal({ isOpen: false, action: null, targetIds: [] });
  };

  const filteredUsers = useMemo(() => {
    let result = users.filter(u => {
      const term = searchTerm.toLowerCase();
      const dateStr = u.registrationDate ? new Date(u.registrationDate).toLocaleDateString().toLowerCase() : 'just now';
      return (
        u.email.toLowerCase().includes(term) || 
        u.username.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term) ||
        (u.status || '').toLowerCase().includes(term) ||
        (u.id && u.id.toString().toLowerCase().includes(term)) ||
        dateStr.includes(term)
      );
    });

    result.sort((a, b) => {
      const dateA = a.registrationDate ? new Date(a.registrationDate).getTime() : 0;
      const dateB = b.registrationDate ? new Date(b.registrationDate).getTime() : 0;
      if (sortOrder === 'NEWEST') return dateB - dateA;
      if (sortOrder === 'OLDEST') return dateA - dateB;
      return 0;
    });

    return result;
  }, [users, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when search changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const handleExport = async () => {
    if (!users.length) return;
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');
      
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Username', key: 'username', width: 25 },
        { header: 'Email', key: 'email', width: 35 },
        { header: 'Role', key: 'role', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Registration Date', key: 'registrationDate', width: 20 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      users.forEach(u => {
        worksheet.addRow({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          status: u.status || 'UNKNOWN',
          registrationDate: u.registrationDate ? new Date(u.registrationDate).toLocaleDateString() : 'N/A'
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Platform_Users_Export.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to generate Excel file.');
    }
  };

  const handleAddSubmit = async () => {
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (response.ok) {
        setIsAddingUser(false);
        setNewUser({ username: '', email: '', password: '', role: 'USER' });
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert('Failed to add user: ' + (errorData.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error adding user.');
    }
  };

  const getStatusPill = (status) => {
    const s = status ? status.toUpperCase() : 'UNKNOWN';
    if (s === 'ACTIVE') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">Active</span>;
    if (s === 'PENDING') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">Pending</span>;
    if (s === 'BLOCKED') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">Blocked</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">{s}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>User Management</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage platform users, roles, and security access.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-3">
          <button onClick={handleExport} className={`px-4 py-2.5 rounded-xl border font-medium flex items-center space-x-2 transition-all hover:scale-105 shadow-sm ${isDarkMode ? 'border-gray-700 text-slate-300 hover:bg-gray-800 hover:border-gray-600 bg-gray-800/50' : 'border-slate-200 text-slate-700 hover:bg-white bg-slate-50'}`}>
            <Download size={18} />
            <span>Export Excel</span>
          </button>
          <button onClick={() => setIsAddingUser(!isAddingUser)} className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 flex items-center space-x-2 font-medium">
            <Plus size={18} />
            <span>{isAddingUser ? 'Cancel' : 'Add User'}</span>
          </button>
        </motion.div>
      </div>

      {/* Table Container */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border overflow-visible transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.2)]' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
        
        {/* Toolbar */}
        <div className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-slate-100'}`}>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className={`relative w-full md:w-80 rounded-xl border transition-all duration-300 ${isDarkMode ? 'bg-gray-900/50 border-gray-700 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary' : 'bg-slate-50 border-slate-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white'}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, ID, email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-transparent border-none focus:outline-none text-sm rounded-xl placeholder-slate-400 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
              />
            </div>
            <div className="relative filter-dropdown-container">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-2.5 rounded-xl border transition-colors ${isDarkMode ? 'border-gray-700 text-slate-400 hover:text-white hover:bg-gray-700' : 'border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100'} ${isFilterOpen ? (isDarkMode ? 'bg-gray-700 text-white' : 'bg-slate-100 text-slate-700') : ''}`}>
                <Filter size={18} />
              </button>
              
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className={`absolute right-0 top-12 w-48 rounded-xl shadow-xl border overflow-hidden z-30 ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-100'}`}
                  >
                    <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400 bg-gray-900/50' : 'text-slate-500 bg-slate-50'}`}>
                      Sort by Date
                    </div>
                    <button 
                      onClick={() => { setSortOrder('NEWEST'); setIsFilterOpen(false); }} 
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${sortOrder === 'NEWEST' ? (isDarkMode ? 'text-primary bg-primary/10' : 'text-primary bg-primary/10') : (isDarkMode ? 'text-slate-300 hover:bg-gray-700' : 'text-slate-700 hover:bg-slate-50')}`}
                    >
                      <span>New to Old</span>
                      {sortOrder === 'NEWEST' && <CheckCircle2 size={16} />}
                    </button>
                    <button 
                      onClick={() => { setSortOrder('OLDEST'); setIsFilterOpen(false); }} 
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${sortOrder === 'OLDEST' ? (isDarkMode ? 'text-primary bg-primary/10' : 'text-primary bg-primary/10') : (isDarkMode ? 'text-slate-300 hover:bg-gray-700' : 'text-slate-700 hover:bg-slate-50')}`}
                    >
                      <span>Old to New</span>
                      {sortOrder === 'OLDEST' && <CheckCircle2 size={16} />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {selectedIds.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center space-x-2 bg-slate-50 dark:bg-gray-900/50 p-1.5 rounded-xl border border-slate-200 dark:border-gray-700">
              <span className={`px-3 text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{selectedIds.length} selected</span>
              <div className="w-px h-5 bg-slate-300 dark:bg-gray-600 mx-1"></div>
              <button onClick={() => handleBulkAction('ACTIVATE')} className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                <UserCheck size={16} /><span>Activate</span>
              </button>
              <button onClick={() => handleBulkAction('DEACTIVATE')} className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                <UserX size={16} /><span>Block</span>
              </button>
              <div className="w-px h-5 bg-slate-300 dark:bg-gray-600 mx-1"></div>
              <button onClick={() => setConfirmModal({ isOpen: true, action: 'DELETE', targetIds: selectedIds })} className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                <Trash2 size={16} /><span>Delete</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-900/80 backdrop-blur-md text-slate-400 border-gray-700' : 'bg-slate-50/90 backdrop-blur-md text-slate-500 border-slate-200'} border-b uppercase text-xs font-bold tracking-wider`}>
              <tr>
                <th className="px-6 py-4 w-12">
                  <input type="checkbox" className={`w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary ${isDarkMode ? 'bg-gray-800 border-gray-600' : ''}`} 
                    onChange={(e) => setSelectedIds(e.target.checked ? currentUsers.map(u => u.id) : [])}
                    checked={selectedIds.length === currentUsers.length && currentUsers.length > 0}
                  />
                </th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-slate-100'}`}>
              <AnimatePresence>
                {isAddingUser && (
                  <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-green-50/30'}`}>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4 flex flex-col space-y-2">
                      <input type="text" placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary/20 outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-slate-200 shadow-md text-slate-900'}`} />
                      <input type="email" placeholder="Email Address" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary/20 outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-slate-200 shadow-md text-slate-900'}`} />
                      <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary/20 outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-slate-200 shadow-md text-slate-900'}`} />
                    </td>
                    <td className="px-6 py-4 align-top">
                      <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary/20 outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-slate-200 shadow-md text-slate-900'}`}>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 align-top"><span className="text-sm font-medium text-slate-500">New User</span></td>
                    <td className="px-6 py-4 align-top"><span className="text-sm text-slate-500">Now</span></td>
                    <td className="px-6 py-4 text-right align-top">
                      <button onClick={handleAddSubmit} className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold">Save User</button>
                    </td>
                  </motion.tr>
                )}
                
                {currentUsers.map((user, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    key={user.id} 
                    className={`transition-colors group ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="px-6 py-4">
                      <input type="checkbox" className={`w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary ${isDarkMode ? 'bg-gray-800 border-gray-600' : ''}`}
                        checked={selectedIds.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds([...selectedIds, user.id]);
                          else setSelectedIds(selectedIds.filter(id => id !== user.id));
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&rounded=true`} alt={user.username} className="w-10 h-10 rounded-full shadow-sm" />
                        <div>
                          <div className={`font-semibold text-sm ${isDarkMode ? 'text-white group-hover:text-primary transition-colors' : 'text-slate-900 group-hover:text-primary transition-colors'}`}>{user.username}</div>
                          <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? (isDarkMode ? 'bg-primary/20 text-green-300 border border-primary/30' : 'bg-green-100 text-green-700 border border-green-200') : (isDarkMode ? 'bg-gray-700 text-slate-300 border border-gray-600' : 'bg-slate-100 text-slate-700 border border-slate-200')}`}>
                        {user.role === 'ADMIN' ? <Shield size={12} className="mr-1.5" /> : <ShieldOff size={12} className="mr-1.5" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusPill(user.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {user.registrationDate ? new Date(user.registrationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Just now'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === user.id ? null : user.id);
                        }} 
                        className={`action-dropdown-btn p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-gray-700' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      <AnimatePresence>
                        {openDropdownId === user.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className={`action-dropdown-menu absolute right-8 top-10 w-48 rounded-xl shadow-xl border overflow-hidden z-20 ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-100'}`}
                          >
                            <button className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-gray-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                              <Edit size={16} /><span>Edit User</span>
                            </button>
                            <button onClick={() => handleBulkAction('ACTIVATE', [user.id])} className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${isDarkMode ? 'text-emerald-400 hover:bg-gray-700' : 'text-emerald-600 hover:bg-slate-50'}`}>
                              <UserCheck size={16} /><span>Activate</span>
                            </button>
                            <button onClick={() => handleBulkAction('DEACTIVATE', [user.id])} className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${isDarkMode ? 'text-amber-400 hover:bg-gray-700' : 'text-amber-600 hover:bg-slate-50'}`}>
                              <UserX size={16} /><span>Block</span>
                            </button>
                            <div className={`h-px w-full ${isDarkMode ? 'bg-gray-700' : 'bg-slate-100'}`}></div>
                            <button onClick={() => setConfirmModal({ isOpen: true, action: 'DELETE', targetIds: [user.id] })} className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${isDarkMode ? 'text-rose-400 hover:bg-rose-900/20' : 'text-rose-600 hover:bg-rose-50'}`}>
                              <Trash2 size={16} /><span>Delete</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && !isAddingUser && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-16 text-center flex flex-col items-center justify-center ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              <img src="https://illustrations.popsy.co/amber/surreal-hourglass.svg" alt="No users" className="w-48 h-48 mb-4 opacity-70 grayscale" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No Users Found</h3>
              <p className="text-sm mt-2 max-w-sm">We couldn't find any users matching your criteria. Try adjusting your search filters or create a new user.</p>
              <button onClick={() => setIsAddingUser(true)} className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                Create First User
              </button>
            </motion.div>
          )}
        </div>

        {/* Pagination Footer */}
        {filteredUsers.length > 0 && (
          <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rows per page:</span>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className={`text-sm rounded-lg px-2 py-1 border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-slate-200 shadow-md text-slate-700'}`}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            
            <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${isDarkMode ? 'border-gray-700 bg-gray-800 text-slate-300 hover:bg-gray-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <ChevronLeft size={16} />
              </button>
              <div className={`px-4 py-1.5 rounded-lg text-sm font-bold ${isDarkMode ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-green-50 text-primary border border-green-200'}`}>
                {currentPage} / {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${isDarkMode ? 'border-gray-700 bg-gray-800 text-slate-300 hover:bg-gray-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setConfirmModal({ isOpen: false, action: null, targetIds: [] })}></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-100'}`}>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4 mx-auto">
                <AlertTriangle size={24} />
              </div>
              <h3 className={`text-xl font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Confirm Deletion</h3>
              <p className={`text-center text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Are you sure you want to delete {confirmModal.targetIds.length === 1 ? 'this user' : `these ${confirmModal.targetIds.length} users`}? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button onClick={() => setConfirmModal({ isOpen: false, action: null, targetIds: [] })} className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  Cancel
                </button>
                <button onClick={() => handleBulkAction('DELETE', confirmModal.targetIds)} className="flex-1 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all hover:-translate-y-0.5">
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
