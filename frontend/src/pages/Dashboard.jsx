import React from 'react';
import '../css/Dashboard.css';

export default function Dashboard() {
    return (
        <div>
            <h1>Dashboard Page</h1>
            {/* Здесь размещаются графики, карточки и другие элементы страницы */}
            <div className="stats-row">
                {/* Пример карточек статистики */}
                <div className="chart-section">
                    <h3>Статистика 1</h3>
                    <p>Данные...</p>
                </div>
                <div className="chart-section">
                    <h3>Статистика 2</h3>
                    <p>Данные...</p>
                </div>
                <div className="chart-section">
                    <h3>Статистика 3</h3>
                    <p>Данные...</p>
                </div>
                <div className="chart-section">
                    <h3>Статистика 4</h3>
                    <p>Данные...</p>
                </div>
            </div>
        </div>
    );
}
