import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/auth/AuthGuard';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import WorkflowsPage from './pages/WorkflowsPage';
import WorkflowDetail from './pages/WorkflowDetail';
import NewWorkflow from './pages/NewWorkflow';
import InstancesPage from './pages/InstancesPage';
import TasksPage from './pages/TasksPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/workflows" element={<AuthGuard><WorkflowsPage /></AuthGuard>} />
            <Route path="/workflows/new" element={<AuthGuard><NewWorkflow /></AuthGuard>} />
            <Route path="/workflows/:id" element={<AuthGuard><WorkflowDetail /></AuthGuard>} />
            <Route path="/instances" element={<AuthGuard><InstancesPage /></AuthGuard>} />
            <Route path="/tasks" element={<AuthGuard><TasksPage /></AuthGuard>} />
            <Route path="/reports" element={<AuthGuard><ReportsPage /></AuthGuard>} />
            <Route path="/users" element={<AuthGuard><UsersPage /></AuthGuard>} />
            <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
          </Routes>
        </Router>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;