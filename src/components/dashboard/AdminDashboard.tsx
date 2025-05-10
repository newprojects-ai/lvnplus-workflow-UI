import React from 'react';
import { Users, Settings, Shield, Activity } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Administration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage system users, roles, and permissions
              </p>
              <div className="mt-4 space-y-2">
                <Link to="/users">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link to="/settings/roles">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Roles & Permissions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure system-wide settings and preferences
              </p>
              <div className="mt-4 space-y-2">
                <Link to="/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    General Settings
                  </Button>
                </Link>
                <Link to="/settings/audit">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Audit Logs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;