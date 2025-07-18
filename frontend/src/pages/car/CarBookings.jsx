// src/pages/car/CarBookings.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Tabs, Tab, Snackbar, Alert
} from '@mui/material';
import { AiOutlineEdit } from 'react-icons/ai';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import '../../css/car/CarBookings.css';

export default function CarBookings() {
  const { user } = useContext(AuthContext);

  // Проверяем, есть ли у пользователя право читать все бронирования
  // или он суперадмин
  const canReadAll = user.permissions?.includes('carBook_read_all') || user.roles?.some(r => r.name.toLowerCase() === 'superadmin');
  // UI state
  const [tab, setTab]               = useState(0);
  const [bookings, setBookings]     = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage]             = useState(1);
  const itemsPerPage                = 10;

  // Search state
  const [searchParams, setSearchParams] = useState({
    text: '', field: 'phone_number', dateFrom: '', dateTo: ''
  });
  const prevSearchParams = useRef(searchParams);

  // Add-dialog state
  const [openAdd, setOpenAdd] = useState(false);
  const [newB, setNewB] = useState({
    date_start: '', date_expired: '',
    car_id: '', phone_number: '', purpose: '', route: ''
  });
  const [cars, setCars] = useState([]);

  // Edit-dialog state
  const [openEdit, setOpenEdit] = useState(false);
  const [editB, setEditB]       = useState({ id: null, status: '' });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false, message: '', severity: 'success'
  });
  const show = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });
  const close = () =>
    setSnackbar(s => ({ ...s, open: false }));

  // Выбираем эндпоинт: админский или «свой»
  const endpointsAll = ['/pending', '/active', '/history'];
  const endpointsOwn = ['/my/pending', '/my/active', '/my/history'];
  const endpoint     = canReadAll
    ? endpointsAll[tab]
    : endpointsOwn[tab];

  // Загрузка списка бронирований
  const fetchBookings = () => {
    const { text, field, dateFrom, dateTo } = searchParams;
    api.get(`/car-bookings${endpoint}`, {
      params: {
        page,
        limit: itemsPerPage,
        search: text,
        searchField: field,
        dateFrom,
        dateTo
      }
    })
    .then(res => {
      setTotalItems(res.data.total);
      setBookings(res.data.rows.map((b, i) => ({
        no: (page - 1) * itemsPerPage + i + 1,
        ...b,
        car:  `${b.model} (${b.category_name}) #${b.number}`,
        user: `${b.surname} ${b.name} ${b.patronym}`
      })));
    })
    .catch(() => show('Error loading bookings', 'error'));
  };

  // Эффект: обновляем при смене таба, страницы или фильтров
  useEffect(() => {
    fetchBookings();
  }, [tab, page, searchParams]);

  // Поиск с проверкой изменений
  const handleSearch = params => {
    const prev = prevSearchParams.current;
    if (
      params.text     === prev.text &&
      params.field    === prev.field &&
      params.dateFrom === prev.dateFrom &&
      params.dateTo   === prev.dateTo
    ) return;
    prevSearchParams.current = params;
    setSearchParams(params);
    setPage(1);
  };

  // Загрузка доступных машин при открытии Add-dialog
  useEffect(() => {
    if (!openAdd) return;
    const p = {};
    if (newB.date_start && newB.date_expired) {
      p.date_start   = newB.date_start;
      p.date_expired = newB.date_expired;
    }
    api.get('/cars/available', { params: p })
      .then(res => setCars(res.data))
      .catch(() => show('Error loading cars', 'error'));
  }, [openAdd, newB.date_start, newB.date_expired]);

  // Создать бронирование
  const handleAdd = () => {
    api.post('/car-bookings', { ...newB, user_id: user.id })
      .then(() => {
        show('Booking created');
        setOpenAdd(false);
        setPage(1);
        fetchBookings();
      })
      .catch(() => show('Error creating booking', 'error'));
  };

  // Обновить статус (админ или own)
  const handleEdit = () => {
    const url = canReadAll
      ? `/car-bookings/${editB.id}/status`
      : `/car-bookings/my/${editB.id}/status`;
    api.put(url, { status: editB.status })
      .then(() => {
        show('Status updated');
        setOpenEdit(false);
        fetchBookings();
      })
      .catch(() => show('Error updating status', 'error'));
  };

  // Конфигурация колонок
  const columns = [
    { key: 'no',           label: '№',       width: '5%' },
    { key: 'car',          label: 'Car',     width: '15%' },
    { key: 'user',         label: 'User',    width: '15%' },
    { key: 'phone_number', label: 'Phone',   width: '10%' },
    { key: 'purpose',      label: 'Purpose', width: '10%' },
    { key: 'route',        label: 'Route',   width: '15%' },
    {
      key: 'date_start',   label: 'Start',   width: '10%',
      render: v => format(new Date(v), 'dd.MM.yyyy HH:mm')
    },
    {
      key: 'date_expired', label: 'End',     width: '10%',
      render: v => format(new Date(v), 'dd.MM.yyyy HH:mm')
    },
    {
      key: 'date_creation',label: 'Created', width: '10%',
      render: v => format(new Date(v), 'dd.MM.yyyy HH:mm')
    },
    {
      key: 'status',       label: 'Status',  width: '10%',
      render: (_, r) =>
        tab === 0
          ? <AiOutlineEdit
              style={{ cursor: 'pointer' }}
              onClick={() => { setEditB({ id: r.id, status: r.status }); setOpenEdit(true); }}
            />
          : r.status
    }
  ];

  const searchFields = [
    { value: 'phone_number', label: 'Phone' },
    { value: 'purpose',      label: 'Purpose' },
    { value: 'route',        label: 'Route' },
    { value: 'car',          label: 'Car' },
    { value: 'user',         label: 'User' },
    { value: 'status',       label: 'Status' }
  ];

  return (
    <Box className="car-book-container">
      <h1>Car Bookings</h1>

      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setPage(1); }}
        textColor="inherit"
        indicatorColor="primary"
        sx={{ '& .MuiTabs-indicator': { backgroundColor: 'var(--text-color)' } }}
      >
        <Tab label="Pending" />
        <Tab label="Active" />
        <Tab label="History" />
      </Tabs>

      <Box sx={{ mt: 2, mb: 2, display: 'flex', flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 300px' }}>
          <UniversalSearch
            fields={searchFields}
            onSearch={handleSearch}
          />
        </Box>
        {tab === 0 && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <Button variant="contained" onClick={() => setOpenAdd(true)}>
              New Booking
            </Button>
          </Box>
        )}
      </Box>

      <UniversalTable
        columns={columns}
        data={bookings}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
      />

      {/* Dialog: Create */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Booking</DialogTitle>
        <DialogContent>
          <TextField
            label="Start" type="datetime-local"
            fullWidth margin="dense" InputLabelProps={{ shrink: true }}
            value={newB.date_start}
            onChange={e => setNewB({ ...newB, date_start: e.target.value })}
          />
          <TextField
            label="End" type="datetime-local"
            fullWidth margin="dense" InputLabelProps={{ shrink: true }}
            value={newB.date_expired}
            onChange={e => setNewB({ ...newB, date_expired: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Car</InputLabel>
            <Select
              value={newB.car_id}
              onChange={e => setNewB({ ...newB, car_id: e.target.value })}
              label="Car"
            >
              {cars.length === 0
                ? <MenuItem value="" disabled>No available cars</MenuItem>
                : cars.map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      {`${c.model} (${c.category_name}) #${c.number}`}
                    </MenuItem>
                  ))
              }
            </Select>
          </FormControl>
          <TextField
            label="Phone" fullWidth margin="dense"
            value={newB.phone_number}
            onChange={e => setNewB({ ...newB, phone_number: e.target.value })}
          />
          <TextField
            label="Purpose" fullWidth margin="dense"
            value={newB.purpose}
            onChange={e => setNewB({ ...newB, purpose: e.target.value })}
          />
          <TextField
            label="Route" fullWidth margin="dense"
            value={newB.route}
            onChange={e => setNewB({ ...newB, route: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={cars.length === 0}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Edit */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="xs">
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={editB.status}
              onChange={e => setEditB({ ...editB, status: e.target.value })}
              label="Status"
            >
              { canReadAll
                ? ['pending','approved','canceled','rejected']
                    .map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)
                : ['canceled']
                    .map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)
              }
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={close}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={close} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
