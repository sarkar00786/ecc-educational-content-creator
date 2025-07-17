// Test script for the new multi-step LLM orchestration
// This script tests the updated generate-content.js function

const testContentGeneration = {
  bookContent: "Photosynthesis is the process by which plants convert light energy into chemical energy. This process occurs in chloroplasts and involves the reaction of carbon dioxide and water to produce glucose and oxygen using light energy.",
  audienceClass: "8th Grade",
  audienceAge: "13-14",
  audienceRegion: "United States",
  outputWordCount: "500",
  customInstructions: "Include interactive elements and real-world examples",
  selectedSubject: "Science",
  selectedPersona: "educator",
  requestType: "generateContent"
};

const testQuizGeneration = {
  bookContent: "Photosynthesis is the process by which plants convert light energy into chemical energy. This process occurs in chloroplasts and involves the reaction of carbon dioxide and water to produce glucose and oxygen using light energy.",
  audienceClass: "8th Grade",
  audienceAge: "13-14",
  audienceRegion: "United States",
  selectedSubject: "Science",
  requestType: "generateQuiz"
};

async function testMultiStepLLM() {
  console.log("🧪 Testing Multi-Step LLM Orchestration");
  console.log("=====================================");
  
  // Test 1: Content Generation
  console.log("\n📝 Test 1: Content Generation");
  console.log("Payload:", JSON.stringify(testContentGeneration, null, 2));
  
  try {
    const response = await fetch('http://localhost:8888/.netlify/functions/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testContentGeneration)
    });
    
    const result = await response.json();
    console.log("✅ Content Generation Status:", response.status);
    console.log("📄 Generated Content:", result.generatedContent?.substring(0, 200) + "...");
    
  } catch (error) {
    console.error("❌ Content Generation Error:", error.message);
  }
  
  // Test 2: Quiz Generation
  console.log("\n🧠 Test 2: Quiz Generation");
  console.log("Payload:", JSON.stringify(testQuizGeneration, null, 2));
  
  try {
    const response = await fetch('http://localhost:8888/.netlify/functions/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testQuizGeneration)
    });
    
    const result = await response.json();
    console.log("✅ Quiz Generation Status:", response.status);
    console.log("🎯 Generated Quiz:", result.quizContent?.substring(0, 200) + "...");
    
  } catch (error) {
    console.error("❌ Quiz Generation Error:", error.message);
  }
  
  // Test 3: Legacy Chat Request (Backward Compatibility)
  console.log("\n💬 Test 3: Legacy Chat Request (Backward Compatibility)");
  const legacyChatPayload = {
    contents: [{
      role: "user",
      parts: [{
        text: "Explain photosynthesis in simple terms"
      }]
    }]
  };
  
  try {
    const response = await fetch('http://localhost:8888/.netlify/functions/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(legacyChatPayload)
    });
    
    const result = await response.json();
    console.log("✅ Legacy Chat Status:", response.status);
    console.log("💬 Chat Response:", result.generatedContent?.substring(0, 200) + "...");
    
  } catch (error) {
    console.error("❌ Legacy Chat Error:", error.message);
  }
  
  console.log("\n🎉 Testing Complete!");
}

// Run tests only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMultiStepLLM();
}

export { testMultiStepLLM };
