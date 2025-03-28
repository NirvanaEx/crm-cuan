import React from 'react';
import '../css/StatCard.css'; // Стили для карточек статистики

export default function StatCard({ title, value, percentage, color }) {
    return (
        <div className="stat-card">
            <h4>{title}</h4>
            <div className="stat-info">
                <h2>{value}</h2>
                <span style={{ color }}>{percentage}</span>
            </div>
        </div>
    );
}
