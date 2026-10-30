import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Search, Filter, MessageSquare, AlertCircle, CheckCircle, 
  Clock, X, ChevronDown, ChevronRight, User, Calendar, Tag, ShieldAlert,
  Send, Paperclip, MoreVertical, Flag, Edit, Trash2, Plus, Lightbulb
} from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'red', color: 'white' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
        </div>
      );
    }
    return this.props.children; 
  }
}


const AdminSupport = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [faqs, setFaqs] = useState([]);
  
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General' });
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchDashboard();
    fetchTickets();
    fetchFaqs();
  }, []);

  const getHeaders = () => ({
    'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}`,
    'Content-Type': 'application/json'
  });

  const fetchDashboard = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/support/admin/dashboard', { headers: getHeaders() });
      if (res.ok) setDashboard(await res.json());
    } catch (e) {}
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/support/admin/tickets', { headers: getHeaders() });
      if (res.ok) setTickets(await res.json());
    } catch (e) {}
  };

  const fetchFaqs = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/support/faqs', { headers: getHeaders() });
      if (res.ok) setFaqs(await res.json());
    } catch (e) {}
  };

  const fetchTicketDetails = async (id) => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + `/api/support/tickets/${id}`, { headers: getHeaders() });
      if (res.ok) {
        setSelectedTicket(await res.json());
        setIsModalOpen(true);
      }
    } catch (e) {}
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + `/api/support/tickets/${selectedTicket.ticketId}/reply`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message: replyMessage, isInternalNote })
      });
      if (res.ok) {
        setReplyMessage('');
        setIsInternalNote(false);
        fetchTicketDetails(selectedTicket.ticketId);
      }
    } catch (e) {}
  };

  const changeStatus = async (status) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + `/api/support/tickets/${selectedTicket.ticketId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchTicketDetails(selectedTicket.ticketId);
        fetchTickets();
        fetchDashboard();
      }
    } catch (e) {}
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingFaq ? (import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + `/api/support/faqs/${editingFaq.id}` : (import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/support/faqs';
      const method = editingFaq ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(faqForm)
      });
      
      if (res.ok) {
        setIsFaqModalOpen(false);
        setEditingFaq(null);
        setFaqForm({ question: '', answer: '', category: 'General' });
        fetchFaqs();
      }
    } catch (e) {}
  };

  const deleteFaq = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + `/api/support/faqs/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) fetchFaqs();
    } catch (e) {}
  };

  const openFaqModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category });
    } else {
      setEditingFaq(null);
      setFaqForm({ question: '', answer: '', category: 'General' });
    }
    setIsFaqModalOpen(true);
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch = t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'WAITING_FOR_USER': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'WAITING_FOR_ADMIN': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Low': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <ErrorBoundary>
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Help Admin</h1>
          <p className="text-slate-500">Manage user issues, feature requests, and FAQs.</p>
        </div>
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200">
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'tickets' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tickets
          </button>
          <button 
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'faqs' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Knowledge Base
          </button>
        </div>
      </div>

      {activeTab === 'tickets' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Dashboard Stats */}
          {dashboard && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Tickets</p>
                  <p className="text-2xl font-bold text-slate-800">{dashboard.totalTickets}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><MessageSquare /></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Open & In Progress</p>
                  <p className="text-2xl font-bold text-slate-800">{dashboard.openTickets + dashboard.inProgressTickets}</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center"><Clock /></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Critical Issues</p>
                  <p className="text-2xl font-bold text-slate-800">{dashboard.criticalIssues}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center"><AlertCircle /></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Resolved</p>
                  <p className="text-2xl font-bold text-slate-800">{dashboard.resolvedTickets}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center"><CheckCircle /></div>
              </div>
            </div>
          )}

          {/* Filters & Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Search className="text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search ticket ID or subject..." 
                  className="bg-transparent border-none focus:ring-0 text-sm w-64" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-slate-400" size={18} />
                <select 
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-primary/50 cursor-pointer text-slate-700"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="WAITING_FOR_USER">Waiting For User</option>
                  <option value="WAITING_FOR_ADMIN">Waiting For Admin</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Ticket</th>
                    <th className="p-4 font-semibold">Subject</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Priority</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.map(ticket => (
                    <tr key={ticket.ticketId} className="hover:bg-slate-50/80 transition-colors cursor-pointer group" onClick={() => fetchTicketDetails(ticket.ticketId)}>
                      <td className="p-4">
                        <span className="font-mono text-sm font-semibold text-slate-700">{ticket.ticketId}</span>
                        <div className="text-xs text-slate-400 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">{ticket.title}</div>
                        <div className="text-xs text-slate-500 truncate mt-1">{ticket.description}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                          <Tag size={12} /> {ticket.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                          <Flag size={12} /> {ticket.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                          {ticket.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={(e) => { e.stopPropagation(); fetchTicketDetails(ticket.ticketId); }} className="px-3 py-1.5 text-primary bg-primary/10 hover:bg-primary hover:text-white text-xs font-bold rounded-lg transition-colors">
                          View & Reply
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">No tickets found matching filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-slate-800">{selectedTicket.ticketId}</h2>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status?.replace(/_/g, ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <h3 className="font-medium text-slate-600">{selectedTicket.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium cursor-pointer"
                    value={selectedTicket.status}
                    onChange={(e) => changeStatus(e.target.value)}
                  >
                    <option value="OPEN">Mark Open</option>
                    <option value="IN_PROGRESS">Mark In Progress</option>
                    <option value="WAITING_FOR_USER">Mark Waiting For User</option>
                    <option value="RESOLVED">Mark Resolved</option>
                    <option value="CLOSED">Mark Closed</option>
                  </select>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full hover:bg-slate-100 transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left side: Conversation */}
                <div className="flex-1 flex flex-col border-r border-slate-100 overflow-hidden relative bg-slate-50/30">
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Original Issue */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                        <User className="text-slate-500" size={20} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">User</span>
                          <span className="text-xs font-medium text-slate-400">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                          {selectedTicket.description}
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {selectedTicket.replies?.map((reply, i) => (
                      <div key={i} className={`flex gap-4 ${reply.sender === 'ADMIN' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${reply.sender === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                          {reply.sender === 'ADMIN' ? <ShieldAlert size={20} /> : <User size={20} />}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className={`flex items-center justify-between ${reply.sender === 'ADMIN' ? 'flex-row-reverse' : ''}`}>
                            <span className="font-bold text-slate-800">{reply.sender === 'ADMIN' ? 'Support Admin' : 'User'}</span>
                            <div className="flex items-center gap-2">
                              {reply.isInternalNote && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">INTERNAL NOTE</span>}
                              <span className="text-xs font-medium text-slate-400">{new Date(reply.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${reply.isInternalNote ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tr-none' : reply.sender === 'ADMIN' ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                            {reply.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Box */}
                  <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={isInternalNote} onChange={(e) => setIsInternalNote(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500" />
                        <span className={isInternalNote ? 'text-amber-600 font-bold' : ''}>Add as Internal Note (Hidden from user)</span>
                      </label>
                      <div className="flex gap-2">
                        <button onClick={() => setReplyMessage("Thank you for reaching out. We have investigated the issue and... ")} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded">Template: Generic</button>
                        <button onClick={() => setReplyMessage("Could you please provide a screenshot of what you're seeing?")} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded">Template: Request Screenshot</button>
                      </div>
                    </div>
                    <div className={`flex items-end gap-3 p-2 rounded-2xl border-2 transition-colors ${isInternalNote ? 'bg-amber-50 border-amber-200 focus-within:border-amber-400' : 'bg-slate-50 border-slate-200 focus-within:border-primary/50'} focus-within:bg-white`}>
                      <button className="p-2 text-slate-400 hover:text-primary transition-colors shrink-0">
                        <Paperclip size={20} />
                      </button>
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder={isInternalNote ? "Type an internal note for admins..." : "Type your reply to the user..."}
                        className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-sm py-2 px-1"
                        rows="3"
                      />
                      <button 
                        onClick={handleReply}
                        disabled={!replyMessage.trim()}
                        className={`p-3 rounded-xl shrink-0 transition-all shadow-sm flex items-center justify-center ${replyMessage.trim() ? (isInternalNote ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20' : 'bg-primary hover:bg-emerald-600 text-white shadow-primary/30') : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                        <Send size={18} className={replyMessage.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right side: Metadata */}
                <div className="w-full lg:w-80 bg-white p-6 overflow-y-auto border-l border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Ticket Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><Calendar size={14} /> Created</p>
                      <p className="text-sm font-medium text-slate-800">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><Tag size={14} /> Category</p>
                      <p className="text-sm font-medium text-slate-800">{selectedTicket.category}</p>
                    </div>

                    <div className="h-px bg-slate-100 my-4"></div>

                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">System Metadata</h3>
                    
                    <div className="bg-slate-50 p-3 rounded-xl space-y-3 border border-slate-100">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Browser</p>
                        <p className="text-sm font-medium text-slate-800">{selectedTicket.browser}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Operating System</p>
                        <p className="text-sm font-medium text-slate-800">{selectedTicket.os}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Device Type</p>
                        <p className="text-sm font-medium text-slate-800">{selectedTicket.device}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Knowledge Base</h2>
              <p className="text-slate-500 text-sm mt-1">Manage frequently asked questions to help users resolve issues faster.</p>
            </div>
            <button onClick={() => openFaqModal()} className="bg-primary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-primary/30 transition-all inline-flex items-center gap-2">
              <Plus size={18} /> Add FAQ
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold w-1/4">Category</th>
                    <th className="p-4 font-semibold w-2/4">Question & Answer</th>
                    <th className="p-4 font-semibold text-right w-1/4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {faqs.map(faq => (
                    <tr key={faq.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 align-top">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                          {faq.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800 mb-1">{faq.question}</div>
                        <div className="text-sm text-slate-500 line-clamp-2">{faq.answer}</div>
                      </td>
                      <td className="p-4 text-right align-top">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openFaqModal(faq)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => deleteFaq(faq.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {faqs.length === 0 && (
                    <tr>
                      <td colSpan="3" className="p-12 text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Lightbulb size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">No FAQs Found</h3>
                        <p className="text-slate-500 mb-4 text-sm">Create your first FAQ to start building the knowledge base.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* FAQ Form Modal */}
      <AnimatePresence>
        {isFaqModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80">
                <h2 className="text-xl font-bold text-slate-800">{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</h2>
                <button onClick={() => setIsFaqModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleFaqSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                  <select 
                    required
                    value={faqForm.category}
                    onChange={e => setFaqForm({...faqForm, category: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm font-medium"
                  >
                    <option value="General">General</option>
                    <option value="Account">Account</option>
                    <option value="Tracking">Tracking</option>
                    <option value="Rewards">Rewards</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Question</label>
                  <input 
                    type="text" 
                    required
                    value={faqForm.question}
                    onChange={e => setFaqForm({...faqForm, question: e.target.value})}
                    placeholder="E.g., How do I earn badges?"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Answer</label>
                  <textarea 
                    required
                    rows="4"
                    value={faqForm.answer}
                    onChange={e => setFaqForm({...faqForm, answer: e.target.value})}
                    placeholder="Provide a clear and helpful answer..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm resize-none"
                  ></textarea>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsFaqModalOpen(false)} className="flex-1 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 font-bold text-white bg-primary hover:bg-emerald-600 rounded-xl shadow-lg shadow-primary/30 transition-all">
                    {editingFaq ? 'Save Changes' : 'Create FAQ'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
    </ErrorBoundary>
  );
};

export default AdminSupport;
