import React, { useState, useEffect, useContext } from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import UniversalTable from '../../components/UniversalTable';
import RoleAccessModal from '../../components/RoleAccessModal';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import '../../css/admin/AdminRoles.css';

export default function AdminRoles() {
  const { user: currentUser, permissions } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openRoleAccess, setOpenRoleAccess] = useState(false);
  const [roleForAccess, setRoleForAccess] = useState(null);
  const [newRole, setNewRole] = useState({ name: '' });
  const [editRole, setEditRole] = useState({ id: null, name: '' });
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

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Ошибка при получении ролей:', error);
      showSnackbar('Ошибка при получении списка ролей', 'error');
    }
  };

  const handleAddRole = async () => {
    if (!newRole.name.trim()) {
      showSnackbar('Название роли обязательно', 'error');
      return;
    }
    try {
      await api.post('/roles', newRole);
      showSnackbar('Роль добавлена', 'success');
      fetchRoles();
      handleCloseAdd();
    } catch (error) {
      console.error('Ошибка при добавлении роли:', error);
      showSnackbar('Ошибка при добавлении роли', 'error');
    }
  };

  const handleEditRole = async () => {
    if (!editRole.name.trim()) {
      showSnackbar('Название роли обязательно', 'error');
      return;
    }
    try {
      await api.put(`/roles/${editRole.id}`, { name: editRole.name });
      showSnackbar('Роль обновлена', 'success');
      fetchRoles();
      handleCloseEdit();
    } catch (error) {
      console.error('Ошибка при обновлении роли:', error);
      showSnackbar('Ошибка при обновлении роли', 'error');
    }
  };

  const handleDeleteRole = async (row) => {
    const confirmDelete = window.confirm(`Удалить роль "${row.name}"?`);
    if (confirmDelete) {
      try {
        await api.delete(`/roles/${row.id}`);
        showSnackbar('Роль удалена', 'success');
        fetchRoles();
      } catch (error) {
        console.error('Ошибка при удалении роли:', error);
        showSnackbar('Ошибка при удалении роли', 'error');
      }
    }
  };

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => {
    setOpenAdd(false);
    setNewRole({ name: '' });
  };

  const handleOpenEdit = (row) => {
    setEditRole({ id: row.id, name: row.name });
    setOpenEdit(true);
  };
  const handleCloseEdit = () => setOpenEdit(false);

  const handleRowClick = (row) => {
    setRoleForAccess(row);
    setOpenRoleAccess(true);
  };

  // Определение наличия доступа на основании разрешений или роли superadmin
  const currentUserIsSuperadmin = () => {
    if (!currentUser || !currentUser.roles) return false;
    return currentUser.roles.some((r) => r.name.toLowerCase() === 'superadmin');
  };
  const canCreateRole = currentUserIsSuperadmin() || (permissions || []).includes('role_create');
  const canUpdateRole = currentUserIsSuperadmin() || (permissions || []).includes('role_update');
  const canDeleteRole = currentUserIsSuperadmin() || (permissions || []).includes('role_delete');
  const canRoleAccess = currentUserIsSuperadmin() || (permissions || []).includes('roleAccess_read');

  const columns = [
    {
      key: 'actions',
      label: '',
      width: '5%',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {canUpdateRole && (
            <AiOutlineEdit
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(row);
              }}
              style={{ marginRight: '5px', cursor: 'pointer' }}
              size={20}
            />
          )}
          {canDeleteRole && (
            <AiOutlineDelete
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteRole(row);
              }}
              style={{ cursor: 'pointer' }}
              size={20}
            />
          )}
        </div>
      )
    },
    { key: 'id', label: 'ID', width: '5%' },
    { key: 'name', label: 'Название роли', width: '50%' },
    { key: 'date_creation', label: 'Дата создания', width: '40%' }
  ];

  const filteredRoles = roles.filter(role =>
    Object.values(role).some(val =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="admin-roles-container">
      <h1>Управление ролями</h1>
      <div className="admin-roles-actions">
        <input
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-roles-search"
        />
        {canCreateRole && (
          <Button variant="contained" onClick={handleOpenAdd}>
            Добавить роль
          </Button>
        )}
      </div>
      <UniversalTable
        columns={columns}
        data={filteredRoles}
        itemsPerPage={5}
        onRowClick={canRoleAccess ? handleRowClick : null}
      />

      {roleForAccess && (
        <RoleAccessModal
          open={openRoleAccess}
          role={roleForAccess}
          onClose={() => setOpenRoleAccess(false)}
          onUpdate={fetchRoles}
        />
      )}

      <Dialog open={openAdd} onClose={handleCloseAdd} fullWidth maxWidth="sm">
        <DialogTitle>Добавить роль</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название роли"
            fullWidth
            value={newRole.name}
            onChange={(e) => setNewRole({ name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>Отмена</Button>
          <Button variant="contained" onClick={handleAddRole}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Редактировать роль</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название роли"
            fullWidth
            value={editRole.name}
            onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Отмена</Button>
          <Button variant="contained" onClick={handleEditRole}>
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
