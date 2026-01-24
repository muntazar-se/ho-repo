import { useState, useEffect } from 'react';
import { DatePicker, Table, Card, Statistic, Row, Col, message } from 'antd';
import { dailySalesService } from '../../services/dailySalesService';
import { formatCurrency } from '../../utils/formatters';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext.jsx';

const { RangePicker } = DatePicker;

export default function DailySales() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('month'),
    dayjs().endOf('day'),
  ]);

  useEffect(() => {
    fetchDailySales();
  }, []);

  useEffect(() => {
    fetchDailySales();
  }, [dateRange]);

  const fetchDailySales = async () => {
    try {
      setLoading(true);
      const start = dateRange?.[0]?.startOf('day');
      const end = dateRange?.[1]?.endOf('day');

      const getAllFn = user?.role === 'dataEntry' ? dailySalesService.getAllHistory : dailySalesService.getAll;
      const { dailySales } = await getAllFn({
        startDate: start?.toISOString(),
        endDate: end?.toISOString(),
        page: 1,
        limit: 5000,
      });

      const rows = (dailySales || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
      setSalesData(rows);
    } catch (error) {
      console.error('Error fetching daily sales:', error);
      message.error('Failed to load daily sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange(dates);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('MMM D, YYYY'),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Total Sales',
      dataIndex: 'totalCashRevenue',
      key: 'totalCashRevenue',
      render: (value) => formatCurrency(value || 0),
      sorter: (a, b) => (a.totalCashRevenue || 0) - (b.totalCashRevenue || 0),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Total Invoices',
      dataIndex: 'totalInvoices',
      key: 'totalInvoices',
      render: (value) => formatCurrency(value || 0),
      sorter: (a, b) => (a.totalInvoices || 0) - (b.totalInvoices || 0),
      sortDirections: ['descend', 'ascend'],
    },
  ];

  const totalSales = salesData.reduce((sum, item) => sum + (item.totalCashRevenue || 0), 0);
  const totalInvoices = salesData.reduce((sum, item) => sum + (item.totalInvoices || 0), 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Sales Report</h1>
        <RangePicker
          value={dateRange}
          onChange={handleDateChange}
          className="w-64"
        />
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Sales"
              value={totalSales}
              valueStyle={{ color: '#3f8600' }}
              prefix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Invoices"
              value={totalInvoices}
              valueRender={() => formatCurrency(totalInvoices)}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={salesData}
          rowKey="date"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}