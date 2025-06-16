import OpenAI from 'openai';
import { logger } from '../logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class OpenAIService {
  /**
   * Generate a response using OpenAI as a fallback for Rasa
   * 
   * @param message The user message
   * @param context Additional context including conversation history
   * @returns Generated response text
   */
  public async generateResponse(message: string, context: { history?: Array<{role: string, content: string}> } = {}): Promise<string> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return "I'm sorry, but my advanced AI capabilities are currently unavailable. Please try again later.";
      }

      // Prepare system message with context about the platform
      const systemMessage = {
        role: 'system',
        content: `You are a helpful AI assistant for the Media Pulse platform, a media monitoring and digital content management system. 
                  You help users with information about media coverage, sentiment analysis, and content metrics. 
                  Keep responses concise and focused on media analytics.
                  If you don't know the answer to a question, suggest using the dashboard features for detailed analysis.`
      };

      // Prepare messages array including history if available
      const messages = [systemMessage];
      
      // Add conversation history if available
      if (context.history && context.history.length > 0) {
        messages.push(...context.history);
      }
      
      // Add the current user message
      messages.push({
        role: 'user',
        content: message
      });

      // Call OpenAI API
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages as any,
        max_tokens: 350,
        temperature: 0.7
      });

      // Return generated text
      return response.choices[0].message.content || "I'm not sure how to respond to that.";
    } catch (error) {
      logger.error('Error generating OpenAI response:', { error });
      return "I'm sorry, but I encountered an error processing your request. Please try again later.";
    }
  }
}

// Create and export instance
export const openaiService = new OpenAIService();