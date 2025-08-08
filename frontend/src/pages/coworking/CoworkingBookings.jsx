// src/pages/coworking/CoworkingBookings.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Tabs, Tab, Snackbar, Alert, RadioGroup, FormControlLabel, Radio, Chip
} from '@mui/material';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import '../../css/coworking/CoworkingBookings.css';

export default function CoworkingBookings() {
  const { user } = useContext(AuthContext);

  const canAdmin =
    user.permissions?.includes('coworkingBook_read_all') ||
    user.roles?.some(r => r.name.toLowerCase() === 'superadmin');

  const [tab, setTab] = useState(0);
  const statusMap = ['pending', 'active', 'history'];

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({
    text: '', field: 'purpose', dateFrom: '', dateTo: ''
  });
  const prevFilters = useRef(filters);

  const [openAdd, setOpenAdd] = useState(false);
  const [newB, setNewB] = useState({
    coworking_id: '', purpose: '', date_start: '', date_end: ''
  });
  const [coworkings, setCoworkings] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const show = (msg, sev = 'success') => setSnackbar({ open: true, message: msg, severity: sev });
  const close = () => setSnackbar(s => ({ ...s, open: false }));

  // Диалог смены статуса
  const [statusDlg, setStatusDlg] = useState({
    open: false,
    booking: null,
    newStatus: ''
  });

  const endpointsAll = ['/pending', '/active', '/history'];
  const endpointsOwn = ['/my/pending', '/my/active', '/my/history'];
  const endpoint = canAdmin ? endpointsAll[tab] : endpointsOwn[tab];

  const fetchBookings = async () => {
    try {
      const status = statusMap[tab];
      const url = `/coworking/bookings${endpoint}`;
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

  useEffect(() => {
    if (!openAdd) return;
    if (newB.date_start && newB.date_end) {
      (async () => {
        try {
          const res = await api.get('/coworking/available', {
            params: { date_start: newB.date_start, date_end: newB.date_end }
          });
          setCoworkings(res.data);
        } catch {
          show('Error loading coworkings', 'error');
        }
      })();
    } else {
      setCoworkings([]);
    }
  }, [openAdd, newB.date_start, newB.date_end]);

  const handleSearch = params => {
    if (JSON.stringify(params) === JSON.stringify(prevFilters.current)) return;
    prevFilters.current = params;
    setFilters(params);
    setPage(1);
  };

  const handleAdd = async () => {
    try {
      await api.post('/coworking/bookings', { ...newB, user_id: user.id });
      show(`Booking created!`);
      setOpenAdd(false);
      setNewB({ coworking_id: '', purpose: '', date_start: '', date_end: '' });
      setPage(1);
      await fetchBookings();
    } catch {
      show('Error creating booking', 'error');
    }
  };

  // === Клик по строке таблицы ===
  const handleRowClick = (row) => {
    if (row.status !== 'pending') return; // только pending
    if (canAdmin) {
      setStatusDlg({ open: true, booking: row, newStatus: 'approved' });
    } else {
      setStatusDlg({ open: true, booking: row, newStatus: 'canceled' });
    }
  };

  // === Отправка изменения статуса ===
  const submitStatusChange = async () => {
    try {
      const id = statusDlg.booking.id;
      if (canAdmin) {
        await api.put(`/coworking/bookings/${id}/status`, {
          status: statusDlg.newStatus
        });
      } else {
        await api.put(`/coworking/bookings/my/${id}/status`, {
          status: 'canceled'
        });
      }
      show('Status updated');
      setStatusDlg({ open: false, booking: null, newStatus: '' });
      await fetchBookings();
    } catch {
      show('Error updating status', 'error');
    }
  };

  const columns = [
    { key: 'no', label: '№', width: '5%' },
    { key: 'purpose', label: 'Purpose', width: '20%' },
    {
      key: 'date_start', label: 'Start', width: '15%',
      render: v => format(new Date(v), 'dd.MM.yyyy HH:mm')
    },
    {
      key: 'date_end', label: 'End', width: '15%',
      render: v => format(new Date(v), 'dd.MM.yyyy HH:mm')
    },
    {
      key: 'status', label: 'Status', width: '12%',
      render: v => (
        <Chip
          label={v}
          size="small"
          variant={v === 'pending' ? 'filled' : 'outlined'}
          color={
            v === 'approved'
              ? 'success'
              : v === 'rejected'
              ? 'error'
              : v === 'pending'
              ? 'warning'
              : 'default'
          }
        />
      )
    }
  ];

  const searchFields = [
    { value: 'purpose', label: 'Purpose' },
    { value: 'status', label: 'Status' }
  ];

  return (
    <Box className="coworking-bookings-container">
      <h1>Coworking Bookings</h1>

      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setPage(1); }}
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
            <InputLabel>Coworking</InputLabel>
            <Select
              value={newB.coworking_id}
              label="Coworking"
              onChange={e => setNewB(b => ({ ...b, coworking_id: e.target.value }))}
            >
              {coworkings.length === 0
                ? <MenuItem value="" disabled>
                    {newB.date_start && newB.date_end ? 'No available coworkings' : 'Select dates first'}
                  </MenuItem>
                : coworkings.map(r => <MenuItem key={r.id} value={r.id}>{r.room}</MenuItem>)
              }
            </Select>
          </FormControl>
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
            disabled={!newB.coworking_id || !newB.date_start || !newB.date_end}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог смены статуса — ADMIN */}
      <Dialog
        open={statusDlg.open && canAdmin}
        onClose={() => setStatusDlg(s => ({ ...s, open: false }))}
        fullWidth maxWidth="xs"
      >
        <DialogTitle>Change status</DialogTitle>
        <DialogContent>
          {statusDlg.booking && (
            <>
              <div style={{ marginBottom: 8 }}>
                <b>Purpose:</b> {statusDlg.booking.purpose} <br/>
                <b>Period:</b>{' '}
                {format(new Date(statusDlg.booking.date_start), 'dd.MM.yyyy HH:mm')}
                {' — '}
                {format(new Date(statusDlg.booking.date_end), 'dd.MM.yyyy HH:mm')}
              </div>
              <RadioGroup
                value={statusDlg.newStatus}
                onChange={e => setStatusDlg(s => ({ ...s, newStatus: e.target.value }))}
              >
                <FormControlLabel value="approved" control={<Radio />} label="Approve" />
                <FormControlLabel value="rejected" control={<Radio />} label="Reject" />
              </RadioGroup>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDlg(s => ({ ...s, open: false }))}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitStatusChange}
            disabled={!statusDlg.newStatus || statusDlg.booking?.status !== 'pending'}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог отмены — OWN */}
      <Dialog
        open={statusDlg.open && !canAdmin}
        onClose={() => setStatusDlg(s => ({ ...s, open: false }))}
        fullWidth maxWidth="xs"
      >
        <DialogTitle>Cancel booking?</DialogTitle>
        <DialogContent>
          {statusDlg.booking && (
            <div style={{ marginBottom: 8 }}>
              <b>Purpose:</b> {statusDlg.booking.purpose} <br/>
              <b>Period:</b>{' '}
              {format(new Date(statusDlg.booking.date_start), 'dd.MM.yyyy HH:mm')}
              {' — '}
              {format(new Date(statusDlg.booking.date_end), 'dd.MM.yyyy HH:mm')}
            </div>
          )}
          This action will cancel your booking.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDlg(s => ({ ...s, open: false }))}>No</Button>
          <Button
            variant="contained"
            color="error"
            onClick={submitStatusChange}
            disabled={statusDlg.booking?.status !== 'pending'}
          >
            Yes, cancel
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
