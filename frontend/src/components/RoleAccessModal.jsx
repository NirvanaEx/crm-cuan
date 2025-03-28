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
  ListItem
} from '@mui/material';
import api from '../services/api';

export default function RoleAccessModal({ open, role, onClose, onUpdate }) {
  const [accessList, setAccessList] = useState([]);
  const [roleAccessIds, setRoleAccessIds] = useState([]);

  useEffect(() => {
    if (open && role) {
      fetchAccessList();
      fetchRoleAccess();
    }
  }, [open, role]);

  const fetchAccessList = async () => {
    try {
      const response = await api.get('/access');
      setAccessList(response.data);
    } catch (error) {
      console.error('Ошибка при получении списка доступов:', error);
    }
  };

  const fetchRoleAccess = async () => {
    try {
      const response = await api.get(`/roles/${role.id}/access`);
      // Ожидается, что API вернёт массив объектов доступа, каждый с полем id
      const accessIds = response.data.map(item => item.id);
      setRoleAccessIds(accessIds);
    } catch (error) {
      console.error('Ошибка при получении доступа для роли:', error);
    }
  };

  const handleToggle = async (accessId) => {
    if (roleAccessIds.includes(accessId)) {
      // Удаляем доступ
      try {
        await api.delete(`/roles/${role.id}/access/${accessId}`);
        setRoleAccessIds(prev => prev.filter(id => id !== accessId));
      } catch (error) {
        console.error('Ошибка при удалении доступа:', error);
      }
    } else {
      // Добавляем доступ
      try {
        await api.post(`/roles/${role.id}/access`, { accessId });
        setRoleAccessIds(prev => [...prev, accessId]);
      } catch (error) {
        console.error('Ошибка при добавлении доступа:', error);
      }
    }
  };

  const handleSave = () => {
    onUpdate && onUpdate();
    onClose();
  };

  return (
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
  );
}
