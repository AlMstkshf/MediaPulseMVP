# Client-side Application Documentation

The client-side application is a React-based single-page application (SPA) located in the `client/` directory. It is responsible for rendering the user interface, handling user interactions, and communicating with the backend API.

## 1. Project Structure

*   **`client/public/`**: Contains static assets like `index.html` and other files that are served directly by the web server.
*   **`client/src/`**: Contains the main source code for the React application.
    *   **`client/src/EnhancedApp.tsx`**: The root component of the application, responsible for setting up routing, global contexts, and the main layout.
    *   **`client/src/contexts/`**: Houses React Contexts used for global state management.
        *   **`client/src/contexts/AccessibilityContext.tsx`**: Manages accessibility-related settings and provides them to the component tree.
    *   **`client/src/components/`**: (Implied, common React pattern) This directory would typically contain reusable UI components.
    *   **`client/src/hooks/`**: (Implied, common React pattern) This directory would typically contain custom React hooks for encapsulating reusable logic.
    *   **`client/src/pages/`**: (Implied, common React pattern) This directory would typically contain components representing different pages or views of the application.
    *   **`client/src/api/`**: (Implied, common React pattern) This directory would typically contain modules for interacting with the backend API.
    *   **`client/src/utils/`**: (Implied, common React pattern) This directory would typically contain utility functions.

## 2. Core Components and Functionality

### `client/src/EnhancedApp.tsx`

This file serves as the entry point for the React application. It typically wraps the main application logic with necessary providers (e.g., React Router, Context Providers, Redux Store Provider if used).

**Key Responsibilities:**
*   **Routing**: Sets up client-side routing using a library like React Router to navigate between different views.
*   **Context Provision**: Provides global contexts (e.g., `AccessibilityContext`) to the entire application, making shared state accessible to all components.
*   **Layout**: Defines the overall layout structure of the application.

### `client/src/contexts/AccessibilityContext.tsx`

This context is designed to manage and provide accessibility-related features and settings throughout the application.

**Key Responsibilities:**
*   **State Management**: Holds state related to accessibility preferences (e.g., font size, contrast, reduced motion).
*   **Provider**: Offers a `Provider` component that wraps the application (or parts of it) to make the accessibility state and update functions available to consuming components.
*   **Consumer/Hook**: Provides a way for components to consume the accessibility state, typically via `useContext` hook.

## 3. Interaction with Backend

The client-side application interacts with the Node.js backend primarily through RESTful API calls and WebSocket connections.

*   **REST API**: Used for fetching and submitting data (e.g., user profiles, reports, configuration).
*   **WebSockets**: Utilized for real-time communication, such as the chat functionality, live updates, or notifications. The `tests/frontend/hooks/useWebSocket.test.ts` file suggests the presence of a custom hook for managing WebSocket connections.

## 4. Styling

The application uses Tailwind CSS for styling, which is a utility-first CSS framework. This allows for rapid UI development and consistent styling across the application.

## 5. Testing

Client-side components and hooks are tested using Jest and React Testing Library. Tests are located in the `tests/frontend/` directory.

*   **`tests/frontend/components/ChatWidget.test.tsx`**: Example of a component test.
*   **`tests/frontend/hooks/useWebSocket.test.ts`**: Example of a custom hook test.