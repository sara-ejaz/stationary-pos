import React, { useState, useRef } from 'react';
import { Database, Download, Upload, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

interface BackupItem {
  id: string;
  filename: string;
  timestamp: string;
  size: string;
  status: 'available' | 'restored';
  recordCount: number;
}

export const BackupPage: React.FC = () => {
  const { exportBackupData, restoreBackupData, resetDemoData, products, transactions } = useStore();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [backupHistory, setBackupHistory] = useState<BackupItem[]>([
    {
      id: 'bkp-1',
      filename: 'foji_pos_backup_2026-03-12_2100.json',
      timestamp: '2026-03-12 21:00:00',
      size: '48.2 KB',
      status: 'available',
      recordCount: 84
    },
    {
      id: 'bkp-2',
      filename: 'foji_pos_backup_2026-03-01_1800.json',
      timestamp: '2026-03-01 18:00:00',
      size: '39.8 KB',
      status: 'available',
      recordCount: 65
    }
  ]);

  const [restoreConfirmData, setRestoreConfirmData] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Trigger Download of Backup JSON
  const handleCreateBackup = () => {
    const jsonStr = exportBackupData();
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `foji_pos_snapshot_${timestampStr}.json`;

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const newRecord: BackupItem = {
      id: `bkp-${Date.now()}`,
      filename,
      timestamp: new Date().toLocaleString('en-GB'),
      size: `${(jsonStr.length / 1024).toFixed(1)} KB`,
      status: 'available',
      recordCount: products.length + transactions.length
    };

    setBackupHistory([newRecord, ...backupHistory]);
    toast.success('Backup Generated', `System snapshot saved as "${filename}".`);
  };

  // Upload JSON File for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        if (parsed.data) {
          setRestoreConfirmData(content);
        } else {
          toast.error('Invalid Archive', 'JSON file does not contain a recognized Foji POS data structure.');
        }
      } catch (err) {
        toast.error('Parse Error', 'Uploaded file is not valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = () => {
    if (restoreConfirmData) {
      const success = restoreBackupData(restoreConfirmData);
      if (success) {
        toast.success('System Restored', 'Catalog, transactions, and settings restored successfully!');
      } else {
        toast.error('Restore Failed', 'Unable to restore snapshot.');
      }
      setRestoreConfirmData(null);
    }
  };

  const handleConfirmReset = () => {
    resetDemoData();
    toast.info('Catalog Reset', 'All products, sales, and settings reset to default demo catalog.');
    setResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-[#291e0a] border border-[#f59e0b]/40 flex items-start gap-3 text-xs text-[#f2fbfa]">
        <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[#f59e0b]">Demonstration Mode Notice</p>
          <p className="text-[#8da5a7] mt-0.5">
            This module demonstrates disaster recovery and JSON data export/import for store managers. Actual automated database backups will execute via MongoDB Atlas and your backend daemon.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f2fbfa] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#007f87]" />
            <span>Database Backup & Recovery Simulation</span>
          </h2>
          <p className="text-xs text-[#8da5a7]">
            Export localized JSON snapshots of books, stationery, purchases, and invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Backup File
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleCreateBackup}
          >
            Create Backup Snapshot
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => setResetConfirmOpen(true)}
          >
            Reset Demo Data
          </Button>
        </div>
      </div>

      {/* Backup Archives Table */}
      <div className="bg-[#0a2224] border border-[#143d41] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#143d41] bg-[#00272b] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#f2fbfa] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#007f87]" />
            <span>Backup Snapshots History</span>
          </h3>
          <span className="text-xs text-[#8da5a7]">{backupHistory.length} archives recorded</span>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="bg-[#081b1d] text-[#d4f1f4] uppercase text-[10px] tracking-wider border-b border-[#143d41]">
            <tr>
              <th className="p-3.5">Filename</th>
              <th className="p-3.5">Created At</th>
              <th className="p-3.5 text-center">Archive Size</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#143d41]">
            {backupHistory.map((item) => (
              <tr key={item.id} className="hover:bg-[#07181a]">
                <td className="p-3.5 font-mono text-[#f2fbfa]">{item.filename}</td>
                <td className="p-3.5 text-[#8da5a7]">{item.timestamp}</td>
                <td className="p-3.5 text-center text-[#d4f1f4]">{item.size}</td>
                <td className="p-3.5 text-center">
                  <Badge variant="success" size="sm">Available</Badge>
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={handleCreateBackup}
                    className="text-[#007f87] hover:underline font-semibold"
                  >
                    Download Again
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!restoreConfirmData}
        onClose={() => setRestoreConfirmData(null)}
        onConfirm={handleConfirmRestore}
        title="Confirm Data Restore"
        message="Restoring from an uploaded JSON snapshot will replace current in-memory products, transactions, and categories with the archived contents. Are you sure you wish to proceed?"
        confirmText="Proceed with Restore"
        variant="primary"
      />

      {/* Reset Demo Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Confirm Factory Demo Reset"
        message="This will wipe all custom demo additions and reset the bookstore catalog, sales transactions, and suppliers back to pristine default records. This action cannot be reversed."
        confirmText="Reset to Defaults"
        variant="danger"
      />
    </div>
  );
};
