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
      console.log(`Fetching unique values for column: ${column}`);
      
      // Try to get all distinct values using RPC function for better performance
      try {
        const { data: rpcData, error: rpcError } = await supabase
          ?.rpc('get_unique_column_values', { column_name: column });
        
        if (!rpcError && rpcData) {
          console.log(`RPC data for ${column}:`, rpcData?.length, 'records');
          const values = rpcData?.filter(Boolean);
          console.log(`Unique values for ${column} via RPC:`, values?.length, 'records');
          return values;
        }
      } catch (rpcErr) {
        console.log('RPC method failed, falling back to standard query');
      }
      
      // Fallback: Get all records in batches if needed
      let allData = [];
      let offset = 0;
      const batchSize = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const { data, error } = await supabase
          ?.from('creators')
          ?.select(column)
          ?.not(column, 'is', null)
          ?.range(offset, offset + batchSize - 1);

        console.log(`Batch data for ${column} (offset ${offset}):`, data?.length, 'records');
        console.log(`Error for ${column}:`, error);

        if (error) throw error;
        
        if (data && data.length > 0) {
          allData = [...allData, ...data];
          offset += batchSize;
          hasMore = data.length === batchSize; // Continue if we got a full batch
        } else {
          hasMore = false;
        }
      }

      console.log(`Total raw data for ${column}:`, allData?.length, 'records');
      
      const values = allData?.map(item => item?.[column])?.filter(Boolean);
      console.log(`Filtered values for ${column}:`, values?.length, 'records');
      
      const uniqueValues = [...new Set(values)];
      console.log(`Unique values for ${column}:`, uniqueValues?.length, 'records');
      console.log(`Sample unique values for ${column}:`, uniqueValues?.slice(0, 10));
      
      return uniqueValues;
    } catch (error) {
      console.error(`Error fetching unique values for ${column}:`, error);
      throw error;
    }
  },

  // Debug function to check followers_tier distribution
  async getFollowersTierDistribution() {
    try {
      console.log('Fetching followers_tier distribution...');
      
      // Get all creators with their followers_tier
      const { data, error } = await supabase
        ?.from('creators')
        ?.select('followers_tier')
        ?.not('followers_tier', 'is', null);

      if (error) throw error;

      // Count occurrences of each followers_tier
      const distribution = {};
      data?.forEach(creator => {
        const tier = creator?.followers_tier?.trim() || 'Unknown';
        distribution[tier] = (distribution[tier] || 0) + 1;
      });

      console.log('Followers tier distribution:', distribution);
      
      // Find all variations that might be "0-10k"
      const variations = Object.keys(distribution).filter(key => 
        key.toLowerCase().includes('0-10k') || 
        key.toLowerCase().includes('10k') ||
        key.toLowerCase().includes('0-10')
      );

      console.log('Possible 0-10k variations found:', variations);
      console.log('Counts for variations:', variations.map(v => ({ [v]: distribution[v] })));

      return distribution;
    } catch (error) {
      console.error('Error fetching followers tier distribution:', error);
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
        console.log('Applying followers_tier filter:', filters?.followers_tier);
        
        // Normalize filter values for robust matching
        const normalizedFilters = filters?.followers_tier.map(val => val?.toLowerCase().trim());
        console.log('Normalized filter values:', normalizedFilters);
        
        // Use case-insensitive comparison with trimming
        const filterConditions = normalizedFilters.map(val => `followers_tier.ilike.%${val}%`);
        query = query?.or(filterConditions.join(','));
        
        console.log('Applied filter conditions:', filterConditions);
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
