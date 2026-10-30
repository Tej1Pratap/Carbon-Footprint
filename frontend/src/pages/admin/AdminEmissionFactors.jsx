import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Plus, Edit, Trash2, Search, Filter, AlertTriangle, Download, ChevronLeft, ChevronRight, Zap, Droplets, Utensils, Car } from 'lucide-react';

const AdminEmissionFactors = ({ isDarkMode }) => {
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newFactor, setNewFactor] = useState({ category: '', activityType: '', unit: '', kgCo2PerUnit: 0 });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, targetId: null });

  useEffect(() => {
    fetchFactors();
  }, []);

  const fetchFactors = async () => {
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/admin/emission-factors', {
        headers: { 'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}` }
      });
      if (!response.ok) throw new Error('Failed to fetch emission factors');
      const data = await response.json();
      setFactors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredFactors = useMemo(() => {
    return factors.filter(f => {
      const term = searchTerm.toLowerCase();
      return (
        f.category?.toLowerCase().includes(term) || 
        f.activityType?.toLowerCase().includes(term) ||
        f.unit?.toLowerCase().includes(term) ||
        f.kgCo2PerUnit?.toString().includes(term)
      );
    });
  }, [factors, searchTerm]);

  const totalPages = Math.ceil(filteredFactors.length / itemsPerPage) || 1;
  const currentFactors = filteredFactors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const handleAddSubmit = async () => {
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/admin/emission-factors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}`
        },
        body: JSON.stringify(newFactor)
      });
      if (response.ok) {
        setIsAdding(false);
        setNewFactor({ category: '', activityType: '', unit: '', kgCo2PerUnit: 0 });
        fetchFactors();
      } else {
        throw new Error('Failed to add factor');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + `/api/admin/emission-factors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}` }
      });
      fetchFactors();
    } catch (err) {
      console.error(err);
    }
    setConfirmModal({ isOpen: false, targetId: null });
  };

  const getCategoryConfig = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('transport') || cat.includes('car') || cat.includes('flight')) return { icon: Car, colors: isDarkMode ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-blue-100 text-blue-700 border border-blue-200' };
    if (cat.includes('energy') || cat.includes('electricity')) return { icon: Zap, colors: isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800' : 'bg-yellow-100 text-yellow-700 border border-yellow-200' };
    if (cat.includes('food') || cat.includes('diet')) return { icon: Utensils, colors: isDarkMode ? 'bg-orange-900/30 text-orange-400 border border-orange-800' : 'bg-orange-100 text-orange-700 border border-orange-200' };
    return { icon: Droplets, colors: isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Emission Factors</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage global multipliers for carbon calculations.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex space-x-3">
          <button className={`px-5 py-2.5 rounded-xl border font-medium flex items-center space-x-2 transition-all hover:scale-105 shadow-sm ${isDarkMode ? 'border-gray-700 text-slate-300 hover:bg-gray-800 hover:border-gray-600 bg-gray-800/50' : 'border-slate-200 text-slate-700 hover:bg-white bg-slate-50'}`}>
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 flex items-center space-x-2 font-medium">
            <Plus size={18} />
            <span>{isAdding ? 'Cancel' : 'Add Factor'}</span>
          </button>
        </motion.div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl shadow-sm">
          {error}
        </motion.div>
      )}

      {/* Table Container */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border overflow-visible transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.2)]' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
        
        {/* Toolbar */}
        <div className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-slate-100'}`}>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className={`relative w-full md:w-80 rounded-xl border transition-all duration-300 ${isDarkMode ? 'bg-gray-900/50 border-gray-700 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary' : 'bg-slate-50 border-slate-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white'}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by category, activity, or unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-transparent border-none focus:outline-none text-sm rounded-xl placeholder-slate-400 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-900/80 backdrop-blur-md text-slate-400 border-gray-700' : 'bg-slate-50/90 backdrop-blur-md text-slate-500 border-slate-200'} border-b uppercase text-xs font-bold tracking-wider`}>
              <tr>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Activity Type</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4">Multiplier (kg CO₂)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-slate-100'}`}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading factors...</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {isAdding && (
                    <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-green-50/30'}`}>
                      <td className="px-6 py-4 align-top"><input type="text" placeholder="Category" value={newFactor.category} onChange={e => setNewFactor({...newFactor, category: e.target.value})} className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary/20 outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-slate-200 shadow-md text-slate-900'}`} /></td>
                      <td className="px-6 py-4 align-top"><input type="text" placeholder="Activity Type" value={newFactor.activityType} onChange={e => setNewFactor({...newFactor, activityType: e.target.value})} className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary/20 outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-slate-200 shadow-md text-slate-900'}`} /></td>
                      <td className="px-6 py-4 align-top"><input type="text" placeholder="Unit" value={newFactor.unit} onChange={e => setNewFactor({...newFactor, unit: e.target.value})} className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary/20 outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-slate-200 shadow-md text-slate-900'}`} /></td>
                      <td className="px-6 py-4 align-top"><input type="number" step="0.001" placeholder="Multiplier" value={newFactor.kgCo2PerUnit} onChange={e => setNewFactor({...newFactor, kgCo2PerUnit: parseFloat(e.target.value)})} className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary/20 outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-slate-200 shadow-md text-slate-900'}`} /></td>
                      <td className="px-6 py-4 text-right align-top">
                        <button onClick={handleAddSubmit} className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold">Save</button>
                      </td>
                    </motion.tr>
                  )}

                  {currentFactors.map((factor, index) => {
                    const { icon: Icon, colors } = getCategoryConfig(factor.category);
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        key={factor.id} 
                        className={`transition-colors group ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-slate-50/80'}`}
                      >
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold space-x-2 ${colors}`}>
                            <Icon size={14} />
                            <span>{factor.category}</span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          {factor.activityType}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${isDarkMode ? 'bg-gray-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                            {factor.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold font-mono text-[15px] ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {factor.kgCo2PerUnit.toFixed(3)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2 transition-opacity">
                            <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-gray-700' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}>
                              <Edit size={18} />
                            </button>
                            <button onClick={() => setConfirmModal({ isOpen: true, targetId: factor.id })} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
          
          {!loading && filteredFactors.length === 0 && !isAdding && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-16 text-center flex flex-col items-center justify-center ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              <Leaf size={64} className="mb-4 text-emerald-500/50" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No Factors Found</h3>
              <p className="text-sm mt-2 max-w-sm">There are no emission factors matching your query. Add one to calculate carbon impact.</p>
              <button onClick={() => setIsAdding(true)} className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                Add Emission Factor
              </button>
            </motion.div>
          )}
        </div>

        {/* Pagination Footer */}
        {filteredFactors.length > 0 && (
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredFactors.length)} of {filteredFactors.length} entries
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setConfirmModal({ isOpen: false, targetId: null })}></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-100'}`}>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4 mx-auto">
                <AlertTriangle size={24} />
              </div>
              <h3 className={`text-xl font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Delete Factor</h3>
              <p className={`text-center text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Are you sure you want to delete this emission factor? This could affect past calculations.
              </p>
              <div className="flex space-x-3">
                <button onClick={() => setConfirmModal({ isOpen: false, targetId: null })} className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmModal.targetId)} className="flex-1 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all hover:-translate-y-0.5">
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

export default AdminEmissionFactors;
