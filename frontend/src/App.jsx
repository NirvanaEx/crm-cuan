import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Preloader from './components/Preloader';
import { ThemeContext } from './context/ThemeContext';
import { LoadingProvider } from './context/LoadingContext';

import AdminUsers           from './pages/admin/AdminUsers';
import AdminRoles           from './pages/admin/AdminRoles';
import AdminAccess          from './pages/admin/AdminAccess';
import AdminSessions        from './pages/admin/AdminSessions';
import AdminLogs            from './pages/admin/AdminLogs';
import AdminLanguage        from './pages/admin/AdminLanguages';
import AdminRegistrations   from './pages/admin/AdminRegistrations';
import Settings             from './pages/Settings';

import CarBookings          from './pages/car/CarBookings';
import CarCategories        from './pages/car/CarCategories';
import CarModels            from './pages/car/CarModels';
import CalendarBookings     from './pages/car/CalendarBookings';

import HotelRooms           from './pages/hotel/HotelRooms';
import HotelBookings        from './pages/hotel/HotelBookings';

import Certificates         from './pages/certificate/Certificates';
import CertificateFields    from './pages/certificate/CertificateFields';
import CertificateRequests  from './pages/certificate/CertificateRequests';

function App() {
  const [progress, setProgress] = useState(0);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    const iv = setInterval(() => setProgress(p => Math.min(p+5,100)), 100);
    return () => clearInterval(iv);
  }, []);

  if (progress < 100) return <Preloader progress={progress} />;

  return (
    <LoadingProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<ProtectedRoute><Layout/></ProtectedRoute>}>
          {/* Admin */}
          <Route path="admin/users"        element={<ProtectedRoute allowedPermissions={['user_pageView']}><AdminUsers/></ProtectedRoute>} />
          <Route path="admin/roles"        element={<ProtectedRoute allowedPermissions={['role_pageView']}><AdminRoles/></ProtectedRoute>} />
          <Route path="admin/access"       element={<ProtectedRoute allowedPermissions={['access_pageView']}><AdminAccess/></ProtectedRoute>} />
          <Route path="admin/sessions"     element={<ProtectedRoute allowedPermissions={['session_pageView']}><AdminSessions/></ProtectedRoute>} />
          <Route path="admin/logs"         element={<ProtectedRoute allowedPermissions={['log_pageView']}><AdminLogs/></ProtectedRoute>} />
          <Route path="admin/language"     element={<ProtectedRoute allowedPermissions={['language_pageView']}><AdminLanguage/></ProtectedRoute>} />
          <Route path="admin/registration" element={<ProtectedRoute allowedPermissions={['registration_read']}><AdminRegistrations/></ProtectedRoute>} />

          {/* Settings */}
          <Route path="settings" element={<ProtectedRoute allowedPermissions={[]}> <Settings /> </ProtectedRoute>} />


          {/* Car */}
          <Route path="car-book"       element={<ProtectedRoute allowedPermissions={['carBook_pageView']}><CarBookings/></ProtectedRoute>} />
          <Route path="car-categories" element={<ProtectedRoute allowedPermissions={['carCategory_pageView']}><CarCategories/></ProtectedRoute>} />
          <Route path="car-models"     element={<ProtectedRoute allowedPermissions={['car_pageView']}><CarModels/></ProtectedRoute>} />
          <Route path="car-calendar"   element={<ProtectedRoute allowedPermissions={['carBookCalendar_pageView']}><CalendarBookings/></ProtectedRoute>} />

          {/* Hotel */}
          <Route path="hotel/rooms"    element={<ProtectedRoute allowedPermissions={['hotelRoom_pageView']}><HotelRooms/></ProtectedRoute>} />
          <Route path="hotel/bookings" element={<ProtectedRoute allowedPermissions={['hotelBook_pageView']}><HotelBookings/></ProtectedRoute>} />

          {/* Certificates */}
          <Route path="certificates"        element={<ProtectedRoute allowedPermissions={['certificate_read']}><Certificates/></ProtectedRoute>} />
          <Route path="certificate-fields"  element={<ProtectedRoute allowedPermissions={['certificateField_read']}><CertificateFields/></ProtectedRoute>} />
          <Route path="certificate-requests"element={<ProtectedRoute allowedPermissions={['certificateRequest_read']}><CertificateRequests/></ProtectedRoute>} />

          <Route path="*" element={<NotFound/>} />
        </Route>
      </Routes>
    </LoadingProvider>
  );
}

export default App;
