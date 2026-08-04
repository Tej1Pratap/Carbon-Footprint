import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, CloudFog, TrendingUp, UserPlus, Target, Server, Database, Bell } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = ({ isDarkMode }) => {
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [timeframe, setTimeframe] = useState('weekly');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTrendData();
  }, [timeframe]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendData = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + `/api/admin/reports/analytics?timeframe=${timeframe}`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTrendData(data.trendData);
      }
    } catch (error) {
      console.error('Failed to fetch trend data:', error);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-40 bg-slate-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: '#0ea5e9', gradient: 'from-sky-500 to-blue-600' },
    { title: 'New Users (Month)', value: stats.newUsersThisMonth || 0, icon: UserPlus, color: '#8b5cf6', gradient: 'from-violet-500 to-purple-600' },
    { title: 'Total Activities', value: stats.totalActivities || 0, icon: Activity, color: '#f59e0b', gradient: 'from-amber-500 to-orange-500' },
    { title: 'Carbon Emitted', value: `${stats.totalEmissions?.toFixed(0) || 0} kg`, icon: CloudFog, color: '#ef4444', gradient: 'from-red-500 to-rose-600' },
    { title: 'Avg Emission/User', value: `${stats.averageEmissionPerUser?.toFixed(0) || 0} kg`, icon: TrendingUp, color: '#16a34a', gradient: 'from-green-500 to-emerald-600' },
    { title: 'Goals Achieved', value: stats.goalsAchieved || 0, icon: Target, color: '#06b6d4', gradient: 'from-cyan-500 to-teal-500' },
    { title: 'Badges Awarded', value: stats.badgesAwarded || 0, icon: Server, color: '#ec4899', gradient: 'from-pink-500 to-rose-500' },
    { title: 'Active Today', value: stats.activeUsersToday || 0, icon: UserPlus, color: '#64748b', gradient: 'from-slate-500 to-slate-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Dashboard Overview</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monitor platform health, user growth, and environmental impact.</p>
        </motion.div>
      </div>
      
      {/* Premium Summary Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              key={index} 
              className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-xl shadow-black/20' : 'bg-white border border-slate-100 shadow-lg shadow-slate-200/50'}`}
            >
              <div className="flex justify-between items-center h-full">
                <div>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.title}</p>
                  <h3 className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stat.value}</h3>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg text-white`}>
                  <Icon size={28} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Chart Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`col-span-2 p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.2)]' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Emissions Trend</h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total carbon emissions logged over time.</p>
            </div>
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className={`text-sm rounded-xl px-4 py-2 border outline-none font-medium transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-primary' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
            >
              <option value="daily">Today</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
              <option value="quarterly">Last 90 Days</option>
              <option value="yearly">This Year</option>
            </select>
          </div>
          <div className="h-80 w-full">
            {trendData?.length === 0 || trendData?.every(day => day.emissions === 0) ? (
              <div className={`h-full flex flex-col items-center justify-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <CloudFog size={48} className="mb-4 opacity-20" />
                <p>No activity logged in this timeframe.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }} 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                      borderRadius: '16px', 
                      border: isDarkMode ? '1px solid #1e293b' : '1px solid #f1f5f9',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      padding: '12px 16px'
                    }} 
                    itemStyle={{ color: '#16a34a', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="emissions" fill="url(#colorEmissions)" radius={[6, 6, 6, 6]} barSize={32} />
                  <defs>
                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#16a34a" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className={`p-6 rounded-2xl border flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.2)]' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Recent Alerts</h2>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
              <Bell size={18} />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
            <img src="https://illustrations.popsy.co/amber/digital-nomad.svg" alt="Empty state" className="w-40 h-40 opacity-70" />
            <p className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>All Systems Operational</p>
            <p className={`text-sm px-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>No recent alerts or warnings. System health is optimal.</p>
            <button className="mt-4 px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
              View Logs
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
