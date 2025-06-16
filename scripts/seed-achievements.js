// A script to generate SQL insert statements for our achievement badges

const badges = [
  {
    name: "Welcome Aboard",
    description: "Successfully logged in to the platform for the first time",
    category: "onboarding",
    iconurl: "https://cdn-icons-png.flaticon.com/512/6941/6941697.png",
    level: 1,
    points: 10,
    ishidden: false,
    criteria: { type: "login", count: 1 }
  },
  {
    name: "Active Journalist",
    description: "Created and published 5 media items",
    category: "content",
    iconurl: "https://cdn-icons-png.flaticon.com/512/4696/4696830.png",
    level: 1,
    points: 25,
    ishidden: false,
    criteria: { type: "create_media", count: 5 }
  },
  {
    name: "Media Maven",
    description: "Created and published 25 media items",
    category: "content",
    iconurl: "https://cdn-icons-png.flaticon.com/512/3588/3588614.png",
    level: 2,
    points: 50,
    ishidden: false,
    criteria: { type: "create_media", count: 25 }
  },
  {
    name: "Research Assistant",
    description: "Created and saved 3 reports",
    category: "analytics",
    iconurl: "https://cdn-icons-png.flaticon.com/512/3370/3370163.png",
    level: 1,
    points: 20,
    ishidden: false,
    criteria: { type: "create_report", count: 3 }
  },
  {
    name: "Data Analyst",
    description: "Created and saved 10 reports",
    category: "analytics",
    iconurl: "https://cdn-icons-png.flaticon.com/512/1925/1925044.png",
    level: 2,
    points: 40,
    ishidden: false,
    criteria: { type: "create_report", count: 10 }
  },
  {
    name: "Keyword Watcher",
    description: "Added 5 keywords to monitor",
    category: "monitoring",
    iconurl: "https://cdn-icons-png.flaticon.com/512/2972/2972153.png",
    level: 1,
    points: 15,
    ishidden: false,
    criteria: { type: "add_keyword", count: 5 }
  },
  {
    name: "Trend Spotter",
    description: "Identified 3 trending keywords",
    category: "monitoring",
    iconurl: "https://cdn-icons-png.flaticon.com/512/2082/2082860.png",
    level: 2,
    points: 30,
    ishidden: false,
    criteria: { type: "identify_trend", count: 3 }
  },
  {
    name: "Social Butterfly",
    description: "Connected 3 social media accounts",
    category: "social",
    iconurl: "https://cdn-icons-png.flaticon.com/512/1968/1968666.png",
    level: 1,
    points: 20,
    ishidden: false,
    criteria: { type: "connect_social", count: 3 }
  },
  {
    name: "Engagement Expert",
    description: "Achieved 1000+ engagement on social posts",
    category: "social",
    iconurl: "https://cdn-icons-png.flaticon.com/512/7997/7997946.png",
    level: 2,
    points: 45,
    ishidden: false,
    criteria: { type: "social_engagement", count: 1000 }
  },
  {
    name: "Sentiment Sage",
    description: "Analyzed sentiment for 50 posts",
    category: "analysis",
    iconurl: "https://cdn-icons-png.flaticon.com/512/2000/2000582.png",
    level: 2,
    points: 35,
    ishidden: false,
    criteria: { type: "analyze_sentiment", count: 50 }
  },
  {
    name: "Dedicated User",
    description: "Logged in for 7 consecutive days",
    category: "engagement",
    iconurl: "https://cdn-icons-png.flaticon.com/512/4301/4301828.png",
    level: 1,
    points: 30,
    ishidden: false,
    criteria: { type: "login_streak", count: 7 }
  },
  {
    name: "Platform Devotee",
    description: "Logged in for 30 consecutive days",
    category: "engagement",
    iconurl: "https://cdn-icons-png.flaticon.com/512/3176/3176384.png",
    level: 3,
    points: 100,
    ishidden: false,
    criteria: { type: "login_streak", count: 30 }
  },
  {
    name: "Tutorial Master",
    description: "Completed all tutorial videos",
    category: "learning",
    iconurl: "https://cdn-icons-png.flaticon.com/512/2490/2490396.png",
    level: 2,
    points: 50,
    ishidden: false,
    criteria: { type: "complete_tutorial", count: 10 }
  },
  {
    name: "I18n Explorer",
    description: "Used the platform in both Arabic and English modes",
    category: "localization",
    iconurl: "https://cdn-icons-png.flaticon.com/512/5652/5652022.png",
    level: 1,
    points: 15,
    ishidden: false,
    criteria: { type: "switch_language", count: 2 }
  },
  {
    name: "Hidden Gem",
    description: "Discover this secret achievement",
    category: "easter_egg",
    iconurl: "https://cdn-icons-png.flaticon.com/512/4543/4543055.png",
    level: 3,
    points: 75,
    ishidden: true,
    criteria: { type: "discover_secret", count: 1 }
  }
];

// Generate SQL INSERT statements
const sqlInserts = badges.map(badge => {
  return `INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('${badge.name}', '${badge.description}', '${badge.category}', '${badge.iconurl}', ${badge.level}, ${badge.points}, ${badge.ishidden}, '${JSON.stringify(badge.criteria)}');`;
}).join('\n');

console.log(sqlInserts);

// Generate SQL for user_gamification_stats for first user
console.log(`
-- Initialize gamification stats for the first user
INSERT INTO user_gamification_stats (userid, level, totalpoints, streak, lastactivitydate, metrics)
VALUES (1, 1, 10, 1, CURRENT_TIMESTAMP, '{"logins": 1, "reportsCreated": 0, "mediaItemsCreated": 0, "keywordsAdded": 0}');

-- Unlock the welcome badge for the first user
INSERT INTO user_achievements (userid, badgeid, isunlocked, progress, unlockedat)
VALUES (1, (SELECT id FROM achievement_badges WHERE name = 'Welcome Aboard'), true, 1, CURRENT_TIMESTAMP);
`);