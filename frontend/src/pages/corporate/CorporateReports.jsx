import React, { useState, useEffect } from 'react';
import { FileText, Download, TrendingDown, Target, HeartHandshake } from 'lucide-react';

const CorporateReports = ({ isDarkMode }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');

  const fetchReport = async (deptId = '') => {
    setLoading(true);
    try {
      let url = import.meta.env.VITE_API_URL + '/api/corporate/reports/summary';
      if (deptId) url += `?departmentId=${deptId}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      if (res.ok) setReportData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/corporate/management/departments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
      });
      if (res.ok) setDepartments(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchReport();
  }, []);

  const handleDeptChange = (e) => {
    const deptId = e.target.value;
    setSelectedDept(deptId);
    fetchReport(deptId);
  };

  const handleDownload = () => {
    if (!reportData) return;
    const orgStr = reportData.department ? `${reportData.organization} - ${reportData.department}` : reportData.organization;
    const content = `Sustainability Report - ${orgStr}\nGenerated: ${new Date(reportData.generatedAt).toLocaleString()}\n\nTotal Emissions: ${reportData.totalEmissionsKg.toFixed(2)} kg CO2\nGoals Achieved: ${reportData.achievedGoals} / ${reportData.totalGoals}\nActive CSR Projects: ${reportData.totalCsrProjects}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sustainability_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading && !reportData) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Sustainability Reports</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            Generate and download comprehensive CSR and emissions reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedDept}
            onChange={handleDeptChange}
            className={`px-4 py-2 rounded-xl border shadow-sm outline-none transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20 text-white' : 'bg-white border-slate-200 shadow-md text-slate-700'}`}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button 
            onClick={handleDownload}
            disabled={!reportData}
            className="inline-flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-xl shadow-lg shadow-cyan-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download size={18} className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {reportData && (
        <div className={`p-8 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-md shadow-black/20' : 'bg-white border-slate-200 shadow-md'}`}>
          <div className="text-center mb-10 pb-10 border-b border-dashed border-slate-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold">
              {reportData.organization} {reportData.department && <span className="text-cyan-600 dark:text-cyan-400"> - {reportData.department}</span>}
            </h2>
            <p className="text-slate-500 dark:text-gray-400 mt-1">Official Sustainability Summary</p>
            <p className="text-xs text-slate-400 mt-4">Generated on {new Date(reportData.generatedAt).toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                <TrendingDown size={32} />
              </div>
              <h3 className="text-4xl font-extrabold mb-1">{reportData.totalEmissionsKg.toFixed(1)} <span className="text-lg">kg</span></h3>
              <p className="text-slate-500 dark:text-gray-400 font-medium">Total CO₂ Footprint</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <Target size={32} />
              </div>
              <h3 className="text-4xl font-extrabold mb-1">{reportData.achievedGoals} <span className="text-lg text-slate-400">/ {reportData.totalGoals}</span></h3>
              <p className="text-slate-500 dark:text-gray-400 font-medium">Goals Achieved</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center mb-4">
                <HeartHandshake size={32} />
              </div>
              <h3 className="text-4xl font-extrabold mb-1">{reportData.totalCsrProjects}</h3>
              <p className="text-slate-500 dark:text-gray-400 font-medium">Active CSR Projects</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateReports;
