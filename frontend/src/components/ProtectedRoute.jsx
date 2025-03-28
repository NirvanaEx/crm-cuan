// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, roles } = useContext(AuthContext);
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    // Если разрешены роли, проверяем, что пользователь имеет хотя бы одну из них
    if (allowedRoles && !roles.some(role => allowedRoles.includes(role.name))) {
        return <Navigate to="/unauthorized" replace />;
    }
    return children;
}
