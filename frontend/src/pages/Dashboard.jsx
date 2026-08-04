import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('weekly');
  const [categoryTimeframe, setCategoryTimeframe] = useState('all'); // 'all' or 'today'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('token');
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + `/api/dashboard/overview?timeframe=${timeframe}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        } else if (res.status === 401 || res.status === 403) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          navigate('/login');
        } else {
          setError(`Dashboard failed to load. Status: ${res.status}`);
          console.error("Dashboard failed to load. Status: " + res.status);
        }
      } catch (err) {
        setError("Unable to connect to the backend server. Please check if the server is running.");
        console.error(err);
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
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}><div className="loader">Loading Dashboard...</div></div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: '#ef4444', textAlign: 'center' }}><strong>Error:</strong> {error}</div>;
  }

  if (!data) return <div>Error loading dashboard data.</div>;

  const scoreColor = getScoreColor(data.carbonScore);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#334155' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ color: '#64748b', margin: '0 0 5px 0', fontSize: '1.1rem' }}>{getGreeting()},</p>
          <h1 style={{ margin: 0, color: '#1e293b' }}>{data.user?.username || 'User'}</h1>
        </div>
        <div style={{ color: '#64748b', fontWeight: '500' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Row 1: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-3xl p-6 flex items-center justify-between shadow-sm border border-slate-100">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#e6f8ec] text-[#22c55e] text-3xl shrink-0">
            <i className="fas fa-cloud"></i>
          </div>
          <div className="flex flex-col items-center text-center w-full">
            <span className="text-slate-500 text-sm font-medium leading-tight mb-2">Total<br/>Emission</span>
            <span className="text-3xl font-bold text-slate-800 leading-none">
              {data.totalEmissions.toFixed(1)} <span className="text-base font-medium text-slate-500 ml-1">kg</span>
            </span>
            <span className="text-slate-400 text-xs mt-1">CO₂e</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 flex items-center justify-between shadow-sm border border-slate-100">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#fff4db] text-[#f59e0b] text-3xl shrink-0">
            <i className="fas fa-sun"></i>
          </div>
          <div className="flex flex-col items-center text-center w-full">
            <span className="text-slate-500 text-sm font-medium leading-tight mb-2">Today's<br/>Emission</span>
            <span className="text-3xl font-bold text-slate-800 leading-none">
              {data.todayEmissions.toFixed(1)} <span className="text-base font-medium text-slate-500 ml-1">kg</span>
            </span>
            <span className="text-slate-400 text-xs mt-1">CO₂e</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 flex items-center justify-between shadow-sm border border-slate-100">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#eef2ff] text-[#6366f1] text-3xl shrink-0">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="flex flex-col items-center text-center w-full">
            <span className="text-slate-500 text-sm font-medium leading-tight mb-2">Monthly<br/>Emission</span>
            <span className="text-3xl font-bold text-slate-800 leading-none">
              {data.monthlyEmissions.toFixed(1)} <span className="text-base font-medium text-slate-500 ml-1">kg</span>
            </span>
            <span className="text-slate-400 text-xs mt-1">CO₂e</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 flex items-center justify-between shadow-sm border border-slate-100" style={{ borderLeft: `8px solid ${scoreColor}` }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-50 text-2xl shrink-0" style={{ color: scoreColor }}>
            <i className="fas fa-leaf"></i>
          </div>
          <div className="flex flex-col items-center text-center w-full">
            <span className="text-slate-500 text-sm font-medium leading-tight mb-2">Carbon Score</span>
            <span className="text-3xl font-bold leading-none mt-2" style={{ color: scoreColor }}>
              {data.carbonScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Emission Trend */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 m-0">Emission Trend</h3>
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-sm text-slate-600 bg-slate-50"
            >
              <option value="daily">Today</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 4 Weeks</option>
              <option value="yearly">Last 12 Months</option>
            </select>
          </div>
          {data.trendData?.every(day => day.emissions === 0) ? (
            <div className="h-72 flex items-center justify-center text-slate-400">
              No activity logged in this timeframe.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  <Line type="monotone" dataKey="emissions" stroke="#22c55e" strokeWidth={3} dot={{r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 m-0">Category Breakdown</h3>
            <div className="bg-slate-100 p-1 rounded-lg flex">
              <button 
                onClick={() => setCategoryTimeframe('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${categoryTimeframe === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                All Time
              </button>
              <button 
                onClick={() => setCategoryTimeframe('today')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${categoryTimeframe === 'today' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Today
              </button>
            </div>
          </div>
          
          {(() => {
            const chartData = categoryTimeframe === 'today' ? data.todayCategoryBreakdown : data.categoryBreakdown;
            if (!chartData || chartData.length === 0) {
              return <p className="text-slate-400 text-center mt-10">No emission data for {categoryTimeframe === 'today' ? 'today' : 'this period'}.</p>;
            }
            return (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `${value.toFixed(1)} kg`} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                  {chartData.map((entry, idx) => (
                    <div key={idx} className="flex items-center text-xs text-slate-500 font-medium">
                      <div className="w-2.5 h-2.5 rounded-full mr-1.5 flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      {entry.name} <span className="ml-1 text-slate-400">({entry.value.toFixed(1)} kg)</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Row 3: Data Tables & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Recent Activities</h3>
            <button onClick={() => navigate('/history')} className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center transition-colors">
              View All <i className="fas fa-chevron-right ml-1 text-xs"></i>
            </button>
          </div>
          
          {data.recentActivity.length === 0 ? (
            <p className="text-slate-400 text-sm flex-1 flex items-center justify-center">No recent activity found.</p>
          ) : (
            <div className="space-y-4 flex-1">
              {data.recentActivity.slice(0, 4).map(log => {
                let icon = 'fas fa-leaf';
                let bg = 'bg-slate-100';
                let text = 'text-slate-500';
                const cat = (log.category || '').toLowerCase();
                if (cat.includes('electricity') || cat.includes('energy')) { icon = 'fas fa-bolt'; bg = 'bg-amber-50'; text = 'text-amber-500'; }
                else if (cat.includes('transport') || cat.includes('travel')) { icon = 'fas fa-car'; bg = 'bg-green-50'; text = 'text-green-600'; }
                else if (cat.includes('food') || cat.includes('diet')) { icon = 'fas fa-utensils'; bg = 'bg-purple-50'; text = 'text-purple-500'; }
                else if (cat.includes('shopping')) { icon = 'fas fa-shopping-bag'; bg = 'bg-blue-50'; text = 'text-blue-500'; }
                else if (cat.includes('waste')) { icon = 'fas fa-trash'; bg = 'bg-red-50'; text = 'text-red-500'; }
                
                return (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg} ${text} mr-4`}>
                        <i className={`${icon} text-lg`}></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-[15px]">{log.activityType}</span>
                        <span className="text-[13px] text-slate-500 mt-0.5 capitalize">{cat || 'Entry'} • {new Date(log.logDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-right">
                      <span className="font-semibold text-slate-800 text-[15px]">{log.emissionsKgCo2.toFixed(1)} <span className="text-[13px] font-normal text-slate-500 ml-0.5">kg</span></span>
                      <span className="text-[12px] text-slate-400 mt-0.5">CO₂e</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leaderboard Preview */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4"><i className="fas fa-trophy text-amber-400 mr-2"></i> Leaderboard</h3>
          <div className="space-y-3">
            {data.leaderboard.slice(0, 4).map((u, idx) => (
              <div key={idx} className={`flex justify-between items-center p-3 rounded-lg ${u.isCurrentUser ? 'bg-green-50 border border-green-100' : 'bg-slate-50'}`}>
                <div className="flex items-center">
                  <span className={`font-bold w-6 ${idx === 0 ? 'text-amber-500' : 'text-slate-400'}`}>#{idx + 1}</span>
                  <span className={`font-medium ${u.isCurrentUser ? 'text-green-700' : 'text-slate-700'}`}>{u.username}</span>
                </div>
                <span className="font-semibold text-green-600 text-sm">{u.totalEmissions.toFixed(1)} kg</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/leaderboard')} className="mt-4 w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors">
            View Full Leaderboard
          </button>
        </div>

        {/* Sustainability Goal */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Sustainability Goal</h3>
          {!data.activeGoal ? (
            <p className="text-slate-400">No active goals. Set one today!</p>
          ) : (
            <div className="mb-4">
              <p className="font-medium text-slate-700 mb-3">{data.activeGoal.description}</p>
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>Current: {data.monthlyEmissions.toFixed(1)} kg</span>
                <span>Target: {data.activeGoal.targetKgCo2} kg</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${Math.min(100, (data.monthlyEmissions / data.activeGoal.targetKgCo2) * 100)}%` }}></div>
              </div>
            </div>
          )}
          <button onClick={() => navigate('/goals')} className="text-green-500 font-semibold hover:text-green-600 transition-colors">
            Manage Goals
          </button>
        </div>
      </div>

      {/* Row 4: Actions & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => navigate('/activity')} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-green-400 hover:shadow-md transition-all group">
              <i className="fas fa-plus-circle text-3xl text-green-500 mb-3 group-hover:scale-110 transition-transform"></i>
              <span className="font-medium text-slate-600 text-sm">Log Activity</span>
            </button>
            <button onClick={() => navigate('/analytics')} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group">
              <i className="fas fa-chart-pie text-3xl text-blue-500 mb-3 group-hover:scale-110 transition-transform"></i>
              <span className="font-medium text-slate-600 text-sm">Analytics</span>
            </button>
            <button onClick={() => navigate('/goals')} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-purple-400 hover:shadow-md transition-all group">
              <i className="fas fa-bullseye text-3xl text-purple-500 mb-3 group-hover:scale-110 transition-transform"></i>
              <span className="font-medium text-slate-600 text-sm">Set Goal</span>
            </button>
            <button onClick={() => alert("Report generation will be available in the next release!")} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group">
              <i className="fas fa-download text-3xl text-slate-400 mb-3 group-hover:scale-110 transition-transform"></i>
              <span className="font-medium text-slate-600 text-sm">Download</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Latest Badge */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Latest Badge</h3>
            {!data.latestBadge ? (
              <p className="text-slate-400 text-sm">Complete more activities to unlock your first badge.</p>
            ) : (
              <div className="flex items-center bg-amber-50 p-4 rounded-xl border border-amber-100">
                <i className={`fas fa-${data.latestBadge.icon || 'medal'} text-4xl text-amber-400 mr-4`}></i>
                <div>
                  <h4 className="font-bold text-slate-800 m-0">{data.latestBadge.name}</h4>
                  <p className="text-xs text-slate-500 m-0 mt-1">Earned on {new Date(data.latestBadge.earnedDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Recommendation */}
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg shadow-green-500/30">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <i className="fas fa-lightbulb text-yellow-300 mr-2"></i> Tip of the Day
            </h3>
            <p className="text-sm text-green-50 leading-relaxed mb-4">{data.recommendation}</p>
            <button onClick={() => navigate('/recommendations')} className="bg-white/20 hover:bg-white/30 transition-colors text-white text-sm font-medium py-2 px-4 rounded-lg">
              View All Tips
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
