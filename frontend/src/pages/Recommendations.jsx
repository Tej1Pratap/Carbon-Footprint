import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, Plane, Zap, Utensils, Flame, Droplet, Leaf, 
  AlertTriangle, ArrowDownRight, ArrowRight, Info, PlusCircle, RefreshCcw, 
  BarChart2, Activity, Target
} from 'lucide-react';

const Recommendations = () => {
  const [tips, setTips] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);
  const navigate = useNavigate();

  const detailedTips = {
    car: [
      "Switch to public transit or carpooling at least twice a week.",
      "Ensure your tires are properly inflated to improve gas mileage.",
      "Avoid idling for more than 30 seconds to save fuel.",
      "Consider upgrading to a hybrid or electric vehicle (EV) for your next car."
    ],
    flight: [
      "Opt for direct flights, as takeoffs and landings use the most fuel.",
      "Pack lighter to reduce the total weight of the aircraft.",
      "Choose economy class; more passengers per plane means lower emissions per person.",
      "Invest in verified carbon offset programs for unavoidable flights."
    ],
    electricity: [
      "Switch all your home lighting to energy-efficient LED bulbs.",
      "Unplug electronics when not in use to eliminate phantom power drains.",
      "Use a smart thermostat to optimize heating and cooling when you're away.",
      "Wash clothes in cold water and air dry them when possible."
    ],
    food: [
      "Replace one meat-based meal per day with a plant-based alternative.",
      "Buy locally sourced and seasonal produce to reduce transportation emissions.",
      "Plan meals carefully to minimize food waste.",
      "Start composting your organic waste instead of sending it to landfills."
    ],
    heating: [
      "Lower your thermostat by 1-2 degrees in winter and wear a sweater.",
      "Ensure your home is properly insulated (windows, doors, attic).",
      "Service your HVAC system annually to maintain maximum efficiency.",
      "Use space heaters for specific rooms instead of heating the whole house."
    ],
    water: [
      "Install low-flow showerheads and faucet aerators.",
      "Fix any leaky taps immediately; a dripping tap wastes gallons of water.",
      "Only run the dishwasher and washing machine with full loads.",
      "Take shorter showers, aiming for 5 minutes or less."
    ],
    default: [
      "Review your daily habits to find small, consistent areas for improvement.",
      "Adopt a minimalist approach: reduce, reuse, and recycle.",
      "Educate your friends and family about the importance of sustainability.",
      "Track your carbon footprint regularly to stay aware of your impact."
    ]
  };

  const getDetailedTipsForType = (type) => {
    const lower = type.toLowerCase();
    if (lower.includes('car') || lower.includes('driving') || lower.includes('transport')) return detailedTips.car;
    if (lower.includes('flight') || lower.includes('air')) return detailedTips.flight;
    if (lower.includes('electric') || lower.includes('grid') || lower.includes('power')) return detailedTips.electricity;
    if (lower.includes('meat') || lower.includes('food') || lower.includes('beef')) return detailedTips.food;
    if (lower.includes('gas') || lower.includes('heat')) return detailedTips.heating;
    if (lower.includes('water')) return detailedTips.water;
    return detailedTips.default;
  };

  // Simulated AI Engine to generate dynamic, randomized recommendations based on actual user data
  const generateAIRecommendations = (activityLogs) => {
    if (!activityLogs || activityLogs.length === 0) return [];
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentActivity = activityLogs.filter(log => new Date(log.logDate) >= thirtyDaysAgo);
    
    const emissionsByCategory = recentActivity.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + log.emissionsKgCo2;
      return acc;
    }, {});

    const topCategories = Object.entries(emissionsByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const aiTemplates = {
      'Driving': [
        { icon: 'car', type: 'Car Transit', template: "AI Analysis: Opting for carpooling 3 days a week could save approx {val} kg CO2 this month." },
        { icon: 'car', type: 'Driving Efficiency', template: "AI Analysis: Ensuring optimal tire pressure and reducing idle time will cut your emissions by {val} kg CO2." }
      ],
      'Flight': [
        { icon: 'plane', type: 'Air Travel', template: "AI Analysis: Choosing direct flights instead of layovers for your next trip could save {val} kg CO2." }
      ],
      'Electricity': [
        { icon: 'bolt', type: 'Home Energy', template: "AI Analysis: Upgrading to a smart thermostat could reduce your grid usage, saving {val} kg CO2." },
        { icon: 'bolt', type: 'Power Management', template: "AI Analysis: Eliminating phantom power drains can surprisingly save {val} kg CO2 monthly." }
      ],
      'Food': [
        { icon: 'utensils', type: 'Dietary Choices', template: "AI Analysis: Swapping just two meat-based meals a week to plant-based saves {val} kg CO2." }
      ],
      'Heating': [
        { icon: 'fire', type: 'Heating Optimization', template: "AI Analysis: Lowering your thermostat by just 2 degrees in winter reduces emissions by {val} kg CO2." }
      ],
      'Water': [
        { icon: 'tint', type: 'Water Heating', template: "AI Analysis: Taking 5-minute showers instead of 10-minute ones saves energy worth {val} kg CO2." }
      ]
    };

    const generated = topCategories.map(([category, totalEmission]) => {
      let categoryKey = Object.keys(aiTemplates).find(k => category.toLowerCase().includes(k.toLowerCase())) || 'Electricity';
      const templates = aiTemplates[categoryKey] || aiTemplates['Electricity'];
      
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      
      // Calculate a randomized saving between 10% and 35% of their actual emission in this category
      const savingPercentage = 0.10 + (Math.random() * 0.25);
      const calculatedSaving = (totalEmission * savingPercentage).toFixed(1);
      
      return {
        type: category,
        icon: randomTemplate.icon,
        tip: randomTemplate.template.replace('{val}', calculatedSaving)
      };
    });

    while (generated.length < 3) {
      const generalSaving = (Math.random() * 15 + 5).toFixed(1);
      generated.push({
        type: 'Other Activities',
        icon: 'leaf',
        tip: `AI Analysis suggests that mindful consumption and recycling could further reduce your footprint by ${generalSaving} kg CO2.`
      });
    }

    return generated;
  };

  const generateRealAIRecommendations = async (activityLogs) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return null;

    try {
      const prompt = `
        Act as an expert sustainability AI. Analyze the following carbon emission logs for a user:
        ${JSON.stringify(activityLogs)}
        
        Generate exactly 3 highly personalized, actionable recommendations to reduce their carbon footprint based strictly on their highest emission categories.
        
        Respond ONLY with a valid JSON array of objects. Do not include markdown formatting like \`\`\`json.
        Each object must have exactly these keys:
        - "type": The exact category name this recommendation applies to (e.g., "Electricity", "Transport", "Food").
        - "icon": A string which must be exactly one of: "car", "plane", "bolt", "utensils", "fire", "tint", or "leaf".
        - "tip": A detailed 1-2 sentence recommendation. It MUST include a specific estimated number followed by "kg CO2" to show the potential savings (e.g., "Choosing to commute via train could save 24.5 kg CO2 this month.").
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) throw new Error("Gemini API Error");
      
      const data = await response.json();
      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);
    } catch (err) {
      console.error("Failed to generate real AI recommendations:", err);
      return null;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    const token = sessionStorage.getItem('token');
    try {
      const [recRes, logsRes] = await Promise.all([
        fetch(import.meta.env.VITE_API_URL + '/api/recommendations', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(import.meta.env.VITE_API_URL + '/api/activity/logs', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (recRes.ok && logsRes.ok) {
        const actualLogs = await logsRes.json();
        setLogs(actualLogs);
        
        if (actualLogs.length > 0) {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          if (apiKey) {
            const realTips = await generateRealAIRecommendations(actualLogs);
            if (realTips && realTips.length > 0) {
              setTips(realTips);
            } else {
              setTips(generateAIRecommendations(actualLogs));
            }
          } else {
            setTips(generateAIRecommendations(actualLogs));
          }
        } else {
          setTips(await recRes.json());
        }
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getEmissionFromTip = (tip) => {
    const match = tip?.match(/([\d.]+)\s*kg CO2/i);
    return match ? parseFloat(match[1]) : 0;
  };

  const getLucideIcon = (faIcon) => {
    switch (faIcon) {
      case 'car': return Car;
      case 'plane': return Plane;
      case 'bolt': return Zap;
      case 'utensils': return Utensils;
      case 'fire': return Flame;
      case 'tint': return Droplet;
      default: return Leaf;
    }
  };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentLogs = logs.filter(log => new Date(log.logDate) >= thirtyDaysAgo);
  const total30DayEmissions = recentLogs.reduce((sum, log) => sum + log.emissionsKgCo2, 0);

  const emissionsByCategory = recentLogs.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + log.emissionsKgCo2;
    return acc;
  }, {});
  
  const topCategory = Object.keys(emissionsByCategory).length > 0 
    ? Object.keys(emissionsByCategory).reduce((a, b) => emissionsByCategory[a] > emissionsByCategory[b] ? a : b) 
    : 'None';

  const hasRealTips = tips.length > 0 && tips[0].type !== 'General';

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pb-12 animate-pulse space-y-8">
        <div className="h-10 bg-slate-200 rounded-lg w-3/4 md:w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-white border border-slate-100 rounded-2xl shadow-sm"></div>
          <div className="h-32 bg-white border border-slate-100 rounded-2xl shadow-sm"></div>
          <div className="h-32 bg-white border border-slate-100 rounded-2xl shadow-sm"></div>
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-white border border-slate-100 rounded-2xl shadow-sm"></div>
          <div className="h-64 bg-white border border-slate-100 rounded-2xl shadow-sm"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto pb-12 text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm mt-6">
        <AlertTriangle size={64} className="mx-auto text-red-400 mb-6" />
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Oops! Something went wrong.</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">We couldn't load your personalized recommendations right now. Please check your connection and try again.</p>
        <button onClick={fetchData} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 mx-auto transition-colors shadow-md">
          <RefreshCcw size={18} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in relative">
      {/* Detailed Modal */}
      {selectedRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up relative">
            <div className="bg-green-500 p-6 text-white relative">
              <button 
                onClick={() => setSelectedRec(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <PlusCircle className="rotate-45" size={24} />
              </button>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-white text-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  {React.createElement(getLucideIcon(selectedRec.icon), { size: 24 })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedRec.type}</h2>
                  <p className="text-green-100 text-sm font-medium">Reduction Strategy Guide</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <p className="text-slate-600 font-medium mb-6 leading-relaxed">
                To maximize your impact and lower your {selectedRec.type.toLowerCase()} emissions, try adopting these actionable strategies:
              </p>
              
              <ul className="space-y-4">
                {getDetailedTipsForType(selectedRec.type).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ArrowRight size={14} />
                    </div>
                    <span className="text-slate-700 font-medium text-sm leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSelectedRec(null)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <span className="text-green-500 text-3xl leading-none">✨</span> AI Personalized Recommendations
        </h1>
      </div>

      {hasRealTips ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between group hover:shadow-md transition-all duration-300">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last 30 Days</p>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{total30DayEmissions.toFixed(1)} <span className="text-base text-slate-400 font-medium">kg CO₂</span></h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300"><BarChart2 size={24}/></div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between group hover:shadow-md transition-all duration-300">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Top Category</p>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight truncate max-w-[150px]">{topCategory}</h3>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 group-hover:bg-red-100 transition-all duration-300"><Activity size={24}/></div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between group hover:shadow-md transition-all duration-300">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Insights Generated</p>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{tips.length}</h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 group-hover:bg-green-100 transition-all duration-300"><Target size={24}/></div>
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-6">
            {tips.map((rec, idx) => {
              const emission = getEmissionFromTip(rec.tip);
              const percentage = total30DayEmissions > 0 ? ((emission / total30DayEmissions) * 100).toFixed(1) : 0;
              const priority = percentage > 40 ? 'High' : percentage > 15 ? 'Medium' : 'Low';
              const priorityColor = priority === 'High' ? 'bg-red-100 text-red-700 border-red-200' : priority === 'Medium' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-green-100 text-green-700 border-green-200';
              const potentialReduction = (emission * 0.2).toFixed(1);
              
              const Icon = getLucideIcon(rec.icon);

              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  <div className="flex flex-col lg:flex-row">
                    
                    {/* Left column: Stats */}
                    <div className="bg-slate-50/50 p-5 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-center items-center lg:w-1/3 text-center transition-colors group-hover:bg-slate-50">
                      <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-md">
                        <Icon size={28} className="text-green-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{rec.type}</h3>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Activity Type</p>
                      
                      <div className="text-2xl font-bold text-slate-800 tracking-tight mb-2 group-hover:text-green-600 transition-colors">
                        {emission.toFixed(1)} <span className="text-sm text-slate-500 font-semibold">kg CO₂</span>
                      </div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 shadow-sm">
                        <ArrowDownRight size={12} className="text-rose-500"/> {percentage}% of total
                      </div>
                    </div>

                    {/* Right column: Details */}
                    <div className="p-5 lg:w-2/3 flex flex-col">
                      <div className="flex flex-wrap justify-between items-center mb-3 gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm ${priorityColor}`}>
                          {priority} Priority
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm">
                          <Leaf size={12}/> Savings: ~{potentialReduction} kg
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-800 mb-2">Recommendation</h4>
                      <p className="text-slate-600 leading-relaxed mb-4 text-sm">{rec.tip}</p>

                      <div className="mt-auto bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-start gap-2.5">
                        <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
                        <div>
                          <h5 className="font-semibold text-slate-800 mb-0.5 text-xs">Why this recommendation?</h5>
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            This activity is among your top emitters over the last 30 days. Focusing on high-impact areas yields the fastest progress toward your sustainability goals.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={() => setSelectedRec(rec)}
                          className="text-green-600 hover:text-green-700 font-bold text-xs flex items-center gap-1 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Learn More <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <span className="text-4xl">🌱</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">No recommendations available yet.</h2>
          <p className="text-slate-500 text-base max-w-lg mb-8 leading-relaxed">
            Start logging your daily activities to receive personalized AI recommendations and insights on how to reduce your carbon footprint.
          </p>
          <button 
            onClick={() => navigate('/activity')}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <PlusCircle size={20} /> Log Your First Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
