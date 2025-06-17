// src/pages/car/CalendarBookings.jsx
import React, { useState, useEffect, useContext } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import allLocales from '@fullcalendar/core/locales-all';
import {
  Box, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemText, Typography
} from '@mui/material';
import { format, isSameDay, compareAsc } from 'date-fns';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../../css/car/CalendarBookings.css';

export default function CalendarBookings({
  calendarHeight = '75vh',
  calendarWidth  = '95%',
  calendarLocale
}) {
  const { i18n } = useTranslation();
  const locale = calendarLocale || i18n.language;
  const { user } = useContext(AuthContext);

  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [selectedDate, setSelectedDate]       = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/car-bookings/active',  { params: { limit: 1000 } }),
      api.get('/car-bookings/history', { params: { limit: 1000 } })
    ])
    .then(([activeRes, histRes]) => {
      const all = [...activeRes.data.rows, ...histRes.data.rows];
      const evs = all.map(b => ({
        id:    b.id,
        title: `${b.model} #${b.number}`,
        start: new Date(b.date_start),
        end:   new Date(b.date_expired),
        extendedProps: { ...b }
      }));
      setEvents(evs);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  // клик по дате — показываем диалог
  const handleDateClick = (arg) => {
    const day = arg.date;
    const dayEvents = events
      .filter(e => isSameDay(e.start, day))
      .sort((a, b) => compareAsc(a.start, b.start));
    setSelectedDayEvents(dayEvents);
    setSelectedDate(day);
    setDialogOpen(true);
  };

  // рендерим число бронирований в ячейке
  const renderDayCell = (arg) => {
    const count = events.filter(e => isSameDay(e.start, arg.date)).length;
    return (
      <div className="fc-daygrid-day-custom">
        <div className="day-number">{arg.dayNumberText}</div>
        {count > 0 && (
          <div className="booking-count">
            {count} {count === 1 ? 'booking' : 'bookings'}
          </div>
        )}
      </div>
    );
  };

  return (
    <Box
      className="calendar-container"
      sx={{
        height: calendarHeight,
        width:  calendarWidth,
        p:      2,
        bgcolor: 'var(--bg-color)',
        color:   'var(--text-color)'
      }}
    >
      <FullCalendar
        plugins={[ dayGridPlugin, interactionPlugin ]}
        initialView="dayGridMonth"
        locales={allLocales}
        locale={locale}
        headerToolbar={{
          left:  'prev,next today',
          center:'title',
          right: ''
        }}
        events={events}
        eventDisplay="none"            /* ! убираем синие полоски */
        dateClick={handleDateClick}
        dayCellContent={renderDayCell}
        height="100%"
        contentHeight="auto"
      />

      {/* Диалог с деталями */}
      <Dialog open={dialogOpen} onClose={()=>setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {format(selectedDate, 'dd.MM.yyyy')} — {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'booking' : 'bookings'}
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {selectedDayEvents.map(e => (
              <ListItem key={e.id}>
                <ListItemText
                  primary={`${format(e.start, 'HH:mm')} – ${format(e.end, 'HH:mm')} | ${e.title}`}
                  secondary={[
                    `User: ${e.extendedProps.surname} ${e.extendedProps.name}`,
                    `Status: ${e.extendedProps.status}`
                  ].join(' • ')}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
