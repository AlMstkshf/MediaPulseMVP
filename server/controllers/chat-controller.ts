import { Request, Response } from 'express';
import { rasaService } from '../services/rasa-service';
import { openaiService } from '../services/openai-service';
import { db } from '../db';
import { storage } from '../storage';
import { logger } from '../logger';

/**
 * Controller to handle chat interactions
 */
export class ChatController {
  /**
   * Process a user message and return a bot response
   */
  public async processMessage(req: Request, res: Response) {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ 
          error: 'Invalid request. Message is required and must be a string.'
        });
      }

      // Get the current user ID
      const userId = req.user?.id || 0;
      
      // First try Rasa for the response
      let botResponse = '';
      let responseSource = 'rasa';
      
      // Check if Rasa is available
      if (rasaService.isAvailable()) {
        // Send message to Rasa
        const rasaResponses = await rasaService.sendMessage(userId.toString(), message);
        
        // Extract text from Rasa response
        if (rasaResponses && rasaResponses.length > 0 && rasaResponses[0].text) {
          botResponse = rasaResponses[0].text;
        }
      }
      
      // If no response from Rasa or Rasa is not available, use OpenAI as fallback
      if (!botResponse) {
        responseSource = 'openai';
        
        // Get chat history for context
        const history = await this.formatChatHistory(userId);
        
        // Generate response with OpenAI
        botResponse = await openaiService.generateResponse(message, { history });
      }
      
      // Save the user message to the chat history
      await storage.saveChatMessage({
        userId,
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      
      // Save the bot response to the chat history
      await storage.saveChatMessage({
        userId,
        role: 'bot',
        content: botResponse,
        timestamp: new Date()
      });
      
      // Return the bot response
      return res.json({ 
        response: botResponse, 
        source: responseSource 
      });
    } catch (error) {
      logger.error('Error processing chat message:', { error });
      return res.status(500).json({ 
        error: 'An error occurred while processing your message.' 
      });
    }
  }

  /**
   * Get the chat history for a user
   */
  public async getChatHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id || 0;
      
      // Get chat history from storage
      const history = await storage.getChatHistory(userId);
      
      return res.json(history);
    } catch (error) {
      logger.error('Error getting chat history:', { error });
      return res.status(500).json({ 
        error: 'An error occurred while fetching chat history.' 
      });
    }
  }

  /**
   * Clear the chat history for a user
   */
  public async clearChatHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id || 0;
      
      // Clear chat history in storage
      await storage.clearChatHistory(userId);
      
      return res.json({ 
        success: true, 
        message: 'Chat history cleared successfully.' 
      });
    } catch (error) {
      logger.error('Error clearing chat history:', { error });
      return res.status(500).json({ 
        error: 'An error occurred while clearing chat history.' 
      });
    }
  }

  /**
   * Format chat history for OpenAI context
   * @private
   */
  private async formatChatHistory(userId: number): Promise<Array<{role: string, content: string}>> {
    try {
      // Get chat history from storage
      const history = await storage.getChatHistory(userId);
      
      // Filter recent messages (last 10 messages) to stay within token limits
      const recentMessages = history.slice(-10);
      
      // Format for OpenAI context
      return recentMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
    } catch (error) {
      logger.error('Error formatting chat history:', { error });
      return [];
    }
  }
}

// Create and export the controller instance
export const chatController = new ChatController();