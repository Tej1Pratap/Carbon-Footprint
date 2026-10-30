import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Building2, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const CorporateLeaderboard = ({ isDarkMode }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/corporate/analytics/departments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Sort ascending (lowest emissions is best for sustainability)
          const sorted = data.sort((a, b) => a.emissions - b.emissions);
          setDepartments(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Department Leaderboard</h1>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
          Rankings based on the lowest carbon footprint across your organization.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : departments.length === 0 ? (
        <div className={`flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-slate-50/50 border-slate-300 text-slate-500'}`}>
          <Trophy size={48} className="mb-4 opacity-50 text-yellow-500" />
          <h3 className="text-lg font-bold mb-2">No Data Available</h3>
          <p className="text-sm">Departments need to log activities to appear here.</p>
        </div>
      ) : (
        <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-200 shadow-md'}`}>
          {departments.map((dept, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={dept.name}
              className={`flex items-center p-4 sm:p-6 transition-colors border-b last:border-b-0 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-slate-100 hover:bg-slate-50'}`}
            >
              <div className="flex-shrink-0 w-12 text-center">
                {index === 0 ? <Trophy size={28} className="text-yellow-500 mx-auto" /> :
                 index === 1 ? <Medal size={28} className="text-slate-400 mx-auto" /> :
                 index === 2 ? <Medal size={28} className="text-amber-600 mx-auto" /> :
                 <span className={`text-xl font-bold ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>#{index + 1}</span>}
              </div>
              
              <div className="ml-4 flex-1">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{dept.name}</h3>
                <div className={`text-sm flex items-center ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  <Building2 size={14} className="mr-1" />
                  Department
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-xl font-extrabold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {dept.emissions.toFixed(1)} <span className="text-sm font-normal">kg CO₂</span>
                </div>
                {index === 0 && (
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full mt-1 inline-block">
                    Top Performer
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CorporateLeaderboard;
