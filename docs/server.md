# Server-side Application Documentation

The server-side application is a Node.js (Express) backend located in the `server/` directory. It is the core of the MediaPulse MVP, responsible for handling API requests, managing data, and integrating with various internal and external services.

## 1. Project Structure

*   **`server/index.ts`**: The main entry point for the Express server, responsible for initializing the application, setting up middleware, and starting the server.
*   **`server/config.ts`**: Manages application configurations, environment variables, and sensitive settings.
*   **`server/db.ts`**: Handles database connections and interactions, likely using Drizzle ORM given `drizzle.config.ts`.
*   **`server/routes.ts`**: Defines the main API routes and maps them to corresponding controller functions.
*   **`server/auth.ts`**: Contains authentication-related logic, such as user authentication, token management, and authorization middleware.
*   **`server/logger.ts`**: Provides logging utilities for the server, enabling structured logging for debugging and monitoring.
*   **`server/websocket-manager.ts`**: Manages WebSocket connections, handling real-time communication with connected clients.
*   **`server/controllers/`**: Contains modules that define the logic for handling specific API endpoints. Each controller typically groups related route handlers.
    *   **`server/controllers/chat-controller.ts`**: Handles chat-related API requests, often interacting with NLP and AI services.
    *   **`server/controllers/nlp-controller.ts`**: Manages Natural Language Processing (NLP) related API endpoints.
    *   **`server/controllers/trend-controller.ts`**: Handles API requests related to trend analysis and reporting.
*   **`server/services/`**: Encapsulates business logic and integrations with external APIs or internal functionalities. Services are typically called by controllers.
    *   **`server/services/action-service.ts`**: Likely handles specific actions or operations within the application.
    *   **`server/services/alert-service.ts`**: Manages alerts and notifications.
    *   **`server/services/anthropic.ts`**: Integration with Anthropic's AI services.
    *   **`server/services/arabert-service.ts`**: Service for Arabic BERT model integration.
    *   **`server/services/context-hint-service.ts`**: Provides context-aware hints or suggestions.
    *   **`server/services/data-integration-service.ts`**: Handles integration with various data sources.
    *   **`server/services/email.ts`**: Email sending functionality.
    *   **`server/services/news-service.ts`**: Fetches and processes news data.
    *   **`server/services/newsai-service.ts`**: Integration with a News AI service.
    *   **`server/services/nlp-service.ts`**: Core NLP functionalities, potentially used by `nlp-controller`.
    *   **`server/services/openai-service.ts`**: Integration with OpenAI's API.
    *   **`server/services/openai.ts`**: Another OpenAI integration file, possibly for different aspects or versions.
    *   **`server/services/rasa-service.ts`**: Handles communication with the Rasa bot.
    *   **`server/services/report-export-service.ts`**: Manages the export of reports.
    *   **`server/services/serpapi-service.ts`**: Integration with SerpAPI for search engine results.
    *   **`server/services/spacy-service.ts`**: Integration with spaCy for advanced NLP tasks.
    *   **`server/services/startup-service.ts`**: Contains logic executed during server startup.
    *   **`server/services/trend-analysis-service.ts`**: Performs trend analysis on data.
*   **`server/middleware/`**: Contains Express middleware functions that process requests before they reach route handlers.
    *   **`server/middleware/errorHandling.ts`**: Centralized error handling middleware.
    *   **`server/middleware/security.ts`**: Security-related middleware (e.g., CORS, helmet).
*   **`server/types/`**: TypeScript declaration files for external modules or custom types.
    *   **`server/types/newsapi.d.ts`**: Type definitions for the NewsAPI integration.

## 2. Key Functionalities

*   **API Endpoints**: Provides a comprehensive set of RESTful APIs for the client application to interact with, covering areas like chat, NLP, trend analysis, and data management.
*   **Database Interaction**: Manages connections to the PostgreSQL database (inferred from Drizzle ORM) and performs CRUD operations.
*   **Real-time Communication**: Utilizes WebSockets for features requiring instant updates, such as the chat interface.
*   **External Service Integrations**: Integrates with various third-party services for AI (OpenAI, Anthropic), news data (NewsAPI), search (SerpAPI), and advanced NLP (Rasa, spaCy).
*   **Authentication and Authorization**: Secures API endpoints and manages user access.
*   **Logging**: Provides robust logging for monitoring and debugging server operations.

## 3. Configuration

The `server/config.ts` file is crucial for managing environment-specific settings. It typically loads values from environment variables (e.g., `.env` files) to configure database connections, API keys, and other sensitive information.

## 4. Testing

Backend components are tested using Jest. Tests are located in the `tests/backend/` directory.

*   **`tests/backend/routes/api-sentiment.test.ts`**: Example of API route testing.
*   **`tests/backend/services/nlp-service.test.ts`**: Example of service layer testing.