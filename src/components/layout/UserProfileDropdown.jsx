import React, { useEffect, useRef } from 'react';
import { User, Settings, Sliders, LogOut } from 'lucide-react';
import ProBadge from '../common/ProBadge';

const UserProfileDropdown = ({ user, onNavigateToSettings, onLogout, onClose, triggerRef }) => {
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the trigger button or inside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, triggerRef]);

  const handleSettingsClick = (settingsPage) => {
    onNavigateToSettings(settingsPage);
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fade-in"
    >
      {/* User Info Section */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.displayName || 'User'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
        </div>
      </div>


      {/* Menu Items */}
      <div className="py-1">
        <button
          onClick={() => handleSettingsClick('profile')}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => handleSettingsClick('advanced')}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Advanced Settings</span>
          </div>
          <ProBadge size="xs" position="inline" />
        </button>

        <button
          onClick={() => handleSettingsClick('preferences')}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
        >
          <Sliders className="w-4 h-4" />
          <span>Preferences</span>
        </button>

        {/* Horizontal line separator */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

        <button
          onClick={handleLogoutClick}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfileDropdown;
