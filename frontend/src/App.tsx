import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KurirManagement from './pages/KurirManagement';
import PengirimanManagement from './pages/PengirimanManagement';
import RouteOptimization from './pages/RouteOptimization';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="kurir"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <KurirManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="pengiriman"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PengirimanManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="route"
              element={
                <ProtectedRoute allowedRoles={['admin', 'spv']}>
                  <RouteOptimization />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
