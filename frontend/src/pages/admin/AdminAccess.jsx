import React, { useState, useEffect } from 'react';
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
import api from '../../services/api';
import '../../css/admin/AdminAccess.css';

export default function AdminAccess() {
  const [accessList, setAccessList] = useState([]);
  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newAccess, setNewAccess] = useState({ name: '' });
  const [editAccess, setEditAccess] = useState({ id: null, name: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const fetchAccessList = async () => {
    try {
      const response = await api.get('/access');
      setAccessList(response.data);
    } catch (error) {
      console.error('Ошибка при получении доступа:', error);
      showSnackbar('Ошибка при получении списка доступов', 'error');
    }
  };

  useEffect(() => {
    fetchAccessList();
  }, []);

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => {
    setOpenAdd(false);
    setNewAccess({ name: '' });
  };

  const handleOpenEdit = (row) => {
    setEditAccess({ id: row.id, name: row.name });
    setOpenEdit(true);
  };
  const handleCloseEdit = () => setOpenEdit(false);

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

  const handleEditAccess = async () => {
    if (!editAccess.name.trim()) {
      showSnackbar('Название доступа обязательно', 'error');
      return;
    }
    try {
      await api.put(`/access/${editAccess.id}`, { name: editAccess.name });
      showSnackbar('Доступ обновлен', 'success');
      fetchAccessList();
      handleCloseEdit();
    } catch (error) {
      console.error('Ошибка при обновлении доступа:', error);
      showSnackbar('Ошибка при обновлении доступа', 'error');
    }
  };

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
              handleDeleteAccess(row);
            }}
            style={{ cursor: 'pointer' }}
            size={20}
          />
        </div>
      )
    },
    { key: 'id', label: 'ID', width: '5%' },
    { key: 'name', label: 'Название доступа', width: '50%' },
    { key: 'date_creation', label: 'Дата создания', width: '40%' }
  ];

  const filteredData = accessList.filter(a =>
    Object.values(a).some(val =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="admin-access-container">
      <h1>Управление доступами</h1>
      <div className="admin-access-actions">
        <input
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-access-search"
        />
        <Button variant="contained" onClick={handleOpenAdd}>
          Добавить доступ
        </Button>
      </div>
      <UniversalTable columns={columns} data={filteredData} itemsPerPage={5} />

      {/* Диалог добавления доступа */}
      <Dialog open={openAdd} onClose={handleCloseAdd} fullWidth maxWidth="sm">
        <DialogTitle>Добавить доступ</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название доступа"
            fullWidth
            value={newAccess.name}
            onChange={(e) => setNewAccess({ name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>Отмена</Button>
          <Button variant="contained" onClick={handleAddAccess}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования доступа */}
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
