import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { USER_ROLES } from '../../utils/constants.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(username, password);
      console.log('Login completed, user:', user);

      if (user && user.role) {
        console.log('User role from login:', user.role);
        console.log('USER_ROLES constants:', USER_ROLES);
        console.log('Comparing:', {
          admin: user.role === USER_ROLES.ADMIN,
          manager: user.role === USER_ROLES.MANAGER,
          dataEntry: user.role === USER_ROLES.DATA_ENTRY
        });
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          console.log('Navigating to dashboard for role:', user.role);
          // Redirect based on role
          if (user.role === USER_ROLES.ADMIN || user.role === 'admin') {
            console.log('Redirecting to admin dashboard');
            navigate('/admin/dashboard', { replace: true });
          } else if (user.role === USER_ROLES.MANAGER || user.role === 'manager') {
            console.log('Redirecting to manager dashboard');
            navigate('/manager/dashboard', { replace: true });
          } else if (user.role === USER_ROLES.DATA_ENTRY || user.role === 'dataEntry') {
            console.log('Redirecting to data entry form');
            navigate('/data-entry/new', { replace: true });
          } else {
            console.log('Unknown role, redirecting to home');
            navigate('/', { replace: true });
          }
        }, 200);
      } else {
        console.error('Login failed: Invalid user response', user);
        toast.error('Login failed: Invalid user data');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Error is handled in authService (toast notification)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input rounded-t-md"
                placeholder="Username or Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input rounded-b-md"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex justify-center items-center"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

