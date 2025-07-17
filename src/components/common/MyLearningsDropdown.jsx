import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, BookOpen, Crown, Shield, Settings } from 'lucide-react';
import { userTierManager } from '../../config/userTiers';
import { isSuperUser } from '../../config/adminConfig';

const MyLearningsDropdown = ({ onTierChange, onNavigateToPurchase, userEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('Advanced');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const dropdownRef = useRef(null);

  // Initialize with current tier from storage
  useEffect(() => {
    const currentTier = userTierManager.getCurrentTier();
    setSelectedTier(currentTier.name);
    
    // Check if user is admin
    if (userEmail) {
      setIsAdminUser(isSuperUser(userEmail));
    }
  }, [userEmail]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTierChange = (newTier) => {
    if (isAdminUser && userEmail) {
      // Admin user can override any tier
      setSelectedTier(newTier);
      userTierManager.setAdminTierOverride(newTier, userEmail);
      onTierChange && onTierChange(newTier);
    } else if (newTier === 'PRO' && !userTierManager.isPROUser()) {
      // Navigate to purchase page if not PRO user
      onNavigateToPurchase && onNavigateToPurchase();
    } else {
      setSelectedTier(newTier);
      userTierManager.setUserTier(newTier);
      onTierChange && onTierChange(newTier);
    }
    setIsOpen(false);
  };
  
  const handleClearAdminOverride = () => {
    if (isAdminUser && userEmail) {
      userTierManager.clearAdminTierOverride(userEmail);
      const currentTier = userTierManager.getCurrentTier();
      setSelectedTier(currentTier.name);
      onTierChange && onTierChange(currentTier.name);
    }
    setIsOpen(false);
  };

  const tierConfig = {
    'Advanced': {
      gradient: 'from-blue-500 to-cyan-600',
      icon: Shield,
      description: 'Free Learning Experience'
    },
    'PRO': {
      gradient: 'pro-gradient-primary',
      icon: Crown,
      description: 'Enhanced Learning Experience'
    }
  };

  const currentConfig = tierConfig[selectedTier] || tierConfig['Advanced'];
  const IconComponent = currentConfig.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Learning experience selector"
        className={`flex items-center space-x-2 px-3 py-2 ${currentConfig.gradient.startsWith('pro-') ? currentConfig.gradient : `bg-gradient-to-r ${currentConfig.gradient}`} text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-purple-300`}
      >
        <IconComponent className="w-4 h-4" />
        <span>{selectedTier === 'PRO' ? 'PRO Learning' : 'Enhanced Learning'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-2">
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide border-b border-gray-200 dark:border-gray-700">
              Learning Experience
            </div>
            
            {/* Advanced Option */}
            <button
              onClick={() => handleTierChange('Advanced')}
              className={`w-full px-4 py-3 text-left text-sm transition-colors duration-200 flex items-center space-x-3 ${
                selectedTier === 'Advanced'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center`}>
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Advanced</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Free Learning Experience</div>
              </div>
              {selectedTier === 'Advanced' && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>

            {/* PRO Option */}
            <button
              onClick={() => handleTierChange('PRO')}
              className={`w-full px-4 py-3 text-left text-sm transition-colors duration-200 flex items-center space-x-3 ${
                selectedTier === 'PRO'
                  ? 'bg-violet-50 dark:bg-cyan-900/20 text-violet-600 dark:text-cyan-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-full pro-gradient-primary flex items-center justify-center`}>
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium flex items-center space-x-2">
                  <span>PRO</span>
                  <span className="text-xs pro-gradient-primary text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                    ENHANCED
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Enhanced Learning Experience</div>
              </div>
              {selectedTier === 'PRO' && (
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              )}
            </button>
            
            {/* Admin Override Controls */}
            {isAdminUser && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <div className="px-4 py-2 text-xs text-orange-600 dark:text-orange-400 font-medium uppercase tracking-wide flex items-center space-x-2">
                  <Settings className="w-3 h-3" />
                  <span>Admin Override</span>
                </div>
                
                {userTierManager.getAdminTierOverride() && (
                  <div className="px-4 py-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 mx-2 rounded">
                    <div className="font-medium">Override Active</div>
                    <div className="text-orange-500 dark:text-orange-300">Admin privileges enabled</div>
                  </div>
                )}
                
                <button
                  onClick={handleClearAdminOverride}
                  className="w-full px-4 py-3 text-left text-sm transition-colors duration-200 flex items-center space-x-3 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Clear Override</div>
                    <div className="text-xs text-orange-500 dark:text-orange-300">Return to normal tier</div>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearningsDropdown;
