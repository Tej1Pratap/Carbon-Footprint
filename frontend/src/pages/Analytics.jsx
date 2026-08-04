import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [benchmark, setBenchmark] = useState(null);
  const [timeframe, setTimeframe] = useState('weekly');

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem('token');
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + `/api/analytics/summary?timeframe=${timeframe}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setData(await res.json());

        const benchRes = await fetch(import.meta.env.VITE_API_URL + '/api/analytics/benchmark', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (benchRes.ok) setBenchmark(await benchRes.json());
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [timeframe]);

  const handleExport = (type) => {
    if (!data) return;

    if (type === 'CSV') {
      const csvRows = [];
      csvRows.push(['Category', 'Emissions (kg CO2)']);
      if (data.chartData) {
        data.chartData.forEach(d => csvRows.push([d.name, d.value]));
      }
      
      csvRows.push([]);
      csvRows.push(['Time', 'Emissions (kg CO2)']);
      if (data.trendData) {
        data.trendData.forEach(d => csvRows.push([d.name, d.emissions]));
      }
      
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `My_Analytics_${timeframe}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } 
    else if (type === 'PDF') {
      try {
        const doc = new jsPDF();
        doc.text(`My Carbon Footprint Analytics (${timeframe})`, 14, 15);
        doc.text(`Total Emissions: ${data.totalEmissions.toFixed(2)} kg CO2e`, 14, 25);
        
        doc.text('Emissions by Category', 14, 35);
        const categoryBody = data.chartData ? data.chartData.map(d => [d.name, d.value.toFixed(2) + ' kg']) : [];
        autoTable(doc, { startY: 40, head: [['Category', 'Emissions']], body: categoryBody });
        
        doc.text('Emissions Trend', 14, doc.lastAutoTable.finalY + 10);
        const trendBody = data.trendData ? data.trendData.map(d => [d.name, d.emissions.toFixed(2) + ' kg']) : [];
        autoTable(doc, { startY: doc.lastAutoTable.finalY + 15, head: [['Time', 'Emissions']], body: trendBody });
        
        doc.save(`My_Analytics_${timeframe}.pdf`);
      } catch (err) {
        console.error("PDF Export failed:", err);
        alert("Failed to generate PDF.");
      }
    }
  };

  if (!data) return <div>Loading analytics...</div>;

  return (
    <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#22c55e', margin: 0 }}>Your Emissions Analytics</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none', cursor: 'pointer' }}
          >
            <option value="daily">Today</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 4 Weeks</option>
            <option value="yearly">Last 12 Months</option>
          </select>
          <button onClick={() => handleExport('PDF')} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}><i className="fas fa-file-pdf"></i> Export PDF</button>
          <button onClick={() => handleExport('CSV')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#22c55e', color: 'white', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><i className="fas fa-file-csv"></i> Export CSV</button>
        </div>
      </div>
      
      <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
        Total Emissions: <strong>{data.totalEmissions.toFixed(2)} kg CO2e</strong>
      </p>

      {/* Trend Line Chart */}
      <div style={{ width: '100%', height: '300px', marginBottom: '40px' }}>
        <h3 style={{ textAlign: 'center', color: '#64748b' }}>Emission Trend ({timeframe === 'daily' ? 'Today' : timeframe === 'weekly' ? 'Last 7 Days' : timeframe === 'monthly' ? 'Last 4 Weeks' : 'Last 12 Months'})</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.trendData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" name="Emissions (kg CO2)" dataKey="emissions" stroke="#22c55e" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{ width: '300px', height: '300px' }}>
          <h3 style={{ textAlign: 'center', color: '#64748b' }}>By Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {data.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ width: '400px', height: '300px' }}>
          <h3 style={{ textAlign: 'center', color: '#64748b' }}>Bar Breakdown</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Peer Benchmarking Section */}
      {benchmark && benchmark.length > 0 && (
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ color: '#1e293b', marginBottom: '15px' }}><i className="fas fa-users" style={{ color: '#3b82f6', marginRight: '10px' }}></i>Community Benchmarking</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '20px' }}>See how your total carbon footprint stacks up against the platform average per category.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            {benchmark.map((b, idx) => (
              <div key={idx} style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '8px', border: `1px solid ${b.isBetter ? '#86efac' : '#fecaca'}` }}>
                <h4 style={{ margin: '0 0 10px 0', textTransform: 'capitalize', color: '#334155' }}>{b.category}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                  <span>You: <strong>{b.myEmissions.toFixed(1)}</strong> kg</span>
                  <span>Avg: <strong>{b.averageEmissions.toFixed(1)}</strong> kg</span>
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.85rem', fontWeight: 'bold', color: b.isBetter ? '#16a34a' : '#ea580c' }}>
                  {b.isBetter ? 
                    `🔥 Top ${b.percentileBetterThan.toFixed(0)}%! You emit less than average.` : 
                    `⚠️ Bottom ${Math.max(1, 100 - b.percentileBetterThan).toFixed(0)}%! You emit more than average.`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default Analytics;
