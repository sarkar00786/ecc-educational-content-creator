# ECC - Educational Content Creator

An AI-powered educational content generation platform built with React, Vite, and Firebase. This application enables educators and content creators to generate customized educational materials using advanced AI capabilities.

## 🚀 Features

- **AI-Powered Content Generation**: Create educational content using advanced language models
- **Real-time Collaboration**: Firebase-powered real-time updates and user management
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility Compliant**: WCAG 2.1 AA standards with comprehensive testing
- **Performance Optimized**: Advanced error handling and performance monitoring
- **Comprehensive Testing**: Unit, component, E2E, and accessibility testing
- **Serverless Backend**: Netlify functions for scalable AI processing

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project with Firestore and Authentication
- Netlify account for deployment
- Environment variables configured (see setup section)

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ECC
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # AI Service Configuration
   VITE_AI_API_ENDPOINT=your_ai_service_endpoint
   VITE_AI_API_KEY=your_ai_api_key

   # Analytics & Monitoring
   VITE_ANALYTICS_ID=your_analytics_id
   VITE_ERROR_REPORTING_DSN=your_error_reporting_dsn
   ```

4. **Firebase Setup**
   - Enable Firestore Database
   - Configure Authentication providers
   - Set up security rules

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🧪 Testing

### Unit & Component Tests (Vitest)
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- ComponentName.test.jsx
```

### End-to-End Tests (Playwright)
```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/specific-test.spec.js
```

### Accessibility Tests
```bash
# Run accessibility tests
npm run test:a11y

# Generate accessibility report
npm run test:a11y:report
```

### Performance Tests
```bash
# Run performance benchmarks
npm run test:performance
```

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── contexts/           # React contexts for state management
├── services/           # API and external service integrations
├── utils/              # Utility functions and helpers
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── assets/             # Static assets
└── styles/             # Global styles and Tailwind config

tests/
├── unit/               # Unit tests
├── component/          # Component tests
├── e2e/               # End-to-end tests
├── accessibility/      # Accessibility tests
├── performance/        # Performance tests
└── fixtures/          # Test data and mocks

netlify/
└── functions/         # Serverless functions
    ├── ai-content/    # AI content generation
    ├── auth/          # Authentication helpers
    └── utils/         # Shared utilities
```

### Key Components

- **Error Handling**: Comprehensive error boundaries and logging
- **Performance Monitoring**: Real-time metrics collection and reporting
- **Accessibility**: ARIA compliance, keyboard navigation, screen reader support
- **State Management**: Context-based state with optimistic updates
- **Testing Strategy**: Multi-layered testing approach ensuring reliability

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:host         # Start with network access

# Building
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:a11y        # Run accessibility tests
npm run test:coverage    # Generate test coverage

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking

# Deployment
npm run deploy           # Deploy to Netlify
npm run functions:serve  # Test functions locally
```

### Coding Standards

- **ESLint**: Enforced code quality and consistency
- **Prettier**: Automated code formatting
- **TypeScript**: Type safety (if applicable)
- **Accessibility**: WCAG 2.1 AA compliance
- **Testing**: Minimum 80% code coverage
- **Performance**: Core Web Vitals optimization

## 🚀 Deployment

### Netlify Deployment

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

2. **Environment Variables**
   Configure all environment variables in Netlify dashboard

3. **Deploy**
   ```bash
   npm run deploy
   ```

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy built files to your hosting provider
# The dist/ directory contains the built application
```

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   - Verify environment variables
   - Check Firebase project configuration
   - Ensure security rules allow access

2. **Build Failures**
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify all environment variables are set

3. **Test Failures**
   - Update Playwright browsers: `npx playwright install`
   - Clear test cache: `npm run test:clear-cache`
   - Check for async timing issues

4. **Performance Issues**
   - Run performance tests: `npm run test:performance`
   - Check bundle size: `npm run analyze`
   - Review error logs in monitoring dashboard

### Debugging

```bash
# Enable debug mode
DEBUG=true npm run dev

# Run tests with debugging
npm run test -- --inspect-brk

# Playwright debugging
npx playwright test --debug
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow coding standards
   - Add/update tests
   - Update documentation
4. **Run tests**
   ```bash
   npm run test:all
   ```
5. **Commit changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Review Guidelines

- Ensure all tests pass
- Maintain code coverage above 80%
- Follow accessibility guidelines
- Update documentation as needed
- Consider performance implications

## 📚 Documentation

- **API Documentation**: `/docs/api/`
- **Component Library**: `/docs/components/`
- **Testing Guide**: `/docs/testing/`
- **Deployment Guide**: `/docs/deployment/`
- **Accessibility Guide**: `/docs/accessibility/`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React and Vite teams for excellent development tools
- Firebase for backend infrastructure
- Tailwind CSS for styling framework
- Playwright and Vitest for testing frameworks
- Open source community for various dependencies

---

**Built with ❤️ for educators and content creators**

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
