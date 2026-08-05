import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Activity, Target, Trophy, Lightbulb, ArrowRight, CheckCircle2, ShieldCheck, Zap, Globe, Cloud, LineChart, Users, Smile } from 'lucide-react';
import GoogleTranslate from '../components/GoogleTranslate';
import PublicChatbot from '../components/PublicChatbot';

const StatCard = ({ icon, label, endValue, suffix = '' }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = endValue / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= endValue) {
        setValue(endValue);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [endValue]);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-100 shadow-lg hover:shadow-green-500/20 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-600">
        {icon}
      </div>
      <h3 className="text-3xl font-extrabold text-slate-800 mb-2">{value.toLocaleString()}{suffix}</h3>
      <p className="text-slate-500 font-medium">{label}</p>
    </div>
  );
};

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Activity className="w-6 h-6 text-green-500" />,
      title: 'Real-time Tracking',
      description: 'Log and monitor your daily transport, energy, and consumption activities instantly.'
    },
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      title: 'Smart Goals',
      description: 'Set personalized sustainability targets and get AI-powered recommendations to achieve them.'
    },
    {
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      title: 'Gamification',
      description: 'Earn badges, climb the leaderboard, and compete with friends for a greener planet.'
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-purple-500" />,
      title: 'Deep Analytics',
      description: 'Visualize your carbon footprint trends over time with beautiful, interactive charts.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-green-200">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Leaf className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent hidden sm:block">
                EcoTrack
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <GoogleTranslate />
              <Link to="/login" className="text-slate-600 hover:text-green-600 font-medium transition-colors hidden sm:block">
                Log In
              </Link>
              <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-medium transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/40 hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden relative">
        {/* Background Image with Slow Zoom */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url('/images/premium_hero_bg.jpg')] animate-slow-zoom"></div>
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-black/65 z-0"></div>
        
        {/* Floating Sustainability Icons */}
        <div className="absolute top-40 left-[10%] w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center animate-float animation-delay-1000 shadow-2xl z-10 hidden md:flex">
          <Globe className="text-green-400 w-8 h-8" />
        </div>
        <div className="absolute bottom-40 right-[15%] w-20 h-20 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center animate-float animation-delay-3000 shadow-2xl z-10 hidden lg:flex">
          <Leaf className="text-emerald-400 w-10 h-10" />
        </div>
        <div className="absolute top-60 right-[10%] w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center animate-float shadow-2xl z-10 hidden md:flex">
          <Cloud className="text-blue-300 w-7 h-7" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center max-w-4xl mx-auto animate-fadeIn">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-green-300 text-sm font-semibold mb-8 border border-white/20 shadow-lg">
              <Zap size={16} className="text-green-400" />
              <span>The #1 Premium Carbon Tracking Platform</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-tight mb-8 drop-shadow-2xl">
              Track, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Reduce</span>, and Sustain.
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed max-w-3xl mx-auto font-light drop-shadow-lg">
              Take control of your environmental impact. Log your daily activities, discover actionable insights, and join a global community fighting climate change.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/register" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-5 rounded-full font-bold transition-all duration-300 shadow-2xl shadow-green-500/40 hover:scale-105 text-xl">
                <span>Start Your Journey</span>
                <ArrowRight size={24} />
              </Link>
              <Link to="/login" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-10 py-5 rounded-full font-bold transition-all duration-300 border border-white/30 hover:scale-105 shadow-xl text-xl">
                Log In to Dashboard
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center space-x-8 text-sm font-medium text-gray-300 drop-shadow-md">
              <div className="flex items-center space-x-2"><CheckCircle2 size={18} className="text-green-400"/><span>Free Forever</span></div>
              <div className="flex items-center space-x-2"><ShieldCheck size={18} className="text-green-400"/><span>Secure Data</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 border-b border-slate-100 relative z-30 -mt-16 bg-cover bg-center" style={{ backgroundImage: "url('/images/stats_bg.jpg')" }}>
        <div className="absolute inset-0 bg-white/40 z-0 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Activity size={28} />} label="Activities Logged" endValue={125000} suffix="+" />
            <StatCard icon={<Users size={28} />} label="Active Users" endValue={45000} suffix="+" />
            <StatCard icon={<Leaf size={28} />} label="Emissions Reduced (kg)" endValue={850000} suffix="+" />
            <StatCard icon={<Smile size={28} />} label="User Satisfaction" endValue={99} suffix="%" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/images/features_bg.jpg')" }}>
        <div className="absolute inset-0 bg-white/20 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to make an impact</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Our comprehensive toolkit helps you understand and minimize your carbon footprint effortlessly.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-green-200 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 text-white relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed bg-[url('/images/dark_eco_bg.jpg')]">
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-slate-900/85 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Three simple steps to start reducing your carbon footprint.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent -translate-y-1/2"></div>
            
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-slate-800 border-4 border-slate-900 rounded-full flex items-center justify-center text-2xl font-bold text-green-400 mb-6 shadow-xl shadow-black/50 z-10 relative">1</div>
              <h3 className="text-xl font-bold mb-3">Create an Account</h3>
              <p className="text-slate-400">Sign up securely and complete your quick sustainability profile.</p>
            </div>
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-slate-800 border-4 border-slate-900 rounded-full flex items-center justify-center text-2xl font-bold text-green-400 mb-6 shadow-xl shadow-black/50 z-10 relative">2</div>
              <h3 className="text-xl font-bold mb-3">Log Activities</h3>
              <p className="text-slate-400">Input your travel, energy usage, and dietary habits effortlessly.</p>
            </div>
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-slate-800 border-4 border-slate-900 rounded-full flex items-center justify-center text-2xl font-bold text-green-400 mb-6 shadow-xl shadow-black/50 z-10 relative">3</div>
              <h3 className="text-xl font-bold mb-3">Track & Improve</h3>
              <p className="text-slate-400">Watch your footprint shrink over time with AI-driven insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-green-600 to-emerald-800 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to make a difference?</h2>
          <p className="text-xl text-green-100 mb-10">Join thousands of users who are already tracking and reducing their carbon emissions.</p>
          <Link to="/register" className="inline-flex items-center space-x-2 bg-white text-green-700 hover:bg-slate-50 px-8 py-4 rounded-full font-bold transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl text-lg">
            <span>Create Your Free Account</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Leaf className="text-green-500 w-6 h-6" />
            <span className="text-xl font-bold text-slate-800">EcoTrack</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} EcoTrack. All rights reserved. Designed for a greener future.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/login" className="text-slate-500 hover:text-green-600 text-sm font-medium">Log In</Link>
            <Link to="/register" className="text-slate-500 hover:text-green-600 text-sm font-medium">Sign Up</Link>
          </div>
        </div>
      </footer>
      <PublicChatbot />
    </div>
  );
};

export default Landing;
