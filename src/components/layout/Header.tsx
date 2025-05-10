import React from 'react';
import { Bell, Search, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';

const Header: React.FC = () => {
  const { currentUser, isLoading } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="h-5 w-5" />
          </button>
          
          <button 
            onClick={handleSignOut}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
          
          {!isLoading && currentUser && (
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium text-gray-700">{currentUser.name}</span>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover border border-gray-200"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;