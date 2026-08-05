import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userStr);
        if (user.role !== 'ADMIN') {
            // Redirect non-admins to the regular dashboard
            return <Navigate to="/dashboard" replace />;
        }
    } catch (e) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminRoute;
