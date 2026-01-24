import { useState, useEffect, useMemo } from 'react';
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
        step="1"
        min="0"
        placeholder="0"
        value={display}
        onChange={(e) => {
          setDisplay(e.target.value);
          onChange(e);
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
    step="1"
    min="0"
    placeholder="0"
    value={value}
    onChange={onChange}
    className="input"
  />
);

const ExpenseSearchResults = ({
  query,
  expenseTypes,
  activeExpenseKeys,
  getExpenseLabel,
  getExpenseCategory,
  onAdd,
  onAddToAll,
}) => {
  const normalizedQuery = (query || '').trim().toLowerCase();

  const grouped = useMemo(() => {
    const available = (expenseTypes || []).filter((k) => !activeExpenseKeys.includes(k));

    const filtered = normalizedQuery
      ? available.filter((k) => {
          const label = (getExpenseLabel(k) || '').toLowerCase();
          const category = (getExpenseCategory(k) || '').toLowerCase();
          const key = (k || '').toLowerCase();
          return (
            label.includes(normalizedQuery) ||
            category.includes(normalizedQuery) ||
            key.includes(normalizedQuery)
          );
        })
      : available;

    const byCategory = filtered.reduce((acc, k) => {
      const category = getExpenseCategory(k);
      if (!acc[category]) acc[category] = [];
      acc[category].push(k);
      return acc;
    }, {});

    return Object.entries(byCategory)
      .map(([category, keys]) => ({
        category,
        keys: keys.sort((a, b) => getExpenseLabel(a).localeCompare(getExpenseLabel(b))),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [expenseTypes, activeExpenseKeys, normalizedQuery, getExpenseLabel, getExpenseCategory]);

  if ((expenseTypes || []).length === 0) return null;

  if (grouped.length === 0) {
    return <div className="text-sm text-gray-500 mt-2">No matching expenses.</div>;
  }

  return (
    <div className="mt-3 border rounded-lg p-3 bg-white">
      <div className="max-h-64 overflow-auto space-y-3">
        {grouped.map((group) => (
          <div key={group.category}>
            <div className="text-xs font-semibold text-gray-600 mb-2">{group.category}</div>
            <div className="space-y-2">
              {group.keys.map((expenseKey) => (
                <div
                  key={expenseKey}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="text-sm text-gray-800">{getExpenseLabel(expenseKey)}</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => onAdd(expenseKey)}
                      aria-label={`Add ${getExpenseLabel(expenseKey)}`}
                    >
                      + Add
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => onAddToAll?.(expenseKey)}
                      aria-label={`Add ${getExpenseLabel(expenseKey)} to all products`}
                    >
                      + Add to all
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ===== Component ===== */

export default function DailyEntryForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const PRODUCT_STYLES = {
    chips: 'bg-blue-50 border-blue-200',
    flavors: 'bg-emerald-50 border-emerald-200',
    pellets: 'bg-amber-50 border-amber-200',
    proteinChips: 'bg-purple-50 border-purple-200',
    proteinBars: 'bg-rose-50 border-rose-200',
  };

  const [loading, setLoading] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);

  const EXPENSE_META = {
    direct_factory_costs: { label: 'Direct Factory Costs', category: 'Factory & Production Costs' },
    direct_labour_cost: { label: 'Direct Labour Cost', category: 'Factory & Production Costs' },
    indirect_labour_cost: { label: 'Indirect Labour Cost', category: 'Factory & Production Costs' },
    contract_labour: { label: 'Contract Labour', category: 'Factory & Production Costs' },
    heat_and_power: { label: 'Heat and Power', category: 'Factory & Production Costs' },
    commissions_factory: { label: 'Commissions (Factory)', category: 'Factory & Production Costs' },
    misc_factory_costs: { label: 'Misc. Factory Costs', category: 'Factory & Production Costs' },
    freight: { label: 'Freight', category: 'Factory & Production Costs' },
    freight_costs: { label: 'Freight Costs', category: 'Factory & Production Costs' },
    raw_materials_purchased: { label: 'Raw Materials Purchased', category: 'Factory & Production Costs' },
    product_cost: { label: 'Product Cost', category: 'Factory & Production Costs' },

    marketing_expense: { label: 'Marketing Expense', category: 'Operational Expenses' },
    vehicle_expenses: { label: 'Vehicle Expenses', category: 'Operational Expenses' },
    travel_exp: { label: 'Travel Exp', category: 'Operational Expenses' },
    travel_transportation_exp: { label: 'Travel & Transportation Exp', category: 'Operational Expenses' },
    transportion: { label: 'Transportation', category: 'Operational Expenses' },
    gas_oil: { label: 'Gas & Oil', category: 'Operational Expenses' },
    gifts_expenses: { label: 'Gifts Expenses', category: 'Operational Expenses' },
    maintenance_expense: { label: 'Maintenance Expense', category: 'Operational Expenses' },
    office_supplies_expenses: { label: 'Office Supplies Expenses', category: 'Operational Expenses' },
    communication_expenses: { label: 'Communication Expenses', category: 'Operational Expenses' },
    rent_or_lease_expense: { label: 'Rent or Lease Expense', category: 'Operational Expenses' },
    office_expenses: { label: 'Office Expenses', category: 'Operational Expenses' },
    utilities: { label: 'Utilities', category: 'Operational Expenses' },
    internet: { label: 'Internet', category: 'Operational Expenses' },
    stationery: { label: 'Stationery', category: 'Operational Expenses' },

    salaries: { label: 'Salaries', category: 'Human Resources & Payroll' },
    wages: { label: 'Wages', category: 'Human Resources & Payroll' },
    daily_allowance: { label: 'Daily Allowance', category: 'Human Resources & Payroll' },
    incentive: { label: 'Incentive', category: 'Human Resources & Payroll' },
    rewarding: { label: 'Rewarding', category: 'Human Resources & Payroll' },

    machines_spares: { label: 'Machines & Spares', category: 'Machines & Equipment' },
    machines_puffs: { label: 'Machines - Puffs', category: 'Machines & Equipment' },
    machines_pellets: { label: 'Machines - Pellets', category: 'Machines & Equipment' },
    machines: { label: 'Machines', category: 'Machines & Equipment' },
    spares: { label: 'Spares', category: 'Machines & Equipment' },
    other_machines_equipment: { label: 'Other Machines and Equipment', category: 'Machines & Equipment' },
    furniture: { label: 'Furniture', category: 'Machines & Equipment' },
    automatic_swing_door: { label: 'Automatic Swing Door Opener System', category: 'Machines & Equipment' },

    legal_fee: { label: 'Legal Fee', category: 'Professional Services' },
    consulting: { label: 'Consulting', category: 'Professional Services' },
    other_service: { label: 'Other Service', category: 'Professional Services' },
    soft_wear: { label: 'Software', category: 'Professional Services' },

    bank_fee: { label: 'Bank Fee', category: 'Financial & Administrative' },
    tax_paid: { label: 'Tax Paid', category: 'Financial & Administrative' },
    exchange_gain_loss: { label: 'Exchange Gain/Loss - net', category: 'Financial & Administrative' },
    loan_benefits: { label: 'Loan benefits', category: 'Financial & Administrative' },
    dividends: { label: 'Dividends', category: 'Financial & Administrative' },

    advance_purchases_clearance: {
      label: 'Advance purchases/clearance',
      category: 'Miscellaneous Expenses',
    },
    charitable_contributions: { label: 'Charitable Contributions', category: 'Miscellaneous Expenses' },
    hospitality: { label: 'Hospitality', category: 'Miscellaneous Expenses' },
    public_relations: { label: 'Public Relations', category: 'Miscellaneous Expenses' },
    other_assets: { label: 'Other Assets', category: 'Miscellaneous Expenses' },

    orgflavors_to_ho: { label: 'OrgFlavors to HO', category: 'Internal Transfers' },
    pellets_to_ho: { label: 'Pellets to HO', category: 'Internal Transfers' },
    to_flavors: { label: 'To Flavors', category: 'Internal Transfers' },
    to_sanitizers: { label: 'To Sanitizers', category: 'Internal Transfers' },
    flavors: { label: 'Flavors', category: 'Internal Transfers' },
  };

  const EXPENSE_TYPES = [
    'direct_factory_costs',
    'direct_labour_cost',
    'indirect_labour_cost',
    'contract_labour',
    'heat_and_power',
    'commissions_factory',
    'misc_factory_costs',
    'freight',
    'freight_costs',
    'raw_materials_purchased',
    'product_cost',
    'marketing_expense',
    'vehicle_expenses',
    'travel_exp',
    'travel_transportation_exp',
    'transportion',
    'gas_oil',
    'gifts_expenses',
    'maintenance_expense',
    'office_supplies_expenses',
    'communication_expenses',
    'rent_or_lease_expense',
    'office_expenses',
    'utilities',
    'internet',
    'stationery',
    'salaries',
    'wages',
    'daily_allowance',
    'incentive',
    'rewarding',
    'machines_spares',
    'machines_puffs',
    'machines_pellets',
    'machines',
    'spares',
    'other_machines_equipment',
    'furniture',
    'automatic_swing_door',
    'legal_fee',
    'consulting',
    'other_service',
    'soft_wear',
    'bank_fee',
    'tax_paid',
    'exchange_gain_loss',
    'loan_benefits',
    'dividends',
    'advance_purchases_clearance',
    'charitable_contributions',
    'hospitality',
    'public_relations',
    'other_assets',
    'orgflavors_to_ho',
    'pellets_to_ho',
    'to_flavors',
    'to_sanitizers',
    'flavors',
  ];

  const getExpenseLabel = (expenseKey) => {
    return EXPENSE_META?.[expenseKey]?.label || expenseKey.replace(/_/g, ' ');
  };

  const getExpenseCategory = (expenseKey) => {
    return EXPENSE_META?.[expenseKey]?.category || 'Other';
  };

  const [formData, setFormData] = useState({
    date: today,
    products: {
      chips: { invoices: '', sales: '', expenses: {} },
      flavors: { invoices: '', sales: '', expenses: {} },
      pellets: { invoices: '', sales: '', expenses: {} },
      proteinChips: { invoices: '', sales: '', expenses: {} },
      proteinBars: { invoices: '', sales: '', expenses: {} },
    },
    miscIncome: '',
    miscIncomeNote: '',
  });

  const [yesterdayCash, setYesterdayCash] = useState(0);

  const [expenseSearchByProduct, setExpenseSearchByProduct] = useState({});
  const [expensePickerOpenByProduct, setExpensePickerOpenByProduct] = useState({});
  const [activeExpenseKeysByProduct, setActiveExpenseKeysByProduct] = useState({});

  const [calculations, setCalculations] = useState({
    totalInvoices: 0,
    totalSales: 0,
    totalExpenses: 0,
    todayTotalCash: 0,
    totalCurrentCash: 0,
    perProduct: {},
  });

  useEffect(() => {
    const fetchYesterdayCash = async () => {
      try {
        const d = new Date(formData.date);
        d.setDate(d.getDate() - 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yesterdayKey = `${yyyy}-${mm}-${dd}`;

        const row = await dailySalesService.getByDate(yesterdayKey);
        const revenue = Number(row?.totalCashRevenue) || 0;
        const expenses = Number(row?.totalExpenses) || 0;
        setYesterdayCash(revenue - expenses);
      } catch {
        setYesterdayCash(0);
      }
    };

    fetchYesterdayCash();
  }, [formData.date]);

  useEffect(() => {
    setActiveExpenseKeysByProduct((prev) => {
      const next = { ...prev };
      Object.entries(formData.products).forEach(([productKey, productValue]) => {
        const existing = Array.isArray(next[productKey]) ? next[productKey] : [];
        const fromValues = Object.entries(productValue?.expenses || {})
          .filter(([, v]) => {
            if (v === '' || v === null || v === undefined) return false;
            return Number(v) !== 0;
          })
          .map(([k]) => k);

        const merged = Array.from(new Set([...existing, ...fromValues]));
        next[productKey] = merged;
      });
      return next;
    });
  }, [formData.products]);

  useEffect(() => {
    const entries = Object.entries(formData.products);

    const perProduct = entries.reduce((acc, [product, v]) => {
      const sales = Number(v.sales) || 0;
      const expenseTotal = Object.values(v.expenses || {}).reduce(
        (sum, x) => sum + (Number(x) || 0),
        0
      );
      acc[product] = {
        sales,
        expenses: expenseTotal,
        cash: sales - expenseTotal,
      };
      return acc;
    }, {});

    const totalInvoices = entries.reduce((sum, [, v]) => sum + (Number(v.invoices) || 0), 0);
    const totalSales = Object.values(perProduct).reduce((sum, p) => sum + p.sales, 0);
    const totalExpenses = Object.values(perProduct).reduce((sum, p) => sum + p.expenses, 0);
    const miscIncome = Number(formData.miscIncome) || 0;
    const todayTotalCash = totalSales - totalExpenses + miscIncome;

    setCalculations({
      totalInvoices,
      totalSales,
      totalExpenses,
      todayTotalCash,
      totalCurrentCash: yesterdayCash + todayTotalCash,
      perProduct,
    });
  }, [formData]);

  const handleProductChange = (product, field, value) => {
    setFormData((prev) => ({
      ...prev,
      products: {
        ...prev.products,
        [product]: {
          ...prev.products[product],
          [field]: value === '' ? '' : parseInt(value, 10) || 0,
        },
      },
    }));
  };

  const handleProductExpenseChange = (product, expenseKey, value) => {
    setFormData((prev) => ({
      ...prev,
      products: {
        ...prev.products,
        [product]: {
          ...prev.products[product],
          expenses: {
            ...(prev.products[product].expenses || {}),
            [expenseKey]: value === '' ? '' : parseInt(value, 10) || 0,
          },
        },
      },
    }));
  };

  const addExpenseField = (product, expenseKey) => {
    setActiveExpenseKeysByProduct((prev) => {
      const existing = Array.isArray(prev[product]) ? prev[product] : [];
      if (existing.includes(expenseKey)) return prev;
      return { ...prev, [product]: [...existing, expenseKey] };
    });

    setFormData((prev) => {
      const existingExpenses = prev.products?.[product]?.expenses || {};
      if (Object.prototype.hasOwnProperty.call(existingExpenses, expenseKey)) return prev;
      return {
        ...prev,
        products: {
          ...prev.products,
          [product]: {
            ...prev.products[product],
            expenses: {
              ...existingExpenses,
              [expenseKey]: '',
            },
          },
        },
      };
    });

    setExpenseSearchByProduct((prev) => ({ ...prev, [product]: '' }));
  };

  const addExpenseFieldToAll = (sourceProduct, expenseKey) => {
    setActiveExpenseKeysByProduct((prev) => {
      const next = { ...prev };
      Object.keys(formData.products || {}).forEach((productKey) => {
        const existing = Array.isArray(next[productKey]) ? next[productKey] : [];
        if (!existing.includes(expenseKey)) {
          next[productKey] = [...existing, expenseKey];
        }
      });
      return next;
    });

    setFormData((prev) => {
      const nextProducts = { ...(prev.products || {}) };
      Object.keys(nextProducts).forEach((productKey) => {
        const productValue = nextProducts[productKey] || {};
        const existingExpenses = productValue.expenses || {};
        if (!Object.prototype.hasOwnProperty.call(existingExpenses, expenseKey)) {
          nextProducts[productKey] = {
            ...productValue,
            expenses: {
              ...existingExpenses,
              [expenseKey]: '',
            },
          };
        }
      });

      return {
        ...prev,
        products: nextProducts,
      };
    });

    setExpenseSearchByProduct((prev) => ({ ...prev, [sourceProduct]: '' }));
  };

  const removeExpenseField = (product, expenseKey) => {
    setActiveExpenseKeysByProduct((prev) => {
      const existing = Array.isArray(prev[product]) ? prev[product] : [];
      return { ...prev, [product]: existing.filter((k) => k !== expenseKey) };
    });

    setFormData((prev) => {
      const nextExpenses = { ...(prev.products?.[product]?.expenses || {}) };
      delete nextExpenses[expenseKey];
      return {
        ...prev,
        products: {
          ...prev.products,
          [product]: {
            ...prev.products[product],
            expenses: nextExpenses,
          },
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingSalesProducts = Object.entries(formData.products || {})
      .filter(([, v]) => v?.sales === '' || v?.sales === null || typeof v?.sales === 'undefined')
      .map(([k]) => k.replace(/([A-Z])/g, ' $1'));

    if (missingSalesProducts.length > 0) {
      toast.error(`Please fill Sales for: ${missingSalesProducts.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      await dailySalesService.create({
        ...formData,
        miscIncome: parseInt(formData.miscIncome, 10) || 0,
        products: Object.fromEntries(
          Object.entries(formData.products).map(([k, v]) => [
            k,
            {
              invoices: parseInt(v.invoices, 10) || 0,
              sales: parseInt(v.sales, 10) || 0,
              expenses: Object.fromEntries(
                Object.entries(v.expenses || {}).map(([ek, ev]) => [ek, parseInt(ev, 10) || 0])
              ),
            },
          ])
        ),
      });

      toast.success('Daily sales entry created successfully!');
      navigate('/data-entry/history');
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create entry';
      toast.error(message);
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
              <div
                key={product}
                className={`border rounded-lg p-4 ${PRODUCT_STYLES[product] || 'bg-gray-50 border-gray-200'}`}
              >
                <h3 className="font-medium mb-3 capitalize">
                  {product.replace(/([A-Z])/g, ' $1')}
                </h3>

                <div className="space-y-3">
                  {showInvoices && (
                    <div>
                      <label className="text-sm">Invoices</label>
                      <MoneyInput
                        value={formData.products[product].invoices}
                        onChange={(e) =>
                          handleProductChange(product, 'invoices', e.target.value)
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm">Sales</label>
                    <MoneyInput
                      value={formData.products[product].sales}
                      onChange={(e) =>
                        handleProductChange(product, 'sales', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm">Expenses</label>
                    <div className="mt-2 space-y-3">
                      {(activeExpenseKeysByProduct?.[product] || []).length === 0 ? (
                        <div className="text-sm text-gray-500">No expenses added yet.</div>
                      ) : (
                        <div className="space-y-2">
                          {(activeExpenseKeysByProduct?.[product] || []).map((expenseKey) => (
                            <div
                              key={expenseKey}
                              className="grid grid-cols-12 gap-2 items-center"
                            >
                              <div className="col-span-6">
                                <div className="text-sm text-gray-700">{getExpenseLabel(expenseKey)}</div>
                                <div className="text-xs text-gray-500">{getExpenseCategory(expenseKey)}</div>
                              </div>
                              <div className="col-span-5">
                                <MoneyInput
                                  value={formData.products[product].expenses?.[expenseKey] ?? ''}
                                  onChange={(e) =>
                                    handleProductExpenseChange(product, expenseKey, e.target.value)
                                  }
                                />
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <button
                                  type="button"
                                  className="btn btn-secondary px-2"
                                  onClick={() => removeExpenseField(product, expenseKey)}
                                  aria-label={`Remove ${getExpenseLabel(expenseKey)}`}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border-t pt-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                              setExpensePickerOpenByProduct((prev) => ({
                                ...prev,
                                [product]: !prev?.[product],
                              }))
                            }
                            aria-expanded={!!expensePickerOpenByProduct?.[product]}
                            aria-controls={`expense-picker-${product}`}
                          >
                            + Add Expense
                          </button>

                          {expensePickerOpenByProduct?.[product] && (
                            <div
                              id={`expense-picker-${product}`}
                              className="flex-1"
                            >
                              <input
                                type="text"
                                className="input"
                                placeholder="Search expenses (e.g., labour, marketing...)"
                                value={expenseSearchByProduct?.[product] || ''}
                                onChange={(e) =>
                                  setExpenseSearchByProduct((prev) => ({
                                    ...prev,
                                    [product]: e.target.value,
                                  }))
                                }
                                aria-label="Search expenses"
                              />
                            </div>
                          )}
                        </div>

                        {expensePickerOpenByProduct?.[product] && (
                          <ExpenseSearchResults
                            product={product}
                            query={expenseSearchByProduct?.[product] || ''}
                            expenseTypes={EXPENSE_TYPES}
                            activeExpenseKeys={activeExpenseKeysByProduct?.[product] || []}
                            getExpenseLabel={getExpenseLabel}
                            getExpenseCategory={getExpenseCategory}
                            onAdd={(expenseKey) => addExpenseField(product, expenseKey)}
                            onAddToAll={(expenseKey) => addExpenseFieldToAll(product, expenseKey)}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-sm text-gray-600">Today's Cash</div>
                    <div className="font-semibold">
                      {formatCurrency(calculations.perProduct?.[product]?.cash || 0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Miscellaneous Income</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <MoneyInput
                value={formData.miscIncome}
                onChange={(e) => setFormData({ ...formData, miscIncome: e.target.value })}
              />
              <div className="text-xs text-gray-500 mt-2">
                Use this for any income that increases Total Current Cash but is not related to a specific product.
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Note</label>
              <textarea
                value={formData.miscIncomeNote}
                onChange={(e) => setFormData({ ...formData, miscIncomeNote: e.target.value })}
                className="input h-24 resize-none"
                placeholder="Explain the source of this income..."
              />
            </div>
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
              <p className="text-sm">Today's Total Sales</p>
              <p className="font-semibold">
                {formatCurrency(calculations.totalSales)}
              </p>
            </div>
            <div>
              <p className="text-sm">Today's Total Cash</p>
              <p className="font-semibold">
                {formatCurrency(calculations.todayTotalCash)}
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
