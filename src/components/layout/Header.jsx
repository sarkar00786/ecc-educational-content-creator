import React, { useState, useCallback, useRef } from 'react';
import UserProfileDropdown from './UserProfileDropdown';
// import UserAvatar from '../common/UserAvatar';
import { Brain, Mic, MicOff, Moon, Sun, ChevronDown, User, Shield } from 'lucide-react';
import { isSuperUser } from '../../config/adminConfig';
import MyLearningsDropdown from '../common/MyLearningsDropdown';

const Header = ({ 
  currentPage, 
  setCurrentPage, 
  currentSettingsPage,
  theme, 
  setTheme, 
  user,
  onLogout,
  onNavigateToSettings,
  // Voice control props
  isVoiceListening,
  onVoiceToggle,
  isVoiceSupported,
  voiceError,
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [adminMode, setAdminMode] = useState('Advanced'); // 'Advanced' or 'PRO'
  const profileButtonRef = useRef(null);
  const adminButtonRef = useRef(null);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const handleProfileClick = useCallback(() => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  }, [isProfileDropdownOpen]);

  const handleAdminClick = useCallback(() => {
    setIsAdminDropdownOpen(!isAdminDropdownOpen);
  }, [isAdminDropdownOpen]);

  const handleAdminModeChange = useCallback((mode) => {
    setAdminMode(mode);
    setIsAdminDropdownOpen(false);
    console.log(`Admin mode changed to: ${mode}`);
  }, []);

  const handleBrandingClick = useCallback(() => {
    // Navigate to Content Generation page when branding is clicked (Home functionality)
    setCurrentPage('generation');
    // Close profile dropdown if open
    setIsProfileDropdownOpen(false);
    console.log('Home/Branding clicked - navigating to Content Generation');
  }, [setCurrentPage]);

  const handleNavigationClick = useCallback((page) => {
    setCurrentPage(page);
    // Close profile dropdown if open
    setIsProfileDropdownOpen(false);
    console.log(`Navigating to ${page}`);
  }, [setCurrentPage]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
          {/* Left Side - Canva-like Branding */}
          <div 
            className="flex items-center cursor-pointer group transition-all duration-200 ease-in-out hover:scale-[1.02] outline-none focus:outline-none branding-button"
            onClick={handleBrandingClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleBrandingClick();
                e.target.blur(); // Remove focus after click
              }
            }}
            aria-label="ECC - Educational Content Creator - Home"
            style={{ outline: 'none' }}
          >
            <div className="flex items-center space-x-3">
              {/* Gradient Brain Icon Container */}
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-lg transition-all duration-200 transform group-hover:scale-[1.05]"
                     style={{
                       background: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(262, 83%, 58%) 100%)',
                       boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3), 0 4px 10px rgba(139, 92, 246, 0.2)'
                     }}>
                  <Brain size={28} className="text-white drop-shadow-sm" />
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 blur-lg scale-110 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
              </div>
              
              {/* Brand Text */}
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 leading-tight">
                  ECC
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase opacity-80">
                  Educational Content Creator
                </p>
              </div>
            </div>
          </div>

          {/* Center/Right - Navigation and Controls */}
          <div className="flex items-center space-x-4">
            {/* Navigation Buttons */}
            <nav className="flex items-center space-x-2" role="navigation" aria-label="Main navigation">
              {/* Combined Content Generation/History Toggle Button */}
              <button
                onClick={() => {
                  // Toggle between generation and history
                  const nextPage = currentPage === 'generation' ? 'history' : 'generation';
                  handleNavigationClick(nextPage);
                }}
                aria-current={(currentPage === 'generation' || currentPage === 'history') && !currentSettingsPage ? 'page' : undefined}
                aria-label={`Navigate to ${currentPage === 'generation' ? 'Content History' : 'Content Generation'}`}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  (currentPage === 'generation' || currentPage === 'history') && !currentSettingsPage
                    ? currentPage === 'generation'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105 focus:ring-purple-300'
                      : 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg transform scale-105 focus:ring-blue-300'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:from-blue-600 hover:to-purple-600 hover:shadow-lg hover:scale-105 focus:ring-purple-300'
                }`}
              >
                {/* Show the opposite page name to indicate where clicking will take you */}
                {currentPage === 'generation' ? 'Content History' : 'Content Generation'}
              </button>
              
            </nav>

{/* Voice Control Toggle */}
            {isVoiceSupported && (
              <div className="relative">
                <button
                  onClick={onVoiceToggle}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    isVoiceListening
                      ? 'pro-gradient-primary text-white shadow-lg transform scale-105 ring-2 ring-violet-400/50 focus:ring-violet-300'
                      : 'pro-gradient-secondary text-white shadow-md hover:shadow-lg hover:scale-105 ring-1 ring-violet-400/30 focus:ring-violet-300'
                  }`}
                  aria-label={isVoiceListening ? 'Stop voice control' : 'Start voice control'}
                  title={voiceError || (isVoiceListening ? 'Listening... Click to stop' : 'Click to start voice control')}
                >
                  {isVoiceListening ? (
                    <Mic className="w-4 h-4" />
                  ) : (
                    <MicOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}


            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md hover:from-gray-600 hover:to-gray-700 hover:shadow-lg hover:scale-105 focus:ring-gray-300"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              role="switch"
              aria-checked={theme === 'dark'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>

            {/* My Learnings Dropdown for All Users */}
            <MyLearningsDropdown
              onTierChange={(newTier) => {
                console.log(`Learning experience changed to: ${newTier}`);
              }}
              onNavigateToPurchase={() => {
                setCurrentPage('purchase');
              }}
            />

            {/* Admin Badge with Dropdown */}
            {user?.email && isSuperUser(user.email) && (
              <div className="relative">
                <button
                  ref={adminButtonRef}
                  onClick={handleAdminClick}
                  aria-haspopup="menu"
                  aria-expanded={isAdminDropdownOpen}
                  aria-label="Admin mode selector"
                  className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-full shadow-md hover:from-red-600 hover:to-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Admin Mode Dropdown */}
                {isAdminDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide border-b border-gray-200 dark:border-gray-700">
                        Admin Mode
                      </div>
                      <button
                        onClick={() => handleAdminModeChange('Advanced')}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors duration-200 flex items-center space-x-2 ${
                          adminMode === 'Advanced'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          adminMode === 'Advanced' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                        <div>
                          <div className="font-medium">Advanced</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Non-pro user access</div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleAdminModeChange('PRO')}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors duration-200 flex items-center space-x-2 ${
                          adminMode === 'PRO'
                            ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          adminMode === 'PRO' ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                        <div>
                          <div className="font-medium flex items-center space-x-1">
                            <span>PRO</span>
                            <span className="text-xs pro-gradient-primary text-white px-1 py-0.5 rounded text-[10px] font-bold">PRO</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Full pro features access</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile */}
            <div className="relative">
              <button
                ref={profileButtonRef}
                onClick={handleProfileClick}
                aria-haspopup="menu"
                aria-expanded={isProfileDropdownOpen}
                aria-label="User menu"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <UserProfileDropdown
                  user={user}
                  onNavigateToSettings={onNavigateToSettings}
                  onLogout={onLogout}
                  onClose={() => setIsProfileDropdownOpen(false)}
                  triggerRef={profileButtonRef}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
