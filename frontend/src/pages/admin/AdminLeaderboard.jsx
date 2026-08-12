import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, ShieldCheck, Download, Search, Settings, RotateCcw, 
  Trash2, Award, ChevronRight, X, TrendingUp, Flame, Star
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { 
  AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

export default function AdminLeaderboard({ isDarkMode }) {
  const [board, setBoard] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Admin mock controls
  const [algorithm, setAlgorithm] = useState('eco_points');
  const [season, setSeason] = useState('All Time');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}` };
      const [boardRes, statsRes] = await Promise.all([
        fetch(import.meta.env.VITE_API_URL + '/api/v2/leaderboard', { headers }),
        fetch(import.meta.env.VITE_API_URL + '/api/v2/leaderboard/stats', { headers })
      ]);
      if (boardRes.ok) setBoard(await boardRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to fetch admin leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('EcoTrack Global Leaderboard', 14, 15);
    doc.autoTable({
      head: [['Rank', 'Username', 'Level', 'Eco Points', 'Streak', 'CO2 Saved']],
      body: board.map(u => [u.rank, u.username, `Lv ${u.level}`, u.ecoPoints, `${u.currentStreak} Days`, `${u.carbonEmission.toFixed(1)} kg`]),
      startY: 20
    });
    doc.save('leaderboard.pdf');
  };

  const exportCSV = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Leaderboard');
    sheet.columns = [
      { header: 'Rank', key: 'rank', width: 10 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Level', key: 'level', width: 10 },
      { header: 'Eco Points', key: 'ecoPoints', width: 15 },
      { header: 'Streak', key: 'streak', width: 15 },
      { header: 'CO2 Saved (kg)', key: 'co2', width: 15 }
    ];
    board.forEach(u => sheet.addRow({
      rank: u.rank, username: u.username, level: u.level, ecoPoints: u.ecoPoints, streak: u.currentStreak, co2: u.carbonEmission.toFixed(1)
    }));
    const buf = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leaderboard.xlsx';
    a.click();
  };

  const filteredBoard = board.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-slate-900'} font-sans`}>
      {/* HEADER & ACTIONS */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-md'} shadow-sm flex flex-col lg:flex-row justify-between gap-4`}>
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2">
            <Trophy className="text-yellow-500" /> Leaderboard Engine
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage the gamification engine, export data, and moderate users.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg font-bold text-sm hover:bg-rose-700 transition-colors shadow-md">
            <Download size={16} /> PDF
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md">
            <Download size={16} /> Excel
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}>
            <RotateCcw size={16} /> Reset Season
          </button>
        </div>
      </div>

      {/* ADMIN CONTROLS */}
      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} flex flex-wrap gap-4 items-center`}>
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-slate-500" />
          <span className="font-bold text-sm">Sorting Algo:</span>
          <select 
            className={`text-sm px-3 py-1.5 rounded-lg border outline-none font-semibold ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
            value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}
          >
            <option value="eco_points">Primary: Eco Points (Default)</option>
            <option value="co2">Primary: CO2 Saved</option>
            <option value="streak">Primary: Longest Streak</option>
          </select>
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" placeholder="Search user to manage..." 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border outline-none font-medium ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 focus:border-emerald-500'}`}
          />
        </div>
      </div>

      {/* ADMIN TABLE */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className={`border-b text-xs uppercase font-bold tracking-wider ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
              <tr>
                <th className="px-6 py-4 text-center">Rank</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4 text-center">Level / XP</th>
                <th className="px-6 py-4 text-center">Streak</th>
                <th className="px-6 py-4 text-right">CO₂ Reduced</th>
                <th className="px-6 py-4 text-center">Admin Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {filteredBoard.map((user) => (
                <tr key={user.userId} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                  <td className="px-6 py-3 text-center">
                    <span className="font-bold text-lg">{user.rank}</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`} className="w-8 h-8 rounded-full" alt="" />
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          {user.username} {user.role === 'ADMIN' && <ShieldCheck size={14} className="text-blue-500" />}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Joined {new Date(user.joinedDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>Lv {user.level}</span>
                      <span className="text-xs text-emerald-500 font-bold">{user.ecoPoints.toLocaleString()} XP</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-orange-500">
                      <Flame size={14} /> {user.currentStreak}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className={`font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      {user.carbonEmission.toFixed(1)} kg
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelectedUser(user)} className="p-1.5 text-slate-400 hover:text-blue-500 rounded bg-slate-100 dark:bg-slate-800" title="View Deep Profile">
                        <ChevronRight size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-yellow-500 rounded bg-slate-100 dark:bg-slate-800" title="Award Bonus Points">
                        <Award size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-rose-500 rounded bg-slate-100 dark:bg-slate-800" title="Ban/Suspend">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER */}
      <AnimatePresence>
        {selectedUser && (
          <UserProfileDrawer user={selectedUser} isDarkMode={isDarkMode} onClose={() => setSelectedUser(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function UserProfileDrawer({ user, isDarkMode, onClose }) {
  const mockTrend = Array.from({length: 7}).map((_, i) => ({ name: `Day ${i+1}`, emission: Math.floor(Math.random() * 5) + 1 }));

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      ></motion.div>
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
        className={`fixed top-0 right-0 h-full w-full max-w-md shadow-2xl z-50 overflow-y-auto border-l flex flex-col ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'}`}
      >
        <div className="relative h-40 bg-gradient-to-br from-emerald-600 to-slate-900">
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6 flex-1">
          <div className="flex flex-col items-center -mt-16 mb-6">
            <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`} className="w-28 h-28 rounded-full border-4 border-slate-900 shadow-xl object-cover bg-slate-800" alt="" />
            <h2 className="text-2xl font-black mt-3">{user.username}</h2>
            <div className="text-emerald-500 font-bold">Level {user.level} • Rank #{user.rank}</div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <div className="text-xs font-bold text-slate-500 uppercase">Total XP</div>
                <div className="text-xl font-black text-emerald-500">{user.ecoPoints.toLocaleString()}</div>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <div className="text-xs font-bold text-slate-500 uppercase">Longest Streak</div>
                <div className="text-xl font-black text-orange-500 flex items-center gap-1"><Flame size={18}/> {user.longestStreak}</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2"><TrendingUp size={16}/> 7-Day Activity</h3>
              <div className={`h-40 w-full rounded-xl p-4 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockTrend}>
                    <defs>
                      <linearGradient id="colorEmission" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="emission" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEmission)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <button className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors">
              Suspend User Account
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
