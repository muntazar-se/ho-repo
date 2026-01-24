import { useEffect, useMemo, useState } from 'react';
import { reportsService } from '../../services/reportsService.js';
import { dailySalesService } from '../../services/dailySalesService.js';
import StatCard from '../../components/common/StatCard.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import toast from 'react-hot-toast';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { formatCurrency } from '../../utils/formatters.js';

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [todaySales, setTodaySales] = useState(null);
  const [mtdSales, setMtdSales] = useState(null);
  const [ytdSales, setYtdSales] = useState(null);
  const [allTimeSales, setAllTimeSales] = useState(null);
  const [plByMonth, setPlByMonth] = useState([]);
  const [todayByProduct, setTodayByProduct] = useState(null);
  const [activeDay, setActiveDay] = useState('today');
  const [dayHasNoData, setDayHasNoData] = useState(false);
  const [dayLoading, setDayLoading] = useState(false);
  const [chartNonce, setChartNonce] = useState(0);

  const sumExpenseObject = (v) => {
    if (!v || typeof v !== 'object') return 0;
    return Object.values(v).reduce((sum, x) => sum + (Number(x) || 0), 0);
  };

  const byProductTotals = useMemo(() => {
    if (!todayByProduct) return [];
    return Object.entries(todayByProduct).map(([product, vals]) => {
      const revenue = Number(vals?.sales) || Number(vals?.cashRevenue) || 0;
      const expenses =
        typeof vals?.expenses === 'number'
          ? Number(vals.expenses) || 0
          : sumExpenseObject(vals?.expenses);
      const invoices = Number(vals?.invoices) || 0;
      return {
        product,
        revenue,
        expenses,
        invoices,
        cash: revenue - expenses,
      };
    });
  }, [todayByProduct]);

  const VISIBLE_PRODUCTS = ['chips', 'flavors', 'pellets', 'proteinChips', 'proteinBars'];

  const visibleByProductTotals = useMemo(() => {
    return byProductTotals.filter((r) => VISIBLE_PRODUCTS.includes(r.product));
  }, [byProductTotals]);

  useEffect(() => {
    setChartNonce((n) => n + 1);
  }, [visibleByProductTotals]);

  const totalsFromProducts = useMemo(() => {
    if (!visibleByProductTotals.length) return null;
    return visibleByProductTotals.reduce(
      (acc, r) => {
        acc.revenue += r.revenue;
        acc.expenses += r.expenses;
        acc.invoices += r.invoices;
        acc.cash += r.cash;
        return acc;
      },
      { revenue: 0, expenses: 0, invoices: 0, cash: 0 }
    );
  }, [visibleByProductTotals]);

  const pieColors = [
    '#2563eb',
    '#16a34a',
    '#f97316',
    '#a855f7',
    '#ef4444',
    '#14b8a6',
    '#eab308',
    '#64748b',
  ];

  const salesPieData = useMemo(() => {
    const rows = visibleByProductTotals.filter((r) => r.revenue > 0);
    return {
      labels: rows.map((r) => r.product.replace(/([A-Z])/g, ' $1')),
      datasets: [
        {
          data: rows.map((r) => r.revenue),
          backgroundColor: rows.map((_, i) => pieColors[i % pieColors.length]),
          borderWidth: 1,
        },
      ],
    };
  }, [visibleByProductTotals]);

  const expensesPieData = useMemo(() => {
    const rows = visibleByProductTotals.filter((r) => r.expenses > 0);
    return {
      labels: rows.map((r) => r.product.replace(/([A-Z])/g, ' $1')),
      datasets: [
        {
          data: rows.map((r) => r.expenses),
          backgroundColor: rows.map((_, i) => pieColors[i % pieColors.length]),
          borderWidth: 1,
        },
      ],
    };
  }, [visibleByProductTotals]);

  const cashPieData = useMemo(() => {
    const rows = visibleByProductTotals.filter((r) => r.cash > 0);
    return {
      labels: rows.map((r) => r.product.replace(/([A-Z])/g, ' $1')),
      datasets: [
        {
          data: rows.map((r) => r.cash),
          backgroundColor: rows.map((_, i) => pieColors[i % pieColors.length]),
          borderWidth: 1,
        },
      ],
    };
  }, [visibleByProductTotals]);

  useEffect(() => {
    fetchDashboardData();
    fetchSelectedDaySales();
  }, []);

  useEffect(() => {
    fetchSelectedDaySales();
  }, [activeDay]);

  const addDays = (d, days) => {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
  };

  const toDateKey = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    const yyyy = x.getFullYear();
    const mm = String(x.getMonth() + 1).padStart(2, '0');
    const dd = String(x.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchSelectedDaySales = async () => {
    try {
      setDayLoading(true);
      setDayHasNoData(false);

      const base = new Date();
      const selectedDate = activeDay === 'yesterday' ? addDays(base, -1) : base;
      const dateKey = toDateKey(selectedDate);

      const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);

      const yearStart = new Date(selectedDate.getFullYear(), 0, 1);
      yearStart.setHours(0, 0, 0, 0);

      const allTimeStart = new Date(1970, 0, 1);
      allTimeStart.setHours(0, 0, 0, 0);

      const endOfSelectedDay = new Date(selectedDate);
      endOfSelectedDay.setHours(23, 59, 59, 999);

      let dayRow = null;
      try {
        dayRow = await dailySalesService.getByDate(dateKey);
      } catch (e) {
        const status = e?.response?.status;
        if (status !== 404) throw e;
      }

      if (!dayRow) {
        setDayHasNoData(true);
        setTodaySales(null);
        setTodayByProduct(null);
      }

      if (dayRow) {
        setTodaySales({
          totalRevenue: dayRow?.totalCashRevenue || 0,
          totalInvoices: dayRow?.totalInvoices || 0,
          totalCosts: dayRow?.totalDirectCosts || 0,
          totalExpenses: dayRow?.totalExpenses || 0,
        });

        setTodayByProduct(dayRow?.products || null);
      }

      const { dailySales: mtdRows = [] } = await dailySalesService.getAll({
        startDate: monthStart.toISOString(),
        endDate: endOfSelectedDay.toISOString(),
        page: 1,
        limit: 5000,
      });

      setMtdSales({
        totalRevenue: (mtdRows || []).reduce((sum, r) => sum + (r?.totalCashRevenue || 0), 0),
        totalInvoices: (mtdRows || []).reduce((sum, r) => sum + (r?.totalInvoices || 0), 0),
        totalCosts: (mtdRows || []).reduce((sum, r) => sum + (r?.totalDirectCosts || 0), 0),
        totalExpenses: (mtdRows || []).reduce((sum, r) => sum + (r?.totalExpenses || 0), 0),
      });

      const { dailySales: ytdRows = [] } = await dailySalesService.getAll({
        startDate: yearStart.toISOString(),
        endDate: endOfSelectedDay.toISOString(),
        page: 1,
        limit: 10000,
      });

      const { dailySales: allTimeRows = [] } = await dailySalesService.getAll({
        startDate: allTimeStart.toISOString(),
        endDate: endOfSelectedDay.toISOString(),
        page: 1,
        limit: 20000,
      });

      const monthKey = (d) => {
        const x = new Date(d);
        if (Number.isNaN(x.getTime())) return null;
        const yyyy = x.getFullYear();
        const mm = String(x.getMonth() + 1).padStart(2, '0');
        return `${yyyy}-${mm}`;
      };

      const byMonthMap = (ytdRows || []).reduce((acc, r) => {
        const key = monthKey(r?.date);
        if (!key) return acc;
        const revenue = Number(r?.totalCashRevenue) || 0;
        const costs = Number(r?.totalDirectCosts) || 0;
        const expenses = Number(r?.totalExpenses) || 0;
        const profit = revenue - costs - expenses;
        acc[key] = (acc[key] || 0) + profit;
        return acc;
      }, {});

      setPlByMonth(
        Object.entries(byMonthMap)
          .map(([month, profit]) => ({ month, profit }))
          .sort((a, b) => a.month.localeCompare(b.month))
      );

      setYtdSales({
        totalRevenue: (ytdRows || []).reduce((sum, r) => sum + (r?.totalCashRevenue || 0), 0),
        totalInvoices: (ytdRows || []).reduce((sum, r) => sum + (r?.totalInvoices || 0), 0),
        totalCosts: (ytdRows || []).reduce((sum, r) => sum + (r?.totalDirectCosts || 0), 0),
        totalExpenses: (ytdRows || []).reduce((sum, r) => sum + (r?.totalExpenses || 0), 0),
      });

      setAllTimeSales({
        totalRevenue: (allTimeRows || []).reduce((sum, r) => sum + (r?.totalCashRevenue || 0), 0),
        totalInvoices: (allTimeRows || []).reduce((sum, r) => sum + (r?.totalInvoices || 0), 0),
        totalCosts: (allTimeRows || []).reduce((sum, r) => sum + (r?.totalDirectCosts || 0), 0),
        totalExpenses: (allTimeRows || []).reduce((sum, r) => sum + (r?.totalExpenses || 0), 0),
      });
    } catch (error) {
      console.error(error);
      setTodaySales(null);
      setMtdSales(null);
      setYtdSales(null);
      setAllTimeSales(null);
      setPlByMonth([]);
      setTodayByProduct(null);
      setDayHasNoData(false);
    } finally {
      setDayLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  const base = new Date();
  const todayKey = toDateKey(base);
  const yesterdayKey = toDateKey(addDays(base, -1));

  const currentDayRevenue =
    todaySales
      ? Number(todaySales.totalRevenue) || 0
      : activeDay === 'today' && !dayHasNoData
        ? Number(dashboardData.today?.totalRevenue) || 0
        : 0;

  const currentDayExpensesFromDashboard =
    todaySales
      ? Number(todaySales.totalExpenses) || 0
      : activeDay === 'today' && !dayHasNoData
        ? Number(dashboardData.today?.totalExpenses) || 0
        : 0;
  const currentDayExpensesFromProducts = todayByProduct
    ? Object.values(todayByProduct).reduce((sum, v) => sum + (Number(v?.expenses) || 0), 0)
    : 0;
  const currentDayExpenses = todayByProduct ? currentDayExpensesFromProducts : currentDayExpensesFromDashboard;

  const totalCurrentCash = Number(dashboardData?.cashPosition?.totalCompanyCash) || 0;

  const todayTotalSales = currentDayRevenue;

  const totalEstPLMonth =
    mtdSales
      ? (Number(mtdSales.totalRevenue) || 0) - (Number(mtdSales.totalCosts) || 0) - (Number(mtdSales.totalExpenses) || 0)
      : activeDay === 'today' && !dayHasNoData
        ? (Number(dashboardData.mtd?.totalRevenue) || 0) - (Number(dashboardData.mtd?.totalCosts) || 0) - (Number(dashboardData.mtd?.totalExpenses) || 0)
        : 0;

  const estPLByProduct = todayByProduct
    ? Object.entries(todayByProduct).map(([product, vals]) => ({
        product,
        profit: (Number(vals?.cashRevenue) || 0) - (Number(vals?.expenses) || 0),
      }))
    : [];

  const mtdTotalCurrentCash = mtdSales
    ? (Number(mtdSales.totalRevenue) || 0) - (Number(mtdSales.totalExpenses) || 0)
    : activeDay === 'today' && !dayHasNoData
      ? (Number(dashboardData.mtd?.totalRevenue) || 0) - (Number(dashboardData.mtd?.totalExpenses) || 0)
      : 0;
  const ytdTotalCurrentCash = ytdSales
    ? (Number(ytdSales.totalRevenue) || 0) - (Number(ytdSales.totalExpenses) || 0)
    : activeDay === 'today' && !dayHasNoData
      ? (Number(dashboardData.ytd?.totalRevenue) || 0) - (Number(dashboardData.ytd?.totalExpenses) || 0)
      : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <StatCard
            title="Total Current Cash"
            value={totalCurrentCash}
            icon={() => <span>🏦</span>}
            titleClassName="text-base font-medium text-gray-600"
            valueClassName="text-3xl font-bold text-gray-900 mt-2"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveDay('yesterday')}
          disabled={dayLoading}
          className={
            activeDay === 'yesterday'
              ? 'px-4 py-2 rounded-md bg-blue-600 text-white'
              : 'px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        >
          Yesterday ({yesterdayKey})
        </button>
        <button
          type="button"
          onClick={() => setActiveDay('today')}
          disabled={dayLoading}
          className={
            activeDay === 'today'
              ? 'px-4 py-2 rounded-md bg-blue-600 text-white'
              : 'px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        >
          Today ({todayKey})
        </button>
      </div>

      {/* Today's Sales */}
      {(todaySales || dashboardData.today || dayHasNoData) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {activeDay === 'yesterday' ? "Yesterday's Report" : "Today's Report"}
          </h2>

          {dayLoading ? (
            <div className="flex items-center justify-center min-h-48">
              <LoadingSpinner size="lg" />
            </div>
          ) : (

            <>
              {dayHasNoData ? (
                <div className="space-y-4">
                  <div className="text-center text-gray-500">
                    {activeDay === 'yesterday'
                      ? "Yesterday's data not provided yet"
                      : "Today's data not provided yet"}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatCard
                    title={activeDay === 'yesterday' ? "Yesterday's Total Sales" : "Today's Total Sales"}
                    value={totalsFromProducts ? totalsFromProducts.revenue : todayTotalSales}
                    icon={() => <span>💵</span>}
                    titleClassName="text-base font-medium text-gray-600"
                    valueClassName="text-3xl font-bold text-gray-900 mt-2"
                  />
                  <StatCard
                    title={activeDay === 'yesterday' ? "Yesterday's Total Expenses" : "Today's Total Expenses"}
                    value={totalsFromProducts ? totalsFromProducts.expenses : currentDayExpenses}
                    icon={() => <span>📊</span>}
                    titleClassName="text-base font-medium text-gray-600"
                    valueClassName="text-3xl font-bold text-gray-900 mt-2"
                  />
                  <StatCard
                    title={activeDay === 'yesterday' ? "Yesterday's Total Cash" : "Today's Total Cash"}
                    value={
                      totalsFromProducts
                        ? totalsFromProducts.cash
                        : (totalsFromProducts ? totalsFromProducts.revenue : todayTotalSales) -
                          (totalsFromProducts ? totalsFromProducts.expenses : currentDayExpenses)
                    }
                    icon={() => <span>💰</span>}
                    titleClassName="text-base font-medium text-gray-600"
                    valueClassName="text-3xl font-bold text-gray-900 mt-2"
                  />
                </div>
              )}

              {todayByProduct && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Report Details By Product</h3>
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg border p-4">
                      <h4 className="text-base font-semibold mb-3">Sales</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="space-y-2">
                          {visibleByProductTotals.map((row) => (
                            <div key={row.product} className="flex items-center justify-between">
                              <div className="text-l text-gray-700">
                                {row.product.replace(/([A-Z])/g, ' $1')}
                              </div>
                              <div className="text-l font-semibold">{formatCurrency(row.revenue)}</div>
                            </div>
                          ))}
                        </div>
                        <div className="h-64">
                          <Pie
                            key={`${activeDay}-${chartNonce}-sales`}
                            data={salesPieData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              animation: {
                                animateRotate: true,
                                animateScale: true,
                                duration: 900,
                                easing: 'easeOutQuart',
                              },
                              plugins: {
                                legend: { position: 'bottom' },
                                tooltip: {
                                  enabled: true,
                                  callbacks: {
                                    label: (ctx) => {
                                      const label = ctx.label || '';
                                      const v = Number(ctx.parsed) || 0;
                                      return `${label}: ${formatCurrency(v)}`;
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border p-4">
                      <h4 className="text-base font-semibold mb-3">Expenses</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="space-y-2">
                          {visibleByProductTotals.map((row) => (
                            <div key={row.product} className="flex items-center justify-between">
                              <div className="text-l text-gray-700">
                                {row.product.replace(/([A-Z])/g, ' $1')}
                              </div>
                              <div className="text-l font-semibold">{formatCurrency(row.expenses)}</div>
                            </div>
                          ))}
                        </div>
                        <div className="h-64">
                          <Pie
                            key={`${activeDay}-${chartNonce}-expenses`}
                            data={expensesPieData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              animation: {
                                animateRotate: true,
                                animateScale: true,
                                duration: 900,
                                easing: 'easeOutQuart',
                              },
                              plugins: {
                                legend: { position: 'bottom' },
                                tooltip: {
                                  enabled: true,
                                  callbacks: {
                                    label: (ctx) => {
                                      const label = ctx.label || '';
                                      const v = Number(ctx.parsed) || 0;
                                      return `${label}: ${formatCurrency(v)}`;
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border p-4">
                      <h4 className="text-base font-semibold mb-3">Cash</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="space-y-2">
                          {visibleByProductTotals.map((row) => (
                            <div key={row.product} className="flex items-center justify-between">
                              <div className="text-l text-gray-700">
                                {row.product.replace(/([A-Z])/g, ' $1')}
                              </div>
                              <div className="text-l font-semibold">{formatCurrency(row.cash)}</div>
                            </div>
                          ))}
                        </div>
                        <div className="h-64">
                          <Pie
                            key={`${activeDay}-${chartNonce}-cash`}
                            data={cashPieData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              animation: {
                                animateRotate: true,
                                animateScale: true,
                                duration: 900,
                                easing: 'easeOutQuart',
                              },
                              plugins: {
                                legend: { position: 'bottom' },
                                tooltip: {
                                  enabled: true,
                                  callbacks: {
                                    label: (ctx) => {
                                      const label = ctx.label || '';
                                      const v = Number(ctx.parsed) || 0;
                                      return `${label}: ${formatCurrency(v)}`;
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {false && (
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title="Total Current Cash"
                  value={totalCurrentCash}
                  icon={() => <span>💰</span>}
                />
              </div>
            </div>
          )}

          {/* To show the "Cash & Profit" section (Today's Total Sales / Total Est P/L/Month / Est P/L/Product / P/L by Month), change `false` to `true` below */}
          {false && (
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-lg font-semibold mb-3">Cash & Profit</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Today's Total Sales"
                  value={todayTotalSales}
                />

                <StatCard
                  title="Total Est P/L/Month"
                  value={totalEstPLMonth}
                />

                <div className="hidden md:block" />

                <div className="md:col-start-4">
                  <StatCard
                    title="Total Current Cash"
                    value={totalCurrentCash}
                    icon={() => <span>💰</span>}
                  />
                </div>
              </div>

              {estPLByProduct.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold mb-3">Est P/L/Product</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {estPLByProduct.map(({ product, profit }) => (
                      <StatCard
                        key={product}
                        title={product.replace(/([A-Z])/g, ' $1')}
                        value={profit}
                        format={(v) => (typeof v === 'number' ? v.toFixed(2) : v)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {plByMonth.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold mb-3">P/L by Month</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plByMonth.map((row) => (
                      <StatCard
                        key={row.month}
                        title={row.month}
                        value={row.profit}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MTD & YTD */}
      {/* To show the MTD/YTD sections, change `false` to `true` below */}
      {false && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Month-to-Date (MTD)</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Total Current Cash" value={mtdTotalCurrentCash} />
              {false && (
                <StatCard
                  title="Invoices"
                  value={
                    mtdSales
                      ? mtdSales.totalInvoices
                      : activeDay === 'today' && !dayHasNoData
                        ? dashboardData.mtd.totalInvoices
                        : 0
                  }
                />
              )}
              <StatCard
                title="Costs"
                value={
                  mtdSales
                    ? mtdSales.totalCosts
                    : activeDay === 'today' && !dayHasNoData
                      ? dashboardData.mtd.totalCosts
                      : 0
                }
              />
              {false && (
                <StatCard
                  title="Expenses"
                  value={
                    mtdSales
                      ? mtdSales.totalExpenses
                      : activeDay === 'today' && !dayHasNoData
                        ? dashboardData.mtd.totalExpenses
                        : 0
                  }
                />
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Year-to-Date (YTD)</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Total Current Cash" value={ytdTotalCurrentCash} />
              {false && (
                <StatCard
                  title="Invoices"
                  value={
                    ytdSales
                      ? ytdSales.totalInvoices
                      : activeDay === 'today' && !dayHasNoData
                        ? dashboardData.ytd.totalInvoices
                        : 0
                  }
                />
              )}
              {/* <StatCard title="Costs" value={dashboardData.ytd.totalCosts} /> */}
              {false && (
                <StatCard
                  title="Expenses"
                  value={
                    ytdSales
                      ? ytdSales.totalExpenses
                      : activeDay === 'today' && !dayHasNoData
                        ? dashboardData.ytd.totalExpenses
                        : 0
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

