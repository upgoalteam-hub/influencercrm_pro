import { supabase } from '../lib/supabase';

export const creatorService = {
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

  async getAll(options = {}) {
    try {
      const { limit = 1000, offset = 0 } = options;
      const { data, error } = await supabase
        ?.from('creators')
        ?.select('*')
        ?.order('created_at', { ascending: false })
        ?.range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching creators:', error);
      throw error;
    }
  },

  async getUniqueValues(column) {
    try {
      const { data, error } = await supabase
        ?.from('creators')
        ?.select(column)
        ?.not(column, 'is', null)
        ?.order(column);

      if (error) throw error;
      const values = data?.map(item => item?.[column])?.filter(Boolean);
      const uniqueValues = [...new Set(values)];
      return uniqueValues;
    } catch (error) {
      console.error(`Error fetching unique values for ${column}:`, error);
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
  async getById(id) {
    try {
      const { data, error } = await supabase
        ?.from('creators')
        ?.select('*')
        ?.eq('id', id)
        ?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching creator by ID:', error);
      throw error;
    }
  },

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
