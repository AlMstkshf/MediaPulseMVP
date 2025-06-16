import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertJournalistSchema, 
  insertMediaSourceSchema,
  insertPressReleaseSchema
} from "@shared/schema";
import { db, pool } from "./db";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { journalists, mediaSources, pressReleases } from "@shared/schema";

/**
 * Register media center related routes for journalists, media sources, and press releases
 */
export function registerMediaCenterRoutes(app: Express, isAuthenticated: any, isEditorOrAdmin: any) {
  
  // Journalists API endpoints
  
  /**
   * Get all journalists with optional filtering
   */
  app.get("/api/journalists", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { organization, beat, isActive, search } = req.query;
      
      // Use direct SQL query since our schema doesn't match the actual table structure
      let queryText = `SELECT * FROM journalists WHERE 1=1`;
      const queryParams: any[] = [];
      
      // Apply filters
      if (organization) {
        queryParams.push(organization);
        queryText += ` AND organization = $${queryParams.length}`;
      }
      
      if (beat) {
        queryParams.push(beat);
        queryText += ` AND beat = $${queryParams.length}`;
      }
      
      if (isActive !== undefined) {
        const activeValue = isActive === 'true';
        queryParams.push(activeValue);
        queryText += ` AND is_active = $${queryParams.length}`;
      }
      
      if (search) {
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern);
        queryText += ` AND (name ILIKE $${queryParams.length} OR email ILIKE $${queryParams.length} OR organization ILIKE $${queryParams.length})`;
      }
      
      // Order by newest first
      queryText += ` ORDER BY created_at DESC`;
      
      const result = await pool.query(queryText, queryParams);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching journalists:", error);
      res.status(500).json({ message: "Failed to fetch journalists" });
    }
  });
  
  /**
   * Get a specific journalist by ID
   */
  app.get("/api/journalists/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use parameterized query for direct SQL access
      const result = await pool.query('SELECT * FROM journalists WHERE id = $1', [parseInt(id)]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Journalist not found" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching journalist:", error);
      res.status(500).json({ message: "Failed to fetch journalist" });
    }
  });
  
  /**
   * Create a new journalist
   */
  app.post("/api/journalists", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { name, arabic_name, email, phone, organization, avatar_url, bio, beat, is_active } = req.body;
      
      // Check if email already exists
      const existingResult = await pool.query('SELECT * FROM journalists WHERE email = $1', [email]);
      
      if (existingResult.rows.length > 0) {
        return res.status(409).json({ message: "Journalist with this email already exists" });
      }
      
      // Insert journalist with direct SQL
      const insertResult = await pool.query(
        `INSERT INTO journalists 
         (name, arabic_name, email, phone, organization, avatar_url, bio, beat, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [name, arabic_name, email, phone, organization, avatar_url, bio, beat, is_active === false ? false : true]
      );
      
      res.status(201).json(insertResult.rows[0]);
    } catch (error) {
      console.error("Error creating journalist:", error);
      res.status(500).json({ message: "Failed to create journalist" });
    }
  });
  
  /**
   * Update an existing journalist
   */
  app.put("/api/journalists/:id", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, arabic_name, email, phone, organization, avatar_url, bio, beat, is_active } = req.body;
      
      // Check if journalist exists
      const existingResult = await pool.query('SELECT * FROM journalists WHERE id = $1', [parseInt(id)]);
      
      if (existingResult.rows.length === 0) {
        return res.status(404).json({ message: "Journalist not found" });
      }
      
      // Check if email already exists for a different journalist
      if (email) {
        const emailCheckResult = await pool.query(
          'SELECT * FROM journalists WHERE email = $1 AND id != $2', 
          [email, parseInt(id)]
        );
        
        if (emailCheckResult.rows.length > 0) {
          return res.status(409).json({ message: "Another journalist with this email already exists" });
        }
      }
      
      // Update journalist with direct SQL
      const updateResult = await pool.query(
        `UPDATE journalists 
         SET name = COALESCE($1, name),
             arabic_name = COALESCE($2, arabic_name),
             email = COALESCE($3, email),
             phone = COALESCE($4, phone),
             organization = COALESCE($5, organization),
             avatar_url = COALESCE($6, avatar_url),
             bio = COALESCE($7, bio),
             beat = COALESCE($8, beat),
             is_active = COALESCE($9, is_active)
         WHERE id = $10
         RETURNING *`,
        [name, arabic_name, email, phone, organization, avatar_url, bio, beat, is_active, parseInt(id)]
      );
      
      res.json(updateResult.rows[0]);
    } catch (error) {
      console.error("Error updating journalist:", error);
      res.status(500).json({ message: "Failed to update journalist" });
    }
  });
  
  /**
   * Delete a journalist
   */
  app.delete("/api/journalists/:id", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if journalist exists
      const existingResult = await pool.query('SELECT * FROM journalists WHERE id = $1', [parseInt(id)]);
      
      if (existingResult.rows.length === 0) {
        return res.status(404).json({ message: "Journalist not found" });
      }
      
      // Delete journalist with direct SQL
      await pool.query('DELETE FROM journalists WHERE id = $1', [parseInt(id)]);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting journalist:", error);
      res.status(500).json({ message: "Failed to delete journalist" });
    }
  });
  
  // Media Sources API endpoints
  
  /**
   * Get all media sources with optional filtering
   */
  app.get("/api/media-sources", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { country, type, isActive, search } = req.query;
      
      // Use direct SQL query since our schema doesn't match the actual table structure
      let queryText = `SELECT * FROM media_sources WHERE 1=1`;
      const queryParams: any[] = [];
      
      // Apply filters
      if (country) {
        queryParams.push(country);
        queryText += ` AND country = $${queryParams.length}`;
      }
      
      if (type) {
        queryParams.push(type);
        queryText += ` AND type = $${queryParams.length}`;
      }
      
      if (isActive !== undefined) {
        const activeValue = isActive === 'true';
        queryParams.push(activeValue);
        queryText += ` AND is_active = $${queryParams.length}`;
      }
      
      if (search) {
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern);
        queryText += ` AND (name ILIKE $${queryParams.length} OR arabic_name ILIKE $${queryParams.length})`;
      }
      
      // Order by newest first
      queryText += ` ORDER BY created_at DESC`;
      
      const result = await pool.query(queryText, queryParams);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching media sources:", error);
      res.status(500).json({ message: "Failed to fetch media sources" });
    }
  });
  
  /**
   * Get a specific media source by ID
   */
  app.get("/api/media-sources/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use parameterized query for direct SQL access
      const result = await pool.query('SELECT * FROM media_sources WHERE id = $1', [parseInt(id)]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Media source not found" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching media source:", error);
      res.status(500).json({ message: "Failed to fetch media source" });
    }
  });
  
  /**
   * Create a new media source
   */
  app.post("/api/media-sources", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { name, arabic_name, url, type, language, country, logo, is_active } = req.body;
      
      // Check if name already exists
      const existingResult = await pool.query('SELECT * FROM media_sources WHERE name = $1', [name]);
      
      if (existingResult.rows.length > 0) {
        return res.status(409).json({ message: "Media source with this name already exists" });
      }
      
      // Insert media source with direct SQL
      const insertResult = await pool.query(
        `INSERT INTO media_sources 
         (name, arabic_name, url, type, language, country, logo, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [name, arabic_name, url, type, language || 'en', country || 'UAE', logo, is_active === false ? false : true]
      );
      
      res.status(201).json(insertResult.rows[0]);
    } catch (error) {
      console.error("Error creating media source:", error);
      res.status(500).json({ message: "Failed to create media source" });
    }
  });
  
  /**
   * Update an existing media source
   */
  app.put("/api/media-sources/:id", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, arabic_name, url, type, language, country, logo, is_active } = req.body;
      
      // Check if media source exists
      const existingResult = await pool.query('SELECT * FROM media_sources WHERE id = $1', [parseInt(id)]);
      
      if (existingResult.rows.length === 0) {
        return res.status(404).json({ message: "Media source not found" });
      }
      
      // Check if name already exists for a different source
      if (name) {
        const nameCheckResult = await pool.query(
          'SELECT * FROM media_sources WHERE name = $1 AND id != $2', 
          [name, parseInt(id)]
        );
        
        if (nameCheckResult.rows.length > 0) {
          return res.status(409).json({ message: "Another media source with this name already exists" });
        }
      }
      
      // Update media source with direct SQL
      const updateResult = await pool.query(
        `UPDATE media_sources 
         SET name = COALESCE($1, name),
             arabic_name = COALESCE($2, arabic_name),
             url = COALESCE($3, url),
             type = COALESCE($4, type),
             language = COALESCE($5, language),
             country = COALESCE($6, country),
             logo = COALESCE($7, logo),
             is_active = COALESCE($8, is_active),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING *`,
        [name, arabic_name, url, type, language, country, logo, is_active, parseInt(id)]
      );
      
      res.json(updateResult.rows[0]);
    } catch (error) {
      console.error("Error updating media source:", error);
      res.status(500).json({ message: "Failed to update media source" });
    }
  });
  
  /**
   * Delete a media source
   */
  app.delete("/api/media-sources/:id", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if media source exists
      const existingResult = await pool.query('SELECT * FROM media_sources WHERE id = $1', [parseInt(id)]);
      
      if (existingResult.rows.length === 0) {
        return res.status(404).json({ message: "Media source not found" });
      }
      
      // Delete media source with direct SQL
      await pool.query('DELETE FROM media_sources WHERE id = $1', [parseInt(id)]);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting media source:", error);
      res.status(500).json({ message: "Failed to delete media source" });
    }
  });
  
  // Press Releases API endpoints
  
  /**
   * Get all press releases with optional filtering
   */
  app.get("/api/press-releases", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { status, dateFrom, dateTo, search } = req.query;
      
      // Use direct SQL query since our schema doesn't match the actual table structure
      let queryText = `SELECT * FROM press_releases WHERE 1=1`;
      const queryParams: any[] = [];
      
      // Apply filters
      if (status) {
        queryParams.push(status);
        queryText += ` AND status = $${queryParams.length}`;
      }
      
      if (dateFrom && dateTo) {
        queryParams.push(dateFrom);
        queryText += ` AND created_at >= $${queryParams.length}`;
        
        queryParams.push(dateTo);
        queryText += ` AND created_at <= $${queryParams.length}`;
      } else if (dateFrom) {
        queryParams.push(dateFrom);
        queryText += ` AND created_at >= $${queryParams.length}`;
      } else if (dateTo) {
        queryParams.push(dateTo);
        queryText += ` AND created_at <= $${queryParams.length}`;
      }
      
      if (search) {
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern);
        queryText += ` AND (title ILIKE $${queryParams.length} OR arabic_title ILIKE $${queryParams.length} OR content ILIKE $${queryParams.length})`;
      }
      
      // Order by newest first
      queryText += ` ORDER BY created_at DESC`;
      
      const result = await pool.query(queryText, queryParams);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching press releases:", error);
      res.status(500).json({ message: "Failed to fetch press releases" });
    }
  });
  
  /**
   * Get a specific press release by ID
   */
  app.get("/api/press-releases/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use parameterized query for direct SQL access
      const result = await pool.query('SELECT * FROM press_releases WHERE id = $1', [parseInt(id)]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Press release not found" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching press release:", error);
      res.status(500).json({ message: "Failed to fetch press release" });
    }
  });
  
  /**
   * Create a new press release
   */
  app.post("/api/press-releases", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      // Get the authenticated user's ID
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Extract data from request body
      const {
        title,
        content,
        summary,
        status = 'draft',
        category,
        arabicTitle,
        arabicContent,
        arabicSummary,
        mediaAttachments,
        distributionList
      } = req.body;
      
      // Basic validation
      if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
      }
      
      // Use direct SQL to insert data
      const result = await pool.query(
        `INSERT INTO press_releases
          (title, content, summary, status, category, arabic_title, arabic_content, 
           arabic_summary, created_by, created_at, media_attachments, distribution_list) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
         RETURNING *`,
        [
          title,
          content,
          summary || null,
          status,
          category || null,
          arabicTitle || null,
          arabicContent || null,
          arabicSummary || null,
          req.user.id,
          new Date(),
          mediaAttachments || null,
          distributionList || null
        ]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating press release:", error);
      res.status(500).json({ message: "Failed to create press release" });
    }
  });
  
  /**
   * Update an existing press release
   */
  app.put("/api/press-releases/:id", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if press release exists
      const checkResult = await pool.query('SELECT * FROM press_releases WHERE id = $1', [parseInt(id)]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "Press release not found" });
      }
      
      // Extract data from request body
      const {
        title,
        content,
        summary,
        status,
        category,
        arabicTitle,
        arabicContent,
        arabicSummary,
        mediaAttachments,
        distributionList
      } = req.body;
      
      // Build update query
      let updateQuery = 'UPDATE press_releases SET updated_at = NOW()';
      const queryParams = [];
      let paramIndex = 1;
      
      if (title !== undefined) {
        updateQuery += `, title = $${paramIndex}`;
        queryParams.push(title);
        paramIndex++;
      }
      
      if (content !== undefined) {
        updateQuery += `, content = $${paramIndex}`;
        queryParams.push(content);
        paramIndex++;
      }
      
      if (summary !== undefined) {
        updateQuery += `, summary = $${paramIndex}`;
        queryParams.push(summary);
        paramIndex++;
      }
      
      if (status !== undefined) {
        updateQuery += `, status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }
      
      if (category !== undefined) {
        updateQuery += `, category = $${paramIndex}`;
        queryParams.push(category);
        paramIndex++;
      }
      
      if (arabicTitle !== undefined) {
        updateQuery += `, arabic_title = $${paramIndex}`;
        queryParams.push(arabicTitle);
        paramIndex++;
      }
      
      if (arabicContent !== undefined) {
        updateQuery += `, arabic_content = $${paramIndex}`;
        queryParams.push(arabicContent);
        paramIndex++;
      }
      
      if (arabicSummary !== undefined) {
        updateQuery += `, arabic_summary = $${paramIndex}`;
        queryParams.push(arabicSummary);
        paramIndex++;
      }
      
      if (mediaAttachments !== undefined) {
        updateQuery += `, media_attachments = $${paramIndex}`;
        queryParams.push(mediaAttachments);
        paramIndex++;
      }
      
      if (distributionList !== undefined) {
        updateQuery += `, distribution_list = $${paramIndex}`;
        queryParams.push(distributionList);
        paramIndex++;
      }
      
      // Add WHERE clause and RETURNING
      updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
      queryParams.push(parseInt(id));
      
      // Execute update
      const result = await pool.query(updateQuery, queryParams);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating press release:", error);
      res.status(500).json({ message: "Failed to update press release" });
    }
  });
  
  /**
   * Delete a press release
   */
  app.delete("/api/press-releases/:id", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if press release exists
      const checkResult = await pool.query('SELECT * FROM press_releases WHERE id = $1', [parseInt(id)]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "Press release not found" });
      }
      
      // Delete press release
      await pool.query('DELETE FROM press_releases WHERE id = $1', [parseInt(id)]);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting press release:", error);
      res.status(500).json({ message: "Failed to delete press release" });
    }
  });
  
  /**
   * Publish a press release
   */
  app.post("/api/press-releases/:id/publish", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if press release exists
      const checkResult = await pool.query('SELECT * FROM press_releases WHERE id = $1', [parseInt(id)]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "Press release not found" });
      }
      
      // Update press release to published status
      const result = await pool.query(
        `UPDATE press_releases 
         SET status = 'published', publish_date = NOW(), updated_at = NOW() 
         WHERE id = $1 
         RETURNING *`,
        [parseInt(id)]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error publishing press release:", error);
      res.status(500).json({ message: "Failed to publish press release" });
    }
  });
  
  /**
   * Schedule a press release for publishing
   */
  app.post("/api/press-releases/:id/schedule", isEditorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { publishDate } = req.body;
      
      if (!publishDate) {
        return res.status(400).json({ message: "Publish date is required" });
      }
      
      // Check if press release exists
      const checkResult = await pool.query('SELECT * FROM press_releases WHERE id = $1', [parseInt(id)]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "Press release not found" });
      }
      
      // Schedule press release
      const result = await pool.query(
        `UPDATE press_releases 
         SET status = 'scheduled', publish_date = $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [new Date(publishDate), parseInt(id)]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error scheduling press release:", error);
      res.status(500).json({ message: "Failed to schedule press release" });
    }
  });
}