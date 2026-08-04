import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Server, Globe, Shield, Bell, Check, X, AlertTriangle, RefreshCw } from 'lucide-react';

const AdminSettings = ({ isDarkMode }) => {
  const [settings, setSettings] = useState({
    siteName: 'Carbon Footprint Tracker',
    maintenanceMode: 'false',
    allowRegistration: 'true',
    adminEmail: 'admin@admin.com'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const newSettings = { ...settings };
        data.forEach(item => {
          newSettings[item.settingKey] = item.settingValue;
        });
        setSettings(newSettings);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load settings from server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Save each setting iteratively
      for (const [key, value] of Object.entries(settings)) {
        await fetch(import.meta.env.VITE_API_URL + '/api/admin/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          },
          body: JSON.stringify({ settingKey: key, settingValue: value })
        });
      }
      setMessage({ text: 'System configuration updated successfully.', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      setMessage({ text: 'Failed to update system configuration.', type: 'error' });
    }
    setIsSaving(false);
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: settings[key] === 'true' ? 'false' : 'true' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>System Settings</h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Configure global application parameters, security, and maintenance modes.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={fetchSettings} className={`p-2.5 rounded-xl border transition-all hover:scale-105 shadow-sm ${isDarkMode ? 'border-gray-700 text-slate-300 hover:bg-gray-800 hover:border-gray-600 bg-gray-800/50' : 'border-slate-200 text-slate-700 hover:bg-white bg-slate-50'}`} title="Refresh Settings">
            <RefreshCw size={18} />
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl flex items-center space-x-3 shadow-md ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400'}`}
          >
            {message.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* General Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-800/50 border-gray-700 shadow-lg shadow-black/20' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
          <div className={`px-6 py-5 border-b flex items-center space-x-3 ${isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Globe size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>General Preferences</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Basic information about the platform.</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-1">
                <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Platform Name</label>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Used in emails and public pages.</p>
              </div>
              <div className="md:col-span-2">
                <input 
                  type="text" 
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                />
              </div>
            </div>
            
            <div className={`h-px w-full ${isDarkMode ? 'bg-gray-700' : 'bg-slate-100'}`}></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-1">
                <label className={`block text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Admin Contact Email</label>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>For support inquiries and alerts.</p>
              </div>
              <div className="md:col-span-2">
                <input 
                  type="email" 
                  name="adminEmail"
                  value={settings.adminEmail}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-800/50 border-gray-700 shadow-lg shadow-black/20' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
          <div className={`px-6 py-5 border-b flex items-center space-x-3 ${isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Shield size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Security & Access</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Control who can access the platform.</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Allow New Registrations</p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>If disabled, only administrators can invite or create new users.</p>
              </div>
              <button 
                type="button"
                onClick={() => handleToggle('allowRegistration')}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-offset-gray-900' : ''} ${settings.allowRegistration === 'true' ? 'bg-primary' : (isDarkMode ? 'bg-gray-700' : 'bg-slate-300')}`}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.allowRegistration === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className={`h-px w-full ${isDarkMode ? 'bg-gray-700' : 'bg-slate-100'}`}></div>
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>Maintenance Mode</p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>When active, standard users will see a maintenance page. Admins can still log in.</p>
              </div>
              <button 
                type="button"
                onClick={() => handleToggle('maintenanceMode')}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-offset-gray-900' : ''} ${settings.maintenanceMode === 'true' ? 'bg-rose-500' : (isDarkMode ? 'bg-gray-700' : 'bg-slate-300')}`}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.maintenanceMode === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Form Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className={`px-8 py-3 rounded-xl font-bold shadow-lg flex items-center space-x-3 transition-all ${isSaving ? 'bg-primary/50 text-white cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-primary/40 hover:-translate-y-0.5'}`}
          >
            {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </motion.div>

      </form>
    </div>
  );
};

export default AdminSettings;
