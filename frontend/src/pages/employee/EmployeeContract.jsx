// src/pages/employee/EmployeeContract.jsx
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, Autocomplete, MenuItem, Pagination, Stack
} from '@mui/material';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import UniversalTable  from '../../components/UniversalTable';
import UniversalSearch from '../../components/UniversalSearch';
import api             from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import '../../css/employee/EmployeeContract.css';

/* ----------------------------- константы ----------------------------- */
const PER_PAGE          = 20;   // пользователей на страницу
const DETAILS_PER_PAGE  = 6;    // строк в диалоге «Контракты сотрудника»

/* ----------------------------- утилиты ------------------------------- */
const toDMY = iso =>
  iso ? new Date(iso).toLocaleDateString('ru-RU') : '';

const toYMD = iso =>
  iso ? iso.slice(0, 10) : '';

/* ===================================================================== */
export default function EmployeeContract() {
  /* -------- контекст и права -------- */
  const { user: currentUser, permissions } = useContext(AuthContext);
  const isSuperadmin = () =>
    currentUser?.roles?.some(r => r.name?.toLowerCase() === 'superadmin');

  const canCreate = isSuperadmin() || permissions.includes('contract_create');
  const canUpdate = isSuperadmin() || permissions.includes('contract_update');
  const canDelete = isSuperadmin() || permissions.includes('contract_delete');

  /* -------- данные -------- */
  const [contracts,  setContracts]  = useState([]); // контракты страницы
  const [totalUsers, setTotalUsers] = useState(0);  // всего пользователей
  const [page,       setPage]       = useState(1);  // номер страницы

  const [positions, setPositions] = useState([]);   // справочник должностей
  const [users,     setUsers]     = useState([]);   // список для Autocomplete

  /* ----- детали ----- */
  const [detailRows,  setDetailRows]  = useState([]);
  const [detailPage,  setDetailPage]  = useState(1);
  const [openDetails, setOpenDetails] = useState(false);

  /* ----- формы ----- */
  const [openAdd,  setOpenAdd]  = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [form, setForm] = useState({
    id: null,
    userId: '',
    positionId: '',
    workRatio: '',
    dateStart: '',
    dateEnd: ''
  });

  /* ----- поиск ----- */
  const [search, setSearch] = useState({
    text: '', field: 'user_login', dateFrom: '', dateTo: ''
  });

  /* ----- snackbar ----- */
  const [snackbar, setSnackbar] = useState({
    open: false, message: '', severity: 'success'
  });
  const showSnackbar  = (m, s = 'success') => setSnackbar({ open:true, message:m, severity:s });
  const closeSnackbar = () => setSnackbar(o => ({ ...o, open:false }));

  /* ========================= загрузка справочников =================== */
  useEffect(() => {
    api.get('/positions')
      .then(r => setPositions(r.data))
      .catch(() => showSnackbar('Ошибка при загрузке должностей', 'error'));
  }, []);

  /* ========================= загрузка чанка ========================== */
  const fetchChunk = useCallback(async () => {
    try {
      const { data } = await api.get('/contracts', { params: { page, perPage: PER_PAGE } });
      setContracts(data.contracts);
      setTotalUsers(data.totalUsers);
    } catch {
      showSnackbar('Ошибка при загрузке контрактов', 'error');
    }
  }, [page]);

  useEffect(() => { fetchChunk(); }, [fetchChunk]);

  /* ======================== группировка + фильтр ===================== */
  const today = useMemo(() => new Date(), []);
  const summaryRows = useMemo(() => {
    /* фильтрация контрактов */
    const filtered = contracts.filter(c => {
      if (search.text) {
        const val = search.field === 'user_login' ? c.user_login : c.full_name;
        if (!val.toLowerCase().includes(search.text.toLowerCase())) return false;
      }
      if (search.dateFrom && new Date(c.date_start) < new Date(search.dateFrom)) return false;
      if (search.dateTo   && new Date(c.date_start) > new Date(search.dateTo))   return false;
      return true;
    });

    /* группировка по пользователю */
    const map = {};
    filtered.forEach(c => {
      if (!map[c.user_id]) {
        map[c.user_id] = {
          user_id:      c.user_id,
          user_login:   c.user_login,
          full_name:    c.full_name,
          active_count: 0
        };
      }
      const active = !c.date_end || new Date(c.date_end) >= today;
      if (active) map[c.user_id].active_count += 1;
    });

    /* добавление порядкового номера */
    return Object.values(map).map((row, idx) => ({
      num: idx + 1,
      ...row
    }));
  }, [contracts, search, today]);

  /* ======================== колонки таблиц ========================== */
  const summaryColumns = [
    { key:'num',          label:'№',            width:'6%'  },
    { key:'user_login',   label:'Логин',        width:'24%' },
    { key:'full_name',    label:'ФИО',          width:'46%' },
    { key:'active_count', label:'Активные',     width:'24%' }
  ];

  const detailsColumns = [
    { key:'num',         label:'№',          width:'6%'  },
    { key:'position_id', label:'Должность',  width:'32%',
      render:(_v,row)=>positions.find(p=>p.id===row.position_id)?.name||row.position_id },
    { key:'work_ratio',  label:'Ставка',     width:'10%' },
    { key:'date_start',  label:'Начало',     width:'22%', render:v=>toDMY(v) },
    { key:'date_end',    label:'Окончание',  width:'22%', render:v=>toDMY(v) },
    { key:'actions',     label:'',           width:'8%',
      render:(_v,row)=>(
        <div style={{display:'flex',gap:8}}>
          {canUpdate && (
            <AiOutlineEdit size={20} style={{cursor:'pointer'}}
              onClick={()=>{
                setForm({
                  id:row.id,
                  userId:row.user_id,
                  positionId:row.position_id,
                  workRatio:row.work_ratio,
                  dateStart:toYMD(row.date_start),
                  dateEnd:toYMD(row.date_end)
                });
                setOpenEdit(true);
              }}/>
          )}
          {canDelete && (
            <AiOutlineDelete size={20} style={{cursor:'pointer'}}
              onClick={()=>handleDelete(row)}/>
          )}
        </div>
      )}
  ];

  /* ======================== детали ========================== */
  const openDetailsDialog = userId => {
    const list = contracts
      .filter(c => c.user_id === userId)
      .map((c, idx) => ({ ...c, num: idx + 1 })); // порядковый номер строки
    setDetailRows(list);
    setDetailPage(1);
    setOpenDetails(true);
  };

  /* ======================== CRUD ============================ */
  const resetForm = () => {
    setForm({ id:null,userId:'',positionId:'',workRatio:'',dateStart:'',dateEnd:'' });
    setOpenAdd(false); setOpenEdit(false);
  };

  const searchUsersByLogin = login => {
    api.get('/users', { params:{ search:login, searchField:'login' } })
      .then(r => setUsers(r.data))
      .catch(()=>{});
  };

  const handleAdd = async () => {
    const { userId, positionId, workRatio, dateStart } = form;
    if (!userId || !positionId || !workRatio || !dateStart)
      return showSnackbar('Заполните все обязательные поля', 'error');
    if (workRatio < 0.25 || workRatio > 1)
      return showSnackbar('Ставка должна быть от 0.25 до 1.0', 'error');

    try {
      await api.post('/contracts', {
        userId,
        positionId,
        workRatio: parseFloat(workRatio),
        dateStart,
        dateEnd: form.dateEnd || null
      });
      showSnackbar('Контракт создан');
      resetForm(); fetchChunk();
    } catch {
      showSnackbar('Не удалось создать контракт', 'error');
    }
  };

  const handleEdit = async () => {
    const { id, positionId, workRatio, dateStart } = form;
    if (!positionId || !workRatio || !dateStart)
      return showSnackbar('Заполните все обязательные поля', 'error');
    if (workRatio < 0.25 || workRatio > 1)
      return showSnackbar('Ставка должна быть от 0.25 до 1.0', 'error');

    try {
      await api.put(`/contracts/${id}`, {
        positionId,
        workRatio: parseFloat(workRatio),
        dateStart,
        dateEnd: form.dateEnd || null
      });
      showSnackbar('Контракт обновлён');
      resetForm(); fetchChunk();
    } catch {
      showSnackbar('Не удалось обновить контракт', 'error');
    }
  };

  const handleDelete = async row => {
    if (!window.confirm(`Удалить контракт #${row.id}?`)) return;
    try {
      await api.delete(`/contracts/${row.id}`);
      showSnackbar('Контракт удалён');
      fetchChunk();
    } catch {
      showSnackbar('Не удалось удалить контракт', 'error');
    }
  };

  /* ======================== UI ============================ */
  return (
    <div className="employee-contract-container">
      <h1>Управление контрактами</h1>

      {/* ---- панель поиска и кнопка ---- */}
      <div className="employee-contract-actions">
        <UniversalSearch
          fields={[
            { value:'user_login', label:'Логин' },
            { value:'full_name',  label:'ФИО'   }
          ]}
          onSearch={setSearch}
        />

      </div>

      {canCreate && (
          <Button variant="contained"  onClick={()=>setOpenAdd(true)}>
            Добавить контракт
          </Button>
       )}

      {/* ---- сводная таблица ---- */}
      <UniversalTable
        columns={summaryColumns}
        data={summaryRows}
        onRowClick={row => openDetailsDialog(row.user_id)}
      />

      {totalUsers > PER_PAGE && (
        <Stack direction="row" justifyContent="center" sx={{ mt:2 }}>
          <Pagination
            page={page}
            count={Math.ceil(totalUsers / PER_PAGE)}
            onChange={(_e,v)=>setPage(v)}
            color="primary"
          />
        </Stack>
      )}

      {/* ---- диалог деталей ---- */}
      <Dialog open={openDetails} onClose={()=>setOpenDetails(false)} fullWidth maxWidth="md">
        <DialogTitle>Контракты сотрудника</DialogTitle>
        <DialogContent>
          <UniversalTable
            columns={detailsColumns}
            data={detailRows.slice(
              (detailPage-1)*DETAILS_PER_PAGE,
              detailPage*DETAILS_PER_PAGE
            )}
          />
          {detailRows.length > DETAILS_PER_PAGE && (
            <Stack direction="row" justifyContent="center" sx={{ mt:2 }}>
              <Pagination
                page={detailPage}
                count={Math.ceil(detailRows.length/DETAILS_PER_PAGE)}
                onChange={(_e,v)=>setDetailPage(v)}
              />
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* ---- диалог создания ---- */}
      <Dialog open={openAdd} onClose={resetForm} fullWidth maxWidth="sm">
        <DialogTitle>Создать контракт</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={users}
            getOptionLabel={u=>u.login||''}
            onInputChange={(_e,v)=>searchUsersByLogin(v)}
            onChange={(_e,v)=>setForm(f=>({...f,userId:v?.id||''}))}
            renderInput={p=><TextField {...p} label="Логин" margin="dense" fullWidth />}
          />
          <TextField select label="Должность" fullWidth margin="dense"
            value={form.positionId}
            onChange={e=>setForm(f=>({...f,positionId:e.target.value}))}>
            {positions.map(p=><MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
          </TextField>
          <TextField label="Ставка" type="number" fullWidth margin="dense"
            inputProps={{step:'0.01',min:0.25,max:1}}
            value={form.workRatio}
            onChange={e=>setForm(f=>({...f,workRatio:e.target.value}))}/>
          <TextField label="Дата начала" type="date" fullWidth margin="dense"
            InputLabelProps={{shrink:true}}
            value={form.dateStart}
            onChange={e=>setForm(f=>({...f,dateStart:e.target.value}))}/>
          <TextField label="Дата окончания" type="date" fullWidth margin="dense"
            InputLabelProps={{shrink:true}}
            value={form.dateEnd}
            onChange={e=>setForm(f=>({...f,dateEnd:e.target.value}))}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Отмена</Button>
          <Button variant="contained" onClick={handleAdd}>Создать</Button>
        </DialogActions>
      </Dialog>

      {/* ---- диалог редактирования ---- */}
      <Dialog open={openEdit} onClose={resetForm} fullWidth maxWidth="sm">
        <DialogTitle>Редактировать контракт</DialogTitle>
        <DialogContent>
          <TextField label="ID" fullWidth margin="dense" disabled value={form.id||''}/>
          <TextField select label="Должность" fullWidth margin="dense"
            value={form.positionId}
            onChange={e=>setForm(f=>({...f,positionId:e.target.value}))}>
            {positions.map(p=><MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
          </TextField>
          <TextField label="Ставка" type="number" fullWidth margin="dense"
            inputProps={{step:'0.01',min:0.25,max:1}}
            value={form.workRatio}
            onChange={e=>setForm(f=>({...f,workRatio:e.target.value}))}/>
          <TextField label="Дата начала" type="date" fullWidth margin="dense"
            InputLabelProps={{shrink:true}}
            value={form.dateStart}
            onChange={e=>setForm(f=>({...f,dateStart:e.target.value}))}/>
          <TextField label="Дата окончания" type="date" fullWidth margin="dense"
            InputLabelProps={{shrink:true}}
            value={form.dateEnd}
            onChange={e=>setForm(f=>({...f,dateEnd:e.target.value}))}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Отмена</Button>
          <Button variant="contained" onClick={handleEdit}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* ---- Snackbar ---- */}
      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical:'top', horizontal:'right' }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{width:'100%'}}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
