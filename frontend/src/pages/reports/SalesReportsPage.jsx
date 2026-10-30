import React, { useState, useMemo } from 'react';
import { FileBarChart, Download, Printer, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';

export const SalesReportsPage = () => {
  const { transactions, salesReturns } = useStore();
  const [reportRange, setReportRange] = useState('weekly');

  // Summary Metrics Calculations in PKR
  const grossSales = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.subtotal, 0);
  }, [transactions]);

  const totalDiscounts = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.overallDiscount, 0);
  }, [transactions]);

  const totalRefunds = useMemo(() => {
    return salesReturns.reduce((sum, r) => sum + r.totalRefundAmount, 0);
  }, [salesReturns]);

  const netSales = Math.max(0, grossSales - totalDiscounts - totalRefunds);

  const totalUnitsSold = useMemo(() => {
    return transactions.reduce(
      (sum, t) => sum + t.items.reduce((iSum, i) => iSum + i.quantity, 0),
      0
    );
  }, [transactions]);

  // Chart data
  const reportChartData = [
    { period: 'Week 1', gross: 24000, discounts: 1200, refunds: 800, net: 22000 },
    { period: 'Week 2', gross: 31500, discounts: 1500, refunds: 400, net: 29600 },
    { period: 'Week 3', gross: 28000, discounts: 900, refunds: 1200, net: 25900 },
    { period: 'Week 4 (Current)', gross: grossSales || 35000, discounts: totalDiscounts || 1800, refunds: totalRefunds || 320, net: netSales || 32880 }
  ];

  const handleExportCSV = () => {
    const headers = ['Metric', 'Amount (PKR)'];
    const rows = [
      ['Gross Sales Revenue', grossSales],
      ['Authorized Discounts', totalDiscounts],
      ['Refunds Issued', totalRefunds],
      ['Net Sales', netSales],
      ['Total Units Sold', totalUnitsSold],
      ['Total Completed Transactions', transactions.length]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Foji_SalesReport_${reportRange}.csv`);
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
            <FileBarChart className="w-5 h-5 text-[#007f87]" />
            <span>Retail Sales Performance & Profitability Reports</span>
          </h2>
          <p className="text-xs text-slate-500">
            Revenue, discounts, refunds, and net margins calculated across all checkout transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex rounded-lg border border-slate-300 bg-white p-1 text-xs shadow-sm">
            {['daily', 'weekly', 'monthly'].map((r) => (
              <button
                key={r}
                onClick={() => setReportRange(r)}
                className={`px-3 py-1 rounded font-medium capitalize transition ${
                  reportRange === r
                    ? 'bg-[#007f87] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Sales"
          value={`PKR ${grossSales.toLocaleString()}`}
          subtitle="Pre-discount checkout total"
          icon={<TrendingUp className="w-5 h-5" />}
          highlightColor="teal"
        />
        <StatCard
          title="Discounts Given"
          value={`PKR ${totalDiscounts.toLocaleString()}`}
          subtitle="Cashier promotional discounts"
          icon={<FileBarChart className="w-5 h-5" />}
          highlightColor="amber"
        />
        <StatCard
          title="Refunds Paid Out"
          value={`PKR ${totalRefunds.toLocaleString()}`}
          subtitle={`${salesReturns.length} return receipts processed`}
          icon={<TrendingUp className="w-5 h-5" />}
          highlightColor="rose"
        />
        <StatCard
          title="Net Store Sales"
          value={`PKR ${netSales.toLocaleString()}`}
          subtitle={`${transactions.length} transactions • ${totalUnitsSold} units`}
          icon={<TrendingUp className="w-5 h-5" />}
          highlightColor="emerald"
        />
      </div>

      {/* Recharts Analytics */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Gross Sales vs Discounts & Refunds Comparison
          </h3>
          <span className="text-xs text-slate-500">Values displayed in Pakistani Rupees (PKR)</span>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
              <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(val) => `Rs ${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#0f172a',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(val) => [`PKR ${Number(val).toLocaleString()}`]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              <Bar dataKey="gross" name="Gross Sales" fill="#007f87" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" name="Net Sales" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="discounts" name="Discounts" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="refunds" name="Refunds" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default SalesReportsPage;
