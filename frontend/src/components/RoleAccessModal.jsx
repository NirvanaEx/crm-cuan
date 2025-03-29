import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  Snackbar,
  Alert
} from '@mui/material';
import api from '../services/api';

export default function RoleAccessModal({ open, role, onClose, onUpdate }) {
  const [accessList, setAccessList] = useState([]);
  const [roleAccessIds, setRoleAccessIds] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (open && role) {
      fetchAccessList();
      fetchRoleAccess();
    }
  }, [open, role]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const fetchAccessList = async () => {
    try {
      const response = await api.get('/access');
      setAccessList(response.data);
    } catch (error) {
      console.error('Ошибка при получении списка доступов:', error);
      showSnackbar('Ошибка при получении списка доступов', 'error');
    }
  };

  const fetchRoleAccess = async () => {
    try {
      const response = await api.get(`/role-access/${role.id}/access`);
      // Берём именно access_id, как указано в бэкенде
      const accessIds = response.data.map(item => item.access_id);
      setRoleAccessIds(accessIds);
    } catch (error) {
      console.error('Ошибка при получении доступа для роли:', error);
      showSnackbar('Ошибка при получении доступа для роли', 'error');
    }
  };

  const handleToggle = async (accessId) => {
    if (roleAccessIds.includes(accessId)) {
      // Удаление доступа
      try {
        await api.delete(`/role-access/${role.id}/access/${accessId}`);
        setRoleAccessIds(prev => prev.filter(id => id !== accessId));
        showSnackbar('Доступ удален', 'success');
      } catch (error) {
        console.error('Ошибка при удалении доступа:', error);
        showSnackbar('Ошибка при удалении доступа', 'error');
      }
    } else {
      // Добавление доступа
      try {
        await api.post(`/role-access/${role.id}/access`, { accessId });
        setRoleAccessIds(prev => [...prev, accessId]);
        showSnackbar('Доступ добавлен', 'success');
      } catch (error) {
        console.error('Ошибка при добавлении доступа:', error);
        showSnackbar('Ошибка при добавлении доступа', 'error');
      }
    }
  };

  const handleSave = () => {
    onUpdate && onUpdate();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Управление доступами для роли: {role.name}</DialogTitle>
        <DialogContent>
          <List>
            {accessList.map(access => (
              <ListItem key={access.id} button onClick={() => handleToggle(access.id)}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={roleAccessIds.includes(access.id)}
                      onChange={() => handleToggle(access.id)}
                      color="primary"
                    />
                  }
                  label={access.name}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
