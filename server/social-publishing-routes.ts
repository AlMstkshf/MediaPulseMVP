import { Express, Request, Response } from "express";
import * as nlpService from "./services/nlp-service";
import { db } from "./db";
import { scheduledPosts } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerSocialPublishingRoutes(app: Express, isEditorOrAdmin: any, isAuthenticated: any) {
  /**
   * Generate content for social media post
   */
  app.post("/api/social/generate-content", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const {
        prompt,
        platform = "twitter",
        includeHashtags = true,
        includeEngagementPrediction = true,
        includeBestTimeToPost = true,
        includeArabic = true,
        requestMedia = false,
        creativityLevel = 0.7
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Generate the content using NLP Service's new direct function
      const generatedResult = await nlpService.generateSocialMediaContent({
        prompt,
        platform,
        includeArabic,
        creativityLevel
      });
      
      // Prepare the result
      const result: any = { 
        content: generatedResult.content,
        citations: [] // NLP service doesn't provide citations
      };

      // Include hashtags if requested
      if (includeHashtags && generatedResult.hashtags) {
        result.hashtags = generatedResult.hashtags;
      }

      // Include best time to post if requested
      if (includeBestTimeToPost && generatedResult.bestTimeToPost) {
        result.bestTimeToPost = generatedResult.bestTimeToPost;
      }

      // Include engagement prediction if requested
      if (includeEngagementPrediction && generatedResult.estimatedEngagement) {
        result.estimatedEngagement = generatedResult.estimatedEngagement;
      }

      // Analyze sentiment using NLP service
      const sentimentResult = await nlpService.getBestSentimentAnalysis(prompt);
      const sentimentScore = sentimentResult ? sentimentResult.score * 20 : 50; // Convert 1-5 scale to 0-100
      result.sentimentScore = sentimentScore;

      // Add media suggestions if requested
      if (requestMedia && generatedResult.mediaSuggestions) {
        result.mediaSuggestions = generatedResult.mediaSuggestions;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ 
        message: "Failed to generate content", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  /**
   * Analyze a draft social media post
   */
  app.post("/api/social/analyze-post", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { content, platform = "twitter" } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      // Use the NLP service to analyze the content
      const [sentimentAnalysis, contentGeneration] = await Promise.all([
        // Analyze sentiment using NLP service
        nlpService.getBestSentimentAnalysis(content),
        // Generate additional content suggestions
        nlpService.generateSocialMediaContent({
          prompt: `Analyze this social media post: ${content}`,
          platform
        })
      ]);

      // Calculate sentiment score (1-5 scale to 0-100)
      const sentimentScore = sentimentAnalysis ? sentimentAnalysis.score * 20 : 50;

      // Get engagement predictions from the content generation
      const engagementMetrics = contentGeneration.estimatedEngagement || {
        likes: 45,
        comments: 8,
        shares: 12
      };

      // Use hashtags from the content generation
      const hashtags = contentGeneration.hashtags || ['#AjmanPolice', '#Safety', '#Security', '#Community'];

      // Use best time to post from the content generation
      const bestTimeToPost = contentGeneration.bestTimeToPost || "Thursday, 9:00 AM";

      res.status(200).json({
        sentimentScore,
        engagementPrediction: engagementMetrics,
        suggestedHashtags: hashtags,
        bestTimeToPost,
        analysis: {
          source: sentimentAnalysis ? sentimentAnalysis.source : 'OpenAI',
          confidence: sentimentAnalysis ? sentimentAnalysis.confidence : 0.7,
          sentiment: sentimentAnalysis ? sentimentAnalysis.sentiment : 'neutral'
        }
      });
    } catch (error) {
      console.error("Error analyzing post:", error);
      res.status(500).json({ 
        message: "Failed to analyze post", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  /**
   * Generate hashtag recommendations
   */
  app.post("/api/social/generate-hashtags", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { content, platform = "twitter", count = 5 } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      // Generate hashtags using the NLP service
      const generatedContent = await nlpService.generateSocialMediaContent({
        prompt: `Generate relevant hashtags for this social media post: ${content}`,
        platform
      });
      
      // Default hashtags in case the service doesn't return enough
      const defaultHashtags = [
        '#AjmanPolice', 
        '#Safety', 
        '#Security', 
        '#Community', 
        '#UAE', 
        '#Ajman', 
        '#Police',
        '#EmiratesPolice'
      ];
      
      // Combine generated hashtags with defaults if needed
      let hashtags = generatedContent.hashtags || [];
      
      // If we don't have enough hashtags, add some from the defaults
      if (hashtags.length < count) {
        // Add defaults that are not already in the generated hashtags
        const additionalHashtags = defaultHashtags.filter(tag => !hashtags.includes(tag));
        hashtags = [...hashtags, ...additionalHashtags].slice(0, count);
      } else if (hashtags.length > count) {
        // Trim to requested count
        hashtags = hashtags.slice(0, count);
      }
      
      res.status(200).json({ 
        hashtags,
        suggestedTopics: generatedContent.mediaSuggestions || []
      });
    } catch (error) {
      console.error("Error generating hashtags:", error);
      res.status(500).json({ 
        message: "Failed to generate hashtags", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  /**
   * Generate smart hashtags with trend insights and relevance metrics
   * This enhanced endpoint provides hashtag recommendations based on content analysis and trending topics
   */
  app.post("/api/social/smart-hashtags", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { 
        content, 
        platform = "twitter", 
        count = 8, 
        includeGenericHashtags = true 
      } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      // Fetch trending topics to incorporate into recommendations
      const trendingTopicsResponse = await fetch(`http://localhost:5000/api/social-posts/trending-topics`);
      const trendingTopics = await trendingTopicsResponse.json();
      
      // Generate smart hashtags using the enhanced NLP service
      const smartHashtagsResult = await nlpService.generateSmartHashtags({
        content,
        platform,
        trendingTopics,
        count,
        includeGenericHashtags
      });
      
      // Format the response
      const response = {
        recommendedHashtags: smartHashtagsResult.hashtags.map(tag => `#${tag}`),
        trendingHashtags: smartHashtagsResult.trending.map(tag => `#${tag}`),
        relevanceScores: smartHashtagsResult.relevanceScores,
        insightSummary: smartHashtagsResult.insightSummary,
        trendingTopics: trendingTopics.slice(0, 5) // Include top 5 trending topics
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error("Error generating smart hashtags:", error);
      res.status(500).json({ 
        message: "Failed to generate smart hashtags", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  /**
   * Get scheduled posts
   */
  app.get("/api/social/scheduled-posts", isAuthenticated, async (_req: Request, res: Response) => {
    try {
      const posts = await db.select().from(scheduledPosts).orderBy(scheduledPosts.scheduledTime);
      res.status(200).json(posts);
    } catch (error) {
      console.error("Error getting scheduled posts:", error);
      res.status(500).json({ 
        message: "Failed to get scheduled posts", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  /**
   * Schedule a post for publishing
   */
  app.post("/api/social/schedule-post", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const {
        content,
        platform,
        scheduledTime,
        hashtags = [],
        mediaUrls = [],
        aiGenerated = false,
        metadata = {}
      } = req.body;

      if (!content || !platform || !scheduledTime) {
        return res.status(400).json({ message: "Content, platform, and scheduledTime are required" });
      }

      // Insert post into database
      const [scheduledPost] = await db.insert(scheduledPosts).values({
        content,
        platform,
        scheduledTime: new Date(scheduledTime),
        hashtags,
        mediaUrls,
        aiGenerated,
        metadata,
        status: "scheduled"
        // Note: createdBy is not in the scheduledPosts schema
      }).returning();

      res.status(201).json(scheduledPost);
    } catch (error) {
      console.error("Error scheduling post:", error);
      res.status(500).json({ 
        message: "Failed to schedule post", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  /**
   * Update a scheduled post
   */
  app.patch("/api/social/scheduled-posts/:id", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const {
        content,
        platform,
        scheduledTime,
        hashtags,
        mediaUrls,
        status,
        metadata
      } = req.body;

      // Update post in database
      const [updatedPost] = await db.update(scheduledPosts)
        .set({
          content: content !== undefined ? content : undefined,
          platform: platform !== undefined ? platform : undefined,
          scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
          hashtags: hashtags !== undefined ? hashtags : undefined,
          mediaUrls: mediaUrls !== undefined ? mediaUrls : undefined,
          status: status !== undefined ? status : undefined,
          metadata: metadata !== undefined ? metadata : undefined
        })
        .where(eq(scheduledPosts.id, id))
        .returning();

      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json(updatedPost);
    } catch (error) {
      console.error("Error updating scheduled post:", error);
      res.status(500).json({ 
        message: "Failed to update scheduled post", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  /**
   * Delete a scheduled post
   */
  app.delete("/api/social/scheduled-posts/:id", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      // Delete post from database
      await db.delete(scheduledPosts).where(eq(scheduledPosts.id, id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting scheduled post:", error);
      res.status(500).json({ 
        message: "Failed to delete scheduled post", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  /**
   * Publish a post immediately (bypassing scheduling)
   */
  app.post("/api/social/publish-now", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const {
        content,
        platform,
        hashtags = [],
        mediaUrls = []
      } = req.body;

      if (!content || !platform) {
        return res.status(400).json({ message: "Content and platform are required" });
      }

      // TODO: In a real implementation, we would use the platform APIs to post directly
      // For now, we'll simulate this by creating a "published" record
      
      // Log the attempt to publish
      console.log(`Publishing to ${platform}: ${content}`);
      console.log(`Hashtags: ${hashtags.join(', ')}`);
      console.log(`Media: ${mediaUrls.join(', ')}`);

      // Insert as a published post in our database
      const [publishedPost] = await db.insert(scheduledPosts).values({
        content,
        platform,
        scheduledTime: new Date(),
        publishedAt: new Date(),
        hashtags,
        mediaUrls,
        status: "published",
        aiGenerated: false, // Default to false for direct publishing
        metadata: {} // Empty metadata for direct publishing
      }).returning();

      res.status(201).json({
        ...publishedPost,
        message: "Post published successfully" 
      });
    } catch (error) {
      console.error("Error publishing post:", error);
      res.status(500).json({ 
        message: "Failed to publish post", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  /**
   * Get best posting times
   */
  app.get("/api/social/best-posting-times", isAuthenticated, (_req: Request, res: Response) => {
    // This would typically be dynamically generated based on analytics data
    // For now, we'll return static recommendations
    const bestPostingTimes = {
      twitter: [
        {
          day: "Monday",
          times: ["7:00 AM", "12:00 PM", "5:00 PM"]
        },
        {
          day: "Tuesday",
          times: ["8:00 AM", "1:00 PM", "6:00 PM"]
        },
        {
          day: "Wednesday",
          times: ["7:30 AM", "12:30 PM", "5:30 PM"]
        },
        {
          day: "Thursday",
          times: ["8:30 AM", "2:00 PM", "7:00 PM"]
        },
        {
          day: "Friday",
          times: ["9:00 AM", "3:00 PM", "8:00 PM"]
        },
        {
          day: "Saturday",
          times: ["10:00 AM", "4:00 PM", "9:00 PM"]
        },
        {
          day: "Sunday",
          times: ["11:00 AM", "3:00 PM", "7:30 PM"]
        }
      ],
      facebook: [
        {
          day: "Monday",
          times: ["8:00 AM", "1:00 PM", "7:00 PM"]
        },
        {
          day: "Tuesday",
          times: ["9:00 AM", "2:00 PM", "6:00 PM"]
        },
        {
          day: "Wednesday",
          times: ["8:30 AM", "1:30 PM", "6:30 PM"]
        },
        {
          day: "Thursday",
          times: ["9:30 AM", "3:00 PM", "8:00 PM"]
        },
        {
          day: "Friday",
          times: ["10:00 AM", "2:00 PM", "6:00 PM"]
        },
        {
          day: "Saturday",
          times: ["11:00 AM", "3:00 PM", "7:00 PM"]
        },
        {
          day: "Sunday",
          times: ["12:00 PM", "4:00 PM", "8:30 PM"]
        }
      ],
      instagram: [
        {
          day: "Monday",
          times: ["11:00 AM", "2:00 PM", "9:00 PM"]
        },
        {
          day: "Tuesday",
          times: ["10:00 AM", "3:00 PM", "8:00 PM"]
        },
        {
          day: "Wednesday",
          times: ["11:30 AM", "3:30 PM", "9:30 PM"]
        },
        {
          day: "Thursday",
          times: ["10:30 AM", "4:00 PM", "8:30 PM"]
        },
        {
          day: "Friday",
          times: ["12:00 PM", "5:00 PM", "10:00 PM"]
        },
        {
          day: "Saturday",
          times: ["10:00 AM", "7:00 PM", "11:00 PM"]
        },
        {
          day: "Sunday",
          times: ["9:00 AM", "4:00 PM", "8:00 PM"]
        }
      ],
      linkedin: [
        {
          day: "Monday",
          times: ["8:00 AM", "12:00 PM", "5:00 PM"]
        },
        {
          day: "Tuesday",
          times: ["7:00 AM", "11:00 AM", "4:00 PM"]
        },
        {
          day: "Wednesday",
          times: ["8:30 AM", "12:30 PM", "5:30 PM"]
        },
        {
          day: "Thursday",
          times: ["8:00 AM", "1:00 PM", "4:30 PM"]
        },
        {
          day: "Friday",
          times: ["9:00 AM", "1:00 PM", "4:00 PM"]
        },
        {
          day: "Saturday",
          times: ["10:00 AM", "3:00 PM"]
        },
        {
          day: "Sunday",
          times: ["11:00 AM", "4:00 PM"]
        }
      ]
    };

    res.status(200).json(bestPostingTimes);
  });
}