// AdminUsers.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import UniversalTable from '../../components/UniversalTable';
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Snackbar,
  Alert
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import '../../css/admin/AdminUsers.css';

function StatusDropdown({ initialStatus, userId, onStatusChange, showSnackbar }) {
  const [status, setStatus] = useState(initialStatus);
  const statusOptions = [
    { value: 'active', label: 'Активен', background: '#d9f7be', color: '#52c41a' },
    { value: 'banned', label: 'Заблокирован', background: '#fff1b8', color: '#faad14' },
    { value: 'deleted', label: 'Удалён', background: '#ffccc7', color: '#f5222d' }
  ];

  const handleChange = async (event) => {
    const newStatus = event.target.value;
    const previousStatus = status;
    setStatus(newStatus);
    try {
      await api.put(`/users/${userId}/status`, { status: newStatus });
      showSnackbar('Статус пользователя обновлён', 'success');
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error('Ошибка обновления статуса пользователя:', error);
      showSnackbar('Ошибка обновления статуса пользователя', 'error');
      setStatus(previousStatus);
    }
  };

  const currentOption = statusOptions.find((opt) => opt.value === status);

  return (
    <FormControl variant="outlined" size="small">
      <Select
        value={status}
        onChange={handleChange}
        sx={{
          backgroundColor: currentOption?.background || '#f0f0f0',
          color: currentOption?.color || '#000',
          fontWeight: 'bold',
          borderRadius: '6px',
          '.MuiOutlinedInput-notchedOutline': { border: 'none' }
        }}
      >
        {statusOptions.map((opt) => (
          <MenuItem
            key={opt.value}
            value={opt.value}
            sx={{
              backgroundColor: opt.background,
              color: opt.color,
              fontWeight: 'bold',
              "&:hover": { backgroundColor: opt.background }
            }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function StatusBadge({ status }) {
  const statusColors = {
    active: { background: '#d9f7be', color: '#52c41a', label: 'Активен' },
    banned: { background: '#fff1b8', color: '#faad14', label: 'Заблокирован' },
    deleted: { background: '#ffccc7', color: '#f5222d', label: 'Удалён' }
  };

  const current = statusColors[status] || { background: '#f0f0f0', color: '#000', label: status };

  const styles = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: current.background,
    color: current.color,
    fontWeight: 'bold'
  };

  return <span style={styles}>{current.label}</span>;
}

export default function AdminUsers() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { user: currentUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roles, setRoles] = useState([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [newUser, setNewUser] = useState({
    login: '',
    password: '',
    surname: '',
    name: '',
    patronym: '',
    phone: '',
    roleId: ''
  });

  const [editUser, setEditUser] = useState({
    id: null,
    login: '',
    password: '',
    surname: '',
    name: '',
    patronym: '',
    phone: '',
    roleId: ''
  });

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
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Ошибка при получении пользователей:', error);
      showSnackbar('Ошибка при получении списка пользователей', 'error');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Ошибка при получении ролей:', error);
      showSnackbar('Ошибка при получении списка ролей', 'error');
    }
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  function currentUserIsSuperadmin() {
    if (!currentUser || !currentUser.roles) return false;
    return currentUser.roles.some((r) => r.name.toLowerCase() === 'superadmin');
  }

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => {
    setOpenAdd(false);
    setNewUser({
      login: '',
      password: '',
      surname: '',
      name: '',
      patronym: '',
      phone: '',
      roleId: ''
    });
  };

  const handleOpenEdit = (row) => {
    setEditUser({
      id: row.id,
      login: row.login,
      password: '',
      surname: row.surname || '',
      name: row.name || '',
      patronym: row.patronym || '',
      phone: row.phone || '',
      roleId: row.role_id || ''
    });
    setOpenEdit(true);
  };

  const handleCloseEdit = () => setOpenEdit(false);

  const handleAddUser = async () => {
    try {
      if (!newUser.login || !newUser.password) {
        showSnackbar('Поля логин и пароль обязательны', 'error');
        return;
      }
      if (newUser.roleId) {
        await api.post('/users/with-role', newUser);
      } else {
        await api.post('/users', newUser);
      }
      showSnackbar('Пользователь добавлен', 'success');
      fetchUsers();
      handleCloseAdd();
    } catch (error) {
      console.error('Ошибка при добавлении пользователя:', error);
      showSnackbar('Ошибка при добавлении пользователя', 'error');
    }
  };

  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(`Удалить пользователя "${row.login}"?`);
    if (confirmDelete) {
      try {
        await api.delete(`/users/${row.id}`);
        setUsers((prev) => prev.filter((u) => u.id !== row.id));
        showSnackbar('Пользователь удалён', 'success');
      } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        showSnackbar('Ошибка при удалении пользователя', 'error');
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editUser.id) return;
    try {
      await api.put(`/users/${editUser.id}`, {
        login: editUser.login,
        password: editUser.password,
        surname: editUser.surname,
        name: editUser.name,
        patronym: editUser.patronym,
        phone: editUser.phone,
        roleId: editUser.roleId
      });
      showSnackbar('Данные пользователя обновлены', 'success');
      fetchUsers();
      handleCloseEdit();
    } catch (error) {
      console.error('Ошибка при сохранении изменений пользователя:', error);
      showSnackbar('Ошибка при сохранении изменений', 'error');
    }
  };

  // Определены столбцы с нужным порядком и объединением Ф.И.О.
  const baseColumns = [
    { key: 'id', label: 'ID', width: '5%' },
    { key: 'login', label: 'Логин', width: '15%' },
    { key: 'role_name', label: 'Роль', width: '10%' },
    { 
      key: 'fullName', 
      label: 'Ф.И.О', 
      width: '20%',
      render: (_, row) => [row.surname, row.name, row.patronym].filter(Boolean).join(' ')
    },
    { key: 'phone', label: 'Телефон', width: '10%' },
    { key: 'date_creation', label: 'Дата создания', width: '15%' }
  ];

  const statusColumn = {
    key: 'status',
    label: 'Статус',
    width: '15%',
    render: (value, row) => {
      if (currentUserIsSuperadmin()) {
        return (
          <StatusDropdown
            initialStatus={value}
            userId={row.id}
            onStatusChange={fetchUsers}
            showSnackbar={showSnackbar}
          />
        );
      } else {
        return <StatusBadge status={value} />;
      }
    }
  };

  const columns = currentUserIsSuperadmin() ? [...baseColumns, statusColumn] : [...baseColumns, statusColumn];

  return (
    <div className="admin-users-container">
      <h1>Управление пользователями</h1>

      <div className="admin-users-actions">
        <TextField
          label="Поиск"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDarkMode ? '#2b2b2b' : '#fff',
              color: isDarkMode ? '#fff' : '#000'
            },
            marginRight: '10px',
            width: '300px'
          }}
        />
        <Button
          variant="contained"
          onClick={handleOpenAdd}
          sx={{
            backgroundColor: isDarkMode ? '#7367f0' : '#007bff',
            '&:hover': {
              backgroundColor: isDarkMode ? '#5c54c7' : '#0056b3'
            }
          }}
        >
          Добавить пользователя
        </Button>
      </div>

      <UniversalTable
        columns={columns}
        data={filteredUsers}
        itemsPerPage={5}
        onDelete={handleDelete}
        onEdit={handleOpenEdit}
        hideDeleteIcon={true}
      />

      <Dialog
        open={openAdd}
        onClose={handleCloseAdd}
        fullWidth
        maxWidth="md"
        slotProps={{
            paper: {
              sx: {
                backgroundColor: isDarkMode ? '#2b2b2b' : '#fff',
                color: isDarkMode ? '#fff' : '#000'
              }
            }
          }}
      >
        <DialogTitle>Добавить пользователя</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginTop: '10px'
          }}
        >
          <TextField
            label="Логин"
            value={newUser.login}
            onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
            sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
          />
          <TextField
            label="Пароль"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
          />
          <TextField
            label="Фамилия"
            value={newUser.surname}
            onChange={(e) => setNewUser({ ...newUser, surname: e.target.value })}
            sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
          />
          <TextField
            label="Имя"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
          />
          <TextField
            label="Отчество"
            value={newUser.patronym}
            onChange={(e) => setNewUser({ ...newUser, patronym: e.target.value })}
            sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
          />
          <TextField
            label="Телефон"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
          />
          <FormControl>
            <InputLabel id="role-select-label" sx={{ color: isDarkMode ? '#fff' : '#000' }}>
              Роль
            </InputLabel>
            <Select
              labelId="role-select-label"
              label="Роль"
              value={newUser.roleId}
              onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
              sx={{
                width: '200px',
                backgroundColor: isDarkMode ? '#3a3a3a' : '#fff',
                color: isDarkMode ? '#fff' : '#000'
              }}
            >
              <MenuItem value="">Без роли</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>Отмена</Button>
          <Button variant="contained" onClick={handleAddUser}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEdit}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="md"
        slotProps={{
            paper: {
              sx: {
                backgroundColor: isDarkMode ? '#2b2b2b' : '#fff',
                color: isDarkMode ? '#fff' : '#000'
              }
            }
          }}
      >
        <DialogTitle>Редактировать пользователя</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginTop: '10px'
          }}
        >
          <TextField
            label="Логин"
            value={editUser.login}
            onChange={(e) => setEditUser({ ...editUser, login: e.target.value })}
            sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
          />
          <TextField
            label="Новый пароль"
            type="password"
            value={editUser.password}
            onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
            sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
          />
          <TextField
            label="Фамилия"
            value={editUser.surname}
            onChange={(e) => setEditUser({ ...editUser, surname: e.target.value })}
            sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
          />
          <TextField
            label="Имя"
            value={editUser.name}
            onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
            sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
          />
          <TextField
            label="Отчество"
            value={editUser.patronym}
            onChange={(e) => setEditUser({ ...editUser, patronym: e.target.value })}
            sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
          />
          <TextField
            label="Телефон"
            value={editUser.phone}
            onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
            sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
          />
          <FormControl>
            <InputLabel id="edit-role-select-label" sx={{ color: isDarkMode ? '#fff' : '#000' }}>
              Роль
            </InputLabel>
            <Select
              labelId="edit-role-select-label"
              label="Роль"
              value={editUser.roleId}
              onChange={(e) => setEditUser({ ...editUser, roleId: e.target.value })}
              sx={{
                width: '200px',
                backgroundColor: isDarkMode ? '#3a3a3a' : '#fff',
                color: isDarkMode ? '#fff' : '#000'
              }}
            >
              <MenuItem value="">Без роли</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Отмена</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
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
