import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'manager':
        return '/manager/dashboard';
      case 'dataEntry':
        return '/data-entry/new';
      default:
        return '/login';
    }
  };

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={getDashboardPath()} className="flex items-center gap-3">
              <span className="bg-white/95 rounded-md p-1 ring-1 ring-white/30 shadow-sm">
                <img
                  src={logo}
                  alt="Company logo"
                  className="h-9 w-auto object-contain"
                />
              </span>
              <span className="text-xl font-bold">Sales Management</span>
            </Link>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                Welcome, {user.fullName} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

