import React, { useState } from 'react';
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
  Divider
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  LogOut,
  Settings,
  Bell,
  Search,
  Sparkles,
  Zap,
  Brain,
  Activity
} from 'lucide-react';

const ModernHeader = ({ 
  user, 
  onLogout, 
  contentHistory, 
  isGenerating = false,
  generationProgress = 0,
  onProfileClick,
  onPreferencesClick 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const glassEffect = {
    backdropFilter: 'blur(20px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
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
      alert('⚙️ Preferences: Feature coming soon!');
    }
  };

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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex align="center" gap={3}>
            <Box
              p={2}
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              rounded="xl"
              shadow="lg"
            >
              <Brain size={24} color="white" />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading
                size="lg"
                color="blue.600"
                fontWeight="bold"
              >
                ECC Studio
              </Heading>
              <Text fontSize="xs" color="gray.400">
                AI-Powered Education
              </Text>
            </VStack>
          </Flex>
        </motion.div>

        {/* Center Section - Search & AI Status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <HStack spacing={4}>
            {/* AI Generation Status */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    bg="purple.500"
                    color="white"
                    px={4}
                    py={2}
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles size={16} />
                    </motion.div>
                    <Text fontSize="sm" fontWeight="medium">
                      AI Creating...
                    </Text>
                    <Text fontSize="xs" opacity={0.8}>
                      {Math.round(generationProgress)}%
                    </Text>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

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
        </motion.div>

        {/* Right Section - User Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <HStack spacing={3}>
            {/* Search Button */}
            <Tooltip label="Search Content" hasArrow>
              <IconButton
                icon={<Search size={18} />}
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'blue.400', bg: 'blue.50' }}
                rounded="full"
                size="sm"
              />
            </Tooltip>

            {/* Notifications */}
            <Tooltip label="Notifications" hasArrow>
              <IconButton
                icon={<Bell size={18} />}
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'blue.400', bg: 'blue.50' }}
                rounded="full"
                size="sm"
                onClick={handleNotificationClick}
              />
            </Tooltip>

            {/* User Menu */}
            <Popover>
              <PopoverTrigger>
                <Button
                  rounded="full"
                  variant="ghost"
                  cursor="pointer"
                  _hover={{ bg: 'blue.50' }}
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
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        {user?.displayName || 'User'}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {user?.email || 'guest@ecc.app'}
                      </Text>
                    </VStack>
                  </HStack>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                shadow="xl"
                rounded="xl"
                p={2}
                w="200px"
              >
                <PopoverArrow />
                <PopoverBody p={0}>
                  <VStack spacing={1} align="stretch">
                    <Button
                      leftIcon={<User size={16} />}
                      variant="ghost"
                      justifyContent="flex-start"
                      rounded="md"
                      _hover={{ bg: 'blue.50' }}
                      onClick={handleProfileClick}
                      size="sm"
                      color="gray.700"
                    >
                      Profile Settings
                    </Button>
                    <Button
                      leftIcon={<Settings size={16} />}
                      variant="ghost"
                      justifyContent="flex-start"
                      rounded="md"
                      _hover={{ bg: 'blue.50' }}
                      onClick={handlePreferencesClick}
                      size="sm"
                      color="gray.700"
                    >
                      Preferences
                    </Button>
                    <Divider />
                    <Button
                      leftIcon={<LogOut size={16} />}
                      variant="ghost"
                      justifyContent="flex-start"
                      rounded="md"
                      _hover={{ bg: 'red.50', color: 'red.600' }}
                      onClick={onLogout}
                      size="sm"
                      color="gray.700"
                    >
                      Sign Out
                    </Button>
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </HStack>
        </motion.div>
      </Flex>

      {/* Generation Progress Bar */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box mt={4}>
              <Progress
                value={generationProgress}
                colorScheme="purple"
                size="sm"
                rounded="full"
                bg="gray.200"
                isAnimated
                hasStripe
              />
              <Text fontSize="xs" color="purple.600" mt={2} textAlign="center">
                🤖 AI is thinking... {Math.round(generationProgress)}%
              </Text>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default ModernHeader;
