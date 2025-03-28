import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Preloader from './components/Preloader';
import { ThemeContext } from './context/ThemeContext';
import { LoadingProvider } from './context/LoadingContext';
import Questions from "./pages/Questions";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminAccess from "./pages/admin/AdminAccess";
import AdminSessions from "./pages/admin/AdminSessions";
import AdminLogs from "./pages/admin/AdminLogs";

function App() {
    const [progress, setProgress] = useState(0);
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    if (progress < 100) {
        return <Preloader progress={progress} />;
    }

    return (
        <LoadingProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route
                        path="questions"
                        element={
                            <ProtectedRoute allowedRoles={['superadmin','admin','manager']}>
                                <Questions />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="admin/users"
                        element={
                            <ProtectedRoute allowedRoles={['superadmin','admin']}>
                                <AdminUsers />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="admin/roles"
                        element={
                            <ProtectedRoute allowedRoles={['superadmin']}>
                                <AdminRoles />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="admin/access"
                        element={
                            <ProtectedRoute allowedRoles={['superadmin']}>
                                <AdminAccess />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="admin/sessions"
                        element={
                            <ProtectedRoute allowedRoles={['superadmin','admin']}>
                                <AdminSessions />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="admin/logs"
                        element={
                            <ProtectedRoute allowedRoles={['superadmin','admin']}>
                                <AdminLogs />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </LoadingProvider>
    );
}

export default App;
