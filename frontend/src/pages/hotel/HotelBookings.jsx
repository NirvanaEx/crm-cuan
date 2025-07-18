// src/pages/hotel/HotelBookings.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Tabs, Tab, Snackbar, Alert, Checkbox, FormControlLabel, IconButton
} from '@mui/material';
import { AiOutlineEdit, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import '../../css/hotel/HotelBookings.css';

export default function HotelBookings() {
  const { user } = useContext(AuthContext);

  const canAdmin =
    user.permissions?.includes('hotelBook_read_all') ||
    user.roles?.some(r => r.name.toLowerCase() === 'superadmin');

  const [tab, setTab] = useState(0);
  const statusMap = ['pending', 'active', 'history'];

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({
    text: '', field: 'phone', dateFrom: '', dateTo: ''
  });
  const prevFilters = useRef(filters);

  // Create dialog state
  const [openAdd, setOpenAdd] = useState(false);
  const [newB, setNewB] = useState({
    room_id: '', phone: '', purpose: '', date_start: '', date_end: ''
  });
  const [rooms, setRooms] = useState([]);

  // Pending dialog state
  const [openPending, setOpenPending] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [pendingCode, setPendingCode] = useState('');
  const [pendingCustom, setPendingCustom] = useState(false);

  // Active edit-code dialog state
  const [openEditCode, setOpenEditCode] = useState(false);
  const [codeBooking, setCodeBooking] = useState(null);
  const [editCode, setEditCode] = useState('');
  const [editCustom, setEditCustom] = useState(false);

  // Reveal state per row
  const [revealMap, setRevealMap] = useState({});

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const show = (msg, sev = 'success') => setSnackbar({ open: true, message: msg, severity: sev });
  const close = () => setSnackbar(s => ({ ...s, open: false }));

  const endpointsAll = ['/pending', '/active', '/history'];
  const endpointsOwn = ['/my/pending', '/my/active', '/my/history'];
  const endpoint = canAdmin ? endpointsAll[tab] : endpointsOwn[tab];

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const status = statusMap[tab];
      const url = `/hotel/bookings${endpoint}`;
      const res = await api.get(url, {
        params: {
          page, limit: itemsPerPage,
          status,
          search: filters.text,
          searchField: filters.field,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo
        }
      });
      setTotal(res.data.total);
      setRows(res.data.rows.map((b, i) => ({
        no: (page - 1) * itemsPerPage + i + 1,
        ...b
      })));
    } catch {
      show('Error loading bookings', 'error');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [tab, page, filters, endpoint]);

  // Load available rooms when opening "New Booking" and dates set
  useEffect(() => {
    if (!openAdd) return;
    if (newB.date_start && newB.date_end) {
      (async () => {
        try {
          const res = await api.get('/hotel/rooms/available', {
            params: { date_start: newB.date_start, date_end: newB.date_end }
          });
          setRooms(res.data);
        } catch {
          show('Error loading rooms', 'error');
        }
      })();
    } else {
      setRooms([]);
    }
  }, [openAdd, newB.date_start, newB.date_end]);

  // Handle search
  const handleSearch = params => {
    if (JSON.stringify(params) === JSON.stringify(prevFilters.current)) return;
    prevFilters.current = params;
    setFilters(params);
    setPage(1);
  };

  // Create booking
  const handleAdd = async () => {
    try {
      const res = await api.post('/hotel/bookings', { ...newB, user_id: user.id });
      show(`Booking created! Door code: ${res.data.door_code}`);
      setOpenAdd(false);
      setNewB({ room_id: '', phone: '', purpose: '', date_start: '', date_end: '' });
      setPage(1);
      await fetchBookings();
    } catch {
      show('Error creating booking', 'error');
    }
  };

  // Code generator
  const generateCode = () => Math.random().toString().slice(2, 7);

  // Toggle reveal
  const toggleReveal = id => {
    setRevealMap(m => ({ ...m, [id]: !m[id] }));
  };

  // Row click: only pending opens pending dialog
  const handleRowClick = row => {
    if (canAdmin && tab === 0) {
      setPendingBooking(row);
      setPendingCode(generateCode());
      setPendingCustom(false);
      setOpenPending(true);
    }
  };

  // Approve pending
  const handleApprove = async () => {
    try {
      await api.put(`/hotel/bookings/${pendingBooking.id}/status`, {
        status: 'approved', door_code: pendingCode
      });
      show('Booking approved');
      setOpenPending(false);
      await fetchBookings();
    } catch {
      show('Error approving', 'error');
    }
  };

  // Reject pending
  const handleReject = async () => {
    try {
      await api.put(`/hotel/bookings/${pendingBooking.id}/status`, {
        status: 'rejected'
      });
      show('Booking rejected');
      setOpenPending(false);
      await fetchBookings();
    } catch {
      show('Error rejecting', 'error');
    }
  };

  // Open edit-code dialog for active rows
  const handleOpenEditCode = row => {
    setCodeBooking(row);
    setEditCode(row.door_code || generateCode());
    setEditCustom(false);
    setOpenEditCode(true);
  };

  // Save edited code
  const handleSaveCode = async () => {
    try {
      await api.put(`/hotel/bookings/${codeBooking.id}/status`, {
        status: 'approved', door_code: editCode
      });
      show('Door code updated');
      setOpenEditCode(false);
      await fetchBookings();
    } catch {
      show('Error saving code', 'error');
    }
  };

  // Define columns
  let columns = [
    { key: 'no', label: '№', width: '5%' },
    { key: 'phone', label: 'Phone', width: '15%' },
    { key: 'purpose', label: 'Purpose', width: '20%' },
    {
      key: 'date_start', label: 'Start', width: '15%',
      render: v => format(new Date(v), 'dd.MM.yyyy HH:mm')
    },
    {
      key: 'date_end', label: 'End', width: '15%',
      render: v => format(new Date(v), 'dd.MM.yyyy HH:mm')
    }
  ];
  if (tab > 0) {
    columns.splice(1, 0, { key: 'room_num', label: 'Room #', width: '15%' });
    columns.push({
      key: 'door_code',
      label: 'Door Code',
      width: '15%',
      render: (_, r) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 1 }}>
            {revealMap[r.id] ? r.door_code : '*****'}
          </Box>
          <IconButton size="small" onClick={() => toggleReveal(r.id)}>
            {revealMap[r.id] ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </IconButton>
          {tab === 1 && canAdmin && (
            <IconButton size="small" onClick={() => handleOpenEditCode(r)}>
              <AiOutlineEdit />
            </IconButton>
          )}
        </Box>
      )
    });
  }
  if (tab === 2) {
    columns.push({ key: 'status', label: 'Status', width: '10%' });
  }

  // Define search fields
  let searchFields = [
    { value: 'phone', label: 'Phone' },
    { value: 'purpose', label: 'Purpose' }
  ];
  if (tab > 0) {
    searchFields.splice(1, 0, { value: 'room_num', label: 'Room #' });
  }
  searchFields.push({ value: 'status', label: 'Status' });

  return (
    <Box className="hotel-bookings-container">
      <h1>Hotel Bookings</h1>

      <Tabs 
        value={tab} 
        onChange={(_, v) => { 
          setTab(v); 
          setPage(1); 
        }}  
        textColor="inherit"
        indicatorColor="primary"
      >
        <Tab label="Pending" />
        <Tab label="Active" />
        <Tab label="History" />
      </Tabs>

      <Box sx={{ mt: 2, mb: 2, display: 'flex', flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 300px' }}>
          <UniversalSearch fields={searchFields} onSearch={handleSearch} />
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
        data={rows}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        onRowClick={handleRowClick}
      />

      {/* Create Booking Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Booking</DialogTitle>
        <DialogContent>
          <TextField
            label="Start" type="datetime-local"
            fullWidth margin="dense" InputLabelProps={{ shrink: true }}
            value={newB.date_start}
            onChange={e => setNewB(b => ({ ...b, date_start: e.target.value }))}
          />
          <TextField
            label="End" type="datetime-local"
            fullWidth margin="dense" InputLabelProps={{ shrink: true }}
            value={newB.date_end}
            onChange={e => setNewB(b => ({ ...b, date_end: e.target.value }))}
          />
          <FormControl fullWidth margin="dense" disabled={!(newB.date_start && newB.date_end)}>
            <InputLabel>Room</InputLabel>
            <Select
              value={newB.room_id}
              label="Room"
              onChange={e => setNewB(b => ({ ...b, room_id: e.target.value }))}
            >
              {rooms.length === 0
                ? <MenuItem value="" disabled>
                    {newB.date_start && newB.date_end ? 'No available rooms' : 'Select dates first'}
                  </MenuItem>
                : rooms.map(r => <MenuItem key={r.id} value={r.id}>{r.num}</MenuItem>)
              }
            </Select>
          </FormControl>
          <TextField
            label="Phone" fullWidth margin="dense"
            value={newB.phone}
            onChange={e => setNewB(b => ({ ...b, phone: e.target.value }))}
          />
          <TextField
            label="Purpose" fullWidth margin="dense"
            value={newB.purpose}
            onChange={e => setNewB(b => ({ ...b, purpose: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!newB.room_id || !newB.phone || !newB.date_start || !newB.date_end}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pending Approve/Reject Dialog */}
      <Dialog open={openPending} onClose={() => setOpenPending(false)} fullWidth maxWidth="xs">
        <DialogTitle>Approve or Reject</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={<Checkbox checked={!pendingCustom} onChange={e => setPendingCustom(!e.target.checked)} />}
            label="Auto-generate code"
          />
          <TextField
            label="Door Code"
            fullWidth margin="dense"
            value={pendingCode}
            disabled={!pendingCustom}
            onChange={e => setPendingCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReject}>Reject</Button>
          <Button variant="contained" onClick={handleApprove}>Approve</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Door Code Dialog */}
      <Dialog open={openEditCode} onClose={() => setOpenEditCode(false)} fullWidth maxWidth="xs">
        <DialogTitle>Edit Door Code</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={<Checkbox checked={!editCustom} onChange={e => setEditCustom(!e.target.checked)} />}
            label="Auto-generate code"
          />
          <TextField
            label="Door Code"
            fullWidth margin="dense"
            value={editCode}
            disabled={!editCustom}
            onChange={e => setEditCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditCode(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCode}>Save</Button>
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
