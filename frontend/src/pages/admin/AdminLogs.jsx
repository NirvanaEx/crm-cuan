import React, { useState, useEffect } from 'react';
import UniversalTable from '../../components/UniversalTable';

export default function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const mockData = [
            { id: 1, user_id: 1, action_name: 'Login', date_creation: '2023-01-01' },
            { id: 2, user_id: 2, action_name: 'EditUser', date_creation: '2023-01-05' }
        ];
        setLogs(mockData);
    }, []);

    const columns = [
        { key: 'id', label: 'ID', width: '10%' },
        { key: 'user_id', label: 'ID пользователя', width: '20%' },
        { key: 'action_name', label: 'Действие', width: '40%' },
        { key: 'date_creation', label: 'Дата', width: '20%' }
    ];

    const filteredData = logs.filter(log =>
        Object.values(log).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
    );

    const handleDelete = (row) => {
        // Логи обычно не удаляют, но можно оставить для примера
        const confirmDelete = window.confirm('Удалить запись лога?');
        if (confirmDelete) {
            setLogs(prev => prev.filter(l => l.id !== row.id));
        }
    };

    const handleEdit = (row) => {
        alert(`Редактирование лога ID = ${row.id}`);
    };

    return (
        <div>
            <h1>Просмотр логов</h1>
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
