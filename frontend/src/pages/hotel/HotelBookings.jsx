// src/pages/hotel/HotelBookings.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert
} from '@mui/material';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { format } from 'date-fns';
import '../../css/hotel/HotelBookings.css';

export default function HotelBookings() {
  // Table + pagination
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const itemsPerPage          = 10;

  // Filters for search
  const [filters, setFilters] = useState({
    text: '',
    field: 'phone',
    dateFrom: '',
    dateTo: ''
  });
  const prevFilters = useRef(filters);

  // Dialog state
  const [open, setOpen]       = useState(false);
  const [current, setCurrent] = useState({
    id: null, room_id: '', phone: '', purpose: '',
    date_start: '', date_end: ''
  });

  // Rooms list for select
  const [rooms, setRooms] = useState([]);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false, message: '', severity: 'success'
  });
  const show = (msg, sev = 'success') =>
    setSnackbar({ open: true, message: msg, severity: sev });
  const close = () =>
    setSnackbar(s => ({ ...s, open: false }));

  // Fetch bookings when page or filters change
  useEffect(() => {
    async function fetchBookings() {
      try {
        const params = {
          page, limit: itemsPerPage,
          search: filters.text,
          searchField: filters.field,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo
        };
        const res = await api.get('/hotel/bookings', { params });
        // API returns { total, rows }
        setTotal(res.data.total);
        setRows(res.data.rows);
      } catch {
        show('Error loading bookings', 'error');
      }
    }
    fetchBookings();
  }, [page, filters]);

  // Fetch rooms for "New Booking" select (we only need rows)
  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await api.get('/hotel/rooms', {
          params: { page: 1, limit: 1000 } // get all or adjust limit
        });
        setRooms(res.data.rows);
      } catch {
        show('Error loading rooms', 'error');
      }
    }
    fetchRooms();
  }, []);

  // Handle search input
  const handleSearch = params => {
    if (JSON.stringify(params) !== JSON.stringify(prevFilters.current)) {
      prevFilters.current = params;
      setFilters(params);
      setPage(1);
    }
  };

  // Open dialog for Add/Edit
  const handleEdit = row => {
    setCurrent({ ...row }); // row has id, room_id, phone, purpose, date_start, date_end, status, date_creation
    setOpen(true);
  };

  // Save (create or update)
  const handleSave = async () => {
    try {
      if (current.id) {
        // update
        await api.put(`/hotel/bookings/${current.id}`, current);
        show('Booking updated');
      } else {
        // create
        await api.post('/hotel/bookings', current);
        show('Booking created');
      }
      setOpen(false);
      setCurrent({ id: null, room_id: '', phone: '', purpose: '', date_start: '', date_end: '' });
      setFilters(f => ({ ...f })); // reload
    } catch {
      show('Error saving booking', 'error');
    }
  };

  // Delete
  const handleDelete = async row => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await api.delete(`/hotel/bookings/${row.id}`);
      show('Booking deleted');
      setFilters(f => ({ ...f }));
    } catch {
      show('Error deleting booking', 'error');
    }
  };

  // Table columns
  const columns = [
    { key: 'no',          label: '№',      width: '5%' },
    { key: 'room_num',    label: 'Room #', width: '15%' },
    { key: 'phone',       label: 'Phone',  width: '15%' },
    { key: 'purpose',     label: 'Purpose',width: '20%' },
    {
      key: 'date_start',
      label: 'Start',
      width: '15%',
      render: v => format(new Date(v), 'dd.MM.yyyy HH:mm')
    },
    {
      key: 'date_end',
      label: 'End',
      width: '15%',
      render: v => format(new Date(v), 'dd.MM.yyyy HH:mm')
    }
    // Actions column comes from onEdit/onDelete
  ];

  // Searchable fields
  const fields = [
    { value: 'phone',   label: 'Phone' },
    { value: 'purpose', label: 'Purpose' },
    { value: 'room_num',label: 'Room #' }
  ];

  return (
    <Box className="hotel-bookings-container">
      <h1>Hotel Bookings</h1>

      <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
        <UniversalSearch fields={fields} onSearch={handleSearch} />
        <Button
          variant="contained"
          onClick={() => {
            setCurrent({ id: null, room_id: '', phone: '', purpose: '', date_start: '', date_end: '' });
            setOpen(true);
          }}
        >
          New Booking
        </Button>
      </Box>

      <UniversalTable
        columns={columns}
        data={rows}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={p => setPage(p)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Dialog Add/Edit */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{current.id ? 'Edit Booking' : 'New Booking'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Room</InputLabel>
            <Select
              value={current.room_id}
              label="Room"
              onChange={e => setCurrent(c => ({ ...c, room_id: e.target.value }))}
            >
              {rooms.map(r => (
                <MenuItem key={r.id} value={r.id}>
                  {r.num}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Phone"
            fullWidth
            margin="dense"
            value={current.phone}
            onChange={e => setCurrent(c => ({ ...c, phone: e.target.value }))}
          />
          <TextField
            label="Purpose"
            fullWidth
            margin="dense"
            value={current.purpose}
            onChange={e => setCurrent(c => ({ ...c, purpose: e.target.value }))}
          />
          <TextField
            label="Start"
            type="datetime-local"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={current.date_start}
            onChange={e => setCurrent(c => ({ ...c, date_start: e.target.value }))}
          />
          <TextField
            label="End"
            type="datetime-local"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={current.date_end}
            onChange={e => setCurrent(c => ({ ...c, date_end: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              !current.room_id ||
              !current.phone ||
              !current.date_start ||
              !current.date_end
            }
          >
            {current.id ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={close}
        anchorOrigin={{ vertical:'top', horizontal:'right' }}
      >
        <Alert onClose={close} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
