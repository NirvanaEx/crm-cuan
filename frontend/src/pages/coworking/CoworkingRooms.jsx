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
import '../../css/coworking/CoworkingRooms.css';

export default function CoworkingRooms() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({
    text: '',
    field: 'room',
    dateFrom: '',
    dateTo: ''
  });
  const prevFilters = useRef(filters);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [current, setCurrent] = useState({ id: null, room: '', data_status: 'active' });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const show = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const close = () => setSnackbar(s => ({ ...s, open: false }));

  useEffect(() => {
    async function fetchData() {
      try {
        const params = { page, limit: itemsPerPage, ...filters };
        const res = await api.get('/coworking', { params });
        setTotal(res.data.total);
        setRows(res.data.rows.map((r, idx) => ({
          no: (page - 1) * itemsPerPage + idx + 1,
          ...r
        })));
      } catch {
        show('Error loading coworking rooms', 'error');
      }
    }
    fetchData();
  }, [page, filters]);

  const handleSearch = params => {
    if (JSON.stringify(params) !== JSON.stringify(prevFilters.current)) {
      prevFilters.current = params;
      setFilters(params);
      setPage(1);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/coworking', { room: current.room });
      show('Coworking created');
      setOpenAdd(false);
      setCurrent({ id: null, room: '', data_status: 'active' });
      setFilters(f => ({ ...f }));
    } catch {
      show('Error creating coworking', 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/coworking/${current.id}`, {
        room: current.room,
        data_status: current.data_status
      });
      show('Coworking updated');
      setOpenEdit(false);
      setCurrent({ id: null, room: '', data_status: 'active' });
      setFilters(f => ({ ...f }));
    } catch {
      show('Error updating coworking', 'error');
    }
  };

  const handleDelete = async row => {
    if (!window.confirm('Delete this coworking?')) return;
    try {
      await api.delete(`/coworking/${row.id}`);
      show('Coworking deleted');
      setFilters(f => ({ ...f }));
    } catch {
      show('Error deleting coworking', 'error');
    }
  };

  const columns = [
    { key: 'no', label: '№', width: '5%' },
    { key: 'room', label: 'Room', width: '25%' },
    { key: 'data_status', label: 'Status', width: '20%' },
    {
      key: 'date_creation',
      label: 'Created',
      width: '25%',
      render: v => format(new Date(v), 'dd.MM.yyyy HH:mm')
    }
  ];

  const fields = [
    { value: 'room', label: 'Room' },
    { value: 'data_status', label: 'Status' }
  ];

  return (
    <Box className="coworking-rooms-container">
      <h1>Coworking Rooms</h1>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <UniversalSearch fields={fields} onSearch={handleSearch} />
        <Button
          variant="contained"
          onClick={() => {
            setCurrent({ id: null, room: '', data_status: 'active' });
            setOpenAdd(true);
          }}
        >
          New Coworking
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
          setCurrent({ id: row.id, room: row.room, data_status: row.data_status });
          setOpenEdit(true);
        }}
        onDelete={handleDelete}
      />

      {/* Create Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Coworking</DialogTitle>
        <DialogContent>
          <TextField
            label="Room"
            fullWidth
            margin="dense"
            value={current.room}
            onChange={e => setCurrent(c => ({ ...c, room: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!current.room}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Coworking</DialogTitle>
        <DialogContent>
          <TextField
            label="Room"
            fullWidth
            margin="dense"
            value={current.room}
            onChange={e => setCurrent(c => ({ ...c, room: e.target.value }))}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={current.data_status}
              label="Status"
              onChange={e => setCurrent(c => ({ ...c, data_status: e.target.value }))}
            >
              {['active', 'paused', 'deleted'].map(s => (
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
            disabled={!current.room}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
