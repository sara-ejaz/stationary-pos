import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banknote,
  Receipt,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ShoppingCart,
  PlusCircle,
  Truck,
  TrendingUp,
  Boxes,
  Clock,
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

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, transactions, purchases, stockMovements, categories } = useStore();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');

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

  // Chart Data: 7-day sales trend
  const salesChartData = [
    { date: 'Mon', sales: 4200, count: 5 },
    { date: 'Tue', sales: 6800, count: 7 },
    { date: 'Wed', sales: 5100, count: 6 },
    { date: 'Thu', sales: 9400, count: 11 },
    { date: 'Fri', sales: 12500, count: 14 },
    { date: 'Sat', sales: 18200, count: 20 },
    { date: 'Sun (Today)', sales: totalSalesPKR > 0 ? totalSalesPKR : 8500, count: totalTransactionsCount || 8 }
  ];

  // Category Distribution for Pie Chart
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  const PIE_COLORS = ['#007f87', '#005f6a', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#f43f5e'];

  // Top Selling Items (computed from transactions)
  const topSelling = useMemo(() => {
    const itemMap: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
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

    const list = Object.values(itemMap).sort((a, b) => b.qty - a.qty);
    // If few sales, populate top products
    if (list.length === 0) {
      return products.slice(0, 4).map((p) => ({
        name: p.name,
        category: p.category,
        qty: 12,
        revenue: p.sellingPrice * 12
      }));
    }
    return list.slice(0, 5);
  }, [transactions, products]);

  // Recent Stock Movements (last 5)
  const recentMovements = stockMovements.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a2224] p-5 rounded-2xl border border-[#143d41]">
        <div>
          <h2 className="text-xl font-bold text-[#f2fbfa] tracking-tight">
            Store Operations Overview
          </h2>
          <p className="text-xs text-[#8da5a7] mt-0.5">
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
          trend={{ value: '14.2% vs yesterday', isPositive: true }}
          highlightColor="teal"
          onClick={() => navigate('/transactions')}
        />

        <StatCard
          title="Units Sold Today"
          value={totalUnitsSold}
          subtitle="Books & stationery items"
          icon={<Receipt className="w-5 h-5" />}
          trend={{ value: '8.4%', isPositive: true }}
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
        <div className="lg:col-span-2 bg-[#0a2224] border border-[#143d41] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-[#143d41]/60">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#007f87]" />
              <h3 className="text-sm font-semibold text-[#f2fbfa]">Weekly Sales Performance (PKR)</h3>
            </div>
            <div className="flex items-center gap-1 bg-[#07181a] p-1 rounded-lg border border-[#143d41]">
              {(['today', 'week', 'month'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium capitalize transition ${
                    timeFilter === filter
                      ? 'bg-[#007f87] text-white'
                      : 'text-[#8da5a7] hover:text-[#f2fbfa]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007f87" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#007f87" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#143d41" opacity={0.4} />
                <XAxis dataKey="date" stroke="#8da5a7" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#8da5a7"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `Rs ${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a2224',
                    borderColor: '#143d41',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f2fbfa'
                  }}
                  formatter={(val: any) => [`PKR ${Number(val).toLocaleString()}`, 'Sales']}
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
          </div>
        </div>

        {/* Category Share Recharts Pie */}
        <div className="bg-[#0a2224] border border-[#143d41] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-[#143d41]/60">
            <Boxes className="w-4 h-4 text-[#10b981]" />
            <h3 className="text-sm font-semibold text-[#f2fbfa]">Category Distribution</h3>
          </div>

          <div className="h-48 my-auto relative">
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
                    backgroundColor: '#0a2224',
                    borderColor: '#143d41',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f2fbfa'
                  }}
                  formatter={(val: any) => [`${val} items`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#143d41]/60 text-xs">
            {categoryData.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-[#8da5a7]">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="truncate">{c.name}</span>
                </div>
                <span className="font-semibold text-[#f2fbfa]">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Best-Selling & Recent Stock Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-[#0a2224] border border-[#143d41] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#143d41]/60">
            <h3 className="text-sm font-semibold text-[#f2fbfa]">Best-Selling Inventory</h3>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs text-[#007f87] hover:underline flex items-center gap-1"
            >
              All Sales <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topSelling.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-[#07181a] border border-[#143d41]/60 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#00272b] border border-[#143d41] flex items-center justify-center font-bold text-[10px] text-[#007f87]">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[#f2fbfa] line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-[#59787a]">{item.category}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-[#d4f1f4]">PKR {item.revenue.toLocaleString()}</p>
                  <p className="text-[10px] text-[#8da5a7]">{item.qty} units sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="bg-[#0a2224] border border-[#143d41] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#143d41]/60">
            <h3 className="text-sm font-semibold text-[#f2fbfa]">Live Stock Movement Ledger</h3>
            <button
              onClick={() => navigate('/inventory/history')}
              className="text-xs text-[#007f87] hover:underline flex items-center gap-1"
            >
              Full Ledger <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentMovements.map((sm) => {
              const isPositive = sm.quantityChange > 0;
              return (
                <div
                  key={sm.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#07181a] border border-[#143d41]/60 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[#f2fbfa] line-clamp-1">{sm.productName}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#59787a]">
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
                        isPositive ? 'text-[#10b981]' : 'text-[#f43f5e]'
                      }`}
                    >
                      {isPositive ? `+${sm.quantityChange}` : sm.quantityChange}
                    </span>
                    <p className="text-[10px] text-[#8da5a7]">Now: {sm.resultingQuantity} units</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
