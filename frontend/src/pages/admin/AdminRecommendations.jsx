import React, { useEffect, useState } from 'react';
import { Lightbulb, Users, Search, Target, Zap, ArrowRight, BarChart } from 'lucide-react';

const AdminRecommendations = ({ isDarkMode }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/recommendations', {
        headers: { 'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}` }
      });
      if (response.ok) {
        setRecommendations(await response.json());
      }
    } catch (error) {
      console.error('Error fetching admin recommendations', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecommendations = recommendations.filter(r => 
    r.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.tip?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const typeCounts = recommendations.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>System Recommendations</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Insights into AI-generated suggestions deployed across users.</p>
        </div>
        <div className={`flex items-center px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
          <Search size={18} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search suggestions or users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-slate-500 text-sm font-semibold mb-1">Total Insights Gen.</p>
          <div className="flex items-center justify-between">
            <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{recommendations.length}</h3>
            <Lightbulb size={24} className="text-amber-500" />
          </div>
        </div>
        
        {topCategories.map(([category, count], idx) => (
           <div key={idx} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-sm'}`}>
             <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider text-xs">{category} Tips</p>
             <div className="flex items-center justify-between">
               <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{count}</h3>
               <Target size={24} className={idx === 0 ? "text-red-500" : (idx === 1 ? "text-blue-500" : "text-green-500")} />
             </div>
           </div>
        ))}
      </div>

      <div className={`rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-sm'} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>User Insights Feed</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all shadow-md">
             <Zap size={16} /> Broadcast Global Tip
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-slate-500">Loading AI Insights...</div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">No recommendations found.</div>
          ) : (
            filteredRecommendations.map((rec, idx) => {
              const colors = {
                transport: 'from-blue-500 to-cyan-500 bg-blue-50 text-blue-700 border-blue-200',
                energy: 'from-amber-400 to-orange-500 bg-amber-50 text-amber-700 border-amber-200',
                diet: 'from-green-500 to-emerald-600 bg-green-50 text-green-700 border-green-200',
                default: 'from-purple-500 to-pink-500 bg-purple-50 text-purple-700 border-purple-200'
              };
              
              const catTheme = colors[rec.type?.toLowerCase()] || colors.default;
              
              return (
                <div key={idx} className={`rounded-xl border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-slate-50 border-slate-100'} p-5 flex flex-col group hover:shadow-md transition-all`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${catTheme.split(' ').slice(2).join(' ')}`}>
                      {rec.type}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-6 flex-grow font-medium leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    "{rec.tip}"
                  </p>
                  
                  <div className={`pt-4 mt-auto border-t flex items-center justify-between ${isDarkMode ? 'border-gray-600' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-2.5">
                       <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                         {rec.username?.charAt(0).toUpperCase()}
                       </div>
                       <div>
                         <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{rec.username}</p>
                       </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRecommendations;
