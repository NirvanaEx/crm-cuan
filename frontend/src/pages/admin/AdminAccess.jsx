import React, { useState, useEffect, useContext } from 'react';
import { 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Snackbar, 
  Alert 
} from '@mui/material';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import '../../css/admin/AdminAccess.css';

export default function AdminAccess() {
  const { user: currentUser, permissions } = useContext(AuthContext);
  const [accessList, setAccessList] = useState([]);
  const [languages, setLanguages] = useState([]);
  // Состояние старого поиска больше не используется
  // const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newAccess, setNewAccess] = useState({
    name: '',
    translations: []
  });
  const [editAccess, setEditAccess] = useState({
    id: null,
    name: '',
    translations: []
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Состояние параметров поиска через UniversalSearch
  const [searchParams, setSearchParams] = useState({
    text: '',
    field: 'name',
    dateFrom: '',
    dateTo: ''
  });

  // Получение списка языков
  const fetchLanguages = async () => {
    try {
      const response = await api.get('/language');
      setLanguages(response.data);
    } catch (error) {
      console.error('Ошибка при получении языков:', error);
    }
  };

  // Получение списка доступов (все переводы)
  const fetchAccessList = async () => {
    try {
      const response = await api.get('/access');
      setAccessList(response.data);
    } catch (error) {
      console.error('Ошибка при получении списка доступов:', error);
      showSnackbar('Ошибка при получении списка доступов', 'error');
    }
  };

  useEffect(() => {
    fetchLanguages();
    fetchAccessList();
  }, []);

  // После загрузки языков инициализируем объект нового доступа
  useEffect(() => {
    if (languages.length) {
      setNewAccess({
        name: '',
        translations: languages.map(lang => ({
          language_id: lang.id,
          description: ''
        }))
      });
    }
  }, [languages]);

  // Функция уведомления
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Диалог добавления доступа
  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => {
    setOpenAdd(false);
    setNewAccess({
      name: '',
      translations: languages.map(lang => ({ language_id: lang.id, description: '' }))
    });
  };

  // Диалог редактирования доступа: при открытии заполняем данные для всех языков
  const handleOpenEdit = (row) => {
    setEditAccess({
      id: row.id,
      name: row.name,
      translations: languages.map(lang => ({
        language_id: lang.id,
        description: row.translations?.find(t => t.language_id === lang.id)?.description || ''
      }))
    });
    setOpenEdit(true);
  };
  const handleCloseEdit = () => setOpenEdit(false);

  // Добавление доступа
  const handleAddAccess = async () => {
    if (!newAccess.name.trim()) {
      showSnackbar('Название доступа обязательно', 'error');
      return;
    }
    try {
      await api.post('/access', newAccess);
      showSnackbar('Доступ добавлен', 'success');
      fetchAccessList();
      handleCloseAdd();
    } catch (error) {
      console.error('Ошибка при добавлении доступа:', error);
      showSnackbar('Ошибка при добавлении доступа', 'error');
    }
  };

  // Обновление доступа
  const handleEditAccess = async () => {
    if (!editAccess.name.trim()) {
      showSnackbar('Название доступа обязательно', 'error');
      return;
    }
    try {
      await api.put(`/access/${editAccess.id}`, editAccess);
      showSnackbar('Доступ обновлен', 'success');
      fetchAccessList();
      handleCloseEdit();
    } catch (error) {
      console.error('Ошибка при обновлении доступа:', error);
      showSnackbar('Ошибка при обновлении доступа', 'error');
    }
  };

  // Удаление доступа
  const handleDeleteAccess = async (row) => {
    const confirmDelete = window.confirm(`Удалить доступ "${row.name}"?`);
    if (confirmDelete) {
      try {
        await api.delete(`/access/${row.id}`);
        showSnackbar('Доступ удален', 'success');
        fetchAccessList();
      } catch (error) {
        console.error('Ошибка при удалении доступа:', error);
        showSnackbar('Ошибка при удалении доступа', 'error');
      }
    }
  };

  // Выбор описания согласно выбранному языку пользователя (из настроек)
  const getDescriptionByLanguage = (translations) => {
    const selectedLanguageId = currentUser?.selected_language_id || (languages[0] && languages[0].id);
    const translation = translations?.find(t => t.language_id === selectedLanguageId);
    return translation ? translation.description : '';
  };

  const currentUserIsSuperadmin = () => {
    if (!currentUser || !currentUser.roles) return false;
    return currentUser.roles.some(r => r.name.toLowerCase() === 'superadmin');
  };

  const canCreateAccess = currentUserIsSuperadmin() || (permissions || []).includes('roleAccess_create');
  const canUpdateAccess = currentUserIsSuperadmin() || (permissions || []).includes('roleAccess_create');
  const canDeleteAccess = currentUserIsSuperadmin() || (permissions || []).includes('roleAccess_delete');

  // Добавляем порядковый номер согласно порядку в массиве
  const dataWithOrder = accessList.map((item, index) => ({ ...item, order: index + 1 }));

  // Список полей для поиска
  const searchFields = [
    { value: 'id', label: 'ID' },
    { value: 'name', label: 'Название доступа' },
    { value: 'date_creation', label: 'Дата создания' }
  ];

  // Фильтрация данных на основе параметров UniversalSearch
  const filteredData = dataWithOrder.filter((access) => {
    let matchesText = true;
    let matchesDate = true;

    if (searchParams.text && searchParams.field) {
      let value = access[searchParams.field];
      if (searchParams.field === 'date_creation' && value) {
        value = new Date(value).toLocaleDateString();
      }
      matchesText = String(value || '').toLowerCase().includes(searchParams.text.toLowerCase());
    }

    if (searchParams.dateFrom || searchParams.dateTo) {
      if (access.date_creation) {
        const accessDate = new Date(access.date_creation);
        if (searchParams.dateFrom) {
          matchesDate = matchesDate && accessDate >= new Date(searchParams.dateFrom);
        }
        if (searchParams.dateTo) {
          matchesDate = matchesDate && accessDate <= new Date(searchParams.dateTo);
        }
      } else {
        matchesDate = false;
      }
    }

    return matchesText && matchesDate;
  });

  // Колонки таблицы
  const columns = [
    {
      key: 'actions',
      label: '',
      width: '5%',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {canUpdateAccess && (
            <AiOutlineEdit
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(row);
              }}
              style={{ marginRight: '5px', cursor: 'pointer' }}
              size={20}
            />
          )}
          {canDeleteAccess && (
            <AiOutlineDelete
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAccess(row);
              }}
              style={{ cursor: 'pointer' }}
              size={20}
            />
          )}
        </div>
      )
    },
    { key: 'order', label: '№', width: '5%', render: (value, row) => row.order },
    { key: 'name', label: 'Название доступа', width: '25%' },
    {
      key: 'description',
      label: 'Описание',
      width: '40%',
      render: (value, row) => getDescriptionByLanguage(row.translations)
    },
    { key: 'date_creation', label: 'Дата создания', width: '25%' }
  ];

  return (
    <div className="admin-access-container">
      <h1>Управление доступами</h1>
      <div className="admin-access-actions">
        {/* Универсальный поиск */}
        <UniversalSearch fields={searchFields} onSearch={setSearchParams} />
      </div>
      <div className="admin-access-add-button">
        {canCreateAccess && (
          <Button variant="contained" onClick={handleOpenAdd}>
            Добавить доступ
          </Button>
        )}
      </div>
      <UniversalTable 
        columns={columns} 
        data={filteredData} 
        itemsPerPage={15} 
      />

      <Dialog open={openAdd} onClose={handleCloseAdd} fullWidth maxWidth="sm">
        <DialogTitle>Добавить доступ</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название доступа"
            fullWidth
            value={newAccess.name}
            onChange={(e) => setNewAccess({ ...newAccess, name: e.target.value })}
          />
          {languages.map(lang => (
            <TextField
              key={lang.id}
              margin="dense"
              label={`Описание (${lang.name})`}
              fullWidth
              value={newAccess.translations.find(t => t.language_id === lang.id)?.description || ''}
              onChange={(e) => {
                const updatedTranslations = newAccess.translations.map(t =>
                  t.language_id === lang.id 
                    ? { ...t, description: e.target.value } 
                    : t
                );
                setNewAccess({ ...newAccess, translations: updatedTranslations });
              }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>Отмена</Button>
          <Button variant="contained" onClick={handleAddAccess}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Редактировать доступ</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название доступа"
            fullWidth
            value={editAccess.name}
            onChange={(e) => setEditAccess({ ...editAccess, name: e.target.value })}
          />
          {languages.map(lang => (
            <TextField
              key={lang.id}
              margin="dense"
              label={`Описание (${lang.name})`}
              fullWidth
              value={editAccess.translations.find(t => t.language_id === lang.id)?.description || ''}
              onChange={(e) => {
                const updatedTranslations = editAccess.translations.map(t =>
                  t.language_id === lang.id 
                    ? { ...t, description: e.target.value } 
                    : t
                );
                setEditAccess({ ...editAccess, translations: updatedTranslations });
              }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Отмена</Button>
          <Button variant="contained" onClick={handleEditAccess}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
