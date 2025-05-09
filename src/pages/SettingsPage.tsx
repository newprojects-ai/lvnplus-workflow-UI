import React from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Bell, Lock, User, Mail, Globe, Database, Workflow } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-medium text-gray-900 mb-6">General Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Application Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue="Workflow Management System"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Default Language
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time Zone
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue="UTC"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Workflow Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Default Task Priority
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue="normal"
                >
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Auto-assign Tasks
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Automatically assign tasks to available users
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Task Due Date Calculation
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    defaultValue="3"
                  />
                  <select
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    defaultValue="days"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                  <span className="text-sm text-gray-500">after task creation</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Notification Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <span className="ml-3 text-sm text-gray-700">Task Assignments</span>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <span className="ml-3 text-sm text-gray-700">Task Due Date Reminders</span>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <span className="ml-3 text-sm text-gray-700">Workflow Completion</span>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Quick Settings</h2>
            
            <nav className="space-y-1">
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                Profile Settings
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50">
                <Lock className="h-5 w-5 text-gray-400 mr-3" />
                Security Settings
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                Email Settings
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50">
                <Globe className="h-5 w-5 text-gray-400 mr-3" />
                Language & Region
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50">
                <Database className="h-5 w-5 text-gray-400 mr-3" />
                Data Management
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50">
                <Workflow className="h-5 w-5 text-gray-400 mr-3" />
                Workflow Settings
              </a>
            </nav>
          </Card>

          <Card>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h2>
            <div className="space-y-4">
              <Button variant="danger" className="w-full">
                Reset All Settings
              </Button>
              <Button variant="outline" className="w-full text-red-600 border-red-600 hover:bg-red-50">
                Clear All Data
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};