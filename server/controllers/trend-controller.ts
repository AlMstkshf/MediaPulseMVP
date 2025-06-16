import { Request, Response } from 'express';
import { trendAnalysisService } from '../services/trend-analysis-service';
import { logger } from '../logger';

/**
 * Controller for trend analysis endpoints
 * Provides API routes for accessing trend data
 */
export class TrendController {
  /**
   * Gets trending keywords for visualization
   * @param req Request with query parameters (days, platform, limit)
   * @param res Response with trending keywords
   */
  async getTrendingKeywords(req: Request, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const platform = req.query.platform as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const trends = await trendAnalysisService.getTrendingKeywords(days, platform, limit);
      
      res.json({
        success: true,
        trends
      });
    } catch (error) {
      logger.error('Error getting trending keywords', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve trending keywords'
      });
    }
  }
  
  /**
   * Gets entity trends data
   * @param req Request with query parameters (days, limit)
   * @param res Response with entity trends
   */
  async getEntityTrends(req: Request, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      const entities = await trendAnalysisService.getEntityTrends(days, limit);
      
      res.json({
        success: true,
        entities
      });
    } catch (error) {
      logger.error('Error getting entity trends', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve entity trends'
      });
    }
  }
  
  /**
   * Gets AI-powered insights
   * @param req Request with query parameters (days, platform)
   * @param res Response with AI insights
   */
  async getAIInsights(req: Request, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const platform = req.query.platform as string | undefined;
      
      const insights = await trendAnalysisService.getAIInsights(days, platform);
      
      res.json({
        success: true,
        ...insights
      });
    } catch (error) {
      logger.error('Error getting AI insights', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve AI insights'
      });
    }
  }
  
  /**
   * Gets sentiment trend data
   * @param req Request with query parameters (days, platform)
   * @param res Response with sentiment data
   */
  async getSentimentTrend(req: Request, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const platform = req.query.platform as string | undefined;
      
      const sentimentData = await trendAnalysisService.getSentimentTrend(days, platform);
      
      res.json({
        success: true,
        sentimentData
      });
    } catch (error) {
      logger.error('Error getting sentiment trend', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve sentiment trend'
      });
    }
  }
}

export const trendController = new TrendController();