import React, { useState } from 'react';
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
  PopoverArrow
} from '@chakra-ui/react';
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
  ExternalLink
} from 'lucide-react';

const ModernContentHistory = ({
  contentHistory,
  onLoadHistoryItem,
  searchTerm,
  setSearchTerm,
  isLoading = false
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);

  // Filter and sort logic
  const filteredAndSortedHistory = contentHistory
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

  const handleItemAction = (action, item) => {
    switch (action) {
      case 'view':
        onLoadHistoryItem(item);
        break;
      case 'copy':
        navigator.clipboard.writeText(item.generatedContent);
        alert("Content copied!");
        break;
      case 'share':
        // Share functionality
        alert("Share feature coming soon!");
        break;
      case 'delete':
        // Delete functionality
        alert("Delete feature coming soon!");
        break;
      default:
        break;
    }
  };

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

  const ContentCard = ({ item, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card
        bg="white"
        shadow="md"
        rounded="xl"
        border="1px solid"
        borderColor="gray.200"
        cursor="pointer"
        onClick={() => onLoadHistoryItem(item)}
        _hover={{
          shadow: "lg",
          borderColor: "blue.300",
          transform: "translateY(-2px)"
        }}
        transition="all 0.2s"
        position="relative"
        overflow="hidden"
      >
        {/* Tier Color Bar */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="4px"
          bg={`${getTierColor(item.controlTier)}.500`}
        />

        <CardHeader pb={3}>
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1} flex="1">
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="gray.800"
                noOfLines={2}
                lineHeight="1.3"
              >
                {item.name || `Content - ${formatDate(item.timestamp)}`}
              </Text>
              <HStack spacing={2}>
                <Badge
                  colorScheme={getTierColor(item.controlTier)}
                  size="sm"
                  rounded="full"
                >
                  {item.controlTier}
                </Badge>
                <Text fontSize="2xs" color="gray.500">
                  <Calendar size={10} style={{ display: 'inline', marginRight: '2px' }} />
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
                  _hover={{ bg: 'gray.100' }}
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
          <VStack align="start" spacing={3}>
            {/* Audience Info */}
            <HStack spacing={2} flexWrap="wrap">
              <HStack spacing={1}>
                <Users size={12} color="gray" />
                <Text fontSize="2xs" color="gray.600">
                  {item.audienceClass}
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Clock size={12} color="gray" />
                <Text fontSize="2xs" color="gray.600">
                  {item.audienceAge}
                </Text>
              </HStack>
              <HStack spacing={1}>
                <MapPin size={12} color="gray" />
                <Text fontSize="2xs" color="gray.600">
                  {item.audienceRegion}
                </Text>
              </HStack>
            </HStack>

            {/* Content Preview */}
            <Box>
              <Text
                fontSize="xs"
                color="gray.600"
                noOfLines={3}
                lineHeight="1.4"
              >
                {item.generatedContent?.substring(0, 150)}...
              </Text>
            </Box>

            {/* Stats */}
            <HStack justify="space-between" w="full" pt={2}>
              <HStack spacing={3}>
                <HStack spacing={1}>
                  <FileText size={12} color="gray" />
                  <Text fontSize="2xs" color="gray.500">
                    {item.generatedContent?.length || 0} chars
                  </Text>
                </HStack>
                {item.quizzes && item.quizzes.length > 0 && (
                  <HStack spacing={1}>
                    <BookOpen size={12} color="orange" />
                    <Text fontSize="2xs" color="orange.600">
                      {item.quizzes.length} quiz
                    </Text>
                  </HStack>
                )}
              </HStack>
              <Button
                size="xs"
                variant="ghost"
                colorScheme="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadHistoryItem(item);
                }}
                rightIcon={<ExternalLink size={12} />}
              >
                Open
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );

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
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Content History
            </Text>
            <Text fontSize="sm" color="gray.600">
              {contentHistory.length} items • {filteredAndSortedHistory.length} shown
            </Text>
          </VStack>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'solid' : 'ghost'}
              colorScheme={viewMode === 'grid' ? 'blue' : 'gray'}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'solid' : 'ghost'}
              colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
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
              bg="white"
              color="gray.800"
              border="2px solid"
              borderColor="gray.200"
              _focus={{
                borderColor: 'blue.400',
                boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)'
              }}
            />
          </InputGroup>
          
          <Select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            maxW="150px"
            bg="white"
            border="2px solid"
            borderColor="gray.200"
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
            bg="white"
            border="2px solid"
            borderColor="gray.200"
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
        ) : (
          <Grid
            templateColumns={viewMode === 'grid' ? {
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            } : '1fr'}
            gap={4}
          >
            {filteredAndSortedHistory.map((item, index) => (
              <GridItem key={item.id}>
                <ContentCard item={item} index={index} />
              </GridItem>
            ))}
          </Grid>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default ModernContentHistory;
