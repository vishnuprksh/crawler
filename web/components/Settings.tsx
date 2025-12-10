import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, LogOut, User, Mail } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4 mb-6">
          {user?.picture ? (
            <img 
              src={user.picture} 
              alt={user.name} 
              className="w-16 h-16 rounded-full border-2 border-indigo-100 dark:border-indigo-900"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
              <User size={32} />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</h2>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
              <Mail size={14} className="mr-1.5" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preferences</h3>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-orange-100 text-orange-500'}`}>
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <div className={`w-11 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
          </div>
        </button>
      </div>

      {/* Account Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
        <button 
          onClick={logout}
          className="w-full flex items-center space-x-3 p-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
      
      <div className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
        Crawler App v1.0.0
      </div>
    </div>
  );
};

export default Settings;
