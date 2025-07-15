import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem,
  Tabs, Tab, Snackbar, Alert
} from '@mui/material';
import { AiOutlineEdit } from 'react-icons/ai';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import '../../css/certificate/CertificateRequests.css';

export default function CertificateRequests() {
  const { user } = useContext(AuthContext);

  const [tab, setTab] = useState(0);
  const statusMap = ['pending','history'];

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({ text:'', field:'surname', dateFrom:'', dateTo:'' });
  const prevFilters = useRef(filters);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [newReq, setNewReq] = useState({ certificate_id:'' });
  const [editReq, setEditReq] = useState({ id:null, status:'' });

  const [certificates, setCertificates] = useState([]);

  const [snackbar, setSnackbar] = useState({ open:false, message:'', severity:'success' });
  const show = (m,s='success') => setSnackbar({open:true,message:m,severity:s});
  const close = () => setSnackbar(s=>({...s,open:false}));

  // load requests
  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get('/certificate/requests', {
          params: {
            page,
            limit: itemsPerPage,
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
    fetch();
  }, [tab, page, filters]);

  // load certificates for dropdown
  useEffect(() => {
    api.get('/certificate', { params:{ page:1, limit:1000 } })
      .then(res=>setCertificates(res.data.rows))
      .catch(()=>show('Error loading certificates','error'));
  }, []);

  const handleSearch = params => {
    if (JSON.stringify(params)!==JSON.stringify(prevFilters.current)) {
      prevFilters.current = params;
      setFilters(params);
      setPage(1);
    }
  };

  const handleAdd = () => {
    api.post('/certificate/requests', { certificate_id:newReq.certificate_id })
      .then(()=>{ show('Request created'); setOpenAdd(false); setFilters(f=>({...f})); })
      .catch(()=>show('Error creating request','error'));
  };

  const openStatusDialog = row => {
    setEditReq({ id: row.id, status: row.status });
    setOpenEdit(true);
  };

  const handleUpdate = () => {
    api.put(`/certificate/requests/${editReq.id}`, { status: editReq.status })
      .then(()=>{ show('Status updated'); setOpenEdit(false); setFilters(f=>({...f})); })
      .catch(()=>show('Error updating status','error'));
  };

  const columns = [
    { key:'no',         label:'№',    width:'5%' },
    {
      key:'surname',    label:'User', width:'25%',
      render: (_,r)=>`${r.surname} ${r.name} ${r.patronym} (${r.tab_num})`
    },
    { key:'certificate_name', label:'Certificate', width:'25%' },
    {
      key:'date_creation', label:'Date', width:'20%',
      render: v=>new Date(v).toLocaleString()
    },
    {
      key:'status', label:'Status', width:'15%',
      render: (_,r)=> tab===1 ? r.status : (
        <AiOutlineEdit style={{cursor:'pointer'}} onClick={()=>openStatusDialog(r)} />
      )
    }
  ];

  const searchFields = [
    { value:'surname', label:'User' },
    { value:'certificate_name', label:'Certificate' }
  ];

  return (
    <Box className="certificate-requests-container">
      <h1>Certificate Requests</h1>

      <Tabs value={tab} onChange={(_,v)=>{ setTab(v); setPage(1); }}>
        <Tab label="Pending" />
        <Tab label="History" />
      </Tabs>

      <Box sx={{display:'flex', justifyContent:'space-between', mt:2, mb:2}}>
        <UniversalSearch fields={searchFields} onSearch={handleSearch} />
        {tab===0 && (
          <Button variant="contained" onClick={()=>{ setNewReq({certificate_id:''}); setOpenAdd(true);} }>
            New Request
          </Button>
        )}
      </Box>

      <UniversalTable
        columns={columns}
        data={rows}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={p=>setPage(p)}
      />

      {/* Add */}
      <Dialog open={openAdd} onClose={()=>setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Request</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Certificate</InputLabel>
            <Select
              value={newReq.certificate_id}
              onChange={e=>setNewReq(r=>({...r,certificate_id:e.target.value}))}
              label="Certificate"
            >
              {certificates.map(c=>(
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={!newReq.certificate_id}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Status */}
      <Dialog open={openEdit} onClose={()=>setOpenEdit(false)} fullWidth maxWidth="xs">
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={editReq.status}
              onChange={e=>setEditReq(r=>({...r,status:e.target.value}))}
              label="Status"
            >
              {['approved','rejected','canceled'].map(s=>(
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={close}
                anchorOrigin={{vertical:'top',horizontal:'right'}}>
        <Alert onClose={close} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
