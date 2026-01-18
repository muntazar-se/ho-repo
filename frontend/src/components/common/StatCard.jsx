import { formatCurrency } from '../../utils/formatters.js';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, format }) {
  const displayValue = typeof value === 'number' && !format ? formatCurrency(value) : value;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {displayValue}
          </p>
          {/* rest unchanged */}
        </div>
        {/* rest unchanged */}
      </div>
    </div>
  );
}
