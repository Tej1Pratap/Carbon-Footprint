import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit, Trash2, Filter, Download, FileText, BarChart2, Calendar, MoreVertical, AlertTriangle, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

const AdminActivity = ({ isDarkMode }) => {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = New to Old, 'asc' = Old to New
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, targetIds: [] });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchActivities();
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-dropdown-btn') && !e.target.closest('.action-dropdown-menu')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/admin/activities', {
        headers: { 'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}` }
      });
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAction = async (action, ids = selectedIds) => {
    if (!ids.length) return;
    try {
      await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/admin/activities/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}`
        },
        body: JSON.stringify({ action, ids })
      });
      setSelectedIds([]);
      fetchActivities();
    } catch (err) {
      console.error(err);
    }
    setConfirmModal({ isOpen: false, action: null, targetIds: [] });
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const term = searchTerm.toLowerCase();
      const userStr = `${a.user?.username || ''} ${a.user?.email || ''}`.toLowerCase();
      const amountStr = `${a.quantity} ${a.unit}`.toLowerCase();
      const emissionsStr = `${a.emissionsKgCo2?.toFixed(2)} kg`.toLowerCase();
      const dateStr = a.logDate ? new Date(a.logDate).toLocaleDateString().toLowerCase() : 'n/a';
      
      const matchesSearch = (
        a.activityType?.toLowerCase().includes(term) || 
        a.category?.toLowerCase().includes(term) ||
        userStr.includes(term) ||
        amountStr.includes(term) ||
        emissionsStr.includes(term) ||
        dateStr.includes(term)
      );

      if (!matchesSearch) return false;

      if (dateRange !== 'all') {
        const logDate = new Date(a.logDate).getTime();
        const now = new Date().getTime();
        const diffDays = (now - logDate) / (1000 * 3600 * 24);
        if (dateRange === '1d' && diffDays > 1) return false;
        if (dateRange === '7d' && diffDays > 7) return false;
        if (dateRange === '30d' && diffDays > 30) return false;
        if (dateRange === '90d' && diffDays > 90) return false;
      }
      return true;

    }).sort((a, b) => {
      const dateA = new Date(a.logDate || 0).getTime();
      const dateB = new Date(b.logDate || 0).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [activities, searchTerm, sortOrder, dateRange]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage) || 1;
  const currentActivities = filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, dateRange, sortOrder]);

  const getCategoryColor = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('transport') || cat.includes('car') || cat.includes('flight')) return isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-100 text-blue-700 border-blue-200';
    if (cat.includes('energy') || cat.includes('electricity')) return isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (cat.includes('food') || cat.includes('diet')) return isDarkMode ? 'bg-orange-900/30 text-orange-400 border-orange-800' : 'bg-orange-100 text-orange-700 border-orange-200';
    return isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-100 text-green-700 border-green-200';
  };

  const handleExport = async () => {
    if (!activities.length) return;
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Activities');
      
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'User', key: 'user', width: 25 },
        { header: 'Activity Type', key: 'activityType', width: 20 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Quantity', key: 'quantity', width: 15 },
        { header: 'Unit', key: 'unit', width: 15 },
        { header: 'Emissions (kg CO2)', key: 'emissions', width: 22 },
        { header: 'Date', key: 'date', width: 20 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      activities.forEach(a => {
        worksheet.addRow({
          id: a.id,
          user: a.user?.username || a.user?.email || `User #${a.user?.id}` || 'Unknown',
          activityType: a.activityType,
          category: a.category,
          quantity: a.quantity,
          unit: a.unit,
          emissions: a.emissionsKgCo2 ? Number(a.emissionsKgCo2.toFixed(2)) : 0,
          date: a.logDate ? new Date(a.logDate).toLocaleDateString() : 'N/A'
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Platform_Activities_Export.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to generate Excel file.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Activity Logs</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monitor, audit, and analyze all user-submitted carbon activities.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={handleExport} className={`px-5 py-2.5 rounded-xl border font-medium flex items-center space-x-2 transition-all hover:scale-105 shadow-sm ${isDarkMode ? 'border-gray-700 text-slate-300 hover:bg-gray-800 hover:border-gray-600 bg-gray-800/50' : 'border-slate-200 text-slate-700 hover:bg-white bg-slate-50'}`}>
            <Download size={18} />
            <span>Export Excel</span>
          </button>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl flex items-center space-x-5 transition-transform hover:-translate-y-1 ${isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-lg shadow-black/20' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <FileText size={28} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Logs</p>
            <h4 className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{activities.length}</h4>
          </div>
        </div>
        
        <div className={`p-6 rounded-2xl flex items-center space-x-5 transition-transform hover:-translate-y-1 ${isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-lg shadow-black/20' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30">
            <BarChart2 size={28} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Impact</p>
            <h4 className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {activities.reduce((sum, a) => sum + (a.emissionsKgCo2 || 0), 0).toLocaleString(undefined, {maximumFractionDigits: 1})} <span className="text-sm font-medium text-slate-400">kg CO₂</span>
            </h4>
          </div>
        </div>
        
        <div className={`p-6 rounded-2xl flex items-center space-x-5 transition-transform hover:-translate-y-1 ${isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-lg shadow-black/20' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
            <Activity size={28} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Avg. Impact per Log</p>
            <h4 className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {activities.length ? (activities.reduce((sum, a) => sum + (a.emissionsKgCo2 || 0), 0) / activities.length).toLocaleString(undefined, {maximumFractionDigits: 1}) : 0} <span className="text-sm font-medium text-slate-400">kg CO₂</span>
            </h4>
          </div>
        </div>
      </motion.div>

      {/* Table Container */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`rounded-2xl border overflow-visible transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.2)]' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
        
        {/* Toolbar */}
        <div className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-slate-100'}`}>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className={`relative w-full sm:w-80 rounded-xl border transition-all duration-300 ${isDarkMode ? 'bg-gray-900/50 border-gray-700 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary' : 'bg-slate-50 border-slate-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white'}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search activities..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-transparent border-none focus:outline-none text-sm rounded-xl placeholder-slate-400 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
              />
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`flex-1 sm:flex-none p-2.5 rounded-xl border text-sm font-medium transition-colors outline-none cursor-pointer ${isDarkMode ? 'bg-gray-900/50 border-gray-700 text-slate-300 focus:border-primary/50' : 'bg-slate-50 border-slate-200 text-slate-600 focus:border-primary/50'}`}
              >
                <option value="all">All Time</option>
                <option value="1d">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>

              <button 
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className={`p-2.5 px-4 flex items-center gap-2 rounded-xl border transition-colors text-sm font-medium ${isDarkMode ? 'border-gray-700 text-slate-300 hover:text-white hover:bg-gray-700' : 'border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <Filter size={18} />
                {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center space-x-2 bg-slate-50 dark:bg-gray-900/50 p-1.5 rounded-xl border border-slate-200 dark:border-gray-700">
                <span className={`px-3 text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{selectedIds.length} selected</span>
                <div className="w-px h-5 bg-slate-300 dark:bg-gray-600 mx-1"></div>
                <button onClick={() => setConfirmModal({ isOpen: true, action: 'DELETE', targetIds: selectedIds })} className="px-4 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors flex items-center space-x-2">
                  <Trash2 size={16} /> <span>Delete Selected</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-900/80 backdrop-blur-md text-slate-400 border-gray-700' : 'bg-slate-50/90 backdrop-blur-md text-slate-500 border-slate-200'} border-b uppercase text-xs font-bold tracking-wider`}>
              <tr>
                <th className="px-6 py-4 w-12">
                  <input type="checkbox" className={`w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary ${isDarkMode ? 'bg-gray-800 border-gray-600' : ''}`} 
                    onChange={(e) => setSelectedIds(e.target.checked ? currentActivities.map(a => a.id) : [])}
                    checked={selectedIds.length === currentActivities.length && currentActivities.length > 0}
                  />
                </th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Activity</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Emissions</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-slate-100'}`}>
              <AnimatePresence>
                {currentActivities.map((act, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    key={act.id} 
                    className={`transition-colors group ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="px-6 py-4">
                      <input type="checkbox" className={`w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary ${isDarkMode ? 'bg-gray-800 border-gray-600' : ''}`}
                        checked={selectedIds.includes(act.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds([...selectedIds, act.id]);
                          else setSelectedIds(selectedIds.filter(id => id !== act.id));
                        }}
                      />
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      <div className="flex items-center space-x-3">
                        <img src={act.user?.profilePicture || `https://ui-avatars.com/api/?name=${act.user?.username || 'U'}&background=random&color=fff`} alt="User" className="w-8 h-8 rounded-full shadow-sm" />
                        <span className={`font-semibold text-sm ${isDarkMode ? 'text-white group-hover:text-primary transition-colors' : 'text-slate-900 group-hover:text-primary transition-colors'}`}>
                          {act.user?.username || act.user?.email || `User #${act.user?.id}` || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {act.activityType}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(act.category)}`}>
                        {act.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {act.quantity} {act.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                        {act.emissionsKgCo2?.toFixed(2)} kg CO₂
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{act.logDate ? new Date(act.logDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === act.id ? null : act.id);
                        }} 
                        className={`action-dropdown-btn p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-gray-700' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      <AnimatePresence>
                        {openDropdownId === act.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className={`action-dropdown-menu absolute right-8 top-10 w-48 rounded-xl shadow-xl border overflow-hidden z-20 ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-100'}`}
                          >
                            <button className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-gray-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                              <Edit size={16} /><span>Edit Log</span>
                            </button>
                            <div className={`h-px w-full ${isDarkMode ? 'bg-gray-700' : 'bg-slate-100'}`}></div>
                            <button onClick={() => setConfirmModal({ isOpen: true, action: 'DELETE', targetIds: [act.id] })} className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${isDarkMode ? 'text-rose-400 hover:bg-rose-900/20' : 'text-rose-600 hover:bg-rose-50'}`}>
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
          
          {filteredActivities.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-16 text-center flex flex-col items-center justify-center ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              <img src="https://illustrations.popsy.co/amber/success.svg" alt="No activities" className="w-48 h-48 mb-4 opacity-70 grayscale" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No Activities Found</h3>
              <p className="text-sm mt-2 max-w-sm">No activity logs match your current filters. Try adjusting your search or date range.</p>
            </motion.div>
          )}
        </div>

        {/* Pagination Footer */}
        {filteredActivities.length > 0 && (
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} entries
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
                Are you sure you want to delete {confirmModal.targetIds.length === 1 ? 'this activity log' : `these ${confirmModal.targetIds.length} logs`}? This action cannot be undone and will recalculate the user's carbon footprint.
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

export default AdminActivity;
