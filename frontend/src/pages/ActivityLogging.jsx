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
    const token = localStorage.getItem('token');
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
    <div className="max-w-4xl mx-auto">
      <style>
        {`
          @keyframes slideUpFade {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}
      </style>

      {/* Main Form Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <Leaf className="text-green-500" size={28} />
          Log New Activity
        </h2>
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}
        
        <form onSubmit={handleSave}>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
            
            {/* Category and Activity Type (Horizontal Layout) */}
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="w-full">
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  {getCategoryIcon(category)} Select Activity & Category
                </label>
                <div className="flex gap-4">
                  <select 
                    value={category} 
                    onChange={handleCategoryChange} 
                    className="w-1/2 p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                    className="w-1/2 p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                        className="w-1/2 p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required 
                      />
                    )}
                    {activityType === 'Other' && (
                      <input 
                        type="text" 
                        value={customActivityType} 
                        onChange={(e) => setCustomActivityType(e.target.value)} 
                        placeholder="Custom activity name..." 
                        className="w-1/2 p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required 
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Quantity and Unit (Horizontal Layout) */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Quantity</label>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))} 
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter quantity"
                  required 
                />
              </div>
              
              <div className="w-full md:w-1/2">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Unit</label>
                <input 
                  type="text" 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)} 
                  placeholder="e.g. km, kWh, servings" 
                  className={`w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${category !== 'Other' ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                  readOnly={category !== 'Other'}
                  required 
                />
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <Leaf size={20} /> Save Activity
          </button>
        </form>
      </div>

      {/* Animated Success Banner matching reference image style */}
      {successData && (
        <div ref={bannerRef} className="mt-8 bg-green-100 border-2 border-green-200 rounded-2xl p-8 text-center shadow-sm animate-slide-up">
          <div className="flex justify-center mb-4">
             <div className="bg-green-200 p-4 rounded-full text-green-700 animate-bounce">
                <Leaf size={40} />
             </div>
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">Activity Added Successfully</h3>
          <p className="text-md text-green-700 mb-4 font-medium">Estimated Carbon Emission</p>
          <div className="text-5xl font-extrabold text-green-700 mb-4 tracking-tight">
             {successData.emissions} <span className="text-2xl font-bold ml-1">kg CO₂</span>
          </div>
          <p className="text-sm text-green-600/80 font-medium">Every activity you log helps you understand your environmental impact.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogging;
