import { supabase } from '../lib/supabase';
import { mockStates } from '../lib/mockData';

const STANDARD_INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 
  'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 
  'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
  'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot',
  'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Dhanbad', 'Jodhpur',
  'Coimbatore', 'Kochi', 'Kozhikode', 'Thrissur', 'Guwahati', 'Amritsar', 'Vijayawada',
  'Madurai', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Gwalior', 'Jabalpur', 'Vijayawada',
  'Tiruchirappalli', 'Raipur', 'Kota', 'Chandigarh', 'Hubli-Dharwad', 'Mysore', 'Tirupur'
];

class CityManagementService {
  constructor() {
    this.isSupabaseAvailable = this.checkSupabaseAvailability();
  }

  checkSupabaseAvailability() {
    try {
      return !!(supabase && import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    } catch (error) {
      console.warn('⚠️ Supabase not available, using mock data:', error);
      return false;
    }
  }

  async getUncleanedCities() {
    if (!this.isSupabaseAvailable) {
      console.log('📋 Using mock cities data');
      return mockStates;
    }

    try {
      const { data, error } = await supabase
        .from('creators')
        .select('city')
        .not('isnull', 'city', true);
      
      if (error) {
        console.error('❌ Error fetching uncleaned cities:', error);
        return mockStates;
      }
      
      const uniqueCities = [...new Set(data.map(item => item.city))];
      return uniqueCities.filter(city => 
        city && city.trim() !== '' && 
        !STANDARD_INDIAN_CITIES.includes(city)
      );
    } catch (error) {
      console.error('❌ Error fetching uncleaned cities:', error);
      return mockStates;
    }
  }

  async bulkUpdateCityNames(mappings) {
    console.log('🔄 Direct city update:', mappings);

    if (!this.isSupabaseAvailable) {
      console.log('✅ Mock success');
      return {
        success: true,
        total_updated: mappings.length,
        results: mappings.map(mapping => ({
          uncleaned_city: mapping.uncleanedCity,
          standard_city: mapping.standardCity,
          updated_count: 1,
          status: 'success'
        }))
      };
    }

    try {
      let totalUpdated = 0;
      const results = [];
      
      for (const mapping of mappings) {
        console.log('🔄 Updating city:', mapping.uncleanedCity, '->', mapping.standardCity);
        
        const { data, error } = await supabase
          .from('creators')
          .update({ 
            city: mapping.standardCity
          })
          .eq('city', mapping.uncleanedCity);
          
        if (error) {
          console.error('❌ Update failed for', mapping.uncleanedCity, error);
          results.push({
            uncleaned_city: mapping.uncleanedCity,
            standard_city: mapping.standardCity,
            updated_count: 0,
            status: 'failed',
            error: error.message
          });
        } else {
          const updatedCount = data?.length || 0;
          totalUpdated += updatedCount;
          console.log('✅ Updated city:', mapping.uncleanedCity, '->', mapping.standardCity, ':', updatedCount, 'records');
          
          results.push({
            uncleaned_city: mapping.uncleanedCity,
            standard_city: mapping.standardCity,
            updated_count: updatedCount,
            status: 'success'
          });
        }
      }
      
      console.log('📊 Final result:', { success: true, total_updated: totalUpdated, results });
      return {
        success: true,
        total_updated: totalUpdated,
        results
      };
      
    } catch (error) {
      console.error('❌ Update error:', error);
      return {
        success: false,
        error: error.message,
        total_updated: 0,
        results: []
      };
    }
  }
}

export const cityManagementService = new CityManagementService();
