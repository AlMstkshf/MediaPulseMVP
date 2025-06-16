# Architecture Overview

The MediaPulse MVP application is structured into several key components, each responsible for a specific part of the system's functionality. This document provides a high-level overview of these components and their interactions.

## 1. Client-side Application (`client/`)

The client-side application is a React-based single-page application (SPA) that provides the user interface for interacting with the MediaPulse system. It consumes data from the backend API and displays it to the user.

**Key Technologies:**
*   React
*   TypeScript
*   Tailwind CSS

**Core Components:**
*   **`client/src/EnhancedApp.tsx`**: The main entry point for the React application, responsible for setting up global contexts and routing.
*   **`client/src/contexts/`**: Contains React Contexts for managing global state, such as accessibility settings.
*   **`client/public/`**: Static assets served directly by the web server.

## 2. Server-side Application (`server/`)

The server-side application is a Node.js (Express) backend that handles API requests, database interactions, and integration with various services. It serves as the central hub for business logic and data management.

**Key Technologies:**
*   Node.js
*   Express.js
*   TypeScript
*   Drizzle ORM (implied by `drizzle.config.ts`)
*   WebSockets (for real-time communication)

**Core Components:**
*   **`server/index.ts`**: The main entry point for the Express server.
*   **`server/routes.ts`**: Defines the API endpoints and maps them to controller functions.
*   **`server/db.ts`**: Handles database connections and queries using Drizzle ORM.
*   **`server/config.ts`**: Manages application configurations and environment variables.
*   **`server/controllers/`**: Contains logic for handling specific API requests (e.g., chat, NLP, trend analysis).
*   **`server/services/`**: Encapsulates business logic and external API integrations (e.g., OpenAI, NewsAPI, Rasa).
*   **`server/middleware/`**: Provides Express middleware for error handling and security.
*   **`server/websocket-manager.ts`**: Manages WebSocket connections and real-time data flow.

## 3. MediaPulse Bot (`media_pulse_bot/`)

This directory contains the Rasa-based conversational AI bot. It processes natural language input from users and interacts with the backend services to provide responses.

**Key Technologies:**
*   Rasa (NLU, Core)
*   Python

**Core Components:**
*   **`media_pulse_bot/domain.yml`**: Defines the bot's domain, including intents, entities, slots, and responses.
*   **`media_pulse_bot/data/`**: Contains NLU training data (`nlu.yml`), stories (`stories.yml`), and rules (`rules.yml`).
*   **`media_pulse_bot/actions/actions.py`**: Custom actions executed by the Rasa bot, often interacting with the Node.js backend services.
*   **`media_pulse_bot/config.yml`**: Rasa pipeline configuration.
*   **`media_pulse_bot/endpoints.yml`**: Configuration for connecting to external services (e.g., custom actions server).

## 4. Shared Components (`shared/`)

This directory contains code that is shared between the client and server applications, primarily data schemas and utility types.

**Key Components:**
*   **`shared/schema.ts`**: Defines shared data structures and types, ensuring consistency between frontend and backend.

## 5. Scripts (`scripts/`)

A collection of utility scripts for various development and maintenance tasks, such as database seeding, translation management, and build fixes.

## 6. Tests (`tests/`)

Contains unit, integration, and end-to-end tests for both frontend and backend components.

**Key Components:**
*   **`tests/backend/`**: Backend tests (e.g., API routes, services).
*   **`tests/frontend/`**: Frontend tests (e.g., React components, hooks).
*   **`tests/integration/`**: Integration tests covering end-to-end flows.
*   **`tests/__mocks__/`**: Mock implementations for testing purposes.

## Interaction Flow

1.  **User Interaction**: Users interact with the React client application in their browser.
2.  **API Calls**: The client makes REST API calls to the Node.js server for data retrieval and operations.
3.  **WebSocket Communication**: For real-time features (e.g., chat), the client establishes WebSocket connections with the server.
4.  **Server-side Processing**: The Node.js server processes API requests, interacts with the database, and orchestrates calls to various internal services (e.g., NLP, AI models) and external APIs (e.g., NewsAPI, SerpAPI).
5.  **Bot Interaction**: When a user interacts with the chat widget, the client sends messages to the server, which then forwards them to the Rasa bot. The Rasa bot processes the natural language, determines the intent, and executes custom actions (which might call back to the Node.js server's services) to generate a response.
6.  **Data Storage**: The server interacts with a database (likely PostgreSQL, given Drizzle ORM) for persistent data storage.

This architectural separation allows for independent development, scaling, and deployment of each component, contributing to the overall maintainability and robustness of the MediaPulse MVP.