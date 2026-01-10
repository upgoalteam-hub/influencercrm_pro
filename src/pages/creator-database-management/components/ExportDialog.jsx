import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { exportUtils } from '../../../utils/exportUtils';
import { exportLogService } from '../../../services/exportLogService';
import { useAuth } from '../../../contexts/AuthContext';

const ExportDialog = ({ isOpen, onClose, selectedCount, totalCount, creators = [] }) => {
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportScope, setExportScope] = useState('selected');
  const { userProfile } = useAuth();

  const handleExport = async () => {
    try {
      const creatorsToExport = exportScope === 'all' 
        ? creators 
        : creators?.filter((_, index) => index < selectedCount);

      if (creatorsToExport?.length === 0) {
        alert('No creators selected for export');
        return;
      }

      const formattedData = exportUtils?.formatCreatorData(creatorsToExport);
      const timestamp = new Date()?.toISOString()?.slice(0, 10);
      const filename = `creators-export-${timestamp}`;

      // Perform the export
      switch (exportFormat) {
        case 'excel':
          exportUtils?.exportToExcel(formattedData, filename);
          break;
        case 'csv':
          exportUtils?.exportToCSV(formattedData, filename);
          break;
        default:
          exportUtils?.exportToExcel(formattedData, filename);
      }

      // Log the export activity
      const username = userProfile?.name || userProfile?.email || 'Unknown User';
      await exportLogService?.logExport({
        username,
        exportType: exportFormat,
        exportScope,
        recordCount: creatorsToExport?.length,
        fileName: `${filename}.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`,
        additionalDetails: `Creator Database Export - ${exportScope === 'selected' ? 'Selected' : 'All'} Records`
      });

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      
      // Log the export failure
      try {
        const username = userProfile?.name || userProfile?.email || 'Unknown User';
        await exportLogService?.logExport({
          username,
          exportType: exportFormat,
          exportScope,
          recordCount: 0,
          fileName: '',
          additionalDetails: `Export Failed - ${error?.message || 'Unknown error'}`
        });
      } catch (logError) {
        console.error('Failed to log export error:', logError);
      }
      
      alert(`Failed to export creators: ${error?.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[400] p-4">
      <div className="bg-card rounded-lg shadow-lg-custom max-w-md w-full">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Download" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Export Creators</h2>
              <p className="text-xs text-muted-foreground">Choose export format and scope</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
            aria-label="Close dialog"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Export Format
            </label>
            <div className="space-y-2">
              <Checkbox
                label="Excel (.xlsx)"
                checked={exportFormat === 'excel'}
                onChange={() => setExportFormat('excel')}
              />
              <Checkbox
                label="CSV (.csv)"
                checked={exportFormat === 'csv'}
                onChange={() => setExportFormat('csv')}
              />
              <Checkbox
                label="PDF Report"
                checked={exportFormat === 'pdf'}
                onChange={() => setExportFormat('pdf')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Export Scope
            </label>
            <div className="space-y-2">
              <Checkbox
                label={`Selected creators (${selectedCount})`}
                checked={exportScope === 'selected'}
                onChange={() => setExportScope('selected')}
                disabled={selectedCount === 0}
              />
              <Checkbox
                label={`All creators (${totalCount})`}
                checked={exportScope === 'all'}
                onChange={() => setExportScope('all')}
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                The export will include all creator details including Instagram links, followers, location, and contact information.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            iconName="Download"
            iconPosition="left"
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;