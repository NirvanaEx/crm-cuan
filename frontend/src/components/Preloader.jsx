// src/components/Preloader.jsx
import React from 'react';
import '../css/Preloader.css';

export default function Preloader({ progress }) {
    return (
        <div className="preloader-container">
            <div className="preloader-text">Loading... {progress}%</div>
            <div className="progress-bar">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}
