import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Leaf, CalendarCheck, Trophy, Star, Globe, ShieldCheck, Lock, Target } from 'lucide-react';

const ALL_BADGES = [
  { id: 'b1', name: 'Weekly Starter', level: 'Weekly Badge', icon: Leaf, description: 'Log at least 3 sustainability activities in a single week.', color: 'from-emerald-500 to-green-700', shadow: 'shadow-green-900/30' },
  { id: 'b2', name: 'Weekly Champion', level: 'Weekly Badge', icon: Star, description: 'Keep your tracked emissions under 30 kg CO₂ for the entire week.', color: 'from-amber-400 to-yellow-600', shadow: 'shadow-yellow-600/30' },
  { id: 'b3', name: 'Monthly Consistent', level: 'Monthly Badge', icon: CalendarCheck, description: 'Log at least 15 activities in a single month.', color: 'from-blue-400 to-indigo-600', shadow: 'shadow-blue-600/30' },
  { id: 'b4', name: 'Monthly Master', level: 'Monthly Badge', icon: Trophy, description: 'Keep your tracked emissions under 150 kg CO₂ for the entire month.', color: 'from-purple-500 to-fuchsia-700', shadow: 'shadow-purple-600/30' },
  { id: 'b5', name: 'Yearly Eco Warrior', level: 'Yearly Badge', icon: Globe, description: 'Demonstrate extreme dedication by logging 100 activities in a year.', color: 'from-teal-400 to-emerald-600', shadow: 'shadow-teal-500/30' },
  { id: 'b6', name: 'Yearly Climate Hero', level: 'Yearly Badge', icon: ShieldCheck, description: 'Maintain total tracked emissions under 1500 kg CO₂ for the entire year.', color: 'from-rose-500 to-red-700', shadow: 'shadow-red-600/30' },
  { id: 'b7', name: 'Goal Achiever', level: 'Goal Badge', icon: Target, description: 'Successfully hit the target for 1 sustainability goal.', color: 'from-cyan-500 to-blue-600', shadow: 'shadow-blue-600/30' },
  { id: 'b8', name: 'Goal Crusher', level: 'Goal Badge', icon: Award, description: 'Demonstrate intense dedication by completing 5 sustainability goals.', color: 'from-fuchsia-500 to-pink-600', shadow: 'shadow-pink-600/30' }
];

const Badges = () => {
  const [dynamicBadges, setDynamicBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/api/v2/badges', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDynamicBadges(data);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchBadges();
  }, []);

  const getDynamicInfo = (badgeTemplate) => {
    return dynamicBadges.find(db => db.id === badgeTemplate.id);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-white border border-slate-100 rounded-3xl shadow-sm"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in relative">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 tracking-tight">
          <Award className="text-green-500" size={32} /> Your Achievements
        </h1>
        <p className="text-slate-500 mt-2 text-base">Unlock badges by hitting weekly, monthly, and yearly sustainability milestones. Missing a milestone might downgrade your badge!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_BADGES.map((badge, idx) => {
          const dynamicInfo = getDynamicInfo(badge) || { currentStatus: 'LOCKED', earnedCount: 0, currentProgress: 0, currentTarget: 1 };
          
          const status = dynamicInfo.currentStatus;
          const count = dynamicInfo.earnedCount;
          const unlocked = status === 'ACTIVE' || status === 'WARNING' || count > 0;
          const isWarning = status === 'WARNING';
          const isLimitBadge = ['b2', 'b4', 'b6'].includes(badge.id);
          const Icon = badge.icon;

          // Compute colors dynamically based on warning state
          const activeColor = isWarning ? 'from-orange-400 to-red-600' : badge.color;
          const activeShadow = isWarning ? 'shadow-orange-600/30' : badge.shadow;

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative overflow-hidden rounded-3xl border transition-all duration-500 group ${
                unlocked 
                  ? `bg-white shadow-xl hover:-translate-y-2 ${isWarning ? 'border-orange-200 shadow-orange-100/50' : 'border-slate-100 shadow-slate-200/50'}` 
                  : 'bg-slate-50/50 border-slate-100 opacity-80 hover:opacity-100'
              }`}
            >
              {unlocked && (
                <div className={`absolute inset-0 bg-gradient-to-br ${activeColor} opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity`}></div>
              )}
              
              <div className="p-8 flex flex-col items-center text-center relative z-10 h-full">
                <div className="relative mb-6">
                  {unlocked ? (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-br ${activeColor} blur-xl opacity-40 rounded-full group-hover:opacity-60 transition-opacity duration-500`}></div>
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${activeColor} shadow-lg ${activeShadow} flex items-center justify-center relative border-4 border-white transform group-hover:scale-110 transition-transform duration-500`}>
                        <Icon size={40} className="text-white drop-shadow-md" />
                      </div>
                      {count > 1 && (
                        <div className="absolute -top-2 -right-2 bg-slate-800 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-lg border-2 border-white z-20">
                          x{count}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-inner grayscale">
                      <Lock size={32} className="text-slate-400" />
                    </div>
                  )}
                </div>

                <h3 className={`text-xl font-bold mb-1 tracking-tight ${unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                  {badge.name}
                </h3>
                
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border ${
                  isWarning ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-sm' :
                  unlocked ? `bg-slate-50 text-slate-600 border-slate-200 shadow-sm` : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {isWarning ? 'AT RISK / DOWNGRADED' : badge.level}
                </span>

                <p className={`text-sm leading-relaxed ${unlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                  {badge.description}
                </p>

                <div className="mt-auto pt-6 w-full space-y-3">
                  
                  {/* Progress Bar for Current Period */}
                  <div className="w-full">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                      <span>Current Period</span>
                      <span className={isLimitBadge && dynamicInfo.currentProgress > dynamicInfo.currentTarget ? 'text-red-500' : isWarning ? 'text-orange-500' : !unlocked ? 'text-slate-400' : 'text-emerald-500'}>
                        {dynamicInfo.currentProgress.toFixed(0)} / {dynamicInfo.currentTarget.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isLimitBadge && dynamicInfo.currentProgress > dynamicInfo.currentTarget ? 'bg-red-500' : isWarning ? 'bg-orange-500' : !unlocked ? 'bg-slate-300' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (dynamicInfo.currentProgress / dynamicInfo.currentTarget) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {unlocked ? (
                    <div className={`text-xs font-bold py-2.5 px-4 rounded-xl border w-full shadow-sm ${
                      isWarning ? 'text-orange-700 bg-orange-50 border-orange-200' : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                    }`}>
                      {dynamicInfo.lastEarnedDate 
                        ? `Last earned ${new Date(dynamicInfo.lastEarnedDate).toLocaleDateString()}`
                        : `Historically Earned x${count}`}
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-slate-400 bg-slate-100 py-2.5 px-4 rounded-xl border border-slate-200 w-full">
                      Locked
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Badges;
