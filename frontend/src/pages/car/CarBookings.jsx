// src/pages/car/CarBookings.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Tabs, Tab, Snackbar, Alert, Pagination
} from '@mui/material';
import { AiOutlineEdit } from 'react-icons/ai';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import '../../css/car/CarBookings.css';

export default function CarBookings() {
  const { user } = useContext(AuthContext);

  // UI state
  const [tab, setTab]             = useState(0);
  const [bookings, setBookings]   = useState([]);
  const [totalPages, setTotal]    = useState(1);
  const [page, setPage]           = useState(1);
  const limit = 10;

  // search params
  const [searchParams, setSearch] = useState({
    text: '', field: 'phone_number', dateFrom: '', dateTo: ''
  });

  // dialogs
  const [openAdd, setOpenAdd]     = useState(false);
  const [openEdit, setOpenEdit]   = useState(false);

  // forms
  const [newB, setNewB] = useState({
    car_id: '', phone_number: '', purpose: '', route: '',
    date_start: '', date_expired: ''
  });
  const [editB, setEditB] = useState({ id: null, status: '' });

  // cars list
  const [cars, setCars] = useState([]);

  // snackbar
  const [snackbar, setSnackbar] = useState({ open:false, message:'', severity:'success' });

  const endpoints = ['/pending','/active','/history'];

  // fetch bookings
  useEffect(() => {
    const { text, field, dateFrom, dateTo } = searchParams;
    api.get(`/car-bookings${endpoints[tab]}`, {
      params: { page, limit, search: text, searchField: field, dateFrom, dateTo }
    }).then(res => {
      const { rows, total } = res.data;
      setTotal(Math.ceil(total/limit));
      setBookings(rows.map((b,i)=>({
        no: (page-1)*limit + i+1,
        ...b,
        car: `${b.model} (${b.category_name}) #${b.number}`,
        user: `${b.surname} ${b.name} ${b.patronym}`
      })));
    }).catch(()=>show('Ошибка загрузки','error'));
  }, [tab,page,searchParams]);

  // fetch available cars when dialog opens
    useEffect(() => {
    if (!openAdd) return;

    // Если обе даты есть — фильтровать, иначе просто получить все активные
    const params = {};
    if (newB.date_start && newB.date_expired) {
        params.date_start = newB.date_start;
        params.date_expired = newB.date_expired;
    }

    api.get('/cars/available', { params })
        .then(res => setCars(res.data))
        .catch(()=>show('Ошибка списка авто','error'));
    }, [openAdd, newB.date_start, newB.date_expired]);

  const show = (msg,sev='success') => setSnackbar({ open:true, message:msg, severity:sev });
  const close = () => setSnackbar(s => ({...s, open:false}));

  const handleAdd = () => {
    api.post('/car-bookings', {...newB, user_id:user.id})
      .then(()=>{ show('Создано'); setOpenAdd(false); setPage(1); })
      .catch(()=>show('Ошибка','error'));
  };
  const handleEdit = () => {
    api.put(`/car-bookings/${editB.id}/status`, {status:editB.status})
      .then(()=>{ show('Обновлено'); setOpenEdit(false); })
      .catch(()=>show('Ошибка','error'));
  };

  const columns = [
    { key:'no', label:'№', width:'5%' },
    { key:'car', label:'Car', width:'15%' },
    { key:'user', label:'User', width:'15%' },
    { key:'phone_number', label:'Phone', width:'10%' },
    { key:'purpose', label:'Purpose', width:'10%' },
    { key:'route', label:'Route', width:'15%' },
    { key:'date_start', label:'Start', width:'10%',
      render: v=>format(new Date(v),'dd.MM.yyyy HH:mm')
    },
    { key:'date_expired', label:'End', width:'10%',
      render: v=>format(new Date(v),'dd.MM.yyyy HH:mm')
    },
    { key:'date_creation', label:'Created', width:'10%',
      render: v=>format(new Date(v),'dd.MM.yyyy HH:mm')
    },
    { key:'status', label:'Status', width:'10%',
      render: (_,r)=> tab===0
        ? <AiOutlineEdit style={{cursor:'pointer'}} onClick={()=>{setEditB({id:r.id,status:r.status});setOpenEdit(true)}}/>
        : r.status
    }
  ];

  const searchFields = [
    { value:'phone_number', label:'Phone' },
    { value:'purpose',      label:'Purpose' },
    { value:'route',        label:'Route' },
    { value:'car',          label:'Car' },
    { value:'user',         label:'User' },
    { value:'status',       label:'Status' }
  ];

  return (
    <Box className="car-book-container">
      <h1>Car Bookings</h1>
      <Tabs
        value={tab}
        onChange={(_,v)=>{setTab(v);setPage(1);}}
        textColor="inherit"
        indicatorColor="primary"
        sx={{
          '& .MuiTabs-indicator': { backgroundColor: 'var(--text-color)' }
        }}
      >
        <Tab label="Pending"/>
        <Tab label="Active"/>
        <Tab label="History"/>
      </Tabs>

      <Box sx={{ mt:2, mb:2, display:'flex', flexWrap:'wrap' }}>
        <Box sx={{ flex:'1 1 300px' }}>
          <UniversalSearch fields={searchFields} onSearch={setSearch}/>
        </Box>
        {tab===0 && (
          <Box sx={{ width:'100%', mt:1 }}>
            <Button variant="contained" onClick={()=>setOpenAdd(true)}>
              New Booking
            </Button>
          </Box>
        )}
      </Box>

      <UniversalTable columns={columns} data={bookings} />

      <Box sx={{ display:'flex', justifyContent:'center', mt:2 }}>
        <Pagination count={totalPages} page={page} onChange={(_,v)=>setPage(v)} color="primary"/>
      </Box>

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={()=>setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Booking</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Car</InputLabel>
            <Select
              value={newB.car_id}
              onChange={e=>setNewB({...newB,car_id:e.target.value})}
              label="Car"
            >
              {cars.map(c=>(
                <MenuItem key={c.id} value={c.id}>
                  {`${c.model} (${c.category_name}) #${c.number}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Phone" fullWidth margin="dense"
            value={newB.phone_number}
            onChange={e=>setNewB({...newB,phone_number:e.target.value})}
          />
          <TextField label="Purpose" fullWidth margin="dense"
            value={newB.purpose}
            onChange={e=>setNewB({...newB,purpose:e.target.value})}
          />
          <TextField label="Route" fullWidth margin="dense"
            value={newB.route}
            onChange={e=>setNewB({...newB,route:e.target.value})}
          />
          <TextField
            label="Start"
            type="datetime-local"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink:true }}
            value={newB.date_start}
            onChange={e=>setNewB({...newB,date_start:e.target.value})}
          />
          <TextField
            label="End"
            type="datetime-local"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink:true }}
            value={newB.date_expired}
            onChange={e=>setNewB({...newB,date_expired:e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={()=>setOpenEdit(false)} fullWidth maxWidth="xs">
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={editB.status}
              onChange={e=>setEditB({...editB,status:e.target.value})}
              label="Status"
            >
              {['pending','approved','canceled','rejected'].map(s=>(
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit}>Save</Button>
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
