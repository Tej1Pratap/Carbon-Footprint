import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Leaf, TrendingUp, Target, Globe, ArrowLeft } from 'lucide-react';
import GoogleTranslate from '../components/GoogleTranslate';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Google login failed');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        if (data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/activity');
        }
      } else {
        if (data.error && data.error.toLowerCase().includes('not verified')) {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        } else {
          setError(data.error || 'Login failed');
        }
      }
    } catch (err) { setError('Could not connect to server'); } 
    finally { setLoading(false); }
  };
  
  return (
    <div className="min-h-screen flex w-full relative">
      <div className="absolute top-4 right-4 z-50">
        <GoogleTranslate />
      </div>
      {/* Left Panel - Green Info Section */}
      <div className="hidden lg:flex w-1/2 bg-green-600 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center text-green-100 hover:text-white transition-colors mb-12">
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center space-x-3 mb-16">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600">
              <Leaf size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight">EcoTrack</span>
          </div>

          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Welcome back to<br />a greener world.
          </h1>
          <p className="text-green-100 text-lg mb-12 max-w-md leading-relaxed">
            Log in to pick up where you left off — your emissions history, sustainability streaks, and personalized goals are waiting for you.
          </p>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-500/50 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-green-400/30">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Daily & Weekly Trends</h3>
                <p className="text-green-100 text-sm mt-1">Monitor your footprint effortlessly.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-500/50 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-green-400/30">
                <Target size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Personalized Goals</h3>
                <p className="text-green-100 text-sm mt-1">Small changes tracked and celebrated.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-green-200 text-sm font-medium">
          Measure • Reduce • Sustain
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Log in to your EcoTrack account</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium mb-6 border border-green-100">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none bg-slate-50 focus:bg-white text-slate-800"
                required 
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <input 
                type="password" 
                placeholder="Enter your password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none bg-slate-50 focus:bg-white text-slate-800"
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">or continue with</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="flex justify-center w-full [&>div]:w-full [&_iframe]:w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Sign-In failed')}
                useOneTap
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
              />
            </div>
          </form>
          
          <p className="text-center mt-8 text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-600 hover:text-green-700 font-bold transition-colors">
              Create an account
            </Link>
          </p>
          <p className="text-center mt-4 text-xs text-slate-400 font-medium">
            Having trouble?{' '}
            <a href="mailto:tejpratap11102@gmail.com" className="text-emerald-500 hover:text-emerald-600 font-bold transition-colors">
              Contact Help
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
