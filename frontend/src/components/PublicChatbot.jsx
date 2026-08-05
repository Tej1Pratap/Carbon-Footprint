import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuickActions = ({ onSelect }) => {
  const actions = [
    "What is EcoTrack?",
    "How does carbon tracking work?",
    "Is it free to use?",
    "How do I sign up?",
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(action)}
          className="text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-full transition-colors text-left"
        >
          {action}
        </button>
      ))}
    </div>
  );
};

const ChatMessage = ({ message }) => {
  const isAi = message.sender === 'AI';
  
  return (
    <div className={`flex w-full mb-4 ${isAi ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] gap-2 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${isAi ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
          {isAi ? <Bot size={16} /> : <User size={16} />}
        </div>
        <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isAi ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm' : 'bg-green-500 text-white rounded-tr-sm'}`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
          <span className={`text-[10px] mt-1 block ${isAi ? 'text-slate-400' : 'text-green-100 text-right'}`}>
            {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

const PublicChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 0,
        sender: 'AI',
        content: "Hi there! 👋 I am the EcoTrack Assistant. How can I help you learn more about our platform today?",
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = {
      id: Date.now(),
      sender: 'USER',
      content: text,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const payload = {
        message: text,
        language: 'en'
      };

      const res = await fetch(import.meta.env.VITE_API_URL + '/api/chat/public', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'AI',
          content: data.response,
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error('API Error');
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'AI',
        content: "Sorry, I encountered an error connecting to the server.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-[0_8px_30px_rgba(22,163,74,0.4)] transition-transform hover:scale-110 z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquare size={26} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[85vh] bg-slate-50 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-200 z-50 flex flex-col overflow-hidden"
          >
            <div className="bg-green-600 p-4 text-white flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-bold leading-tight">EcoTrack Guide</h3>
                  <p className="text-green-100 text-xs">Public Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col">
              {messages.length <= 1 && (
                <QuickActions onSelect={handleSend} />
              )}
              
              {messages.map((msg, i) => (
                <ChatMessage key={msg.id || i} message={msg} />
              ))}
              
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center shadow-sm">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm"
                  disabled={isTyping}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PublicChatbot;
