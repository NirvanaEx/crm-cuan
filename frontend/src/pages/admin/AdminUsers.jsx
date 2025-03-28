// AdminUsers.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import UniversalTable from '../../components/UniversalTable';
import {
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useTheme,
    Snackbar,
    Alert
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import '../../css/admin/AdminUsers.css';

// Компонент для выбора и изменения статуса
function StatusSelect({ initialStatus, userId, onStatusChange, showSnackbar }) {
    const [status, setStatus] = useState(initialStatus);

    const statusColors = {
        active: {
            background: '#d9f7be',
            color: '#52c41a'
        },
        banned: {
            background: '#fff1b8',
            color: '#faad14'
        },
        deleted: {
            background: '#ffccc7',
            color: '#f5222d'
        }
    };

    const handleChange = async (event) => {
        const newStatus = event.target.value;
        const previousStatus = status; // сохраняем старый статус
        setStatus(newStatus);
        try {
            const response = await api.put(`/users/${userId}/status`, { status: newStatus });
            // Если запрос выполнен успешно, вызывается onStatusChange, если он задан
            showSnackbar('Статус пользователя обновлён', 'success');
            if (onStatusChange) onStatusChange();
        } catch (error) {
            console.error('Ошибка при обновлении статуса пользователя:', error);
            showSnackbar('Ошибка при обновлении статуса пользователя', 'error');
            // Если сервер вернул ошибку, возвращаем старое состояние
            setStatus(previousStatus);
        }
    };

    const styles = {
        backgroundColor: statusColors[status]?.background || '#f0f0f0',
        color: statusColors[status]?.color || '#000',
        border: '1px solid transparent',
        borderRadius: '4px'
    };

    return (
        <FormControl size="small">
            <Select value={status} onChange={handleChange} sx={styles}>
                <MenuItem value="active" sx={{ backgroundColor: statusColors.active.background, color: statusColors.active.color }}>
                    active
                </MenuItem>
                <MenuItem value="banned" sx={{ backgroundColor: statusColors.banned.background, color: statusColors.banned.color }}>
                    banned
                </MenuItem>
                <MenuItem value="deleted" sx={{ backgroundColor: statusColors.deleted.background, color: statusColors.deleted.color }}>
                    deleted
                </MenuItem>
            </Select>
        </FormControl>
    );
}


// Компонент для статуса (только чтение, если не супер-админ)
function StatusBadge({ status }) {
    const statusColors = {
        active: {
            background: '#d9f7be',
            color: '#52c41a'
        },
        banned: {
            background: '#fff1b8',
            color: '#faad14'
        },
        deleted: {
            background: '#ffccc7',
            color: '#f5222d'
        }
    };

    const styles = {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        backgroundColor: statusColors[status]?.background || '#f0f0f0',
        color: statusColors[status]?.color || '#000'
    };

    return <span style={styles}>{status}</span>;
}

export default function AdminUsers() {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const { user: currentUser } = useContext(AuthContext);

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roles, setRoles] = useState([]);

    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);

    const [newUser, setNewUser] = useState({
        login: '',
        password: '',
        surname: '',
        name: '',
        patronym: '',
        phone: '',
        roleId: ''
    });

    const [editUser, setEditUser] = useState({
        id: null,
        login: '',
        password: '',
        surname: '',
        name: '',
        patronym: '',
        phone: '',
        roleId: ''
    });

    // Состояние для Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Функция для показа уведомлений
    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    // Получение пользователей
    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Ошибка при получении пользователей:', error);
            showSnackbar('Ошибка при получении списка пользователей', 'error');
        }
    };

    // Получение ролей
    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Ошибка при получении ролей:', error);
            showSnackbar('Ошибка при получении списка ролей', 'error');
        }
    };

    // Фильтрация по поиску
    const filteredUsers = users.filter((user) =>
        Object.values(user).some((val) =>
            String(val).toLowerCase().includes(search.toLowerCase())
        )
    );

    // Проверка, является ли текущий пользователь superadmin
    function currentUserIsSuperadmin() {
        if (!currentUser || !currentUser.roles) return false;
        return currentUser.roles.some((r) => r.name.toLowerCase() === 'superadmin');
    }

    // Открытие/закрытие диалога "Добавить"
    const handleOpenAdd = () => setOpenAdd(true);
    const handleCloseAdd = () => {
        setOpenAdd(false);
        setNewUser({
            login: '',
            password: '',
            surname: '',
            name: '',
            patronym: '',
            phone: '',
            roleId: ''
        });
    };

    // Открытие/закрытие диалога "Редактировать"
    const handleOpenEdit = (row) => {
        setEditUser({
            id: row.id,
            login: row.login,
            password: '',
            surname: row.surname || '',
            name: row.name || '',
            patronym: row.patronym || '',
            phone: row.phone || '',
            roleId: row.role_id || ''
        });
        setOpenEdit(true);
    };
    const handleCloseEdit = () => setOpenEdit(false);

    // Добавление пользователя
    const handleAddUser = async () => {
        try {
            if (!newUser.login || !newUser.password) {
                showSnackbar('Поля логин и пароль обязательны', 'error');
                return;
            }
            if (newUser.roleId) {
                await api.post('/users/with-role', newUser);
            } else {
                await api.post('/users', newUser);
            }
            showSnackbar('Пользователь добавлен', 'success');
            fetchUsers();
            handleCloseAdd();
        } catch (error) {
            console.error('Ошибка при добавлении пользователя:', error);
            showSnackbar('Ошибка при добавлении пользователя', 'error');
        }
    };

    // Удаление пользователя (soft delete)
    const handleDelete = async (row) => {
        const confirmDelete = window.confirm(`Удалить пользователя "${row.login}"?`);
        if (confirmDelete) {
            try {
                await api.delete(`/users/${row.id}`);
                setUsers((prev) => prev.filter((u) => u.id !== row.id));
                showSnackbar('Пользователь удалён', 'success');
            } catch (error) {
                console.error('Ошибка при удалении пользователя:', error);
                showSnackbar('Ошибка при удалении пользователя', 'error');
            }
        }
    };

    // Сохранение изменений при редактировании
    const handleSaveEdit = async () => {
        if (!editUser.id) return;
        try {
            await api.put(`/users/${editUser.id}`, {
                login: editUser.login,
                password: editUser.password,
                surname: editUser.surname,
                name: editUser.name,
                patronym: editUser.patronym,
                phone: editUser.phone,
                roleId: editUser.roleId
            });
            showSnackbar('Данные пользователя обновлены', 'success');
            fetchUsers();
            handleCloseEdit();
        } catch (error) {
            console.error('Ошибка при сохранении изменений пользователя:', error);
            showSnackbar('Ошибка при сохранении изменений', 'error');
        }
    };

    // Колонки (базовые)
    const baseColumns = [
        { key: 'id', label: 'ID', width: '5%' },
        { key: 'login', label: 'Логин', width: '15%' },
        { key: 'date_creation', label: 'Дата создания', width: '15%' },
        { key: 'surname', label: 'Фамилия', width: '10%' },
        { key: 'name', label: 'Имя', width: '10%' },
        { key: 'patronym', label: 'Отчество', width: '10%' },
        { key: 'phone', label: 'Телефон', width: '10%' },
        { key: 'role_name', label: 'Роль', width: '10%' }
    ];

    // Добавление колонки со статусом (для superadmin - Select, для остальных - метка)
    const statusColumn = {
        key: 'status',
        label: 'Статус',
        width: '10%',
        render: (value, row) => {
            if (currentUserIsSuperadmin()) {
                return (
                    <StatusSelect
                        initialStatus={value}
                        userId={row.id}
                        onStatusChange={fetchUsers}
                        showSnackbar={showSnackbar}
                    />
                );
            } else {
                return <StatusBadge status={value} />;
            }
        }
    };

    // Если superadmin, добавляется колонка статуса
    const columns = currentUserIsSuperadmin()
        ? [...baseColumns, statusColumn]
        : baseColumns;

    return (
        <div className="admin-users-container">
            <h1>Управление пользователями</h1>

            <div className="admin-users-actions">
                <TextField
                    label="Поиск"
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: isDarkMode ? '#2b2b2b' : '#fff',
                            color: isDarkMode ? '#fff' : '#000'
                        },
                        marginRight: '10px',
                        width: '300px'
                    }}
                />
                <Button
                    variant="contained"
                    onClick={handleOpenAdd}
                    sx={{
                        backgroundColor: isDarkMode ? '#7367f0' : '#007bff',
                        '&:hover': {
                            backgroundColor: isDarkMode ? '#5c54c7' : '#0056b3'
                        }
                    }}
                >
                    Добавить пользователя
                </Button>
            </div>

            <UniversalTable
                columns={columns}
                data={filteredUsers}
                itemsPerPage={5}
                onDelete={handleDelete}
                onEdit={handleOpenEdit}
            />

            {/* Диалог: Добавить пользователя */}
            <Dialog
                open={openAdd}
                onClose={handleCloseAdd}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        backgroundColor: isDarkMode ? '#2b2b2b' : '#fff',
                        color: isDarkMode ? '#fff' : '#000'
                    }
                }}
            >
                <DialogTitle>Добавить пользователя</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        marginTop: '10px'
                    }}
                >
                    <TextField
                        label="Логин"
                        value={newUser.login}
                        onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
                        sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
                    />
                    <TextField
                        label="Пароль"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
                    />
                    <TextField
                        label="Фамилия"
                        value={newUser.surname}
                        onChange={(e) => setNewUser({ ...newUser, surname: e.target.value })}
                        sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
                    />
                    <TextField
                        label="Имя"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
                    />
                    <TextField
                        label="Отчество"
                        value={newUser.patronym}
                        onChange={(e) => setNewUser({ ...newUser, patronym: e.target.value })}
                        sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
                    />
                    <TextField
                        label="Телефон"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
                    />
                    <FormControl>
                        <InputLabel id="role-select-label" sx={{ color: isDarkMode ? '#fff' : '#000' }}>
                            Роль
                        </InputLabel>
                        <Select
                            labelId="role-select-label"
                            label="Роль"
                            value={newUser.roleId}
                            onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
                            sx={{
                                width: '200px',
                                backgroundColor: isDarkMode ? '#3a3a3a' : '#fff',
                                color: isDarkMode ? '#fff' : '#000'
                            }}
                        >
                            <MenuItem value="">Без роли</MenuItem>
                            {roles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAdd}>Отмена</Button>
                    <Button variant="contained" onClick={handleAddUser}>
                        Добавить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог: Редактировать пользователя */}
            <Dialog
                open={openEdit}
                onClose={handleCloseEdit}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        backgroundColor: isDarkMode ? '#2b2b2b' : '#fff',
                        color: isDarkMode ? '#fff' : '#000'
                    }
                }}
            >
                <DialogTitle>Редактировать пользователя</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        marginTop: '10px'
                    }}
                >
                    <TextField
                        label="Логин"
                        value={editUser.login}
                        onChange={(e) => setEditUser({ ...editUser, login: e.target.value })}
                        sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
                    />
                    <TextField
                        label="Новый пароль"
                        type="password"
                        value={editUser.password}
                        onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                        sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
                    />
                    <TextField
                        label="Фамилия"
                        value={editUser.surname}
                        onChange={(e) => setEditUser({ ...editUser, surname: e.target.value })}
                        sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
                    />
                    <TextField
                        label="Имя"
                        value={editUser.name}
                        onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                        sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
                    />
                    <TextField
                        label="Отчество"
                        value={editUser.patronym}
                        onChange={(e) => setEditUser({ ...editUser, patronym: e.target.value })}
                        sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
                    />
                    <TextField
                        label="Телефон"
                        value={editUser.phone}
                        onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                        sx={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#fff' }}
                    />
                    <FormControl>
                        <InputLabel id="edit-role-select-label" sx={{ color: isDarkMode ? '#fff' : '#000' }}>
                            Роль
                        </InputLabel>
                        <Select
                            labelId="edit-role-select-label"
                            label="Роль"
                            value={editUser.roleId}
                            onChange={(e) => setEditUser({ ...editUser, roleId: e.target.value })}
                            sx={{
                                width: '200px',
                                backgroundColor: isDarkMode ? '#3a3a3a' : '#fff',
                                color: isDarkMode ? '#fff' : '#000'
                            }}
                        >
                            <MenuItem value="">Без роли</MenuItem>
                            {roles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit}>Отмена</Button>
                    <Button variant="contained" onClick={handleSaveEdit}>
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar для уведомлений */}
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
        </div>
    );
}
