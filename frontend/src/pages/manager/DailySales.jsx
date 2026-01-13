import { useState, useEffect } from 'react';
import { DatePicker, Table, Card, Statistic, Row, Col, message } from 'antd';
import { dailySalesService } from '../../services/dailySalesService';
import { formatCurrency } from '../../utils/formatters';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function DailySales() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [allSalesData, setAllSalesData] = useState([]);
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('month'),
    dayjs().endOf('day'),
  ]);

  useEffect(() => {
    fetchDailySales();
  }, []);

  const fetchDailySales = async () => {
    try {
      setLoading(true);
      const { items } = await dailySalesService.getMock();
      const sorted = (items || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
      setAllSalesData(sorted);

      const start = dateRange?.[0]?.startOf('day');
      const end = dateRange?.[1]?.endOf('day');
      const filtered = sorted.filter((row) => {
        const d = dayjs(row.date);
        if (start && d.isBefore(start)) return false;
        if (end && d.isAfter(end)) return false;
        return true;
      });

      setSalesData(filtered);
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
      const start = dates?.[0]?.startOf('day');
      const end = dates?.[1]?.endOf('day');
      const filtered = (allSalesData || []).filter((row) => {
        const d = dayjs(row.date);
        if (start && d.isBefore(start)) return false;
        if (end && d.isAfter(end)) return false;
        return true;
      });
      setSalesData(filtered);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('MMM D, YYYY'),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Total Sales',
      dataIndex: 'totalSales',
      key: 'totalSales',
      render: (value) => formatCurrency(value || 0),
      sorter: (a, b) => (a.totalSales || 0) - (b.totalSales || 0),
    },
    {
      title: 'Number of Invoices',
      dataIndex: 'numberOfInvoices',
      key: 'numberOfInvoices',
      sorter: (a, b) => (a.numberOfInvoices || 0) - (b.numberOfInvoices || 0),
    },
  ];

  const totalSales = salesData.reduce((sum, item) => sum + (item.totalSales || 0), 0);
  const totalInvoices = salesData.reduce((sum, item) => sum + (item.numberOfInvoices || 0), 0);

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
              precision={2}
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