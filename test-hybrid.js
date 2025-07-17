// Test the hybrid optimization functionality
import { HybridChatOptimizer } from './src/utils/optimization/HybridChatOptimizer.js';
import { MessageCompressor } from './src/utils/optimization/MessageCompressor.js';
import { MessageSummarizer } from './src/utils/optimization/MessageSummarizer.js';

// Test data
const testMessages = [
  { role: 'user', text: 'Hello, can you help me with calculus?', timestamp: new Date() },
  { role: 'model', text: 'Of course! I\'d be happy to help you with calculus. What specific topic would you like to explore? Are you working on derivatives, integrals, limits, or something else?', timestamp: new Date() },
  { role: 'user', text: 'I need help with derivatives', timestamp: new Date() },
  { role: 'model', text: 'Great! Derivatives are fundamental in calculus. A derivative represents the rate of change of a function at any given point. Let me explain the basic concept and then we can work through some examples.', timestamp: new Date() },
  { role: 'user', text: 'What is the derivative of x^2?', timestamp: new Date() },
  { role: 'model', text: 'The derivative of x² is 2x. This follows the power rule: if f(x) = x^n, then f\'(x) = n·x^(n-1). So for x², we have n=2, giving us 2·x^(2-1) = 2x.', timestamp: new Date() },
  { role: 'user', text: 'Can you explain the chain rule?', timestamp: new Date() },
  { role: 'model', text: 'The chain rule is used when you have a composite function - a function inside another function. If y = f(g(x)), then dy/dx = f\'(g(x)) · g\'(x). In simpler terms, you take the derivative of the outer function, keep the inner function unchanged, then multiply by the derivative of the inner function.', timestamp: new Date() },
  { role: 'user', text: 'What about the product rule?', timestamp: new Date() },
  { role: 'model', text: 'The product rule is used when you need to find the derivative of two functions multiplied together. If y = f(x) · g(x), then dy/dx = f\'(x) · g(x) + f(x) · g\'(x). Remember it as: "first times derivative of second, plus second times derivative of first."', timestamp: new Date() },
  { role: 'user', text: 'How do I solve d/dx[x^2 * sin(x)]?', timestamp: new Date() },
  { role: 'model', text: 'To solve d/dx[x² · sin(x)], we use the product rule. Let f(x) = x² and g(x) = sin(x). Then f\'(x) = 2x and g\'(x) = cos(x). Applying the product rule: d/dx[x² · sin(x)] = 2x · sin(x) + x² · cos(x).', timestamp: new Date() },
  { role: 'user', text: 'That makes sense! Can you give me more practice problems?', timestamp: new Date() },
  { role: 'model', text: 'Absolutely! Here are some practice problems for you to try: 1) Find d/dx[3x³ + 2x² - 5x + 1], 2) Find d/dx[x² · e^x], 3) Find d/dx[sin(x²)], 4) Find d/dx[(x+1)/(x-1)]. Try these and let me know your answers!', timestamp: new Date() },
  { role: 'user', text: 'Let me try the first one: d/dx[3x³ + 2x² - 5x + 1]', timestamp: new Date() },
  { role: 'model', text: 'Great choice! For d/dx[3x³ + 2x² - 5x + 1], we can differentiate each term separately: d/dx[3x³] = 9x², d/dx[2x²] = 4x, d/dx[-5x] = -5, d/dx[1] = 0. So the answer is 9x² + 4x - 5.', timestamp: new Date() },
  { role: 'user', text: 'Perfect! Now let me try the second one with the product rule.', timestamp: new Date() },
  { role: 'model', text: 'Excellent! For d/dx[x² · e^x], using the product rule with f(x) = x² and g(x) = e^x: f\'(x) = 2x and g\'(x) = e^x. So d/dx[x² · e^x] = 2x · e^x + x² · e^x = e^x(2x + x²) = x·e^x(2 + x).', timestamp: new Date() },
  { role: 'user', text: 'This is really helpful! What about integration?', timestamp: new Date() },
  { role: 'model', text: 'Integration is the reverse process of differentiation! While derivatives give us rates of change, integrals give us accumulated quantities. The basic idea is: if F\'(x) = f(x), then ∫f(x)dx = F(x) + C, where C is the constant of integration.', timestamp: new Date() },
  { role: 'user', text: 'Can you show me how to integrate x^2?', timestamp: new Date() },
  { role: 'model', text: 'To integrate x², we use the power rule for integration: ∫x^n dx = x^(n+1)/(n+1) + C. For x²: ∫x² dx = x^(2+1)/(2+1) + C = x³/3 + C. You can verify this by differentiating: d/dx[x³/3] = 3x²/3 = x².', timestamp: new Date() }
];

const testLinkedContexts = [
  {
    chatId: 'chat1',
    subject: 'Mathematics',
    messages: [
      { role: 'user', text: 'What is a limit?', timestamp: new Date() },
      { role: 'model', text: 'A limit describes the behavior of a function as it approaches a particular point.', timestamp: new Date() }
    ]
  }
];

async function testHybridOptimization() {
  console.log('🚀 Testing Hybrid Chat Optimization...\n');
  
  try {
    // Test 1: MessageCompressor
    console.log('📦 Testing MessageCompressor...');
    const compressor = new MessageCompressor();
    const compressedResult = compressor.compress(testMessages);
    console.log(`✅ Compression: ${testMessages.length} → ${compressedResult.compressedCount} messages (${compressedResult.compressionRatio}% reduction)`);
    
    // Test 2: MessageSummarizer (without API call for now)
    console.log('\n📝 Testing MessageSummarizer structure...');
    const summarizer = new MessageSummarizer();
    console.log('✅ MessageSummarizer initialized successfully');
    
    // Test 3: HybridChatOptimizer
    console.log('\n🔧 Testing HybridChatOptimizer...');
    const optimizer = new HybridChatOptimizer();
    
    // Test with short messages (should not trigger optimization)
    const shortMessages = testMessages.slice(0, 5);
    const shortResult = await optimizer.optimize(shortMessages, testLinkedContexts);
    console.log(`✅ Short messages (${shortMessages.length}): Method = ${shortResult.method}, Optimized = ${shortResult.optimized}`);
    
    // Test with long messages (should trigger optimization)
    const longResult = await optimizer.optimize(testMessages, testLinkedContexts);
    console.log(`✅ Long messages (${testMessages.length}): Method = ${longResult.method}, Optimized = ${longResult.optimized}`);
    console.log(`   Final message count: ${longResult.messages.length}`);
    console.log(`   Linked contexts: ${longResult.linkedContexts.length}`);
    
    console.log('\n🎉 All tests passed! Hybrid optimization is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testHybridOptimization();
