import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import '../css/UniversalSearch.css';

const UniversalSearch = ({ fields = [], onSearch }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedField, setSelectedField] = useState(fields.length ? fields[0].value : '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // При любом изменении параметров вызывается onSearch
  useEffect(() => {
    const params = { text: searchText, field: selectedField, dateFrom, dateTo };
    if (onSearch) onSearch(params);
  }, [searchText, selectedField, dateFrom, dateTo, onSearch]);

  return (
    <div className="universal-search-container">
      <div className="universal-search-row">
        <TextField
          label="Поиск"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-textfield"
        />
        <FormControl
          variant="outlined"
          size="small"
          className="universal-search-select"
        >
          <InputLabel>Поле поиска</InputLabel>
          <Select
            label="Поле поиска"
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
          >
            {fields.map((field) => (
              <MenuItem key={field.value} value={field.value}>
                {field.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton
          className="calendar-icon-button"
          onClick={() => setShowDatePicker((prev) => !prev)}
        >
          <CalendarTodayIcon />
        </IconButton>
      </div>
      {showDatePicker && (
        <div className="universal-search-date-picker">
          <TextField
            label="С"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <TextField
            label="По"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;
