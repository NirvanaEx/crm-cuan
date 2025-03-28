import React, { useState, useEffect, useContext } from 'react';
import UniversalTable from '../components/UniversalTable';
import { LoadingContext } from '../context/LoadingContext';
import { useTranslation } from 'react-i18next';
import '../css/Questions.css';

export default function Questions() {
    const { setIsLoading } = useContext(LoadingContext);
    const { t } = useTranslation();

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const initialData = [
        { id: 1, question: 'Что такое React?', date: '2023-01-01' },
        { id: 2, question: 'Как работает useState?', date: '2023-01-02' },
        { id: 3, question: 'Что такое JSX?', date: '2023-01-03' },
        { id: 4, question: 'Как обновить состояние?', date: '2023-01-04' },
        { id: 5, question: 'Что такое пропсы?', date: '2023-01-05' },
        { id: 6, question: 'Как происходит рендеринг?', date: '2023-01-06' },
        { id: 7, question: 'Как работают хуки?', date: '2023-01-07' }
    ];

    const [questions, setQuestions] = useState(initialData);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({});

    const filteredQuestions = questions.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
    );

    const columns = [
        { key: 'id', label: 'Номер вопроса', width: '10%' },
        { key: 'question', label: 'Вопрос', width: '60%' },
        { key: 'date', label: 'Дата создания', width: '20%' }
    ];

    const handleDelete = (row) => {
        if (window.confirm("Вы уверены, что хотите удалить вопрос?")) {
            setQuestions(prev => prev.filter(q => q.id !== row.id));
        }
    };

    const handleEdit = (row) => {
        setEditItem(row);
        setFormData(row);
        setShowEditModal(true);
    };

    const handleEditSubmit = () => {
        setQuestions(prev => prev.map(q => (q.id === formData.id ? formData : q)));
        setShowEditModal(false);
        setEditItem(null);
    };

    const handleAdd = () => {
        setFormData({});
        setShowAddModal(true);
    };

    const handleAddSubmit = () => {
        const newId = questions.length ? Math.max(...questions.map(q => q.id)) + 1 : 1;
        const date = new Date().toISOString().slice(0, 10);
        const newQuestion = { id: newId, ...formData, date };
        setQuestions(prev => [...prev, newQuestion]);
        setShowAddModal(false);
    };

    const handleInputChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [search, questions]);

    return (
        <div className="questions-page">
            <h1>{t('Вопросы')}</h1>
            <div className="table-header">
                <input
                    type="text"
                    placeholder="Поиск..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button onClick={handleAdd}>Добавить</button>
            </div>
            <UniversalTable
                columns={columns}
                data={filteredQuestions}
                itemsPerPage={5}
                onDelete={handleDelete}
                onEdit={handleEdit}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Новый вопрос</h2>
                        <div className="modal-field">
                            <label>Вопрос</label>
                            <textarea
                                value={formData.question || ''}
                                onChange={(e) => handleInputChange('question', e.target.value)}
                                rows={4}
                            ></textarea>
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleAddSubmit}>Сохранить</button>
                            <button onClick={() => setShowAddModal(false)}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Редактировать вопрос</h2>
                        <div className="modal-field">
                            <label>Вопрос</label>
                            <textarea
                                value={formData.question || ''}
                                onChange={(e) => handleInputChange('question', e.target.value)}
                                rows={4}
                            ></textarea>
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleEditSubmit}>Сохранить</button>
                            <button onClick={() => setShowEditModal(false)}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
