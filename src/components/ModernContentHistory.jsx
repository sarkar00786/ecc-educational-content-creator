import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  IconButton,
  Flex,
  Grid,
  GridItem,
  InputGroup,
  InputLeftElement,
  Select,
  Tooltip,
  Avatar,
  AvatarGroup,
  Skeleton,
  SkeletonText,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useToast,
  Checkbox,
  Progress,
  Portal,
  useBreakpointValue
} from '@chakra-ui/react';
import { VariableSizeGrid as VirtualGrid } from 'react-window';
import { Divider } from '@chakra-ui/layout';
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit3,
  Share2,
  Download,
  Trash2,
  Calendar,
  Clock,
  FileText,
  Users,
  MapPin,
  Zap,
  BookOpen,
  Star,
  Copy,
  ExternalLink,
  Grid3x3,
  Grid2x2,
  List,
  CheckSquare,
  Square,
  X
} from 'lucide-react';

const ModernContentHistory = ({
  contentHistory,
  onLoadHistoryItem,
  onDeleteHistoryItem,
  searchTerm,
  setSearchTerm,
  isLoading = false,
  db,
  auth,
  appId,
  user
}) => {
  const defaultDensity = useBreakpointValue({ base: 'list', md: 'large' });
  const [viewDensity, setViewDensity] = useState(defaultDensity); // 'small', 'large', or 'list'
  
  // Theme state to match app theme
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ecc-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Listen for theme changes - optimized
  React.useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'ecc-theme') {
        setIsDark(e.newValue === 'dark');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for direct theme changes from settings with throttling
    let timeoutId;
    const observer = new MutationObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const className = document.documentElement.className;
        setIsDark(className === 'dark');
      }, 100); // Throttle to prevent excessive updates
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState(0);
  const cancelRef = useRef();
  const toast = useToast();

  // Filter and sort logic - memoized to prevent constant re-rendering
  const filteredAndSortedHistory = useMemo(() => {
    return contentHistory
      .filter(item => {
        const matchesSearch = 
          (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.generatedContent && item.generatedContent.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.audienceClass && item.audienceClass.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesFilter = filterBy === 'all' || item.controlTier === filterBy;
        
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0);
          case 'oldest':
            return (a.timestamp?.toDate() || 0) - (b.timestamp?.toDate() || 0);
          case 'name':
            return (a.name || '').localeCompare(b.name || '');
          default:
            return 0;
        }
      });
  }, [contentHistory, searchTerm, filterBy, sortBy]);

  // Handle opening delete confirmation dialog
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteAlertOpen(true);
  };

  // Handle confirmed deletion
  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !user || !db) {
      toast({
        title: "Error",
        description: "Unable to delete item. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      // Delete the document from Firestore
      await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/generatedContent`, itemToDelete.id));
      
      // Show success toast
      toast({
        title: "Content deleted",
        description: "The content has been permanently deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Close the dialog
      setIsDeleteAlertOpen(false);
      setItemToDelete(null);
      
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Delete failed",
        description: error.message || "An error occurred while deleting the content.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle canceling deletion
  const handleDeleteCancel = () => {
    setIsDeleteAlertOpen(false);
    setItemToDelete(null);
  };

  // Handle keyboard shortcuts for delete dialog
  const handleDeleteKeyDown = (e) => {
    if (e.key === 'Enter' && !isDeleting) {
      handleDeleteConfirm();
    } else if (e.key === 'Escape') {
      handleDeleteCancel();
    }
  };

  // Handle bulk selection - memoized
  const handleSelectItem = useCallback((itemId, isSelected) => {
    setSelectedIds(prev => {
      if (isSelected) {
        return [...prev, itemId];
      } else {
        return prev.filter(id => id !== itemId);
      }
    });
  }, []);

  // Handle select all - memoized
  const handleSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      setSelectedIds(filteredAndSortedHistory.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  }, [filteredAndSortedHistory]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setIsBulkDeleting(true);
    setBulkDeleteProgress(0);
    
    const errors = [];
    const total = selectedIds.length;
    
    try {
      // Delete items one by one to show progress
      for (let i = 0; i < selectedIds.length; i++) {
        const itemId = selectedIds[i];
        try {
          await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/generatedContent`, itemId));
          setBulkDeleteProgress(((i + 1) / total) * 100);
        } catch (error) {
          console.error(`Error deleting item ${itemId}:`, error);
          errors.push({ id: itemId, error: error.message });
        }
      }
      
      // Show result toast
      if (errors.length === 0) {
        toast({
          title: "Bulk delete successful",
          description: `Successfully deleted ${selectedIds.length} item${selectedIds.length === 1 ? '' : 's'}.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Bulk delete completed with errors",
          description: `${total - errors.length} items deleted successfully. ${errors.length} items failed to delete.`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Clear selection
      setSelectedIds([]);
      setIsBulkMode(false);
      
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({
        title: "Bulk delete failed",
        description: "An error occurred during bulk deletion.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsBulkDeleting(false);
      setBulkDeleteProgress(0);
    }
  };

  // Handle bulk export
  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    
    const selectedItems = contentHistory.filter(item => selectedIds.includes(item.id));
    const exportData = selectedItems.map(item => ({
      name: item.name,
      content: item.generatedContent,
      audience: {
        class: item.audienceClass,
        age: item.audienceAge,
        region: item.audienceRegion
      },
      tier: item.controlTier,
      timestamp: item.timestamp?.toDate()?.toISOString(),
      quizzes: item.quizzes
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `content-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Export successful",
      description: `Exported ${selectedIds.length} item${selectedIds.length === 1 ? '' : 's'} to JSON file.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle bulk share
  const handleBulkShare = () => {
    if (selectedIds.length === 0) return;
    
    // For now, just show a placeholder
    toast({
      title: "Share feature",
      description: "Bulk sharing feature will be implemented soon!",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // Toggle bulk mode - memoized
  const toggleBulkMode = useCallback(() => {
    setIsBulkMode(prev => {
      if (!prev) {
        setSelectedIds([]);
      }
      return !prev;
    });
  }, []);

  const handleItemAction = useCallback((action, item) => {
    switch (action) {
      case 'view':
        onLoadHistoryItem(item);
        break;
      case 'copy':
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(item.generatedContent)
            .then(() => alert("Content copied to clipboard!"))
            .catch(() => {
              // Fallback for older browsers
              const textarea = document.createElement('textarea');
              textarea.value = item.generatedContent;
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
              alert("Content copied!");
            });
        } else {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = item.generatedContent;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          alert("Content copied!");
        }
        break;
      case 'share':
        // Share functionality
        alert("Share feature coming soon!");
        break;
      case 'delete':
        handleDeleteClick(item);
        break;
      default:
        break;
    }
  }, [onLoadHistoryItem, handleDeleteClick]);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'basic':
        return 'blue';
      case 'advanced':
        return 'purple';
      case 'pro':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Memoized HistoryItemCard component
  const HistoryItemCard = React.memo(({ item, index, density, isVirtualized = false }) => {
    const isSmall = density === 'small';
    const isLarge = density === 'large';
    const isList = density === 'list';
    const isSelected = selectedIds.includes(item.id);
    const [isHovered, setIsHovered] = useState(false);
    
    // Enhanced card styling with better visual hierarchy
    const getCardBackground = () => {
      if (isSelected) {
        return isDark 
          ? "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)"
          : "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)";
      }
      return isDark 
        ? "rgba(31, 41, 55, 0.95)"
        : "rgba(255, 255, 255, 0.95)";
    };
    
    const getBorderColor = () => {
      if (isSelected) return "blue.400";
      if (isHovered) return isDark ? "purple.400" : "purple.300";
      return isDark ? "gray.600" : "gray.200";
    };
    
    const getShadow = () => {
      if (isSelected) {
        return isDark
          ? "0 8px 25px rgba(59, 130, 246, 0.25), 0 4px 12px rgba(139, 92, 246, 0.15)"
          : "0 8px 25px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(139, 92, 246, 0.1)";
      }
      if (isHovered) {
        return isDark
          ? "0 12px 28px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)"
          : "0 12px 28px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)";
      }
      return isDark
        ? "0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)"
        : "0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)";
    };

    return (
      <motion.div
        initial={!isVirtualized ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={!isVirtualized ? { opacity: 0, y: -20, scale: 0.9 } : { opacity: 1, y: 0 }}
        transition={!isVirtualized ? { duration: 0.3, delay: index * 0.1 } : { duration: 0.2 }}
        whileHover={{ y: !isList ? -4 : 0 }}
        layout={false}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          bg={getCardBackground()}
          boxShadow={getShadow()}
          rounded="2xl"
          border="2px solid"
          borderColor={getBorderColor()}
          cursor="pointer"
          onClick={() => onLoadHistoryItem(item)}
          _hover={{
            transform: !isList ? "translateY(-6px) scale(1.02)" : "translateY(-2px)",
            borderColor: isSelected ? "blue.400" : "purple.400",
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          position="relative"
          overflow="hidden"
          direction={isList ? 'row' : 'column'}
          height={isSmall ? "220px" : "auto"}
          backdropFilter="blur(20px)"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isSelected 
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(139, 92, 246, 0.01) 100%)'
              : 'transparent',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          {/* Checkbox - visible on hover or when bulk mode is active */}
          {(isHovered || isBulkMode || isSelected) && (
            <Box
              position="absolute"
              top="8px"
              left="8px"
              zIndex="2"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                isChecked={isSelected}
                onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                size="md"
                colorScheme="blue"
                bg="white"
                borderRadius="md"
                boxShadow="sm"
              />
            </Box>
          )}
          {/* Tier Color Bar */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="4px"
            bg={`${getTierColor(item.controlTier)}.500`}
          />

          {isList ? (
            // List View Layout
            <CardBody p={4}>
              <HStack spacing={4} align="center">
                <VStack align="start" spacing={1} flex="1">
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color={isDark ? "gray.100" : "gray.800"}
                    noOfLines={1}
                  >
                    {item.name || `Content - ${formatDate(item.timestamp)}`}
                  </Text>
                  <HStack spacing={4}>
                    <HStack spacing={1}>
                      <Users size={12} color="gray" />
                      <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>
                        {item.audienceClass}
                      </Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Clock size={12} color="gray" />
                      <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>
                        {item.audienceAge}
                      </Text>
                    </HStack>
                    <HStack spacing={1}>
                      <MapPin size={12} color="gray" />
                      <Text fontSize="xs" color={isDark ? "gray.400" : "gray.600"}>
                        {item.audienceRegion}
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
                
                <VStack align="end" spacing={2}>
                  <HStack spacing={2}>
                    <Badge
                      colorScheme={getTierColor(item.controlTier)}
                      size="sm"
                      rounded="full"
                    >
                      {item.controlTier}
                    </Badge>
                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                      {formatDate(item.timestamp)}
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                      {item.generatedContent?.length || 0} chars
                    </Text>
                    {item.quizzes && item.quizzes.length > 0 && (
                      <Text fontSize="xs" color="orange.600">
                        {item.quizzes.length} quiz
                      </Text>
                    )}
                  </HStack>
                </VStack>
                
                <HStack spacing={1}>
                  <Tooltip label="View & Edit">
                    <IconButton
                      icon={<Eye size={16} />}
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemAction('view', item);
                      }}
                      _hover={{ bg: 'blue.50', color: 'blue.600' }}
                      aria-label="View and edit content"
                    />
                  </Tooltip>
                  <Tooltip label="Copy Content">
                    <IconButton
                      icon={<Copy size={16} />}
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemAction('copy', item);
                      }}
                      _hover={{ bg: 'gray.50' }}
                      aria-label="Copy content to clipboard"
                    />
                  </Tooltip>
                  <Tooltip label="Delete">
                    <IconButton
                      icon={<Trash2 size={16} />}
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemAction('delete', item);
                      }}
                      _hover={{ bg: 'red.50', color: 'red.600' }}
                      aria-label="Delete content"
                    />
                  </Tooltip>
                </HStack>
              </HStack>
            </CardBody>
          ) : (
            // Grid View Layout (Small or Large)
            <>
              <CardHeader pb={isSmall ? 2 : 3}>
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1} flex="1">
                    <Text
                      fontSize={isSmall ? "xs" : "sm"}
                      fontWeight="semibold"
                      color={isDark ? "gray.100" : "gray.800"}
                      noOfLines={isSmall ? 1 : 2}
                      lineHeight="1.3"
                    >
                      {item.name || `Content - ${formatDate(item.timestamp)}`}
                    </Text>
                    <HStack spacing={2}>
                      <Badge
                        colorScheme={getTierColor(item.controlTier)}
                        size={isSmall ? "xs" : "sm"}
                        rounded="full"
                      >
                        {item.controlTier}
                      </Badge>
                      <Text fontSize={isSmall ? "2xs" : "2xs"} color={isDark ? "gray.400" : "gray.500"}>
                        <Calendar size={isSmall ? 8 : 10} style={{ display: 'inline', marginRight: '2px' }} />
                        {formatDate(item.timestamp)}
                      </Text>
                    </HStack>
                  </VStack>
                  
                  <Popover>
                    <PopoverTrigger>
                      <IconButton
                        icon={<MoreVertical size={16} />}
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        color="gray.600"
                        _hover={{ bg: 'gray.100', color: 'gray.800' }}
                        aria-label="More options"
                      />
                    </PopoverTrigger>
                    <PopoverContent w="160px">
                      <PopoverArrow />
                      <PopoverBody p={1}>
                        <VStack spacing={1} align="stretch">
                          <Button
                            leftIcon={<Eye size={16} />}
                            variant="ghost"
                            justifyContent="flex-start"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemAction('view', item);
                            }}
                          >
                            View & Edit
                          </Button>
                          <Button
                            leftIcon={<Copy size={16} />}
                            variant="ghost"
                            justifyContent="flex-start"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemAction('copy', item);
                            }}
                          >
                            Copy Content
                          </Button>
                          <Button
                            leftIcon={<Share2 size={16} />}
                            variant="ghost"
                            justifyContent="flex-start"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemAction('share', item);
                            }}
                          >
                            Share
                          </Button>
                          <Divider />
                          <Button
                            leftIcon={<Trash2 size={16} />}
                            color="red.600"
                            variant="ghost"
                            justifyContent="flex-start"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemAction('delete', item);
                            }}
                          >
                            Delete
                          </Button>
                        </VStack>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </CardHeader>
              
              <CardBody pt={0}>
                <VStack align="start" spacing={isSmall ? 2 : 3}>
                  {/* Audience Info */}
                  <HStack spacing={2} flexWrap="wrap">
                    <HStack spacing={1}>
                      <Users size={isSmall ? 10 : 12} color="gray" />
                      <Text fontSize={isSmall ? "2xs" : "2xs"} color={isDark ? "gray.400" : "gray.600"}>
                        {item.audienceClass}
                      </Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Clock size={isSmall ? 10 : 12} color="gray" />
                      <Text fontSize={isSmall ? "2xs" : "2xs"} color={isDark ? "gray.400" : "gray.600"}>
                        {item.audienceAge}
                      </Text>
                    </HStack>
                    <HStack spacing={1}>
                      <MapPin size={isSmall ? 10 : 12} color="gray" />
                      <Text fontSize={isSmall ? "2xs" : "2xs"} color={isDark ? "gray.400" : "gray.600"}>
                        {item.audienceRegion}
                      </Text>
                    </HStack>
                  </HStack>

                  {/* Content Preview */}
                  {(isLarge || !isSmall) && (
                    <Box>
                      <Text
                        fontSize={isSmall ? "2xs" : "xs"}
                        color={isDark ? "gray.400" : "gray.600"}
                        noOfLines={isSmall ? 2 : 3}
                        lineHeight="1.4"
                      >
                        {item.generatedContent?.substring(0, isSmall ? 80 : 150)}...
                      </Text>
                    </Box>
                  )}

                  {/* Stats */}
                  <HStack justify="space-between" w="full" pt={isSmall ? 1 : 2}>
                    <HStack spacing={isSmall ? 2 : 3}>
                      <HStack spacing={1}>
                        <FileText size={isSmall ? 10 : 12} color="gray" />
                        <Text fontSize={isSmall ? "2xs" : "2xs"} color={isDark ? "gray.400" : "gray.500"}>
                          {item.generatedContent?.length || 0} chars
                        </Text>
                      </HStack>
                      {item.quizzes && item.quizzes.length > 0 && (
                        <HStack spacing={1}>
                          <BookOpen size={isSmall ? 10 : 12} color="orange" />
                          <Text fontSize={isSmall ? "2xs" : "2xs"} color="orange.600">
                            {item.quizzes.length} quiz
                          </Text>
                        </HStack>
                      )}
                    </HStack>
                    <Button
                      size={isSmall ? "xs" : "xs"}
                      variant="ghost"
                      colorScheme="blue"
                      fontSize={isSmall ? "2xs" : "xs"}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadHistoryItem(item);
                      }}
                      rightIcon={<ExternalLink size={isSmall ? 10 : 12} />}
                    >
                      Open
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </>
          )}
        </Card>
      </motion.div>
    );
  });

  // Virtual grid configuration
  const LARGE_HISTORY_THRESHOLD = 50;
  const shouldUseVirtualGrid = useMemo(() => {
    return filteredAndSortedHistory.length > LARGE_HISTORY_THRESHOLD;
  }, [filteredAndSortedHistory.length]);

  // Calculate grid dimensions for virtual grid
  const getGridDimensions = useCallback(() => {
    if (viewDensity === 'list') {
      return { columnCount: 1, rowCount: filteredAndSortedHistory.length };
    }
    
    // Get container width from window or use default
    const containerWidth = typeof window !== 'undefined' ? 
      Math.min(window.innerWidth - 100, 1200) : 1200;
    const cardWidth = viewDensity === 'small' ? 180 : 350;
    const gap = 16;
    const columnCount = Math.max(1, Math.floor((containerWidth + gap) / (cardWidth + gap)));
    const rowCount = Math.ceil(filteredAndSortedHistory.length / columnCount);
    
    return { columnCount, rowCount };
  }, [viewDensity, filteredAndSortedHistory.length]);

  // Get item size for virtual grid
  const getItemSize = useCallback((index, isColumn = false) => {
    if (viewDensity === 'list') {
      const containerWidth = typeof window !== 'undefined' ? 
        Math.min(window.innerWidth - 100, 1200) : 1200;
      return isColumn ? containerWidth : 120; // Full width for list, fixed height
    }
    
    const cardWidth = viewDensity === 'small' ? 180 : 350;
    const cardHeight = viewDensity === 'small' ? 220 : 320;
    
    return isColumn ? cardWidth + 16 : cardHeight + 16; // Add gap
  }, [viewDensity]);

  // Virtual grid item renderer
  const VirtualGridItem = useCallback(({ columnIndex, rowIndex, style, data }) => {
    const { columnCount } = getGridDimensions();
    const itemIndex = rowIndex * columnCount + columnIndex;
    const item = data[itemIndex];
    
    if (!item) return <div style={style} />;
    
    return (
      <div style={style}>
        <Box p={2} h="full">
          <HistoryItemCard 
            item={item} 
            index={itemIndex} 
            density={viewDensity} 
            isVirtualized={true}
          />
        </Box>
      </div>
    );
  }, [getGridDimensions, viewDensity, HistoryItemCard]);

  // Virtual list item renderer (for list view)
  const VirtualListItem = useCallback(({ index, style, data }) => {
    const item = data[index];
    
    if (!item) return <div style={style} />;
    
    return (
      <div style={style}>
        <Box p={2} h="full">
          <HistoryItemCard 
            item={item} 
            index={index} 
            density={viewDensity} 
            isVirtualized={true}
          />
        </Box>
      </div>
    );
  }, [viewDensity, HistoryItemCard]);


  if (isLoading) {
    return (
      <Box>
        <VStack spacing={4}>
          {[...Array(6)].map((_, i) => (
            <Card key={i} p={4} w="full">
              <Skeleton height="20px" mb={2} />
              <SkeletonText mt={2} noOfLines={3} spacing={2} />
            </Card>
          ))}
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <VStack spacing={4} mb={6}>
        <HStack justify="space-between" w="full">
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="bold" color={isDark ? "gray.100" : "gray.800"}>
              Content History
            </Text>
            <Text fontSize="sm" color={isDark ? "gray.300" : "gray.600"}>
              {contentHistory.length} items • {filteredAndSortedHistory.length} shown
              {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
              {shouldUseVirtualGrid && (
                <Badge ml={2} colorScheme="green" size="sm">
                  Virtual Rendering
                </Badge>
              )}
            </Text>
          </VStack>
          <HStack spacing={2}>
            <Button
              leftIcon={isBulkMode ? <X size={16} /> : <CheckSquare size={16} />}
              size="sm"
              variant={isBulkMode ? "solid" : "outline"}
              colorScheme={isBulkMode ? "red" : "blue"}
              onClick={toggleBulkMode}
            >
              {isBulkMode ? "Exit Bulk" : "Bulk Select"}
            </Button>
            {isBulkMode && filteredAndSortedHistory.length > 0 && (
              <Button
                leftIcon={selectedIds.length === filteredAndSortedHistory.length ? <Square size={16} /> : <CheckSquare size={16} />}
                size="sm"
                variant="outline"
                onClick={() => handleSelectAll(selectedIds.length !== filteredAndSortedHistory.length)}
              >
                {selectedIds.length === filteredAndSortedHistory.length ? "Deselect All" : "Select All"}
              </Button>
            )}
            <Tooltip label="Small icons">
              <IconButton
                icon={<Grid2x2 size={16} />}
                size="sm"
                variant={viewDensity === 'small' ? 'solid' : 'ghost'}
                colorScheme={viewDensity === 'small' ? 'blue' : 'gray'}
                onClick={() => setViewDensity('small')}
                aria-label="Small grid view"
              />
            </Tooltip>
            <Tooltip label="Large icons">
              <IconButton
                icon={<Grid3x3 size={16} />}
                size="sm"
                variant={viewDensity === 'large' ? 'solid' : 'ghost'}
                colorScheme={viewDensity === 'large' ? 'blue' : 'gray'}
                onClick={() => setViewDensity('large')}
                aria-label="Large grid view"
              />
            </Tooltip>
            <Tooltip label="List view">
              <IconButton
                icon={<List size={16} />}
                size="sm"
                variant={viewDensity === 'list' ? 'solid' : 'ghost'}
                colorScheme={viewDensity === 'list' ? 'blue' : 'gray'}
                onClick={() => setViewDensity('list')}
                aria-label="List view"
              />
            </Tooltip>
          </HStack>
        </HStack>

        {/* Search and Filters */}
        <HStack w="full" spacing={4}>
          <InputGroup flex="1">
            <InputLeftElement pointerEvents="none">
              <Search size={16} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search content, audience, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={isDark ? "gray.700" : "white"}
              color={isDark ? "gray.100" : "gray.800"}
              border="2px solid"
              borderColor={isDark ? "gray.600" : "gray.200"}
              _placeholder={{ color: isDark ? "gray.400" : "gray.500" }}
              _focus={{
                borderColor: 'blue.400',
                boxShadow: isDark 
                  ? '0 0 0 3px rgba(66, 153, 225, 0.2)'
                  : '0 0 0 3px rgba(66, 153, 225, 0.1)'
              }}
            />
          </InputGroup>
          
          <Select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            maxW="150px"
            bg={isDark ? "gray.700" : "white"}
            color={isDark ? "gray.100" : "gray.800"}
            border="2px solid"
            borderColor={isDark ? "gray.600" : "gray.200"}
          >
            <option value="all">All Tiers</option>
            <option value="basic">Basic</option>
            <option value="advanced">Advanced</option>
            <option value="pro">Pro</option>
          </Select>
          
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            maxW="150px"
            bg={isDark ? "gray.700" : "white"}
            color={isDark ? "gray.100" : "gray.800"}
            border="2px solid"
            borderColor={isDark ? "gray.600" : "gray.200"}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
          </Select>
        </HStack>
      </VStack>

      {/* Content */}
      <AnimatePresence>
        {filteredAndSortedHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Alert
              status="info"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
              rounded="xl"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                {searchTerm ? 'No matching content found' : 'No content generated yet'}
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters'
                  : 'Your generated content will appear here. Create your first educational content to get started!'
                }
              </AlertDescription>
            </Alert>
          </motion.div>
        ) : shouldUseVirtualGrid ? (
          // Use virtual grid for large datasets
          <Box position="relative">
            <Box 
              height="600px" 
              width="100%" 
              overflow="hidden"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              bg="gray.50"
            >
              {viewDensity === 'list' ? (
                <VirtualGrid
                  columnCount={1}
                  rowCount={filteredAndSortedHistory.length}
                  columnWidth={() => getItemSize(0, true)}
                  rowHeight={() => getItemSize(0, false)}
                  height={600}
                  width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 100, 1200) : 1200}
                  itemData={filteredAndSortedHistory}
                  overscanRowCount={5}
                  overscanColumnCount={1}
                >
                  {VirtualListItem}
                </VirtualGrid>
              ) : (
                <VirtualGrid
                  columnCount={getGridDimensions().columnCount}
                  rowCount={getGridDimensions().rowCount}
                  columnWidth={(index) => getItemSize(index, true)}
                  rowHeight={(index) => getItemSize(index, false)}
                  height={600}
                  width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 100, 1200) : 1200}
                  itemData={filteredAndSortedHistory}
                  overscanRowCount={2}
                  overscanColumnCount={1}
                >
                  {VirtualGridItem}
                </VirtualGrid>
              )}
            </Box>
            <Text 
              position="absolute" 
              top={2} 
              right={2} 
              fontSize="xs" 
              color="gray.500"
              bg="white"
              px={2}
              py={1}
              borderRadius="md"
              boxShadow="sm"
              zIndex={1}
            >
              Showing {Math.min(filteredAndSortedHistory.length, 50)} of {filteredAndSortedHistory.length} items
            </Text>
          </Box>
        ) : (
          // Use regular grid for small datasets (maintains animations)
          <Grid
            templateColumns={viewDensity === 'list' ? '1fr' : 
              viewDensity === 'small' ? 'repeat(auto-fill, minmax(160px, 1fr))' : {
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)'
              }
            }
            gap={4}
          >
            <AnimatePresence>
              {filteredAndSortedHistory.map((item, index) => (
                <GridItem key={item.id}>
                  <HistoryItemCard item={item} index={index} density={viewDensity} />
                </GridItem>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleDeleteCancel}
        isCentered
        closeOnEsc={true}
        closeOnOverlayClick={false}
      >
        <AlertDialogOverlay>
          <AlertDialogContent onKeyDown={handleDeleteKeyDown} tabIndex={-1}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Content
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{itemToDelete?.name || 'this content'}"? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDeleteConfirm} 
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Bulk Actions Floating Toolbar */}
      {selectedIds.length > 0 && (
        <Portal>
          <Box
            position="fixed"
            bottom="20px"
            left="50%"
            transform="translateX(-50%)"
            zIndex="1000"
            bg={isDark ? "gray.800" : "white"}
            borderRadius="xl"
            boxShadow="xl"
            border="1px solid"
            borderColor={isDark ? "gray.700" : "gray.200"}
            p={4}
            minW="300px"
          >
            <VStack spacing={3}>
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" fontWeight="medium" color={isDark ? "gray.200" : "gray.700"}>
                  {selectedIds.length} item{selectedIds.length === 1 ? '' : 's'} selected
                </Text>
                <IconButton
                  icon={<X size={16} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds([])}
                  aria-label="Clear selection"
                />
              </HStack>
              
              {isBulkDeleting && (
                <Box w="full">
                  <Progress value={bulkDeleteProgress} size="sm" colorScheme="red" />
                  <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} mt={1}>
                    Deleting... {Math.round(bulkDeleteProgress)}%
                  </Text>
                </Box>
              )}
              
              <HStack spacing={2} w="full">
                <Button
                  leftIcon={<Trash2 size={16} />}
                  colorScheme="red"
                  size="sm"
                  onClick={handleBulkDelete}
                  isLoading={isBulkDeleting}
                  loadingText="Deleting..."
                  flex="1"
                >
                  Delete
                </Button>
                <Button
                  leftIcon={<Download size={16} />}
                  colorScheme="blue"
                  size="sm"
                  onClick={handleBulkExport}
                  isDisabled={isBulkDeleting}
                  flex="1"
                >
                  Export
                </Button>
                <Button
                  leftIcon={<Share2 size={16} />}
                  colorScheme="green"
                  size="sm"
                  onClick={handleBulkShare}
                  isDisabled={isBulkDeleting}
                  flex="1"
                >
                  Share
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Portal>
      )}
    </Box>
  );
};

export default React.memo(ModernContentHistory);
