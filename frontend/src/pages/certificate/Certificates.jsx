// src/pages/certificate/Certificates.jsx
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
import '../../css/certificate/Certificates.css';

export default function Certificates() {
  // таблица и пагинация
  const [rows, setRows]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const itemsPerPage        = 10;

  // фильтры поиска
  const [filters, setFilters] = useState({
    text: '', field: 'name', dateFrom:'', dateTo:''
  });
  const prevFilters = useRef(filters);

  // диалоги создания/редактирования
  const [openAdd, setOpenAdd]   = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [current, setCurrent]   = useState({
    id: null, name:'', date_status:'active'
  });

  // snackbar
  const [snack, setSnack] = useState({ open:false, message:'', severity:'success' });
  const show = (m, s='success') => setSnack({ open:true, message:m, severity:s });
  const close = () => setSnack(s=>({ ...s, open:false }));

  // загрузка списка при изменении page или filters
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/certificate', {
          params: {
            page, limit: itemsPerPage,
            search: filters.text,
            searchField: filters.field,
            dateFrom: filters.dateFrom,
            dateTo:   filters.dateTo
          }
        });
        setTotal(res.data.total);
        setRows(res.data.rows.map((r,i) => ({
          no: (page - 1)*itemsPerPage + i + 1,
          ...r
        })));
      } catch {
        show('Error loading certificates','error');
      }
    }
    fetchData();
  }, [page, filters]);

  // только при реальном изменении filters
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
      await api.post('/certificate', { name: current.name });
      show('Certificate created');
      setOpenAdd(false);
      setCurrent({ id:null, name:'', date_status:'active' });
      setFilters(f=>({ ...f })); // перезагрузить
    } catch {
      show('Error creating','error');
    }
  };

  // update
  const handleUpdate = async () => {
    try {
      await api.put(`/certificate/${current.id}`, {
        name: current.name,
        date_status: current.date_status
      });
      show('Certificate updated');
      setOpenEdit(false);
      setCurrent({ id:null, name:'', date_status:'active' });
      setFilters(f=>({ ...f }));
    } catch {
      show('Error updating','error');
    }
  };

  // delete
  const handleDelete = async row => {
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await api.delete(`/certificate/${row.id}`);
      show('Deleted');
      setFilters(f=>({ ...f }));
    } catch {
      show('Error deleting','error');
    }
  };

  const columns = [
    { key:'no',            label:'№',       width:'5%' },
    { key:'name',          label:'Name',    width:'40%' },
    {
      key:'date_creation',
      label:'Created',
      width:'30%',
      render: v => format(new Date(v),'dd.MM.yyyy HH:mm')
    },
    { key:'date_status',   label:'Status',  width:'15%' }
    // actions подтянутся из onEdit/onDelete
  ];

  const fields = [
    { value:'name',        label:'Name' },
    { value:'date_status', label:'Status' }
  ];

  return (
    <Box className="certificate-container">
      <h1>Certificates</h1>

      <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
        <UniversalSearch fields={fields} onSearch={handleSearch} />
        <Button variant="contained" onClick={() => {
          setCurrent({ id:null, name:'', date_status:'active' });
          setOpenAdd(true);
        }}>
          New Certificate
        </Button>
      </Box>

      <UniversalTable
        columns={columns}
        data={rows}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        onEdit={row => { setCurrent(row); setOpenEdit(true); }}
        onDelete={handleDelete}
      />

      {/* Dialog Add */}
      <Dialog open={openAdd} onClose={()=>setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Certificate</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth margin="dense"
            value={current.name}
            onChange={e=>setCurrent(c=>({...c,name:e.target.value}))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenAdd(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!current.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Edit */}
      <Dialog open={openEdit} onClose={()=>setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Certificate</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth margin="dense"
            value={current.name}
            onChange={e=>setCurrent(c=>({...c,name:e.target.value}))}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={current.date_status}
              label="Status"
              onChange={e=>setCurrent(c=>({...c,date_status:e.target.value}))}
            >
              {['active','deleted'].map(s=>(
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenEdit(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={!current.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={close}
        anchorOrigin={{ vertical:'top', horizontal:'right' }}
      >
        <Alert onClose={close} severity={snack.severity}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
