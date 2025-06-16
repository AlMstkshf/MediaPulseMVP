#!/bin/bash

# First, login to get the session cookie
echo "Logging in as admin..."
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  -c cookies.txt \
  http://localhost:5000/api/login > /dev/null

# Now submit the social account with our authenticated session
echo "Submitting new social account..."
curl -s -X POST -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "platform": "twitter",
    "account": {
      "handle": "@UAETechHub",
      "name": "UAE Technology Hub",
      "followers": 95750,
      "description": "Leading technology news and updates from across the UAE.",
      "location": "UAE",
      "joinDate": "2018-05-12",
      "verified": true,
      "metrics": {
        "likes": 28765,
        "retweets": 12431,
        "comments": 8954,
        "engagementRate": 4.2
      },
      "sentiment": {
        "positive": 79,
        "neutral": 16,
        "negative": 5
      }
    }
  }' \
  http://localhost:5000/api/social/accounts

# Check logs for the API request
echo -e "\nServer logs:"
curl -s "http://localhost:5000/api/user" -b cookies.txt
