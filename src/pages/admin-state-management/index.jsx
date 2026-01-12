import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import { stateManagementService } from '../../services/stateManagementService';
import { useStateMapping } from '../../hooks/useStateMapping';
import { useAudit } from '../../hooks/useAudit';
import { enhancedFuzzyMatch, batchProcessStates } from '../../utils/fuzzyMatching';
import { ChangeHistoryIcon, ChangeHistoryModal } from '../../components/audit/AuditLogComponents';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';

const STANDARD_INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

export default function AdminStateManagement() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [uncleanedStates, setUncleanedStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [batchResults, setBatchResults] = useState(null);
  const [changeHistoryModal, setChangeHistoryModal] = useState({ isOpen: false, recordId: null });
  const { userProfile } = useAuth();
  
  // Use custom hook for state management
  const {
    mappings,
    confidenceScores,
    pendingChanges,
    isDirty,
    statistics,
    validation,
    initializeMappings,
    updateMapping,
    batchUpdateMappings,
    autoSelectHighConfidence,
    clearAllMappings,
    resetMappings,
    getValidMappings
  } = useStateMapping();

  // Use audit hook for audit logging
  const {
    logBatchStateMapping,
    getAuditHistory,
    loading: auditLoading,
    error: auditError
  } = useAudit();

  useEffect(() => {
    fetchUncleanedStates();
  }, []);

  const fetchUncleanedStates = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const states = await stateManagementService.getUncleanedStates();
      setUncleanedStates(states);
      
      // Initialize mappings using custom hook
      initializeMappings(states);
    } catch (err) {
      setError('Failed to fetch uncleaned states: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (uncleanedState, standardState) => {
    // Calculate confidence for the selected mapping
    const confidence = standardState ? 
      enhancedFuzzyMatch(uncleanedState, STANDARD_INDIAN_STATES).confidence : 0;
    
    updateMapping(uncleanedState, standardState, confidence);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate mappings
      const { isValid, errors, validMappings } = validation;
      
      if (!isValid) {
        setError(errors.join(', '));
        showToast(errors.join(', '), 'warning');
        return;
      }

      // Create audit context for this operation
      const auditContext = {
        userId: userProfile?.id,
        userEmail: userProfile?.email,
        sessionId: sessionStorage.getItem('audit_session_id')
      };

      // Use bulk update with audit logging
      const result = await stateManagementService.bulkUpdateStateNames(validMappings, auditContext);
      
      // Log batch audit operation
      if (result.auditId) {
        // Audit logging is handled in the database function
        console.log('Audit logged with ID:', result.auditId);
      } else {
        // Fallback: log manually if not handled by database
        try {
          await logBatchStateMapping(validMappings, {
            autoSelected: false,
            confidenceThreshold: null,
            transactionId: result.transactionId
          });
        } catch (auditError) {
          console.warn('Audit logging failed:', auditError);
        }
      }
      
      // Show success toast
      showToast(`Successfully updated ${result.totalUpdated || 0} records across ${validMappings.length} state mappings`, 'success');
      setSuccess(`Updated ${result.totalUpdated || 0} records successfully`);
      
      // Refresh the uncleaned states list
      await fetchUncleanedStates();
      
      // Update sidebar badge count
      setTimeout(() => {
        window.dispatchEvent(new Event('stateMappingsUpdated'));
      }, 100);
      
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to update state names: ' + err.message);
      showToast('Failed to update state names: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetMappings();
    setError(null);
    setSuccess(null);
    showToast('Selections reset to original state', 'info');
  };

  // Toast notification function
  const showToast = (message, type = 'info') => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    // Set colors based on type
    const colors = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
      warning: 'bg-yellow-500 text-white'
    };
    
    toast.className += ` ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <div class="flex items-center">
        <span class="font-medium">${message}</span>
        <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
      toast.classList.add('translate-x-0');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.remove('translate-x-0');
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  };

  const handleAutoSelectMatches = async () => {
    try {
      setProcessingBatch(true);
      setError(null);
      
      // Process all states with fuzzy matching
      const batchResult = batchProcessStates(uncleanedStates, STANDARD_INDIAN_STATES, {
        confidenceThreshold: 90,
        autoSelectHighConfidence: true,
        batchSize: 100
      });
      
      // Update mappings with high confidence matches
      const highConfidenceUpdates = batchResult.results
        .filter(result => result.confidence >= 90)
        .map(result => ({
          uncleanedState: result.uncleanedState,
          standardState: result.match,
          confidence: result.confidence,
          autoSelected: true
        }));
      
      batchUpdateMappings(highConfidenceUpdates);
      
      // Log batch operation for audit
      try {
        await logBatchStateMapping(highConfidenceUpdates, {
          autoSelected: true,
          confidenceThreshold: 90,
          operation: 'auto_select_matches'
        });
      } catch (auditError) {
        console.warn('Audit logging for auto-select failed:', auditError);
      }
      
      setBatchResults(batchResult);
      
      showToast(`Auto-selected ${highConfidenceUpdates.length} high-confidence matches (>90%)`, 'success');
      
    } catch (err) {
      console.error('Auto-select error:', err);
      setError('Failed to auto-select matches: ' + err.message);
      showToast('Failed to auto-select matches: ' + err.message, 'error');
    } finally {
      setProcessingBatch(false);
    }
  };

  const handleViewChangeHistory = async (recordId) => {
    try {
      setChangeHistoryModal({ isOpen: true, recordId });
    } catch (err) {
      console.error('Error viewing change history:', err);
      showToast('Failed to load change history', 'error');
    }
  };

  const handleClearAll = () => {
    clearAllMappings();
    setError(null);
    setSuccess(null);
    setBatchResults(null);
    showToast('All selections cleared', 'info');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="fixed top-20 left-0 z-40 bg-white border border-r border-gray-200 rounded-r-lg p-2 shadow-md hover:bg-gray-50 transition-all duration-200"
        style={{ 
          left: isSidebarCollapsed ? '0px' : '280px',
          transition: 'left 0.3s ease-in-out'
        }}
        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      
      <div 
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: isSidebarCollapsed ? '0px' : '0px',
          paddingLeft: isSidebarCollapsed ? '48px' : '328px'
        }}
      >
        <Header 
          title="State Management Dashboard"
          subtitle="Clean up and standardize state names in the database"
        />
        
        {/* Fixed Header Action Bar */}
        <div className="fixed top-16 left-0 right-0 z-30 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleAutoSelectMatches}
                variant="outline"
                disabled={processingBatch || uncleanedStates.length === 0}
                className="shadow-sm bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                {processingBatch ? 'Processing...' : 'Auto-Select Matches'}
              </Button>
              <Button
                onClick={handleClearAll}
                variant="outline"
                disabled={uncleanedStates.length === 0}
                className="shadow-sm bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              >
                Clear All
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={uncleanedStates.length === 0 || !isDirty}
                className="border-gray-300 hover:bg-gray-50 shadow-sm"
              >
                Reset
              </Button>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !isDirty || uncleanedStates.length === 0}
              className="bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              {saving ? 'Saving...' : `Save Changes (${pendingChanges.size})`}
            </Button>
          </div>
        </div>
        
        <main className="flex-1 p-6 pt-8">
          <div className="max-w-7xl mx-auto">
            {/* Alert Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total States</h3>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalStates}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Mapped States</h3>
                <p className="text-2xl font-bold text-green-600">{statistics.mappedStates}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Pending Changes</h3>
                <p className="text-2xl font-bold text-orange-600">{statistics.pendingChanges}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">High Confidence</h3>
                <p className="text-2xl font-bold text-blue-600">{statistics.highConfidenceMatches}</p>
              </div>
            </div>

            {/* Batch Processing Results */}
            {batchResults && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Batch Processing Results</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Total Processed: {batchResults.totalProcessed}</p>
                      <p>High Confidence Matches (&ge;90%): {batchResults.highConfidenceMatches}</p>
                      <p>Medium Confidence Matches (70-89%): {batchResults.mediumConfidenceMatches}</p>
                      <p>Low Confidence Matches (&lt;70%): {batchResults.lowConfidenceMatches}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* State Mapping Table */}
            {uncleanedStates.length > 0 ? (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">State Mappings</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Map each uncleaned state name to a standard Indian state name
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uncleaned State Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Confidence Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Standard State Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          History
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uncleanedStates.map((uncleanedState, index) => {
                        const confidence = confidenceScores[uncleanedState] || 0;
                        const isSelected = mappings[uncleanedState] || '';
                        const hasPendingChange = pendingChanges.has(uncleanedState);
                        
                        return (
                          <tr 
                            key={uncleanedState} 
                            className={`hover:bg-gray-50 ${hasPendingChange ? 'bg-yellow-50' : ''}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {uncleanedState}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {confidence > 0 ? (
                                <div className="flex items-center">
                                  <div className="flex-1">
                                    <div className="flex items-center">
                                      <span className={`text-sm font-medium ${
                                        confidence >= 90 ? 'text-green-600' : 
                                        confidence >= 70 ? 'text-yellow-600' : 'text-red-600'
                                      }`}>
                                        {confidence}%
                                      </span>
                                      {confidence >= 90 && (
                                        <CheckCircle className="ml-1 h-4 w-4 text-green-500" />
                                      )}
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                      <div 
                                        className={`h-1.5 rounded-full ${
                                          confidence >= 90 ? 'bg-green-500' : 
                                          confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${confidence}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={isSelected}
                                onChange={(e) => handleMappingChange(uncleanedState, e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="">Select a standard state...</option>
                                {STANDARD_INDIAN_STATES.map(standardState => (
                                  <option key={standardState} value={standardState}>
                                    {standardState}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {hasPendingChange ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                              ) : isSelected ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Mapped
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Unmapped
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <ChangeHistoryIcon
                                recordId={uncleanedState}
                                tableName="creators"
                                onClick={() => handleViewChangeHistory(uncleanedState)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No uncleaned states found</h3>
                <p className="text-gray-500">All state names in the database are already standardized.</p>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Change History Modal */}
      <ChangeHistoryModal
        isOpen={changeHistoryModal.isOpen}
        onClose={() => setChangeHistoryModal({ isOpen: false, recordId: null })}
        recordId={changeHistoryModal.recordId}
        tableName="creators"
        title={`Change History for "${changeHistoryModal.recordId}"`}
      />
    </div>
  );
}
