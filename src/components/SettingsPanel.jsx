import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Switch,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
  Divider,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast
} from '@chakra-ui/react';
import {
  Monitor,
  Sun,
  Moon,
  Palette,
  Volume2,
  VolumeX,
  Eye,
  Zap,
  Accessibility,
  Save,
  RotateCcw,
  Sparkles
} from 'lucide-react';

const SettingsPanel = ({ isOpen, onClose }) => {
  const toast = useToast();
  
  // Theme settings
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('ecc-theme') || 'system'
  );
  const [accentColor, setAccentColor] = useState(() => 
    localStorage.getItem('ecc-accent-color') || 'blue'
  );
  
  // Performance settings
  const [animations, setAnimations] = useState(() => 
    localStorage.getItem('ecc-animations') !== 'false'
  );
  const [autoSave, setAutoSave] = useState(() => 
    localStorage.getItem('ecc-autosave') !== 'false'
  );
  const [virtualScrolling, setVirtualScrolling] = useState(() => 
    localStorage.getItem('ecc-virtual-scrolling') !== 'false'
  );
  
  // Accessibility settings
  const [fontSize, setFontSize] = useState(() => 
    parseInt(localStorage.getItem('ecc-font-size')) || 16
  );
  const [highContrast, setHighContrast] = useState(() => 
    localStorage.getItem('ecc-high-contrast') === 'true'
  );
  const [reducedMotion, setReducedMotion] = useState(() => 
    localStorage.getItem('ecc-reduced-motion') === 'true'
  );
  const [soundEffects, setSoundEffects] = useState(() => 
    localStorage.getItem('ecc-sound-effects') !== 'false'
  );
  
  // Content generation settings
  const [defaultWordCount, setDefaultWordCount] = useState(() => 
    parseInt(localStorage.getItem('ecc-default-word-count')) || 500
  );
  const [defaultTier, setDefaultTier] = useState(() => 
    localStorage.getItem('ecc-default-tier') || 'basic'
  );
  const [autoGenerate, setAutoGenerate] = useState(() => 
    localStorage.getItem('ecc-auto-generate') === 'true'
  );

  const accentColors = [
    { name: 'Blue', value: 'blue', color: '#3B82F6' },
    { name: 'Purple', value: 'purple', color: '#8B5CF6' },
    { name: 'Green', value: 'green', color: '#10B981' },
    { name: 'Orange', value: 'orange', color: '#F59E0B' },
    { name: 'Pink', value: 'pink', color: '#EC4899' },
    { name: 'Teal', value: 'teal', color: '#14B8A6' },
  ];

  const saveSettings = () => {
    // Theme settings
    localStorage.setItem('ecc-theme', theme);
    localStorage.setItem('ecc-accent-color', accentColor);
    
    // Performance settings
    localStorage.setItem('ecc-animations', animations.toString());
    localStorage.setItem('ecc-autosave', autoSave.toString());
    localStorage.setItem('ecc-virtual-scrolling', virtualScrolling.toString());
    
    // Accessibility settings
    localStorage.setItem('ecc-font-size', fontSize.toString());
    localStorage.setItem('ecc-high-contrast', highContrast.toString());
    localStorage.setItem('ecc-reduced-motion', reducedMotion.toString());
    localStorage.setItem('ecc-sound-effects', soundEffects.toString());
    
    // Content generation settings
    localStorage.setItem('ecc-default-word-count', defaultWordCount.toString());
    localStorage.setItem('ecc-default-tier', defaultTier);
    localStorage.setItem('ecc-auto-generate', autoGenerate.toString());

    // Apply theme changes
    if (theme === 'dark') {
      document.documentElement.className = 'dark';
    } else if (theme === 'light') {
      document.documentElement.className = 'light';
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.className = prefersDark ? 'dark' : 'light';
    }

    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}px`;

    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }

    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    onClose();
  };

  const resetSettings = () => {
    setTheme('system');
    setAccentColor('blue');
    setAnimations(true);
    setAutoSave(true);
    setVirtualScrolling(true);
    setFontSize(16);
    setHighContrast(false);
    setReducedMotion(false);
    setSoundEffects(true);
    setDefaultWordCount(500);
    setDefaultTier('basic');
    setAutoGenerate(false);

    toast({
      title: "Settings Reset",
      description: "All settings have been restored to defaults.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.300" />
      <ModalContent 
        bg="white" 
        maxH="90vh"
        _dark={{
          bg: "gray.800",
          borderColor: "gray.700"
        }}
      >
        <ModalHeader 
          borderBottom="1px solid" 
          borderColor="gray.200"
          _dark={{ borderColor: "gray.700" }}
        >
          <HStack>
            <Sparkles size={24} />
            <Text>Application Settings</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          <VStack spacing={8} align="stretch">
            
            {/* Theme Settings */}
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <HStack>
                    <Palette size={20} />
                    <Text fontSize="lg" fontWeight="semibold">Appearance</Text>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box>
                      <Text fontWeight="medium" mb={3}>Theme Mode</Text>
                      <VStack spacing={3}>
                        <HStack spacing={4} w="full">
                          <IconButton
                            icon={<Sun size={18} />}
                            colorScheme={theme === 'light' ? 'blue' : 'gray'}
                            variant={theme === 'light' ? 'solid' : 'outline'}
                            onClick={() => setTheme('light')}
                            size="sm"
                            flex="1"
                          />
                          <IconButton
                            icon={<Monitor size={18} />}
                            colorScheme={theme === 'system' ? 'blue' : 'gray'}
                            variant={theme === 'system' ? 'solid' : 'outline'}
                            onClick={() => setTheme('system')}
                            size="sm"
                            flex="1"
                          />
                          <IconButton
                            icon={<Moon size={18} />}
                            colorScheme={theme === 'dark' ? 'blue' : 'gray'}
                            variant={theme === 'dark' ? 'solid' : 'outline'}
                            onClick={() => setTheme('dark')}
                            size="sm"
                            flex="1"
                          />
                        </HStack>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          {theme === 'system' ? 'Follows system preference' : `${theme} theme`}
                        </Text>
                      </VStack>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="medium" mb={3}>Accent Color</Text>
                      <SimpleGrid columns={3} spacing={2}>
                        {accentColors.map((color) => (
                          <Button
                            key={color.value}
                            size="sm"
                            bg={color.color}
                            color="white"
                            onClick={() => setAccentColor(color.value)}
                            leftIcon={accentColor === color.value ? <Sparkles size={14} /> : null}
                            variant={accentColor === color.value ? 'solid' : 'outline'}
                            borderColor={color.color}
                            _hover={{ bg: color.color, opacity: 0.8 }}
                          >
                            {color.name}
                          </Button>
                        ))}
                      </SimpleGrid>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* Accessibility Settings */}
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <HStack>
                    <Accessibility size={20} />
                    <Text fontSize="lg" fontWeight="semibold">Accessibility</Text>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium">Font Size</Text>
                          <Text fontSize="sm" color="gray.500">{fontSize}px</Text>
                        </HStack>
                        <Slider
                          value={fontSize}
                          onChange={setFontSize}
                          min={12}
                          max={24}
                          step={1}
                          colorScheme="blue"
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb />
                        </Slider>
                      </Box>
                      
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">High Contrast</Text>
                          <Text fontSize="sm" color="gray.500">Enhanced visibility</Text>
                        </VStack>
                        <Switch
                          isChecked={highContrast}
                          onChange={(e) => setHighContrast(e.target.checked)}
                          colorScheme="blue"
                        />
                      </HStack>
                    </VStack>
                    
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Reduced Motion</Text>
                          <Text fontSize="sm" color="gray.500">Minimize animations</Text>
                        </VStack>
                        <Switch
                          isChecked={reducedMotion}
                          onChange={(e) => setReducedMotion(e.target.checked)}
                          colorScheme="blue"
                        />
                      </HStack>
                      
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <HStack>
                            {soundEffects ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            <Text fontWeight="medium">Sound Effects</Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.500">Audio feedback</Text>
                        </VStack>
                        <Switch
                          isChecked={soundEffects}
                          onChange={(e) => setSoundEffects(e.target.checked)}
                          colorScheme="blue"
                        />
                      </HStack>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* Performance Settings */}
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <HStack>
                    <Zap size={20} />
                    <Text fontSize="lg" fontWeight="semibold">Performance</Text>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Smooth Animations</Text>
                          <Text fontSize="sm" color="gray.500">Enhanced visual effects</Text>
                        </VStack>
                        <Switch
                          isChecked={animations}
                          onChange={(e) => setAnimations(e.target.checked)}
                          colorScheme="blue"
                        />
                      </HStack>
                      
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Auto Save</Text>
                          <Text fontSize="sm" color="gray.500">Save drafts automatically</Text>
                        </VStack>
                        <Switch
                          isChecked={autoSave}
                          onChange={(e) => setAutoSave(e.target.checked)}
                          colorScheme="blue"
                        />
                      </HStack>
                    </VStack>
                    
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Virtual Scrolling</Text>
                          <Text fontSize="sm" color="gray.500">Optimize large lists</Text>
                        </VStack>
                        <Switch
                          isChecked={virtualScrolling}
                          onChange={(e) => setVirtualScrolling(e.target.checked)}
                          colorScheme="blue"
                        />
                      </HStack>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* Content Generation Settings */}
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <HStack>
                    <Sparkles size={20} />
                    <Text fontSize="lg" fontWeight="semibold">Content Generation</Text>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium">Default Word Count</Text>
                          <Text fontSize="sm" color="gray.500">{defaultWordCount} words</Text>
                        </HStack>
                        <Slider
                          value={defaultWordCount}
                          onChange={setDefaultWordCount}
                          min={100}
                          max={2000}
                          step={50}
                          colorScheme="purple"
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb />
                        </Slider>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="medium" mb={2}>Default Generation Tier</Text>
                        <Select
                          value={defaultTier}
                          onChange={(e) => setDefaultTier(e.target.value)}
                          bg="white"
                          _dark={{ bg: "gray.700" }}
                        >
                          <option value="basic">Basic</option>
                          <option value="advanced">Advanced</option>
                          <option value="pro">Pro</option>
                        </Select>
                      </Box>
                    </VStack>
                    
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Auto Generate</Text>
                          <Text fontSize="sm" color="gray.500">Start generation on form completion</Text>
                        </VStack>
                        <Switch
                          isChecked={autoGenerate}
                          onChange={(e) => setAutoGenerate(e.target.checked)}
                          colorScheme="purple"
                        />
                      </HStack>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* Information Alert */}
            <Alert status="info" rounded="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>Settings are saved locally!</AlertTitle>
                <AlertDescription>
                  Your preferences are stored in your browser and will persist across sessions.
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
          <HStack spacing={3}>
            <Button
              leftIcon={<RotateCcw size={16} />}
              variant="ghost"
              onClick={resetSettings}
            >
              Reset to Defaults
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              leftIcon={<Save size={16} />}
              colorScheme="blue"
              onClick={saveSettings}
            >
              Save Settings
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsPanel;
