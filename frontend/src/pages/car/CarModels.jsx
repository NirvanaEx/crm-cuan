// src/pages/car/CarModels.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import UniversalTable  from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api             from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import '../../css/car/CarModels.css';

export default function CarModels() {
  const { user } = useContext(AuthContext);
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useState({
    text: '', field: 'model', dateFrom: '', dateTo: ''
  });
  const [openAdd, setOpenAdd]   = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newItem, setNewItem]   = useState({
    car_category_id: '', model: '', number: ''
  });
  const [editItem, setEditItem] = useState({
    id: null, car_category_id: '', model: '', number: '', data_status: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false, message: '', severity: 'success'
  });

  // Load models and categories
  const fetchData = async () => {
    try {
      const [mRes, cRes] = await Promise.all([
        api.get('/cars'),
        api.get('/car-categories')
      ]);
      setModels(mRes.data);
      setCategories(cRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
      showSnackbar('Ошибка загрузки данных', 'error');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showSnackbar = (msg, sev='success') =>
    setSnackbar({ open: true, message: msg, severity: sev });
  const closeSnackbar = () =>
    setSnackbar(s => ({ ...s, open: false }));

  // Create new car model
  const handleAdd = async () => {
    const { car_category_id, model, number } = newItem;
    if (!car_category_id || !model.trim() || !number.trim()) {
      showSnackbar('Все поля обязательны', 'error');
      return;
    }
    try {
      await api.post('/cars', { ...newItem });
      showSnackbar('Модель добавлена');
      fetchData();
      setOpenAdd(false);
      setNewItem({ car_category_id:'', model:'', number:'' });
    } catch (err) {
      console.error('Error creating model', err);
      showSnackbar('Ошибка создания', 'error');
    }
  };

  // Update existing car model
  const handleEdit = async () => {
    const { id, car_category_id, model, number, data_status } = editItem;
    if (!car_category_id || !model.trim() || !number.trim()) {
      showSnackbar('Все поля обязательны', 'error');
      return;
    }
    try {
      await api.put(`/cars/${id}`, { car_category_id, model, number, data_status });
      showSnackbar('Модель обновлена');
      fetchData();
      setOpenEdit(false);
    } catch (err) {
      console.error('Error updating model', err);
      showSnackbar('Ошибка обновления', 'error');
    }
  };

  // Delete (soft) car model
  const handleDelete = async (row) => {
    if (!window.confirm(`Удалить модель "${row.model}"?`)) return;
    try {
      await api.delete(`/cars/${row.id}`);
      showSnackbar('Модель удалена');
      fetchData();
    } catch (err) {
      console.error('Error deleting model', err);
      showSnackbar('Ошибка удаления', 'error');
    }
  };

  // Apply search filters
  const filtered = models.filter(item => {
    let okText = true, okDate = true;
    if (searchParams.text) {
      okText = String(item[searchParams.field] || '')
        .toLowerCase()
        .includes(searchParams.text.toLowerCase());
    }
    // no date filter on models
    return okText && okDate;
  });

  const columns = [
    {
      key: 'actions', label: '', width: '8%',
      render: (_, row) => (
        <div style={{ display:'flex', alignItems:'center' }}>
          <AiOutlineEdit
            size={20} style={{ cursor:'pointer', marginRight:5 }}
            onClick={e => {
              e.stopPropagation();
              setEditItem({
                id: row.id,
                car_category_id: row.car_category_id,
                model: row.model,
                number: row.number,
                data_status: row.data_status
              });
              setOpenEdit(true);
            }}
          />
          <AiOutlineDelete
            size={20} style={{ cursor:'pointer' }}
            onClick={e => { e.stopPropagation(); handleDelete(row); }}
          />
        </div>
      )
    },
    { key:'id',              label:'ID',             width:'5%' },
    { key:'car_category_id', label:'Category ID',    width:'15%' },
    { key:'model',           label:'Model',          width:'25%' },
    { key:'number',          label:'Number',         width:'20%' },
    { key:'data_status',     label:'Status',         width:'15%' }
  ];

  const searchFields = [
    { value:'model', label:'Model' },
    { value:'number',label:'Number' }
  ];

  return (
    <div className="car-models-container">
      <h1>Car Models</h1>

      <div className="actions-row">
        <UniversalSearch fields={searchFields} onSearch={setSearchParams} />
        <Button variant="contained" onClick={()=>setOpenAdd(true)}>
          Add Model
        </Button>
      </div>

      <UniversalTable columns={columns} data={filtered} itemsPerPage={5} />

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={()=>setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Car Model</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={newItem.car_category_id}
              onChange={e=>setNewItem({...newItem, car_category_id: e.target.value})}
            >
              {categories.map(c=>(
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense" label="Model"
            fullWidth value={newItem.model}
            onChange={e=>setNewItem({...newItem, model: e.target.value})}
          />
          <TextField
            margin="dense" label="Number"
            fullWidth value={newItem.number}
            onChange={e=>setNewItem({...newItem, number: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={()=>setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Car Model</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={editItem.car_category_id}
              onChange={e=>setEditItem({...editItem, car_category_id: e.target.value})}
            >
              {categories.map(c=>(
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense" label="Model"
            fullWidth value={editItem.model}
            onChange={e=>setEditItem({...editItem, model: e.target.value})}
          />
          <TextField
            margin="dense" label="Number"
            fullWidth value={editItem.number}
            onChange={e=>setEditItem({...editItem, number: e.target.value})}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={editItem.data_status}
              onChange={e=>setEditItem({...editItem, data_status: e.target.value})}
            >
              <MenuItem value="active">active</MenuItem>
              <MenuItem value="deleted">deleted</MenuItem>
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
        onClose={closeSnackbar}
        anchorOrigin={{ vertical:'top', horizontal:'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
