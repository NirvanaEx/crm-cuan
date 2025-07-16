// src/pages/certificate/CertificateRequests.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Tabs, Tab, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar, Alert, Typography
} from '@mui/material';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { format, differenceInDays } from 'date-fns';
import '../../css/certificate/CertificateRequests.css';

export default function CertificateRequests() {
  const [tab, setTab]             = useState(0);
  const statusMap                 = ['pending','history'];
  const [rows, setRows]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const limit                     = 10;

  const [filters, setFilters]     = useState({ text:'', field:'surname', dateFrom:'', dateTo:'' });
  const prevFilters               = useRef(filters);

  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [fields, setFields]         = useState([]);
  const [data, setData]             = useState({}); // { [field_id]: value }

  const [snackbar, setSnackbar]   = useState({ open:false, message:'', severity:'success' });
  const show = (m,s='success')    => setSnackbar({ open:true, message:m, severity:s });
  const close = ()                 => setSnackbar(s=>({...s,open:false}));

  // 1) Загрузка запросов
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/certificate/requests', {
          params: {
            page, limit,
            status: statusMap[tab],
            search: filters.text,
            searchField: filters.field,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo
          }
        });
        setTotal(res.data.total);
        setRows(res.data.rows);
      } catch {
        show('Error loading requests','error');
      }
    }
    load();
  }, [tab, page, filters]);

  // 2) Поиск
  const handleSearch = p => {
    if (JSON.stringify(p)!==JSON.stringify(prevFilters.current)) {
      prevFilters.current = p;
      setFilters(p);
      setPage(1);
    }
  };

  // 3) Открытие диалога (для Pending и History)
  const handleRowClick = async row => {
    setSelected(row);
    try {
      // 3.1. Загрузить дефиниции полей сертификата
      const f = await api.get('/certificate/fields', {
        params: { certificate_id: row.certificate_id, page:1, limit:100 }
      });
      setFields(f.data.rows);

      // 3.2. Загрузить уже заполненные данные (если есть)
      const d = await api.get('/certificate/data', {
        params: { request_id: row.id }
      });
      // ожидаем d.data.rows = [{ certificate_field_id, value }, …]
      const existing = {};
      d.data.rows.forEach(r => { existing[r.certificate_field_id] = r.value; });
      setData(existing);

      setOpenDialog(true);
    } catch {
      show('Error loading fields/data','error');
    }
  };

  // Утилиты для разрешения редактирования в истории
  const canEdit = () => {
    if (!selected) return false;
    const days = differenceInDays(new Date(), new Date(selected.date_creation));
    return days <= 7;
  };

  // 4) Подтвердить (Pending)
  const handleApprove = async () => {
    try {
      // 4.1. сохранить данные
      const payload = fields.map(fld => ({
        certificate_request_id: selected.id,
        certificate_field_id: fld.id,
        value: data[fld.id] || ''
      }));
      // сначала удаляем старые записи
      await api.delete('/certificate/data', { params:{ request_id: selected.id } });
      await api.post('/certificate/data', payload);
      // 4.2. сменить статус
      await api.put(`/certificate/requests/${selected.id}`, { status:'approved' });
      show('Request approved');
      setOpenDialog(false);
      setFilters(f=>({...f}));
    } catch {
      show('Error approving','error');
    }
  };

  // 5) Отклонить (Pending)
  const handleReject = async () => {
    try {
      await api.put(`/certificate/requests/${selected.id}`, { status:'rejected' });
      show('Request rejected');
      setOpenDialog(false);
      setFilters(f=>({...f}));
    } catch {
      show('Error rejecting','error');
    }
  };

  // 6) Сохранить правки (History)
  const handleSaveHistory = async () => {
    try {
      const payload = fields.map(fld => ({
        certificate_request_id: selected.id,
        certificate_field_id: fld.id,
        value: data[fld.id] || ''
      }));
      await api.delete('/certificate/data', { params:{ request_id: selected.id } });
      await api.post('/certificate/data', payload);
      show('Data updated');
      setOpenDialog(false);
      setFilters(f=>({...f}));
    } catch {
      show('Error saving data','error');
    }
  };

  // 7) Удалить запрос (History, в течение 7 дней)
  const handleDeleteRequest = async () => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await api.delete(`/certificate/requests/${selected.id}`);
      show('Request deleted');
      setOpenDialog(false);
      setFilters(f=>({...f}));
    } catch {
      show('Error deleting request','error');
    }
  };

  // 8) Колонки таблицы
  const columns = [
    { key:'no',               label:'№',       width:'5%' },
    {
      key:'user',
      label:'User',
      width:'25%',
      render:(_,r)=>`${r.surname} ${r.name} (${r.tab_num})`
    },
    { key:'certificate_name', label:'Certificate', width:'25%' },
    {
      key:'date_creation',
      label:'Date',
      width:'20%',
      render: v => format(new Date(v),'dd.MM.yyyy')
    },
    // статус только в истории
    ...(tab===1
      ? [{ key:'status',      label:'Status',  width:'15%' }]
      : [])
  ];

  const fieldsSearch = [
    { value:'surname',          label:'Surname' },
    { value:'certificate_name', label:'Certificate' }
  ];

  return (
    <Box className="cert-req-container">
      <h1>Certificate Requests</h1>

      <Tabs value={tab} onChange={(_,v)=>{ setTab(v); setPage(1); }}>
        <Tab label="Pending"/>
        <Tab label="History"/>
      </Tabs>

      <Box sx={{ display:'flex', mt:2, mb:2 }}>
        <UniversalSearch fields={fieldsSearch} onSearch={handleSearch}/>
      </Box>

      <UniversalTable
        columns={columns}
        data={rows}
        totalItems={total}
        itemsPerPage={limit}
        currentPage={page}
        onPageChange={setPage}
        onRowClick={handleRowClick}
      />

      {/* === DIALOG === */}
      <Dialog
        open={openDialog}
        onClose={()=>setOpenDialog(false)}
        fullWidth maxWidth="sm"
      >
        <DialogTitle>
          {tab===0 ? 'Fill Certificate Data' : 'View/Modify Certificate Data'}
        </DialogTitle>
        <DialogContent>
          {/* Подсказка про 7 дней */}
          {tab===1 && (
            <Typography
              variant="caption"
              color={canEdit() ? 'textSecondary' : 'error'}
            >
              {canEdit()
                ? 'You can modify within 7 days from creation'
                : 'Modification period has expired'}
            </Typography>
          )}

          {/* Поля */}
          {fields.map(fld => (
            <TextField
              key={fld.id}
              label={fld.field_name}
              fullWidth
              margin="dense"
              value={data[fld.id]||''}
              onChange={e=>setData(d=>({...d,[fld.id]:e.target.value}))}
              disabled={ tab===1 && !canEdit() }  // блокируем в истории после 7 дней
            />
          ))}
        </DialogContent>

        <DialogActions>
          {tab===0
            ? <>
                <Button color="error" onClick={handleReject}>Reject</Button>
                <Button variant="contained" onClick={handleApprove}>Approve</Button>
              </>
            : canEdit()
            ? <>
                <Button color="error" onClick={handleDeleteRequest}>
                  Delete Request
                </Button>
                <Button variant="contained" onClick={handleSaveHistory}>
                  Save Changes
                </Button>
              </>
            : <Button onClick={()=>setOpenDialog(false)}>Close</Button>
          }
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
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
