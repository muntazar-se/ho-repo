import { useState, useEffect } from 'react';
import { reportsService } from '../../services/reportsService';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { DatePicker, Card, Table, Tag, Alert } from 'antd';
import { WarningOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

export default function RiskAnalysis() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange[0]?.toISOString(),
        endDate: dateRange[1]?.toISOString(),
      };
      const data = await reportsService.getRiskAnalysis(params);
      setReportData(data);
    } catch (error) {
      toast.error('Failed to load risk analysis data');
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

  const getRiskLevel = (value, thresholds) => {
    if (value >= thresholds.high) return 'high';
    if (value >= thresholds.medium) return 'medium';
    return 'low';
  };

  const riskLevels = {
    high: { color: 'red', label: 'High Risk' },
    medium: { color: 'orange', label: 'Medium Risk' },
    low: { color: 'green', label: 'Low Risk' },
  };

  const columns = [
    {
      title: 'Risk Factor',
      dataIndex: 'factor',
      key: 'factor',
      render: (text, record) => (
        <div className="flex items-center">
          {record.icon}
          <span className="ml-2">{text}</span>
        </div>
      ),
    },
    {
      title: 'Current Value',
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => {
        if (record.format === 'currency') {
          return formatCurrency(value);
        } else if (record.format === 'percent') {
          return `${(value * 100).toFixed(1)}%`;
        }
        return value;
      },
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (level) => (
        <Tag color={riskLevels[level].color}>
          {riskLevels[level].label}
        </Tag>
      ),
    },
    {
      title: 'Trend',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend) => {
        if (trend > 0) {
          return (
            <div className="flex items-center text-red-500">
              <ArrowUpOutlined />
              <span className="ml-1">{Math.abs(trend)}%</span>
            </div>
          );
        } else if (trend < 0) {
          return (
            <div className="flex items-center text-green-500">
              <ArrowDownOutlined />
              <span className="ml-1">{Math.abs(trend)}%</span>
            </div>
          );
        }
        return <span>Stable</span>;
      },
    },
  ];

  const riskFactors = [
    {
      key: 'expenseRatio',
      factor: 'Expense to Revenue Ratio',
      icon: <WarningOutlined className="text-yellow-500" />,
      value: reportData?.expenseRatio || 0,
      format: 'percent',
      riskLevel: reportData ? getRiskLevel(reportData.expenseRatio, { high: 0.7, medium: 0.5 }) : 'low',
      trend: reportData?.expenseRatioTrend || 0,
    },
    {
      key: 'cashFlow',
      factor: 'Cash Flow',
      icon: <WarningOutlined className="text-blue-500" />,
      value: reportData?.cashFlow || 0,
      format: 'currency',
      riskLevel: reportData ? getRiskLevel(-reportData.cashFlow, { high: 1000, medium: 500 }) : 'low',
      trend: reportData?.cashFlowTrend || 0,
    },
    {
      key: 'debtToEquity',
      factor: 'Debt to Equity Ratio',
      icon: <WarningOutlined className="text-purple-500" />,
      value: reportData?.debtToEquity || 0,
      format: 'percent',
      riskLevel: reportData ? getRiskLevel(reportData.debtToEquity, { high: 2, medium: 1 }) : 'low',
      trend: reportData?.debtToEquityTrend || 0,
    },
    {
      key: 'inventoryTurnover',
      factor: 'Inventory Turnover',
      icon: <WarningOutlined className="text-green-500" />,
      value: reportData?.inventoryTurnover || 0,
      riskLevel: reportData ? getRiskLevel(-reportData.inventoryTurnover, { high: 30, medium: 60 }) : 'low',
      trend: reportData?.inventoryTurnoverTrend || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Risk Analysis</h1>
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          className="w-64"
        />
      </div>

      {loading && !reportData ? (
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Risk Summary */}
          <Card title="Risk Overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-gray-500">Overall Risk Level</h3>
                <div className="mt-2">
                  <Tag 
                    color={
                      riskFactors.some(f => f.riskLevel === 'high') 
                        ? 'red' 
                        : riskFactors.some(f => f.riskLevel === 'medium')
                          ? 'orange'
                          : 'green'
                    }
                    className="text-lg px-4 py-1"
                  >
                    {
                      riskFactors.some(f => f.riskLevel === 'high') 
                        ? 'High Risk' 
                        : riskFactors.some(f => f.riskLevel === 'medium')
                          ? 'Medium Risk'
                          : 'Low Risk'
                    }
                  </Tag>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Based on {riskFactors.length} risk factors
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="text-gray-500">High Risk Areas</h3>
                <div className="mt-2">
                  {riskFactors.filter(f => f.riskLevel === 'high').length > 0 ? (
                    riskFactors
                      .filter(f => f.riskLevel === 'high')
                      .map(factor => (
                        <div key={factor.key} className="flex items-center mt-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                          <span>{factor.factor}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-green-500">No high risk areas detected</p>
                  )}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="text-gray-500">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-sm text-gray-500">Cash Balance</p>
                    <p className="font-semibold">
                      {formatCurrency(reportData.cashBalance || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Outstanding Invoices</p>
                    <p className="font-semibold">
                      {formatCurrency(reportData.outstandingInvoices || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Inventory Value</p>
                    <p className="font-semibold">
                      {formatCurrency(reportData.inventoryValue || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Debt</p>
                    <p className="font-semibold">
                      {formatCurrency(reportData.totalDebt || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Risk Factors */}
          <Card title="Risk Factors">
            <Table
              columns={columns}
              dataSource={riskFactors}
              pagination={false}
              loading={loading}
              rowKey="key"
            />
          </Card>

          {/* Recommendations */}
          <Card title="Recommendations">
            {riskFactors.some(f => f.riskLevel === 'high') ? (
              <div className="space-y-4">
                {riskFactors
                  .filter(f => f.riskLevel === 'high')
                  .map(factor => (
                    <Alert
                      key={factor.key}
                      message={
                        <>
                          <span className="font-semibold">{factor.factor}:</span>{" "}
                          {getRecommendation(factor.key, factor.value, factor.trend)}
                        </>
                      }
                      type="warning"
                      showIcon
                      className="mb-2"
                    />
                  ))}
              </div>
            ) : (
              <Alert
                message="No critical issues detected. Your business appears to be in good financial health."
                type="success"
                showIcon
              />
            )}
          </Card>
        </div>
      ) : (
        <div className="text-center text-gray-500">No data available for the selected period</div>
      )}
    </div>
  );
}

function getRecommendation(factor, value, trend) {
  const recommendations = {
    expenseRatio: `Your expenses are ${(value * 100).toFixed(1)}% of your revenue, which is high. Consider reducing operational costs.`,
    cashFlow: `Your cash flow is negative. Improve collections and manage payables more effectively.`,
    debtToEquity: `Your debt to equity ratio is ${value.toFixed(2)}, indicating high financial leverage. Consider reducing debt.`,
    inventoryTurnover: `Your inventory is turning over every ${Math.round(value)} days. Consider optimizing inventory levels.`,
  };

  return recommendations[factor] || 'No specific recommendation available.';
}
