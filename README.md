# MediaPulseMVP

# Media Pulse Platform

A sophisticated Media Monitoring and Digital Content Management System that leverages cutting-edge AI technologies for comprehensive multilingual content analysis and intelligent communication tools.

![Media Pulse Platform](generated-icon.png)

## Overview

Media Pulse is a comprehensive media intelligence platform designed to monitor, analyze, and manage digital content across multiple channels. The platform integrates advanced NLP technologies, real-time social media insights, and interactive dashboards to provide a complete solution for media professionals, communications teams, and marketing departments.

## Key Features

### Media Monitoring & Analysis
- Real-time social media monitoring across platforms (Twitter, Facebook, Instagram, LinkedIn)
- Advanced sentiment analysis using specialized NLP models
- Entity recognition and tracking
- Keyword and hashtag monitoring with customizable alerts
- Media coverage tracking and source analysis

### Interactive Dashboards
- Analytics Dashboard with KPI visualization
- Social Media Insights Dashboard
- Media Center Dashboard
- Customizable Personalized Dashboard with drag-and-drop widgets

### Intelligent Chatbot Assistant
- AI-powered conversational interface
- Natural language query processing for data requests
- Multilingual support (English and Arabic)
- Integrated with platform data for real-time insights
- Accessible through a convenient floating widget

### Report Generation
- Customizable report templates
- Export in multiple formats (PDF, Excel, CSV)
- Scheduled report generation
- Interactive data visualization

### Multi-language Support
- Complete bilingual interface (English and Arabic)
- Language-specific NLP models for accurate analysis
- RTL (Right-to-Left) layout support
- Intelligent automatic language detection

## Technology Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS with ShadCN UI components
- React Query for data fetching
- React Grid Layout for dashboard customization
- Chart.js for data visualization

### Backend
- Express.js server
- PostgreSQL database with Drizzle ORM
- WebSocket for real-time updates
- Socket.IO for event-based communication

### AI & NLP Technologies
- Rasa NLU and Core for conversational AI
- AraBERT for Arabic language processing
- Google Cloud NLP and AWS Comprehend for multilingual NLP
- OpenAI for advanced text processing and fallback responses

### Security
- Role-based access control
- JWT authentication
- HTTPS/TLS encryption
- Secure password handling

## Chat Widget Implementation

The platform includes a floating chat widget that allows users to interact with the Media Pulse AI assistant from any page in the application. The chat widget features:

- A small floating icon in the corner of the page
- Expandable chat interface with message history
- Real-time message exchange with "typing..." indicator
- Multilingual support (English and Arabic)
- Theme-consistent styling:
  - Bubble background: #f9f4e9
  - Message text: #333
  - Send button: #cba344

The chat widget connects to the backend Rasa NLU service, which processes natural language requests and provides contextually relevant responses. The AI assistant can help with:

- Generating KPI reports
- Analyzing sentiment trends
- Setting up keyword alerts
- Managing journalist contacts
- Scheduling content publication
- Answering questions about platform features

## API Endpoints

The platform provides a comprehensive set of API endpoints for accessing data:

### KPI Endpoints
- `GET /api/sentiment-analysis` - Get sentiment analysis data
- `GET /api/social-media/stats` - Get social media performance metrics
- `GET /api/media-coverage` - Get media coverage statistics

### Report Endpoints
- `GET /api/reports` - List all available reports
- `GET /api/reports/:id` - Get a specific report
- `POST /api/reports/generate` - Create a new report
- `GET /api/reports/:id/export/:format` - Export report in specified format

### Media Center Endpoints
- `GET /api/journalists` - List journalist contacts
- `GET /api/media-sources` - List media sources
- `GET /api/press-releases` - List press releases

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- PostgreSQL (v14 or higher)
- OpenAI API key for AI assistant fallback

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd media-pulse
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following:
   ```
   DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
   SESSION_SECRET=<your-session-secret>
   OPENAI_API_KEY=<your-openai-api-key>
   ```

4. Initialize the database
   ```
   npm run db:push
   ```

5. Start the development server
   ```
   npm run dev
   ```

6. The application will be available at `http://localhost:5000`

## Building and Deployment

### Development Build

For local development:

```bash
npm run dev
```

### Production Build

To build for production:

```bash
npm run build
```

### Fixing Build Structure for Deployment

If you encounter build structure issues during deployment, use our custom deployment script:

```bash
# Make the script executable if needed
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

Alternatively, you can use the JavaScript build fix script:

```bash
node scripts/fix-build.js
```

### Testing Build Structure

To verify that your build has the correct structure for deployment:

```bash
node scripts/test-build-structure.js
```

### Deployment

For detailed deployment instructions, see the [Deployment Guide](DEPLOYMENT.md).

#### Deploying on Replit

To deploy on Replit:

1. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

2. Click the "Deploy" button in the Replit interface

3. Once deployment is complete, your application will be available at your Replit URL

## Maintenance and Operations

The Media Pulse platform includes a comprehensive operations strategy:

- Dedicated AI team monitors model performance
- Automated monitoring tools track system health
- Continuous improvement using dialogue logs
- Regular model retraining with new data
- Performance metrics tracking for optimization

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For more information about the Media Pulse platform, please contact the development team.#
