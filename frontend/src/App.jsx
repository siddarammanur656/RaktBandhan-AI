import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ThankYou from './pages/ThankYou';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/layout/ProtectedRoute';

import DonorDashboard from './pages/DonorDashboard';
import DonorProfile from './pages/DonorProfile';
import DonorTransfusionAction from './pages/DonorTransfusionAction';

// Hospital Portal
import HospitalDashboard from './pages/HospitalDashboard';

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
            <Route path="thank-you" element={<ThankYou />} />
            <Route path="schedule/response/:requestId" element={<DonorTransfusionAction />} />
            
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

            {/* Hospital Routes */}
            <Route element={<ProtectedRoute allowedRoles={['hospital']} />}>
              <Route path="hospital/dashboard" element={<HospitalDashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
