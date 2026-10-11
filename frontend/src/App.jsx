import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import TicketList from './pages/tickets/TicketList';
import TicketDetail from './pages/tickets/TicketDetail';
import CreateTicket from './pages/tickets/CreateTicket';
import AssetList from './pages/assets/AssetList';
import AssetDetail from './pages/assets/AssetDetail';
import CreateAsset from './pages/assets/CreateAsset';
import KnowledgeBaseList from './pages/kb/KnowledgeBaseList';
import KnowledgeBaseDetail from './pages/kb/KnowledgeBaseDetail';
import KnowledgeBaseEditor from './pages/kb/KnowledgeBaseEditor';
import AIChatPage from './pages/ai/AIChatPage';
import Reports from './pages/reports/Reports';
import UserManagement from './pages/users/UserManagement';
import Profile from './pages/profile/Profile';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Workspace Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Tickets */}
              <Route path="tickets" element={<TicketList />} />
              <Route path="tickets/create" element={<CreateTicket />} />
              <Route path="tickets/:id" element={<TicketDetail />} />

              {/* Assets */}
              <Route path="assets" element={<AssetList />} />
              <Route
                path="assets/create"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'IT Manager', 'Asset Manager']}>
                    <CreateAsset />
                  </ProtectedRoute>
                }
              />
              <Route path="assets/:id" element={<AssetDetail />} />

              {/* Knowledge Base */}
              <Route path="kb" element={<KnowledgeBaseList />} />
              <Route
                path="kb/create"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'IT Manager', 'Technician']}>
                    <KnowledgeBaseEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="kb/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'IT Manager', 'Technician']}>
                    <KnowledgeBaseEditor />
                  </ProtectedRoute>
                }
              />
              <Route path="kb/:id" element={<KnowledgeBaseDetail />} />

              {/* AI Helpdesk Full-Page Workspace */}
              <Route path="ai-assistant" element={<AIChatPage />} />

              {/* Reports & Analytics */}
              <Route
                path="reports"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'IT Manager', 'Asset Manager', 'Technician']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* User Directory */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              {/* User Profile */}
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
