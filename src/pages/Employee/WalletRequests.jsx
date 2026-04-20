// src/pages/Admin/WalletRequests.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  AlertCircle,
  DollarSign,
  PlusCircle,
  Download,
  Upload,
  Filter,
  Search,
  Users,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Send,
  X
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// 🔴 MOVE THIS ABOVE WalletRequests (outside)
const RejectModal = ({
  show,
  onClose,
  rejectReason,
  setRejectReason,
  handleReject,
  updating,
  error
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-md border border-gray-700 shadow-xl">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Reject Request</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            autoFocus
            className="w-full h-24 p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
            placeholder="Enter rejection reason..."
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 bg-gray-700 rounded-lg">
              Cancel
            </button>

            <button
              onClick={handleReject}
              disabled={updating}
              className="flex-1 py-2 bg-red-500 rounded-lg text-white"
            >
              {updating ? "Processing..." : "Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WalletRequests = () => {
  const [activeTab, setActiveTab] = useState("pending"); // pending, approved, rejected, all
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rejectError, setRejectError] = useState("");
  const [stats, setStats] = useState({
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
    pending_add_amount: 0,
    pending_withdraw_amount: 0,
    total_added: 0,
    total_withdrawn: 0
  });

  // Fetch all wallet transactions
  const fetchAllRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/wallet/admin/all-requests`);
      console.log("All requests:", response.data);
      
      if (response.data.success) {
        setRequests(response.data.requests);
      } else {
        setError("Failed to fetch requests");
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.response?.data?.error || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wallet/admin/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchAllRequests();
    fetchStats();
  }, []);

  // Filter requests based on tab, search, and type
  useEffect(() => {
    let filtered = [...requests];
    
    // Filter by status based on active tab
    if (activeTab === "pending") {
      filtered = filtered.filter(req => req.status === "PENDING");
    } else if (activeTab === "approved") {
      filtered = filtered.filter(req => req.status === "APPROVED");
    } else if (activeTab === "rejected") {
      filtered = filtered.filter(req => req.status === "REJECTED");
    }
    // "all" shows everything
    
    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(req => req.type === typeFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(req => 
        req.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.utr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.bank_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.account_holder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.upi_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRequests(filtered);
  }, [requests, activeTab, searchTerm, typeFilter]);

  // Update request status (Approve/Reject)
  const updateRequestStatus = async (requestId, status, rejectReason = null) => {
    setUpdating(true);
    setError("");
    
    try {
      const payload = { status };
      if (status === "REJECTED" && rejectReason) {
        payload.reject_reason = rejectReason;
      }
      
      const response = await axios.put(`${API_BASE_URL}/wallet/admin/update/${requestId}`, payload);
      
      if (response.data.msg) {
        setSuccessMessage(`Request ${status.toLowerCase()} successfully!`);
        fetchAllRequests();
        fetchStats();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error updating request:", err);
      setError(err.response?.data?.error || "Failed to update request");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdating(false);
    }
  };

 const openRejectModal = (request) => {
  setSelectedRequest(request);
  setRejectReason("");
  setShowRejectModal(true);
};
const handleReject = async () => {
  if (!selectedRequest) return;

  if (!rejectReason.trim()) {
    setRejectError("Please provide a rejection reason");
    return;
  }

  setRejectError(""); // clear

  await updateRequestStatus(
    selectedRequest.id,
    "REJECTED",
    rejectReason
  );

  setShowRejectModal(false);
  setSelectedRequest(null);
  setRejectReason("");
};

  // View request details
  const viewDetails = (request) => {
    setSelectedRequest(request);
  };

  const closeDetails = () => {
    setSelectedRequest(null);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case "PENDING":
        return { color: "bg-yellow-500/20 text-yellow-400", icon: Clock, label: "Pending" };
      case "APPROVED":
        return { color: "bg-green-500/20 text-green-400", icon: CheckCircle, label: "Approved" };
      case "REJECTED":
        return { color: "bg-red-500/20 text-red-400", icon: XCircle, label: "Rejected" };
      default:
        return { color: "bg-gray-500/20 text-gray-400", icon: Clock, label: status };
    }
  };

 

  // Get type badge
  const getTypeBadge = (type) => {
    if (type === "ADD") {
      return { color: "bg-blue-500/20 text-blue-400", icon: PlusCircle, label: "Add Money" };
    } else {
      return { color: "bg-purple-500/20 text-purple-400", icon: Download, label: "Withdraw" };
    }
  };

  // Details Modal
  const DetailsModal = () => {
    if (!selectedRequest) return null;
    
    const method = selectedRequest?.payment_method?.toLowerCase(); 

    const StatusBadge = getStatusBadge(selectedRequest.status);
    const TypeBadge = getTypeBadge(selectedRequest.type);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={closeDetails}>
        <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Request Details</h2>
            <button onClick={closeDetails} className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {/* User Info */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">User Information</h3>
              <div className="space-y-2">
                <p className="text-white">
                  <span className="text-gray-400">Name:</span> {selectedRequest.full_name}
                </p>
                <p className="text-white">
                  <span className="text-gray-400">Email:</span> {selectedRequest.email}
                </p>
                <p className="text-white">
                  <span className="text-gray-400">Phone:</span> {selectedRequest.phone_number}
                </p>
                {selectedRequest.employee_id && (
                  <p className="text-white">
                    <span className="text-gray-400">Employee ID:</span> {selectedRequest.employee_id}
                  </p>
                )}
              </div>
            </div>
            
            {/* Request Info */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Request ID</p>
                <p className="text-white font-mono">#{selectedRequest.id}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${TypeBadge.color}`}>
                  <TypeBadge.icon className="w-3 h-3" />
                  {TypeBadge.label}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${StatusBadge.color}`}>
                  <StatusBadge.icon className="w-3 h-3" />
                  {StatusBadge.label}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
              <p className="text-gray-400 text-sm">Amount</p>
              <p className="text-2xl font-bold text-amber-400">₹{parseFloat(selectedRequest.amount).toLocaleString()}</p>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
              <p className="text-gray-400 text-sm">Date & Time</p>
              <p className="text-white">{formatDate(selectedRequest.created_at)}</p>
            </div>

            {selectedRequest.type === "WITHDRAW" && (
  <div className="border-t border-gray-700 pt-4 space-y-3">
    <p className="text-gray-400 text-sm">Payment Method</p>
    <p className="text-white font-semibold uppercase">
      {selectedRequest.payment_method}
    </p>

    {/* BANK DETAILS */}
    {method === "bank" && (
      <>
        <div>
          <p className="text-gray-400 text-sm">Bank Name</p>
          <p className="text-white">{selectedRequest.bank_name}</p>
        </div>

        <div>
          <p className="text-gray-400 text-sm">Account Holder</p>
          <p className="text-white">{selectedRequest.account_holder}</p>
        </div>

        <div>
          <p className="text-gray-400 text-sm">IFSC Code</p>
          <p className="text-white font-mono">{selectedRequest.ifsc_code}</p>
        </div>
      </>
    )}

    {/* UPI DETAILS */}
    {method === "upi" && (
      <div>
        <p className="text-gray-400 text-sm">UPI ID</p>
        <p className="text-white">{selectedRequest.upi_id}</p>
      </div>
    )}
  </div>
)}
            
            {selectedRequest.type === "ADD" && (
              <>
                {selectedRequest.utr && (
                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-gray-400 text-sm">UTR Number</p>
                    <p className="text-white font-mono">{selectedRequest.utr}</p>
                  </div>
                )}
                {selectedRequest.note && (
                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-gray-400 text-sm">Note</p>
                    <p className="text-white">{selectedRequest.note}</p>
                  </div>
                )}
               {selectedRequest.screenshot && (
  <div className="border-t border-gray-700 pt-4">
    <p className="text-gray-400 text-sm mb-2">Screenshot</p>
    <img 
      src={`data:image/jpeg;base64,${btoa(
        new Uint8Array(selectedRequest.screenshot.data)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      )}`}
      alt="Payment Screenshot"
      className="max-w-full rounded-lg border border-gray-600 cursor-pointer"
    />
  </div>
)}
              </>
            )}
            
        
            
            {selectedRequest.status === "REJECTED" && selectedRequest.reject_reason && (
              <div className="border-t border-gray-700 pt-4">
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Rejection Reason
                </p>
                <p className="text-red-400 bg-red-500/10 p-3 rounded-lg mt-1">
                  {selectedRequest.reject_reason}
                </p>
              </div>
            )}
            
            {/* Action Buttons for Pending Requests */}
            {selectedRequest.status === "PENDING" && (
              <div className="border-t border-gray-700 pt-4 flex gap-3">
                <button
                  onClick={() => {
                    updateRequestStatus(selectedRequest.id, "APPROVED");
                    closeDetails();
                  }}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    closeDetails();
                    openRejectModal(selectedRequest);
                  }}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 animate-fade-in">
            <p className="text-green-400 text-center">{successMessage}</p>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-transparent p-4 md:p-6 rounded-2xl border border-amber-500/20">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400">Wallet Request Management</h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">Manage and process all user wallet add and withdrawal requests</p>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending_count}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400/50" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <span className="text-yellow-400">₹{stats.pending_add_amount.toLocaleString()}</span> Add | 
              <span className="text-purple-400"> ₹{stats.pending_withdraw_amount.toLocaleString()}</span> Withdraw
            </div>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approved Requests</p>
                <p className="text-2xl font-bold text-green-400">{stats.approved_count}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400/50" />
            </div>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejected Requests</p>
                <p className="text-2xl font-bold text-red-400">{stats.rejected_count}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400/50" />
            </div>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Processed</p>
                <p className="text-2xl font-bold text-amber-400">
                  ₹{(stats.total_added - stats.total_withdrawn).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-400/50" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <span className="text-green-400">+₹{stats.total_added.toLocaleString()}</span> | 
              <span className="text-red-400"> -₹{stats.total_withdrawn.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, UTR, bank, or UPI ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-amber-500 text-gray-100"
            />
          </div>
          
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-amber-500 text-gray-100 appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="ADD">Add Money</option>
              <option value="WITHDRAW">Withdrawals</option>
            </select>
          </div>
          
          <button
            onClick={() => {
              fetchAllRequests();
              fetchStats();
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "all"
                ? "text-amber-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              All Requests
              <span className="bg-gray-600/50 px-2 py-0.5 rounded-full text-xs">
                {requests.length}
              </span>
            </div>
            {activeTab === "all" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "pending"
                ? "text-yellow-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
              {stats.pending_count > 0 && (
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs">
                  {stats.pending_count}
                </span>
              )}
            </div>
            {activeTab === "pending" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 rounded-full"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "approved"
                ? "text-green-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved
            </div>
            {activeTab === "approved" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 rounded-full"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "rejected"
                ? "text-red-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected
            </div>
            {activeTab === "rejected" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400 rounded-full"></div>
            )}
          </button>
        </div>
        
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading requests...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Requests Table */}
            {filteredRequests.length === 0 ? (
              <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gray-700/50 flex items-center justify-center mb-4">
                    <DollarSign className="w-10 h-10 text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-lg">No {activeTab} requests found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {activeTab === "pending" && "All pending requests will appear here"}
                    {activeTab === "approved" && "No approved requests to show"}
                    {activeTab === "rejected" && "No rejected requests to show"}
                    {activeTab === "all" && "No requests found"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredRequests.map((request) => {
                        const StatusBadge = getStatusBadge(request.status);
                        const TypeBadge = getTypeBadge(request.type);
                        return (
                          <tr key={request.id} className="hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">#{request.id}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div>
                                <p className="text-white font-medium">{request.full_name}</p>
                                <p className="text-gray-400 text-xs">{request.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${TypeBadge.color}`}>
                                <TypeBadge.icon className="w-3 h-3" />
                                {TypeBadge.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-amber-400">
                              ₹{parseFloat(request.amount).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${StatusBadge.color}`}>
                                <StatusBadge.icon className="w-3 h-3" />
                                {StatusBadge.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 hidden md:table-cell">
                              {formatDate(request.created_at)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => viewDetails(request)}
                                  className="p-1.5 hover:bg-amber-500/20 rounded-lg transition-colors group"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4 text-gray-400 group-hover:text-amber-400" />
                                </button>
                                {request.status === "PENDING" && (
                                  <>
                                    <button
                                      onClick={() => updateRequestStatus(request.id, "APPROVED")}
                                      disabled={updating}
                                      className="p-1.5 hover:bg-green-500/20 rounded-lg transition-colors group"
                                      title="Approve"
                                    >
                                      <CheckCircle className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
                                    </button>
                                    <button
                                      onClick={() => openRejectModal(request)}
                                      disabled={updating}
                                      className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors group"
                                      title="Reject"
                                    >
                                      <XCircle className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modals */}
     <RejectModal
  show={showRejectModal}
  onClose={() => {
  setShowRejectModal(false);
  setRejectError("");
  setRejectReason(""); // ✅ add this
}}
  rejectReason={rejectReason}
  setRejectReason={setRejectReason}
  handleReject={handleReject}
  updating={updating}
  error={rejectError}
/>
      {selectedRequest && !showRejectModal && <DetailsModal />}
    </div>
  );
};

export default WalletRequests;