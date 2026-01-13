import { useState, useEffect } from 'react';
import { reportsService } from '../../services/reportsService';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { DatePicker, Select, Table, Card, Row, Col } from 'antd';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function ProductPerformance() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('month'),
    dayjs().endOf('day'),
  ]);
  const [timeframe, setTimeframe] = useState('month');

  useEffect(() => {
    fetchReportData();
  }, [timeframe]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange[0]?.toISOString(),
        endDate: dateRange[1]?.toISOString(),
        timeframe,
      };
      const data = await reportsService.getProductPerformance(params);
      setReportData(data);
    } catch (error) {
      toast.error('Failed to load product performance data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates[0] && dates[1]) {
      fetchReportData();
    }
  };

  const handleTimeframeChange = (value) => {
    setTimeframe(value);
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      sorter: (a, b) => a.product.localeCompare(b.product),
    },
    {
      title: 'Invoices',
      dataIndex: 'invoices',
      key: 'invoices',
      sorter: (a, b) => a.invoices - b.invoices,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => a.cost - b.cost,
    },
    {
      title: 'Profit',
      key: 'profit',
      render: (_, record) => formatCurrency(record.revenue - record.cost),
      sorter: (a, b) => a.revenue - a.cost - (b.revenue - b.cost),
    },
    {
      title: 'Profit Margin',
      key: 'margin',
      render: (_, record) =>
        record.revenue > 0
          ? `${(((record.revenue - record.cost) / record.revenue) * 100).toFixed(1)}%`
          : 'N/A',
      sorter: (a, b) =>
        (a.revenue > 0 ? (a.revenue - a.cost) / a.revenue : 0) -
        (b.revenue > 0 ? (b.revenue - b.cost) / b.revenue : 0),
    },
  ];

  const prepareChartData = () => {
    if (!reportData?.products) return { labels: [], datasets: [] };

    const products = Object.keys(reportData.products);
    const revenues = products.map((product) => reportData.products[product].revenue || 0);
    const costs = products.map((product) => reportData.products[product].cost || 0);

    return {
      labels: products,
      datasets: [
        {
          label: 'Revenue',
          data: revenues,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Cost',
          data: costs,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartData = prepareChartData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Performance</h1>
        <div className="flex items-center space-x-4">
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-64"
          />
          <Select
            value={timeframe}
            onChange={handleTimeframeChange}
            className="w-40"
          >
            <Option value="day">Daily</Option>
            <Option value="week">Weekly</Option>
            <Option value="month">Monthly</Option>
          </Select>
        </div>
      </div>

      {loading && !reportData ? (
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <h3 className="text-gray-500">Total Revenue</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData.totalRevenue || 0)}
                </p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <h3 className="text-gray-500">Total Cost</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData.totalCost || 0)}
                </p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <h3 className="text-gray-500">Total Profit</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    (reportData.totalRevenue || 0) - (reportData.totalCost || 0)
                  )}
                </p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <h3 className="text-gray-500">Profit Margin</h3>
                <p className="text-2xl font-bold">
                  {reportData.totalRevenue > 0
                    ? `${(
                        ((reportData.totalRevenue - (reportData.totalCost || 0)) /
                          reportData.totalRevenue) *
                        100
                      ).toFixed(1)}%`
                    : 'N/A'}
                </p>
              </Card>
            </Col>
          </Row>

          {/* Chart */}
          <Card title="Revenue vs Cost by Product">
            <div style={{ height: '400px' }}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) =>
                          new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0,
                          }).format(value),
                      },
                    },
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) =>
                          `${context.dataset.label}: ${new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(context.raw)}`,
                      },
                    },
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Revenue and Cost by Product',
                    },
                  },
                }}
              />
            </div>
          </Card>

          {/* Product Table */}
          <Card title="Product Performance Details">
            <Table
              columns={columns}
              dataSource={Object.entries(reportData.products || {}).map(([product, data]) => ({
                key: product,
                product,
                ...data,
              }))}
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </Card>
        </div>
      ) : (
        <div className="text-center text-gray-500">No data available for the selected period</div>
      )}
    </div>
  );
}
