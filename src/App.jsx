import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/Student/StudentList';
import EmployeeList from './pages/Employee/EmployeeList';
import PrivateRoute from './PrivateRoute';
import SupportPolicy from './pages/SupportPolicy';
import Videos from './pages/Videos';
import Banners from './pages/Banners';
import StudentDocuments from "./pages/Student/StudentDocuments";
import EmployeeDocuments from './pages/Employee/EmployeeDocuments';
import PaymentSettings from './pages/PaymentSettings';
import WalletRequests from './pages/Employee/WalletRequests';
import SchemeData from './pages/Student/SchemeData';
import GuardiansData from "./pages/GuardiansData";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user was logged in previously
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<Login setIsAuthenticated={setIsAuthenticated} />} 
        />
        <Route 
          path="/*" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
<Route path="/students/list" element={<StudentList />} />
<Route path="/employees/documents" element={<EmployeeDocuments />} />

<Route path="/students/documents" element={<StudentDocuments />} />
                  <Route path="/employees/list" element={<EmployeeList />} />
<Route path="/employees/wallet-requests" element={<WalletRequests />} />
                   <Route path="/support-policy" element={<SupportPolicy />} />
                   <Route path="/videos" element={<Videos />} />
                   <Route path="/banners" element={<Banners />} />
                   <Route path="/payment-settings" element={<PaymentSettings />} />
                   <Route path="/students/scheme-data" element={<SchemeData />} />
<Route path="/students/guardians" element={<GuardiansData />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;