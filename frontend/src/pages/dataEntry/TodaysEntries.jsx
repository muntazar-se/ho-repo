import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dailySalesService } from '../../services/dailySalesService.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateShort } from '../../utils/formatters.js';

export default function TodaysEntries() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();

  const totalInvoices = entries.reduce((sum, e) => sum + (e.totalInvoices || 0), 0);
  const totalSales = entries.reduce((sum, e) => sum + (e.totalCashRevenue || 0), 0);
  const totalCash = entries.reduce(
    (sum, e) =>
      sum +
      (e.totalCashRevenue || 0) -
      (e.totalDirectCosts || 0) -
      (e.totalExpenses || 0),
    0
  );

  useEffect(() => {
    fetchTodaysEntries();
  }, []);

  const fetchTodaysEntries = async () => {
    try {
      setLoading(true);
      const data = await dailySalesService.getAll({ limit: 100 });
      setEntries(data.dailySales || []);
    } catch (error) {
      toast.error('Failed to load entries');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    // Navigate to edit form or show modal
    toast.info('Edit functionality coming soon');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await dailySalesService.delete(id);
      toast.success('Entry deleted successfully');
      fetchTodaysEntries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete entry');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Today's Entries</h1>
        <button
          onClick={() => navigate('/data-entry/new')}
          className="btn btn-primary"
        >
          New Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-500">Invoices</h3>
          <p className="text-2xl font-bold">{formatCurrency(totalInvoices)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-500">Today's Total Sales</h3>
          <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-500">Today's Total Cash</h3>
          <p className="text-2xl font-bold">{formatCurrency(totalCash)}</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No entries found for today</p>
          <button
            onClick={() => navigate('/data-entry/new')}
            className="btn btn-primary mt-4"
          >
            Create New Entry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Invoices
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Costs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateShort(entry.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(entry.totalCashRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(entry.totalInvoices)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(entry.totalDirectCosts)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(entry._id)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

