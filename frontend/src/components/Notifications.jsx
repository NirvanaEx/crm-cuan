// src/components/Notifications.jsx
import React, { useRef, useEffect, useState } from 'react';
import { FaBell, FaEnvelopeOpenText, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../css/Notifications.css';

export default function Notifications({ isOpen, setIsOpen }) {
    const { t } = useTranslation();
    const ref = useRef(null);

    // Пример массива уведомлений (новые сверху)
    const [allNotifications, setAllNotifications] = useState([
        {
            id: 10,
            avatar: 'https://randomuser.me/api/portraits/women/10.jpg',
            sender: 'Sophie Welch',
            text: t('NOTIFICATION_10'),
            time: '2 days ago',
            unread: false,
        },
        {
            id: 9,
            avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
            sender: 'Sophie Welch',
            text: t('NOTIFICATION_9'),
            time: '2 days ago',
            unread: false,
        },
        {
            id: 8,
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            sender: 'Steve O’Reilly',
            text: t('NOTIFICATION_8'),
            time: 'a day ago',
            unread: false,
        },
        {
            id: 7,
            avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
            sender: 'Stephan Parker',
            text: t('NOTIFICATION_7'),
            time: 'a day ago',
            unread: false,
        },
        {
            id: 6,
            avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
            sender: 'John Smith',
            text: t('NOTIFICATION_6'),
            time: '5 hours ago',
            unread: true,
        },
        {
            id: 5,
            avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
            sender: 'Alice Johnson',
            text: t('NOTIFICATION_5'),
            time: '3 hours ago',
            unread: true,
        },
        {
            id: 4,
            avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
            sender: 'Bob Marshall',
            text: t('NOTIFICATION_4'),
            time: '2 hours ago',
            unread: true,
        },
        {
            id: 3,
            avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
            sender: 'Michael Brown',
            text: t('NOTIFICATION_3'),
            time: '1 hour ago',
            unread: true,
        },
        {
            id: 2,
            avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
            sender: 'Emily Green',
            text: t('NOTIFICATION_2'),
            time: '45 min ago',
            unread: true,
        },
        {
            id: 1,
            avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
            sender: 'David Wilson',
            text: t('NOTIFICATION_1'),
            time: '5 min ago',
            unread: true,
        },
    ]);

    // Состояние для развёрнутого списка уведомлений
    const [expanded, setExpanded] = useState(false);

    // Настраиваемый размер страницы: по умолчанию 5, при развёрнутом 20
    const pageSize = expanded ? 20 : 5;
    const [currentPage, setCurrentPage] = useState(1);

    // Сортируем уведомления (новые сверху)
    const sortedNotifications = [...allNotifications].sort((a, b) => b.id - a.id);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentNotifications = sortedNotifications.slice(startIndex, endIndex);

    const totalPages = Math.ceil(sortedNotifications.length / pageSize);

    // Количество непрочитанных уведомлений
    const unreadCount = allNotifications.filter(n => n.unread).length;

    // Закрытие при клике вне окна уведомлений
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpen]);

    // Пометить все уведомления как прочитанные
    const markAllAsRead = () => {
        const updated = allNotifications.map(n => ({ ...n, unread: false }));
        setAllNotifications(updated);
    };

    // При клике на уведомление пометить его как прочитанное
    const handleNotificationClick = (id) => {
        const updated = allNotifications.map(n =>
            n.id === id ? { ...n, unread: false } : n
        );
        setAllNotifications(updated);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const toggleExpand = () => {
        if (expanded) {
            setExpanded(false);
            setCurrentPage(1);
        } else {
            setExpanded(true);
            setCurrentPage(1);
        }
    };

    return (
        <div className="notifications-wrapper">
            {/* Иконка колокольчика */}
            <div
                className="notifications-icon"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
            >
                <FaBell/>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </div>

            {isOpen && (
                <div className="notifications-dropdown" ref={ref}>
                    <div className="notifications-header">
                        <span>{t('NOTIFICATIONS')}</span>
                        <FaEnvelopeOpenText
                            className="mark-all-read-icon"
                            title={t('MARK_ALL_AS_READ')}
                            onClick={markAllAsRead}
                        />
                    </div>
                    <div className="notifications-body">
                        {currentNotifications.map(n => (
                            <div
                                key={n.id}
                                className={`notification-item ${n.unread ? 'unread' : 'read'}`}
                                onClick={() => handleNotificationClick(n.id)}
                            >
                                <img src={n.avatar} alt="avatar" className="notification-avatar" />
                                <div className="notification-texts">
                                    <div className="notification-sender">{n.sender}</div>
                                    <div className="notification-message">{n.text}</div>
                                    <div className="notification-time">{n.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="notifications-footer">
                        {expanded && totalPages > 1 && (
                            <div className="pagination">
                                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                                    {t('PREV')}
                                </button>
                                <span>
                                    {currentPage} / {totalPages}
                                </span>
                                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                                    {t('NEXT')}
                                </button>
                            </div>
                        )}
                        <div className="toggle-expand" onClick={toggleExpand}>
                            {expanded ? <FaAngleUp title={t('COLLAPSE')} /> : <FaAngleDown title={t('EXPAND')} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
