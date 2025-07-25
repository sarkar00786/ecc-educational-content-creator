import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Progress,
  Flex,
  Badge,
  Icon,
  Tooltip,
  Alert
} from '@chakra-ui/react';
import { Radio, RadioGroup } from '@chakra-ui/radio';
import { Divider } from '@chakra-ui/layout';
// import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Users,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Brain,
  Target,
  Zap,
  Settings,
  Wand2
} from 'lucide-react';

const ModernContentGenerator = ({
  bookContent,
  setBookContent,
  audienceClass,
  setAudienceClass,
  audienceAge,
  setAudienceAge,
  audienceRegion,
  setAudienceRegion,
  outputWordCount,
  setOutputWordCount,
  customInstructions,
  setCustomInstructions,
  controlTier,
  setControlTier,
  onGenerate,
  isLoading,
  user
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [validation, setValidation] = useState({});
  const fileInputRef = useRef(null);
  
  // Theme state to match app theme
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ecc-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Listen for theme changes
  React.useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('ecc-theme');
      if (saved) {
        setIsDark(saved === 'dark');
      } else {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for direct theme changes from settings
    const observer = new MutationObserver(() => {
      const className = document.documentElement.className;
      setIsDark(className === 'dark');
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
    };
  }, []);

  const steps = [
    {
      title: "Content Input",
      icon: FileText,
      description: "Add your educational content"
    },
    {
      title: "Audience Setup",
      icon: Users,
      description: "Define your target audience"
    },
    {
      title: "Advanced Settings",
      icon: Settings,
      description: "Customize generation options"
    },
    {
      title: "Generate",
      icon: Sparkles,
      description: "Create your content"
    }
  ];

  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 0:
        if (!bookContent.trim()) errors.bookContent = "Content is required";
        if (bookContent.length < 50) errors.bookContent = "Content should be at least 50 characters";
        break;
      case 1:
        if (!audienceClass.trim()) errors.audienceClass = "Class/Grade is required";
        if (!audienceAge.trim()) errors.audienceAge = "Age group is required";
        if (!audienceRegion.trim()) errors.audienceRegion = "Region is required";
        break;
      case 2:
        if (controlTier === 'advanced' && outputWordCount && outputWordCount < 50) {
          errors.outputWordCount = "Word count should be at least 50";
        }
        break;
    }
    
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          setBookContent(e.target.result);
        };
        reader.readAsText(file);
      } else {
        alert("File type not supported: Please upload a text file (.txt)");
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBookContent(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4} color={isDark ? "gray.200" : "gray.900"}>
                📚 Add Your Educational Content
              </Text>
              <Text fontSize="sm" color={isDark ? "gray.400" : "black"} mb={4}>
                Paste your text content or upload a file to get started
              </Text>
              
              {/* Drag and Drop Area */}
              <Box
                border={`2px dashed ${dragActive ? '#3182ce' : (isDark ? '#4a5568' : '#cbd5e0')}`}
                borderRadius="xl"
                p={8}
                textAlign="center"
                bg={dragActive 
                  ? (isDark ? 'blue.900' : 'blue.50') 
                  : (isDark ? 'gray.700' : 'gray.50')
                }
                cursor="pointer"
                transition="all 0.2s"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                _hover={{ 
                  bg: isDark ? 'blue.900' : 'blue.50', 
                  borderColor: 'blue.300' 
                }}
              >
                <VStack spacing={4}>
                  <Icon as={Upload} size={40} color={dragActive ? 'blue.500' : (isDark ? 'gray.400' : 'black')} />
                  <VStack spacing={1}>
                    <Text fontWeight="medium" color={isDark ? "gray.200" : "gray.900"}>
                      Drop your text file here or click to upload
                    </Text>
                    <Text fontSize="sm" color={isDark ? "gray.400" : "black"}>
                      Supports .txt files up to 10MB
                    </Text>
                  </VStack>
                </VStack>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </Box>

              <Divider my={6} />


              {/* Text Input */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2} color={isDark ? "gray.200" : "gray.900"}>
                  Or paste your content here:
                </Text>
              <Textarea
                value={bookContent}
                onChange={(e) => setBookContent(e.target.value)}
                placeholder="E.g., 'The Earth is the third planet from the Sun and the only astronomical object known to harbor life...'"
                minH="200px"
                bg={isDark ? "gray.700" : "white"}
                color={isDark ? "gray.100" : "gray.900"}
                border="2px solid"
                borderColor={validation.bookContent 
                  ? 'red.300' 
                  : bookContent.length > 50 
                    ? 'green.300' 
                    : (isDark ? 'gray.600' : 'gray.200')
                }
                rounded="xl"
                fontSize="sm"
                resize="vertical"
                _placeholder={{ color: isDark ? "gray.400" : "gray.900" }}
                _focus={{
                  borderColor: validation.bookContent ? 'red.400' : bookContent.length > 50 ? 'green.400' : 'blue.400',
                  boxShadow: validation.bookContent 
                    ? (isDark ? '0 0 0 3px rgba(239, 68, 68, 0.2)' : '0 0 0 3px rgba(239, 68, 68, 0.1)')
                    : bookContent.length > 50 
                      ? (isDark ? '0 0 0 3px rgba(34, 197, 94, 0.2)' : '0 0 0 3px rgba(34, 197, 94, 0.1)')
                      : (isDark ? '0 0 0 3px rgba(66, 153, 225, 0.2)' : '0 0 0 3px rgba(66, 153, 225, 0.1)'),
                  transform: 'translateY(-1px)'
                }}
                _hover={{
                  borderColor: validation.bookContent 
                    ? 'red.300' 
                    : bookContent.length > 50 
                      ? 'green.300' 
                      : (isDark ? 'gray.500' : 'gray.400')
                }}
                transition="all 0.2s"
              />
                {validation.bookContent && (
                  <Alert status="error" mt={2} rounded="lg">
                    <Text fontSize="sm" color="red.600">{validation.bookContent}</Text>
                  </Alert>
                )}
                <HStack justify="space-between" mt={2}>
                  <Text fontSize="xs" color={isDark ? "gray.400" : "black"}>
                    {bookContent.length} characters
                  </Text>
                  <Badge colorScheme={bookContent.length > 50 ? 'green' : 'gray'}>
                    {bookContent.length > 50 ? 'Ready' : 'Needs more content'}
                  </Badge>
                </HStack>
              </Box>
            </Box>
          </VStack>
        );

      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4} color={isDark ? "gray.200" : "gray.900"}>
                🎯 Define Your Audience
              </Text>
              <Text fontSize="sm" color={isDark ? "gray.400" : "black"} mb={6}>
                Help AI understand who will be reading this content
              </Text>
            </Box>

            <HStack spacing={4} align="start">
              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb={2} color={isDark ? "gray.200" : "gray.900"}>
                  <Users size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  Class/Grade Level
                </Text>
                <Input
                  value={audienceClass}
                  onChange={(e) => setAudienceClass(e.target.value)}
                  placeholder="e.g., 5th Grade, University Level"
                  bg={isDark ? "gray.700" : "white"}
                  color={isDark ? "gray.100" : "gray.900"}
                  border="2px solid"
                  borderColor={validation.audienceClass ? 'red.300' : (isDark ? 'gray.600' : 'gray.200')}
                  rounded="lg"
                  _placeholder={{ color: isDark ? "gray.400" : "gray.900" }}
                  _focus={{
                    borderColor: 'blue.400',
                    boxShadow: isDark 
                      ? '0 0 0 3px rgba(66, 153, 225, 0.2)'
                      : '0 0 0 3px rgba(66, 153, 225, 0.1)'
                  }}
                />
                {validation.audienceClass && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {validation.audienceClass}
                  </Text>
                )}
              </Box>

              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb={2} color={isDark ? "gray.200" : "gray.900"}>
                  <Clock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  Age Group
                </Text>
                <Input
                  value={audienceAge}
                  onChange={(e) => setAudienceAge(e.target.value)}
                  placeholder="e.g., 10-11 years old, Adults"
                  bg={isDark ? "gray.700" : "white"}
                  color={isDark ? "gray.100" : "gray.900"}
                  border="2px solid"
                  borderColor={validation.audienceAge ? 'red.300' : (isDark ? 'gray.600' : 'gray.200')}
                  rounded="lg"
                  _placeholder={{ color: isDark ? "gray.400" : "gray.900" }}
                  _focus={{
                    borderColor: 'blue.400',
                    boxShadow: isDark 
                      ? '0 0 0 3px rgba(66, 153, 225, 0.2)'
                      : '0 0 0 3px rgba(66, 153, 225, 0.1)'
                  }}
                />
                {validation.audienceAge && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {validation.audienceAge}
                  </Text>
                )}
              </Box>
            </HStack>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color={isDark ? "gray.200" : "gray.900"}>
                <MapPin size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Region/Cultural Context
              </Text>
              <Input
                value={audienceRegion}
                onChange={(e) => setAudienceRegion(e.target.value)}
                placeholder="e.g., India, Western Europe, Rural Africa"
                bg={isDark ? "gray.700" : "white"}
                color={isDark ? "gray.100" : "gray.900"}
                border="2px solid"
                borderColor={validation.audienceRegion ? 'red.300' : (isDark ? 'gray.600' : 'gray.200')}
                rounded="lg"
                _placeholder={{ color: isDark ? "gray.400" : "gray.900" }}
                _focus={{
                  borderColor: 'blue.400',
                  boxShadow: isDark 
                    ? '0 0 0 3px rgba(66, 153, 225, 0.2)'
                    : '0 0 0 3px rgba(66, 153, 225, 0.1)'
                }}
              />
              {validation.audienceRegion && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  {validation.audienceRegion}
                </Text>
              )}
            </Box>

            {/* Quick Audience Suggestions */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={3} color={isDark ? "gray.200" : "gray.900"}>
                Quick Suggestions:
              </Text>
              <Flex flexWrap="wrap" gap={2}>
                {[
                  { label: "Elementary School", class: "Elementary", age: "6-10 years", region: "Global" },
                  { label: "Middle School", class: "Middle School", age: "11-13 years", region: "Global" },
                  { label: "High School", class: "High School", age: "14-18 years", region: "Global" },
                  { label: "University", class: "University", age: "18+ years", region: "Global" }
                ].map((suggestion) => (
                  <Button
                    key={suggestion.label}
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => {
                      setAudienceClass(suggestion.class);
                      setAudienceAge(suggestion.age);
                      setAudienceRegion(suggestion.region);
                    }}
                    _hover={{ bg: isDark ? 'blue.800' : 'blue.50' }}
                  >
                    {suggestion.label}
                  </Button>
                ))}
              </Flex>
            </Box>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4} color={isDark ? "gray.200" : "gray.900"}>
                ⚙️ Advanced Settings
              </Text>
              <Text fontSize="sm" color={isDark ? "gray.400" : "black"} mb={6}>
                Customize how your content is generated
              </Text>
            </Box>

            {/* Control Tier Selection */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={3} color={isDark ? "gray.200" : "gray.900"}>
                Generation Mode:
              </Text>
              <RadioGroup value={controlTier} onChange={setControlTier}>
                <VStack align="start" spacing={3}>
                  <Radio value="basic" colorScheme="blue">
                    <Box>
                      <Text fontWeight="medium">Basic</Text>
                      <Text fontSize="xs" color={isDark ? "gray.400" : "black"}>
                        Standard content generation with core features
                      </Text>
                    </Box>
                  </Radio>
                  <Radio value="advanced" colorScheme="purple">
                    <Box>
                      <Text fontWeight="medium">Advanced</Text>
                      <Text fontSize="xs" color={isDark ? "gray.400" : "black"}>
                        Fine-tune word count and add custom instructions
                      </Text>
                    </Box>
                  </Radio>
                  <Radio value="pro" colorScheme="orange">
                    <Box>
                      <Text fontWeight="medium">Pro (Future)</Text>
                      <Text fontSize="xs" color={isDark ? "gray.400" : "black"}>
                        Advanced features with quizzes and personalization
                      </Text>
                    </Box>
                  </Radio>
                </VStack>
              </RadioGroup>
            </Box>

            {/* Advanced Controls */}
            <AnimatePresence>
              {(controlTier === 'advanced' || controlTier === 'pro') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2} color={isDark ? "gray.200" : "gray.900"}>
                        <Target size={16} style={{ display: 'inline', marginRight: '8px' }} />
                        Target Word Count
                      </Text>
                      <Input
                        type="number"
                        value={outputWordCount}
                        onChange={(e) => setOutputWordCount(e.target.value)}
                        placeholder="e.g., 500"
                        bg={isDark ? "gray.700" : "white"}
                        color={isDark ? "gray.100" : "gray.800"}
                        border="2px solid"
                        borderColor={validation.outputWordCount ? 'red.300' : (isDark ? 'gray.600' : 'gray.200')}
                        rounded="lg"
                        _placeholder={{ color: isDark ? "gray.400" : "gray.900" }}
                        _focus={{
                          borderColor: 'blue.400',
                          boxShadow: isDark 
                            ? '0 0 0 3px rgba(66, 153, 225, 0.2)'
                            : '0 0 0 3px rgba(66, 153, 225, 0.1)'
                        }}
                      />
                      {validation.outputWordCount && (
                        <Text fontSize="xs" color="red.500" mt={1}>
                          {validation.outputWordCount}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2} color={isDark ? "gray.200" : "gray.900"}>
                        <Wand2 size={16} style={{ display: 'inline', marginRight: '8px' }} />
                        Custom Instructions
                      </Text>
                      <Textarea
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="e.g., 'Use a conversational tone, include bullet points, avoid technical jargon'"
                        bg={isDark ? "gray.700" : "white"}
                        color={isDark ? "gray.100" : "gray.800"}
                        border="2px solid"
                        borderColor={isDark ? "gray.600" : "gray.200"}
                        rounded="lg"
                        minH="100px"
                        _placeholder={{ color: isDark ? "gray.400" : "gray.900" }}
                        _focus={{
                          borderColor: 'blue.400',
                          boxShadow: isDark 
                            ? '0 0 0 3px rgba(66, 153, 225, 0.2)'
                            : '0 0 0 3px rgba(66, 153, 225, 0.1)'
                        }}
                      />
                    </Box>
                  </VStack>
                </motion.div>
              )}
            </AnimatePresence>

            {controlTier === 'pro' && (
              <Alert status="info" rounded="lg">
                <Box>
                  <Text fontWeight="semibold" mb={1}>Pro Features Coming Soon!</Text>
                  <Text fontSize="sm">
                    Quiz generation and advanced personalization features are under development.
                  </Text>
                </Box>
              </Alert>
            )}
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <Icon as={Brain} size={48} color="purple.500" mb={4} />
              <Text fontSize="lg" fontWeight="semibold" mb={2} color={isDark ? "gray.200" : "gray.900"}>
                🚀 Ready to Generate!
              </Text>
              <Text fontSize="sm" color={isDark ? "gray.400" : "black"} mb={6}>
                Your AI-powered educational content is ready to be created
              </Text>
            </Box>

            {/* Generation Summary */}
            <Card 
              bg={isDark ? "blue.900" : "blue.50"} 
              border="2px solid" 
              borderColor={isDark ? "blue.700" : "blue.200"}
              color={isDark ? "gray.100" : "gray.900"}
            >
              <CardBody>
                <Text fontSize="sm" fontWeight="medium" mb={3} color={isDark ? "blue.200" : "blue.800"}>
                  Generation Summary:
                </Text>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Badge colorScheme="blue">Content</Badge>
                    <Text fontSize="sm">{bookContent.length} characters</Text>
                  </HStack>
                  <HStack>
                    <Badge colorScheme="green">Audience</Badge>
                    <Text fontSize="sm">{audienceClass}, {audienceAge}, {audienceRegion}</Text>
                  </HStack>
                  <HStack>
                    <Badge colorScheme="purple">Mode</Badge>
                    <Text fontSize="sm">{controlTier}</Text>
                  </HStack>
                  {outputWordCount && (
                    <HStack>
                      <Badge colorScheme="orange">Target</Badge>
                      <Text fontSize="sm">{outputWordCount} words</Text>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Generate Button */}
            <Button
              size="lg"
              colorScheme="purple"
              onClick={onGenerate}
              disabled={isLoading || !user}
              leftIcon={isLoading ? <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={20} />
              </motion.div> : <Sparkles size={20} />}
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              _hover={{
                bg: "linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)"
              }}
              _active={{
                transform: "translateY(0px)"
              }}
              transition="all 0.2s"
              rounded="xl"
              h="56px"
            >
              {isLoading ? 'AI is Creating...' : 'Generate Educational Content'}
            </Button>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <Card 
      bg={isDark ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)"} 
      color={isDark ? "gray.100" : "gray.900"}
      shadow="2xl" 
      rounded="2xl" 
      overflow="hidden"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor={isDark ? "purple.600" : "purple.200"}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        bg: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        zIndex: 1
      }}
    >
      <CardHeader 
        bg={isDark 
          ? "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)"
          : "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
        }
        pb={6}
        position="relative"
        zIndex={2}
      >
        {/* Progress Steps */}
        <VStack spacing={4}>
          <HStack justify="space-between" w="full" maxW="500px">
            {steps.map((step, index) => (
              <VStack key={index} spacing={2} flex="1">
                <Box
                  w="40px"
                  h="40px"
                  rounded="full"
                  bg={index <= currentStep 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'gray.200'
                  }
                  color={index <= currentStep ? 'white' : 'gray.500'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transition="all 0.3s"
                  cursor={index < currentStep ? 'pointer' : 'default'}
                  onClick={() => index < currentStep && setCurrentStep(index)}
                  _hover={index < currentStep ? {
                    transform: 'scale(1.1)',
                    shadow: 'lg'
                  } : {}}
                >
                  {index < currentStep ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Icon as={step.icon} size={20} />
                  )}
                </Box>
                <VStack spacing={0}>
                  <Text fontSize="xs" fontWeight="medium" color={isDark ? "gray.200" : "gray.900"}>
                    {step.title}
                  </Text>
                  <Text fontSize="2xs" color={isDark ? "gray.400" : "black"} textAlign="center">
                    {step.description}
                  </Text>
                </VStack>
              </VStack>
            ))}
          </HStack>
          <Progress
            value={(currentStep / (steps.length - 1)) * 100}
            colorScheme="purple"
            size="sm"
            w="full"
            maxW="500px"
            rounded="full"
            bg="gray.200"
          />
        </VStack>
      </CardHeader>

      <CardBody p={8}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {getStepContent()}
          </motion.div>
        </AnimatePresence>
      </CardBody>

      {/* Navigation */}
      {currentStep < steps.length - 1 && (
        <Box p={6} bg={isDark ? "gray.800" : "gray.50"} borderTop="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
          <HStack justify="space-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              leftIcon={<ChevronLeft size={16} />}
            >
              Previous
            </Button>
            <Button
              colorScheme="purple"
              onClick={nextStep}
              rightIcon={<ChevronRight size={16} />}
            >
              Next Step
            </Button>
          </HStack>
        </Box>
      )}
    </Card>
  );
};

export default ModernContentGenerator;
