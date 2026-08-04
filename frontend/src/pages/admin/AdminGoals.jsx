import React, { useEffect, useState } from 'react';
import { Target, Users, Search, Activity, CheckCircle2, AlertCircle, BarChart2, TrendingDown } from 'lucide-react';

const AdminGoals = ({ isDarkMode }) => {
  const [goals, setGoals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/goals', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (response.ok) {
        setGoals(await response.json());
      }
    } catch (error) {
      console.error('Error fetching admin goals', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGoals = goals.filter(g => 
    g.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeGoals = goals.filter(g => g.status === 'IN_PROGRESS').length;
  const achievedGoals = goals.filter(g => g.status === 'ACHIEVED').length;
  const failedGoals = goals.filter(g => g.status === 'FAILED').length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Platform Goals</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monitor and track sustainability goals across all users.</p>
        </div>
        <div className={`flex items-center px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
          <Search size={18} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search goals or users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-slate-500 text-sm font-semibold mb-1">Total Goals</p>
          <div className="flex items-center justify-between">
            <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{goals.length}</h3>
            <Target size={24} className="text-blue-500" />
          </div>
        </div>
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-slate-500 text-sm font-semibold mb-1">Active (In Progress)</p>
          <div className="flex items-center justify-between">
            <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{activeGoals}</h3>
            <Activity size={24} className="text-purple-500" />
          </div>
        </div>
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-slate-500 text-sm font-semibold mb-1">Successfully Achieved</p>
          <div className="flex items-center justify-between">
            <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{achievedGoals}</h3>
            <CheckCircle2 size={24} className="text-green-500" />
          </div>
        </div>
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-slate-500 text-sm font-semibold mb-1">Failed to Meet</p>
          <div className="flex items-center justify-between">
            <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{failedGoals}</h3>
            <AlertCircle size={24} className="text-red-500" />
          </div>
        </div>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${isDarkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-slate-50 text-slate-500'} text-xs uppercase tracking-wider font-semibold border-b ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Goal Description</th>
                <th className="px-6 py-4">Reduction Target</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Progress Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-700 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading goals...</td>
                </tr>
              ) : filteredGoals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No goals found.</td>
                </tr>
              ) : (
                filteredGoals.map(goal => {
                  let statusColor = "bg-slate-100 text-slate-600";
                  if (goal.projectedStatus === 'ACHIEVED' || goal.status === 'ACHIEVED') statusColor = "bg-green-100 text-green-700 border-green-200";
                  else if (goal.projectedStatus === 'FAILED' || goal.status === 'FAILED') statusColor = "bg-red-100 text-red-700 border-red-200";
                  else if (goal.projectedStatus === 'AT_RISK') statusColor = "bg-orange-100 text-orange-700 border-orange-200";
                  else if (goal.projectedStatus === 'ON_TRACK') statusColor = "bg-blue-100 text-blue-700 border-blue-200";

                  const displayStatus = (goal.status === 'IN_PROGRESS' && goal.projectedStatus) ? goal.projectedStatus : goal.status;

                  return (
                    <tr key={goal.id} className={`hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {goal.username?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{goal.username}</p>
                            <p className="text-xs text-slate-500">{goal.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{goal.description}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                          <TrendingDown size={14} className="text-green-500"/>
                          {goal.targetReductionPercentage}%
                        </span>
                        <span className="text-xs text-slate-500 block">in {goal.periodDays} days</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider border ${statusColor}`}>
                          {displayStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 w-48">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-slate-600">{goal.currentEmissions?.toFixed(1) || 0} kg</span>
                          <span className="text-slate-400">{goal.targetKgCo2?.toFixed(1) || 0} max</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${goal.projectedStatus === 'AT_RISK' || goal.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, goal.progressPercentage || 0)}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminGoals;
