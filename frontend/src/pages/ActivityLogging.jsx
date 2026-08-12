import React, { useState, useRef, useEffect } from 'react';
import { Car, Zap, Utensils, ShoppingBag, Leaf, PlusCircle, AlertCircle } from 'lucide-react';

const ActivityLogging = () => {
  const [category, setCategory] = useState('Transport');
  const [customCategory, setCustomCategory] = useState('');
  const [activityType, setActivityType] = useState('Car');
  const [customActivityType, setCustomActivityType] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState('km');
  
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const bannerRef = useRef(null);

  useEffect(() => {
    if (successData && bannerRef.current) {
      bannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [successData]);

  // Define category -> activity types -> default unit
  const categoryData = {
    Transport: {
      Car: 'km',
      Flight: 'km',
      'Public Transit': 'km',
      Bike: 'km',
      Truck: 'km'
    },
    Electricity: {
      Grid: 'kWh'
    },
    Food: {
      'Meat Meal': 'servings',
      'Vegan Meal': 'servings'
    },
    Shopping: {
      Clothes: 'usd'
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Transport': return <Car size={22} className="text-blue-500" />;
      case 'Electricity': return <Zap size={22} className="text-yellow-500" />;
      case 'Food': return <Utensils size={22} className="text-orange-500" />;
      case 'Shopping': return <ShoppingBag size={22} className="text-purple-500" />;
      default: return <PlusCircle size={22} className="text-slate-500" />;
    }
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    
    if (newCategory !== 'Other' && categoryData[newCategory]) {
      const firstActivity = Object.keys(categoryData[newCategory])[0];
      setActivityType(firstActivity);
      setUnit(categoryData[newCategory][firstActivity]);
    } else {
      setActivityType('Other');
      setUnit('');
    }
  };

  const handleActivityChange = (e) => {
    const newActivity = e.target.value;
    setActivityType(newActivity);
    
    if (category !== 'Other' && newActivity !== 'Other') {
      setUnit(categoryData[category][newActivity]);
    } else if (newActivity === 'Other') {
      setUnit('');
    }
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    if (!token) return;
    
    try {
      const finalCategory = category === 'Other' ? customCategory : category;
      const finalActivityType = activityType === 'Other' ? customActivityType : activityType;

      const response = await fetch(import.meta.env.VITE_API_URL + '/api/activity/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          category: finalCategory, 
          activityType: finalActivityType, 
          quantity, 
          unit 
        })
      });
      if (response.ok) {
        const data = await response.json();
        setSuccessData({ emissions: data.emissionsKgCo2.toFixed(2) });
        setErrorMsg('');
        
        // Hide success message after 6 seconds to allow them to log again
        setTimeout(() => setSuccessData(null), 6000);
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        const errorText = await response.text();
        setErrorMsg(errorText || 'Error saving activity');
        setSuccessData(null);
      }
    } catch (err) {
      setErrorMsg('Server error');
      setSuccessData(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <style>
        {`
          @keyframes slideUpFade {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .glass-panel {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
        `}
      </style>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row">
        
        {/* Left Side: Image Banner */}
        <div className="lg:w-5/12 relative hidden md:block min-h-[400px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/activity_bg.jpg)' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-800/40 to-transparent flex flex-col justify-end p-10">
            <h3 className="text-white text-3xl font-bold mb-3">Track Your Impact</h3>
            <p className="text-green-50 text-lg opacity-90 leading-relaxed">
              Every sustainable choice you make helps reduce our collective carbon footprint. Log your activities and watch your positive impact grow.
            </p>
          </div>
        </div>

        {/* Right Side: Main Form Card */}
        <div className="lg:w-7/12 p-8 md:p-12 glass-panel">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2 flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-2xl text-green-600">
              <Leaf size={28} />
            </div>
            Log New Activity
          </h2>
          <p className="text-slate-500 mb-8 font-medium">Record your daily eco-friendly actions</p>
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-slide-up">
              <AlertCircle size={20} />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 transition-all hover:shadow-md hover:border-green-200">
              
              {/* Category and Activity Type */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full">
                  <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    {getCategoryIcon(category)} Select Activity & Category
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select 
                      value={category} 
                      onChange={handleCategoryChange} 
                      className="w-full sm:w-1/2 p-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium text-slate-700 shadow-sm"
                    >
                      <option>Transport</option>
                      <option>Electricity</option>
                      <option>Food</option>
                      <option>Shopping</option>
                      <option value="Other">Other</option>
                    </select>
                    
                    <select 
                      value={activityType} 
                      onChange={handleActivityChange} 
                      className="w-full sm:w-1/2 p-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium text-slate-700 shadow-sm"
                    >
                      {category !== 'Other' && categoryData[category] && Object.keys(categoryData[category]).map(act => (
                        <option key={act} value={act}>{act}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Custom Inputs if 'Other' is selected */}
                  {(category === 'Other' || activityType === 'Other') && (
                    <div className="flex gap-4 mt-4 animate-slide-up">
                      {category === 'Other' && (
                        <input 
                          type="text" 
                          value={customCategory} 
                          onChange={(e) => setCustomCategory(e.target.value)} 
                          placeholder="Custom category name..." 
                          className="w-1/2 p-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                          required 
                        />
                      )}
                      {activityType === 'Other' && (
                        <input 
                          type="text" 
                          value={customActivityType} 
                          onChange={(e) => setCustomActivityType(e.target.value)} 
                          placeholder="Custom activity name..." 
                          className="w-1/2 p-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                          required 
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quantity and Unit */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/2">
                  <label className="text-sm font-semibold text-slate-700 mb-3 block">Quantity</label>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))} 
                    className="w-full p-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium shadow-sm"
                    placeholder="Enter quantity"
                    required 
                  />
                </div>
                
                <div className="w-full sm:w-1/2">
                  <label className="text-sm font-semibold text-slate-700 mb-3 block">Unit</label>
                  <input 
                    type="text" 
                    value={unit} 
                    onChange={(e) => setUnit(e.target.value)} 
                    placeholder="e.g. km, kWh, servings" 
                    className={`w-full p-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium shadow-sm ${category !== 'Other' ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                    readOnly={category !== 'Other'}
                    required 
                  />
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-green-500/30 active:scale-[0.98] text-lg"
            >
              <Leaf size={22} /> Save Activity
            </button>
          </form>
        </div>
      </div>

      {/* Animated Success Banner matching reference image style */}
      {successData && (
        <div ref={bannerRef} className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-10 text-center shadow-lg animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <Leaf size={150} className="text-green-600 rotate-12" />
          </div>
          <div className="flex justify-center mb-6">
             <div className="bg-green-100 p-5 rounded-full text-green-600 animate-bounce shadow-inner border border-green-200">
                <Leaf size={48} />
             </div>
          </div>
          <h3 className="text-3xl font-extrabold text-green-900 mb-2 tracking-tight">Activity Saved!</h3>
          <p className="text-lg text-green-700 mb-6 font-medium">Estimated Carbon Emission</p>
          <div className="text-6xl font-black text-green-600 mb-4 tracking-tighter drop-shadow-sm">
             {successData.emissions} <span className="text-3xl font-bold ml-1 text-green-700">kg CO₂</span>
          </div>
          <p className="text-base text-green-800/80 font-medium max-w-md mx-auto">Every activity you log helps you understand and reduce your environmental impact.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogging;
