# MediaPulse Bot Documentation

The `media_pulse_bot/` directory contains the Rasa-based conversational AI bot, which is a crucial component for handling natural language interactions within the MediaPulse MVP. This bot processes user input, understands their intent, and generates appropriate responses, often by interacting with the Node.js backend services.

## 1. Project Structure

*   **`media_pulse_bot/config.yml`**: Defines the NLU (Natural Language Understanding) and Core (dialogue management) pipelines for Rasa. This includes components for tokenization, featurization, intent classification, entity extraction, and policy configuration.
*   **`media_pulse_bot/domain.yml`**: Specifies the bot's universe. It declares:
    *   **Intents**: User intentions the bot should recognize (e.g., `greet`, `ask_news`, `report_sentiment`).
    *   **Entities**: Key pieces of information to extract from user messages (e.g., `topic`, `date`).
    *   **Slots**: Memory for the bot to store information during a conversation.
    *   **Responses (Utterances)**: Predefined text or actions the bot can respond with.
    *   **Forms**: Structured conversations for gathering multiple pieces of information.
*   **`media_pulse_bot/endpoints.yml`**: Configures connections to external services that Rasa needs to interact with, such as:
    *   **Action Server**: Where custom actions defined in `actions.py` are executed.
    *   **Tracker Store**: For storing conversation history.
    *   **Event Broker**: For sending events to external systems.
*   **`media_pulse_bot/.env`**: Environment variables specific to the Rasa bot, such as API keys or service URLs.
*   **`media_pulse_bot/actions/actions.py`**: Contains custom action code written in Python. These actions are executed by the Rasa Action Server and allow the bot to perform complex tasks, interact with external APIs (like the Node.js backend), or query databases.
*   **`media_pulse_bot/data/`**: This directory holds the training data for the Rasa bot.
    *   **`media_pulse_bot/data/nlu.yml`**: Contains example user utterances mapped to their corresponding intents and entities. This data is used to train the NLU model.
    *   **`media_pulse_bot/data/rules.yml`**: Defines explicit rules for how the bot should behave in specific situations, overriding learned behavior from stories.
    *   **`media_pulse_bot/data/stories.yml`**: Provides example conversational paths (stories) that the bot should learn from. Each story describes a sequence of user intents and bot responses/actions.

## 2. Core Functionality

The Rasa bot's primary role is to understand and respond to natural language input. This involves:

*   **Natural Language Understanding (NLU)**:
    *   **Intent Classification**: Determining the user's goal or intention from their message.
    *   **Entity Extraction**: Identifying and extracting key pieces of information (entities) from the user's message.
*   **Dialogue Management (Core)**:
    *   **Predicting Next Action**: Deciding what the bot should do next based on the current conversation state, user input, and learned policies/rules.
    *   **Executing Actions**: Performing predefined responses or custom actions (Python functions).
*   **Integration with Backend**: Custom actions in `actions.py` are designed to call the Node.js backend services (e.g., `server/services/rasa-service.ts` on the Node.js side) to fetch data, trigger operations, or leverage advanced NLP capabilities.

## 3. Training and Development

To train the Rasa bot, you typically use the Rasa CLI. The training process involves:

1.  **Data Preparation**: Ensuring `nlu.yml`, `stories.yml`, and `rules.yml` are up-to-date and comprehensive.
2.  **Model Training**: Running `rasa train` to train the NLU and Core models.
3.  **Action Server**: Starting the Rasa Action Server to make custom actions available.
4.  **Testing**: Using `rasa shell` for interactive testing or writing automated tests for conversational flows.

## 4. Deployment

The Rasa bot can be deployed as a separate service, often in a Docker container, and exposed via an API for the Node.js backend to communicate with it. The `server/services/rasa-service.ts` file on the Node.js side is responsible for making HTTP requests to the Rasa bot's API.