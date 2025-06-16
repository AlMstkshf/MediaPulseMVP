INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Welcome Aboard', 'Successfully logged in to the platform for the first time', 'onboarding', 'https://cdn-icons-png.flaticon.com/512/6941/6941697.png', 1, 10, false, '{"type":"login","count":1}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Active Journalist', 'Created and published 5 media items', 'content', 'https://cdn-icons-png.flaticon.com/512/4696/4696830.png', 1, 25, false, '{"type":"create_media","count":5}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Media Maven', 'Created and published 25 media items', 'content', 'https://cdn-icons-png.flaticon.com/512/3588/3588614.png', 2, 50, false, '{"type":"create_media","count":25}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Research Assistant', 'Created and saved 3 reports', 'analytics', 'https://cdn-icons-png.flaticon.com/512/3370/3370163.png', 1, 20, false, '{"type":"create_report","count":3}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Data Analyst', 'Created and saved 10 reports', 'analytics', 'https://cdn-icons-png.flaticon.com/512/1925/1925044.png', 2, 40, false, '{"type":"create_report","count":10}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Keyword Watcher', 'Added 5 keywords to monitor', 'monitoring', 'https://cdn-icons-png.flaticon.com/512/2972/2972153.png', 1, 15, false, '{"type":"add_keyword","count":5}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Trend Spotter', 'Identified 3 trending keywords', 'monitoring', 'https://cdn-icons-png.flaticon.com/512/2082/2082860.png', 2, 30, false, '{"type":"identify_trend","count":3}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Social Butterfly', 'Connected 3 social media accounts', 'social', 'https://cdn-icons-png.flaticon.com/512/1968/1968666.png', 1, 20, false, '{"type":"connect_social","count":3}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Engagement Expert', 'Achieved 1000+ engagement on social posts', 'social', 'https://cdn-icons-png.flaticon.com/512/7997/7997946.png', 2, 45, false, '{"type":"social_engagement","count":1000}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Sentiment Sage', 'Analyzed sentiment for 50 posts', 'analysis', 'https://cdn-icons-png.flaticon.com/512/2000/2000582.png', 2, 35, false, '{"type":"analyze_sentiment","count":50}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Dedicated User', 'Logged in for 7 consecutive days', 'engagement', 'https://cdn-icons-png.flaticon.com/512/4301/4301828.png', 1, 30, false, '{"type":"login_streak","count":7}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Platform Devotee', 'Logged in for 30 consecutive days', 'engagement', 'https://cdn-icons-png.flaticon.com/512/3176/3176384.png', 3, 100, false, '{"type":"login_streak","count":30}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Tutorial Master', 'Completed all tutorial videos', 'learning', 'https://cdn-icons-png.flaticon.com/512/2490/2490396.png', 2, 50, false, '{"type":"complete_tutorial","count":10}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('I18n Explorer', 'Used the platform in both Arabic and English modes', 'localization', 'https://cdn-icons-png.flaticon.com/512/5652/5652022.png', 1, 15, false, '{"type":"switch_language","count":2}');
INSERT INTO achievement_badges (name, description, category, iconurl, level, points, ishidden, criteria) 
  VALUES ('Hidden Gem', 'Discover this secret achievement', 'easter_egg', 'https://cdn-icons-png.flaticon.com/512/4543/4543055.png', 3, 75, true, '{"type":"discover_secret","count":1}');

-- Initialize gamification stats for the first user
INSERT INTO user_gamification_stats (userid, level, totalpoints, streak, lastactivitydate, metrics)
VALUES (1, 1, 10, 1, CURRENT_TIMESTAMP, '{"logins": 1, "reportsCreated": 0, "mediaItemsCreated": 0, "keywordsAdded": 0}');

-- Unlock the welcome badge for the first user
INSERT INTO user_achievements (userid, badgeid, isunlocked, progress, unlockedat)
VALUES (1, (SELECT id FROM achievement_badges WHERE name = 'Welcome Aboard'), true, 1, CURRENT_TIMESTAMP);

