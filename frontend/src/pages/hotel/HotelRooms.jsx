// src/pages/hotel/HotelRooms.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert
} from '@mui/material';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { format } from 'date-fns';
import '../../css/hotel/HotelRooms.css';

export default function HotelRooms() {
  // Table & pagination state
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Search filters
  const [filters, setFilters] = useState({
    text: '',
    field: 'num',
    dateFrom: '',
    dateTo: ''
  });
  const prevFilters = useRef(filters);

  // Dialog state
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [current, setCurrent] = useState({ id: null, num: '', data_status: 'active' });

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const show = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });
  const close = () =>
    setSnackbar(s => ({ ...s, open: false }));

  // Fetch rooms whenever page or filters change
  useEffect(() => {
    async function fetchRooms() {
      try {
        const params = {
          page,
          limit: itemsPerPage,
          ...filters
        };
        const res = await api.get('/hotel/rooms', { params });
        // Expect { total, rows } from API
        setTotal(res.data.total);
        // Add serial number to each row
        setRows(res.data.rows.map((r, idx) => ({
          no: (page - 1) * itemsPerPage + idx + 1,
          ...r
        })));
      } catch {
        show('Error loading rooms', 'error');
      }
    }
    fetchRooms();
  }, [page, filters]);

  // Handle search parameters
  const handleSearch = params => {
    if (JSON.stringify(params) !== JSON.stringify(prevFilters.current)) {
      prevFilters.current = params;
      setFilters(params);
      setPage(1);
    }
  };

  // Create room
  const handleCreate = async () => {
    try {
      await api.post('/hotel/rooms', { num: current.num });
      show('Room created');
      setOpenAdd(false);
      setCurrent({ id: null, num: '', data_status: 'active' });
      // trigger reload
      setFilters(f => ({ ...f }));
    } catch {
      show('Error creating room', 'error');
    }
  };

  // Update room
  const handleUpdate = async () => {
    try {
      await api.put(`/hotel/rooms/${current.id}`, {
        num: current.num,
        data_status: current.data_status
      });
      show('Room updated');
      setOpenEdit(false);
      setCurrent({ id: null, num: '', data_status: 'active' });
      setFilters(f => ({ ...f }));
    } catch {
      show('Error updating room', 'error');
    }
  };

  // Delete (soft)
  const handleDelete = async row => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await api.delete(`/hotel/rooms/${row.id}`);
      show('Room deleted');
      setFilters(f => ({ ...f }));
    } catch {
      show('Error deleting room', 'error');
    }
  };

  // Table columns
  const columns = [
    { key: 'no',           label: '№',           width: '5%' },
    { key: 'num',          label: 'Number',      width: '25%' },
    { key: 'data_status',  label: 'Status',      width: '20%' },
    {
      key: 'date_creation',
      label: 'Created',
      width: '25%',
      render: v => format(new Date(v), 'dd.MM.yyyy HH:mm')
    }
    // Actions column will be auto-added by UniversalTable
  ];

  // Searchable fields
  const fields = [
    { value: 'num',         label: 'Number' },
    { value: 'data_status', label: 'Status' }
  ];

  return (
    <Box className="hotel-rooms-container">
      <h1>Hotel Rooms</h1>

      <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
        <UniversalSearch fields={fields} onSearch={handleSearch} />
        <Button
          variant="contained"
          onClick={() => {
            setCurrent({ id: null, num: '', data_status: 'active' });
            setOpenAdd(true);
          }}
        >
          New Room
        </Button>
      </Box>

      <UniversalTable
        columns={columns}
        data={rows}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={p => setPage(p)}
        onEdit={row => {
          setCurrent({ id: row.id, num: row.num, data_status: row.data_status });
          setOpenEdit(true);
        }}
        onDelete={handleDelete}
      />

      {/* Create Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Room</DialogTitle>
        <DialogContent>
          <TextField
            label="Number"
            fullWidth
            margin="dense"
            value={current.num}
            onChange={e => setCurrent(c => ({ ...c, num: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!current.num}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Room</DialogTitle>
        <DialogContent>
          <TextField
            label="Number"
            fullWidth
            margin="dense"
            value={current.num}
            onChange={e => setCurrent(c => ({ ...c, num: e.target.value }))}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={current.data_status}
              label="Status"
              onChange={e => setCurrent(c => ({ ...c, data_status: e.target.value }))}
            >
              {['active','paused','deleted'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={!current.num}
          >
            Save
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
