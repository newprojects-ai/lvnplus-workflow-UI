import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

// Pages
import Dashboard from './pages/Dashboard';
import WorkflowsPage from './pages/WorkflowsPage';
import WorkflowDetail from './pages/WorkflowDetail';
import InstancesPage from './pages/InstancesPage';
import TasksPage from './pages/TasksPage';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workflows" element={<WorkflowsPage />} />
          <Route path="/workflows/:id" element={<WorkflowDetail />} />
          <Route path="/instances" element={<InstancesPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;