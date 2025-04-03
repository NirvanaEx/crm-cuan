import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import UniversalTable from '../../components/UniversalTable';
import { AiOutlineCalendar } from 'react-icons/ai';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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

  // Параметры поиска
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState('login');

  // Параметры фильтрации по дате
  const [dateFilterVisible, setDateFilterVisible] = useState(false);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  // Функция загрузки данных с сервера
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const fromString = dateFrom ? dateFrom.toISOString().split('T')[0] : '';
      const toString = dateTo ? dateTo.toISOString().split('T')[0] : '';

      const params = {
        page,
        limit,
        search: searchText,
        searchField
      };
      if (fromString) params.dateFrom = fromString;
      if (toString) params.dateTo = toString;

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
  }, [page, limit, searchText, searchField, dateFrom, dateTo]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="admin-session-page">
      <h2>Сессии пользователей</h2>
      <div className="search-form">
        <div className="search-row">
          <input
            type="text"
            className="search-input"
            placeholder="Введите значение для поиска"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="search-select"
            value={searchField}
            onChange={(e) => {
              setSearchField(e.target.value);
              setPage(1);
            }}
          >
            <option value="login">Логин</option>
            <option value="device">Устройство</option>
            <option value="ip_address">IP-адрес</option>
            <option value="date_last_active">Последняя активность</option>
          </select>
          <button
            type="button"
            className="date-toggle-button"
            onClick={() => setDateFilterVisible(!dateFilterVisible)}
            title="Фильтр по дате"
          >
            <AiOutlineCalendar size={20} />
          </button>
        </div>
        {dateFilterVisible && (
          <div className="date-filter">
            <div className="date-filter-row">
              <label>С</label>
              <DatePicker
                selected={dateFrom}
                onChange={(date) => {
                  setDateFrom(date);
                  setPage(1);
                }}
                dateFormat="yyyy-MM-dd"
                isClearable
                placeholderText="YYYY-MM-DD"
                className="date-picker-input"
              />
            </div>
            <div className="date-filter-row">
              <label>По</label>
              <DatePicker
                selected={dateTo}
                onChange={(date) => {
                  setDateTo(date);
                  setPage(1);
                }}
                dateFormat="yyyy-MM-dd"
                isClearable
                placeholderText="YYYY-MM-DD"
                className="date-picker-input"
              />
            </div>
          </div>
        )}
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
