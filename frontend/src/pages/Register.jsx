import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Leaf, Award, Shield, Users, ArrowLeft, Globe, Briefcase } from 'lucide-react';
import GoogleTranslate from '../components/GoogleTranslate';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/auth/google', {
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
        setError(data.error || 'Google sign-up failed');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) { 
        navigate(`/verify-email?email=${encodeURIComponent(email)}`); 
      } else { 
        const data = await response.json(); 
        setError(data.error || 'Registration failed'); 
      }
    } catch (err) { setError('Could not connect to server'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex w-full relative">
      <div className="absolute top-4 right-4 z-50">
        <GoogleTranslate />
      </div>
      {/* Left Panel - Dynamic Info Section */}
      <div className="hidden lg:flex w-1/2 text-white flex-col justify-between p-12 relative overflow-hidden transition-colors duration-500 bg-green-600">
        {/* Background decorative elements */}
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob transition-colors duration-500 bg-green-500"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 transition-colors duration-500 bg-emerald-400"></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center hover:text-white transition-colors mb-12 text-green-100">
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center space-x-3 mb-16">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center transition-colors duration-500 text-green-600">
              <Leaf size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight">EcoTrack</span>
          </div>

          <h1 className="text-5xl font-extrabold leading-tight mb-6 transition-all duration-500">
            Start where<br />you are today.
          </h1>
          <p className="text-lg mb-12 max-w-md leading-relaxed transition-colors duration-500 text-green-100">
            Create an account in minutes and get a crystal clear picture of your carbon footprint from day one. Join the movement.
          </p>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border transition-colors duration-500 bg-green-500/50 border-green-400/30">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Secure & Private</h3>
                <p className="text-sm mt-1 transition-colors duration-500 text-green-100">
                  Your data is yours. We just help you analyze it.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border transition-colors duration-500 bg-green-500/50 border-green-400/30">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Global Community</h3>
                <p className="text-sm mt-1 transition-colors duration-500 text-green-100">
                  See your impact in the context of thousands of others.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm font-medium transition-colors duration-500 text-green-200">
          Measure • Reduce • Sustain
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create Account</h2>
            <p className="text-slate-500 mt-2">Join EcoTrack and start measuring today <span role="img" aria-label="sprout">🌱</span></p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}



          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
              <input 
                type="text" 
                placeholder="Choose a username"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none bg-slate-50 focus:bg-white text-slate-800"
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none bg-slate-50 focus:bg-white text-slate-800"
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input 
                type="password" 
                placeholder="Create a strong password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none bg-slate-50 focus:bg-white text-slate-800"
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 bg-green-600 hover:bg-green-700 shadow-green-600/30"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
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
                text="signup_with"
                width="100%"
              />
            </div>
          </form>
          
          <p className="text-center mt-8 text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-bold transition-colors">
              Log in instead
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

export default Register;
