import React, { useState, useEffect } from 'react';
import { FaCamera } from 'react-icons/fa';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import '../css/Settings.css';
import api from '../services/api';

// Компонент Alert для Snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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

  // Состояния для настройки языка
  const [languagesList, setLanguagesList] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Состояния для Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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

    const fetchLanguages = async () => {
      try {
        const response = await api.get('/language');
        setLanguagesList(response.data);
      } catch (err) {
        console.error('Ошибка загрузки языков', err);
      }
    };

    const fetchUserSetting = async () => {
      try {
        const response = await api.get('/user-setting');
        if (response.data && response.data.selected_language_id) {
          setSelectedLanguage(response.data.selected_language_id);
        }
      } catch (err) {
        console.error('Ошибка загрузки настроек пользователя', err);
      }
    };

    fetchUserData();
    fetchLanguages();
    fetchUserSetting();
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

  // Сохранение данных профиля (без аватара)
  const handleSave = async () => {
    try {
      const profileData = {
        surname: user.surname || '',
        name: user.name || '',
        patronym: user.patronym || '',
        phone: user.phone || ''
      };
      await api.post('/profile/update-profile', profileData);
      setSnackbarMessage('Данные сохранены');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      setSnackbarMessage('Ошибка при сохранении данных');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handlePasswordSave = async () => {
    if (newPassword !== confirmNewPassword) {
      setSnackbarMessage('Новый пароль и подтверждение не совпадают');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      await api.post('/profile/change-password', {
        oldPassword,
        newPassword,
      });
      setSnackbarMessage('Пароль успешно изменён');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setIsPasswordDialogOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error(err);
      setSnackbarMessage('Ошибка при изменении пароля');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Обновление выбранного языка в настройках пользователя
  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    try {
      await api.put('/user-setting', { selected_language_id: newLang });
      setSnackbarMessage('Язык успешно изменён');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      setSnackbarMessage('Ошибка при изменении языка');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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

          {/* Выпадающий список для выбора языка */}
          <div className="user-field">
            <FormControl fullWidth>
              <InputLabel id="language-select-label">Язык</InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={selectedLanguage}
                label="Язык"
                onChange={handleLanguageChange}
              >
                {languagesList.map(lang => (
                  <MenuItem key={lang.id} value={lang.id}>
                    {lang.name} ({lang.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

      {/* Snackbar для отображения сообщений, справа сверху */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Settings;
