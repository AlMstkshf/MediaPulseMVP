# Media Pulse Testing Framework

This directory contains the testing infrastructure for the Media Pulse application. The tests are organized into three main categories:

1. **Frontend Tests**: Tests for React components, hooks, and utilities
2. **Backend Tests**: Tests for server API routes, services, and utilities
3. **Integration Tests**: End-to-end tests that verify complete workflows

## Test Structure

```
tests/
├── setup.js                  # Global setup for all tests
├── frontend/                 # Frontend tests
│   ├── components/           # Tests for React components
│   └── hooks/                # Tests for custom React hooks
├── backend/                  # Backend tests
│   ├── routes/               # Tests for API routes
│   └── services/             # Tests for service modules
└── integration/              # Integration tests for complete workflows
```

## Running Tests

We provide a simple script to run different test configurations:

```bash
# Run all tests
./run-tests.sh

# Run only frontend tests
./run-tests.sh frontend

# Run only backend tests
./run-tests.sh backend

# Run only integration tests
./run-tests.sh integration

# Run tests in watch mode (automatically re-run when files change)
./run-tests.sh watch

# Run tests with coverage reporting
./run-tests.sh coverage

# Display help information
./run-tests.sh --help
```

## Writing Tests

### Frontend Components

For testing React components, we use React Testing Library. Example:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Frontend Hooks

For testing custom React hooks, use the `renderHook` utility:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '@/hooks/useMyHook';

test('hook works correctly', () => {
  const { result } = renderHook(() => useMyHook());
  act(() => {
    result.current.doSomething();
  });
  expect(result.current.value).toBe(expectedValue);
});
```

### Backend Routes

For testing API routes, we use Supertest:

```typescript
import supertest from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';

let app, request;

beforeAll(() => {
  app = express();
  registerRoutes(app);
  request = supertest(app);
});

test('GET /api/endpoint returns correct data', async () => {
  const response = await request.get('/api/endpoint');
  expect(response.status).toBe(200);
  expect(response.body).toEqual(expectedData);
});
```

## Mocking

### Mocking External Services

Use Jest's mocking capabilities to replace external services:

```typescript
jest.mock('external-service', () => ({
  serviceFunction: jest.fn().mockResolvedValue(mockData)
}));
```

### Mocking Database

Mock database operations to avoid actual database operations during testing:

```typescript
jest.mock('../../server/db', () => ({
  pool: {
    query: jest.fn().mockResolvedValue({ rows: mockRows })
  }
}));
```

## Test Coverage

We aim for high test coverage across all parts of the application. Run the coverage command to see the current test coverage:

```bash
./run-tests.sh coverage
```

This will generate a coverage report that shows which parts of the codebase are well-tested and which need more attention.

## Continuous Integration

Tests are automatically run as part of our CI pipeline to ensure code quality. All pull requests must pass tests before being merged.

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state created by other tests.
2. **Mock External Dependencies**: Use mocks for network requests, database queries, and other external dependencies.
3. **Focus on Behavior**: Test what the code does, not how it's implemented.
4. **Test Edge Cases**: Include tests for error conditions and edge cases.
5. **Keep Tests Simple**: Each test should verify one specific aspect of the code.
6. **Readable Tests**: Use descriptive test names and organize tests logically.
7. **Avoid Test Duplication**: Extract common setup code into beforeEach or helper functions.