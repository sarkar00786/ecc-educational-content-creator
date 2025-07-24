import React, { useState } from 'react';
import SettingsPanel from './SettingsPanel';
import {
  Box,
  Flex,
  Heading,
  Button,
  Avatar,
  Text,
  Badge,
  IconButton,
  HStack,
  VStack,
  Tooltip,
  Progress,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Divider,
  Portal
} from '@chakra-ui/react';
// import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  LogOut,
  Settings,
  Bell,
  Search,
  Sparkles,
  Zap,
  Brain,
  Activity,
  CheckCircle,
  Loader2,
  Sun,
  Moon,
  Palette,
  Monitor
} from 'lucide-react';

const ModernHeader = ({ 
  user, 
  onLogout, 
  contentHistory, 
  progress = { stage: 'idle', value: 0 },
  onProfileClick,
  onPreferencesClick 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ecc-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('ecc-theme', newTheme ? 'dark' : 'light');
    document.documentElement.className = newTheme ? 'dark' : 'light';
  };

  const glassEffect = {
    backdropFilter: 'blur(20px)',
    background: isDark 
      ? 'rgba(17, 24, 39, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)',
    border: `1px solid ${isDark 
      ? 'rgba(59, 130, 246, 0.2)' 
      : 'rgba(59, 130, 246, 0.1)'}`,
    boxShadow: isDark
      ? '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 2px 16px 0 rgba(59, 130, 246, 0.1)'
      : '0 8px 32px 0 rgba(59, 130, 246, 0.1), 0 2px 16px 0 rgba(139, 92, 246, 0.08)',
    color: isDark ? '#f3f4f6' : '#111827',
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    alert("🔔 Notifications: No new notifications");
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      alert('👤 Profile Settings: Feature coming soon!');
    }
  };

  const handlePreferencesClick = () => {
    if (onPreferencesClick) {
      onPreferencesClick();
    } else {
      setIsSettingsOpen(true);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      alert('Logout functionality is not implemented yet.');
    }
  };

  // Helper function to get stage text
  const getStageText = (stage) => {
    switch (stage) {
      case 'prep':
        return 'Preparing…';
      case 'processing':
        return 'AI Thinking…';
      case 'handling':
        return 'Finalizing…';
      case 'complete':
        return 'Done!';
      default:
        return 'AI Creating...';
    }
  };

  // Helper function to get stage colors and icons
  const getStageStyle = (stage) => {
    switch (stage) {
      case 'prep':
        return {
          bg: 'blue.500',
          icon: Loader2,
          color: 'white'
        };
      case 'processing':
        return {
          bg: 'purple.500',
          icon: Sparkles,
          color: 'white'
        };
      case 'handling':
        return {
          bg: 'orange.500',
          icon: Zap,
          color: 'white'
        };
      case 'complete':
        return {
          bg: 'green.500',
          icon: CheckCircle,
          color: 'white'
        };
      default:
        return {
          bg: 'purple.500',
          icon: Sparkles,
          color: 'white'
        };
    }
  };

  // Check if we should show progress UI
  const isGenerating = progress.stage !== 'idle' && progress.stage !== 'complete';
  const shouldShowProgress = progress.stage !== 'idle';

  return (
    <Box
      position="sticky"
      top="0"
      zIndex="1000"
      w="full"
      py={4}
      px={6}
      style={glassEffect}
    >
      <Flex justify="space-between" align="center" maxW="8xl" mx="auto">
        {/* Left Section - Logo & Brand */}
        <div>
          <Flex align="center" gap={3}>
            <Box
              p={2}
              bg="linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(262, 83%, 58%) 100%)"
              rounded="xl"
              shadow="lg"
              _hover={{
                transform: 'scale(1.05)',
                transition: 'all 0.2s'
              }}
            >
              <Brain size={24} color="white" />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading
                size="lg"
                bgGradient="linear(to-r, blue.600, purple.600)"
                bgClip="text"
                fontWeight="bold"
              >
                ECC Studio
              </Heading>
              <Text fontSize="xs" color={isDark ? "gray.600" : "gray.700"} fontWeight="medium">
                AI-Powered Education
              </Text>
            </VStack>
          </Flex>
        </div>

        {/* Center Section - Search & AI Status */}
        <div>
          <HStack spacing={4}>
            {/* AI Generation Status */}
            {shouldShowProgress && (
              <div>
                  <Box
                    bg={getStageStyle(progress.stage).bg}
                    color={getStageStyle(progress.stage).color}
                    px={4}
                    py={2}
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <div>
                      {React.createElement(getStageStyle(progress.stage).icon, { size: 16 })}
                    </div>
                    <Text fontSize="sm" fontWeight="medium">
                      {getStageText(progress.stage)}
                    </Text>
                    <Text fontSize="xs" opacity={0.8}>
                      {Math.round(progress.value)}%
                    </Text>
                  </Box>
              </div>
            )}

            {/* Quick Stats */}
            <HStack spacing={2}>
              <Badge
                colorScheme="blue"
                variant="subtle"
                px={3}
                py={1}
                rounded="full"
                fontSize="xs"
              >
                <Activity size={12} style={{ marginRight: '4px' }} />
                {contentHistory.length} Content
              </Badge>
              <Badge
                colorScheme="green"
                variant="subtle"
                px={3}
                py={1}
                rounded="full"
                fontSize="xs"
              >
                <Zap size={12} style={{ marginRight: '4px' }} />
                Pro Active
              </Badge>
            </HStack>
          </HStack>
        </div>

        {/* Right Section - User Actions */}
        <div>
          <HStack spacing={3}>
            {/* Search Button */}
            <Tooltip label="Search Content" hasArrow>
              <IconButton
                icon={<Search size={18} />}
                variant="ghost"
                color={isDark ? "gray.400" : "gray.600"}
                _hover={{ color: 'blue.400', bg: 'blue.50' }}
                rounded="full"
                size="sm"
              />
            </Tooltip>

            {/* Theme Toggle */}
            <Tooltip label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`} hasArrow>
              <IconButton
                icon={isDark ? <Sun size={18} /> : <Moon size={18} />}
                variant="ghost"
                color={isDark ? 'gray.300' : 'gray.600'}
                _hover={{ 
                  color: isDark ? 'yellow.400' : 'purple.400', 
                  bg: isDark ? 'gray.700' : 'purple.50',
                  transform: 'scale(1.1) rotate(12deg)'
                }}
                rounded="full"
                size="sm"
                onClick={toggleTheme}
                transition="all 0.2s"
              />
            </Tooltip>

            {/* Notifications */}
            <Tooltip label="Notifications" hasArrow>
              <IconButton
                icon={<Bell size={18} />}
                variant="ghost"
                color={isDark ? 'gray.300' : 'gray.600'}
                _hover={{ 
                  color: isDark ? 'blue.300' : 'blue.400', 
                  bg: isDark ? 'gray.700' : 'blue.50' 
                }}
                rounded="full"
                size="sm"
                onClick={handleNotificationClick}
              />
            </Tooltip>

            {/* User Menu */}
            <Popover placement="bottom-end" closeOnBlur={true}>
              <PopoverTrigger>
                <Button
                  rounded="full"
                  variant="ghost"
                  cursor="pointer"
                  _hover={{ bg: isDark ? 'gray.700' : 'blue.50' }}
                  p={1}
                >
                  <HStack spacing={2}>
                    <Avatar
                      size="sm"
                      name={user?.displayName || user?.email || 'User'}
                      src={user?.photoURL}
                      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    />
                    <VStack align="start" spacing={0} display={{ base: 'none', md: 'flex' }}>
                      <Text fontSize="sm" fontWeight="medium" color={isDark ? "gray.200" : "gray.900"}>
                        {user?.displayName || 'User'}
                      </Text>
                      <Text fontSize="xs" color={isDark ? "gray.400" : "gray.700"}>
                        {user?.email || 'guest@ecc.app'}
                      </Text>
                    </VStack>
                  </HStack>
                </Button>
              </PopoverTrigger>
              <Portal>
                <PopoverContent
                bg={isDark ? "gray.800" : "white"}
                color={isDark ? "gray.100" : "gray.900"}
                border="2px solid"
                borderColor={isDark ? "gray.600" : "gray.300"}
                shadow="none"
                rounded="xl"
                p={2}
                w="220px"
                zIndex={99999}
                _focus={{ boxShadow: "none" }}
                position="fixed"
                pointerEvents="auto"
                isolation="isolate"
                opacity={1}
                backdropFilter="none"
                boxShadow={isDark 
                  ? "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 10px 20px -5px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.1)"
                  : "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 10px 20px -5px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(0, 0, 0, 0.1)"}
              >
                <PopoverArrow />
                <PopoverBody p={0}>
                  <VStack spacing={1} align="stretch">
                    <Button
                      leftIcon={<User size={16} />}
                      variant="ghost"
                      justifyContent="flex-start"
                      rounded="md"
                      _hover={{ bg: isDark ? 'gray.700' : 'blue.50', opacity: 1 }}
                      onClick={handleProfileClick}
                      size="sm"
                      w="full"
                      color={isDark ? "gray.100" : "gray.900"}
                      pointerEvents="auto"
                      zIndex={1}
                      opacity={1}
                      bg={isDark ? 'gray.800' : 'white'}
                    >
                      Profile
                    </Button>
                    <Button
                      leftIcon={<Settings size={16} />}
                      variant="ghost"
                      justifyContent="flex-start"
                      rounded="md"
                      _hover={{ bg: isDark ? 'gray.700' : 'blue.50', opacity: 1 }}
                      onClick={handlePreferencesClick}
                      size="sm"
                      w="full"
                      color={isDark ? "gray.100" : "gray.900"}
                      pointerEvents="auto"
                      zIndex={1}
                      opacity={1}
                      bg={isDark ? 'gray.800' : 'white'}
                    >
                      Settings
                    </Button>
                    <Divider my={1} borderColor={isDark ? "gray.700" : "gray.200"} />
                    <Button
                      leftIcon={<LogOut size={16} />}
                      variant="ghost"
                      justifyContent="flex-start"
                      rounded="md"
                      _hover={{ bg: isDark ? 'red.900' : 'red.50', opacity: 1 }}
                      onClick={handleLogout}
                      size="sm"
                      w="full"
                      color={isDark ? "red.400" : "red.500"}
                      pointerEvents="auto"
                      zIndex={1}
                      opacity={1}
                      bg={isDark ? 'gray.800' : 'white'}
                    >
                      Sign out
                    </Button>
                  </VStack>
                </PopoverBody>
              </PopoverContent>
              </Portal>
            </Popover>
          </HStack>
        </div>
      </Flex>

      {/* Generation Progress Bar */}
      {shouldShowProgress && (
        <div>
            <Box mt={4}>
              <Progress
                value={progress.value}
                colorScheme={progress.stage === 'prep' ? 'blue' : 
                            progress.stage === 'processing' ? 'purple' : 
                            progress.stage === 'handling' ? 'orange' : 
                            progress.stage === 'complete' ? 'green' : 'purple'}
                size="sm"
                rounded="full"
                bg="gray.200"
                isAnimated
                hasStripe={isGenerating}
              />
              <Text fontSize="xs" color={`${progress.stage === 'prep' ? 'blue' : 
                                         progress.stage === 'processing' ? 'purple' : 
                                         progress.stage === 'handling' ? 'orange' : 
                                         progress.stage === 'complete' ? 'green' : 'purple'}.600`} mt={2} textAlign="center">
                🤖 {getStageText(progress.stage)} {Math.round(progress.value)}%
              </Text>
            </Box>
        </div>
      )}
      
      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </Box>
  );
};

export default ModernHeader;
