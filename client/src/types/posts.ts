import { z } from 'zod';

/**
 * Types for social media posts
 */

// Schema for validating test post input
export const TestPostInputSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  platform: z.string().min(1, 'Platform is required'),
  authorName: z.string().min(1, 'Author name is required'),
  authorUsername: z.string().min(1, 'Author username is required'),
  postUrl: z.string().url('Valid URL is required'),
  authorAvatarUrl: z.string().url().optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  engagement: z.object({
    likes: z.number().optional(),
    comments: z.number().optional(),
    shares: z.number().optional()
  }).optional()
});

// TypeScript type extracted from the schema
export type TestPostInput = z.infer<typeof TestPostInputSchema>;

// Social post as returned from the API
export interface SocialPost extends TestPostInput {
  id: number;
  createdAt: Date;
  postedAt?: Date | null;
}

// Response from creating a social post
export interface CreatePostResponse {
  id: number;
  platform: string;
  postUrl: string;
  createdAt: string;
  // Other fields from the API response
}