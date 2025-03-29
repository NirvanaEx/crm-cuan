import React, { useState, useEffect } from 'react';
import { FaCamera } from 'react-icons/fa';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import '../css/Settings.css';
import api from '../services/api';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Состояния для модального окна смены пароля
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        setError('Ошибка загрузки данных пользователя');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleChange = (field, value) => {
    setUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      formData.append('login', user.login || '');
      formData.append('surname', user.surname || '');
      formData.append('name', user.name || '');
      formData.append('patronym', user.patronym || '');
      formData.append('phone', user.phone || '');
      await api.post('/users/update-profile', formData);
      alert('Данные сохранены (пример).');
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении данных.');
    }
  };

  const handlePasswordSave = async () => {
    if (newPassword !== confirmNewPassword) {
      alert('Новый пароль и подтверждение не совпадают');
      return;
    }
    try {
      // Отправка запроса на смену пароля
      await api.post('/users/change-password', {
        oldPassword,
        newPassword,
      });
      alert('Пароль успешно изменён');
      setIsPasswordDialogOpen(false);
      // Можно сбросить поля формы смены пароля
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error(err);
      alert('Ошибка при изменении пароля.');
    }
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Загрузка...</p>;
  }

  if (error) {
    return <p style={{ padding: 20 }} className="error">{error}</p>;
  }

  if (!user) {
    return <p style={{ padding: 20 }}>Пользователь не найден</p>;
  }

  return (
    <div className="settings-page-full">
      <h1 className="settings-title">Настройки</h1>
      <div className="settings-card">
        <form className="settings-full-form" onSubmit={(e) => e.preventDefault()}>
          <div className="avatar-upload-section">
            <div className="avatar-preview">
              {avatarFile ? (
                <img
                  src={URL.createObjectURL(avatarFile)}
                  alt="Avatar Preview"
                  className="avatar-image"
                />
              ) : user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="User Avatar"
                  className="avatar-image"
                />
              ) : (
                <FaCamera className="camera-icon" />
              )}
            </div>
            <label htmlFor="avatarUpload" className="upload-label">
              {avatarFile ? 'Изменить фото' : 'Загрузить фото'}
            </label>
            <input
              type="file"
              id="avatarUpload"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="user-field">
            <label>Логин</label>
            <input type="text" value={user.login || ''} readOnly />
          </div>

          <div className="user-field">
            <label>Фамилия</label>
            <input
              type="text"
              value={user.surname || ''}
              onChange={(e) => handleChange('surname', e.target.value)}
            />
          </div>

          <div className="user-field">
            <label>Имя</label>
            <input
              type="text"
              value={user.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="user-field">
            <label>Отчество</label>
            <input
              type="text"
              value={user.patronym || ''}
              onChange={(e) => handleChange('patronym', e.target.value)}
            />
          </div>

          <div className="user-field">
            <label>Телефон</label>
            <input
              type="text"
              value={user.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          <div className="user-field">
            <label>Дата создания</label>
            <input
              type="text"
              readOnly
              value={
                user.date_creation
                  ? new Date(user.date_creation).toLocaleString()
                  : ''
              }
            />
          </div>

          {/* Текстовая кнопка "Изменить пароль" */}
          <Button variant="text" onClick={() => setIsPasswordDialogOpen(true)}>
            Изменить пароль
          </Button>

          <button className="save-button" onClick={handleSave}>
            Сохранить
          </button>
        </form>
      </div>

      {/* Модальное окно смены пароля */}
      <Dialog open={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)}>
        <DialogTitle>Сменить пароль</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Старый пароль"
            type="password"
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Новый пароль"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Повторите новый пароль"
            type="password"
            fullWidth
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPasswordDialogOpen(false)}>Отмена</Button>
          <Button onClick={handlePasswordSave}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Settings;
