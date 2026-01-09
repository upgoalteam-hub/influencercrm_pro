import { supabase } from '../lib/supabase';

/**
 * User Management Service
 * Handles all user and role management operations
 */

// Convert snake_case to camelCase
const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj?.map(toCamelCase);
  
  return Object.keys(obj)?.reduce((acc, key) => {
    const camelKey = key?.replace(/_([a-z])/g, (_, letter) => letter?.toUpperCase());
    acc[camelKey] = typeof obj?.[key] === 'object' ? toCamelCase(obj?.[key]) : obj?.[key];
    return acc;
  }, {});
};

// Convert camelCase to snake_case
const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj?.map(toSnakeCase);
  
  return Object.keys(obj)?.reduce((acc, key) => {
    const snakeKey = key?.replace(/[A-Z]/g, letter => `_${letter?.toLowerCase()}`);
    acc[snakeKey] = typeof obj?.[key] === 'object' ? toSnakeCase(obj?.[key]) : obj?.[key];
    return acc;
  }, {});
};

/**
 * Fetch all users with their roles
 */
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase?.from('users')?.select(`
        *,
        user_roles (
          id,
          role_name,
          display_name,
          permissions
        )
      `)?.order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data?.map(toCamelCase) || [], error: null };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { data: null, error };
  }
};

/**
 * Fetch user by ID
 */
export const getUserById = async (id) => {
  try {
    const { data, error } = await supabase?.from('users')?.select(`
        *,
        user_roles (
          id,
          role_name,
          display_name,
          permissions
        )
      `)?.eq('id', id)?.single();

    if (error) throw error;
    return { data: toCamelCase(data), error: null };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { data: null, error };
  }
};

/**
 * Create a new user
 * This function creates a user in Supabase Auth and then updates the users table
 */
export const createUser = async (userData) => {
  try {
    // Validate required fields
    if (!userData?.email || !userData?.password || !userData?.fullName || !userData?.roleId) {
      return { 
        data: null, 
        error: { message: 'Missing required fields: email, password, fullName, roleId' } 
      };
    }

    // Call the edge function to create the user
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        data: null,
        error: { message: 'Supabase configuration missing' }
      };
    }

    // Get the current session token for authorization
    const { data: { session } } = await supabase?.auth?.getSession();
    if (!session) {
      return {
        data: null,
        error: { message: 'You must be logged in to create users' }
      };
    }

    // Call the edge function using supabase.functions.invoke if available, otherwise use fetch
    let response;
    let result;

    // Try using supabase.functions.invoke first (preferred method)
    if (supabase?.functions?.invoke) {
      const { data: invokeData, error: invokeError } = await supabase.functions.invoke('create-user', {
        body: {
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          roleId: userData.roleId,
          isActive: userData.isActive !== undefined ? userData.isActive : true
        }
      });

      if (invokeError) {
        return {
          data: null,
          error: { message: invokeError.message || 'Failed to create user' }
        };
      }

      if (invokeData?.error) {
        return {
          data: null,
          error: { message: invokeData.error || 'Failed to create user' }
        };
      }

      return { data: toCamelCase(invokeData?.data), error: null };
    }

    // Fallback to fetch if invoke is not available
    response = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        roleId: userData.roleId,
        isActive: userData.isActive !== undefined ? userData.isActive : true
      })
    });

    result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: { message: result?.error || result?.message || 'Failed to create user' }
      };
    }

    return { data: toCamelCase(result?.data), error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    return { 
      data: null, 
      error: { message: error?.message || 'Failed to create user. Please ensure the edge function is deployed.' } 
    };
  }
};

/**
 * Update user information
 */
export const updateUser = async (id, updates) => {
  try {
    const snakeCaseUpdates = toSnakeCase(updates);
    
    const { data, error } = await supabase?.from('users')?.update(snakeCaseUpdates)?.eq('id', id)?.select(`
        *,
        user_roles (
          id,
          role_name,
          display_name,
          permissions
        )
      `)?.single();

    if (error) throw error;
    return { data: toCamelCase(data), error: null };
  } catch (error) {
    console.error('Error updating user:', error);
    return { data: null, error };
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (id) => {
  try {
    const { error } = await supabase?.from('users')?.delete()?.eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error };
  }
};

/**
 * Fetch all user roles
 */
export const getAllRoles = async () => {
  try {
    console.log('Fetching roles from user_roles table...');
    const { data, error } = await supabase?.from('user_roles')?.select('*')?.order('role_name', { ascending: true });

    if (error) {
      console.error('Supabase error fetching roles:', error);
      throw error;
    }

    console.log('Raw roles data from Supabase:', data);
    const camelCaseData = data?.map(toCamelCase) || [];
    console.log('Roles after camelCase conversion:', camelCaseData);
    
    return { data: camelCaseData, error: null };
  } catch (error) {
    console.error('Error fetching roles:', error);
    return { data: null, error };
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId, roleId) => {
  try {
    const { data, error } = await supabase?.from('users')?.update({ role_id: roleId })?.eq('id', userId)?.select(`
        *,
        user_roles (
          id,
          role_name,
          display_name,
          permissions
        )
      `)?.single();

    if (error) throw error;
    return { data: toCamelCase(data), error: null };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { data: null, error };
  }
};

/**
 * Toggle user active status
 */
export const toggleUserStatus = async (userId, isActive) => {
  try {
    const { data, error } = await supabase?.from('users')?.update({ is_active: isActive })?.eq('id', userId)?.select()?.single();

    if (error) throw error;
    return { data: toCamelCase(data), error: null };
  } catch (error) {
    console.error('Error toggling user status:', error);
    return { data: null, error };
  }
};

/**
 * Fetch audit logs
 */
export const getAuditLogs = async (filters = {}) => {
  try {
    let query = supabase?.from('audit_logs')?.select(`
        *,
        users (
          id,
          email,
          full_name
        )
      `)?.order('created_at', { ascending: false })?.limit(100);

    // Apply filters
    if (filters?.userId) {
      query = query?.eq('user_id', filters?.userId);
    }
    if (filters?.entityType) {
      query = query?.eq('entity_type', filters?.entityType);
    }
    if (filters?.action) {
      query = query?.eq('action', filters?.action);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data?.map(toCamelCase) || [], error: null };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return { data: null, error };
  }
};

/**
 * Create audit log entry
 */
export const createAuditLog = async (logData) => {
  try {
    const snakeCaseData = toSnakeCase(logData);
    
    const { data, error } = await supabase?.from('audit_logs')?.insert([snakeCaseData])?.select()?.single();

    if (error) throw error;
    return { data: toCamelCase(data), error: null };
  } catch (error) {
    console.error('Error creating audit log:', error);
    return { data: null, error };
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllRoles,
  updateUserRole,
  toggleUserStatus,
  getAuditLogs,
  createAuditLog
};