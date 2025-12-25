import { supabase } from '../lib/supabase';

/**
 * Creator Service - Handles all creator-related database operations
 * Returns data with EXACT database column names (snake_case)
 */
export const creatorService = {
  /**
   * Fetch all creators from database
   * @returns {Promise<Array>} Array of creator objects with exact database column names
   */
  async getAll() {
    try {
      const { data, error } = await supabase?.from('creators')?.select('*')?.order('created_at', { ascending: false });

      if (error) throw error;

      // Return data with exact database column names (no conversion)
      return data || [];
    } catch (error) {
      console.error('Error fetching creators:', error);
      throw error;
    }
  },

  /**
   * Search creators by name, username, or email
   * @param {string} query - Search query
   * @returns {Promise<Array>} Filtered creators
   */
  async search(query) {
    try {
      const { data, error } = await supabase?.from('creators')?.select('*')?.or(`name.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)?.order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching creators:', error);
      throw error;
    }
  },

  /**
   * Filter creators by various criteria
   * @param {Object} filters - Filter criteria (using exact database column names)
   * @returns {Promise<Array>} Filtered creators
   */
  async filter(filters = {}) {
    try {
      let query = supabase?.from('creators')?.select('*');

      if (filters?.city && filters?.city?.length > 0) {
        query = query?.in('city', filters?.city);
      }

      if (filters?.state && filters?.state?.length > 0) {
        query = query?.in('state', filters?.state);
      }

      if (filters?.followers_tier && filters?.followers_tier?.length > 0) {
        query = query?.in('followers_tier', filters?.followers_tier);
      }

      if (filters?.sheet_source && filters?.sheet_source?.length > 0) {
        query = query?.in('sheet_source', filters?.sheet_source);
      }

      const { data, error } = await query?.order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error filtering creators:', error);
      throw error;
    }
  },

  /**
   * Get a single creator by ID
   * @param {string} id - Creator ID
   * @returns {Promise<Object>} Creator object with exact database column names
   */
  async getById(id) {
    try {
      const { data, error } = await supabase?.from('creators')?.select('*')?.eq('id', id)?.single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching creator:', error);
      throw error;
    }
  },

  /**
   * Search creators by multiple Instagram links (bulk search)
   * @param {Array<string>} instagramLinks - Array of Instagram links to search
   * @returns {Promise<Object>} Object with found creators and not found links
   */
  async searchByInstagramLinks(instagramLinks) {
    try {
      if (!instagramLinks || instagramLinks?.length === 0) {
        return { found: [], notFound: [] };
      }

      // Clean and normalize Instagram links (remove trailing slashes, etc.)
      const cleanedLinks = instagramLinks?.map(link => link?.trim()?.replace(/\/$/, ''));

      // Search for creators with matching Instagram links
      const { data, error } = await supabase
        ?.from('creators')
        ?.select('*')
        ?.in('instagram_link', cleanedLinks)
        ?.order('created_at', { ascending: false });

      if (error) throw error;

      const foundCreators = data || [];
      
      // Determine which links were not found
      const foundLinks = foundCreators?.map(creator => creator?.instagram_link?.trim()?.replace(/\/$/, ''));
      const notFoundLinks = cleanedLinks?.filter(link => !foundLinks?.includes(link));

      return {
        found: foundCreators,
        notFound: notFoundLinks
      };
    } catch (error) {
      console.error('Error searching creators by Instagram links:', error);
      throw error;
    }
  },

  /**
   * Create a new creator
   * @param {Object} creatorData - Creator data (using exact database column names)
   * @returns {Promise<Object>} Created creator object
   */
  async create(creatorData) {
    try {
      const { data, error } = await supabase
        ?.from('creators')
        ?.insert([creatorData])
        ?.select()
        ?.single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating creator:', error);
      throw error;
    }
  },

  /**
   * Update an existing creator
   * @param {string} id - Creator ID
   * @param {Object} updates - Fields to update (using exact database column names)
   * @returns {Promise<Object>} Updated creator object
   */
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        ?.from('creators')
        ?.update(updates)
        ?.eq('id', id)
        ?.select()
        ?.single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating creator:', error);
      throw error;
    }
  },

  /**
   * Delete a creator
   * @param {string} id - Creator ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        ?.from('creators')
        ?.delete()
        ?.eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting creator:', error);
      throw error;
    }
  },

  /**
   * Bulk delete creators
   * @param {Array<string>} ids - Array of creator IDs
   * @returns {Promise<void>}
   */
  async bulkDelete(ids) {
    try {
      const { error } = await supabase
        ?.from('creators')
        ?.delete()
        ?.in('id', ids);

      if (error) throw error;
    } catch (error) {
      console.error('Error bulk deleting creators:', error);
      throw error;
    }
  }
};