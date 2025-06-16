# Media Pulse API Documentation

This document provides comprehensive documentation for the Media Pulse API endpoints.

## Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Social Media Endpoints](#social-media-endpoints)
- [Media Center Endpoints](#media-center-endpoints)
- [Analytics Endpoints](#analytics-endpoints)
- [Chat and NLP Endpoints](#chat-and-nlp-endpoints)
- [User Management](#user-management)
- [Content Analysis](#content-analysis)
- [Reports](#reports)
- [WebSocket API](#websocket-api)

## Authentication

The Media Pulse API uses JWT (JSON Web Token) for authentication. All authenticated endpoints require a valid JWT token.

### Login

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "fullName": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Current User

```
GET /api/auth/user
```

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "fullName": "Admin User",
  "email": "admin@example.com",
  "role": "admin"
}
```

### Logout

```
POST /api/auth/logout
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

## Error Handling

All API endpoints follow a consistent error response format:

**Example Error Response:**
```json
{
  "error": true,
  "message": "Descriptive error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Social Media Endpoints

### List Social Posts

```
GET /api/social-posts
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `platform` (optional): Filter by platform (twitter, facebook, instagram, linkedin)
- `dateFrom` (optional): Filter posts created after this date
- `dateTo` (optional): Filter posts created before this date
- `sentiment` (optional): Filter by sentiment (positive, negative, neutral)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "platform": "twitter",
      "content": "Post content here",
      "author": "Author name",
      "authorUsername": "author_handle",
      "publishedAt": "2025-01-15T12:30:00Z",
      "metrics": {
        "likes": 45,
        "shares": 12,
        "comments": 8
      },
      "sentiment": "positive",
      "sentimentScore": 0.85,
      "entities": ["Dubai", "Tourism"],
      "hashtags": ["#Dubai", "#Travel"]
    },
    // More posts...
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "pages": 8
  }
}
```

### Get Social Post by ID

```
GET /api/social-posts/:id
```

**Response:**
```json
{
  "id": 1,
  "platform": "twitter",
  "content": "Post content here",
  "author": "Author name",
  "authorUsername": "author_handle",
  "publishedAt": "2025-01-15T12:30:00Z",
  "metrics": {
    "likes": 45,
    "shares": 12,
    "comments": 8
  },
  "sentiment": "positive",
  "sentimentScore": 0.85,
  "entities": ["Dubai", "Tourism"],
  "hashtags": ["#Dubai", "#Travel"]
}
```

### Count Posts by Platform

```
GET /api/social-posts/count-by-platform
```

**Response:**
```json
[
  {
    "platform": "twitter",
    "count": 125
  },
  {
    "platform": "facebook",
    "count": 87
  },
  {
    "platform": "instagram",
    "count": 64
  },
  {
    "platform": "linkedin",
    "count": 43
  }
]
```

### Recent Activity

```
GET /api/social-posts/recent-activity
```

**Response:**
```json
{
  "total": 319,
  "lastHour": 12,
  "last24Hours": 78,
  "lastWeek": 225,
  "byPlatform": [
    {
      "platform": "twitter",
      "count": 35
    },
    // Other platforms...
  ]
}
```

## Media Center Endpoints

### Journalists

#### List Journalists

```
GET /api/journalists
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `search` (optional): Search by name or organization

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Ahmed Al-Mansoori",
      "arabicName": "أحمد المنصوري",
      "email": "ahmed@mediaco.ae",
      "phone": "+971501234567",
      "organization": "Gulf News",
      "title": "Senior Editor",
      "beat": "Technology",
      "notes": "Covers tech news in the Gulf region",
      "lastContact": "2025-02-10T09:15:00Z"
    },
    // More journalists...
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 48,
    "pages": 3
  }
}
```

#### Get Journalist by ID

```
GET /api/journalists/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Ahmed Al-Mansoori",
  "arabicName": "أحمد المنصوري",
  "email": "ahmed@mediaco.ae",
  "phone": "+971501234567",
  "organization": "Gulf News",
  "title": "Senior Editor",
  "beat": "Technology",
  "notes": "Covers tech news in the Gulf region",
  "lastContact": "2025-02-10T09:15:00Z"
}
```

#### Create Journalist

```
POST /api/journalists
```

**Request Body:**
```json
{
  "name": "Sarah Wilson",
  "arabicName": "سارة ويلسون",
  "email": "sarah@mediaoutlet.com",
  "phone": "+971502345678",
  "organization": "Dubai Chronicle",
  "title": "Reporter",
  "beat": "Business",
  "notes": "Interested in startup news"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Sarah Wilson",
  "arabicName": "سارة ويلسون",
  "email": "sarah@mediaoutlet.com",
  "phone": "+971502345678",
  "organization": "Dubai Chronicle",
  "title": "Reporter",
  "beat": "Business",
  "notes": "Interested in startup news",
  "lastContact": null
}
```

#### Update Journalist

```
PUT /api/journalists/:id
```

**Request Body:**
```json
{
  "name": "Sarah Wilson",
  "arabicName": "سارة ويلسون",
  "email": "sarah.wilson@mediaoutlet.com",
  "phone": "+971502345678",
  "organization": "Dubai Chronicle",
  "title": "Senior Reporter",
  "beat": "Business",
  "notes": "Interested in startup news and tech innovations"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Sarah Wilson",
  "arabicName": "سارة ويلسون",
  "email": "sarah.wilson@mediaoutlet.com",
  "phone": "+971502345678",
  "organization": "Dubai Chronicle",
  "title": "Senior Reporter",
  "beat": "Business",
  "notes": "Interested in startup news and tech innovations",
  "lastContact": null
}
```

#### Delete Journalist

```
DELETE /api/journalists/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Journalist deleted successfully"
}
```

### Media Sources

#### List Media Sources

```
GET /api/media-sources
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `type` (optional): Filter by type (newspaper, magazine, tv, radio, online)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Gulf News",
      "arabicName": "جلف نيوز",
      "type": "newspaper",
      "country": "UAE",
      "website": "https://gulfnews.com",
      "language": "English",
      "audience": "General",
      "reach": 500000,
      "notes": "Major English newspaper in the UAE"
    },
    // More media sources...
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 35,
    "pages": 2
  }
}
```

#### Get Media Source by ID

```
GET /api/media-sources/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Gulf News",
  "arabicName": "جلف نيوز",
  "type": "newspaper",
  "country": "UAE",
  "website": "https://gulfnews.com",
  "language": "English",
  "audience": "General",
  "reach": 500000,
  "notes": "Major English newspaper in the UAE"
}
```

#### Create Media Source

```
POST /api/media-sources
```

**Request Body:**
```json
{
  "name": "Dubai Business Journal",
  "arabicName": "مجلة دبي للأعمال",
  "type": "magazine",
  "country": "UAE",
  "website": "https://dbjournal.ae",
  "language": "English/Arabic",
  "audience": "Business",
  "reach": 75000,
  "notes": "Monthly business magazine"
}
```

#### Update Media Source

```
PUT /api/media-sources/:id
```

#### Delete Media Source

```
DELETE /api/media-sources/:id
```

### Press Releases

#### List Press Releases

```
GET /api/press-releases
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `status` (optional): Filter by status (draft, published, scheduled)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Ajman Police Launches New Safety Initiative",
      "arabicTitle": "شرطة عجمان تطلق مبادرة جديدة للسلامة",
      "content": "Content of the press release...",
      "arabicContent": "محتوى البيان الصحفي...",
      "status": "published",
      "publishedAt": "2025-01-15T12:30:00Z",
      "scheduledFor": null,
      "createdBy": {
        "id": 1,
        "username": "admin",
        "fullName": "Admin User"
      },
      "updatedAt": "2025-01-15T10:15:00Z",
      "categories": ["Safety", "Police"],
      "attachments": [
        {
          "id": 1,
          "filename": "safety_initiative.pdf",
          "url": "/uploads/safety_initiative.pdf",
          "contentType": "application/pdf",
          "size": 1240320
        }
      ]
    },
    // More press releases...
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "pages": 3
  }
}
```

#### Get Press Release by ID

```
GET /api/press-releases/:id
```

#### Create Press Release

```
POST /api/press-releases
```

**Request Body:**
```json
{
  "title": "New Tourism Campaign Launched",
  "arabicTitle": "إطلاق حملة سياحية جديدة",
  "content": "Content of the press release...",
  "arabicContent": "محتوى البيان الصحفي...",
  "status": "draft",
  "categories": ["Tourism", "Marketing"]
}
```

#### Update Press Release

```
PUT /api/press-releases/:id
```

#### Delete Press Release

```
DELETE /api/press-releases/:id
```

#### Publish Press Release

```
POST /api/press-releases/:id/publish
```

**Response:**
```json
{
  "id": 2,
  "title": "New Tourism Campaign Launched",
  "status": "published",
  "publishedAt": "2025-03-15T14:22:31Z"
}
```

#### Schedule Press Release

```
POST /api/press-releases/:id/schedule
```

**Request Body:**
```json
{
  "scheduledFor": "2025-04-01T09:00:00Z"
}
```

**Response:**
```json
{
  "id": 3,
  "title": "Upcoming Festival Announcement",
  "status": "scheduled",
  "scheduledFor": "2025-04-01T09:00:00Z"
}
```

## Analytics Endpoints

### Sentiment Analysis

```
GET /api/sentiment-analysis
```

**Query Parameters:**
- `dateFrom` (optional): Start date
- `dateTo` (optional): End date
- `platform` (optional): Filter by platform
- `entity` (optional): Filter by entity

**Response:**
```json
{
  "overall": {
    "positive": 45,
    "neutral": 30,
    "negative": 25
  },
  "trend": [
    {
      "date": "2025-03-01",
      "positive": 42,
      "neutral": 33,
      "negative": 25
    },
    // More trend data...
  ],
  "byPlatform": [
    {
      "platform": "twitter",
      "positive": 48,
      "neutral": 27,
      "negative": 25
    },
    // More platform data...
  ],
  "byEntity": [
    {
      "entity": "Dubai",
      "positive": 65,
      "neutral": 27,
      "negative": 8
    },
    // More entity data...
  ]
}
```

### Social Media Statistics

```
GET /api/social-media/stats
```

**Query Parameters:**
- `dateFrom` (optional): Start date
- `dateTo` (optional): End date
- `platform` (optional): Filter by platform

**Response:**
```json
{
  "totalPosts": 1542,
  "totalEngagement": 89750,
  "averageEngagement": 58.2,
  "byPlatform": [
    {
      "platform": "twitter",
      "posts": 620,
      "engagement": 32450,
      "avgEngagement": 52.3
    },
    // More platform data...
  ],
  "trend": [
    {
      "date": "2025-03-01",
      "posts": 42,
      "engagement": 2450
    },
    // More trend data...
  ],
  "topHashtags": [
    {
      "hashtag": "#Dubai",
      "count": 245,
      "engagement": 15680
    },
    // More hashtag data...
  ],
  "topAuthors": [
    {
      "author": "Visit Dubai",
      "posts": 35,
      "engagement": 12540
    },
    // More author data...
  ]
}
```

### Media Coverage

```
GET /api/media-coverage
```

**Query Parameters:**
- `dateFrom` (optional): Start date
- `dateTo` (optional): End date
- `source` (optional): Filter by media source
- `topic` (optional): Filter by topic

**Response:**
```json
{
  "totalArticles": 487,
  "bySource": [
    {
      "source": "Gulf News",
      "count": 78,
      "reach": 2340000
    },
    // More source data...
  ],
  "byTopic": [
    {
      "topic": "Tourism",
      "count": 145,
      "sentiment": {
        "positive": 68,
        "neutral": 25,
        "negative": 7
      }
    },
    // More topic data...
  ],
  "trend": [
    {
      "date": "2025-03-01",
      "count": 18,
      "reach": 540000
    },
    // More trend data...
  ],
  "sentiment": {
    "positive": 65,
    "neutral": 30,
    "negative": 5
  }
}
```

## Chat and NLP Endpoints

### Process Chat Message

```
POST /api/chat
```

**Request Body:**
```json
{
  "message": "Show me social media statistics for last week",
  "language": "en"
}
```

**Response:**
```json
{
  "response": "Here are the social media statistics for last week...",
  "data": {
    "type": "social_media_stats",
    "period": "last_week",
    "stats": {
      // Statistics data...
    }
  },
  "intent": "get_social_media_stats",
  "confidence": 0.95
}
```

### Get Chat History

```
GET /api/chat/history
```

**Response:**
```json
{
  "history": [
    {
      "id": 1,
      "message": "Show me social media statistics for last week",
      "response": "Here are the social media statistics for last week...",
      "timestamp": "2025-03-15T10:22:45Z",
      "intent": "get_social_media_stats"
    },
    // More chat history...
  ]
}
```

### Clear Chat History

```
POST /api/chat/clear
```

**Response:**
```json
{
  "success": true,
  "message": "Chat history cleared"
}
```

### Analyze Text

```
POST /api/nlp/analyze
```

**Request Body:**
```json
{
  "text": "The new tourism campaign by Dubai Tourism has been very successful, attracting visitors from Europe and Asia.",
  "language": "en",
  "features": ["entities", "sentiment", "keywords"]
}
```

**Response:**
```json
{
  "sentiment": {
    "score": 0.78,
    "label": "positive",
    "confidence": 0.92
  },
  "entities": [
    {
      "text": "Dubai Tourism",
      "type": "ORGANIZATION",
      "confidence": 0.95
    },
    {
      "text": "Europe",
      "type": "LOCATION",
      "confidence": 0.97
    },
    {
      "text": "Asia",
      "type": "LOCATION",
      "confidence": 0.96
    }
  ],
  "keywords": [
    {
      "text": "tourism campaign",
      "relevance": 0.95
    },
    {
      "text": "Dubai Tourism",
      "relevance": 0.92
    },
    {
      "text": "visitors",
      "relevance": 0.85
    }
  ],
  "language": {
    "detected": "en",
    "confidence": 0.99
  }
}
```

## User Management

### List Users

```
GET /api/users
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `role` (optional): Filter by role (admin, editor, viewer)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "username": "admin",
      "fullName": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "lastLogin": "2025-03-15T08:12:34Z",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    // More users...
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

### Get User by ID

```
GET /api/users/:id
```

### Create User

```
POST /api/users
```

**Request Body:**
```json
{
  "username": "editor1",
  "fullName": "Jane Editor",
  "email": "jane@example.com",
  "password": "secure-password",
  "role": "editor"
}
```

### Update User

```
PUT /api/users/:id
```

### Delete User

```
DELETE /api/users/:id
```

## Content Analysis

### Analyze Sentiment

```
POST /api/analysis/sentiment
```

**Request Body:**
```json
{
  "text": "The new initiative has been well received by the public.",
  "language": "en"
}
```

**Response:**
```json
{
  "sentiment": "positive",
  "score": 0.75,
  "confidence": 0.92,
  "language": "en"
}
```

### Extract Entities

```
POST /api/analysis/entities
```

**Request Body:**
```json
{
  "text": "Dubai Municipality announced new regulations for restaurants and cafes.",
  "language": "en"
}
```

**Response:**
```json
{
  "entities": [
    {
      "text": "Dubai Municipality",
      "type": "ORGANIZATION",
      "confidence": 0.94
    },
    {
      "text": "restaurants",
      "type": "FACILITY",
      "confidence": 0.87
    },
    {
      "text": "cafes",
      "type": "FACILITY",
      "confidence": 0.85
    }
  ],
  "language": "en"
}
```

### Translate Text

```
POST /api/analysis/translate
```

**Request Body:**
```json
{
  "text": "Welcome to Dubai",
  "sourceLanguage": "en",
  "targetLanguage": "ar"
}
```

**Response:**
```json
{
  "original": "Welcome to Dubai",
  "translated": "مرحبا بكم في دبي",
  "sourceLanguage": "en",
  "targetLanguage": "ar"
}
```

## Reports

### List Reports

```
GET /api/reports
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `type` (optional): Filter by report type
- `dateFrom` (optional): Start date
- `dateTo` (optional): End date

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Monthly Social Media Performance",
      "type": "social_media",
      "createdAt": "2025-03-01T10:00:00Z",
      "createdBy": {
        "id": 1,
        "username": "admin",
        "fullName": "Admin User"
      },
      "dateRange": {
        "from": "2025-02-01",
        "to": "2025-02-28"
      },
      "status": "completed"
    },
    // More reports...
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 28,
    "pages": 2
  }
}
```

### Get Report by ID

```
GET /api/reports/:id
```

### Generate Report

```
POST /api/reports/generate
```

**Request Body:**
```json
{
  "title": "Media Coverage Report",
  "type": "media_coverage",
  "dateRange": {
    "from": "2025-03-01",
    "to": "2025-03-31"
  },
  "filters": {
    "sources": ["Gulf News", "Khaleej Times"],
    "topics": ["Tourism", "Business"]
  },
  "format": "pdf"
}
```

**Response:**
```json
{
  "id": 5,
  "title": "Media Coverage Report",
  "type": "media_coverage",
  "status": "processing",
  "estimatedCompletion": "2025-04-02T10:15:00Z"
}
```

### Export Report

```
GET /api/reports/:id/export/:format
```

## WebSocket API

The Media Pulse platform uses WebSockets for real-time communications, enabling:
- Live updates of social media posts
- Real-time analytics
- Instant notification of sentiment changes
- Alert notifications for monitored keywords

### Connection

Connect to the WebSocket server:

```
ws://your-server-url/ws
```

### Authentication

After connecting, send an authentication message:

```json
{
  "type": "auth",
  "token": "your-jwt-token"
}
```

### Subscribe to Topics

```json
{
  "type": "subscribe",
  "topics": ["social_updates", "sentiment_alerts", "keyword_alerts"]
}
```

### Example Messages

**New Social Post:**
```json
{
  "type": "social_update",
  "data": {
    "id": 1245,
    "platform": "twitter",
    "content": "Post content here",
    "author": "Author name",
    "publishedAt": "2025-04-02T09:15:22Z",
    "sentiment": "positive"
  }
}
```

**Sentiment Alert:**
```json
{
  "type": "sentiment_alert",
  "data": {
    "entity": "Dubai Tourism",
    "previousSentiment": "positive",
    "currentSentiment": "negative",
    "change": -0.45,
    "posts": [1245, 1246, 1247]
  }
}
```

**Keyword Alert:**
```json
{
  "type": "keyword_alert",
  "data": {
    "keyword": "service issues",
    "post": {
      "id": 1248,
      "platform": "twitter",
      "content": "Post content here",
      "author": "Author name",
      "publishedAt": "2025-04-02T09:18:45Z"
    }
  }
}
```