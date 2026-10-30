import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const CorporateRoute = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [hasOrg, setHasOrg] = useState(false);

    useEffect(() => {
        const checkCorporateAccess = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch((import.meta.env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com') + '/api/corporate/organization/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    if (data.organization) {
                        setHasOrg(true);
                        setIsAuthorized(true); 
                        localStorage.setItem('corporateRole', data.role);
                        localStorage.setItem('corporateOrgName', data.organization.name);
                    }
                }
            } catch (e) {
                console.error('Error checking corporate access', e);
            }
            setIsLoading(false);
        };

        checkCorporateAccess();
    }, []);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading CSR Portal...</div>;
    }

    const userStr = (localStorage.getItem('user') || sessionStorage.getItem('user'));
    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    if (!isAuthorized) {
        if (window.location.pathname !== '/corporate/onboard') {
            return <Navigate to="/corporate/onboard" replace />;
        }
    }

    const corporateRole = localStorage.getItem('corporateRole');
    const isCorpAdmin = corporateRole === 'ORG_ADMIN' || corporateRole === 'CSR_MANAGER';
    
    const adminOnlyPaths = [
        '/corporate/dashboard',
        '/corporate/employees',
        '/corporate/departments',
        '/corporate/employee-activity',
        '/corporate/goals',
        '/corporate/emissions',
        '/corporate/scopes',
        '/corporate/benchmarking',
        '/corporate/recommendations',
        '/corporate/reports',
        '/corporate/badges',
        '/corporate/support',
        '/corporate/emission-factors'
    ];
    
    const path = window.location.pathname;
    
    if (!isCorpAdmin && (path === '/corporate' || path === '/corporate/' || adminOnlyPaths.some(p => path.startsWith(p)))) {
        return <Navigate to="/corporate/personal/dashboard" replace />;
    }

    return children;
};

export default CorporateRoute;
