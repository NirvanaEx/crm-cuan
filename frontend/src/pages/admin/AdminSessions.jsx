import React, { useState, useEffect } from 'react';
import UniversalTable from '../../components/UniversalTable';

export default function AdminSessions() {
    const [sessions, setSessions] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const mockData = [
            { id: 1, user_id: 1, device: 'Chrome', ip: '127.0.0.1', date_creation: '2023-01-10' },
            { id: 2, user_id: 2, device: 'Firefox', ip: '192.168.0.5', date_creation: '2023-02-11' }
        ];
        setSessions(mockData);
    }, []);

    const columns = [
        { key: 'id', label: 'ID', width: '10%' },
        { key: 'user_id', label: 'ID пользователя', width: '20%' },
        { key: 'device', label: 'Устройство', width: '20%' },
        { key: 'ip', label: 'IP', width: '20%' },
        { key: 'date_creation', label: 'Дата создания', width: '20%' }
    ];

    const filteredData = sessions.filter(s =>
        Object.values(s).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
    );

    const handleDelete = (row) => {
        const confirmDelete = window.confirm('Отозвать сессию?');
        if (confirmDelete) {
            setSessions(prev => prev.filter(sess => sess.id !== row.id));
        }
    };

    const handleEdit = (row) => {
        alert(`Редактирование сессии ID = ${row.id}`);
    };

    return (
        <div>
            <h1>Управление сессиями</h1>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Поиск..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <UniversalTable
                columns={columns}
                data={filteredData}
                itemsPerPage={5}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />
        </div>
    );
}
