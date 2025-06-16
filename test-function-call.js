// Script to test domain-specific assistant function calls

import axios from 'axios';

// Function to test the get_report_url function directly
async function testGetReportUrl() {
  try {
    console.log('Testing get_report_url function with digital innovation parameter...');
    
    const response = await axios.post('http://localhost:5000/api/domain-specific-assistant/function-call', {
      functionName: 'get_report_url',
      parameters: {
        reportType: 'digital_innovation'
      },
      language: 'en'
    });
    
    console.log('Response:', response.data);
    console.log('URL returned:', response.data.content);
    
    return response.data;
  } catch (error) {
    console.error('Error testing get_report_url function:', error.response?.data || error.message);
    throw error;
  }
}

// Function to test asking about the digital innovation report
async function testDigitalInnovationQuestion() {
  try {
    console.log('\nTesting question about digital innovation report...');
    
    const response = await axios.post('http://localhost:5000/api/ai-assistant/ask', {
      question: 'How do I get to the digital innovation report?',
      language: 'en'
    });
    
    console.log('Response:', response.data);
    console.log('Answer:', response.data.answer);
    
    return response.data;
  } catch (error) {
    console.error('Error asking about digital innovation report:', error.response?.data || error.message);
    throw error;
  }
}

// Function to test asking about the sentiment analysis report
async function testSentimentAnalysisQuestion() {
  try {
    console.log('\nTesting question about sentiment analysis report...');
    
    const response = await axios.post('http://localhost:5000/api/ai-assistant/ask', {
      question: 'Where can I find the sentiment analysis report?',
      language: 'en'
    });
    
    console.log('Response:', response.data);
    console.log('Answer:', response.data.answer);
    
    return response.data;
  } catch (error) {
    console.error('Error asking about sentiment analysis report:', error.response?.data || error.message);
    throw error;
  }
}

// Function to test asking about the media coverage report
async function testMediaCoverageQuestion() {
  try {
    console.log('\nTesting question about media coverage report...');
    
    const response = await axios.post('http://localhost:5000/api/ai-assistant/ask', {
      question: 'I need the URL for the media coverage report',
      language: 'en'
    });
    
    console.log('Response:', response.data);
    console.log('Answer:', response.data.answer);
    
    return response.data;
  } catch (error) {
    console.error('Error asking about media coverage report:', error.response?.data || error.message);
    throw error;
  }
}

// Call the test function
async function runTests() {
  try {
    console.log('Starting tests for domain-specific assistant functions...');
    
    // Test get_report_url function directly
    await testGetReportUrl();
    
    // Test various questions that should trigger the function
    await testDigitalInnovationQuestion();
    await testSentimentAnalysisQuestion();
    await testMediaCoverageQuestion();
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the tests
runTests();