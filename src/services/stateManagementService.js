import { supabase } from '../lib/supabase';
import { mockStates, mockAuditLogs } from '../lib/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STANDARD_INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

class StateManagementService {
  constructor() {
    this.isSupabaseAvailable = this.checkSupabaseAvailability();
  }

  checkSupabaseAvailability() {
    try {
      return !!(supabase && supabaseUrl && supabaseAnonKey);
    } catch (error) {
      console.warn('⚠️ Supabase not available, using mock data:', error);
      return false;
    }
  }

  async getUncleanedStates() {
    if (!this.isSupabaseAvailable) {
      console.log('📋 Using mock states data');
      return mockStates;
    }

    try {
      // Try RPC function first
      const { data, error } = await supabase.rpc('get_unique_column_values', { 
        column_name: 'state' 
      });
      
      if (error) {
        console.warn('⚠️ RPC failed, trying direct query:', error);
        // Fallback to direct query
        const { data: directData, error: directError } = await supabase
          .from('creators')
          .select('state')
          .not('isnull', 'state', true);
        
        if (directError) {
          console.error('❌ Direct query also failed:', directError);
          throw directError;
        }
        
        const uniqueStates = [...new Set(directData.map(item => item.state))];
        return uniqueStates.filter(state => 
          state && state.trim() !== '' && 
          !STANDARD_INDIAN_STATES.includes(state)
        );
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching uncleaned states:', error);
      // Return mock data as fallback
      return mockStates;
    }
  }

  filterUncleanedStates(states) {
    return states.filter(state => 
      state && state.trim() !== '' && 
      !STANDARD_INDIAN_STATES.includes(state)
    );
  }

  async bulkUpdateStateNames(mappings, auditContext = null) {
    if (!this.isSupabaseAvailable) {
      console.log('📋 Mock bulk update:', mappings);
      return {
        success: true,
        transaction_id: 'mock-txn-' + Date.now(),
        total_updated: mappings.length,
        results: mappings.map(mapping => ({
          uncleaned_state: mapping.uncleanedState,
          standard_state: mapping.standardState,
          updated_count: Math.floor(Math.random() * 10) + 1,
          status: 'success'
        }))
      };
    }

    try {
      // Use the enhanced audit function if audit context is provided
      if (auditContext) {
        const { data, error } = await supabase.rpc('bulk_update_state_names_with_audit', {
          mappings: mappings,
          p_changed_by: auditContext.userId,
          p_user_email: auditContext.userEmail,
          p_session_id: auditContext.sessionId
        });
        
        if (error) {
          console.error('❌ Bulk update with audit failed:', error);
          throw error;
        }
        
        return data;
      } else {
        // Fallback to original function
        const { data, error } = await supabase.rpc('bulk_update_state_names', { 
          mappings: mappings 
        });
        
        if (error) {
          console.error('❌ Bulk update failed:', error);
          throw error;
        }
        
        return data;
      }
    } catch (error) {
      console.error('❌ Error in bulk update:', error);
      throw error;
    }
  }

  async bulkUpdateStateNamesWithManualAudit(mappings, auditContext) {
    if (!this.isSupabaseAvailable) {
      console.log('📋 Mock bulk update with manual audit:', mappings);
      return {
        success: true,
        transaction_id: 'mock-txn-' + Date.now(),
        total_updated: mappings.length,
        results: mappings.map(mapping => ({
          uncleaned_state: mapping.uncleanedState,
          standard_state: mapping.standardState,
          updated_count: Math.floor(Math.random() * 10) + 1,
          status: 'success'
        }))
      };
    }

    try {
      // First perform the bulk update
      const updateResult = await this.bulkUpdateStateNames(mappings);
      
      if (updateResult.success) {
        // Then manually log the audit
        const auditData = mappings.map(mapping => ({
          action_type: 'STATE_MAPPING_UPDATE',
          table_name: 'creators',
          record_id: mapping.uncleanedState,
          old_value: mapping.uncleanedState,
          new_value: mapping.standardState,
          changed_by: auditContext.userId,
          user_email: auditContext.userEmail,
          metadata: {
            confidence: mapping.confidence,
            autoSelected: mapping.autoSelected || false,
            transaction_id: updateResult.transaction_id
          }
        }));

        // Insert audit logs
        const { error: auditError } = await supabase
          .from('audit_logs')
          .insert(auditData);

        if (auditError) {
          console.warn('⚠️ Manual audit logging failed:', auditError);
        }
      }

      return updateResult;
    } catch (error) {
      console.error('❌ Error in bulk update with manual audit:', error);
      throw error;
    }
  }
}

export const stateManagementService = new StateManagementService();
