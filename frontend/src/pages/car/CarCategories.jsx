// src/pages/car/CarCategories.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import '../../css/car/CarCategories.css';

export default function CarCategories() {
  const { permissions } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useState({ text: '' });
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newCat, setNewCat] = useState({ name: '' });
  const [editCat, setEditCat] = useState({ id: null, name: '' });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load categories once
  useEffect(() => {
    api.get('/car-categories')
      .then(res => setCategories(res.data))
      .catch(() => show('Ошибка загрузки категорий', 'error'));
  }, []);

  // Helper to refetch
  const reload = () => {
    api.get('/car-categories')
      .then(res => setCategories(res.data))
      .catch(() => show('Ошибка загрузки категорий', 'error'));
  };

  // Snackbar helpers
  const show = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  const close = () => setSnackbar(s => ({ ...s, open: false }));

  // Memoized search handler to avoid infinite loops
  const handleSearch = useCallback(
    ({ text }) => {
      setSearchParams({ text: text || '' });
    },
    []
  );

  // CRUD handlers
  const handleAdd = () => {
    if (!newCat.name.trim()) {
      return show('Название обязательно', 'error');
    }
    api.post('/car-categories', { name: newCat.name })
      .then(() => {
        show('Категория добавлена');
        setOpenAdd(false);
        setNewCat({ name: '' });
        reload();
      })
      .catch(() => show('Ошибка создания', 'error'));
  };

  const handleEdit = () => {
    if (!editCat.name.trim()) {
      return show('Название обязательно', 'error');
    }
    api.put(`/car-categories/${editCat.id}`, { name: editCat.name })
      .then(() => {
        show('Категория обновлена');
        setOpenEdit(false);
        reload();
      })
      .catch(() => show('Ошибка обновления', 'error'));
  };

  const handleDelete = row => {
    if (!window.confirm(`Удалить категорию «${row.name}»?`)) return;
    api.delete(`/car-categories/${row.id}`)
      .then(() => {
        show('Категория удалена');
        reload();
      })
      .catch(() => show('Ошибка удаления', 'error'));
  };

  // Filtered list based on search text
  const filtered = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchParams.text.toLowerCase())
  );

  // Table columns
  const columns = [
    { key: 'no', label: '№', width: '5%' },
    { key: 'name', label: 'Name', width: '60%' },
    {
      key: 'date_creation',
      label: 'Created',
      width: '35%',
      render: v => format(new Date(v), 'dd.MM.yyyy HH:mm')
    }
  ];

  // Search fields
  const searchFields = [{ value: 'name', label: 'Name' }];

  return (
    <div className="car-categories-container">
      <h1>Car Categories</h1>

      {/* Search only by Name */}
      <UniversalSearch fields={searchFields} onSearch={handleSearch} />

      {/* Add button under search */}
      <Box mt={2} mb={2}>
        <Button variant="contained" onClick={() => setOpenAdd(true)}>
          Add Category
        </Button>
      </Box>

      {/* Table with built-in pagination */}
      <UniversalTable
        columns={columns}
        data={filtered.map((row, idx) => ({ no: idx + 1, ...row }))}
        itemsPerPage={10}
        onEdit={row => {
          setEditCat({ id: row.id, name: row.name });
          setOpenEdit(true);
        }}
        onDelete={handleDelete}
      />

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newCat.name}
            onChange={e => setNewCat({ name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={editCat.name}
            onChange={e => setEditCat(ec => ({ ...ec, name: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
    </div>
  );
}
