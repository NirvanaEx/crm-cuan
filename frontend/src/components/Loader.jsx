// src/components/Loader.jsx
import React from 'react';
import '../css/Loader.css';

/**
 * Кольцо из 12 сегментов. Подсветка бегает по сегментам, а само кольцо статично.
 * Используется как оверлей, который накладывается поверх контента.
 * @param {string} text - Текст, отображаемый под лоадером
 */
export default function Loader({ text = "Загрузка..." }) {
    const segments = Array.from({ length: 12 }, (_, i) => i);

    return (
        <div className="loader-overlay">
            <div className="loader-container">
                <div className="loader-ring">
                    {segments.map((_, index) => (
                        <div className="loader-segment" key={index}></div>
                    ))}
                </div>
                <div className="loader-text">{text}</div>
            </div>
        </div>
    );
}
