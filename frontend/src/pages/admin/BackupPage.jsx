import React, { useState, useRef } from 'react';
import { Database, Download, Upload, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const BackupPage = () => {
  const { exportBackupData, restoreBackupData, clearLocalStore, products, transactions } = useStore();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [backupHistory, setBackupHistory] = useState([]);

  const [restoreConfirmData, setRestoreConfirmData] = useState(null);
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

    const newRecord = {
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
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
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
        toast.success('Store Restored', 'Catalog, transactions, and store state loaded from snapshot.');
      } else {
        toast.error('Restore Failed', 'Unable to parse provided backup payload.');
      }
      setRestoreConfirmData(null);
    }
  };

  const handleConfirmReset = () => {
    clearLocalStore();
    toast.warning('Storage Reset', 'Foji Book Center local data reset to initial clean state.');
    setResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-[#007f87]" />
            <span>Database Backup, Restore & Data Safeguards</span>
          </h2>
          <p className="text-xs text-slate-500">
            Export JSON data snapshots of retail stock, books, stationary items, and invoices.
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
            Import JSON Backup
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleCreateBackup}
          >
            Create Backup Snapshot
          </Button>
        </div>
      </div>

      {/* Overview Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-teal-50 text-[#007f87] border border-teal-200 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Inventory Records</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{products.length} Products</h4>
            <p className="text-[11px] text-slate-500 mt-1">Preserved in browser local storage and offline cache</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">POS Transaction Logs</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{transactions.length} Invoices</h4>
            <p className="text-[11px] text-slate-500 mt-1">Fully serialized with barcode and customer references</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Snapshot Frequency</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">On Demand</h4>
            <p className="text-[11px] text-slate-500 mt-1">Exportable for external drive or cloud archiving</p>
          </div>
        </div>
      </div>

      {/* Snapshot History Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Recent Backup Snapshots</h3>
            <p className="text-xs text-slate-500">History of downloads generated in this session</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Archive Filename</th>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3">Records</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backupHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No backup snapshots generated yet. Click "Create Backup Snapshot" above to export a JSON archive.
                  </td>
                </tr>
              ) : (
                backupHistory.map((bkp) => (
                  <tr key={bkp.id} className="hover:bg-teal-50/50 transition">
                    <td className="px-5 py-3 font-mono text-slate-800 font-medium">{bkp.filename}</td>
                    <td className="px-5 py-3 text-slate-500">{bkp.timestamp}</td>
                    <td className="px-5 py-3 font-mono">{bkp.size}</td>
                    <td className="px-5 py-3">{bkp.recordCount} items</td>
                    <td className="px-5 py-3">
                      <Badge variant="success" size="sm">Available</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={handleCreateBackup}>
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Clear Local Storage */}
      <div className="p-5 rounded-xl bg-white border border-rose-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone: Clear Local Database</span>
        </div>
        <p className="text-xs text-slate-600">
          Reset all products, stock counts, transactions, and suppliers back to an initial empty state.
        </p>
        <div className="pt-1">
          <Button
            variant="danger"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => setResetConfirmOpen(true)}
          >
            Clear All Local Store Data
          </Button>
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!restoreConfirmData}
        onClose={() => setRestoreConfirmData(null)}
        onConfirm={handleConfirmRestore}
        title="Restore Store from Backup"
        message="Are you sure you want to restore this archive? It will replace all currently active catalog items, stock quantities, and recent invoices with the archive contents."
        confirmText="Proceed & Overwrite"
        variant="danger"
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Clear Local Storage Confirmation"
        message="This action will completely wipe local catalog modifications and reset the database to a clean empty state. This action cannot be undone."
        confirmText="Confirm Clear Data"
        variant="danger"
      />
    </div>
  );
};
export default BackupPage;
