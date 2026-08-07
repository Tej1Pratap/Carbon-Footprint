import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Trophy, Activity, Medal, Crown, TrendingUp, TrendingDown, Minus, 
  ChevronRight, X, Calendar, TreePine, Zap, ArrowUp, Star, Filter, 
  Search, ShieldCheck, Flame, Info, Users, CloudFog, Download, RefreshCw,
  CheckCircle, ChevronLeft, CalendarDays, BarChart3, PieChart, ChevronDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, CartesianGrid
} from 'recharts';

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [stats, setStats] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterSeason, setFilterSeason] = useState('All Time');
  const [showFilters, setShowFilters] = useState(false);
  const [isStandingMinimized, setIsStandingMinimized] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const headers = { 'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}` };
      
      const [boardRes, statsRes, myRankRes, challengesRes] = await Promise.all([
        fetch(import.meta.env.VITE_API_URL + '/api/v2/leaderboard', { headers }),
        fetch(import.meta.env.VITE_API_URL + '/api/v2/leaderboard/stats', { headers }),
        fetch(import.meta.env.VITE_API_URL + '/api/v2/leaderboard/me', { headers }),
        fetch(import.meta.env.VITE_API_URL + '/api/v2/leaderboard/challenges', { headers })
      ]);

      if (boardRes.ok) {
        const data = await boardRes.json();
        setBoard(data);
        if (data.length > 0 && data[0].username === localStorage.getItem('username')) {
          triggerConfetti();
        }
      }
      if (statsRes.ok) setStats(await statsRes.json());
      if (myRankRes.ok) setMyRank(await myRankRes.json());
      if (challengesRes.ok) setChallenges(await challengesRes.json());

    } catch (err) {
      console.error('Failed to fetch leaderboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#22c55e', '#eab308', '#3b82f6'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#22c55e', '#eab308', '#3b82f6'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const filteredBoard = board.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topThree = board.slice(0, 3); // Always show top 3 of the entire board regardless of search
  const remaining = filteredBoard;

  if (loading && !board.length) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="text-emerald-600 font-bold text-xl">Loading Leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans relative overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 text-white rounded-3xl mx-4 mt-6 p-8 shadow-xl shadow-emerald-500/20"
      >
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}><TreePine size={120} /></motion.div>
        </div>
        <div className="absolute -bottom-10 -left-10 opacity-20 pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}><Zap size={150} /></motion.div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3 drop-shadow-md">
              <Trophy className="text-yellow-300 w-12 h-12" /> Eco Champions
            </h1>
            <p className="mt-3 text-emerald-50 text-lg max-w-xl font-medium drop-shadow-sm">
              Compete with the community by reducing your carbon footprint and earning Eco Points.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-700" />
              <input 
                type="text" 
                placeholder="Search champions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 w-full md:w-72 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-emerald-100 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/30 transition-all font-medium"
              />
            </div>
            <button onClick={fetchData} className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-2xl transition-all">
              <RefreshCw size={20} />
            </button>
            <button onClick={() => setShowFilters(!showFilters)} className={`p-3 backdrop-blur-md border border-white/30 rounded-2xl transition-all ${showFilters ? 'bg-white text-emerald-600' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
              <Filter size={20} />
            </button>
            <button className="flex items-center gap-2 px-5 py-3 bg-white text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-lg">
              <Download size={18} /> Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* FILTER EXPAND */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mx-4 mt-4 overflow-hidden">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex gap-4">
              <select className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 outline-none" value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)}>
                <option>All Time</option>
                <option>This Month</option>
                <option>This Week</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-4 mt-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* MAIN CONTENT (FULL WIDTH NOW) */}
        <div className="xl:col-span-12 space-y-8">
          
          {/* 2. COMMUNITY STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Users />} label="Members" value={stats?.totalMembers || 0} trend="Active Community" color="blue" delay={0.1} />
            <StatCard icon={<CloudFog />} label="CO₂ Saved" value={`${stats?.totalCarbonSaved?.toFixed(0) || 0} kg`} trend="Total Impact" color="emerald" delay={0.2} />
            <StatCard icon={<Activity />} label="Activities" value={stats?.todayActivities || 0} trend="Logged Today" color="orange" delay={0.3} />
            <StatCard icon={<Star />} label="Community Goal" value={`${stats?.weeklyChallengeProgress?.toFixed(1) || 0}%`} trend={stats?.weeklyChallengeProgress >= 100 ? "Goal Reached!" : "On track!"} color="yellow" delay={0.4} />
          </div>

          {/* 4. TOP 3 PODIUM */}
          {topThree.length >= 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-12 mb-12 pt-20 pb-8 px-4 rounded-3xl bg-white border border-slate-200 shadow-xl overflow-visible">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white rounded-3xl"></div>
              
              <div className="flex items-end justify-center gap-2 md:gap-6 relative z-10 h-72">
                <PodiumUser user={topThree[1]} rank={2} color="slate" height="h-32" delay={0.4} onClick={() => setSelectedUser(topThree[1])} />
                <PodiumUser user={topThree[0]} rank={1} color="yellow" height="h-48" delay={0.2} onClick={() => setSelectedUser(topThree[0])} isCenter />
                <PodiumUser user={topThree[2]} rank={3} color="orange" height="h-24" delay={0.6} onClick={() => setSelectedUser(topThree[2])} />
              </div>
            </motion.div>
          )}

          {/* 5. LEADERBOARD TABLE & MOBILE CARDS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-black tracking-wider sticky top-0 z-20">
                  <tr>
                    <th className="px-5 py-4 text-center">Rank</th>
                    <th className="px-5 py-4 w-[30%]">Champion</th>
                    <th className="px-5 py-4 text-center">Lvl</th>
                    <th className="px-5 py-4 text-right">XP</th>
                    <th className="px-5 py-4 text-center">Strk</th>
                    <th className="px-5 py-4 text-center">Max Strk</th>
                    <th className="px-5 py-4 text-center">Acts</th>
                    <th className="px-5 py-4 text-right">CO₂</th>
                    <th className="px-5 py-4">Badges</th>
                    <th className="px-5 py-4 text-center">Trend</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {remaining.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="px-6 py-20 text-center">
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                            <img src="https://illustrations.popsy.co/amber/surreal-hourglass.svg" alt="Empty" className="w-48 h-48 opacity-80" />
                            <h3 className="text-xl font-bold text-slate-800 mt-4">No Champions Found</h3>
                            <p className="text-slate-500 mt-1">Try adjusting your search filters.</p>
                          </motion.div>
                        </td>
                      </tr>
                    ) : (
                      remaining.map((user, idx) => (
                        <motion.tr 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                          key={user.userId} 
                          onClick={() => setSelectedUser(user)}
                          className="group hover:bg-emerald-50/50 transition-colors cursor-pointer relative"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center">
                              {user.rank === 1 ? <span className="text-2xl" title="Rank 1">🥇</span> :
                               user.rank === 2 ? <span className="text-2xl" title="Rank 2">🥈</span> :
                               user.rank === 3 ? <span className="text-2xl" title="Rank 3">🥉</span> :
                               <span className="font-black text-slate-500 text-lg">#{user.rank}</span>}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" alt="" />
                              <div>
                                <div className="font-bold text-slate-800 text-base">{user.username}</div>
                                <div className="text-xs text-slate-400 font-semibold">{user.country || 'Global'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center justify-center bg-slate-800 text-white font-black text-xs rounded-lg px-2.5 py-1">
                              {user.level}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="font-black text-emerald-600 text-lg">{user.ecoPoints.toLocaleString()}</span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="inline-flex items-center gap-1 font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                              <Flame size={14} /> {user.currentStreak}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="font-bold text-slate-500">{user.longestStreak}</span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="font-bold text-blue-500">{user.activitiesLogged}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{user.carbonEmission.toFixed(1)} kg</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1.5">
                              {user.badges.slice(0, 3).map((b, i) => (
                                <BadgeIcon key={i} name={b} />
                              ))}
                              {user.badges.length > 3 && <span className="text-xs font-bold text-slate-400 self-center">+{user.badges.length - 3}</span>}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <RankChangeIndicator change={user.rankChange} value={user.rankChangeValue} />
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button className="p-2 text-slate-300 group-hover:text-emerald-600 group-hover:bg-white rounded-full transition-all shadow-sm opacity-0 group-hover:opacity-100">
                              <ChevronRight size={18} />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              <AnimatePresence>
                {remaining.length === 0 ? (
                  <div className="px-6 py-20 text-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                      <img src="https://illustrations.popsy.co/amber/surreal-hourglass.svg" alt="Empty" className="w-32 h-32 opacity-80" />
                      <h3 className="text-xl font-bold text-slate-800 mt-4">No Champions Found</h3>
                    </motion.div>
                  </div>
                ) : (
                  remaining.map((user, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                      key={user.userId} 
                      onClick={() => setSelectedUser(user)}
                      className="p-5 flex flex-col gap-4 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 flex justify-center">
                            {user.rank === 1 ? <span className="text-2xl" title="Rank 1">🥇</span> :
                             user.rank === 2 ? <span className="text-2xl" title="Rank 2">🥈</span> :
                             user.rank === 3 ? <span className="text-2xl" title="Rank 3">🥉</span> :
                             <span className="font-black text-slate-500 text-lg">#{user.rank}</span>}
                          </div>
                          <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`} className="w-12 h-12 rounded-full border border-slate-200 object-cover" alt="" />
                          <div>
                            <div className="font-bold text-slate-800">{user.username}</div>
                            <div className="text-xs text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">Lv {user.level} • {user.country || 'Global'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-emerald-600 text-lg">{user.ecoPoints.toLocaleString()} XP</div>
                          <RankChangeIndicator change={user.rankChange} value={user.rankChangeValue} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="text-center">
                          <div className="text-[10px] font-black uppercase text-slate-400">Streak</div>
                          <div className="font-bold text-orange-500 text-sm flex items-center justify-center gap-1"><Flame size={12}/> {user.currentStreak}</div>
                        </div>
                        <div className="text-center border-l border-slate-200">
                          <div className="text-[10px] font-black uppercase text-slate-400">CO₂ Saved</div>
                          <div className="font-bold text-slate-700 text-sm">{user.carbonEmission.toFixed(0)}kg</div>
                        </div>
                        <div className="text-center border-l border-slate-200">
                          <div className="text-[10px] font-black uppercase text-slate-400">Badges</div>
                          <div className="font-bold text-blue-500 text-sm">{user.badges.length}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 7. YOUR STANDING CARD */}
      <AnimatePresence>
        {myRank && (
          <motion.div 
            initial={{ y: 150 }} animate={{ y: 0 }} exit={{ y: 150 }} transition={{ type: 'spring', damping: 20 }}
            className={`fixed ${isStandingMinimized ? 'bottom-6 right-6' : 'bottom-6 right-6'} ${isStandingMinimized ? 'w-auto cursor-pointer hover:scale-105 transition-transform' : 'w-[90%] md:w-[650px]'} bg-white/95 backdrop-blur-xl border border-slate-200 ${isStandingMinimized ? 'p-3 rounded-full' : 'p-6 rounded-3xl'} shadow-[0_10px_50px_rgba(0,0,0,0.2)] z-50 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 origin-bottom-right`}
            onClick={() => isStandingMinimized && setIsStandingMinimized(false)}
          >
            {isStandingMinimized ? (
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-sm text-white shadow-sm">
                  #{myRank.currentRank}
                </div>
                <div className="font-bold text-slate-800 text-sm">{myRank.ecoPoints.toLocaleString()} XP</div>
                <button onClick={(e) => { e.stopPropagation(); setIsStandingMinimized(false); }} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                  <ArrowUp size={16} />
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsStandingMinimized(true); }}
                  className="absolute top-2 right-2 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-50"
                  title="Minimize"
                >
                  <ChevronDown size={18} />
                </button>
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-2xl text-white shadow-lg border-2 border-emerald-400/50">
                    #{myRank.currentRank}
                  </div>
                  <div>
                    <div className="font-black text-slate-800 text-xl">{myRank.ecoPoints.toLocaleString()} XP</div>
                    <div className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">Level {Math.floor(myRank.ecoPoints / 1000) + 1}</div>
                  </div>
                </div>
                
                <div className="flex-1 w-full text-center px-2 md:px-8">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Rank #{myRank.currentRank}</span>
                    <span>{myRank.nextRank === 1 && myRank.currentRank === 1 ? 'MAX RANK' : `Rank #${myRank.nextRank}`}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 shadow-inner relative">
                    {myRank.currentRank !== 1 && (
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${Math.max(5, 100 - (myRank.pointsRequired / (myRank.ecoPoints + myRank.pointsRequired) * 100))}%` }}
                        className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full"
                      />
                    )}
                    {myRank.currentRank === 1 && <div className="bg-yellow-400 h-full w-full" />}
                  </div>
                  <div className="text-sm font-black text-slate-800 mt-2">{myRank.motivationalMessage}</div>
                </div>

                <div className="hidden md:flex flex-col items-end w-full md:w-auto mr-4">
                  <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 shadow-sm">
                    <Flame size={20} className="text-orange-500" />
                    <div>
                      <div className="text-xs font-bold text-orange-400 uppercase leading-none">Streak</div>
                      <div className="font-black text-orange-600 leading-none mt-1">{myRank.currentStreak} Days</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. PROFILE DRAWER */}
      <AnimatePresence>
        {selectedUser && <UserProfileDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

function StatCard({ icon, label, value, trend, color, delay }) {
  const colors = {
    blue: 'bg-white border-slate-200 text-blue-500',
    emerald: 'bg-white border-slate-200 text-emerald-500',
    orange: 'bg-white border-slate-200 text-orange-500',
    yellow: 'bg-white border-slate-200 text-yellow-500',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} whileHover={{ y: -5 }} className={`p-5 rounded-3xl border shadow-xl shadow-slate-200/50 ${colors[color]} flex flex-col justify-between group overflow-hidden relative`}>
      <div className="absolute -right-6 -top-6 opacity-5 transform group-hover:scale-150 transition-transform duration-500">
        {React.cloneElement(icon, { size: 100 })}
      </div>
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm text-slate-700`}>{React.cloneElement(icon, { size: 20 })}</div>
      </div>
      <div className="mt-4 relative z-10">
        <div className="text-3xl font-black text-slate-800">{value}</div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{label}</div>
      </div>
      <div className="mt-4 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded inline-block w-max relative z-10">{trend}</div>
    </motion.div>
  );
}

function PodiumUser({ user, rank, color, height, delay, onClick, isCenter }) {
  const colors = {
    yellow: 'from-yellow-300 via-yellow-400 to-yellow-600 text-yellow-900 border-yellow-400 shadow-yellow-500/40',
    slate: 'from-slate-200 via-slate-300 to-slate-400 text-slate-800 border-slate-300 shadow-slate-400/40',
    orange: 'from-orange-300 via-orange-400 to-orange-600 text-orange-900 border-orange-400 shadow-orange-500/40'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 20, delay }} 
      className={`flex flex-col items-center cursor-pointer group relative z-${isCenter ? 20 : 10} ${isCenter ? 'mx-0 md:mx-4' : ''}`}
      onClick={onClick}
    >
      <div className="relative mb-6 transform transition-transform group-hover:scale-110">
        {rank === 1 && (
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
            <Crown size={40} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] fill-current" />
          </motion.div>
        )}
        <div className={`absolute -top-3 -right-3 rounded-full p-1.5 shadow-xl border-2 border-white z-10 bg-gradient-to-br ${rank === 1 ? 'from-yellow-400 to-yellow-600' : rank === 2 ? 'from-slate-300 to-slate-500' : 'from-orange-400 to-orange-600'}`}>
          <span className="text-white font-black text-xs">{rank}</span>
        </div>
        <img 
          src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
          alt={user.username} 
          className={`rounded-full object-cover border-4 shadow-2xl bg-white ${isCenter ? 'w-24 h-24 md:w-32 md:h-32 border-yellow-400 ring-4 ring-yellow-400/30' : 'w-20 h-20 md:w-24 md:h-24 border-white'}`} 
        />
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-black px-3 py-1 rounded-lg border-2 border-white whitespace-nowrap shadow-md">
          Lv {user.level}
        </div>
      </div>
      
      <div className="text-center mb-4">
        <h3 className={`font-black tracking-tight ${isCenter ? 'text-2xl text-slate-800' : 'text-lg text-slate-700'}`}>{user.username}</h3>
        <p className={`font-black ${isCenter ? 'text-emerald-500 text-lg' : 'text-emerald-500 text-sm'}`}>{user.ecoPoints.toLocaleString()} XP</p>
      </div>
      
      <div className={`w-28 md:w-40 ${height} bg-gradient-to-t ${colors[color]} rounded-t-3xl border-t border-x flex flex-col items-center pt-4 relative overflow-hidden transition-all group-hover:brightness-110`}>
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="text-5xl md:text-6xl font-black text-black/10 drop-shadow-sm">{rank}</span>
      </div>
    </motion.div>
  );
}

function RankChangeIndicator({ change, value }) {
  if (change === 'UP') return <div className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-600 text-xs font-black px-2 py-1 rounded w-12 justify-center"><ArrowUp size={12} strokeWidth={3}/> {value}</div>;
  if (change === 'DOWN') return <div className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-600 text-xs font-black px-2 py-1 rounded w-12 justify-center"><TrendingDown size={12} strokeWidth={3}/> {value}</div>;
  if (change === 'NEW') return <div className="inline-flex items-center justify-center bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded w-12">NEW</div>;
  return <div className="inline-flex items-center justify-center bg-slate-50 text-slate-400 text-xs font-black px-2 py-1 rounded w-12"><Minus size={12} strokeWidth={3}/></div>;
}

function TargetIcon({ type }) {
  const t = type.toLowerCase();
  if (t.includes('walk') || t.includes('run')) return <Activity size={18} />;
  if (t.includes('tree') || t.includes('plant')) return <TreePine size={18} />;
  if (t.includes('recycle')) return <RefreshCw size={18} />;
  return <Star size={18} />;
}

function BadgeIcon({ name }) {
  const t = name.toLowerCase();
  let icon = "🌟";
  let color = "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (t.includes('eco')) { icon = "🌱"; color = "bg-emerald-100 text-emerald-700 border-emerald-200"; }
  if (t.includes('cycle') || t.includes('bike')) { icon = "🚴"; color = "bg-blue-100 text-blue-700 border-blue-200"; }
  if (t.includes('tree')) { icon = "🌳"; color = "bg-green-100 text-green-700 border-green-200"; }
  if (t.includes('streak') || t.includes('master')) { icon = "🔥"; color = "bg-orange-100 text-orange-700 border-orange-200"; }
  if (t.includes('champion')) { icon = "🏆"; color = "bg-yellow-100 text-yellow-700 border-yellow-200"; }
  if (t.includes('energy') || t.includes('solar')) { icon = "⚡"; color = "bg-purple-100 text-purple-700 border-purple-200"; }
  if (t.includes('recycle')) { icon = "♻"; color = "bg-teal-100 text-teal-700 border-teal-200"; }

  return (
    <div className={`flex items-center justify-center w-7 h-7 rounded-full border shadow-sm ${color} cursor-help transition-transform hover:scale-125`} title={name}>
      {icon}
    </div>
  );
}

function UserProfileDrawer({ user, onClose }) {
  // Mock Data for beautiful Recharts
  const mockTrend = Array.from({length: 30}).map((_, i) => ({ name: `Day ${i+1}`, emission: Math.max(0, 10 - Math.random() * 5 - (i * 0.1)) }));
  const mockActivities = [
    { name: 'Transport', value: 45, color: '#3b82f6' },
    { name: 'Energy', value: 30, color: '#eab308' },
    { name: 'Recycling', value: 25, color: '#22c55e' }
  ];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
        onClick={onClose}
      ></motion.div>
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto border-l border-slate-200 flex flex-col"
      >
        <div className="relative h-48 bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900">
          <button onClick={onClose} className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="absolute -bottom-16 left-0 w-full flex flex-col items-center">
            <div className="relative">
              <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`} className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover bg-white" alt="" />
              <div className="absolute bottom-0 right-0 bg-slate-900 text-white font-black text-sm px-3 py-1 rounded-full border-2 border-white shadow-md">
                Lv {user.level}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pt-20 pb-8 flex-1 space-y-8 bg-slate-50">
          
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-800 flex items-center justify-center gap-2">
              {user.username} {user.role === 'ADMIN' && <ShieldCheck size={20} className="text-blue-500" title="Admin"/>}
            </h2>
            <p className="text-slate-500 font-bold text-sm mt-1">{user.country || 'Global Citizen'}</p>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 mt-2 bg-slate-200/50 px-3 py-1 rounded-full w-max mx-auto">
              <CalendarDays size={14}/> Member since {new Date(user.joinedDate).toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Current Rank</div>
              <div className="text-4xl font-black text-slate-800">#{user.rank}</div>
              <div className="text-xs font-bold text-emerald-500 mt-2">Top 1%</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Total XP</div>
              <div className="text-3xl font-black text-emerald-500">{user.ecoPoints.toLocaleString()}</div>
              <div className="text-xs font-bold text-slate-400 mt-2">Lv {user.level} Progress: 85%</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Flame className="text-orange-500"/> Streak Status</h3>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-3xl font-black text-orange-500">{user.currentStreak} <span className="text-lg text-slate-400">Days</span></div>
                <div className="text-sm font-bold text-slate-500 mt-1">Current Streak</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-slate-700">{user.longestStreak}</div>
                <div className="text-xs font-bold text-slate-400 mt-1">Longest Record</div>
              </div>
            </div>
            <div className="w-full flex gap-1 mt-6">
              {Array.from({length: 14}).map((_, i) => (
                <div key={i} className={`flex-1 h-8 rounded-md ${i < Math.min(14, user.currentStreak) ? 'bg-orange-400' : 'bg-slate-100'} transition-colors hover:bg-orange-500 cursor-pointer`} title={`Day ${i+1}`}></div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><TrendingUp className="text-emerald-500"/> Monthly Carbon Trend</h3>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTrend}>
                  <defs>
                    <linearGradient id="colorE" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="emission" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorE)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Trophy className="text-yellow-500"/> Achievements</h3>
            <div className="grid grid-cols-2 gap-3">
              {user.badges.length === 0 ? (
                <div className="col-span-2 text-sm text-slate-500 font-semibold p-4 bg-slate-50 rounded-xl text-center">No achievements unlocked yet.</div>
              ) : (
                user.badges.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-emerald-50 transition-colors cursor-pointer group">
                    <BadgeIcon name={b} />
                    <span className="font-bold text-xs text-slate-700 group-hover:text-emerald-700">{b}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </>
  );
}
