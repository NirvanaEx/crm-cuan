// src/pages/admin/AdminRegistrations.jsx

import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { format } from 'date-fns';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import '../../css/admin/AdminRegistrations.css';

export default function AdminRegistrations() {
  const { user } = useContext(AuthContext);

  const [tab, setTab] = useState(0); // 0=Pending,1=History
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [searchParams, setSearchParams] = useState({
    text: '',
    field: 'login',
    dateFrom: '',
    dateTo: ''
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [currentReq, setCurrentReq] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const show = (msg, sev = 'success') =>
    setSnackbar({ open: true, message: msg, severity: sev });
  const close = () => setSnackbar(s => ({ ...s, open: false }));

  // Load once
  const fetchAll = useCallback(() => {
    api
      .get('/admin/registration', { params: { page: 1, limit: 1000 } })
      .then(res => setRequests(res.data.rows))
      .catch(() => show('Error loading requests', 'error'));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Filter pending/history
  useEffect(() => {
    const list = requests.filter(r =>
      tab === 0 ? r.status === 'pending' : r.status !== 'pending'
    );
    setFiltered(list);
    setPage(1);
  }, [requests, tab]);

  // Search handler
  const handleSearch = useCallback(params => {
    setSearchParams(params);
    setPage(1);
  }, []);

  // Data for table
  const displayed = filtered
    .filter(r => {
      const { text, field, dateFrom, dateTo } = searchParams;
      let ok = true;
      if (text && field) {
        ok = String(r[field] || '')
          .toLowerCase()
          .includes(text.toLowerCase());
      }
      if (ok && dateFrom) ok = new Date(r.date_creation) >= new Date(dateFrom);
      if (ok && dateTo) ok = new Date(r.date_creation) <= new Date(dateTo);
      return ok;
    })
    .slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Open dialog
  const handleAction = (row, status) => {
    setCurrentReq(row);
    setNewStatus(status);
    setOpenDialog(true);
  };

  // Submit and update local state
  const handleSubmit = () => {
    api
      .patch(`/admin/registration/${currentReq.id}`, { status: newStatus })
      .then(() => {
        // Update local list instantly
        setRequests(prev =>
          prev.map(r =>
            r.id === currentReq.id ? { ...r, status: newStatus } : r
          )
        );
        show(`Request ${newStatus}`);
        setOpenDialog(false);
      })
      .catch(() => show('Error updating', 'error'));
  };

  const columns = [
    { key: 'no', label: '№', width: '5%' },
    { key: 'login', label: 'Login', width: '15%' },
    { key: 'surname', label: 'Surname', width: '15%' },
    { key: 'name', label: 'Name', width: '15%' },
    { key: 'tab_num', label: 'Tab №', width: '10%' },
    { key: 'phone', label: 'Phone', width: '10%' },
    {
      key: 'date_creation',
      label: 'Created',
      width: '15%',
      render: v => format(new Date(v), 'dd.MM.yyyy HH:mm')
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (_, r) =>
        r.status === 'pending' && tab === 0 ? (
          <Box className="actions-cell">
            <Tooltip title="Approve" arrow>
              <IconButton
                className="approve-btn"
                onClick={() => handleAction(r, 'approved')}
                size="small"
              >
                <AiOutlineCheck />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject" arrow>
              <IconButton
                className="reject-btn"
                onClick={() => handleAction(r, 'rejected')}
                size="small"
              >
                <AiOutlineClose />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <span className={`status-label ${r.status}`}>{r.status}</span>
        )
    }
  ];

  const searchFields = [
    { value: 'login', label: 'Login' },
    { value: 'surname', label: 'Surname' },
    { value: 'name', label: 'Name' },
    { value: 'tab_num', label: 'Tab №' },
    { value: 'status', label: 'Status' }
  ];

  return (
    <Box className="admin-reg-container">
      <h1>User Registrations</h1>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        className="registrations-tabs"
      >
        <Tab label="Pending" />
        <Tab label="History" />
      </Tabs>

      <Box className="search-wrapper">
        <UniversalSearch fields={searchFields} onSearch={handleSearch} />
      </Box>

      <UniversalTable
        columns={columns}
        data={displayed.map((r, i) => ({
          no: (page - 1) * itemsPerPage + i + 1,
          ...r
        }))}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
      />

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm {newStatus}</DialogTitle>
        <DialogContent>
          Are you sure to <strong>{newStatus}</strong> registration for{' '}
          <em>{currentReq?.login}</em>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Yes, {newStatus}
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
