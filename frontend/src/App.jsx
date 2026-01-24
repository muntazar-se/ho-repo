import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import PrivateRoute from './components/common/PrivateRoute.jsx';
import Navbar from './components/common/Navbar.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import { USER_ROLES } from './utils/constants.js';
import UserManagement from './pages/admin/UserManagement.jsx';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';


// Auth pages
import Login from './pages/auth/Login.jsx';

// Data Entry pages
import DailyEntryForm from './pages/dataEntry/DailyEntryForm.jsx';
import TodaysEntries from './pages/dataEntry/TodaysEntries.jsx';

// Manager pages (placeholder - will create these)
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx';
import DailySales from './pages/manager/DailySales.jsx';
import MonthlyReport from './pages/manager/MonthlyReport.jsx';

// Admin pages (placeholder - will create these)
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

function App() {
  return (
    <AuthProvider>
      <ConfigProvider locale={enUS}>
        <Router>
          <Toaster
            position="top-center"
            containerStyle={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
          
          {/* Data Entry Routes */}
          <Route
            path="/data-entry/new"
            element={
              <PrivateRoute allowedRoles={[USER_ROLES.DATA_ENTRY, USER_ROLES.ADMIN]}>
                <Layout>
                  <DailyEntryForm />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/data-entry/history"
            element={
              <PrivateRoute allowedRoles={[USER_ROLES.DATA_ENTRY, USER_ROLES.ADMIN]}>
                <Layout>
                  <TodaysEntries />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/data-entry/daily-sales-history"
            element={
              <PrivateRoute allowedRoles={[USER_ROLES.DATA_ENTRY, USER_ROLES.ADMIN]}>
                <Layout>
                  <DailySales />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <PrivateRoute allowedRoles={[USER_ROLES.MANAGER, USER_ROLES.ADMIN]}>
                <Layout>
                  <ManagerDashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
  path="/admin/users"
  element={
    <PrivateRoute allowedRoles={[USER_ROLES.ADMIN]}>
      <Layout>
        <UserManagement />
      </Layout>
    </PrivateRoute>
  }
/>
<Route
  path="/manager/daily-sales-history"
  element={
    <PrivateRoute allowedRoles={[USER_ROLES.MANAGER, USER_ROLES.ADMIN]}>
      <Layout>
        <DailySales />
      </Layout>
    </PrivateRoute>
  }
/>

          <Route
            path="/manager/monthly-sales"
            element={
              <PrivateRoute allowedRoles={[USER_ROLES.MANAGER, USER_ROLES.ADMIN]}>
                <Layout>
                  <MonthlyReport />
                </Layout>
              </PrivateRoute>
            }
          />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const isDataEntryRoute = location.pathname.startsWith('/data-entry');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main
          key={isDataEntryRoute ? location.pathname : undefined}
          className={`flex-1 p-6 ${isDataEntryRoute ? 'page-transition' : ''}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default App;

