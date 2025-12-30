// Test script for export logging functionality
// This can be run in the browser console to test the export logging

import { exportLogService } from '../services/exportLogService';

// Test function to verify export logging
async function testExportLogging() {
  console.log('🧪 Testing Export Logging Functionality...');
  
  try {
    // Test 1: Log a successful export
    console.log('📝 Test 1: Logging successful export...');
    const result1 = await exportLogService.logExport({
      username: 'test.user@example.com',
      exportType: 'excel',
      exportScope: 'selected',
      recordCount: 25,
      fileName: 'creators-export-2025-12-29.xlsx',
      additionalDetails: 'Creator Database Export - Selected Records'
    });
    
    console.log('✅ Test 1 Result:', result1);
    
    // Test 2: Log a failed export
    console.log('📝 Test 2: Logging failed export...');
    const result2 = await exportLogService.logExport({
      username: 'test.user@example.com',
      exportType: 'csv',
      exportScope: 'all',
      recordCount: 0,
      fileName: '',
      additionalDetails: 'Export Failed - Network error'
    });
    
    console.log('✅ Test 2 Result:', result2);
    
    // Test 3: Get export logs
    console.log('📝 Test 3: Fetching export logs...');
    const logs = await exportLogService.getExportLogs({
      limit: 10,
      username: 'test.user@example.com'
    });
    
    console.log('✅ Test 3 Result - Logs:', logs);
    
    // Test 4: Get export statistics
    console.log('📝 Test 4: Fetching export statistics...');
    const stats = await exportLogService.getExportStatistics({
      username: 'test.user@example.com'
    });
    
    console.log('✅ Test 4 Result - Statistics:', stats);
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test the export details string formatting
function testExportDetailsFormatting() {
  console.log('🧪 Testing Export Details Formatting...');
  
  const testCases = [
    {
      exportType: 'excel',
      exportScope: 'selected',
      recordCount: 25,
      fileName: 'test.xlsx',
      additionalDetails: 'Test export'
    },
    {
      exportType: 'csv',
      exportScope: 'all',
      recordCount: 100,
      fileName: 'test.csv',
      additionalDetails: ''
    },
    {
      exportType: 'pdf',
      exportScope: 'filtered',
      recordCount: 0,
      fileName: '',
      additionalDetails: 'Export failed - Error message'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    const details = exportLogService.buildExportDetailsString(testCase);
    console.log(`✅ Test Case ${index + 1}:`, details);
  });
}

// Export test functions for use in browser console
if (typeof window !== 'undefined') {
  window.testExportLogging = testExportLogging;
  window.testExportDetailsFormatting = testExportDetailsFormatting;
  console.log('🔧 Export logging test functions available:');
  console.log('  - testExportLogging() - Test full export logging functionality');
  console.log('  - testExportDetailsFormatting() - Test export details formatting');
}

export { testExportLogging, testExportDetailsFormatting };
