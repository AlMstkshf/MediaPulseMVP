# Testing Documentation

The `tests/` directory contains a comprehensive suite of tests for the MediaPulse MVP application, covering various levels of testing including unit, integration, and end-to-end tests. This ensures the reliability, functionality, and maintainability of both the client-side and server-side components.

## 1. Project Structure

The testing framework used is primarily Jest, with additional libraries like React Testing Library for frontend components.

*   **`tests/basic.test.js`**: Contains basic, general-purpose tests, possibly for core utilities or simple functionalities.
*   **`tests/helpers.js`**: Utility functions or test helpers that can be reused across multiple test files.
*   **`tests/README.md`**: A README file specific to the tests directory, providing guidance on running tests or understanding the testing strategy.
*   **`tests/__mocks__/fileMock.js`**: Mock implementations for various file types or modules, used to isolate components during testing and prevent side effects.
*   **`tests/backend/`**: Contains tests specifically for the server-side (Node.js/Express) application.
    *   **`tests/backend/routes/api-sentiment.test.js`** / **`tests/backend/routes/api-sentiment.test.ts`**: Tests for API routes related to sentiment analysis, ensuring endpoints behave as expected.
    *   **`tests/backend/services/nlp-service.test.ts`**: Tests for the Natural Language Processing (NLP) service, verifying its core logic and integrations.
*   **`tests/frontend/`**: Contains tests specifically for the client-side (React) application.
    *   **`tests/frontend/components/ChatWidget.test.js`** / **`tests/frontend/components/ChatWidget.test.tsx`**: Tests for the `ChatWidget` React component, ensuring its rendering, interactions, and state management are correct.
    *   **`tests/frontend/hooks/useWebSocket.test.js`** / **`tests/frontend/hooks/useWebSocket.test.ts`**: Tests for the custom `useWebSocket` React hook, verifying its functionality for real-time communication.
*   **`tests/integration/`**: Contains integration tests that verify the interaction between multiple components or services.
    *   **`tests/integration/chat-flow.test.js`** / **`tests/integration/chat-flow.test.ts`**: Integration tests for the end-to-end chat flow, ensuring messages are correctly sent, processed by the bot, and displayed back to the user.

## 2. Testing Strategy

The project employs a multi-faceted testing strategy:

*   **Unit Tests**: Focus on individual functions, components, or modules in isolation. Mocks are heavily used to prevent external dependencies from affecting test results.
*   **Integration Tests**: Verify that different modules or services work correctly when integrated. This includes testing API endpoints, database interactions, and service-to-service communication.
*   **End-to-End (E2E) Tests**: (Implied by `integration/chat-flow.test.ts`) These tests simulate real user scenarios, interacting with the application as a whole, from the UI to the backend and external services.

## 3. Running Tests

Tests are typically executed using Jest. The `package.json` file likely contains scripts for running different sets of tests.

**Common Commands:**
*   `npm test` or `yarn test`: Runs all tests.
*   `npm test -- --watch`: Runs tests in watch mode, re-running affected tests on file changes.
*   `npm test -- [test-file-pattern]`: Runs specific test files (e.g., `npm test -- tests/backend/routes/api-sentiment.test.ts`).

The presence of `jest.config.cjs`, `jest.config.js`, `jest.config.simple.cjs`, and `jest.config.simple.js` suggests that there might be different Jest configurations for various testing environments or purposes (e.g., CI/CD, local development, simple runs).

## 4. Test Best Practices

*   **Clear Naming**: Test files and test descriptions are named clearly to indicate their purpose.
*   **Isolation**: Tests are designed to be isolated, meaning they don't depend on the state of other tests.
*   **Readability**: Tests are written to be easily understandable, following a clear Arrange-Act-Assert pattern.
*   **Coverage**: Aim for high code coverage to ensure that most of the codebase is exercised by tests.
*   **Mocks**: Appropriate use of Jest mocks for external dependencies (e.g., API calls, database interactions) to ensure tests are fast and reliable.