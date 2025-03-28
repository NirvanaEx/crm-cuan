// src/components/ProfileMenu.jsx
import React, { useRef, useEffect } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import '../css/ProfileMenu.css'; // стили

export default function ProfileMenu({ isOpen, setIsOpen }) {
    const ref = useRef(null);

    // Закрываем меню при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setIsOpen]);

    return (
        <div className="profile-menu-wrapper" ref={ref}>
            {/* Кнопка-иконка (стрелочка) */}
            <div
                className="profile-menu-icon"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FaAngleUp /> : <FaAngleDown />}
            </div>

            {/* Сам дропдаун */}
            {isOpen && (
                <div className="profile-dropdown">
                    <div onClick={() => console.log('Settings')}>Settings</div>
                    <div onClick={() => console.log('Logout')}>Logout</div>
                </div>
            )}
        </div>
    );
}
