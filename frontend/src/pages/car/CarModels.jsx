// src/pages/car/CarModels.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import UniversalTable from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import '../../css/car/CarModels.css';

export default function CarModels() {
  const { user } = useContext(AuthContext);

  // state for categories and table data
  const [categories, setCategories] = useState([]);
  const [models, setModels]         = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  // pagination state
  const [page, setPage]       = useState(1);
  const itemsPerPage          = 10;

  // search & filter state
  const [searchText, setSearchText]   = useState('');
  const [searchField, setSearchField] = useState('model');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');

  // dialog state
  const [openAdd, setOpenAdd]     = useState(false);
  const [openEdit, setOpenEdit]   = useState(false);

  // form state for add/edit
  const [newItem, setNewItem] = useState({
    car_category_id: '',
    model: '',
    number: ''
  });
  const [editItem, setEditItem] = useState({
    id: null,
    car_category_id: '',
    model: '',
    number: ''
  });

  // snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // load categories once
  useEffect(() => {
    api.get('/car-categories')
      .then(res => {
        const cats = Array.isArray(res.data) ? res.data : [];
        setCategories(cats);
      })
      .catch(() => {
        setSnackbar({ open: true, message: 'Failed to load categories', severity: 'error' });
      });
  }, []);

  // fetch models page with filters
  const fetchModels = useCallback(async () => {
    try {
      const res = await api.get('/cars', {
        params: {
          page,
          limit: itemsPerPage,
          search: searchText,
          searchField,
          dateFrom,
          dateTo
        }
      });
      const rows = res.data.rows || [];
      setTotalItems(res.data.total || 0);
      setModels(rows.map((item, idx) => ({
        no: (page - 1) * itemsPerPage + idx + 1,
        ...item
      })));
    } catch {
      setSnackbar({ open: true, message: 'Failed to load models', severity: 'error' });
    }
  }, [page, searchText, searchField, dateFrom, dateTo]);

  // initial & reactive data load
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const showSnackbar = (msg, sev = 'success') => {
    setSnackbar({ open: true, message: msg, severity: sev });
  };
  const closeSnackbar = () => {
    setSnackbar(s => ({ ...s, open: false }));
  };

  // create new model
  const handleCreate = async () => {
    const { car_category_id, model, number } = newItem;
    if (!car_category_id || !model.trim() || !number.trim()) {
      return showSnackbar('All fields are required', 'error');
    }
    try {
      await api.post('/cars', newItem);
      showSnackbar('Model added');
      setOpenAdd(false);
      setNewItem({ car_category_id: '', model: '', number: '' });
      setPage(1);
      fetchModels();
    } catch {
      showSnackbar('Failed to add model', 'error');
    }
  };

  // update existing model
  const handleUpdate = async () => {
    const { id, car_category_id, model, number } = editItem;
    try {
      await api.put(`/cars/${id}`, { car_category_id, model, number });
      showSnackbar('Model updated');
      setOpenEdit(false);
      fetchModels();
    } catch {
      showSnackbar('Failed to update model', 'error');
    }
  };

  // delete model
  const handleDelete = async row => {
    if (!window.confirm(`Delete model "${row.model}"?`)) return;
    try {
      await api.delete(`/cars/${row.id}`);
      showSnackbar('Model deleted');
      // adjust page if last item removed
      if (models.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchModels();
      }
    } catch {
      showSnackbar('Failed to delete model', 'error');
    }
  };

  // stable callback for search component
  const handleSearch = useCallback(({ text, field, dateFrom: df, dateTo: dt }) => {
    setSearchText(text);
    setSearchField(field);
    setDateFrom(df);
    setDateTo(dt);
    setPage(1);
  }, []);

  // table column definitions
  const columns = [
    { key: 'no',            label: '№',         width: '5%'  },
    { key: 'category_name', label: 'Category',  width: '20%' },
    { key: 'model',         label: 'Model',     width: '25%' },
    { key: 'number',        label: 'Number',    width: '20%' },
    {
      key: 'date_creation',
      label: 'Created',
      width: '30%',
      render: v => new Date(v).toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    }
  ];

  const searchFields = [
    { value: 'model',  label: 'Model'  },
    { value: 'number', label: 'Number' }
  ];

  return (
    <div className="car-models-container">
      <h1>Car Models</h1>

      <UniversalSearch
        fields={searchFields}
        onSearch={handleSearch}
      />

      {/* Add button below search */}
      <Box mt={2} mb={2}>
        <Button variant="contained" onClick={() => setOpenAdd(true)}>
          Add Model
        </Button>
      </Box>

      {/* data table with pagination */}
      <UniversalTable
        columns={columns}
        data={models}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        onEdit={row => { setEditItem(row); setOpenEdit(true); }}
        onDelete={handleDelete}
      />

      {/* Add Model Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Car Model</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={newItem.car_category_id}
              onChange={e => setNewItem({ ...newItem, car_category_id: e.target.value })}
            >
              {categories.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense" label="Model" fullWidth
            value={newItem.model}
            onChange={e => setNewItem({ ...newItem, model: e.target.value })}
          />
          <TextField
            margin="dense" label="Number" fullWidth
            value={newItem.number}
            onChange={e => setNewItem({ ...newItem, number: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Model Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Car Model</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={editItem.car_category_id}
              onChange={e => setEditItem({ ...editItem, car_category_id: e.target.value })}
            >
              {categories.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense" label="Model" fullWidth
            value={editItem.model}
            onChange={e => setEditItem({ ...editItem, model: e.target.value })}
          />
          <TextField
            margin="dense" label="Number" fullWidth
            value={editItem.number}
            onChange={e => setEditItem({ ...editItem, number: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
