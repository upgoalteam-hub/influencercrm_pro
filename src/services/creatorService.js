import { supabase } from '../lib/supabase';

/**
 * Creator Service - Handles all creator-related database operations
 * Returns data with EXACT database column names (snake_case)
 */
export const creatorService = {
  /**
   * Get total count of creators in database
   * @returns {Promise<number>} Total number of creators
   */
  async getCount() {
    try {
      const { count, error } = await supabase
        ?.from('creators')
        ?.select('*', { count: 'exact', head: true });

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error fetching creator count:', error);
      throw error;
    }
  },

  /**
   * Fetch all creators from database with pagination support
   * @param {Object} options - Optional pagination and filtering options
   * @param {number} options.limit - Number of records per page (default: 1000, max: 1000 per Supabase)
   * @param {number} options.offset - Offset for pagination
   * @param {boolean} options.fetchAll - If true, fetches all records using pagination (default: false)
   * @returns {Promise<Array>} Array of creator objects with exact database column names
   */
  async getAll(options = {}) {
    try {
      const { limit = 1000, offset = 0, fetchAll = false } = options;

      if (fetchAll) {
        // Fetch all creators using pagination
        let allData = [];
        let currentOffset = 0;
        const pageSize = 1000; // Supabase max per query
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            ?.from('creators')
            ?.select('*')
            ?.order('created_at', { ascending: false })
            ?.range(currentOffset, currentOffset + pageSize - 1);

          if (error) throw error;

          if (data && data.length > 0) {
            allData = [...allData, ...data];
            currentOffset += pageSize;
            // If we got less than pageSize, we've reached the end
            hasMore = data.length === pageSize;
          } else {
            hasMore = false;
          }
        }

        return allData;
      } else {
        // Standard paginated query
        const { data, error } = await supabase
          ?.from('creators')
          ?.select('*')
          ?.order('created_at', { ascending: false })
          ?.range(offset, offset + limit - 1);

        if (error) throw error;

        return data || [];
      }
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
   * Search creators by multiple usernames (bulk search)
   * @param {Array<string>} usernames - Array of usernames to search
   * @returns {Promise<Object>} Object with found creators and not found usernames
   */
  async searchByUsernames(usernames) {
    try {
      if (!usernames || usernames?.length === 0) {
        return { found: [], notFound: [] };
      }

      // Clean usernames (remove @ if present)
      const cleanedUsernames = usernames?.map(u => u?.trim()?.replace(/^@/, ''));

      // Search for creators with matching usernames
      const { data, error } = await supabase
        ?.from('creators')
        ?.select('*')
        ?.in('username', cleanedUsernames)
        ?.order('created_at', { ascending: false });

      if (error) throw error;

      const foundCreators = data || [];
      
      // Determine which usernames were not found
      const foundUsernames = foundCreators?.map(creator => creator?.username?.trim());
      const notFoundUsernames = cleanedUsernames?.filter(u => !foundUsernames?.includes(u));

      return {
        found: foundCreators,
        notFound: notFoundUsernames
      };
    } catch (error) {
      console.error('Error searching creators by usernames:', error);
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
  },

  /**
   * Get paginated creators with server-side filtering and sorting
   * @param {Object} options - Pagination, filtering, and sorting options
   * @param {number} options.page - Page number (1-indexed)
   * @param {number} options.pageSize - Records per page (default: 25)
   * @param {string} options.searchQuery - Search query for name, username, or email
   * @param {Object} options.filters - Filter criteria
   * @param {string} options.sortColumn - Column to sort by
   * @param {string} options.sortDirection - 'asc' or 'desc'
   * @returns {Promise<Object>} Object with data, total count, and pagination info
   */
  async getPaginated(options = {}) {
    try {
      const {
        page = 1,
        pageSize = 25,
        searchQuery = '',
        filters = {},
        sortColumn = 'created_at',
        sortDirection = 'desc'
      } = options;

      const offset = (page - 1) * pageSize;
      
      // Only select fields needed for table display
      const fields = [
        'id',
        'sr_no',
        'name',
        'instagram_link',
        'followers_tier',
        'state',
        'city',
        'whatsapp',
        'email',
        'gender',
        'username',
        'sheet_source'
      ].join(',');

      // Build query
      let query = supabase
        ?.from('creators')
        ?.select(fields, { count: 'exact' });

      // Apply search query
      if (searchQuery) {
        query = query?.or(
          `name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
        );
      }

      // Apply filters
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

      // Apply sorting
      query = query?.order(sortColumn, { ascending: sortDirection === 'asc' });

      // Apply pagination
      query = query?.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching paginated creators:', error);
      throw error;
    }
  }
};