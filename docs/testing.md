# Media Pulse Testing Documentation

This document outlines the testing infrastructure and practices for the Media Pulse platform.

## Table of Contents

1. [Testing Infrastructure](#testing-infrastructure)
2. [Running Tests](#running-tests)
3. [Test Categories](#test-categories)
4. [Writing Tests](#writing-tests)
5. [Testing Best Practices](#best-practices)
6. [CI/CD Integration](#cicd-integration)

## Testing Infrastructure

The Media Pulse platform uses Jest as the primary testing framework for both frontend and backend tests. The testing setup includes:

- **Jest**: Main testing framework
- **Testing Library**: For React component testing
- **Supertest**: For API endpoint testing
- **Mock Service Worker**: For API mocking

### Configuration Files

- `jest.config.cjs`: Main Jest configuration
- `jest.config.simple.cjs`: Simplified configuration for basic tests
- `babel.config.cjs`: Babel configuration for Jest
- `tests/setup.js`: Global setup for tests

## Running Tests

The project includes a script to run tests with various configurations:

```bash
# Run all tests
./run-tests.sh

# Run only basic tests to verify setup
./run-tests.sh basic

# Run only frontend tests
./run-tests.sh frontend

# Run only backend tests
./run-tests.sh backend

# Run only integration tests
./run-tests.sh integration

# Run tests for a specific component
./run-tests.sh component ChatWidget

# Run tests with code coverage reporting
./run-tests.sh coverage

# Run tests in watch mode
./run-tests.sh watch

# Display help information
./run-tests.sh --help
```

## Test Categories

The Media Pulse testing structure is organized into the following categories:

### Basic Tests

Basic tests verify that the testing infrastructure is working correctly. These tests are simple and focused on ensuring Jest is properly configured.

Example: `tests/basic.test.js`

### Frontend Tests

Frontend tests focus on React components, hooks, and utilities.

- **Component Tests**: Test React components in isolation
  - Example: `tests/frontend/components/ChatWidget.test.js`

- **Hook Tests**: Test custom React hooks
  - Example: `tests/frontend/hooks/useWebSocket.test.js`

- **Utility Tests**: Test frontend utility functions
  - Example: `tests/frontend/utils/formatters.test.js`

### Backend Tests

Backend tests focus on API endpoints, services, and middleware.

- **Route Tests**: Test Express routes and API endpoints
  - Example: `tests/backend/routes/api-sentiment.test.js`

- **Service Tests**: Test service layer functions
  - Example: `tests/backend/services/nlp-service.test.js`

- **Middleware Tests**: Test Express middleware
  - Example: `tests/backend/middleware/auth.test.js`

### Integration Tests

Integration tests verify that different parts of the application work together correctly.

- Example: `tests/integration/chat-flow.test.js`

## Writing Tests

### Component Test Example

```jsx
// Component Test Example
const { render, screen, fireEvent } = require('@testing-library/react');

describe('ChatWidget Component', () => {
  test('renders chat toggle button when closed', () => {
    const handleToggle = jest.fn();
    
    render(
      <ChatWidget 
        isOpen={false}
        onToggle={handleToggle}
      />
    );
    
    const toggleButton = screen.getByTestId('chat-toggle-button');
    expect(toggleButton).toBeInTheDocument();
  });
});
```

### API Test Example

```javascript
// API Test Example
const request = require('supertest');
const express = require('express');

describe('Sentiment Analysis API', () => {
  test('should return 400 if text is missing', async () => {
    const response = await request(app)
      .post('/api/nlp/sentiment')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests.
2. **Mock External Dependencies**: Use mocks for APIs, databases, and other external services.
3. **Test User Behavior**: Focus on testing how users interact with components rather than implementation details.
4. **Keep Tests Simple**: Each test should test one specific thing.
5. **Use Test Descriptions**: Write clear test descriptions using the pattern "it should do something when something".
6. **Test Edge Cases**: Include tests for error conditions and edge cases.
7. **Keep Coverage High**: Aim for high test coverage, especially for critical components.

## CI/CD Integration

Media Pulse's testing infrastructure is designed to integrate with CI/CD pipelines. The `run-tests.sh` script returns proper exit codes that can be used by CI systems to determine pass/fail status.

Example CI workflow:

```yaml
name: Run Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: ./run-tests.sh
      - name: Run tests with coverage
        run: ./run-tests.sh coverage
```

---

## Resources and References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest](https://github.com/visionmedia/supertest)