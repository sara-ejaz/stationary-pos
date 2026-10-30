import React, { useMemo } from 'react';
import { Boxes, Download, Printer, AlertTriangle, Layers, DollarSign } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const InventoryReportsPage: React.FC = () => {
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
          <h2 className="text-lg font-bold text-[#f2fbfa] flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#007f87]" />
            <span>Store Inventory Valuation & Stock Asset Reports</span>
          </h2>
          <p className="text-xs text-[#8da5a7]">
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
          subtitle="Capital tied in store inventory"
          icon={<DollarSign className="w-5 h-5" />}
          highlightColor="cyan"
        />
        <StatCard
          title="Retail Sales Value"
          value={`PKR ${totalRetailValuation.toLocaleString()}`}
          subtitle="Projected gross revenue value"
          icon={<DollarSign className="w-5 h-5" />}
          highlightColor="emerald"
        />
        <StatCard
          title="Projected Margin"
          value={`PKR ${potentialGrossMargin.toLocaleString()}`}
          subtitle={`${Math.round((potentialGrossMargin / (totalCostValuation || 1)) * 100)}% overall markup`}
          icon={<DollarSign className="w-5 h-5" />}
          highlightColor="amber"
        />
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-[#0a2224] border border-[#143d41] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#143d41] bg-[#00272b]">
          <h3 className="text-sm font-semibold text-[#f2fbfa] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#007f87]" />
            <span>Department & Category Valuation Breakdown</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#081b1d] text-[#d4f1f4] uppercase text-[10px] tracking-wider border-b border-[#143d41]">
              <tr>
                <th className="p-3.5">Category Name</th>
                <th className="p-3.5 text-center">Catalog Products</th>
                <th className="p-3.5 text-center">Units on Shelf</th>
                <th className="p-3.5 text-right">Cost Asset Value</th>
                <th className="p-3.5 text-right">Retail Potential Value</th>
                <th className="p-3.5 text-right">Expected Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#143d41]">
              {categoryBreakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#07181a]">
                  <td className="p-3.5 font-semibold text-[#f2fbfa]">{row.categoryName}</td>
                  <td className="p-3.5 text-center">{row.itemCount} items</td>
                  <td className="p-3.5 text-center font-bold text-[#d4f1f4]">{row.totalUnits}</td>
                  <td className="p-3.5 text-right text-[#8da5a7]">
                    PKR {row.costValue.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-semibold text-[#f2fbfa]">
                    PKR {row.retailValue.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-bold text-[#10b981]">
                    PKR {row.margin.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#00272b] border-t border-[#143d41] font-bold text-xs text-[#d4f1f4]">
              <tr>
                <td className="p-3.5">STORE TOTALS:</td>
                <td className="p-3.5 text-center">{products.length} Products</td>
                <td className="p-3.5 text-center">{totalStockUnits} Units</td>
                <td className="p-3.5 text-right">PKR {totalCostValuation.toLocaleString()}</td>
                <td className="p-3.5 text-right">PKR {totalRetailValuation.toLocaleString()}</td>
                <td className="p-3.5 text-right text-[#10b981]">
                  PKR {potentialGrossMargin.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
