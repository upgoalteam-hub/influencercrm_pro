import { supabase } from '../lib/supabase';

export const campaignService = {
  async getAll() {
    try {
      const { data, error } = await supabase?.from('campaigns')?.select(`
          *,
          creators (
            id,
            name,
            username,
            instagram_link
          )
        `)?.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase?.from('campaigns')?.select(`
          *,
          creators (
            id,
            name,
            username,
            instagram_link,
            email,
            whatsapp
          )
        `)?.eq('id', id)?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  },

  async create(campaignData) {
    try {
      const { data, error } = await supabase?.from('campaigns')?.insert([campaignData])?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase?.from('campaigns')?.update(updates)?.eq('id', id)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase?.from('campaigns')?.delete()?.eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  },

  async bulkUpdateStatus(ids, status) {
    try {
      const { data, error } = await supabase?.from('campaigns')?.update({ payment_status: status })?.in('id', ids)?.select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error bulk updating campaigns:', error);
      throw error;
    }
  }
};