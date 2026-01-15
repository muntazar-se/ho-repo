import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { USER_ROLES } from '../../utils/constants.js';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path
      ? 'bg-primary-100 text-primary-900 font-semibold'
      : 'text-gray-700 hover:bg-gray-100';
  };

  if (!user) return null;

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'User Management', icon: '👥' },
    { path: '/manager/dashboard', label: 'Reports', icon: '📈' },
  ];

  const managerLinks = [
    { path: '/manager/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/manager/daily-sales-history', label: 'Daily Sales History', icon: '📅' },
    // { path: '/manager/monthly-sales', label: 'Monthly Sales', icon: '📊' },
    // { path: '/manager/cash-position', label: 'Cash Position', icon: '💰' },
    // { path: '/manager/products', label: 'Product Performance', icon: '📦' },
    // { path: '/manager/risk-analysis', label: 'Risk Analysis', icon: '⚠️' },
    // { path: '/manager/annual-summary', label: 'Annual Summary', icon: '📈' },
  ];

  const dataEntryLinks = [
    { path: '/data-entry/new', label: 'New Entry', icon: '➕' },
    { path: '/data-entry/history', label: "Today's Entries", icon: '📋' },
  ];

  const links =
    user.role === USER_ROLES.ADMIN
      ? adminLinks
      : user.role === USER_ROLES.MANAGER
      ? managerLinks
      : dataEntryLinks;

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen p-4">
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(
              link.path
            )}`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

