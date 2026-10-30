import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banknote,
  Receipt,
  Package,
  AlertTriangle,
  ShoppingCart,
  PlusCircle,
  Truck,
  TrendingUp,
  Boxes,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { products, transactions, purchases, stockMovements, categories } = useStore();
  const [timeFilter, setTimeFilter] = useState('today');

  // Dynamic KPI Calculations from consistent demo transactions
  const totalSalesPKR = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (t.status === 'completed' ? t.totalAmount : 0), 0);
  }, [transactions]);

  const totalTransactionsCount = transactions.length;

  const totalUnitsSold = useMemo(() => {
    return transactions.reduce(
      (sum, t) => sum + t.items.reduce((iSum, item) => iSum + item.quantity, 0),
      0
    );
  }, [transactions]);

  const activeProductsCount = products.filter((p) => p.status === 'active').length;
  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity <= p.minStockThreshold
  ).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;
  const pendingPurchasesCount = purchases.filter((p) => p.status === 'pending').length;

  // Chart Data: populated from real transactions when backend is connected
  // Returns an empty array until the API provides historical sales data.
  const salesChartData = [];

  // Category Distribution for Pie Chart
  const categoryData = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  const PIE_COLORS = ['#007f87', '#005f6a', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#f43f5e'];

  // Top Selling Items (computed from real transactions)
  const topSelling = useMemo(() => {
    const itemMap = {};
    transactions.forEach((tx) => {
      tx.items.forEach((item) => {
        if (!itemMap[item.productId]) {
          itemMap[item.productId] = {
            name: item.productName,
            category: item.category,
            qty: 0,
            revenue: 0
          };
        }
        itemMap[item.productId].qty += item.quantity;
        itemMap[item.productId].revenue += item.subtotal;
      });
    });

    return Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [transactions]);

  const recentMovements = stockMovements.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Store Operations Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Foji Book Center • Cantt Commercial Branch • Real-time Retail Metrics
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            icon={<ShoppingCart className="w-4 h-4" />}
            onClick={() => navigate('/pos')}
          >
            New Sale (POS)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => navigate('/catalog/books')}
          >
            Add Product
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Truck className="w-4 h-4" />}
            onClick={() => navigate('/purchasing/orders')}
          >
            Receive Purchase
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales Revenue"
          value={`PKR ${totalSalesPKR.toLocaleString()}`}
          subtitle={`${totalTransactionsCount} completed transactions`}
          icon={<Banknote className="w-5 h-5" />}
          highlightColor="teal"
          onClick={() => navigate('/transactions')}
        />

        <StatCard
          title="Units Sold Today"
          value={totalUnitsSold}
          subtitle="Books & stationery items"
          icon={<Receipt className="w-5 h-5" />}
          highlightColor="cyan"
          onClick={() => navigate('/transactions')}
        />

        <StatCard
          title="Low & Out of Stock"
          value={`${lowStockCount} / ${outOfStockCount}`}
          subtitle={`${lowStockCount} low stock • ${outOfStockCount} zero stock`}
          icon={<AlertTriangle className="w-5 h-5" />}
          highlightColor={outOfStockCount > 0 ? 'rose' : 'amber'}
          onClick={() => navigate('/inventory/alerts')}
        />

        <StatCard
          title="Active Products"
          value={activeProductsCount}
          subtitle={`${categories.length} categories • ${pendingPurchasesCount} POs pending`}
          icon={<Package className="w-5 h-5" />}
          highlightColor="emerald"
          onClick={() => navigate('/catalog/books')}
        />
      </div>

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Recharts Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#007f87]" />
              <h3 className="text-sm font-semibold text-slate-900">Weekly Sales Performance (PKR)</h3>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
              {['today', 'week', 'month'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium capitalize transition cursor-pointer ${
                    timeFilter === filter
                      ? 'bg-[#007f87] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 mt-4">
            {salesChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-slate-400">No sales data available. Connect backend to display chart.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007f87" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#007f87" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
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
                    formatter={(val) => [`PKR ${Number(val).toLocaleString()}`, 'Sales']}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#007f87"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Share Recharts Pie */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Boxes className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Category Distribution</h3>
          </div>

          <div className="h-48 my-auto relative">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-slate-400">No categories yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(val) => [`${val} items`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
            {categoryData.length === 0 ? (
              <p className="text-center text-slate-400 py-2">No data available.</p>
            ) : (
              categoryData.slice(0, 4).map((c, i) => (
                <div key={c.name} className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{c.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tables Row: Best-Selling & Recent Stock Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Best-Selling Inventory</h3>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs text-[#007f87] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              All Sales <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topSelling.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No sales data available yet.</p>
            ) : (
              topSelling.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-[11px] text-[#007f87]">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#007f87]">PKR {item.revenue.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">{item.qty} units sold</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Live Stock Movement Ledger</h3>
            <button
              onClick={() => navigate('/inventory/history')}
              className="text-xs text-[#007f87] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Full Ledger <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentMovements.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No stock movements recorded yet.</p>
            ) : (
              recentMovements.map((sm) => {
                const isPositive = sm.quantityChange > 0;
                return (
                  <div
                    key={sm.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900 line-clamp-1">{sm.productName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Badge
                          size="sm"
                          variant={
                            sm.type === 'Sale'
                              ? 'neutral'
                              : sm.type === 'Purchase'
                              ? 'success'
                              : sm.type === 'Damage'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {sm.type}
                        </Badge>
                        <span>{sm.timestamp}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`font-bold text-sm ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? `+${sm.quantityChange}` : sm.quantityChange}
                      </span>
                      <p className="text-[10px] text-slate-500">Now: {sm.resultingQuantity} units</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
