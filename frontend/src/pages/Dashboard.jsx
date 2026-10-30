import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Activity, Leaf, Calendar, Target, PlusCircle, PieChart as PieChartIcon, Trophy, Download } from 'lucide-react';

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('weekly');
  const [categoryTimeframe, setCategoryTimeframe] = useState('all'); 
  const [hiddenLines, setHiddenLines] = useState({ current: false, last: false, emissions: false });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + `/api/dashboard/overview?timeframe=${timeframe}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        } else if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError(`Dashboard failed to load. Status: ${res.status}`);
        }
      } catch (err) {
        setError("Unable to connect to the backend server. Please check if the server is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeframe]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 50) return '#eab308';
    return '#ef4444';
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-64 mt-12">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 text-center font-medium bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto mt-12">{error}</div>;
  }

  if (!data) return null;

  const handleLegendClick = (e) => {
    setHiddenLines(prev => ({
      ...prev,
      [e.dataKey]: !prev[e.dataKey]
    }));
  };

  const renderLegendText = (value, entry) => {
    const isHidden = hiddenLines[entry.dataKey];
    return <span style={{ color: isHidden ? '#cbd5e1' : '#64748b', textDecoration: isHidden ? 'line-through' : 'none', transition: 'all 0.2s' }}>{value}</span>;
  };

  const scoreColor = getScoreColor(data.carbonScore);
  const monthlyGoal = data.activeGoal?.targetKgCo2 || 300; 
  const progressPercentage = Math.min(100, (data.monthlyEmissions / monthlyGoal) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-slate-800 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-slate-500 font-medium mb-1">{getGreeting()},</p>
          <h1 className="text-3xl font-extrabold tracking-tight">{data.user?.username || 'User'}</h1>
        </div>
        <div className="text-slate-500 font-semibold bg-white px-4 py-2 rounded-xl shadow-md border border-slate-200">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 flex items-center justify-between shadow-md border border-slate-200 hover:shadow-lg transition-all">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-500 shrink-0">
            <Activity size={32} />
          </div>
          <div className="flex flex-col items-end text-right w-full">
            <span className="text-slate-500 text-sm font-semibold mb-1">Today's Footprint</span>
            <span className="text-3xl font-extrabold text-slate-800 leading-none">
              {data.todayEmissions.toFixed(1)} <span className="text-base font-medium text-slate-500 ml-1">kg</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 flex items-center justify-between shadow-md border border-slate-200 hover:shadow-lg transition-all">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-green-50 text-green-500 shrink-0">
            <Leaf size={32} />
          </div>
          <div className="flex flex-col items-end text-right w-full">
            <span className="text-slate-500 text-sm font-semibold mb-1">Total Emission</span>
            <span className="text-3xl font-extrabold text-slate-800 leading-none">
              {data.totalEmissions.toFixed(1)} <span className="text-base font-medium text-slate-500 ml-1">kg</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 flex items-center justify-between shadow-md border border-slate-200 hover:shadow-lg transition-all">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-500 shrink-0">
            <Calendar size={32} />
          </div>
          <div className="flex flex-col items-end text-right w-full">
            <span className="text-slate-500 text-sm font-semibold mb-1">Monthly Emission</span>
            <span className="text-3xl font-extrabold text-slate-800 leading-none">
              {data.monthlyEmissions.toFixed(1)} <span className="text-base font-medium text-slate-500 ml-1">kg</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 flex items-center justify-between shadow-md border border-slate-200 hover:shadow-lg transition-all" style={{ borderLeft: `6px solid ${scoreColor}` }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-50 shrink-0" style={{ color: scoreColor }}>
            <Target size={32} />
          </div>
          <div className="flex flex-col items-end text-right w-full">
            <span className="text-slate-500 text-sm font-semibold mb-1">Carbon Score</span>
            <span className="text-3xl font-extrabold leading-none mt-1" style={{ color: scoreColor }}>
              {data.carbonScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Multi-Line Trend Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Weekly Trend</h3>
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <option value="daily">Today (Hourly)</option>
              <option value="weekly">This vs Last Week</option>
              <option value="monthly">Monthly Progress</option>
              <option value="yearly">Yearly Overview</option>
            </select>
          </div>
          
          <div className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px 20px', fontWeight: 600 }}
                  cursor={{ stroke: '#f1f5f9', strokeWidth: 32, strokeOpacity: 0.5 }}
                />
                
                {timeframe === 'weekly' ? (
                  <>
                    <Line type="monotone" name="This Week" dataKey="current" hide={hiddenLines.current} stroke="#22c55e" strokeWidth={4} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6, strokeWidth: 0}} />
                    <Line type="monotone" name="Last Week" dataKey="last" hide={hiddenLines.last} stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" dot={{r: 3}} activeDot={{r: 5}} />
                    <Legend onClick={handleLegendClick} formatter={renderLegendText} verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ cursor: 'pointer', fontSize: '13px', fontWeight: 500 }} />
                  </>
                ) : (
                  <>
                    <Line type="monotone" name="Emissions" dataKey="emissions" hide={hiddenLines.emissions} stroke="#22c55e" strokeWidth={4} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6, strokeWidth: 0}} />
                    <Legend onClick={handleLegendClick} formatter={renderLegendText} verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ cursor: 'pointer', fontSize: '13px', fontWeight: 500 }} />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-slate-800">Breakdown</h3>
            <div className="bg-slate-100 p-1 rounded-xl flex shadow-inner">
              <button 
                onClick={() => setCategoryTimeframe('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${categoryTimeframe === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                All Time
              </button>
              <button 
                onClick={() => setCategoryTimeframe('today')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${categoryTimeframe === 'today' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Today
              </button>
            </div>
          </div>
          
          {(() => {
            const chartData = categoryTimeframe === 'today' ? data.todayCategoryBreakdown : data.categoryBreakdown;
            if (!chartData || chartData.length === 0) {
              return <p className="text-slate-400 text-sm font-medium text-center my-auto flex-1 flex items-center justify-center">No emission data for {categoryTimeframe === 'today' ? 'today' : 'this period'}.</p>;
            }
            return (
              <div className="flex flex-col flex-1 mt-4">
                <div className="h-48 mb-6 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={6}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `${value.toFixed(1)} kg`} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 600}} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold text-slate-800">{chartData.reduce((sum, item) => sum + item.value, 0).toFixed(0)}</span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">kg CO₂</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  {chartData.map((entry, idx) => (
                    <div key={idx} className="flex items-center text-sm font-medium bg-slate-50 py-2 px-3 rounded-xl border border-slate-100">
                      <div className="w-3 h-3 rounded-full mr-2 shrink-0 shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-slate-700 truncate mr-auto">{entry.name}</span>
                      <span className="text-slate-400 text-xs ml-2">{Math.round((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Row 3: Monthly Progress & Extras */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Cumulative Progress Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 lg:col-span-2 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Monthly Progress</h3>
            <button onClick={() => navigate('/goals')} className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              Manage Goal
            </button>
          </div>
          
          <div className="mb-4 flex justify-between items-end">
            <div>
              <p className="text-3xl font-extrabold text-slate-800 leading-none mb-1">{data.monthlyEmissions.toFixed(1)} <span className="text-lg text-slate-400 font-semibold">kg</span></p>
              <p className="text-sm font-medium text-slate-500">Consumed this month</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-400 leading-none mb-1">{monthlyGoal} <span className="text-sm">kg</span></p>
              <p className="text-sm font-medium text-slate-500">Monthly Target</p>
            </div>
          </div>
          
          <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${progressPercentage > 100 ? 'bg-red-500' : progressPercentage > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            ></div>
          </div>
          {progressPercentage > 100 && (
            <p className="text-red-500 text-sm font-medium mt-3 flex items-center">
              <Activity size={16} className="mr-1.5" /> You have exceeded your monthly target by {(data.monthlyEmissions - monthlyGoal).toFixed(1)} kg.
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4 h-[calc(100%-3rem)]">
            <button onClick={() => navigate('/activity')} className="flex flex-col items-center justify-center p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all group">
              <PlusCircle size={28} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">Log Activity</span>
            </button>
            <button onClick={() => navigate('/analytics')} className="flex flex-col items-center justify-center p-4 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all group">
              <PieChartIcon size={28} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">Analytics</span>
            </button>
            <button onClick={() => navigate('/leaderboard')} className="flex flex-col items-center justify-center p-4 bg-amber-50 border border-amber-100 text-amber-600 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all group">
              <Trophy size={28} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">Leaderboard</span>
            </button>
            <button onClick={() => alert("Report generation will be available in the next release!")} className="flex flex-col items-center justify-center p-4 bg-purple-50 border border-purple-100 text-purple-600 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all group">
              <Download size={28} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">Export</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
