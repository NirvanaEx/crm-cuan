// src/pages/car/CarCategories.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import UniversalTable   from '../../components/UniversalTable';
import UniversalSearch  from '../../components/UniversalSearch';
import api              from '../../services/api';
import { AuthContext }  from '../../context/AuthContext';
import '../../css/car/CarCategories.css';

export default function CarCategories() {
  const { permissions } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useState({
    text: '', field: 'name', dateFrom: '', dateTo: ''
  });
  const [openAdd,  setOpenAdd]  = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newCat,   setNewCat]   = useState({ name: '' });
  const [editCat,  setEditCat]  = useState({ id: null, name: '' });
  const [snackbar, setSnackbar]= useState({
    open: false, message: '', severity: 'success'
  });

  // Load categories
  const fetchCats = async () => {
    try {
      const res = await api.get('/car-categories');
      setCategories(res.data);
    } catch (e) {
      console.error('Failed to load categories', e);
      showSnackbar('Ошибка загрузки категорий', 'error');
    }
  };

  useEffect(() => { fetchCats(); }, []);

  const showSnackbar = (msg, sev='success') =>
    setSnackbar({ open: true, message: msg, severity: sev });
  const closeSnackbar = () =>
    setSnackbar(s => ({ ...s, open: false }));

  // Create new category
  const handleAdd = async () => {
    if (!newCat.name.trim()) {
      showSnackbar('Название обязательно', 'error');
      return;
    }
    try {
      await api.post('/car-categories', { name: newCat.name });
      showSnackbar('Категория добавлена');
      fetchCats();
      setOpenAdd(false);
      setNewCat({ name: '' });
    } catch (e) {
      console.error('Error creating category', e);
      showSnackbar('Ошибка создания', 'error');
    }
  };

  // Update existing category
  const handleEdit = async () => {
    if (!editCat.name.trim()) {
      showSnackbar('Название обязательно', 'error');
      return;
    }
    try {
      await api.put(`/car-categories/${editCat.id}`, { name: editCat.name });
      showSnackbar('Категория обновлена');
      fetchCats();
      setOpenEdit(false);
    } catch (e) {
      console.error('Error updating category', e);
      showSnackbar('Ошибка обновления', 'error');
    }
  };

  // Soft-delete category
  const handleDelete = async row => {
    if (!window.confirm(`Удалить категорию «${row.name}»?`)) return;
    try {
      await api.delete(`/car-categories/${row.id}`);
      showSnackbar('Категория удалена');
      fetchCats();
    } catch (e) {
      console.error('Error deleting category', e);
      showSnackbar('Ошибка удаления', 'error');
    }
  };

  // Filtering
  const filtered = categories.filter(item => {
    let okText = true, okDate = true;
    if (searchParams.text) {
      okText = item[searchParams.field]
        .toString().toLowerCase()
        .includes(searchParams.text.toLowerCase());
    }
    if (searchParams.dateFrom || searchParams.dateTo) {
      const d = new Date(item.date_creation);
      if (searchParams.dateFrom) okDate = okDate && d >= new Date(searchParams.dateFrom);
      if (searchParams.dateTo)   okDate = okDate && d <= new Date(searchParams.dateTo);
    }
    return okText && okDate;
  });

  const columns = [
    {
      key: 'actions', label: '', width: '5%',
      render: (_, row) => (
        <div style={{ display:'flex', alignItems:'center' }}>
          <AiOutlineEdit
            size={20} style={{ cursor:'pointer', marginRight:5 }}
            onClick={e => {
              e.stopPropagation();
              setEditCat({ id: row.id, name: row.name });
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
    { key:'id',            label:'ID',       width:'5%' },
    { key:'name',          label:'Name',     width:'60%' },
    { key:'date_creation', label:'Created',  width:'30%' }
  ];

  const searchFields = [
    { value:'name',         label:'Name' },
    { value:'date_creation',label:'Created' }
  ];

  return (
    <div className="car-categories-container">
      <h1>Car Categories</h1>

      <div className="actions-row">
        <UniversalSearch fields={searchFields} onSearch={setSearchParams} />
        <Button variant="contained" onClick={()=>setOpenAdd(true)}>
          Add Category
        </Button>
      </div>

      <UniversalTable columns={columns} data={filtered} itemsPerPage={5} />

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={()=>setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus margin="dense" label="Name"
            fullWidth value={newCat.name}
            onChange={e=>setNewCat({ name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={()=>setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus margin="dense" label="Name"
            fullWidth value={editCat.name}
            onChange={e=>setEditCat({ ...editCat, name: e.target.value })}
          />
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
