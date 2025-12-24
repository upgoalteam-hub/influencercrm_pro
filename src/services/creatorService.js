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
  }
};