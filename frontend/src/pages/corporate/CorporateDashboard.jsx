import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar } from 'recharts';
import { BarChart as BarIcon, TrendingDown, Users, Activity, Leaf, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const StatCard = ({ title, value, icon, trend, suffix = "", isDarkMode }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-6 rounded-3xl border transition-all hover:shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20 hover:shadow-blue-900/10' : 'bg-white border-slate-200 shadow-md hover:shadow-blue-500/5'}`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{title}</p>
        <h3 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          {value}{suffix}
        </h3>
        {trend !== undefined && (
          <p className={`text-sm mt-2 font-medium flex items-center ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            <TrendingDown size={16} className={`mr-1 ${trend < 0 && 'rotate-180'}`} />
            {Math.abs(trend).toFixed(1)}% {trend >= 0 ? 'decrease' : 'increase'} this month
          </p>
        )}
      </div>
      <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const CorporateDashboard = ({ isDarkMode }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [deptData, setDeptData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` };
        const [dashRes, deptRes] = await Promise.all([
          fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/corporate/analytics/dashboard', { headers }),
          fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/corporate/analytics/departments', { headers })
        ]);
        
        if (dashRes.ok) {
          const json = await dashRes.json();
          if (json.categoryBreakdown) {
            json.pieData = Object.keys(json.categoryBreakdown).map(k => ({
              name: k,
              value: json.categoryBreakdown[k]
            }));
          }
          setData(json);
        }
        
        if (deptRes.ok) {
          setDeptData(await deptRes.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div>Failed to load dashboard data.</div>;

  const { kpis, monthlyTrend, pieData } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Corporate Dashboard</h1>
        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
          Overview of your organization's sustainability performance based on employee activities.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Organization Emissions" 
          value={kpis.totalEmissions.toLocaleString(undefined, {maximumFractionDigits:1})} 
          suffix=" kg" 
          icon={<Activity size={24} />} 
          isDarkMode={isDarkMode} 
        />
        <StatCard 
          title="This Month" 
          value={kpis.thisMonthEmissions.toLocaleString(undefined, {maximumFractionDigits:1})} 
          suffix=" kg" 
          trend={kpis.reductionPercent}
          icon={<BarIcon size={24} />} 
          isDarkMode={isDarkMode} 
        />
        <StatCard 
          title="Avg. per Employee" 
          value={kpis.co2PerEmployee.toLocaleString(undefined, {maximumFractionDigits:1})} 
          suffix=" kg" 
          icon={<Leaf size={24} />} 
          isDarkMode={isDarkMode} 
        />
        <StatCard 
          title="Total Employees Linked" 
          value={kpis.totalEmployees} 
          icon={<Users size={24} />} 
          isDarkMode={isDarkMode} 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-200 shadow-md'}`}>
          <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Monthly Emissions Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#e2e8f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9ca3af' : '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9ca3af' : '#64748b', fontSize: 12 }} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', 
                    borderRadius: '12px', 
                    border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: isDarkMode ? '#e5e7eb' : '#1e293b', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="emissions" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-200 shadow-md'}`}>
          <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Emissions by Category</h3>
          <div className="h-64 relative">
            {pieData && pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => `${value.toFixed(1)} kg`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">No data available</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData && pieData.map((entry, index) => (
              <div key={index} className="flex items-center text-xs">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className={`truncate ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Comparison */}
      {deptData && deptData.length > 0 && (
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-200 shadow-md'}`}>
          <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Department Comparison (Total CO₂)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={deptData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#e2e8f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9ca3af' : '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9ca3af' : '#64748b', fontSize: 12 }} dx={-10} />
                <RechartsTooltip 
                  cursor={{ fill: isDarkMode ? '#374151' : '#f8fafc' }}
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', 
                    borderRadius: '12px', 
                    border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => `${value.toFixed(1)} kg`}
                />
                <Bar dataKey="emissions" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40}>
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateDashboard;
