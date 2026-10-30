import React, { useMemo } from 'react';
import { Truck, Download, Printer, Calendar, DollarSign } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';

export const PurchaseReportsPage: React.FC = () => {
  const { purchases, suppliers, purchaseReturns } = useStore();

  const totalProcurementSpend = useMemo(() => {
    return purchases
      .filter((p) => p.status === 'received')
      .reduce((sum, p) => sum + p.totalAmount, 0);
  }, [purchases]);

  const pendingProcurementSpend = useMemo(() => {
    return purchases
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.totalAmount, 0);
  }, [purchases]);

  const totalSupplierReturnsSpend = useMemo(() => {
    return purchaseReturns.reduce((sum, pr) => sum + pr.totalRefundAmount, 0);
  }, [purchaseReturns]);

  // Supplier-wise summary
  const supplierBreakdown = useMemo(() => {
    return suppliers.map((sup) => {
      const supPurchases = purchases.filter((p) => p.supplierId === sup.id);
      const receivedPOs = supPurchases.filter((p) => p.status === 'received');
      const receivedTotal = receivedPOs.reduce((sum, p) => sum + p.totalAmount, 0);
      const pendingPOs = supPurchases.filter((p) => p.status === 'pending');
      const returns = purchaseReturns.filter((pr) => pr.supplierId === sup.id);
      const returnsTotal = returns.reduce((sum, pr) => sum + pr.totalRefundAmount, 0);

      return {
        id: sup.id,
        supplierName: sup.companyName,
        contact: sup.contactPerson,
        poCount: supPurchases.length,
        receivedSpend: receivedTotal,
        pendingSpend: pendingPOs.reduce((sum, p) => sum + p.totalAmount, 0),
        returnsTotal,
        netProcurement: Math.max(0, receivedTotal - returnsTotal)
      };
    });
  }, [suppliers, purchases, purchaseReturns]);

  const handleExportCSV = () => {
    const headers = ['Supplier Name', 'Contact Person', 'Total POs', 'Received Spend (PKR)', 'Returns (PKR)', 'Net Procurement (PKR)'];
    const rows = supplierBreakdown.map((s) => [
      `"${s.supplierName}"`,
      `"${s.contact}"`,
      s.poCount,
      s.receivedSpend,
      s.returnsTotal,
      s.netProcurement
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Foji_SupplierProcurement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f2fbfa] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#007f87]" />
            <span>Wholesale Procurement & Supplier Activity Reports</span>
          </h2>
          <p className="text-xs text-[#8da5a7]">
            Analyze distributor expenditure, received shipments, pending consignments, and debit returns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
            Export Procurement CSV
          </Button>
          <Button variant="secondary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Received Procurement"
          value={`PKR ${totalProcurementSpend.toLocaleString()}`}
          subtitle="Completed supplier stock intakes"
          icon={<DollarSign className="w-5 h-5" />}
          highlightColor="teal"
        />
        <StatCard
          title="Pending Deliveries"
          value={`PKR ${pendingProcurementSpend.toLocaleString()}`}
          subtitle={`${purchases.filter((p) => p.status === 'pending').length} purchase orders awaiting`}
          icon={<Truck className="w-5 h-5" />}
          highlightColor="amber"
        />
        <StatCard
          title="Supplier Returns Debit"
          value={`PKR ${totalSupplierReturnsSpend.toLocaleString()}`}
          subtitle={`${purchaseReturns.length} reversed consignments`}
          icon={<DollarSign className="w-5 h-5" />}
          highlightColor="rose"
        />
        <StatCard
          title="Active Suppliers"
          value={suppliers.length}
          subtitle="Accredited book & stationery firms"
          icon={<Truck className="w-5 h-5" />}
          highlightColor="emerald"
        />
      </div>

      {/* Supplier Breakdown Table */}
      <div className="bg-[#0a2224] border border-[#143d41] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#143d41] bg-[#00272b]">
          <h3 className="text-sm font-semibold text-[#f2fbfa]">
            Supplier-wise Procurement Volume & Return Deductions
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#081b1d] text-[#d4f1f4] uppercase text-[10px] tracking-wider border-b border-[#143d41]">
              <tr>
                <th className="p-3.5">Distributor / Supplier</th>
                <th className="p-3.5">Contact Rep</th>
                <th className="p-3.5 text-center">Total POs</th>
                <th className="p-3.5 text-right">Received Consignments</th>
                <th className="p-3.5 text-right">Pending In-transit</th>
                <th className="p-3.5 text-right">Returns Debit</th>
                <th className="p-3.5 text-right">Net Spend (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#143d41]">
              {supplierBreakdown.map((row) => (
                <tr key={row.id} className="hover:bg-[#07181a]">
                  <td className="p-3.5 font-semibold text-[#f2fbfa]">{row.supplierName}</td>
                  <td className="p-3.5 text-[#8da5a7]">{row.contact}</td>
                  <td className="p-3.5 text-center font-mono">{row.poCount}</td>
                  <td className="p-3.5 text-right text-[#f2fbfa]">
                    PKR {row.receivedSpend.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right text-[#f59e0b]">
                    PKR {row.pendingSpend.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right text-[#f43f5e]">
                    PKR {row.returnsTotal.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-bold text-[#10b981]">
                    PKR {row.netProcurement.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
