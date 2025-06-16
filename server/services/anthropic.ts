import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const MODEL = "claude-3-7-sonnet-20250219";

// Initialize Anthropic client if API key is available
const anthropicClient = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

interface AnthropicOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * Service to interact with Anthropic Claude API
 */
class AnthropicService {
  /**
   * Check if the Anthropic service is available
   */
  isAvailable(): boolean {
    return !!process.env.ANTHROPIC_API_KEY && !!anthropicClient;
  }

  /**
   * Generate content using Anthropic Claude
   * @param prompt The user prompt
   * @param options Configuration options
   */
  async generateContent(
    prompt: string,
    options: AnthropicOptions = {}
  ): Promise<{ content: string }> {
    if (!this.isAvailable()) {
      throw new Error("Anthropic API is not available");
    }
    
    const {
      temperature = 0.7,
      maxTokens = 1024,
      systemPrompt = "You are a helpful AI assistant specialized in media monitoring and analysis."
    } = options;

    try {
      // We know anthropicClient is not null here due to isAvailable check
      const response = await anthropicClient!.messages.create({
        model: MODEL,
        system: systemPrompt,
        messages: [{ 
          role: 'user', 
          content: prompt 
        }],
        max_tokens: maxTokens,
        temperature,
      });

      // Extract text from the response
      let responseText = "";
      if (response.content && response.content.length > 0) {
        const firstContent = response.content[0];
        if ('text' in firstContent) {
          responseText = firstContent.text;
        }
      }
      
      return { content: responseText || "No response content available." };
    } catch (error) {
      console.error("Error generating content with Anthropic:", error);
      throw error;
    }
  }
}

export const anthropicService = new AnthropicService();