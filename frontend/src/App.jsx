import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import OwnerLayout from './layouts/OwnerLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Customer Pages
import Home from './pages/customer/Home';
import ExploreHostels from './pages/customer/ExploreHostels';
import HostelDetails from './pages/customer/HostelDetails';
import Booking from './pages/customer/Booking';
import Payment from './pages/customer/Payment';
import BookingConfirmation from './pages/customer/BookingConfirmation';
import MyBookings from './pages/customer/MyBookings';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Profile from './pages/customer/Profile';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerBookings from './pages/owner/OwnerBookings';
import OwnerHostels from './pages/owner/OwnerHostels';
import OwnerRooms from './pages/owner/OwnerRooms';
import OwnerCustomers from './pages/owner/OwnerCustomers';
import OwnerPayments from './pages/owner/OwnerPayments';
import OwnerRevenue from './pages/owner/OwnerRevenue';
import OwnerReviews from './pages/owner/OwnerReviews';
import OwnerSettings from './pages/owner/OwnerSettings';

// Auth & Common Pages
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      {/* Customer / Public Routes wrapped in CustomerLayout */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<ExploreHostels />} />
        <Route path="/hostels/:id" element={<HostelDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Protected Routes */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:bookingId"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-confirmation/:id"
          element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Owner Protected Routes wrapped in OwnerLayout */}
      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={['owner', 'admin']}>
            <OwnerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="bookings" element={<OwnerBookings />} />
        <Route path="hostels" element={<OwnerHostels />} />
        <Route path="rooms" element={<OwnerRooms />} />
        <Route path="customers" element={<OwnerCustomers />} />
        <Route path="payments" element={<OwnerPayments />} />
        <Route path="revenue" element={<OwnerRevenue />} />
        <Route path="reviews" element={<OwnerReviews />} />
        <Route path="settings" element={<OwnerSettings />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
