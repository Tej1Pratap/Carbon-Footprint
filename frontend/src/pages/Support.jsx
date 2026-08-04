import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShieldAlert, Bug, UserCog, Activity, BarChart2, Trophy, Target, Bell, AlertTriangle, Monitor,
  ChevronDown, Send, FilePlus, ChevronRight, HelpCircle, Server, Activity as Heartbeat, CheckCircle, Clock, Check, X
} from 'lucide-react';

export default function Support() {
  const [faqs, setFaqs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('help'); // help, myTickets, status
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [selectedLearningItem, setSelectedLearningItem] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: 'Account',
    priority: 'Low',
    title: '',
    description: '',
    browser: 'Chrome', // Auto detect mock
    device: 'Desktop', // Auto detect mock
    os: 'Windows' // Auto detect mock
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` };
      const [faqRes, ticketRes, statusRes] = await Promise.all([
        fetch(import.meta.env.VITE_API_URL + '/api/support/faqs', { headers }),
        fetch(import.meta.env.VITE_API_URL + '/api/support/tickets', { headers }),
        fetch(import.meta.env.VITE_API_URL + '/api/support/status', { headers })
      ]);
      
      if(faqRes.ok) setFaqs(await faqRes.json());
      if(ticketRes.ok) setTickets(await ticketRes.json());
      if(statusRes.ok) setSystemStatus(await statusRes.json());
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowIssueForm(false);
          setFormData({ ...formData, title: '', description: '' });
          fetchData();
          setActiveTab('myTickets');
          setIsSubmitting(false);
          setSubmitSuccess(false);
        }, 1500);
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const viewTicketDetail = async (id) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(import.meta.env.VITE_API_URL + `/api/support/tickets/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedTicket(await res.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRate = async () => {
    if (ratingStars === 0 || !selectedTicket) return;
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + `/api/support/tickets/${selectedTicket.ticketId}/rating`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars: ratingStars, comment: ratingComment })
      });
      if (res.ok) {
        setShowRating(false);
        setRatingStars(0);
        setRatingComment('');
        viewTicketDetail(selectedTicket.ticketId);
      }
    } catch (e) { console.error(e); }
  };

  const changeStatus = async (status) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + `/api/support/tickets/${selectedTicket.ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        viewTicketDetail(selectedTicket.ticketId);
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(import.meta.env.VITE_API_URL + `/api/support/tickets/${selectedTicket.ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyMessage })
      });
      if (res.ok) {
        setReplyMessage('');
        viewTicketDetail(selectedTicket.ticketId);
        fetchData(); // refresh list
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredFaqs = faqs.filter(f => f.question.toLowerCase().includes(searchQuery.toLowerCase()));

  const categories = [
    { icon: <UserCog />, title: "Account & Profile", desc: "Login, password, email verification" },
    { icon: <Activity />, title: "Activity Logging", desc: "Missing activities, wrong data" },
    { icon: <BarChart2 />, title: "Analytics", desc: "Charts not updating, history missing" },
    { icon: <Trophy />, title: "Leaderboard", desc: "Rank incorrect, badges missing" },
    { icon: <Target />, title: "Goals", desc: "Progress incorrect, recommendations" },
    { icon: <Bell />, title: "Notifications", desc: "Missing alerts, email issues" },
    { icon: <AlertTriangle />, title: "Technical Issue", desc: "Crashes, slow loading, bugs" },
    { icon: <ShieldAlert />, title: "Feature Request", desc: "Suggest ideas, request improvements" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="text-emerald-500 animate-pulse font-bold">Loading Help...</div>
      </div>
    );
  }

  return (
    <div className="pb-32 max-w-7xl mx-auto font-sans relative">
      
      {/* 1. HERO SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 text-white rounded-3xl mt-2 p-10 shadow-xl shadow-emerald-500/20"
      >
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5 }}><HelpCircle size={150} /></motion.div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3 drop-shadow-md">
            🛟 Help
          </h1>
          <p className="mt-4 text-emerald-50 text-lg max-w-2xl font-medium drop-shadow-sm">
            Need help? Find answers, report issues, and get assistance from our support team.
          </p>

          <div className="relative mt-8 w-full max-w-2xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-700" />
            <input 
              type="text" 
              placeholder="Search your issue... (e.g., Unable to login, Badge not received)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 pr-6 py-4 w-full rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-emerald-100 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/30 transition-all font-medium text-lg shadow-lg"
            />
          </div>

          <div className="flex gap-4 mt-8 flex-wrap justify-center">
            <button onClick={() => setShowIssueForm(true)} className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-full hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2">
              <Bug size={20} /> Report Issue
            </button>
            <button onClick={() => setActiveTab('myTickets')} className="px-6 py-3 bg-white/20 text-white border border-white/30 font-bold rounded-full hover:bg-white/30 transition-all shadow-lg flex items-center gap-2">
              <Monitor size={20} /> My Tickets ({tickets.length})
            </button>
            <button onClick={() => setActiveTab('status')} className="px-6 py-3 bg-white/20 text-white border border-white/30 font-bold rounded-full hover:bg-white/30 transition-all shadow-lg flex items-center gap-2">
              <Heartbeat size={20} /> System Status
            </button>
          </div>
        </div>
      </motion.div>

      {/* SEARCH RESULTS OVERLAY OR TABS */}
      {searchQuery.trim() !== '' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <h2 className="text-2xl font-black text-slate-800 mb-6">Search Results</h2>
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10">
              <img src="https://illustrations.popsy.co/amber/falling.svg" alt="Empty" className="w-48 h-48 mx-auto opacity-70" />
              <p className="text-slate-500 font-bold mt-4">No matching help articles found.</p>
              <button onClick={() => setShowIssueForm(true)} className="mt-4 text-emerald-600 font-bold hover:underline">Contact Support Instead</button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, i) => (
                <FAQItem key={i} faq={faq} />
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <>
          {activeTab === 'help' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 space-y-12">
              
              {/* QUICK HELP CARDS */}
              <section>
                <h2 className="text-2xl font-black text-slate-800 mb-6">Quick Help by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categories.map((cat, i) => (
                    <motion.div whileHover={{ y: -5 }} key={i} onClick={() => { setShowIssueForm(true); setFormData({...formData, category: cat.title.split(' & ')[0]}); }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer group">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors mb-4">
                        {cat.icon}
                      </div>
                      <h3 className="font-bold text-slate-800 mb-2">{cat.title}</h3>
                      <p className="text-xs text-slate-500 font-medium">{cat.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* FAQ SECTION */}
              <section>
                <h2 className="text-2xl font-black text-slate-800 mb-6">Frequently Asked Questions</h2>
                {faqs.length === 0 ? (
                  <div className="bg-white p-8 rounded-3xl text-center border border-slate-200 shadow-sm">
                    <img src="https://illustrations.popsy.co/amber/question-mark.svg" alt="Empty" className="w-32 h-32 mx-auto opacity-70" />
                    <p className="text-slate-500 font-bold mt-4">FAQs are currently being updated.</p>
                  </div>
                ) : (
                  <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm">
                    {faqs.map((faq, i) => (
                      <FAQItem key={i} faq={faq} />
                    ))}
                  </div>
                )}
              </section>

              {/* LEARNING CENTER & CONTACT */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                  <h3 className="text-xl font-black flex items-center gap-2 mb-6"><Target className="text-yellow-400"/> Learning Center</h3>
                  <div className="space-y-3">
                    {['How to log activities effectively', 'How carbon emissions are calculated', 'Understanding Eco Points & Levels', 'Leaderboard ranking system explained'].map((l, i) => (
                      <div key={i} onClick={() => setSelectedLearningItem(l)} className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl hover:bg-slate-700 cursor-pointer transition-colors">
                        <FilePlus size={16} className="text-emerald-400" />
                        <span className="font-semibold text-sm">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl shadow-sm flex flex-col justify-center">
                  <h3 className="text-xl font-black text-emerald-900 mb-6">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-emerald-100">
                      <span className="font-bold text-slate-500 text-sm">Support Email</span>
                      <a href="mailto:tejpratap11102@gmail.com" className="font-black text-emerald-700 hover:text-emerald-600 hover:underline transition-colors cursor-pointer">tejpratap11102@gmail.com</a>
                    </div>
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-emerald-100">
                      <span className="font-bold text-slate-500 text-sm">Working Hours</span>
                      <span className="font-black text-emerald-700">24/7 Monitoring</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-emerald-100">
                      <span className="font-bold text-slate-500 text-sm">Avg. Response Time</span>
                      <span className="font-black text-emerald-700">&lt; 2 Hours</span>
                    </div>
                  </div>
                </div>
              </section>

            </motion.div>
          )}

          {/* MY TICKETS TAB */}
          {activeTab === 'myTickets' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">My Support Tickets</h2>
                <button onClick={() => setShowIssueForm(true)} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-colors">New Ticket</button>
              </div>

              {tickets.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
                  <img src="https://illustrations.popsy.co/amber/engineer.svg" alt="Empty" className="w-64 h-64 mx-auto opacity-80" />
                  <h3 className="text-2xl font-black text-slate-800 mt-6">No Tickets Yet!</h3>
                  <p className="text-slate-500 font-medium mt-2">You have not created any support requests.</p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-black tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Ticket ID</th>
                          <th className="px-6 py-4">Issue</th>
                          <th className="px-6 py-4 text-center">Priority</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4">Created Date</th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tickets.map(t => (
                          <tr key={t.ticketId} onClick={() => viewTicketDetail(t.ticketId)} className="hover:bg-slate-50 cursor-pointer group transition-colors">
                            <td className="px-6 py-4 font-black text-slate-700">{t.ticketId}</td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 text-base">{t.title}</div>
                              <div className="text-xs font-semibold text-slate-400 mt-0.5">{t.category}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${t.priority === 'High' || t.priority === 'Critical' ? 'bg-red-50 text-red-600' : t.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>{t.priority}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <TicketStatusBadge status={t.status} />
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right">
                              <ChevronRight className="inline text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* SYSTEM STATUS TAB */}
          {activeTab === 'status' && systemStatus && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">System Status</h2>
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8">
                <div className="flex items-center justify-center gap-3 mb-10 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-black text-emerald-800 text-lg">All Systems Operational</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatusItem name="Backend Server" status={systemStatus.backendServer} />
                  <StatusItem name="Database" status={systemStatus.database} />
                  <StatusItem name="Notification Service" status={systemStatus.notificationService} />
                  <StatusItem name="Analytics Engine" status={systemStatus.analyticsEngine} />
                  <StatusItem name="Leaderboard Service" status={systemStatus.leaderboardService} />
                  <StatusItem name="Recommendation Engine" status={systemStatus.recommendationEngine} />
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* REPORT ISSUE FORM MODAL */}
      <AnimatePresence>
        {showIssueForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowIssueForm(false)}></motion.div>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10 p-8 custom-scrollbar">
              <h2 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-2">Report an Issue</h2>
              
              <form onSubmit={handleTicketSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Issue Category</label>
                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>Account</option>
                      <option>Activity Logging</option>
                      <option>Analytics</option>
                      <option>Leaderboard</option>
                      <option>Goals</option>
                      <option>Recommendations</option>
                      <option>Badges</option>
                      <option>Notifications</option>
                      <option>Technical Issue</option>
                      <option>Feature Request</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                    <select required value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Issue Title</label>
                  <input required type="text" placeholder="Brief summary of the issue" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea required rows="6" placeholder="What happened? Expected vs Actual behaviour? Steps to reproduce?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"></textarea>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                  <span>Detected Device: {formData.device}</span> • 
                  <span>Browser: {formData.browser}</span> • 
                  <span>OS: {formData.os}</span>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowIssueForm(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting || submitSuccess} className={`px-8 py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${submitSuccess ? 'bg-teal-500' : 'bg-emerald-500 hover:bg-emerald-600'} ${isSubmitting && !submitSuccess ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    {submitSuccess ? (
                      <>Submitted! <Check size={18}/></>
                    ) : isSubmitting ? (
                      <>Submitting... <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div></>
                    ) : (
                      <>Submit Ticket <Send size={18}/></>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TICKET DETAILS MODAL */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}></motion.div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative z-10 overflow-hidden border border-slate-200">
              
              <div className="bg-white p-6 border-b border-slate-200 flex justify-between items-center shrink-0 shadow-sm z-20">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black text-slate-800">{selectedTicket.title}</h2>
                    <TicketStatusBadge status={selectedTicket.status} />
                  </div>
                  <div className="text-sm font-bold text-slate-400">Ticket ID: {selectedTicket.ticketId} • {selectedTicket.category} • {new Date(selectedTicket.createdAt).toLocaleString()}</div>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><X size={20}/></button>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 border-b border-slate-100">
                {selectedTicket.status === 'RESOLVED' && (
                  <button onClick={() => setShowRating(true)} className="px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-bold hover:bg-yellow-200 transition-colors">
                    Rate Support
                  </button>
                )}
                {(selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED') && (
                  <button onClick={() => changeStatus('OPEN')} className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors">
                    Reopen Ticket
                  </button>
                )}
                {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                  <button onClick={() => changeStatus('CLOSED')} className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 transition-colors">
                    Close Ticket
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
                
                {/* Rating Overlay */}
                <AnimatePresence>
                  {showRating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6">
                      <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">How was your support experience?</h3>
                        <div className="flex justify-center gap-2 mb-6">
                          {[1,2,3,4,5].map(star => (
                            <button key={star} onClick={() => setRatingStars(star)} className={`text-4xl transition-transform hover:scale-110 ${ratingStars >= star ? 'text-yellow-400' : 'text-slate-200'}`}>
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)} placeholder="Optional feedback..." className="w-full bg-slate-50 rounded-xl p-3 border-none focus:ring-2 focus:ring-emerald-500 text-sm mb-4 resize-none" rows="3" />
                        <div className="flex gap-3">
                          <button onClick={() => setShowRating(false)} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">Skip</button>
                          <button onClick={handleRate} disabled={ratingStars === 0} className="flex-1 py-2 bg-emerald-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 hover:bg-emerald-600">Submit</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Original Post */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm ml-8 relative">
                  <div className="absolute -left-12 top-0 w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-black text-slate-500 text-sm border-2 border-white shadow-sm">You</div>
                  <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-sm">{selectedTicket.description}</div>
                  <div className="mt-4 text-xs font-bold text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100 inline-block">Device: {selectedTicket.device} | OS: {selectedTicket.os} | Browser: {selectedTicket.browser}</div>
                </div>

                {/* Replies */}
                {selectedTicket.replies?.map((r, i) => (
                  <div key={i} className={`p-5 rounded-2xl border shadow-sm relative ${r.sender === 'ADMIN' ? 'bg-emerald-50 border-emerald-100 mr-8' : 'bg-white border-slate-200 ml-8'}`}>
                    <div className={`absolute top-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 border-white shadow-sm ${r.sender === 'ADMIN' ? '-right-12 bg-emerald-500 text-white' : '-left-12 bg-slate-200 text-slate-500'}`}>
                      {r.sender === 'ADMIN' ? 'Admin' : 'You'}
                    </div>
                    <div className="text-xs font-bold text-slate-400 mb-2">{new Date(r.createdAt).toLocaleString()}</div>
                    <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-sm">{r.message}</div>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'CLOSED' && (
                <div className="bg-white p-6 border-t border-slate-200 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-20">
                  <form onSubmit={handleReplySubmit} className="flex gap-4">
                    <textarea value={replyMessage} onChange={e=>setReplyMessage(e.target.value)} required placeholder="Type your reply here..." rows="2" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"></textarea>
                    <button type="submit" className="px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2 self-end h-12">Reply <Send size={16}/></button>
                  </form>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEARNING CENTER MODAL */}
      <AnimatePresence>
        {selectedLearningItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedLearningItem(null)}></motion.div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden border border-slate-200">
              <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2"><Target className="text-yellow-400"/> Learning Center</h2>
                <button onClick={() => setSelectedLearningItem(null)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors"><X size={20}/></button>
              </div>
              <div className="p-8 space-y-4">
                <h3 className="text-2xl font-black text-slate-800">{selectedLearningItem}</h3>
                <div className="text-slate-600 font-medium leading-relaxed">
                  {selectedLearningItem === 'How to log activities effectively' && (
                    <p>To log activities effectively, navigate to the Activity Logging page. Select the type of activity, fill in the necessary details such as distance, duration, or energy used, and click save. Consistency is key to an accurate carbon footprint tracking.</p>
                  )}
                  {selectedLearningItem === 'How carbon emissions are calculated' && (
                    <p>Carbon emissions are calculated using standard emission factors provided by environmental agencies. We multiply your activity data (e.g., miles driven) by the corresponding emission factor to estimate the total CO2 equivalent produced.</p>
                  )}
                  {selectedLearningItem === 'Understanding Eco Points & Levels' && (
                    <p>Eco Points are earned by logging sustainable activities, reducing your footprint, and completing goals. As you accumulate points, you'll level up, unlocking new badges and showing your commitment to sustainability!</p>
                  )}
                  {selectedLearningItem === 'Leaderboard ranking system explained' && (
                    <p>The leaderboard ranks users based on their total Eco Points earned within a specific timeframe (weekly, monthly, or all-time). The more consistent and impactful your sustainable actions are, the higher you climb!</p>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={() => setSelectedLearningItem(null)} className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors">Got it</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0 p-2">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center p-4 hover:bg-slate-50 rounded-xl transition-colors text-left focus:outline-none">
        <span className="font-bold text-slate-800 text-lg">{faq.question}</span>
        <ChevronDown className={`text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="p-4 text-slate-600 font-medium leading-relaxed bg-slate-50/50 rounded-b-xl mx-2 border border-slate-100/50 border-t-0">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TicketStatusBadge({ status }) {
  let color = 'bg-slate-100 text-slate-600 border-slate-200';
  let icon = <Clock size={12} />;
  
  if (status === 'OPEN') { color = 'bg-emerald-50 text-emerald-600 border-emerald-200'; icon = <Server size={12} />; }
  else if (status === 'IN_PROGRESS') { color = 'bg-yellow-50 text-yellow-600 border-yellow-200'; icon = <Activity size={12} />; }
  else if (status === 'WAITING_FOR_USER') { color = 'bg-blue-50 text-blue-600 border-blue-200'; icon = <HelpCircle size={12} />; }
  else if (status === 'WAITING_FOR_ADMIN') { color = 'bg-purple-50 text-purple-600 border-purple-200'; icon = <Clock size={12} />; }
  else if (status === 'RESOLVED') { color = 'bg-teal-50 text-teal-600 border-teal-200'; icon = <CheckCircle size={12} />; }
  else if (status === 'CLOSED') { color = 'bg-slate-100 text-slate-500 border-slate-200'; icon = <Check size={12} />; }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${color}`}>
      {icon} {status.replace(/_/g, ' ')}
    </span>
  );
}

function StatusItem({ name, status }) {
  const isOnline = status === 'Online';
  return (
    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50">
      <span className="font-bold text-slate-700">{name}</span>
      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-black ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {isOnline && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
        {status}
      </div>
    </div>
  );
}
