// src/App.jsx
import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";
import Layout from "./components/Layout/Layout";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const StudentList = lazy(() => import("./pages/Student/StudentList"));
const StudentDocuments = lazy(() => import("./pages/Student/StudentDocuments"));
const LoanApplications = lazy(() => import("./pages/Student/LoanApplications"));
const CreateLoans = lazy(() => import("./pages/CreateLoans"));
const SchemeData = lazy(() => import("./pages/Student/SchemeData"));
const VerifyPayments = lazy(() => import("./pages/Student/VerifyPayments"));
const PaymentHistory = lazy(() => import("./pages/Student/PaymentHistory"));

const CitizenList = lazy(() => import("./pages/citizens/CitizenList"));
const CitizenDocuments = lazy(() => import("./pages/citizens/CitizenDocuments"));

const EmployeeList = lazy(() => import("./pages/Employee/EmployeeList"));
const EmployeeDocuments = lazy(() => import("./pages/Employee/EmployeeDocuments"));
const WalletRequests = lazy(() => import("./pages/Employee/WalletRequests"));
const EmployeeWalletManager = lazy(() => import("./pages/Employee/EmployeeWalletManager"));

const SupportPolicy = lazy(() => import("./pages/SupportPolicy"));
const Videos = lazy(() => import("./pages/Videos"));
const Banners = lazy(() => import("./pages/Banners"));
const PaymentSettings = lazy(() => import("./pages/PaymentSettings"));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            Loading...
          </div>
        }
      >
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

            <Route path="students/list" element={<StudentList />} />
            <Route path="students/documents" element={<StudentDocuments />} />
            <Route path="students/loan-data" element={<LoanApplications />} />
            <Route path="students/create-loans" element={<CreateLoans />} />
            <Route path="students/scheme-data" element={<SchemeData />} />
            <Route path="students/verify-payments" element={<VerifyPayments />} />
            <Route path="students/payment-history" element={<PaymentHistory />} />

            <Route path="citizens/list" element={<CitizenList />} />
            <Route path="citizens/documents" element={<CitizenDocuments />} />

            <Route path="employees/list" element={<EmployeeList />} />
            <Route path="employees/documents" element={<EmployeeDocuments />} />
            <Route path="employees/wallet-requests" element={<WalletRequests />} />
            <Route path="employees/wallet-management" element={<EmployeeWalletManager />} />

            <Route path="support-policy" element={<SupportPolicy />} />
            <Route path="videos" element={<Videos />} />
            <Route path="banners" element={<Banners />} />
            <Route path="payment-settings" element={<PaymentSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;