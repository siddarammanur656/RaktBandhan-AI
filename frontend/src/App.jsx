import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Donor Portal
import DonorDashboard from './pages/DonorDashboard';
import DonorProfile from './pages/DonorProfile';

// Patient Portal
import PatientDashboard from './pages/PatientDashboard';

// Admin Portal
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
              <Route path="donor/dashboard" element={<DonorDashboard />} />
              <Route path="donor/profile" element={<DonorProfile />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
              <Route path="patient/dashboard" element={<PatientDashboard />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
