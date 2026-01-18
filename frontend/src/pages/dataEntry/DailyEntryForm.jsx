import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dailySalesService } from '../../services/dailySalesService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters.js';

/* ===== Reusable Inputs ===== */

const MoneyInput = ({ value, onChange }) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  return (
    <div className="relative">
      <input
        type="number"
        step="0.01"
        min="0"
        placeholder="0"
        value={display}
        onChange={(e) => {
          setDisplay(e.target.value);
          onChange(e);
        }}
        onBlur={() => {
          if (display !== '') {
            setDisplay(Number(display).toFixed(2));
          }
        }}
        className="input pr-8"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
        $
      </span>
    </div>
  );
};

const NumberInput = ({ value, onChange }) => (
  <input
    type="number"
    step="0.01"
    min="0"
    placeholder="0"
    value={value}
    onChange={onChange}
    className="input"
  />
);

/* ===== Component ===== */

export default function DailyEntryForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [loading, setLoading] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);

  const [formData, setFormData] = useState({
    date: today,
    products: {
      chips: { invoices: '', cashRevenue: '', expenses: '' },
      flavors: { invoices: '', cashRevenue: '', expenses: '' },
      pellets: { invoices: '', cashRevenue: '', expenses: '' },
      proteinChips: { invoices: '', cashRevenue: '', expenses: '' },
      proteinBars: { invoices: '', cashRevenue: '', expenses: '' },
    },
  });

  const [calculations, setCalculations] = useState({
    totalInvoices: 0,
    totalCashRevenue: 0,
    netCash: 0,
  });

  useEffect(() => {
    const values = Object.values(formData.products);

    const sum = (key) =>
      values.reduce((a, b) => a + (Number(b[key]) || 0), 0);

    const totalInvoices = sum('invoices');
    const totalCashRevenue = sum('cashRevenue');
    const totalExpenses = sum('expenses');

    setCalculations({
      totalInvoices,
      totalCashRevenue,
      netCash: totalCashRevenue - totalExpenses,
    });
  }, [formData]);

  const handleProductChange = (product, field, value) => {
    setFormData((prev) => ({
      ...prev,
      products: {
        ...prev.products,
        [product]: {
          ...prev.products[product],
          [field]: value === '' ? '' : parseFloat(value) || 0,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dailySalesService.create({
        ...formData,
        products: Object.fromEntries(
          Object.entries(formData.products).map(([k, v]) => [
            k,
            {
              invoices: Number(v.invoices) || 0,
              cashRevenue: Number(v.cashRevenue) || 0,
              expenses: Number(v.expenses) || 0,
            },
          ])
        ),
      });

      toast.success('Daily sales entry created successfully!');
      navigate('/data-entry/history');
    } catch {
      toast.error('Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Daily Sales Entry</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            className="input"
            disabled={user?.role === 'dataEntry'}
          />
        </div>

        <div className="card">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Product Sales</h2>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowInvoices((v) => !v)}
            >
              {showInvoices ? 'Hide Invoices' : 'Show Invoices'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(formData.products).map((product) => (
              <div key={product} className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 capitalize">
                  {product.replace(/([A-Z])/g, ' $1')}
                </h3>

                <div className="space-y-3">
                  {showInvoices && (
                    <div>
                      <label className="text-sm">Invoices</label>
                      <NumberInput
                        value={formData.products[product].invoices}
                        onChange={(e) =>
                          handleProductChange(product, 'invoices', e.target.value)
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm">Cash Revenue</label>
                    <MoneyInput
                      value={formData.products[product].cashRevenue}
                      onChange={(e) =>
                        handleProductChange(product, 'cashRevenue', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm">Expenses</label>
                    <MoneyInput
                      value={formData.products[product].expenses}
                      onChange={(e) =>
                        handleProductChange(product, 'expenses', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm">Invoices</p>
              <p className="font-semibold">
                {formatCurrency(calculations.totalInvoices)}
              </p>
            </div>
            <div>
              <p className="text-sm">Cash Revenue</p>
              <p className="font-semibold">
                {formatCurrency(calculations.totalCashRevenue)}
              </p>
            </div>
            <div>
              <p className="text-sm">Net Cash</p>
              <p className="font-semibold">
                {formatCurrency(calculations.netCash)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="btn btn-primary" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Submit Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
