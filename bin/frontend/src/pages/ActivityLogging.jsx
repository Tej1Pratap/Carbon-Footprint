import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ActivityLogging = () => {
  const [category, setCategory] = useState('Transport');
  const [activityType, setActivityType] = useState('Car');
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState('km');
  const [message, setMessage] = useState('');
  
  const handleSave = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:8080/api/activity/log', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category, activityType, quantity, unit })
      });
      if (response.ok) {
        const data = await response.json();
        setMessage(`Success! Emissions added: ${data.emissionsKgCo2} kg CO2e`);
      } else {
        setMessage('Error saving activity');
      }
    } catch (err) {
      setMessage('Server error');
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#10b981' }}>Activity Logging</h2>
      {message && <div style={{ marginBottom: '15px', color: '#10b981' }}>{message}</div>}
      <form onSubmit={handleSave}>
        <div className="input-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px' }}>
            <option>Transport</option>
            <option>Electricity</option>
            <option>Food</option>
            <option>Shopping</option>
          </select>
        </div>
        <div className="input-group">
          <label>Activity Type</label>
          <input type="text" value={activityType} onChange={(e) => setActivityType(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Unit</label>
          <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary">Save Activity</button>
      </form>
    </div>
  );
};
export default ActivityLogging;
