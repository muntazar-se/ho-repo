import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dailySalesService } from '../../services/dailySalesService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters.js';

export default function DailyEntryForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [loading, setLoading] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [formData, setFormData] = useState({
    date: today,
    products: {
      chips: { invoices: 0, cashRevenue: 0, expenses: 0 },
      flavors: { invoices: 0, cashRevenue: 0, expenses: 0 },
      pellets: { invoices: 0, cashRevenue: 0, expenses: 0 },
      proteinChips: { invoices: 0, cashRevenue: 0, expenses: 0 },
      proteinBars: { invoices: 0, cashRevenue: 0, expenses: 0 },
    },
    directCosts: {
      directLabor: 0,
      indirectLabor: 0,
      heatAndPower: 0,
      factoryCommissions: 0,
      miscFactoryCosts: 0,
      contractLabor: 0,
      freight: 0,
      rawMaterials: 0,
    },
    paymentsReceived: {
      chips: 0,
      flavors: 0,
      pellets: 0,
    },
    expenses: {
      marketing: 0,
      vehicles: 0,
      advancePurchases: 0,
      charitable: 0,
      machinesSpares: 0,
    },
  });

  const [calculations, setCalculations] = useState({
    totalInvoices: 0,
    totalCashRevenue: 0,
    totalDirectCosts: 0,
    totalExpenses: 0,
    netCash: 0,
  });

  useEffect(() => {
    // Calculate totals
    const totalInvoices =
      (Number(formData.products.chips.invoices) || 0) +
      (Number(formData.products.flavors.invoices) || 0) +
      (Number(formData.products.pellets.invoices) || 0) +
      (Number(formData.products.proteinChips.invoices) || 0) +
      (Number(formData.products.proteinBars.invoices) || 0);

    const totalCashRevenue =
      (Number(formData.products.chips.cashRevenue) || 0) +
      (Number(formData.products.flavors.cashRevenue) || 0) +
      (Number(formData.products.pellets.cashRevenue) || 0) +
      (Number(formData.products.proteinChips.cashRevenue) || 0) +
      (Number(formData.products.proteinBars.cashRevenue) || 0);

    const totalDirectCosts =
      (Number(formData.directCosts.directLabor) || 0) +
      (Number(formData.directCosts.indirectLabor) || 0) +
      (Number(formData.directCosts.heatAndPower) || 0) +
      (Number(formData.directCosts.factoryCommissions) || 0) +
      (Number(formData.directCosts.miscFactoryCosts) || 0) +
      (Number(formData.directCosts.contractLabor) || 0) +
      (Number(formData.directCosts.freight) || 0) +
      (Number(formData.directCosts.rawMaterials) || 0);

    const totalExpenses =
      (Number(formData.expenses.marketing) || 0) +
      (Number(formData.expenses.vehicles) || 0) +
      (Number(formData.expenses.advancePurchases) || 0) +
      (Number(formData.expenses.charitable) || 0) +
      (Number(formData.expenses.machinesSpares) || 0);

    setCalculations({
      totalInvoices,
      totalCashRevenue,
      totalDirectCosts,
      totalExpenses,
      netCash: totalCashRevenue - totalDirectCosts - totalExpenses,
    });
  }, [formData]);

  const getMissingFields = () => {
    const missing = [];
    const pretty = (s) => s.replace(/([A-Z])/g, ' $1');

    Object.entries(formData.products).forEach(([product, vals]) => {
      const invoicesNum = Number(vals.invoices);
      const cashRevenueNum = Number(vals.cashRevenue);

      if (showInvoices && (vals.invoices === '' || invoicesNum <= 0)) {
        missing.push(`${pretty(product)} - Invoices`);
      }
      if (vals.cashRevenue === '' || cashRevenueNum <= 0) {
        missing.push(`${pretty(product)} - Cash Revenue`);
      }
    });

    Object.entries(formData.directCosts).forEach(([k, v]) => {
      if (v === '') missing.push(`Direct Costs - ${pretty(k)}`);
    });

    Object.entries(formData.paymentsReceived).forEach(([k, v]) => {
      if (v === '') missing.push(`Payments Received - ${pretty(k)}`);
    });

    Object.entries(formData.expenses).forEach(([k, v]) => {
      if (v === '') missing.push(`Expenses - ${pretty(k)}`);
    });

    return missing;
  };

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value === '' ? '' : parseFloat(value) || 0,
      },
    }));
  };

  const handleProductChange = (product, type, value) => {
    setFormData((prev) => ({
      ...prev,
      products: {
        ...prev.products,
        [product]: {
          ...prev.products[product],
          [type]: value === '' ? '' : parseFloat(value) || 0,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missing = getMissingFields();
    if (missing.length > 0) {
      const message = `Some fields are not filled:\n\n${missing
        .slice(0, 20)
        .map((m) => `- ${m}`)
        .join('\n')}${missing.length > 20 ? `\n...and ${missing.length - 20} more` : ''}\n\nPress OK to submit anyway, or Cancel to go back and fill them.`;
      const shouldContinue = window.confirm(message);
      if (!shouldContinue) return;
    }

    setLoading(true);

    try {
      const payload = {
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
        directCosts: Object.fromEntries(
          Object.entries(formData.directCosts).map(([k, v]) => [k, Number(v) || 0])
        ),
        paymentsReceived: Object.fromEntries(
          Object.entries(formData.paymentsReceived).map(([k, v]) => [k, Number(v) || 0])
        ),
        expenses: Object.fromEntries(
          Object.entries(formData.expenses).map(([k, v]) => [k, Number(v) || 0])
        ),
      };

      await dailySalesService.create(payload);
      toast.success('Daily sales entry created successfully!');
      navigate('/data-entry/history');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      date: today,
      products: {
        chips: { invoices: 0, cashRevenue: 0, expenses: 0 },
        flavors: { invoices: 0, cashRevenue: 0, expenses: 0 },
        pellets: { invoices: 0, cashRevenue: 0, expenses: 0 },
        proteinChips: { invoices: 0, cashRevenue: 0, expenses: 0 },
        proteinBars: { invoices: 0, cashRevenue: 0, expenses: 0 },
      },
      directCosts: {
        directLabor: 0,
        indirectLabor: 0,
        heatAndPower: 0,
        factoryCommissions: 0,
        miscFactoryCosts: 0,
        contractLabor: 0,
        freight: 0,
        rawMaterials: 0,
      },
      paymentsReceived: {
        chips: 0,
        flavors: 0,
        pellets: 0,
      },
      expenses: {
        marketing: 0,
        vehicles: 0,
        advancePurchases: 0,
        charitable: 0,
        machinesSpares: 0,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Daily Sales Entry</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="input"
            disabled={user?.role === 'dataEntry'}
            required
          />
        </div>

        {/* Product Sales */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
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
            {['chips', 'flavors', 'pellets', 'proteinChips', 'proteinBars'].map(
              (product) => (
                <div key={product} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 capitalize">{product.replace(/([A-Z])/g, ' $1')}</h3>
                  <div className="space-y-2">
                    {showInvoices && (
                      <div>
                        <label className="block text-sm text-gray-600">Invoices</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.products[product].invoices}
                          onChange={(e) =>
                            handleProductChange(product, 'invoices', e.target.value)
                          }
                          className="input"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm text-gray-600">Cash Revenue</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.products[product].cashRevenue}
                        onChange={(e) =>
                          handleProductChange(product, 'cashRevenue', e.target.value)
                        }
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Expenses</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.products[product].expenses}
                        onChange={(e) =>
                          handleProductChange(product, 'expenses', e.target.value)
                        }
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Direct Costs */}
        {/* <div className="card">
          <h2 className="text-xl font-semibold mb-4">Direct Factory Costs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.keys(formData.directCosts).map((cost) => (
              <div key={cost}>
                <label className="block text-sm text-gray-600 mb-1 capitalize">
                  {cost.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.directCosts[cost]}
                  onChange={(e) => handleChange('directCosts', cost, e.target.value)}
                  className="input"
                />
              </div>
            ))}
          </div>
        </div> */}

        {/* Payments Received */}
        {/* <div className="card">
          <h2 className="text-xl font-semibold mb-4">Payments Received</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['chips', 'flavors', 'pellets'].map((product) => (
              <div key={product}>
                <label className="block text-sm text-gray-600 mb-1 capitalize">
                  {product.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.paymentsReceived[product]}
                  onChange={(e) => handleChange('paymentsReceived', product, e.target.value)}
                  className="input"
                />
              </div>
            ))}
          </div>
        </div> */}

        {/* Expenses */}
        {/* <div className="card">
          <h2 className="text-xl font-semibold mb-4">Expenses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.keys(formData.expenses).map((expense) => (
              <div key={expense}>
                <label className="block text-sm text-gray-600 mb-1 capitalize">
                  {expense.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.expenses[expense]}
                  onChange={(e) => handleChange('expenses', expense, e.target.value)}
                  className="input"
                />
              </div>
            ))}
          </div>
        </div> */}

        {/* Calculations Preview */}
        <div className="card bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-lg font-semibold">{formatCurrency(calculations.totalInvoices)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cash Revenue</p>
              <p className="text-lg font-semibold">
                {formatCurrency(calculations.totalCashRevenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Direct Costs</p>
              <p className="text-lg font-semibold">{formatCurrency(calculations.totalDirectCosts)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-lg font-semibold">{formatCurrency(calculations.totalExpenses)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Cash</p>
              <p
                className={`text-lg font-semibold ${
                  calculations.netCash >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(calculations.netCash)}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary"
            disabled={loading}
          >
            Clear
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Submit Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}

