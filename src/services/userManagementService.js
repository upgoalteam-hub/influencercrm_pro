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
 */
export const createUser = async (userData) => {
  try {
    const snakeCaseData = toSnakeCase(userData);
    
    const { data, error } = await supabase?.from('users')?.insert([snakeCaseData])?.select(`
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
    console.error('Error creating user:', error);
    return { data: null, error };
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
    const { data, error } = await supabase?.from('user_roles')?.select('*')?.order('role_name', { ascending: true });

    if (error) throw error;
    return { data: data?.map(toCamelCase) || [], error: null };
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