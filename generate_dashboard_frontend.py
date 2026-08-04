import os

src_dir = r"c:\Users\Admin\OneDrive\Desktop\Carbon Footprint\frontend\src"
pages_dir = os.path.join(src_dir, "pages")

files = {}

files['Dashboard.jsx'] = """import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:8080/api/dashboard/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 50) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}><div className="loader">Loading Dashboard...</div></div>;
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

      {/* Section 1: Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '24px' }}>
          <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '12px', marginRight: '15px' }}>
            <i className="fas fa-cloud" style={{ color: '#22c55e', fontSize: '1.5rem' }}></i>
          </div>
          <div>
            <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '0.9rem' }}>Total Emission</p>
            <h2 style={{ margin: 0 }}>{data.totalEmissions.toFixed(1)} <span style={{fontSize:'1rem', color:'#64748b'}}>kg CO₂e</span></h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '24px' }}>
          <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '12px', marginRight: '15px' }}>
            <i className="fas fa-sun" style={{ color: '#d97706', fontSize: '1.5rem' }}></i>
          </div>
          <div>
            <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '0.9rem' }}>Today's Emission</p>
            <h2 style={{ margin: 0 }}>{data.todayEmissions.toFixed(1)} <span style={{fontSize:'1rem', color:'#64748b'}}>kg CO₂e</span></h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '24px' }}>
          <div style={{ background: '#e0e7ff', padding: '15px', borderRadius: '12px', marginRight: '15px' }}>
            <i className="fas fa-calendar-alt" style={{ color: '#4f46e5', fontSize: '1.5rem' }}></i>
          </div>
          <div>
            <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '0.9rem' }}>Monthly Emission</p>
            <h2 style={{ margin: 0 }}>{data.monthlyEmissions.toFixed(1)} <span style={{fontSize:'1rem', color:'#64748b'}}>kg CO₂e</span></h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '24px', borderLeft: `6px solid ${scoreColor}` }}>
          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginRight: '15px' }}>
            <i className="fas fa-leaf" style={{ color: scoreColor, fontSize: '1.5rem' }}></i>
          </div>
          <div>
            <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '0.9rem' }}>Carbon Score</p>
            <h2 style={{ margin: 0, color: scoreColor }}>{data.carbonScore}/100</h2>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Section 2: Weekly Emission Trend */}
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Weekly Emission Trend</h3>
            {data.weeklyTrend.every(day => day.emissions === 0) ? (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                No activity logged this week.
              </div>
            ) : (
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.weeklyTrend}>
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

          {/* Section 4: Recent Activity */}
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Recent Activity</h3>
            {data.recentActivity.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No recent activity found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
                      <th style={{ padding: '12px 0' }}>Activity Type</th>
                      <th style={{ padding: '12px 0' }}>Category</th>
                      <th style={{ padding: '12px 0' }}>Quantity</th>
                      <th style={{ padding: '12px 0' }}>Emission</th>
                      <th style={{ padding: '12px 0' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentActivity.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 0', fontWeight: '500' }}>{log.activityType}</td>
                        <td style={{ padding: '12px 0' }}>
                          <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{log.category}</span>
                        </td>
                        <td style={{ padding: '12px 0', color: '#64748b' }}>{log.quantity} {log.unit}</td>
                        <td style={{ padding: '12px 0', fontWeight: '600', color: '#ef4444' }}>+{log.emissionsKgCo2.toFixed(1)} kg</td>
                        <td style={{ padding: '12px 0', color: '#64748b', fontSize: '0.9rem' }}>{new Date(log.logDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button onClick={() => navigate('/history')} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#22c55e', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
              View Full History <i className="fas fa-arrow-right" style={{marginLeft: '5px'}}></i>
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Section 3: Emission Category Breakdown */}
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Category Breakdown</h3>
            {data.categoryBreakdown.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>No data to display.</p>
            ) : (
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                      {data.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `${value.toFixed(1)} kg`} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
              {data.categoryBreakdown.map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length], marginRight: '5px' }}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Goal Progress */}
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Sustainability Goal</h3>
            {!data.activeGoal ? (
              <p style={{ color: '#94a3b8' }}>No active goals. Set one today!</p>
            ) : (
              <div>
                <p style={{ fontWeight: '500', marginBottom: '15px' }}>{data.activeGoal.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                  <span>Current: {data.monthlyEmissions.toFixed(1)} kg</span>
                  <span>Target: {data.activeGoal.targetKgCo2} kg</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#22c55e', width: `${Math.min(100, (data.monthlyEmissions / data.activeGoal.targetKgCo2) * 100)}%` }}></div>
                </div>
              </div>
            )}
            <button onClick={() => navigate('/goals')} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#22c55e', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
              View Goals
            </button>
          </div>

          {/* Section 6: Latest Badge */}
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Latest Badge</h3>
            {!data.latestBadge ? (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Complete more activities to unlock your first badge.</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
                <i className={`fas fa-${data.latestBadge.icon || 'medal'}`} style={{ fontSize: '2rem', color: '#fbbf24', marginRight: '15px' }}></i>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{data.latestBadge.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Earned on {new Date(data.latestBadge.earnedDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 7: Recommendation */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white' }}>
            <h3 style={{ marginBottom: '15px', color: 'white' }}><i className="fas fa-lightbulb" style={{ color: '#fef08a', marginRight: '8px' }}></i> Tip of the Day</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '15px' }}>{data.recommendation}</p>
            <button onClick={() => navigate('/recommendations')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
              View All
            </button>
          </div>

        </div>
      </div>

      {/* Section 8 & 9 Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', marginBottom: '30px' }}>
        
        {/* Section 8: Leaderboard Preview */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}><i className="fas fa-trophy" style={{ color: '#fbbf24', marginRight: '8px' }}></i> Leaderboard Preview</h3>
          {data.leaderboard.map((u, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx !== data.leaderboard.length -1 ? '1px solid #f1f5f9' : 'none', background: u.isCurrentUser ? '#f0fdf4' : 'transparent', padding: u.isCurrentUser ? '12px 10px' : '12px 0', borderRadius: u.isCurrentUser ? '8px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: idx === 0 ? '#fbbf24' : '#94a3b8', width: '25px' }}>#{idx + 1}</span>
                <span style={{ fontWeight: u.isCurrentUser ? '600' : '400', color: u.isCurrentUser ? '#166534' : '#334155' }}>{u.username}</span>
              </div>
              <span style={{ fontWeight: '600', color: '#22c55e', fontSize: '0.9rem' }}>{u.totalEmissions.toFixed(1)} kg</span>
            </div>
          ))}
          <button onClick={() => navigate('/leaderboard')} style={{ marginTop: '15px', width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#334155', fontWeight: '500', cursor: 'pointer' }}>
            View Full Leaderboard
          </button>
        </div>

        {/* Section 9: Quick Actions */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
            
            <button onClick={() => navigate('/activity')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', ':hover': { borderColor: '#22c55e' } }}>
              <i className="fas fa-plus-circle" style={{ fontSize: '2rem', color: '#22c55e', marginBottom: '15px' }}></i>
              <span style={{ fontWeight: '500', color: '#334155' }}>Log New Activity</span>
            </button>

            <button onClick={() => navigate('/analytics')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}>
              <i className="fas fa-chart-pie" style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '15px' }}></i>
              <span style={{ fontWeight: '500', color: '#334155' }}>View Analytics</span>
            </button>

            <button onClick={() => navigate('/goals')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}>
              <i className="fas fa-bullseye" style={{ fontSize: '2rem', color: '#8b5cf6', marginBottom: '15px' }}></i>
              <span style={{ fontWeight: '500', color: '#334155' }}>Set Goal</span>
            </button>

            <button onClick={() => alert("Report generation will be available in the next release!")} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}>
              <i className="fas fa-download" style={{ fontSize: '2rem', color: '#64748b', marginBottom: '15px' }}></i>
              <span style={{ fontWeight: '500', color: '#334155' }}>Download Report</span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
"""

for rel_path, content in files.items():
    with open(os.path.join(pages_dir, rel_path), "w") as f:
        f.write(content)
print("Generated React Dashboard")
