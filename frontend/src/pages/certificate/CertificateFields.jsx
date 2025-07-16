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
  const [rows, setRows]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const itemsPerPage        = 10;

  const [filters, setFilters] = useState({
    text: '', field: 'field_name', dateFrom: '', dateTo: ''
  });
  const prevFilters = useRef(filters);

  // need list of certificates for dropdown
  const [certs, setCerts] = useState([]);

  // dialogs
  const [openAdd, setOpenAdd]   = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [current, setCurrent]   = useState({
    id: null, certificate_id:'', field_name:'', field_type:'text', data_status:'active'
  });

  const [snackbar, setSnackbar] = useState({ open:false,message:'',severity:'success' });
  const show = (m,s='success') => setSnackbar({ open:true,message:m,severity:s });
  const close = ()=>setSnackbar(s=>({...s,open:false}));

  // load certificates once
  useEffect(() => {
    api.get('/certificate', { params:{ page:1, limit:1000 } })
      .then(res => setCerts(res.data.rows))
      .catch(()=>show('Error loading certificates','error'));
  }, []);

  // load fields
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/certificate/fields', {
          params:{
            page, limit:itemsPerPage,
            search:filters.text, searchField:filters.field,
            dateFrom:filters.dateFrom, dateTo:filters.dateTo
          }
        });
        setTotal(res.data.total);
        setRows(res.data.rows);
      } catch {
        show('Error loading fields','error');
      }
    }
    load();
  }, [page, filters]);

  const handleSearch = p => {
    if (JSON.stringify(p)!==JSON.stringify(prevFilters.current)) {
      prevFilters.current = p;
      setFilters(p);
      setPage(1);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/certificate/fields', {
        certificate_id: current.certificate_id,
        field_name: current.field_name,
        field_type: current.field_type
      });
      show('Field created');
      setOpenAdd(false);
      setFilters(f=>({...f}));
      setCurrent({ id:null, certificate_id:'', field_name:'', field_type:'text', data_status:'active' });
    } catch {
      show('Error creating','error');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/certificate/fields/${current.id}`, {
        certificate_id: current.certificate_id,
        field_name: current.field_name,
        field_type: current.field_type,
        data_status: current.data_status
      });
      show('Field updated');
      setOpenEdit(false);
      setFilters(f=>({...f}));
    } catch {
      show('Error updating','error');
    }
  };

  const handleDelete = async row => {
    if (!window.confirm('Delete this field?')) return;
    try {
      await api.delete(`/certificate/fields/${row.id}`);
      show('Deleted');
      setFilters(f=>({...f}));
    } catch {
      show('Error deleting','error');
    }
  };

  const columns = [
    { key:'no',             label:'№',        width:'5%' },
    { key:'certificate_name',label:'Certificate', width:'25%' },
    { key:'field_name',     label:'Field',    width:'25%' },
    { key:'field_type',     label:'Type',     width:'20%' },
    {
      key:'date_creation',  label:'Created',  width:'25%',
      render:v=>new Date(v).toLocaleString()
    }
  ];
  const searchFields = [
    { value:'certificate_name', label:'Certificate' },
    { value:'field_name',       label:'Field' }
  ];

  return (
    <Box className="certificate-fields-container">
      <h1>Certificate Fields</h1>
      <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
        <UniversalSearch fields={searchFields} onSearch={handleSearch} />
        <Button variant="contained" onClick={()=>{
          setCurrent({ id:null, certificate_id:'', field_name:'', field_type:'text', data_status:'active' });
          setOpenAdd(true);
        }}>New Field</Button>
      </Box>

      <UniversalTable
        columns={columns}
        data={rows}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        onEdit={row => {
          setCurrent({
            id: row.id,
            certificate_id: row.certificate_id,
            field_name: row.field_name,
            field_type: row.field_type,
            data_status: row.data_status
          });
          setOpenEdit(true);
        }}
        onDelete={handleDelete}
      />

      {/* Add */}
      <Dialog open={openAdd} onClose={()=>setOpenAdd(false)} fullWidth>
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
            label="Field Name" fullWidth margin="dense"
            value={current.field_name}
            onChange={e=>setCurrent(c=>({...c,field_name:e.target.value}))}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={current.field_type}
              label="Type"
              onChange={e=>setCurrent(c=>({...c,field_type:e.target.value}))}
            >
              <MenuItem value="text">text</MenuItem>
              <MenuItem value="number">number</MenuItem>
              <MenuItem value="date">date</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}
                  disabled={!current.certificate_id||!current.field_name}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit */}
      <Dialog open={openEdit} onClose={()=>setOpenEdit(false)} fullWidth>
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
            label="Field Name" fullWidth margin="dense"
            value={current.field_name}
            onChange={e=>setCurrent(c=>({...c,field_name:e.target.value}))}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={current.field_type}
              label="Type"
              onChange={e=>setCurrent(c=>({...c,field_type:e.target.value}))}
            >
              <MenuItem value="text">text</MenuItem>
              <MenuItem value="number">number</MenuItem>
              <MenuItem value="date">date</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={current.data_status}
              label="Status"
              onChange={e=>setCurrent(c=>({...c,data_status:e.target.value}))}
            >
              <MenuItem value="active">active</MenuItem>
              <MenuItem value="deleted">deleted</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}
                  disabled={!current.certificate_id||!current.field_name}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
