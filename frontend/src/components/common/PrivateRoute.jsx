import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('PrivateRoute: Not authenticated, redirecting to login', { user, isAuthenticated, loading });
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = user.role;
    const hasAccess = allowedRoles.includes(userRole);
    console.log('PrivateRoute: Checking access', { 
      userRole, 
      allowedRoles, 
      hasAccess,
      roleMatch: {
        exact: allowedRoles.includes(userRole),
        admin: allowedRoles.includes('admin') && userRole === 'admin',
        manager: allowedRoles.includes('manager') && userRole === 'manager',
        dataEntry: allowedRoles.includes('dataEntry') && userRole === 'dataEntry'
      }
    });
    
    if (!hasAccess) {
      console.log('PrivateRoute: Role not allowed, redirecting to home', { userRole, allowedRoles });
      return <Navigate to="/" replace />;
    }
  }

  console.log('PrivateRoute: Access granted', { userRole: user.role, allowedRoles });
  return children;
}

