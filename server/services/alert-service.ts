import { storage } from "../storage";
import { InsertKeywordAlert, InsertSentimentReport } from "@shared/schema";
import { sendKeywordAlertEmail, sendSentimentAlertEmail } from "./email";

/**
 * Service for managing alert thresholds and sending notifications
 * when sentiment changes exceed defined thresholds
 */
export class AlertService {
  // Constants
  private readonly DEFAULT_THRESHOLD = 10;
  private readonly CHECK_INTERVAL_MINUTES = 30;
  
  // Timer for scheduled checks
  private alertCheckTimer: NodeJS.Timeout | null = null;
  
  /**
   * Initialize alert service and start scheduled checks
   */
  constructor() {
    // Start background alert checks
    this.startScheduledChecks();
  }
  
  /**
   * Start scheduled checks for alerts at regular intervals
   */
  startScheduledChecks() {
    if (this.alertCheckTimer) {
      clearInterval(this.alertCheckTimer);
    }
    
    // Check for alerts every CHECK_INTERVAL_MINUTES
    this.alertCheckTimer = setInterval(async () => {
      try {
        await this.checkForAlerts();
      } catch (error) {
        console.error('Error during scheduled alert check:', error);
      }
    }, this.CHECK_INTERVAL_MINUTES * 60 * 1000);
    
    console.log(`Alert service scheduled to check every ${this.CHECK_INTERVAL_MINUTES} minutes`);
  }
  
  /**
   * Stop scheduled alert checks
   */
  stopScheduledChecks() {
    if (this.alertCheckTimer) {
      clearInterval(this.alertCheckTimer);
      this.alertCheckTimer = null;
      console.log('Alert service scheduled checks stopped');
    }
  }
  
  /**
   * Check for new posts that contain monitored keywords
   */
  async checkForKeywordAlerts(): Promise<number> {
    try {
      console.log('Checking for keyword alerts...');
      let alertCount = 0;
      
      // Get active keywords
      const keywords = await storage.listKeywords(true);
      if (keywords.length === 0) {
        console.log('No active keywords to monitor');
        return 0;
      }
      
      // Get latest social posts since last check
      const lastHour = new Date();
      lastHour.setHours(lastHour.getHours() - 1);
      
      const recentPosts = await storage.listSocialPosts({
        dateFrom: lastHour
      });
      
      if (recentPosts.length === 0) {
        console.log('No recent posts to check');
        return 0;
      }
      
      console.log(`Checking ${recentPosts.length} recent posts for ${keywords.length} monitored keywords`);
      
      // Check each post for keyword matches
      for (const post of recentPosts) {
        const postContent = post.content.toLowerCase();
        const matchedKeywords = [];
        
        for (const keyword of keywords) {
          if (postContent.includes(keyword.word.toLowerCase())) {
            // Check if alert already exists for this post and keyword
            const existingAlerts = await storage.listKeywordAlerts({
              keywordId: keyword.id,
              socialPostId: post.id
            });
            
            if (existingAlerts.length === 0) {
              // Create new alert
              const newAlert: InsertKeywordAlert = {
                keywordId: keyword.id,
                socialPostId: post.id,
                alertDate: new Date(),
                isRead: false,
                alertSent: false
              };
              
              // Use admin-defined priority or calculate based on sentiment
              if (post.sentiment !== null) {
                // Lower sentiment (more negative) means higher priority
                if (post.sentiment < 30) {
                  newAlert.priority = 'high';
                } else if (post.sentiment < 60) {
                  newAlert.priority = 'medium';
                } else {
                  newAlert.priority = 'low';
                }
              }
              
              const alert = await storage.createKeywordAlert(newAlert);
              alertCount++;
              matchedKeywords.push(keyword);
              
              // Send notifications
              try {
                // Find users to notify (admin and editors)
                const users = await storage.listUsers();
                const notificationUsers = users.filter(user => 
                  user.role === 'admin' || user.role === 'editor'
                );
                
                if (notificationUsers.length > 0) {
                  for (const user of notificationUsers) {
                    await sendKeywordAlertEmail(
                      keyword.word,
                      post.content,
                      user.email,
                      user.language || 'en'
                    );
                  }
                  
                  // Mark alert as sent
                  await storage.updateKeywordAlert(alert.id, { alertSent: true });
                }
              } catch (emailError) {
                console.error(`Error sending keyword alert notification:`, emailError);
              }
              
              // Broadcast the alert via WebSocket if available
              if ((global as any).broadcastKeywordAlert) {
                (global as any).broadcastKeywordAlert(keyword.word, post, alert);
              }
            }
          }
        }
        
        if (matchedKeywords.length > 0) {
          console.log(`Post ID ${post.id} matched ${matchedKeywords.length} keywords: ${matchedKeywords.map(k => k.word).join(', ')}`);
        }
      }
      
      console.log(`Created ${alertCount} new keyword alerts`);
      return alertCount;
    } catch (error) {
      console.error('Error checking for keyword alerts:', error);
      return 0;
    }
  }
  
  /**
   * Check for significant sentiment shifts in recent reports
   */
  async checkForSentimentAlerts(): Promise<number> {
    try {
      console.log('Checking for sentiment alerts...');
      let alertCount = 0;
      
      // Get the last two sentiment reports for each platform
      const platforms = ['Twitter', 'Facebook', 'Instagram', 'News'];
      
      for (const platform of platforms) {
        // Get the two most recent reports for this platform
        const reports = await storage.listSentimentReports({
          platform,
          limit: 2
        });
        
        if (reports.length < 2) {
          console.log(`Not enough historical data for ${platform} to detect sentiment shifts`);
          continue;
        }
        
        // Sort by date (newest first)
        reports.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        const currentReport = reports[0];
        const previousReport = reports[1];
        
        // Calculate percentage changes for each sentiment category
        const positiveChange = this.calculatePercentageChange(
          previousReport.positive || 0, 
          currentReport.positive || 0
        );
        
        const negativeChange = this.calculatePercentageChange(
          previousReport.negative || 0, 
          currentReport.negative || 0
        );
        
        // Get threshold for this platform (default to DEFAULT_THRESHOLD)
        const keywords = await storage.listKeywords();
        const platformKeyword = keywords.find(k => k.word.toLowerCase() === platform.toLowerCase());
        const threshold = platformKeyword?.alertThreshold || this.DEFAULT_THRESHOLD;
        
        // Check if changes exceed threshold
        let significantShift = false;
        const changes: Record<string, number> = {};
        
        if (Math.abs(positiveChange) >= threshold) {
          changes.positive = positiveChange;
          significantShift = true;
        }
        
        if (Math.abs(negativeChange) >= threshold) {
          changes.negative = negativeChange;
          significantShift = true;
        }
        
        if (significantShift) {
          alertCount++;
          console.log(`Significant sentiment shift detected for ${platform}: ${JSON.stringify(changes)}`);
          
          // Determine alert priority based on the negative sentiment shift
          const priority = this.getPriorityFromSentiment(currentReport.negative);
          
          // Send notifications
          try {
            // Find users to notify (admin and editors)
            const users = await storage.listUsers();
            const notificationUsers = users.filter(user => 
              user.role === 'admin' || user.role === 'editor'
            );
            
            if (notificationUsers.length > 0) {
              for (const user of notificationUsers) {
                await sendSentimentAlertEmail(
                  {
                    platform,
                    previousReport,
                    currentReport,
                    changes,
                    priority
                  },
                  user.email,
                  user.language || 'en'
                );
              }
            }
          } catch (emailError) {
            console.error(`Error sending sentiment alert notification:`, emailError);
          }
          
          // Broadcast the alert via WebSocket if available
          if ((global as any).broadcastSentimentUpdate) {
            (global as any).broadcastSentimentUpdate({
              type: 'sentiment_alert',
              platform,
              previousReport,
              currentReport,
              changes,
              timestamp: new Date(),
              priority
            });
          }
        }
      }
      
      console.log(`Created ${alertCount} sentiment shift alerts`);
      return alertCount;
    } catch (error) {
      console.error('Error checking for sentiment alerts:', error);
      return 0;
    }
  }
  
  /**
   * Run all alert checks
   */
  async checkForAlerts(): Promise<{ keywordAlerts: number, sentimentAlerts: number }> {
    const keywordAlerts = await this.checkForKeywordAlerts();
    const sentimentAlerts = await this.checkForSentimentAlerts();
    
    return { keywordAlerts, sentimentAlerts };
  }
  
  /**
   * Calculate percentage change between two values
   */
  private calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) {
      return newValue === 0 ? 0 : 100; // Consider any change from 0 as 100% increase
    }
    
    return Math.round(((newValue - oldValue) / oldValue) * 100);
  }
  
  /**
   * Determine alert priority based on sentiment score
   */
  private getPriorityFromSentiment(sentiment: number | null): string {
    if (sentiment === null) return 'medium';
    
    if (sentiment > 70) return 'low';
    if (sentiment > 40) return 'medium';
    return 'high';
  }
}

export const alertService = new AlertService();
export default alertService;