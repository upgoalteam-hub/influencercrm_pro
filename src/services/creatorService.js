import { supabase } from '../lib/supabase';

/**
 * Creator Service - Handles all creator-related database operations
 * Converts between snake_case (database) and camelCase (React)
 */
export const creatorService = {
  /**
   * Fetch all creators from database
   * @returns {Promise<Array>} Array of creator objects in camelCase
   */
  async getAll() {
    try {
      const { data, error } = await supabase?.from('creators')?.select('*')?.order('created_at', { ascending: false });

      if (error) throw error;

      // Convert snake_case to camelCase for React
      return (data || [])?.map(creator => ({
        id: creator?.id,
        name: creator?.name,
        email: creator?.email,
        username: creator?.username,
        instagramLink: creator?.instagram_link,
        whatsapp: creator?.whatsapp,
        city: creator?.city,
        state: creator?.state,
        gender: creator?.gender,
        followersTier: creator?.followers_tier,
        sheetSource: creator?.sheet_source,
        srNo: creator?.sr_no,
        createdAt: creator?.created_at
      }));
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

      return (data || [])?.map(creator => ({
        id: creator?.id,
        name: creator?.name,
        email: creator?.email,
        username: creator?.username,
        instagramLink: creator?.instagram_link,
        whatsapp: creator?.whatsapp,
        city: creator?.city,
        state: creator?.state,
        gender: creator?.gender,
        followersTier: creator?.followers_tier,
        sheetSource: creator?.sheet_source,
        srNo: creator?.sr_no,
        createdAt: creator?.created_at
      }));
    } catch (error) {
      console.error('Error searching creators:', error);
      throw error;
    }
  },

  /**
   * Filter creators by various criteria
   * @param {Object} filters - Filter criteria
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

      if (filters?.followersTier && filters?.followersTier?.length > 0) {
        query = query?.in('followers_tier', filters?.followersTier);
      }

      if (filters?.sheetSource && filters?.sheetSource?.length > 0) {
        query = query?.in('sheet_source', filters?.sheetSource);
      }

      const { data, error } = await query?.order('created_at', { ascending: false });

      if (error) throw error;

      return (data || [])?.map(creator => ({
        id: creator?.id,
        name: creator?.name,
        email: creator?.email,
        username: creator?.username,
        instagramLink: creator?.instagram_link,
        whatsapp: creator?.whatsapp,
        city: creator?.city,
        state: creator?.state,
        gender: creator?.gender,
        followersTier: creator?.followers_tier,
        sheetSource: creator?.sheet_source,
        srNo: creator?.sr_no,
        createdAt: creator?.created_at
      }));
    } catch (error) {
      console.error('Error filtering creators:', error);
      throw error;
    }
  },

  /**
   * Get a single creator by ID
   * @param {string} id - Creator ID
   * @returns {Promise<Object>} Creator object
   */
  async getById(id) {
    try {
      const { data, error } = await supabase?.from('creators')?.select('*')?.eq('id', id)?.single();

      if (error) throw error;

      return {
        id: data?.id,
        name: data?.name,
        email: data?.email,
        username: data?.username,
        instagramLink: data?.instagram_link,
        whatsapp: data?.whatsapp,
        city: data?.city,
        state: data?.state,
        gender: data?.gender,
        followersTier: data?.followers_tier,
        sheetSource: data?.sheet_source,
        srNo: data?.sr_no,
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('Error fetching creator:', error);
      throw error;
    }
  }
};