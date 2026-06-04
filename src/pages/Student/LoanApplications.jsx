import React, { useState, useEffect } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  FileText,
  DollarSign,
  Users,
  X,
  Download,
  Building,
  CreditCard,
  User,
  Calendar,
  AlertCircle
} from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LoanApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [selectedAppEMIs, setSelectedAppEMIs] = useState([]);
  const [loadingEMIs, setLoadingEMIs] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE}/schemes/applications`);
      if (response.data.success) {
        setApplications(response.data.data || []);
      } else {
        setError("Failed to load applications.");
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to fetch applications from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (selectedApp && (selectedApp.status === "Approved" || selectedApp.status === "Disbursed")) {
      setLoadingEMIs(true);
      axios.get(`${API_BASE}/schemes/repayment/schedule/${selectedApp.user_id}`)
        .then(res => {
          if (res.data.success) {
            setSelectedAppEMIs(res.data.schedule || []);
          } else {
            setSelectedAppEMIs([]);
          }
        })
        .catch(err => {
          console.error("Error fetching EMIs in admin:", err);
          setSelectedAppEMIs([]);
        })
        .finally(() => {
          setLoadingEMIs(false);
        });
    } else {
      setSelectedAppEMIs([]);
    }
  }, [selectedApp]);

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.put(`${API_BASE}/schemes/applications/${id}/status`, { status });
      if (response.data.success) {
        setSuccessMessage(`Application status updated to ${status} successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchApplications();
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp(prev => ({ ...prev, status }));
        }
      } else {
        setError("Action failed. Try again.");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error updating application:", err);
      setError("Failed to update status.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const name = app.full_name || "";
    const email = app.email || "";
    const scheme = app.scheme_name || "";
    const id = String(app.id || "");

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || app.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "disbursed":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 flex items-center gap-1 w-fit">
            <CheckCircle size={12} /> Disbursed
          </span>
        );
      case "approved":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 flex items-center gap-1 w-fit">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case "verified":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 flex items-center gap-1 w-fit">
            <CheckCircle size={12} /> Docs Verified
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 flex items-center gap-1 w-fit">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 flex items-center gap-1 w-fit">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status?.toLowerCase() === "pending" || !a.status).length,
    verified: applications.filter(a => a.status?.toLowerCase() === "verified").length,
    approved: applications.filter(a => a.status?.toLowerCase() === "approved").length,
    disbursed: applications.filter(a => a.status?.toLowerCase() === "disbursed").length,
    rejected: applications.filter(a => a.status?.toLowerCase() === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Alerts */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4">
            <p className="text-green-400 text-center font-medium">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
            <p className="text-red-400 text-center font-medium">{error}</p>
          </div>
        )}

        {/* Heading */}
        <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-transparent p-6 rounded-2xl border border-amber-500/20">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400">Scheme Applications Verification</h1>
          <p className="text-gray-400 text-sm mt-1">Verify and manage student scheme applications with pre-verified document support</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Applications</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Verification</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Documents Verified</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{stats.verified}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approved & Disbursed</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{stats.approved + stats.disbursed}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejected Applications</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{stats.rejected}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name, email, scheme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-amber-500 text-gray-100 placeholder-gray-500"
              />
            </div>
            
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-amber-500 text-gray-100 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified Documents</option>
                <option value="approved">Approved</option>
                <option value="disbursed">Disbursed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={fetchApplications}
            className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border border-gray-600"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>

        {/* Main Table */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">App ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Student Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Scheme Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Requested Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tenure</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly EMI</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 bg-gray-800/20">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center px-4 py-8">
                      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-400 text-sm">Loading applications...</p>
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center px-4 py-12 text-gray-400">
                      No scheme applications found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-amber-400">
                        PSWB-{app.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm font-semibold text-white">{app.full_name || "N/A"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{app.email || "N/A"}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                        {app.scheme_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-emerald-400">
                        ₹{parseFloat(app.requested_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {app.tenure_months} Months
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-400">
                        ₹{parseFloat(app.monthly_emi || 0).toLocaleString()}/mo
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-amber-400 transition-colors cursor-pointer border border-gray-600"
                            title="Verify Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, "Approved")}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors cursor-pointer border border-emerald-500/20"
                            title="Approve Application"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, "Rejected")}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer border border-red-500/20"
                            title="Reject Application"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-4xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-amber-400">Verify Scheme Application</h2>
                  <p className="text-gray-400 text-sm mt-1">Application Ref ID: PSWB-{selectedApp.id}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Scheme & Repayment */}
                <div>
                  <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                    <DollarSign size={16} className="text-amber-400" /> Repayment Plan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-700">
                      <span className="text-xs text-gray-400 uppercase">Scheme Name</span>
                      <p className="text-white font-bold mt-1 text-sm">{selectedApp.scheme_name}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-700">
                      <span className="text-xs text-gray-400 uppercase">Requested Amount</span>
                      <p className="text-emerald-400 font-bold mt-1 text-sm">₹{parseFloat(selectedApp.requested_amount || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-700">
                      <span className="text-xs text-gray-400 uppercase">Tenure & Monthly EMI</span>
                      <p className="text-blue-400 font-bold mt-1 text-sm">{selectedApp.tenure_months} Months / ₹{parseFloat(selectedApp.monthly_emi || 0).toLocaleString()}/mo</p>
                    </div>
                  </div>
                </div>

                {/* Bank Disbursement Card */}
                <div>
                  <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                    <Building size={16} className="text-amber-400" /> Disbursement Bank Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-700">
                      <span className="text-xs text-gray-400 uppercase">Bank Name</span>
                      <p className="text-white font-semibold mt-1 text-sm">{selectedApp.bank_name}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-700">
                      <span className="text-xs text-gray-400 uppercase">Account Number</span>
                      <p className="text-white font-mono mt-1 text-sm">{selectedApp.account_number}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-700">
                      <span className="text-xs text-gray-400 uppercase">IFSC Code</span>
                      <p className="text-white font-mono mt-1 text-sm">{selectedApp.ifsc_code}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-700">
                      <span className="text-xs text-gray-400 uppercase">Account Holder</span>
                      <p className="text-white font-semibold mt-1 text-sm">{selectedApp.account_holder}</p>
                    </div>
                  </div>
                </div>

                {/* Student Info */}
                <div>
                  <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                    <User size={16} className="text-amber-400" /> Student Profile Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-700">
                      <span className="text-xs text-gray-400 uppercase">Student Name</span>
                      <p className="text-white font-semibold mt-1 text-sm">{selectedApp.full_name}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-700">
                      <span className="text-xs text-gray-400 uppercase">Email ID</span>
                      <p className="text-white font-semibold mt-1 text-sm">{selectedApp.email}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-700">
                      <span className="text-xs text-gray-400 uppercase">Phone Number</span>
                      <p className="text-white font-semibold mt-1 text-sm">{selectedApp.phone_number || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Verification Document Attached */}
                <div>
                  <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-amber-400" /> Scheme Document Uploaded
                  </h3>
                  {selectedApp.document_name ? (
                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                          <FileText className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{selectedApp.document_name}</p>
                          <p className="text-xs text-gray-400 mt-1">Bootcamp/Admission Enrollment Proof</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewDoc({
                            name: selectedApp.document_name,
                            file: selectedApp.document_file
                          })}
                          className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-600 font-bold transition-colors cursor-pointer flex items-center gap-2 text-xs"
                        >
                          <Eye size={14} /> Preview Document
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-700/10 rounded-xl p-4 border border-gray-700 text-center">
                      <p className="text-gray-400 text-sm">No secondary scheme document attached</p>
                    </div>
                  )}
                </div>

                {/* EMI Repayments Timeline & History */}
                {selectedApp && (selectedApp.status === "Approved" || selectedApp.status === "Disbursed") && (
                  <div>
                    <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                      <Calendar size={16} className="text-amber-400" /> EMI Repayment Timeline & Activity Log
                    </h3>
                    {loadingEMIs ? (
                      <div className="bg-gray-700/10 rounded-xl p-6 border border-gray-700 text-center">
                        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-400 text-sm">Fetching student payment history...</p>
                      </div>
                    ) : selectedAppEMIs.length === 0 ? (
                      <div className="bg-gray-700/10 rounded-xl p-6 border border-gray-700 text-center">
                        <p className="text-gray-400 text-sm">No repayment schedule generated yet. Repayments will initialize automatically.</p>
                      </div>
                    ) : (
                      <div className="bg-gray-700/30 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto max-h-64">
                          <table className="min-w-full divide-y divide-gray-700 text-left">
                            <thead className="bg-gray-800/80">
                              <tr>
                                <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase">EMI #</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase">Amount</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase">Due Date</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase">Status</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase">Payment Date</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase">Txn ID / Method</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700 text-sm bg-gray-800/20">
                              {selectedAppEMIs.map((emi) => (
                                <tr key={emi.id} className="hover:bg-gray-700/20 transition-colors">
                                  <td className="px-4 py-2 font-mono text-amber-400 font-bold">
                                    EMI #{emi.emi_number}
                                  </td>
                                  <td className="px-4 py-2 font-semibold text-emerald-400">
                                    ₹{parseFloat(emi.amount).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-2 text-gray-300">
                                    {new Date(emi.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </td>
                                  <td className="px-4 py-2">
                                    {emi.status === 'Paid' ? (
                                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400">Paid</span>
                                    ) : emi.status === 'Overdue' ? (
                                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400">Overdue</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400">Pending</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-gray-400">
                                    {emi.paid_date ? new Date(emi.paid_date).toLocaleString('en-IN') : '-'}
                                  </td>
                                  <td className="px-4 py-2 text-xs text-gray-400 font-mono">
                                    {emi.transaction_id ? (
                                      <div>
                                        <p className="text-gray-200">{emi.transaction_id}</p>
                                        <p className="text-gray-400 text-[10px]">{emi.payment_method}</p>
                                      </div>
                                    ) : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="border-t border-gray-700 pt-6 flex justify-end gap-3 flex-wrap">
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer text-xs font-semibold text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(selectedApp.id, "Rejected");
                      setSelectedApp(null);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(selectedApp.id, "Verified");
                      setSelectedApp(null);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                  >
                    Verify Documents
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(selectedApp.id, "Approved");
                      setSelectedApp(null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(selectedApp.id, "Disbursed");
                      setSelectedApp(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                  >
                    Disburse Funds
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                <div>
                  <h3 className="text-md font-semibold text-white">{previewDoc.name}</h3>
                  <p className="text-gray-400 text-xs mt-1">Format: Image/PDF Verification scan</p>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 flex justify-center items-center min-h-[400px] max-h-[70vh] overflow-auto bg-gray-900/50">
                {previewDoc.file?.startsWith("data:image/") || !previewDoc.name.endsWith(".pdf") ? (
                  <img
                    src={previewDoc.file || "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80"}
                    alt={previewDoc.name}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg border border-gray-700"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <FileText size={64} className="mx-auto mb-4 text-amber-400 animate-pulse" />
                    <p className="font-semibold text-white">PDF Preview Emulated Successfully</p>
                    <p className="text-sm text-gray-400 mt-2">Filename: {previewDoc.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Size: 245 KB (Pre-verified)</p>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("File download simulated successfully!");
                      }}
                      className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20"
                    >
                      <Download size={14} /> Download Document Scan
                    </a>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-700 flex justify-end">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanApplications;
