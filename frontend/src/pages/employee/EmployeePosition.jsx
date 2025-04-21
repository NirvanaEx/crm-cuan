// src/pages/employee/EmployeePosition.jsx
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
import '../../css/employee/EmployeePosition.css';

export default function EmployeePosition() {
  const { user: currentUser, permissions } = useContext(AuthContext);
  const [positions, setPositions] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newPosition, setNewPosition] = useState({ name: '' });
  const [editPosition, setEditPosition] = useState({ id: null, name: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Параметры поиска
  const [searchParams, setSearchParams] = useState({
    text: '',
    field: 'name',
    dateFrom: '',
    dateTo: ''
  });

  // Загружает список должностей
  const fetchPositions = async () => {
    try {
      const response = await api.get('/positions');
      setPositions(response.data);
    } catch (err) {
      console.error('Ошибка при получении должностей:', err);
      showSnackbar('Ошибка при загрузке должностей', 'error');
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const showSnackbar = (msg, sev = 'success') => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(sev);
    setSnackbarOpen(true);
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // Обработчики создания/редактирования/удаления
  const handleAdd = async () => {
    if (!newPosition.name.trim()) {
      showSnackbar('Название должности обязательно', 'error');
      return;
    }
    try {
      const response = await api.post('/positions', newPosition);
      showSnackbar(response.data.message || 'Должность добавлена', 'success');
      setOpenAdd(false); 
      fetchPositions();
      setNewPosition({ name: '' });
    } catch (err) {
      console.error('Ошибка при добавлении:', err);
      showSnackbar('Не удалось добавить должность', 'error');
    }
  };

  
  const handleEdit = async () => {
    if (!editPosition.name.trim()) {
      showSnackbar('Название должности обязательно', 'error');
      return;
    }
    try {
      const response = await api.put(`/positions/${editPosition.id}`, { name: editPosition.name });
      showSnackbar(response.data.message || 'Должность обновлена', 'success');
      setOpenEdit(false);
      fetchPositions();
    } catch (err) {
      console.error('Ошибка при обновлении:', err);
      showSnackbar('Не удалось обновить должность', 'error');
    }
  };
  
  const handleDelete = async row => {
    if (window.confirm(`Удалить должность "${row.name}"?`)) {
      try {
        await api.delete(`/positions/${row.id}`);
        showSnackbar('Должность удалена', 'success');
        fetchPositions();
      } catch (err) {
        console.error('Ошибка при удалении:', err);
        showSnackbar('Не удалось удалить должность', 'error');
      }
    }
  };

  // Права текущего пользователя
  const isSuperadmin = () =>
    currentUser?.roles?.some(r => r.name.toLowerCase() === 'superadmin');
  const canCreate = isSuperadmin() || permissions?.includes('position_create');
  const canUpdate = isSuperadmin() || permissions?.includes('position_update');
  const canDelete = isSuperadmin() || permissions?.includes('position_delete');

  // Конфигурация колонок таблицы
  const columns = [
    {
      key: 'actions',
      label: '',
      width: '5%',
      render: (_v, row) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {canUpdate && (
            <AiOutlineEdit
              onClick={e => {
                e.stopPropagation();
                setEditPosition({ id: row.id, name: row.name });
                setOpenEdit(true);
              }}
              style={{ marginRight: 5, cursor: 'pointer' }}
              size={20}
            />
          )}
          {canDelete && (
            <AiOutlineDelete
              onClick={e => {
                e.stopPropagation();
                handleDelete(row);
              }}
              style={{ cursor: 'pointer' }}
              size={20}
            />
          )}
        </div>
      )
    },
    { key: 'id', label: 'ID', width: '10%' },
    { key: 'name', label: 'Название должности', width: '45%' },
    { key: 'date_creation', label: 'Дата создания', width: '45%' }
  ];

  // Фильтрация по тексту и дате
  const filtered = positions.filter(item => {
    let okText = true;
    let okDate = true;

    if (searchParams.text) {
      let val = item[searchParams.field];
      if (searchParams.field === 'date_creation' && val) {
        val = new Date(val).toLocaleDateString();
      }
      okText = String(val || '')
        .toLowerCase()
        .includes(searchParams.text.toLowerCase());
    }

    if (searchParams.dateFrom || searchParams.dateTo) {
      const d = new Date(item.date_creation);
      if (searchParams.dateFrom) okDate = okDate && d >= new Date(searchParams.dateFrom);
      if (searchParams.dateTo) okDate = okDate && d <= new Date(searchParams.dateTo);
    }

    return okText && okDate;
  });

  const searchFields = [
    { value: 'id', label: 'ID' },
    { value: 'name', label: 'Название должности' },
    { value: 'date_creation', label: 'Дата создания' }
  ];

  return (
    <div className="employee-position-container">
      <h1>Управление должностями</h1>

      <div className="employee-position-actions">
        <UniversalSearch fields={searchFields} onSearch={setSearchParams} />
        {canCreate && (
          <Button
            variant="contained"
            onClick={() => setOpenAdd(true)}
            style={{ marginLeft: 16 }}
          >
            Добавить должность
          </Button>
        )}
      </div>

      <UniversalTable
        columns={columns}
        data={filtered}
        itemsPerPage={5}
      />

      {/* Диалог добавления */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Добавить должность</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название должности"
            fullWidth
            value={newPosition.name}
            onChange={e => setNewPosition({ name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleAdd}>Добавить</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Редактировать должность</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название должности"
            fullWidth
            value={editPosition.name}
            onChange={e => setEditPosition({ ...editPosition, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleEdit}>Сохранить</Button>
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
