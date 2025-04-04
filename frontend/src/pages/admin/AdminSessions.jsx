import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import { AuthContext } from '../../context/AuthContext';
import '../../css/admin/AdminSessions.css';

const AdminSession = () => {
  const { user: currentUser, permissions } = useContext(AuthContext);

  // Определение superadmin
  const currentUserIsSuperadmin = () => {
    if (!currentUser || !currentUser.roles) return false;
    return currentUser.roles.some(r => r.name.toLowerCase() === 'superadmin');
  };

  // Проверка разрешения на просмотр сессий
  const canViewSessions = currentUserIsSuperadmin() || (permissions || []).includes('session_read');
  if (!canViewSessions) {
    return <p>Нет доступа</p>;
  }

  const [sessionsData, setSessionsData] = useState({ sessions: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Параметры пагинации
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Параметры поиска (заменяют searchText, searchField, dateFrom, dateTo)
  const [searchParams, setSearchParams] = useState({
    text: '',
    field: 'login',
    dateFrom: '',
    dateTo: ''
  });

  // Функция загрузки данных с сервера
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: searchParams.text,
        searchField: searchParams.field
      };
      if (searchParams.dateFrom) params.dateFrom = searchParams.dateFrom;
      if (searchParams.dateTo) params.dateTo = searchParams.dateTo;

      const response = await api.get('/sessions', { params });
      let sessions = [];
      let total = 0;
      if (Array.isArray(response.data)) {
        sessions = response.data;
        total = response.data.length;
      } else {
        sessions = response.data.sessions || [];
        total = response.data.total || 0;
      }
      setSessionsData({ sessions, total });
      setLoading(false);
    } catch (err) {
      setError('Ошибка загрузки сессий');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchParams]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Список полей для поиска (для UniversalSearch)
  const searchFields = [
    { value: 'login', label: 'Логин' },
    { value: 'device', label: 'Устройство' },
    { value: 'ip_address', label: 'IP-адрес' },
    { value: 'date_last_active', label: 'Последняя активность' }
  ];

  return (
    <div className="admin-session-page">
      <h1>Сессии пользователей</h1>
      <div className="search-form">
        <UniversalSearch fields={searchFields} onSearch={setSearchParams} />
      </div>
      {loading ? (
        <p>Загрузка...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <UniversalTable
          columns={[
            { key: 'id', label: 'ID', width: '5%' },
            { key: 'login', label: 'Логин', width: '25%' },
            { key: 'device', label: 'Устройство', width: '20%' },
            { key: 'ip_address', label: 'IP-адрес', width: '20%' },
            {
              key: 'date_last_active',
              label: 'Последняя активность',
              width: '15%',
              render: (value) => (value ? new Date(value).toLocaleString() : '-')
            },
            {
              key: 'date_creation',
              label: 'Дата создания',
              width: '15%',
              render: (value) => (value ? new Date(value).toLocaleString() : '-')
            }
          ]}
          data={sessionsData.sessions}
          totalItems={sessionsData.total}  // Передаём общее количество записей
          itemsPerPage={limit}
          currentPage={page}
          onPageChange={handlePageChange}
          hideEditIcon={true}
          hideDeleteIcon={true}
        />
      )}
    </div>
  );
};

export default AdminSession;
