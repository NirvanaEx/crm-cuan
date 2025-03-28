import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Loader from './Loader';
import { LoadingContext } from '../context/LoadingContext';
import '../css/Layout.css';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { isLoading } = useContext(LoadingContext);

    return (
        <div className="layout-container">
            <Sidebar isOpen={isSidebarOpen} />
            <div className="layout-main">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="layout-content" style={{ position: 'relative' }}>
                    <Outlet />
                    {isLoading && <Loader text="Загружаем данные..." />}
                </div>
            </div>
        </div>
    );
}
