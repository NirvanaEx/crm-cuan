import React, { useState, useReducer, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Loader from './Loader';
import { LoadingContext } from '../context/LoadingContext';
import '../css/Layout.css';
import { FaRedo } from 'react-icons/fa';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { isLoading } = useContext(LoadingContext);
    const [refreshKey, forceUpdate] = useReducer(x => x + 1, 0);

    return (
        <div className="layout-container">
            <Sidebar isOpen={isSidebarOpen} />
            <div className="layout-main">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="layout-content" style={{ position: 'relative' }}>
                    <Outlet key={refreshKey} />
                    {isLoading && <Loader text="Загружаем данные..." />}
                    <button
                        onClick={forceUpdate}
                        className="reload-button"
                        aria-label="Обновить Layout"
                    >
                        <FaRedo size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
