import {
  Box,
  Flex,
  Heading,
  Link,
  VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React from 'react';

export default function Layout({ children }) {
  return (
    <Box
      minH="100vh"
      bg="gray.900"
      color="white"
      fontFamily="Inter, sans-serif"
    >
      <Flex direction={{ base: 'column', md: 'row' }} minH="100vh">
        {/* Sidebar */}
        <Box
          as="aside"
          w={{ base: 'full', md: '250px' }}
          bg="gray.950"
          p={6}
          shadow="xl"
          display={{ base: 'none', md: 'flex' }}
          flexDirection="column"
          rounded={{ md: '2xl' }}
          m={{ md: 4 }}
          mr={{ md: 0 }}
        >
          <Heading as="h2" size="lg" mb={8} fontWeight="bold" color="blue.400">
            🚀 ECC Panel
          </Heading>
          <VStack align="stretch" spacing={4} flex="1">
            <Link href="#" color="gray.300" _hover={{ color: 'white', textDecoration: 'none' }}>
              Dashboard
            </Link>
            <Link href="#" color="gray.300" _hover={{ color: 'white', textDecoration: 'none' }}>
              Content
            </Link>
            <Link href="#" color="gray.300" _hover={{ color: 'white', textDecoration: 'none' }}>
              History
            </Link>
            <Link href="#" color="gray.300" _hover={{ color: 'white', textDecoration: 'none' }}>
              Settings
            </Link>
          </VStack>
        </Box>

        {/* Main Content */}
        <Flex flex="1" p={{ base: 4, md: 6 }} direction="column" gap={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ flex: 1 }}
          >
            <Box
              bg="gray.800"
              p={6}
              rounded="2xl"
              shadow="xl"
              height="100%"
            >
              {children}
            </Box>
          </motion.div>
        </Flex>
      </Flex>
    </Box>
  );
}
