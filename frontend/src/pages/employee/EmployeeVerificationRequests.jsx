// src/pages/employee/EmployeeVerificationRequests.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Pagination,
  Stack
} from '@mui/material';
import UniversalTable  from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api             from '../../services/api';
import '../../css/employee/EmployeePosition.css';   // общий стиль

const PER_PAGE = 20;

export default function EmployeeVerificationRequests() {
  const [rows,     setRows]     = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState({ text: '', field: 'login' });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar  = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar(o => ({ ...o, open: false }));

  // Здесь загружается полный список заявок
  const fetchRequests = useCallback(async (p) => {
    try {
      const { data } = await api.get('/verification-requests', {
        params: { page: p, perPage: PER_PAGE }
      });
      setRows(data.items);
      setTotal(data.total);
    } catch {
      showSnackbar('Не удалось загрузить заявки', 'error');
    }
  }, []);

  useEffect(() => {
    fetchRequests(page);
  }, [page, fetchRequests]);

  // Здесь формируется список после фильтрации
  const filtered = useMemo(() => {
    if (!search.text) return rows;
    const q = search.text.toLowerCase();
    return rows.filter(r => String(r[search.field] || '').toLowerCase().includes(q));
  }, [rows, search]);

  // Здесь описаны колонки таблицы
  const columns = [
    { key: 'num',           label: '№',               width: '6%'  },
    { key: 'login',         label: 'Логин',           width: '18%' },
    { key: 'full_name',     label: 'ФИО',             width: '36%' },
    { key: 'date_update',   label: 'Дата обновления', width: '16%' },
    { key: 'date_creation', label: 'Дата создания',   width: '16%' },
    {
      key: 'status',
      label: 'Статус',
      width: '8%',
      render: v => (
        <span style={{
          padding: '2px 6px',
          borderRadius: 4,
          background: v === 'pending'  ? '#9e9e9e'
                     : v === 'approved' ? '#4caf50'
                     : v === 'rejected' ? '#f44336'
                     : v === 'canceled' ? '#ff9800'
                     : '#607d8b',
          color: '#fff',
          fontSize: 13,
          textTransform: 'capitalize'
        }}>
          {v}
        </span>
      )
    }
  ];

  const [openDialog,   setOpenDialog]   = useState(false);
  const [users,        setUsers]        = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  // Здесь открывается форма создания
  const handleOpen = async () => {
    setOpenDialog(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch {
      showSnackbar('Не удалось загрузить пользователей', 'error');
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedUser('');
  };

  // Здесь происходит создание справки
  const handleCreate = async () => {
    try {
      await api.post('/verification-requests', { userId: selectedUser });
      showSnackbar('Справка создана', 'success');
      handleClose();
      fetchRequests(page);
    } catch {
      showSnackbar('Ошибка при создании справки', 'error');
    }
  };

  return (
    <div className="employee-position-container">
      <h1>Заявки на проверку стажа</h1>

      <div className="employee-position-actions">


        <UniversalSearch
          fields={[
            { value: 'login',     label: 'Логин'  },
            { value: 'full_name', label: 'ФИО'    },
            { value: 'status',    label: 'Статус' }
          ]}
          onSearch={({ text, field }) => {
            setSearch(prev => {
              if (prev.text === text && prev.field === field) return prev;
              setPage(1);
              return { text, field };
            });
          }}
        />
      </div>
      <Button variant="contained" onClick={handleOpen}>
          Создать справку
      </Button>
      <UniversalTable columns={columns} data={filtered} />

      {total > PER_PAGE && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Pagination
            page={page}
            count={Math.ceil(total / PER_PAGE)}
            onChange={(_e, v) => setPage(v)}
          />
        </Stack>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>Создание справки</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Пользователь</InputLabel>
            <Select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
            >
              {users.map(u => (
                <MenuItem key={u.id} value={u.id}>
                  {u.login} — {u.surname} {u.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!selectedUser}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
