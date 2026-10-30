import React, { useState, useEffect } from 'react';
import CSRDashboard from './CSRDashboard';
import EmployeeCSR from './EmployeeCSR';

const CorporateCSRWrapper = ({ isDarkMode }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/corporate/organization/me', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If the user is an ORG_ADMIN or CSR_MANAGER, they get the admin dashboard. 
  // Otherwise, they get the employee view to join projects.
  if (role === 'ORG_ADMIN' || role === 'CSR_MANAGER') {
    return <CSRDashboard isDarkMode={isDarkMode} />;
  } else {
    return <EmployeeCSR isDarkMode={isDarkMode} />;
  }
};

export default CorporateCSRWrapper;
