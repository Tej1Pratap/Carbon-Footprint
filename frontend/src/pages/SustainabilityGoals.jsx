import React, { useEffect, useState } from 'react';
import { Target, Calendar, BarChart2, CheckCircle2, AlertCircle, ListFilter, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const GoalTrackingWidget = ({ goal }) => {
  if (!goal.startDate || !goal.deadline) return null;
  const startDate = new Date(goal.startDate);
  const now = new Date();
  
  const daysElapsed = Math.max(1, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, goal.periodDays - daysElapsed);
  
  const target = goal.targetKgCo2 || 0;
  const current = goal.currentEmissions || 0;
  const projected = goal.projectedEmissions || 0;
  
  const remainingAllowance = Math.max(0, target - current);
  const dailyReductionRequired = daysRemaining > 0 ? (remainingAllowance / daysRemaining) : 0;
  
  const idealCurrentTarget = (target / goal.periodDays) * daysElapsed;

  const chartData = [
    { name: 'Start', Actual: 0, Projected: null, Target: 0 },
    { name: 'Today', Actual: current, Projected: current, Target: idealCurrentTarget },
    { name: 'Deadline', Actual: null, Projected: projected, Target: target }
  ];

  return (
    <div className="mt-4 border-t pt-5 border-slate-100">
      <h4 className="text-sm font-bold text-slate-700 mb-4">Goal Tracking Insights</h4>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1 tracking-wider">Remaining Allowance</p>
          <p className="text-xl font-black text-slate-800">{remainingAllowance.toFixed(1)} kg</p>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1 tracking-wider">Daily Limit Needed</p>
          <p className={`text-xl font-black ${dailyReductionRequired < (current/daysElapsed) ? 'text-red-500' : 'text-green-600'}`}>
            {dailyReductionRequired.toFixed(1)} kg/day
          </p>
        </div>
      </div>
      
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }} />
            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600, marginTop: '10px' }} iconType="circle" />
            <Line type="monotone" dataKey="Target" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={{r: 4, fill: '#94a3b8'}} name="Target Pathway" />
            <Line type="monotone" dataKey="Actual" stroke="#10b981" strokeWidth={3} dot={{r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} name="Actual Footprint" />
            <Line type="monotone" dataKey="Projected" stroke="#f59e0b" strokeWidth={3} strokeDasharray="4 4" dot={{r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff'}} name="Projected Trend" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SustainabilityGoals = () => {
  const [goals, setGoals] = useState([]);
  const [desc, setDesc] = useState('');
  const [reductionPercentage, setReductionPercentage] = useState('');
  const [period, setPeriod] = useState('30');
  const [filter, setFilter] = useState('ACTIVE'); // 'ACTIVE' or 'PREVIOUS'

  const fetchGoals = async () => {
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    const res = await fetch(import.meta.env.VITE_API_URL + '/api/goals', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setGoals(await res.json());
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    await fetch(import.meta.env.VITE_API_URL + '/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
        description: desc, 
        targetReductionPercentage: parseFloat(reductionPercentage), 
        periodDays: parseInt(period) 
      })
    });
    fetchGoals();
    setDesc('');
    setReductionPercentage('');
    setPeriod('30');
  };

  const filteredGoals = goals.filter(g => filter === 'ACTIVE' ? g.status === 'IN_PROGRESS' : g.status !== 'IN_PROGRESS');

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Create Goal Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-10">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6">
          <Target className="text-green-500" size={28} /> Set a New Goal
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col lg:flex-row gap-6 items-end">
          <div className="w-full lg:w-1/2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Goal Description</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Cut down transport emissions" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-slate-700 font-medium" />
          </div>
          <div className="w-full lg:w-1/4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Reduction (%)</label>
            <div className="relative">
              <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="number" min="1" max="100" value={reductionPercentage} onChange={e => setReductionPercentage(e.target.value)} placeholder="20" required className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-slate-700 font-medium" />
            </div>
          </div>
          <div className="w-full lg:w-1/4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Time Period</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select value={period} onChange={e => setPeriod(e.target.value)} className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-slate-700 font-medium appearance-none">
                <option value="7">1 Week</option>
                <option value="30">1 Month</option>
                <option value="90">3 Months</option>
                <option value="180">6 Months</option>
                <option value="365">1 Year</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full lg:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] whitespace-nowrap">
            Create Goal
          </button>
        </form>
      </div>

      {/* Goals List Header with Filter Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <BarChart2 className="text-blue-500" size={28} /> 
          {filter === 'ACTIVE' ? 'Active Goals' : 'Previous Goals'}
        </h2>
        
        {/* Toggle Switch */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => setFilter('ACTIVE')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${filter === 'ACTIVE' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setFilter('PREVIOUS')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${filter === 'PREVIOUS' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Previous
          </button>
        </div>
      </div>

      {/* Goals List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center">
            <div className="bg-slate-50 p-5 rounded-full text-slate-400 mb-5">
               <ListFilter size={56} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No {filter === 'ACTIVE' ? 'Active' : 'Previous'} Goals Found</h3>
            <p className="text-slate-500 text-base">
              {filter === 'ACTIVE' 
                ? "You don't have any goals currently in progress. Create one above to start reducing your carbon footprint!" 
                : "You haven't completed or failed any goals yet. Keep pushing forward!"}
            </p>
          </div>
        ) : (
          filteredGoals.map(g => {
            const isFinished = g.status === 'ACHIEVED' || g.status === 'FAILED';
            const displayStatus = isFinished ? g.status : g.projectedStatus;
            
            let statusBadge = null;
            if (displayStatus === 'ACHIEVED') {
              statusBadge = <span className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Achieved</span>;
            } else if (displayStatus === 'FAILED') {
              statusBadge = <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Failed</span>;
            } else if (displayStatus === 'ON_TRACK') {
              statusBadge = <span className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">On Track</span>;
            } else if (displayStatus === 'AT_RISK') {
              statusBadge = <span className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">At Risk</span>;
            } else {
               statusBadge = <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">{g.status}</span>;
            }

            const barColor = displayStatus === 'AT_RISK' || displayStatus === 'FAILED' ? 'bg-red-500' : 'bg-blue-500';

            return (
              <div key={g.id} className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col group">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <h3 className="font-bold text-slate-800 text-xl leading-tight group-hover:text-green-700 transition-colors">{g.description}</h3>
                  <div className="flex-shrink-0 mt-1">{statusBadge}</div>
                </div>
                
                <p className="text-slate-500 text-sm mb-6 flex-grow font-medium">
                  Target: <strong className="text-slate-700">{g.targetReductionPercentage}% reduction</strong> over {g.periodDays} days (Max {g.targetKgCo2?.toFixed(1) || 0} kg CO₂e)
                </p>

                <div className="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-sm font-bold text-slate-700 mb-3">
                    <span>Current: {g.currentEmissions?.toFixed(1) || 0} kg</span>
                    <span>{g.progressPercentage?.toFixed(0) || 0}% limit</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.min(100, g.progressPercentage || 0)}%` }}
                    ></div>
                  </div>
                </div>

                {g.alertMessage && (
                  <div className={`mt-auto mb-2 p-3.5 rounded-xl flex items-start gap-3 text-sm font-semibold ${displayStatus === 'ON_TRACK' || displayStatus === 'ACHIEVED' ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                    {displayStatus === 'ON_TRACK' || displayStatus === 'ACHIEVED' ? (
                      <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
                    ) : (
                      <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                    )}
                    <span className="leading-tight">{g.alertMessage}</span>
                  </div>
                )}
                
                {!isFinished && filter === 'ACTIVE' && (
                  <GoalTrackingWidget goal={g} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SustainabilityGoals;
