import React, { useState, useEffect, useContext } from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import '../../css/admin/AdminLanguages.css';

export default function AdminLanguage() {
  const { permissions } = useContext(AuthContext);
  const [languagesList, setLanguagesList] = useState([]);
  // Состояние старого поиска заменяем на универсальный поиск
  // const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newLanguage, setNewLanguage] = useState({ code: '', name: '' });
  const [editLanguage, setEditLanguage] = useState({ id: null, code: '', name: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Состояние параметров поиска из UniversalSearch
  const [searchParams, setSearchParams] = useState({
    text: '',
    field: 'name',
    dateFrom: '',
    dateTo: ''
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const fetchLanguagesList = async () => {
    try {
      const response = await api.get('/language');
      setLanguagesList(response.data);
    } catch (error) {
      console.error('Ошибка при получении языков:', error);
      showSnackbar('Ошибка при получении языков', 'error');
    }
  };

  useEffect(() => {
    fetchLanguagesList();
  }, []);

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => {
    setOpenAdd(false);
    setNewLanguage({ code: '', name: '' });
  };

  const handleOpenEdit = (row) => {
    setEditLanguage({ id: row.id, code: row.code, name: row.name });
    setOpenEdit(true);
  };
  const handleCloseEdit = () => setOpenEdit(false);

  const handleAddLanguage = async () => {
    if (!newLanguage.code.trim() || !newLanguage.name.trim()) {
      showSnackbar('Код и имя обязательны', 'error');
      return;
    }
    try {
      await api.post('/language', newLanguage);
      showSnackbar('Язык добавлен', 'success');
      fetchLanguagesList();
      handleCloseAdd();
    } catch (error) {
      console.error('Ошибка при добавлении языка:', error);
      showSnackbar('Ошибка при добавлении языка', 'error');
    }
  };

  const handleEditLanguage = async () => {
    if (!editLanguage.code.trim() || !editLanguage.name.trim()) {
      showSnackbar('Код и имя обязательны', 'error');
      return;
    }
    try {
      await api.put(`/language/${editLanguage.id}`, editLanguage);
      showSnackbar('Язык обновлен', 'success');
      fetchLanguagesList();
      handleCloseEdit();
    } catch (error) {
      console.error('Ошибка при обновлении языка:', error);
      showSnackbar('Ошибка при обновлении языка', 'error');
    }
  };

  const handleDeleteLanguage = async (row) => {
    const confirmDelete = window.confirm(`Удалить язык "${row.name}"?`);
    if (confirmDelete) {
      try {
        await api.delete(`/language/${row.id}`);
        showSnackbar('Язык удален', 'success');
        fetchLanguagesList();
      } catch (error) {
        console.error('Ошибка при удалении языка:', error);
        showSnackbar('Ошибка при удалении языка', 'error');
      }
    }
  };

  // Фильтрация списка языков на основе параметров поиска из UniversalSearch
  const filteredData = languagesList.filter(lang => {
    let matchesText = true;
    let matchesDate = true;

    if (searchParams.text && searchParams.field) {
      let value = lang[searchParams.field];
      if (searchParams.field === 'date_creation' && value) {
        value = new Date(value).toLocaleDateString();
      }
      matchesText = String(value || '').toLowerCase().includes(searchParams.text.toLowerCase());
    }

    if (searchParams.dateFrom || searchParams.dateTo) {
      if (lang.date_creation) {
        const langDate = new Date(lang.date_creation);
        if (searchParams.dateFrom) {
          matchesDate = matchesDate && langDate >= new Date(searchParams.dateFrom);
        }
        if (searchParams.dateTo) {
          matchesDate = matchesDate && langDate <= new Date(searchParams.dateTo);
        }
      } else {
        matchesDate = false;
      }
    }

    return matchesText && matchesDate;
  });

  // Список полей для поиска. Можно выбрать: ID, Код, Имя или Дата создания
  const searchFields = [
    { value: 'id', label: 'ID' },
    { value: 'code', label: 'Код' },
    { value: 'name', label: 'Имя' },
    { value: 'date_creation', label: 'Дата создания' }
  ];

  const columns = [
    {
      key: 'actions',
      label: '',
      width: '5%',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AiOutlineEdit
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            style={{ marginRight: '5px', cursor: 'pointer' }}
            size={20}
          />
          <AiOutlineDelete
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteLanguage(row);
            }}
            style={{ cursor: 'pointer' }}
            size={20}
          />
        </div>
      )
    },
    { key: 'id', label: 'ID', width: '5%' },
    { key: 'code', label: 'Код', width: '10%' },
    { key: 'name', label: 'Имя', width: '50%' },
    { key: 'date_creation', label: 'Дата создания', width: '20%' }
  ];

  return (
    <div className="admin-language-container">
      <h1>Управление языками</h1>
      <div className="admin-language-actions">
        {/* Используем универсальный поиск */}
        <UniversalSearch fields={searchFields} onSearch={setSearchParams} />
      </div>
      <div className="admin-language-add-button">
        <Button variant="contained" onClick={handleOpenAdd}>
          Добавить язык
        </Button>
      </div>
      <UniversalTable columns={columns} data={filteredData} itemsPerPage={5} />

      <Dialog open={openAdd} onClose={handleCloseAdd} fullWidth maxWidth="sm">
        <DialogTitle>Добавить язык</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Код"
            fullWidth
            value={newLanguage.code}
            onChange={(e) => setNewLanguage({ ...newLanguage, code: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Имя"
            fullWidth
            value={newLanguage.name}
            onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>Отмена</Button>
          <Button variant="contained" onClick={handleAddLanguage}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Редактировать язык</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Код"
            fullWidth
            value={editLanguage.code}
            onChange={(e) => setEditLanguage({ ...editLanguage, code: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Имя"
            fullWidth
            value={editLanguage.name}
            onChange={(e) => setEditLanguage({ ...editLanguage, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Отмена</Button>
          <Button variant="contained" onClick={handleEditLanguage}>
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
