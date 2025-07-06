// src/pages/hotel/HotelBookings.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Tabs, Tab, Snackbar, Alert
} from '@mui/material';
import { AiOutlineEdit } from 'react-icons/ai';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import '../../css/hotel/HotelBookings.css';

export default function HotelBookings() {
  const { user } = useContext(AuthContext);

  // Tabs и статусы
  const [tab, setTab]         = useState(0);
  const statusMap            = ['pending','active','history'];

  // Таблица + пагинация
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const itemsPerPage          = 10;

  // Поиск
  const [filters, setFilters] = useState({
    text:'', field:'phone', dateFrom:'', dateTo:''
  });
  const prevFilters           = useRef(filters);

  // Диалоги
  const [openAdd, setOpenAdd]             = useState(false);
  const [openEdit, setOpenEdit]           = useState(false);
  const [editBooking, setEditBooking]     = useState({ id:null, status:'' });

  // Новая бронь
  const [newB, setNewB]                   = useState({
    room_id:'', phone:'', purpose:'', date_start:'', date_end:''
  });
  const [rooms, setRooms]                 = useState([]);

  // Снекбар
  const [snackbar, setSnackbar]           = useState({ open:false, message:'', severity:'success' });
  const show = (msg, sev='success') => setSnackbar({ open:true, message:msg, severity:sev });
  const close = () => setSnackbar(s => ({ ...s, open:false }));

  // 1) Наш fetchBookings вынесён сюда
  const fetchBookings = async () => {
    try {
      const status = statusMap[tab];
      const res = await api.get('/hotel/bookings', {
        params:{ page, limit: itemsPerPage, status,
                 search: filters.text,
                 searchField: filters.field,
                 dateFrom: filters.dateFrom,
                 dateTo: filters.dateTo }
      });
      setTotal(res.data.total);
      setRows(res.data.rows.map((b,i)=>({
        no: (page-1)*itemsPerPage + i + 1,
        ...b
      })));
    } catch {
      show('Error loading bookings','error');
    }
  };

  // 2) Используем его в useEffect
  useEffect(() => {
    fetchBookings();
  }, [tab, page, filters]);

  // Подгружаем комнаты один раз
  useEffect(() => {
    api.get('/hotel/rooms',{ params:{ page:1, limit:1000 } })
      .then(res => setRooms(res.data.rows))
      .catch(()=>show('Error loading rooms','error'));
  }, []);

  // Handler поиска
  const handleSearch = params => {
    if (JSON.stringify(params) === JSON.stringify(prevFilters.current)) return;
    prevFilters.current = params;
    setFilters(params);
    setPage(1);
  };

  // Создать бронь и перезагрузить таблицу
  const handleAdd = async () => {
    try {
      await api.post('/hotel/bookings',{ ...newB, user_id:user.id });
      show('Booking created');
      setOpenAdd(false);
      setNewB({ room_id:'',phone:'',purpose:'',date_start:'',date_end:'' });
      setPage(1);
      await fetchBookings();    // <<< тут перезагрузка
    } catch {
      show('Error creating booking','error');
    }
  };

  // Открыть диалог редактирования статуса
  const openStatusDialog = b => {
    setEditBooking({ id:b.id, status:b.status });
    setOpenEdit(true);
  };

  // Сохранить новый статус и перезагрузить таблицу
  const handleEdit = async () => {
    try {
      await api.put(`/hotel/bookings/${editBooking.id}/status`,{ status:editBooking.status });
      show('Status updated');
      setOpenEdit(false);
      await fetchBookings();    // <<< тут перезагрузка
    } catch {
      show('Error updating status','error');
    }
  };

  // Колонки таблицы
  const columns = [
    { key:'no',        label:'№',      width:'5%' },
    { key:'room_num',  label:'Room #', width:'15%' },
    { key:'phone',     label:'Phone',  width:'15%' },
    { key:'purpose',   label:'Purpose',width:'20%' },
    {
      key:'date_start',
      label:'Start',
      width:'15%',
      render:v=>format(new Date(v),'dd.MM.yyyy HH:mm')
    },
    {
      key:'date_end',
      label:'End',
      width:'15%',
      render:v=>format(new Date(v),'dd.MM.yyyy HH:mm')
    },
    {
      key:'status',
      label:'Status',
      width:'10%',
      render:(_,r)=>
        tab===0
          ? <AiOutlineEdit
              style={{ cursor:'pointer' }}
              onClick={()=>openStatusDialog(r)}
            />
          : r.status
    }
  ];

  const searchFields = [
    { value:'phone',   label:'Phone' },
    { value:'purpose', label:'Purpose' },
    { value:'room_num',label:'Room #' },
    { value:'status',  label:'Status' }
  ];

  return (
    <Box className="hotel-bookings-container">
      <h1>Hotel Bookings</h1>

      <Tabs value={tab} onChange={(_,v)=>{ setTab(v); setPage(1); }}>
        <Tab label="Pending" />
        <Tab label="Active" />
        <Tab label="History" />
      </Tabs>

      <Box sx={{ mt:2, mb:2, display:'flex', flexWrap:'wrap' }}>
        <Box sx={{ flex:'1 1 300px' }}>
          <UniversalSearch fields={searchFields} onSearch={handleSearch} />
        </Box>
        {tab===0 && (
          <Box sx={{ width:'100%', mt:1 }}>
            <Button variant="contained" onClick={()=>setOpenAdd(true)}>
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
      />

      {/** Диалог создания **/}
      <Dialog open={openAdd} onClose={()=>setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Booking</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Room</InputLabel>
            <Select
              value={newB.room_id}
              label="Room"
              onChange={e=>setNewB(b=>({...b,room_id:e.target.value}))}
            >
              {rooms.map(r=>(
                <MenuItem key={r.id} value={r.id}>{r.num}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Phone" fullWidth margin="dense"
            value={newB.phone}
            onChange={e=>setNewB(b=>({...b,phone:e.target.value}))}
          />
          <TextField label="Purpose" fullWidth margin="dense"
            value={newB.purpose}
            onChange={e=>setNewB(b=>({...b,purpose:e.target.value}))}
          />
          <TextField label="Start" type="datetime-local" fullWidth margin="dense"
            InputLabelProps={{ shrink:true }}
            value={newB.date_start}
            onChange={e=>setNewB(b=>({...b,date_start:e.target.value}))}
          />
          <TextField label="End" type="datetime-local" fullWidth margin="dense"
            InputLabelProps={{ shrink:true }}
            value={newB.date_end}
            onChange={e=>setNewB(b=>({...b,date_end:e.target.value}))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenAdd(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!newB.room_id||!newB.phone||!newB.date_start||!newB.date_end}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/** Диалог редактирования статуса **/}
      <Dialog open={openEdit} onClose={()=>setOpenEdit(false)} fullWidth maxWidth="xs">
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={editBooking.status}
              label="Status"
              onChange={e=>setEditBooking(b=>({...b,status:e.target.value}))}
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

      {/** Snackbar **/}
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
