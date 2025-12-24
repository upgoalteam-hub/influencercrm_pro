import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const ExportDialog = ({ isOpen, onClose, selectedCount, totalCount, creators = [] }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportScope, setExportScope] = useState('selected');
  const [selectedColumns, setSelectedColumns] = useState([
    'name',
    'instagram',
    'followers',
    'engagement',
    'category',
    'city',
    'status'
  ]);
  const [exporting, setExporting] = useState(false);

  const formatOptions = [
    { value: 'csv', label: 'CSV (.csv)' },
    { value: 'excel', label: 'Excel (.xlsx)' },
    { value: 'json', label: 'JSON (.json)' }
  ];

  const scopeOptions = [
    { value: 'selected', label: `Selected (${selectedCount} creators)` },
    { value: 'filtered', label: 'Current filtered results' },
    { value: 'all', label: `All creators (${totalCount})` }
  ];

  const columnOptions = [
    { value: 'name', label: 'Name' },
    { value: 'instagram', label: 'Instagram Handle' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'followers', label: 'Followers Count' },
    { value: 'engagement', label: 'Engagement Rate' },
    { value: 'category', label: 'Category' },
    { value: 'city', label: 'City' },
    { value: 'status', label: 'Status' },
    { value: 'lastPrice', label: 'Last Price' },
    { value: 'lastCampaign', label: 'Last Campaign Date' },
    { value: 'tags', label: 'Tags' },
    { value: 'notes', label: 'Notes' }
  ];

  const handleColumnToggle = (column) => {
    if (selectedColumns?.includes(column)) {
      setSelectedColumns(selectedColumns?.filter(c => c !== column));
    } else {
      setSelectedColumns([...selectedColumns, column]);
    }
  };

  const handleSelectAllColumns = () => {
    if (selectedColumns?.length === columnOptions?.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(columnOptions?.map(c => c?.value));
    }
  };

  /**
   * Convert creators data to CSV format
   */
  const convertToCSV = (data) => {
    const columnMapping = {
      name: 'name',
      instagram: 'instagramHandle',
      email: 'email',
      phone: 'whatsapp',
      followers: 'followers',
      engagement: 'engagementRate',
      category: 'category',
      city: 'city',
      status: 'status',
      lastPrice: 'lastPrice',
      lastCampaign: 'lastCampaignDate'
    };

    // Create header row
    const headers = selectedColumns?.map(col => 
      columnOptions?.find(opt => opt?.value === col)?.label || col
    )?.join(',');

    // Create data rows
    const rows = data?.map(creator => 
      selectedColumns?.map(col => {
        const field = columnMapping?.[col];
        const value = creator?.[field] || '';
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value?.includes(',') || value?.includes('"'))
          ? `"${value?.replace(/"/g, '""')}"`
          : value;
      })?.join(',')
    );

    return [headers, ...rows]?.join('\n');
  };

  /**
   * Convert creators data to JSON format
   */
  const convertToJSON = (data) => {
    const columnMapping = {
      name: 'name',
      instagram: 'instagramHandle',
      email: 'email',
      phone: 'whatsapp',
      followers: 'followers',
      engagement: 'engagementRate',
      category: 'category',
      city: 'city',
      status: 'status',
      lastPrice: 'lastPrice',
      lastCampaign: 'lastCampaignDate'
    };

    return data?.map(creator => {
      const exportData = {};
      selectedColumns?.forEach(col => {
        const field = columnMapping?.[col];
        const label = columnOptions?.find(opt => opt?.value === col)?.label || col;
        exportData[label] = creator?.[field] || '';
      });
      return exportData;
    });
  };

  /**
   * Download file with given content
   */
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      if (selectedColumns?.length === 0) {
        alert('Please select at least one column to export');
        return;
      }

      if (creators?.length === 0) {
        alert('No creators to export');
        return;
      }

      const timestamp = new Date()?.toISOString()?.split('T')?.[0];
      let filename = `creators_export_${timestamp}`;
      let content;
      let mimeType;

      switch (exportFormat) {
        case 'csv':
          content = convertToCSV(creators);
          filename += '.csv';
          mimeType = 'text/csv;charset=utf-8;';
          break;

        case 'json':
          content = JSON.stringify(convertToJSON(creators), null, 2);
          filename += '.json';
          mimeType = 'application/json;charset=utf-8;';
          break;

        case 'excel': // For Excel, we'll generate CSV and user can open it in Excel
          // A full Excel export would require a library like xlsx
          content = convertToCSV(creators);
          filename += '.csv';
          mimeType = 'text/csv;charset=utf-8;';
          alert('Excel format exported as CSV - you can open it in Excel');
          break;

        default:
          throw new Error('Unsupported export format');
      }

      downloadFile(content, filename, mimeType);
      
      // Show success message
      alert(`Successfully exported ${creators?.length} creators to ${exportFormat?.toUpperCase()}`);
      
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export creators: ${error?.message}`);
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg-custom w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Download" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Export Creators</h2>
              <p className="text-sm text-muted-foreground">
                Configure export settings and download data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors duration-200"
            aria-label="Close dialog"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Export Format
              </label>
              <Select
                options={formatOptions}
                value={exportFormat}
                onChange={setExportFormat}
                placeholder="Select format"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Export Scope
              </label>
              <Select
                options={scopeOptions}
                value={exportScope}
                onChange={setExportScope}
                placeholder="Select scope"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">
                  Select Columns to Export
                </label>
                <button
                  onClick={handleSelectAllColumns}
                  className="text-xs text-primary hover:underline"
                >
                  {selectedColumns?.length === columnOptions?.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-md border border-border max-h-64 overflow-y-auto custom-scrollbar">
                {columnOptions?.map((column) => (
                  <Checkbox
                    key={column?.value}
                    label={column?.label}
                    checked={selectedColumns?.includes(column?.value)}
                    onChange={() => handleColumnToggle(column?.value)}
                    size="sm"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {selectedColumns?.length} of {columnOptions?.length} columns selected
              </p>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={18} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground">
                  <p className="font-medium mb-1">Export Information</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Exports {creators?.length} creators based on current selection</li>
                    <li>• Selected columns will be included in the export file</li>
                    <li>• File will be downloaded to your browser's download folder</li>
                    <li>• Excel format is exported as CSV (can be opened in Excel)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="ghost" onClick={onClose} disabled={exporting}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleExport}
            disabled={selectedColumns?.length === 0 || exporting}
            iconName={exporting ? 'Loader2' : 'Download'}
            iconPosition="left"
            iconSize={16}
          >
            {exporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;