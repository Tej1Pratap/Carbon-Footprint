import React, { useEffect, useState } from 'react';
import { Car, Zap, Utensils, ShoppingBag, PlusCircle, Search, Calendar, FilterX, Activity, Inbox } from 'lucide-react';

const ActivityHistory = () => {
  const [logs, setLogs] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/activity/logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setLogs(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchLogs();
  }, []);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Transport': return <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Car size={20} /></div>;
      case 'Electricity': return <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600"><Zap size={20} /></div>;
      case 'Food': return <div className="bg-orange-100 p-2 rounded-xl text-orange-600"><Utensils size={20} /></div>;
      case 'Shopping': return <div className="bg-purple-100 p-2 rounded-xl text-purple-600"><ShoppingBag size={20} /></div>;
      default: return <div className="bg-slate-100 p-2 rounded-xl text-slate-600"><PlusCircle size={20} /></div>;
    }
  };

  const filteredLogs = logs.filter(log => {
    const logDateStr = log.logDate ? log.logDate.substring(0, 10) : '';
    const matchesStart = startDate ? logDateStr >= startDate : true;
    const matchesEnd = endDate ? logDateStr <= endDate : true;
    const matchesCategory = searchCategory 
      ? log.category.toLowerCase().includes(searchCategory.toLowerCase())
      : true;
    return matchesStart && matchesEnd && matchesCategory;
  }).sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());

  const totalFilteredEmissions = filteredLogs.reduce((sum, log) => sum + log.emissionsKgCo2, 0);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      {/* Header & Filters Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Activity className="text-green-500" size={28} /> Activity History
          </h2>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Category Search Pill */}
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search category..." 
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm font-medium text-slate-700"
              />
            </div>

            {/* Date Range Pill */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex-grow sm:flex-grow-0">
              <Calendar className="text-slate-400" size={18} />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-slate-600 text-sm font-medium w-full sm:w-auto"
              />
              <span className="text-slate-300">-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-slate-600 text-sm font-medium w-full sm:w-auto"
              />
            </div>

            {/* Clear Filters Button */}
            {(startDate || endDate || searchCategory) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); setSearchCategory(''); }}
                className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 text-sm font-bold"
              >
                <FilterX size={18} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="bg-slate-50 p-4 rounded-full text-slate-400 mb-4">
               <Inbox size={48} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No Activities Found</h3>
            <p className="text-slate-500">
              {startDate || endDate || searchCategory 
                ? "Try adjusting your filters to see more results." 
                : "You haven't logged any carbon emissions yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Activity Details</th>
                  <th className="px-6 py-5">Date Logged</th>
                  <th className="px-6 py-5 text-right">Emissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-green-50/50 transition-colors group cursor-default">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {getCategoryIcon(log.category)}
                        <span className="font-bold text-slate-700 group-hover:text-green-700 transition-colors">{log.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-bold">{log.activityType}</div>
                      <div className="text-sm font-medium text-slate-500">{log.quantity} {log.unit}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 font-medium">
                        {new Date(log.logDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-block bg-red-50 border border-red-100 text-red-600 font-extrabold px-3 py-1.5 rounded-lg group-hover:scale-110 group-hover:bg-red-100 transition-all">
                        +{log.emissionsKgCo2.toFixed(2)} kg
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {(searchCategory || startDate || endDate) && (
                <tfoot>
                  <tr className="bg-green-50 border-t-2 border-green-100">
                    <td colSpan="3" className="px-6 py-5 font-bold text-right text-green-800">
                      Total Emissions for Filtered Range:
                    </td>
                    <td className="px-6 py-5 font-black text-green-700 text-right text-xl">
                      {totalFilteredEmissions.toFixed(2)} kg
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityHistory;
