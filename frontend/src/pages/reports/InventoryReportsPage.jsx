import React, { useMemo } from 'react';
import { Boxes, Download, Printer } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const InventoryReportsPage = () => {
  const { products, categories, damagedRecords } = useStore();

  // Inventory Valuation Calculations
  const totalStockUnits = useMemo(() => {
    return products.reduce((sum, p) => sum + p.quantity, 0);
  }, [products]);

  const totalCostValuation = useMemo(() => {
    return products.reduce((sum, p) => sum + p.quantity * p.purchasePrice, 0);
  }, [products]);

  const totalRetailValuation = useMemo(() => {
    return products.reduce((sum, p) => sum + p.quantity * p.sellingPrice, 0);
  }, [products]);

  const potentialGrossMargin = totalRetailValuation - totalCostValuation;

  // Category-wise summary
  const categoryBreakdown = useMemo(() => {
    return categories.map((cat) => {
      const catProducts = products.filter((p) => p.category === cat.name);
      const units = catProducts.reduce((sum, p) => sum + p.quantity, 0);
      const costValue = catProducts.reduce((sum, p) => sum + p.quantity * p.purchasePrice, 0);
      const retailValue = catProducts.reduce((sum, p) => sum + p.quantity * p.sellingPrice, 0);
      return {
        categoryName: cat.name,
        itemCount: catProducts.length,
        totalUnits: units,
        costValue,
        retailValue,
        margin: retailValue - costValue
      };
    });
  }, [categories, products]);

  const handleExportCSV = () => {
    const headers = ['Category', 'Active Items', 'Units in Stock', 'Valuation Cost (PKR)', 'Valuation Retail (PKR)', 'Potential Margin (PKR)'];
    const rows = categoryBreakdown.map((c) => [
      `"${c.categoryName}"`,
      c.itemCount,
      c.totalUnits,
      c.costValue,
      c.retailValue,
      c.margin
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Foji_InventoryValuation_${new Date().toISOString().split('T')[0]}.csv`);
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
            <Boxes className="w-5 h-5 text-[#007f87]" />
            <span>Store Inventory Valuation & Stock Asset Reports</span>
          </h2>
          <p className="text-xs text-slate-500">
            Valuation calculated at wholesale procurement cost and expected retail market price in PKR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
            Export Valuation CSV
          </Button>
          <Button variant="secondary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stocked Units"
          value={totalStockUnits.toLocaleString()}
          subtitle="Books and stationery items"
          icon={<Boxes className="w-5 h-5" />}
          highlightColor="teal"
        />
        <StatCard
          title="Inventory Cost Value"
          value={`PKR ${totalCostValuation.toLocaleString()}`}
          subtitle="Wholesale distributor asset value"
          icon={<Boxes className="w-5 h-5" />}
          highlightColor="cyan"
        />
        <StatCard
          title="Expected Retail Value"
          value={`PKR ${totalRetailValuation.toLocaleString()}`}
          subtitle="Customer shelf-price value"
          icon={<Boxes className="w-5 h-5" />}
          highlightColor="emerald"
        />
        <StatCard
          title="Potential Gross Margin"
          value={`PKR ${potentialGrossMargin.toLocaleString()}`}
          subtitle="Unrealized markup potential"
          icon={<Boxes className="w-5 h-5" />}
          highlightColor="teal"
        />
      </div>

      {/* Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Inventory Valuation by Catalog Category</h3>
            <p className="text-xs text-slate-500">Asset breakdown across books, notebooks, registers & stationery</p>
          </div>
          <Badge variant="neutral" size="sm">{categories.length} Active Categories</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Category Title</th>
                <th className="px-5 py-3">SKU Count</th>
                <th className="px-5 py-3">Units in Stock</th>
                <th className="px-5 py-3">Cost Valuation (PKR)</th>
                <th className="px-5 py-3">Retail Valuation (PKR)</th>
                <th className="px-5 py-3 text-right">Potential Gross Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoryBreakdown.map((cat, idx) => (
                <tr key={idx} className="hover:bg-teal-50/50 transition">
                  <td className="px-5 py-3 font-semibold text-slate-900">{cat.categoryName}</td>
                  <td className="px-5 py-3">{cat.itemCount} products</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{cat.totalUnits.toLocaleString()}</td>
                  <td className="px-5 py-3 text-slate-600">PKR {cat.costValue.toLocaleString()}</td>
                  <td className="px-5 py-3 font-bold text-slate-900">PKR {cat.retailValue.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-bold text-emerald-600">
                    +PKR {cat.margin.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
              <tr>
                <td className="px-5 py-3">Total Inventory</td>
                <td className="px-5 py-3">{products.length} Products</td>
                <td className="px-5 py-3">{totalStockUnits.toLocaleString()}</td>
                <td className="px-5 py-3">PKR {totalCostValuation.toLocaleString()}</td>
                <td className="px-5 py-3">PKR {totalRetailValuation.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-emerald-600">+PKR {potentialGrossMargin.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
export default InventoryReportsPage;
