// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/Student/StudentList';
import EmployeeList from './pages/Employee/EmployeeList';
import CitizenList from './pages/citizens/CitizenList';
import PrivateRoute from './PrivateRoute';
import SupportPolicy from './pages/SupportPolicy';
import Videos from './pages/Videos';
import Banners from './pages/Banners';
import StudentDocuments from "./pages/Student/StudentDocuments";
import EmployeeDocuments from './pages/Employee/EmployeeDocuments';
import CitizenDocuments from './pages/citizens/CitizenDocuments';
import PaymentSettings from './pages/PaymentSettings';
import WalletRequests from './pages/Employee/WalletRequests';
import EmployeeWalletManager from './pages/Employee/EmployeeWalletManager';
import SchemeData from './pages/Student/SchemeData';
// import GuardiansData from "./pages/GuardiansData"; // Commented out
import CreateLoans from './pages/CreateLoans';
import LoanApplications from './pages/Student/LoanApplications';
import VerifyPayments from './pages/Student/VerifyPayments';
import PaymentHistory from './pages/Student/PaymentHistory';

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
          element={
            <PrivateRoute>
              <Layout setIsAuthenticated={setIsAuthenticated} />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          
          {/* Student Routes */}
          <Route path="students/list" element={<StudentList />} />
          <Route path="students/documents" element={<StudentDocuments />} />
          <Route path="students/loan-data" element={<LoanApplications />} />
          <Route path="students/create-loans" element={<CreateLoans />} />
          <Route path="students/scheme-data" element={<SchemeData />} />
          {/* <Route path="students/guardians" element={<GuardiansData />} /> */} {/* Commented out */}
          <Route path="students/verify-payments" element={<VerifyPayments />} />
          <Route path="students/payment-history" element={<PaymentHistory />} />
          
          {/* Citizen Routes */}
          <Route path="citizens/list" element={<CitizenList />} />
          <Route path="citizens/documents" element={<CitizenDocuments />} />
          
          {/* Employee Routes */}
          <Route path="employees/list" element={<EmployeeList />} />
          <Route path="employees/documents" element={<EmployeeDocuments />} />
          <Route path="employees/wallet-requests" element={<WalletRequests />} />
          <Route path="employees/wallet-management" element={<EmployeeWalletManager />} />
          
          {/* Other Routes */}
          <Route path="support-policy" element={<SupportPolicy />} />
          <Route path="videos" element={<Videos />} />
          <Route path="banners" element={<Banners />} />
          <Route path="payment-settings" element={<PaymentSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;