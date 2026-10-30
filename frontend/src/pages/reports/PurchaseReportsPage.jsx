import React, { useMemo } from 'react';
import { Truck, Download, Printer, DollarSign } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';

export const PurchaseReportsPage = () => {
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
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#007f87]" />
            <span>Wholesale Procurement & Supplier Activity Reports</span>
          </h2>
          <p className="text-xs text-slate-500">
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
          title="Pending In-Transit"
          value={`PKR ${pendingProcurementSpend.toLocaleString()}`}
          subtitle="Awaiting warehouse intake"
          icon={<Truck className="w-5 h-5" />}
          highlightColor="amber"
        />
        <StatCard
          title="Debit Returns Issued"
          value={`PKR ${totalSupplierReturnsSpend.toLocaleString()}`}
          subtitle="Damaged / incorrect supplier returns"
          icon={<DollarSign className="w-5 h-5" />}
          highlightColor="rose"
        />
        <StatCard
          title="Net Purchase Outflow"
          value={`PKR ${Math.max(0, totalProcurementSpend - totalSupplierReturnsSpend).toLocaleString()}`}
          subtitle="Net wholesale funds deployed"
          icon={<DollarSign className="w-5 h-5" />}
          highlightColor="emerald"
        />
      </div>

      {/* Supplier Performance Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Procurement Volume by Publisher / Supplier</h3>
            <p className="text-xs text-slate-500">Summary of purchase orders, deliveries and return adjustments</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Distributor / Publisher</th>
                <th className="px-5 py-3">Contact Person</th>
                <th className="px-5 py-3">POs Logged</th>
                <th className="px-5 py-3">Received Spend (PKR)</th>
                <th className="px-5 py-3">Pending Spend (PKR)</th>
                <th className="px-5 py-3">Returns (PKR)</th>
                <th className="px-5 py-3 text-right">Net Wholesale Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {supplierBreakdown.map((s) => (
                <tr key={s.id} className="hover:bg-teal-50/50 transition">
                  <td className="px-5 py-3 font-semibold text-slate-900">{s.supplierName}</td>
                  <td className="px-5 py-3 text-slate-500">{s.contact}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{s.poCount} POs</td>
                  <td className="px-5 py-3 text-slate-700 font-medium">PKR {s.receivedSpend.toLocaleString()}</td>
                  <td className="px-5 py-3 text-amber-600">PKR {s.pendingSpend.toLocaleString()}</td>
                  <td className="px-5 py-3 text-rose-600">PKR {s.returnsTotal.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900">
                    PKR {s.netProcurement.toLocaleString()}
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
export default PurchaseReportsPage;
