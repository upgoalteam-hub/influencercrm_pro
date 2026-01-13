import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import { cityManagementService } from '../../services/cityManagementService';
import { useToast } from '../../components/ui/ToastContainer';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Info } from 'lucide-react';

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

function AdminCityManagement() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [uncleanedCities, setUncleanedCities] = useState([]);
  const [cityMappings, setCityMappings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCities, setSelectedCities] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    mapped: 0,
    unmapped: 0
  });

  useEffect(() => {
    fetchUncleanedCities();
  }, []);

  const fetchUncleanedCities = async () => {
    try {
      setLoading(true);
      const cities = await cityManagementService.getUncleanedCities();
      setUncleanedCities(cities);
      
      const initialMappings = {};
      cities.forEach(city => {
        initialMappings[city] = '';
      });
      setCityMappings(initialMappings);
      
      setStats({
        total: cities.length,
        mapped: 0,
        unmapped: cities.length
      });
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast('Failed to fetch cities', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCityMappingChange = (uncleanedCity, standardCity) => {
    const newMappings = { ...cityMappings };
    newMappings[uncleanedCity] = standardCity;
    setCityMappings(newMappings);
    
    const mappedCount = Object.values(newMappings).filter(city => city !== '').length;
    setStats({
      total: uncleanedCities.length,
      mapped: mappedCount,
      unmapped: uncleanedCities.length - mappedCount
    });
  };

  const handleCitySelection = (city) => {
    const newSelected = new Set(selectedCities);
    if (newSelected.has(city)) {
      newSelected.delete(city);
    } else {
      newSelected.add(city);
    }
    setSelectedCities(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCities.size === uncleanedCities.length) {
      setSelectedCities(new Set());
    } else {
      setSelectedCities(new Set(uncleanedCities));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const validMappings = Object.entries(cityMappings)
        .filter(([uncleanedCity, standardCity]) => standardCity !== '')
        .map(([uncleanedCity, standardCity]) => ({
          uncleanedCity,
          standardCity,
          confidence: 100,
          autoSelected: false
        }));

      if (validMappings.length === 0) {
        toast('No valid city mappings to save', { type: 'warning' });
        return;
      }

      const result = await cityManagementService.bulkUpdateCityNames(validMappings);
      
      if (result.success) {
        toast(`Successfully updated ${result.total_updated} city mappings`, { type: 'success' });
        
        // Update UI immediately without page reload
        const updatedCities = new Set();
        validMappings.forEach(mapping => {
          updatedCities.add(mapping.uncleanedCity);
        });
        
        // Remove mapped cities from uncleaned cities list
        setUncleanedCities(prev => prev.filter(city => !updatedCities.has(city)));
        
        // Clear mappings for updated cities
        const newMappings = { ...cityMappings };
        updatedCities.forEach(city => {
          delete newMappings[city];
        });
        setCityMappings(newMappings);
        
        // Clear selected cities
        setSelectedCities(new Set());
        
        // Update sidebar badge count
        setTimeout(() => {
          window.dispatchEvent(new Event('cityMappingsUpdated'));
        }, 100);
        
      } else {
        toast('Failed to update city mappings', { type: 'error' });
      }
    } catch (error) {
      console.error('Error saving city mappings:', error);
      toast('Error saving city mappings', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedCities.size === 0) {
      toast('Please select cities and an action', { type: 'warning' });
      return;
    }

    try {
      setSaving(true);
      
      const validMappings = Array.from(selectedCities).map(city => ({
        uncleanedCity: city,
        standardCity: bulkAction,
        confidence: 100,
        autoSelected: false
      }));

      const result = await cityManagementService.bulkUpdateCityNames(validMappings);
      
      if (result.success) {
        toast(`Successfully updated ${result.total_updated || 0} records`, { type: 'success' });
        
        // Update UI immediately
        setUncleanedCities(prev => prev.filter(city => !selectedCities.has(city)));
        setSelectedCities(new Set());
        setBulkAction('');
        
        // Update sidebar badge
        setTimeout(() => {
          window.dispatchEvent(new Event('cityMappingsUpdated'));
        }, 100);
      }
    } catch (err) {
      toast('Bulk action failed: ' + err.message, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSelect = () => {
    console.log('🔄 Auto-selecting city matches...');
    const newMappings = { ...cityMappings };
    let matchedCount = 0;
    
    uncleanedCities.forEach(uncleanedCity => {
      const lowerUncleaned = uncleanedCity.toLowerCase().trim();
      
      // Try exact match first
      const exactMatch = STANDARD_INDIAN_CITIES.find(standardCity => 
        standardCity.toLowerCase() === lowerUncleaned
      );
      
      if (exactMatch) {
        newMappings[uncleanedCity] = exactMatch;
        matchedCount++;
        console.log('✅ Exact match found:', uncleanedCity, '->', exactMatch);
        return;
      }
      
      // Try partial match
      const partialMatch = STANDARD_INDIAN_CITIES.find(standardCity => 
        standardCity.toLowerCase().includes(lowerUncleaned) || 
        lowerUncleaned.includes(standardCity.toLowerCase())
      );
      
      if (partialMatch) {
        newMappings[uncleanedCity] = partialMatch;
        matchedCount++;
        console.log('🎯 Partial match found:', uncleanedCity, '->', partialMatch);
      }
    });
    
    setCityMappings(newMappings);
    const mappedCount = Object.values(newMappings).filter(city => city !== '').length;
    setStats({
      total: uncleanedCities.length,
      mapped: mappedCount,
      unmapped: uncleanedCities.length - mappedCount
    });
    
    toast(`Auto-selected ${matchedCount} city matches`, { type: 'success' });
  };

  const handleClearAll = () => {
    const clearedMappings = {};
    uncleanedCities.forEach(city => {
      clearedMappings[city] = '';
    });
    setCityMappings(clearedMappings);
    setStats({
      total: uncleanedCities.length,
      mapped: 0,
      unmapped: uncleanedCities.length
    });
    
    toast('Cleared all mappings', { type: 'info' });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col">
          <Header title="City Management" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-lg">Loading cities...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out main-content ${
          isSidebarCollapsed ? 'sidebar-collapsed' : ''
        }`}
      >
        <Header 
          isCollapsed={isSidebarCollapsed}
          title="City Management Dashboard"
          subtitle="Clean up and standardize city names in database"
        />
        
        {/* Sticky Action Bar */}
        <div className="sticky top-16 z-30 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleAutoSelect}
                variant="outline"
                disabled={loading || uncleanedCities.length === 0}
                className="shadow-sm bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                {loading ? 'Processing...' : 'Auto-Select Matches'}
              </Button>
              <Button
                onClick={handleClearAll}
                variant="outline"
                disabled={loading || uncleanedCities.length === 0}
                className="shadow-sm bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              >
                Clear All
              </Button>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || stats.mapped === 0}
              className="bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              {saving ? 'Saving...' : `Save Changes (${stats.mapped})`}
            </Button>
          </div>
        </div>
        
        <main className="flex-1 p-6 pt-8">
          <div className="max-w-7xl mx-auto">

            {/* Statistics */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Cities</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Mapped Cities</h3>
                <p className="text-2xl font-bold text-green-600">{stats.mapped}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Pending Changes</h3>
                <p className="text-2xl font-bold text-orange-600">{stats.mapped}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Selected Cities</h3>
                <p className="text-2xl font-bold text-blue-600">{selectedCities.size}</p>
              </div>
            </div>

            {/* Bulk Action Controls */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCities.size === uncleanedCities.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({selectedCities.size}/{uncleanedCities.length})
                  </span>
                </div>
                
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={selectedCities.size === 0}
                >
                  <option value="">Bulk assign to...</option>
                  {STANDARD_INDIAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                
                <Button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || selectedCities.size === 0 || saving}
                  loading={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? 'Updating...' : `Update ${selectedCities.size} selected`}
                </Button>
              </div>
            </div>

            {/* City Mappings */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">City Mappings</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Map each uncleaned city name to a standard Indian city name
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedCities.size === uncleanedCities.length}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uncleaned City Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Standard City Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {uncleanedCities.map((uncleanedCity, index) => (
                      <tr 
                        key={uncleanedCity} 
                        className={`hover:bg-gray-50 ${selectedCities.has(uncleanedCity) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCities.has(uncleanedCity)}
                            onChange={() => handleCitySelection(uncleanedCity)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 bg-red-50 p-2 rounded">
                            {uncleanedCity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={cityMappings[uncleanedCity] || ''}
                            onChange={(e) => handleCityMappingChange(uncleanedCity, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select standard city...</option>
                            {STANDARD_INDIAN_CITIES.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cityMappings[uncleanedCity] ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Mapped
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Unmapped
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminCityManagement;
