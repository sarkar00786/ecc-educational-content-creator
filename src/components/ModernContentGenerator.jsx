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
import { motion, AnimatePresence } from 'framer-motion';
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
              <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
                📚 Add Your Educational Content
              </Text>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Paste your text content or upload a file to get started
              </Text>
              
              {/* Drag and Drop Area */}
              <Box
                border={`2px dashed ${dragActive ? '#3182ce' : '#cbd5e0'}`}
                borderRadius="xl"
                p={8}
                textAlign="center"
                bg={dragActive ? 'blue.50' : 'gray.50'}
                cursor="pointer"
                transition="all 0.2s"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
              >
                <VStack spacing={4}>
                  <Icon as={Upload} size={40} color={dragActive ? 'blue.500' : 'gray.400'} />
                  <VStack spacing={1}>
                    <Text fontWeight="medium" color="gray.700">
                      Drop your text file here or click to upload
                    </Text>
                    <Text fontSize="sm" color="gray.500">
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
                <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                  Or paste your content here:
                </Text>
                <Textarea
                  value={bookContent}
                  onChange={(e) => setBookContent(e.target.value)}
                  placeholder="E.g., 'The Earth is the third planet from the Sun and the only astronomical object known to harbor life...'"
                  minH="200px"
                  bg="white"
                  color="gray.800"
                  border="2px solid"
                  borderColor={validation.bookContent ? 'red.300' : 'gray.200'}
                  rounded="xl"
                  fontSize="sm"
                  _focus={{
                    borderColor: 'blue.400',
                    boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)'
                  }}
                  _placeholder={{ color: 'gray.400' }}
                />
                {validation.bookContent && (
                  <Alert status="error" mt={2} rounded="lg">
                    <Text fontSize="sm" color="red.600">{validation.bookContent}</Text>
                  </Alert>
                )}
                <HStack justify="space-between" mt={2}>
                  <Text fontSize="xs" color="gray.500">
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
              <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
                🎯 Define Your Audience
              </Text>
              <Text fontSize="sm" color="gray.600" mb={6}>
                Help AI understand who will be reading this content
              </Text>
            </Box>

            <HStack spacing={4} align="start">
              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                  <Users size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  Class/Grade Level
                </Text>
                <Input
                  value={audienceClass}
                  onChange={(e) => setAudienceClass(e.target.value)}
                  placeholder="e.g., 5th Grade, University Level"
                  bg="white"
                  color="gray.800"
                  border="2px solid"
                  borderColor={validation.audienceClass ? 'red.300' : 'gray.200'}
                  rounded="lg"
                  _focus={{
                    borderColor: 'blue.400',
                    boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)'
                  }}
                />
                {validation.audienceClass && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {validation.audienceClass}
                  </Text>
                )}
              </Box>

              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                  <Clock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  Age Group
                </Text>
                <Input
                  value={audienceAge}
                  onChange={(e) => setAudienceAge(e.target.value)}
                  placeholder="e.g., 10-11 years old, Adults"
                  bg="white"
                  color="gray.800"
                  border="2px solid"
                  borderColor={validation.audienceAge ? 'red.300' : 'gray.200'}
                  rounded="lg"
                  _focus={{
                    borderColor: 'blue.400',
                    boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)'
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
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                <MapPin size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Region/Cultural Context
              </Text>
              <Input
                value={audienceRegion}
                onChange={(e) => setAudienceRegion(e.target.value)}
                placeholder="e.g., India, Western Europe, Rural Africa"
                bg="white"
                color="gray.800"
                border="2px solid"
                borderColor={validation.audienceRegion ? 'red.300' : 'gray.200'}
                rounded="lg"
                _focus={{
                  borderColor: 'blue.400',
                  boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)'
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
              <Text fontSize="sm" fontWeight="medium" mb={3} color="gray.700">
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
                    _hover={{ bg: 'blue.50' }}
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
              <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
                ⚙️ Advanced Settings
              </Text>
              <Text fontSize="sm" color="gray.600" mb={6}>
                Customize how your content is generated
              </Text>
            </Box>

            {/* Control Tier Selection */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={3} color="gray.700">
                Generation Mode:
              </Text>
              <RadioGroup value={controlTier} onChange={setControlTier}>
                <VStack align="start" spacing={3}>
                  <Radio value="basic" colorScheme="blue">
                    <Box>
                      <Text fontWeight="medium">Basic</Text>
                      <Text fontSize="xs" color="gray.600">
                        Standard content generation with core features
                      </Text>
                    </Box>
                  </Radio>
                  <Radio value="advanced" colorScheme="purple">
                    <Box>
                      <Text fontWeight="medium">Advanced</Text>
                      <Text fontSize="xs" color="gray.600">
                        Fine-tune word count and add custom instructions
                      </Text>
                    </Box>
                  </Radio>
                  <Radio value="pro" colorScheme="orange">
                    <Box>
                      <Text fontWeight="medium">Pro (Future)</Text>
                      <Text fontSize="xs" color="gray.600">
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
                      <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                        <Target size={16} style={{ display: 'inline', marginRight: '8px' }} />
                        Target Word Count
                      </Text>
                      <Input
                        type="number"
                        value={outputWordCount}
                        onChange={(e) => setOutputWordCount(e.target.value)}
                        placeholder="e.g., 500"
                        bg="white"
                        color="gray.800"
                        border="2px solid"
                        borderColor={validation.outputWordCount ? 'red.300' : 'gray.200'}
                        rounded="lg"
                        _focus={{
                          borderColor: 'blue.400',
                          boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)'
                        }}
                      />
                      {validation.outputWordCount && (
                        <Text fontSize="xs" color="red.500" mt={1}>
                          {validation.outputWordCount}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                        <Wand2 size={16} style={{ display: 'inline', marginRight: '8px' }} />
                        Custom Instructions
                      </Text>
                      <Textarea
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="e.g., 'Use a conversational tone, include bullet points, avoid technical jargon'"
                        bg="white"
                        color="gray.800"
                        border="2px solid"
                        borderColor="gray.200"
                        rounded="lg"
                        minH="100px"
                        _focus={{
                          borderColor: 'blue.400',
                          boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)'
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
              <Text fontSize="lg" fontWeight="semibold" mb={2} color="gray.700">
                🚀 Ready to Generate!
              </Text>
              <Text fontSize="sm" color="gray.600" mb={6}>
                Your AI-powered educational content is ready to be created
              </Text>
            </Box>

            {/* Generation Summary */}
            <Card bg="blue.50" border="2px solid" borderColor="blue.200">
              <CardBody>
                <Text fontSize="sm" fontWeight="medium" mb={3} color="blue.800">
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
    <Card bg="white" shadow="xl" rounded="2xl" overflow="hidden">
      <CardHeader bg="linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)" pb={6}>
        {/* Progress Steps */}
        <VStack spacing={4}>
          <HStack justify="space-between" w="full" maxW="500px">
            {steps.map((step, index) => (
              <VStack key={index} spacing={2} flex="1">
                <Box
                  w="40px"
                  h="40px"
                  rounded="full"
                  bg={index <= currentStep ? 'purple.500' : 'gray.200'}
                  color={index <= currentStep ? 'white' : 'gray.500'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transition="all 0.3s"
                  cursor={index < currentStep ? 'pointer' : 'default'}
                  onClick={() => index < currentStep && setCurrentStep(index)}
                >
                  {index < currentStep ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Icon as={step.icon} size={20} />
                  )}
                </Box>
                <VStack spacing={0}>
                  <Text fontSize="xs" fontWeight="medium" color="gray.700">
                    {step.title}
                  </Text>
                  <Text fontSize="2xs" color="gray.500" textAlign="center">
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
        <Box p={6} bg="gray.50" borderTop="1px solid" borderColor="gray.200">
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
