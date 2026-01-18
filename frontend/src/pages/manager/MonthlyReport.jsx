import { useState, useEffect } from 'react';
import { reportsService } from '../../services/reportsService.js';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

export default function MonthlyReport() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchReportData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const fetchReportData = async (year, month) => {
    try {
      setLoading(true);
      const data = await reportsService.getMonthlyReport(year, month);
      const summary = data?.summary || null;
      const dailyBreakdown = (data?.dailyBreakdown || [])
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((r) => ({
          date: r.date,
          revenue: r.totalCashRevenue || 0,
          invoices: r.totalInvoices || 0,
        }));

      const products = summary?.products || {};

      setReportData({
        totalRevenue: summary?.totalMonthlyRevenue || 0,
        totalInvoices: summary?.totalMonthlyInvoices || 0,
        totalCosts: (summary?.totalDirectCosts || 0) + (summary?.totalExpenses || 0),
        products: Object.fromEntries(
          Object.entries(products).map(([key, val]) => [
            key,
            {
              invoices: val?.totalInvoices || 0,
              revenue: val?.totalRevenue || 0,
              cost: 0,
            },
          ])
        ),
        dailyBreakdown,
      });
    } catch (error) {
      toast.error('Failed to load monthly report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    if (date) {
      setSelectedYear(date.year());
      setSelectedMonth(date.month() + 1);
    }
  };

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Monthly Report</h1>
        <div className="flex items-center space-x-4">
          <DatePicker
            picker="month"
            value={dayjs(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`)}
            onChange={handleDateChange}
            format="MMM YYYY"
            className="w-40"
          />
        </div>
      </div>

      {reportData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-500">Total Invoices</h3>
              <p className="text-2xl font-bold">{reportData.totalInvoices}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-500">Total Costs</h3>
              <p className="text-2xl font-bold">{formatCurrency(reportData.totalCosts)}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-500">Net Profit</h3>
              <p className="text-2xl font-bold">
                {formatCurrency(reportData.totalRevenue - reportData.totalCosts)}
              </p>
            </div>
          </div>

          {/* Product Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Product Performance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoices
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(reportData.products || {}).map(([product, data]) => (
                    <tr key={product} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {data.invoices || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(data.revenue || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(data.cost || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency((data.revenue || 0) - (data.cost || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Daily Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoices
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.dailyBreakdown?.map((day) => (
                    <tr key={day.date} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(day.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(day.revenue || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {day.invoices || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No data available for the selected month</div>
      )}
    </div>
  );
}
