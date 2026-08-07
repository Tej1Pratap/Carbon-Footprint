import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart as RechartsBarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, Calendar, Filter, FileText, CloudFog, Users, Activity, ChevronDown, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminReports = ({ isDarkMode }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('weekly');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + `/api/admin/reports/analytics?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type) => {
    if (!analytics) return;

    if (type === 'CSV') {
      const csvRows = [];
      csvRows.push(['Category', 'Emissions (kg CO2)']);
      if (analytics.categoryData) {
        analytics.categoryData.forEach(d => csvRows.push([d.name, d.value]));
      }
      
      csvRows.push([]);
      csvRows.push(['Trend Name', 'Emissions (kg CO2)']);
      if (analytics.trendData) {
        analytics.trendData.forEach(d => csvRows.push([d.name, d.emissions]));
      }
      
      csvRows.push([]);
      csvRows.push(['Week', 'New Users']);
      if (analytics.userGrowthData) {
        analytics.userGrowthData.forEach(d => csvRows.push([d.week, d.users]));
      }

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `CarbonFootprint_AdminReport_${timeframe}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } 
    else if (type === 'PDF') {
      try {
        const doc = new jsPDF();
        doc.text(`Carbon Footprint Admin Report (${timeframe})`, 14, 15);
        
        doc.text('Emissions by Category', 14, 25);
        const categoryBody = analytics.categoryData ? analytics.categoryData.map(d => [d.name, d.value.toFixed(2) + ' kg']) : [];
        autoTable(doc, { startY: 30, head: [['Category', 'Emissions']], body: categoryBody });
        
        doc.text('Total Emissions Trend', 14, doc.lastAutoTable.finalY + 10);
        const trendBody = analytics.trendData ? analytics.trendData.map(d => [d.name, d.emissions.toFixed(2) + ' kg']) : [];
        autoTable(doc, { startY: doc.lastAutoTable.finalY + 15, head: [['Time', 'Emissions']], body: trendBody });
        
        doc.text('User Growth', 14, doc.lastAutoTable.finalY + 10);
        const userBody = analytics.userGrowthData ? analytics.userGrowthData.map(d => [d.week, d.users]) : [];
        autoTable(doc, { startY: doc.lastAutoTable.finalY + 15, head: [['Time', 'New Users']], body: userBody });
        
        doc.save(`CarbonFootprint_AdminReport_${timeframe}.pdf`);
      } catch (err) {
        console.error("PDF Export failed:", err);
        alert("Failed to generate PDF.");
      }
    }
  };

  // Safe fallback values
  const totalEmissions = analytics?.trendData?.reduce((acc, d) => acc + (d.emissions || 0), 0) || 0;
  const totalUsers = analytics?.userGrowthData?.reduce((acc, d) => acc + (d.users || 0), 0) || 0;
  const categoryWithHighest = analytics?.categoryData?.sort((a, b) => b.value - a.value)?.[0]?.name || 'N/A';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reports & Analytics</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Visualize platform-wide carbon tracking trends and user growth.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-3">
          <div className="relative">
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm font-medium border transition-colors outline-none cursor-pointer ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-slate-300 hover:border-primary/50' : 'bg-white border-slate-200 text-slate-700 hover:border-primary/50 hover:bg-slate-50'
              }`}
            >
              <option value="daily">Today</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 4 Weeks</option>
              <option value="yearly">Last 12 Months</option>
            </select>
            <ChevronDown size={16} className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          </div>
          <button 
            onClick={() => handleExport('PDF')}
            className={`px-4 py-2.5 rounded-xl border font-medium flex items-center space-x-2 transition-all hover:scale-105 shadow-sm ${isDarkMode ? 'border-gray-700 text-slate-300 hover:bg-gray-800 hover:border-gray-600 bg-gray-800/50' : 'border-slate-200 text-slate-700 hover:bg-white bg-slate-50'}`}
          >
            <FileText size={18} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button 
            onClick={() => handleExport('CSV')}
            className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 flex items-center space-x-2 font-medium"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </motion.div>
      </div>

      {error && !analytics && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchAnalytics} className="flex items-center space-x-1 text-sm font-medium hover:underline">
            <RefreshCw size={14} /> <span>Retry</span>
          </button>
        </motion.div>
      )}

      {/* Summary Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-lg shadow-black/20' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Period Emissions</p>
              <h3 className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {loading ? <div className="h-8 w-24 bg-slate-200 dark:bg-gray-700 rounded animate-pulse"></div> : `${totalEmissions.toLocaleString(undefined, {maximumFractionDigits: 1})} kg`}
              </h3>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 text-white`}>
              <CloudFog size={24} />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 opacity-5 blur-3xl"></div>
        </div>

        <div className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-lg shadow-black/20' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>New Users (Period)</p>
              <h3 className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {loading ? <div className="h-8 w-16 bg-slate-200 dark:bg-gray-700 rounded animate-pulse"></div> : totalUsers}
              </h3>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 text-white`}>
              <Users size={24} />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5 blur-3xl"></div>
        </div>

        <div className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-lg shadow-black/20' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Top Emission Source</p>
              <h3 className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {loading ? <div className="h-8 w-24 bg-slate-200 dark:bg-gray-700 rounded animate-pulse"></div> : categoryWithHighest}
              </h3>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30 text-white`}>
              <Activity size={24} />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-red-500 opacity-5 blur-3xl"></div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emissions Trend Chart */}
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.2)]' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Total Emissions Trend</h3>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse flex space-x-2">
                  <div className="w-3 h-16 bg-primary/20 rounded-full"></div>
                  <div className="w-3 h-24 bg-primary/40 rounded-full"></div>
                  <div className="w-3 h-32 bg-primary/60 rounded-full"></div>
                  <div className="w-3 h-20 bg-primary/30 rounded-full"></div>
                </div>
              </div>
            ) : (!analytics?.trendData?.length || analytics.trendData.every(d => d.emissions === 0)) ? (
              <div className={`w-full h-full flex flex-col items-center justify-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <CloudFog size={48} className="mb-4 opacity-20" />
                <p>No emissions data available for this period.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                  <RechartsTooltip 
                    cursor={{ stroke: isDarkMode ? '#334155' : '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }}
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                      borderRadius: '16px', 
                      border: isDarkMode ? '1px solid #1e293b' : '1px solid #f1f5f9',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      padding: '12px 16px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    name="Emissions (kg CO₂)"
                    dataKey="emissions" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.2)]' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>User Growth</h3>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse flex space-x-2">
                  <div className="w-8 h-12 bg-blue-500/20 rounded-t-sm"></div>
                  <div className="w-8 h-20 bg-blue-500/40 rounded-t-sm"></div>
                  <div className="w-8 h-32 bg-blue-500/60 rounded-t-sm"></div>
                </div>
              </div>
            ) : (!analytics?.userGrowthData?.length || analytics.userGrowthData.every(d => d.users === 0)) ? (
              <div className={`w-full h-full flex flex-col items-center justify-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <Users size={48} className="mb-4 opacity-20" />
                <p>No new users registered in this period.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={analytics.userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                  <RechartsTooltip 
                    cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                      borderRadius: '16px', 
                      border: isDarkMode ? '1px solid #1e293b' : '1px solid #f1f5f9',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '12px 16px'
                    }}
                  />
                  <Bar 
                    name="New Users"
                    dataKey="users" 
                    fill="url(#colorUsers)" 
                    radius={[6, 6, 6, 6]} 
                    barSize={40}
                  />
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </RechartsBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Emissions by Category Pie Chart */}
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.2)]' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'} lg:col-span-2`}>
          <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Emissions Breakdown by Category</h3>
          <div className="h-[320px] w-full flex items-center justify-center">
            {loading ? (
              <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            ) : analytics?.categoryData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={6}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    stroke="none"
                  >
                    {analytics.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                      borderRadius: '16px', 
                      border: isDarkMode ? '1px solid #1e293b' : '1px solid #f1f5f9',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '12px 16px'
                    }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={`flex flex-col items-center justify-center text-center max-w-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <img src="https://illustrations.popsy.co/amber/keynote-presentation.svg" alt="No data" className="w-40 h-40 opacity-70 grayscale mb-4" />
                <p className="font-medium text-slate-700 dark:text-slate-300">No Category Data Available</p>
                <p className="text-sm mt-1">There are no activity logs in the selected timeframe to generate this breakdown.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminReports;
