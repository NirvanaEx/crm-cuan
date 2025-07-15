import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert
} from '@mui/material';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import '../../css/certificate/CertificateFields.css';

export default function CertificateFields() {
  // таблица и пагинация
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // фильтры поиска
  const [filters, setFilters] = useState({
    text: '', field: 'field_name', dateFrom: '', dateTo: ''
  });
  const prevFilters = useRef(filters);

  // список сертификатов для селекта
  const [certs, setCerts] = useState([]);

  // диалоги
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [current, setCurrent] = useState({
    id: null, certificate_id: '', field_name: '', value: ''
  });

  // снэкбар
  const [snackbar, setSnackbar] = useState({ open:false,message:'',severity:'success' });
  const show = (m,s='success') => setSnackbar({ open:true,message:m,severity:s });
  const close = () => setSnackbar(s=>({...s,open:false}));

  // загрузка списка полей
  useEffect(() => {
    async function load() {
      try {
        const params = { page, limit: itemsPerPage, ...filters };
        const res = await api.get('/certificate/fields', { params });
        setTotal(res.data.total);
        setRows(res.data.rows);
      } catch {
        show('Error loading fields','error');
      }
    }
    load();
  }, [page, filters]);

  // загрузка списка сертификатов
  useEffect(() => {
    async function loadCerts() {
      try {
        const res = await api.get('/certificate', {
          params: { page:1, limit:1000, search:'', searchField:'name', dateFrom:'', dateTo:'' }
        });
        setCerts(res.data.rows);
      } catch {
        show('Error loading certificates','error');
      }
    }
    loadCerts();
  }, []);

  // поиск
  const handleSearch = params => {
    if (JSON.stringify(params) !== JSON.stringify(prevFilters.current)) {
      prevFilters.current = params;
      setFilters(params);
      setPage(1);
    }
  };

  // create
  const handleCreate = async () => {
    try {
      await api.post('/certificate/fields', {
        certificate_id: current.certificate_id,
        field_name: current.field_name,
        value: current.value
      });
      show('Field created');
      setOpenAdd(false);
      setCurrent({ id:null, certificate_id:'', field_name:'', value:'' });
      setFilters(f=>({...f}));
    } catch {
      show('Error creating field','error');
    }
  };

  // update
  const handleUpdate = async () => {
    try {
      await api.put(`/certificate/fields/${current.id}`, {
        certificate_id: current.certificate_id,
        field_name: current.field_name,
        value: current.value
      });
      show('Field updated');
      setOpenEdit(false);
      setCurrent({ id:null, certificate_id:'', field_name:'', value:'' });
      setFilters(f=>({...f}));
    } catch {
      show('Error updating field','error');
    }
  };

  // delete
  const handleDelete = async row => {
    if (!window.confirm('Delete this field?')) return;
    try {
      await api.delete(`/certificate/fields/${row.id}`);
      show('Field deleted');
      setFilters(f=>({...f}));
    } catch {
      show('Error deleting field','error');
    }
  };

  // колонки
  const columns = [
    { key:'no',               label:'№',          width:'5%' },
    { key:'certificate_name', label:'Certificate',width:'25%' },
    { key:'field_name',       label:'Field',      width:'25%' },
    { key:'value',            label:'Value',      width:'30%' }
    // actions автоматически добавятся из onEdit/onDelete
  ];
  const fields = [
    { value:'certificate_name', label:'Certificate' },
    { value:'field_name',       label:'Field' }
  ];

  return (
    <Box className="certificate-fields-container">
      <h1>Certificate Fields</h1>

      <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
        <UniversalSearch fields={fields} onSearch={handleSearch} />
        <Button variant="contained" onClick={()=>{
          setCurrent({ id:null, certificate_id:'', field_name:'', value:'' });
          setOpenAdd(true);
        }}>
          New Field
        </Button>
      </Box>

      <UniversalTable
        columns={columns}
        data={rows}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={p=>setPage(p)}
        onEdit={row=>{
          setCurrent({
            id: row.id,
            certificate_id: row.certificate_id,
            field_name: row.field_name,
            value: row.value
          });
          setOpenEdit(true);
        }}
        onDelete={handleDelete}
      />

      {/* Create */}
      <Dialog open={openAdd} onClose={()=>setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Field</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Certificate</InputLabel>
            <Select
              value={current.certificate_id}
              label="Certificate"
              onChange={e=>setCurrent(c=>({...c,certificate_id:e.target.value}))}
            >
              {certs.map(c=>(
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Field"
            fullWidth margin="dense"
            value={current.field_name}
            onChange={e=>setCurrent(c=>({...c,field_name:e.target.value}))}
          />
          <TextField
            label="Value"
            fullWidth margin="dense"
            value={current.value}
            onChange={e=>setCurrent(c=>({...c,value:e.target.value}))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={
            !current.certificate_id||!current.field_name
          }>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit */}
      <Dialog open={openEdit} onClose={()=>setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Field</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Certificate</InputLabel>
            <Select
              value={current.certificate_id}
              label="Certificate"
              onChange={e=>setCurrent(c=>({...c,certificate_id:e.target.value}))}
            >
              {certs.map(c=>(
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Field"
            fullWidth margin="dense"
            value={current.field_name}
            onChange={e=>setCurrent(c=>({...c,field_name:e.target.value}))}
          />
          <TextField
            label="Value"
            fullWidth margin="dense"
            value={current.value}
            onChange={e=>setCurrent(c=>({...c,value:e.target.value}))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={
            !current.certificate_id||!current.field_name
          }>Save</Button>
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
