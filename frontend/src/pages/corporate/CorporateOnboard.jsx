import React, { useState } from 'react';
import { Building2, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CorporateOnboard = () => {
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        companySize: '',
        country: '',
        sustainabilityTarget: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/corporate/organization/onboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to create organization');
            
            setSuccess(true);
            setTimeout(() => {
                navigate('/corporate');
            }, 2000);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome to {formData.name}!</h2>
                    <p className="text-slate-500 mb-6">Your corporate CSR portal is ready.</p>
                    <div className="flex justify-center mb-4">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm font-medium text-blue-600">Redirecting you to the Corporate Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white flex flex-col justify-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-8">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Corporate CSR Portal</h1>
                    <p className="text-blue-100 text-lg mb-8">
                        Set up your organization to start tracking Scope 1, 2, and 3 emissions, managing CSR budgets, and aggregating employee sustainability goals.
                    </p>
                    <ul className="space-y-4 text-blue-50">
                        <li className="flex items-center space-x-3">
                            <CheckCircle size={20} className="text-blue-300" />
                            <span>Centralized multi-tenant tracking</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <CheckCircle size={20} className="text-blue-300" />
                            <span>Anonymous employee benchmarking</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <CheckCircle size={20} className="text-blue-300" />
                            <span>Automated CSR reporting</span>
                        </li>
                    </ul>
                </div>
                
                <div className="p-12 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Register Organization</h2>
                    <p className="text-slate-500 mb-8">Enter your company details to become the Organization Admin.</p>
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Company Name</label>
                            <input 
                                type="text" name="name" required
                                value={formData.name} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Industry</label>
                                <select 
                                    name="industry" required
                                    value={formData.industry} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">Select Industry</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Company Size</label>
                                <select 
                                    name="companySize" required
                                    value={formData.companySize} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">Select Size</option>
                                    <option value="1-50">1-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-1000">201-1000 employees</option>
                                    <option value="1000+">1000+ employees</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Country</label>
                            <input 
                                type="text" name="country" required
                                value={formData.country} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="e.g. United States"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Primary Sustainability Target</label>
                            <input 
                                type="text" name="sustainabilityTarget" required
                                value={formData.sustainabilityTarget} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="e.g. Net Zero by 2030"
                            />
                        </div>

                        <button 
                            type="submit" disabled={loading}
                            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <span>Create Organization Workspace</span>
                                    <ArrowRight size={18} className="ml-2" />
                                </>
                            )}
                        </button>
                        
                        <div className="text-center mt-6">
                            <button type="button" onClick={() => navigate('/dashboard')} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                                Return to Personal Dashboard
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CorporateOnboard;
