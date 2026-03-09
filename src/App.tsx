import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/home/HomePage';
import SearchPage from './pages/search/SearchPage';
import BookingPage from './pages/booking/BookingPage';
import NewBookingPage from './pages/booking/NewBookingPage';
import BookingDetailPage from './pages/booking/BookingDetailPage';
import MomMePage from './pages/booking/MomMePage';
import PendingBookingsPage from './pages/booking/PendingBookingsPage';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import NewAppointmentPage from './pages/appointments/NewAppointmentPage';
import AppointmentDetailPage from './pages/appointments/AppointmentDetailPage';
import ProvidersPage from './pages/providers/ProvidersPage';
import CalendarPage from './pages/calendar/CalendarPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/settings/ProfilePage';
import PaywallPage from './pages/settings/PaywallPage';
import WalletPage from './pages/settings/WalletPage';
import InsurancePage from './pages/settings/InsurancePage';
import PrivacyPolicyPage from './pages/settings/PrivacyPolicyPage';
import TermsPage from './pages/settings/TermsPage';
import ContactPage from './pages/settings/ContactPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ConnectEmailPage from './pages/settings/ConnectEmailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#1E3C50',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="providers" element={<ProvidersPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="booking/new" element={<NewBookingPage />} />
          <Route path="booking/:id" element={<BookingDetailPage />} />
          <Route path="mom-me" element={<MomMePage />} />
          <Route path="booking/pending" element={<PendingBookingsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="appointments/new" element={<NewAppointmentPage />} />
          <Route path="appointments/:id" element={<AppointmentDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/profile" element={<ProfilePage />} />
          <Route path="settings/paywall" element={<PaywallPage />} />
          <Route path="settings/wallet" element={<WalletPage />} />
          <Route path="settings/insurance" element={<InsurancePage />} />
          <Route path="settings/privacy" element={<PrivacyPolicyPage />} />
          <Route path="settings/terms" element={<TermsPage />} />
          <Route path="settings/contact" element={<ContactPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="connect-email" element={<ConnectEmailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
