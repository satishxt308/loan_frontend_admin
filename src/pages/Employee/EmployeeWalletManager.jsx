import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Coins,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  User,
  Users,
  DollarSign,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRightLeft,
  X,
  Check
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const EmployeeWalletManager = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  
  // Loading & Messages
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("direct"); // direct, bulk, history
  const [bulkTab, setBulkTab] = useState("daily"); // daily, monthly

  // Custom Direct Credit State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [directAmount, setDirectAmount] = useState("");
  const [directNote, setDirectNote] = useState("");
  const [showDirectModal, setShowDirectModal] = useState(false);

  // Bulk Credit State
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkNote, setBulkNote] = useState("");
  const [selectedBulkEmployees, setSelectedBulkEmployees] = useState([]);

  // Fetch all employees and transactions
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch employees
      const empRes = await axios.get(`${API_BASE_URL}/admin/employees`);
      if (empRes.data.success) {
        setEmployees(empRes.data.data);
        // Pre-select all employees for bulk operations
        setSelectedBulkEmployees(empRes.data.data.map(e => e.id));
      } else {
        setError("Failed to fetch employees");
      }

      // 2. Fetch history
      const histRes = await axios.get(`${API_BASE_URL}/wallet/admin/all-requests`);
      if (histRes.data.success) {
        // Filter history: only show transactions initiated by admin
        const adminTxns = histRes.data.requests.filter(
          (req) => req.utr && req.utr.startsWith("ADMIN-")
        );
        setHistory(adminTxns);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to load database content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter employees based on search
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredEmployees(employees);
    } else {
      setFilteredEmployees(
        employees.filter(
          (emp) =>
            emp.full_name?.toLowerCase().includes(term) ||
            emp.employee_id?.toLowerCase().includes(term) ||
            emp.phone?.toLowerCase().includes(term) ||
            emp.email?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, employees]);

  // Filter history based on search
  useEffect(() => {
    const term = historySearchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredHistory(history);
    } else {
      setFilteredHistory(
        history.filter(
          (item) =>
            item.full_name?.toLowerCase().includes(term) ||
            item.employee_id?.toLowerCase().includes(term) ||
            item.utr?.toLowerCase().includes(term) ||
            item.note?.toLowerCase().includes(term)
        )
      );
    }
  }, [historySearchTerm, history]);

  // Direct Credit submission handler
  const handleDirectCreditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !directAmount || parseFloat(directAmount) <= 0) {
      setError("Please select employee and enter a valid amount");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${API_BASE_URL}/wallet/admin/credit-individual`, {
        userId: selectedEmployee.id,
        amount: parseFloat(directAmount),
        note: directNote.trim() || "Direct Credit from Admin"
      });

      if (response.data.success) {
        setSuccess(`Successfully credited ₹${directAmount} to ${selectedEmployee.full_name}'s wallet.`);
        setDirectAmount("");
        setDirectNote("");
        setShowDirectModal(false);
        setSelectedEmployee(null);
        await fetchData(); // Refresh data
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(response.data.msg || "Failed to complete credit");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk Credit submission handler
  const handleBulkCreditSubmit = async (e) => {
    e.preventDefault();
    if (!bulkAmount || parseFloat(bulkAmount) <= 0) {
      setError("Please enter a valid bulk credit amount");
      return;
    }
    if (selectedBulkEmployees.length === 0) {
      setError("Please select at least one employee for the bulk credit");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      employeeIds: selectedBulkEmployees,
      amount: parseFloat(bulkAmount),
      note: bulkNote.trim() || `Bulk ${bulkTab === 'daily' ? 'Daily' : 'Monthly'} Credit`,
      scheduleType: bulkTab
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/wallet/admin/credit-bulk`, payload);
      if (response.data.success) {
        setSuccess(`Successfully processed bulk credit of ₹${bulkAmount} to ${selectedBulkEmployees.length} employees.`);
        setBulkAmount("");
        setBulkNote("");
        await fetchData(); // Refresh data
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(response.data.msg || "Failed to process bulk credit");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Bulk credit transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectAllBulk = () => {
    if (selectedBulkEmployees.length === employees.length) {
      setSelectedBulkEmployees([]);
    } else {
      setSelectedBulkEmployees(employees.map(e => e.id));
    }
  };

  const handleToggleBulkEmployee = (id) => {
    if (selectedBulkEmployees.includes(id)) {
      setSelectedBulkEmployees(selectedBulkEmployees.filter(item => item !== id));
    } else {
      setSelectedBulkEmployees([...selectedBulkEmployees, id]);
    }
  };

  // Format date utility
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

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6 text-gray-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner Headers */}
        <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-transparent p-6 rounded-2xl border border-amber-500/20">
          <div className="flex items-center gap-3">
            <Coins className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-amber-400">Employee Wallet Manager</h1>
              <p className="text-gray-400 text-sm md:text-base mt-1">
                Directly fund employee wallets, trigger bulk daily allowances, or monthly salaries.
              </p>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-center gap-3 animate-pulse">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Main Tab Controls */}
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => {
              setActiveTab("direct");
              setError("");
              setSuccess("");
            }}
            className={`px-6 py-3 font-semibold transition-all duration-200 relative flex items-center gap-2 ${
              activeTab === "direct" ? "text-amber-400" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <User className="w-4 h-4" />
            Direct Credit
            {activeTab === "direct" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("bulk");
              setError("");
              setSuccess("");
            }}
            className={`px-6 py-3 font-semibold transition-all duration-200 relative flex items-center gap-2 ${
              activeTab === "bulk" ? "text-amber-400" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Bulk Operations
            {activeTab === "bulk" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("history");
              setError("");
              setSuccess("");
            }}
            className={`px-6 py-3 font-semibold transition-all duration-200 relative flex items-center gap-2 ${
              activeTab === "history" ? "text-amber-400" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Credit History
            {activeTab === "history" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"></span>
            )}
          </button>
        </div>

        {/* LOADING ANIMATION */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading wallet systems...</p>
            </div>
          </div>
        ) : (
          <>
            {/* TAB 1: DIRECT CREDIT */}
            {activeTab === "direct" && (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employee by name, ID, phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-amber-500 text-gray-100 text-sm"
                    />
                  </div>
                  <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                {/* Employees Table */}
                {filteredEmployees.length === 0 ? (
                  <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-12 text-center">
                    <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No active employees found</p>
                  </div>
                ) : (
                  <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800/80">
                          <tr>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee ID</th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone / Email</th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Wallet Balance</th>
                            <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {filteredEmployees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-gray-800/30 transition-all duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400 font-bold text-sm">
                                    {emp.full_name?.charAt(0).toUpperCase() || "E"}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-white">{emp.full_name}</p>
                                    <span className="text-xs text-gray-500">Employee Account</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                                {emp.employee_id || "PENDING VERIFICATION"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                <div>{emp.phone}</div>
                                <div className="text-xs text-gray-500">{emp.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-400">
                                ₹{parseFloat(emp.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setSelectedEmployee(emp);
                                    setShowDirectModal(true);
                                  }}
                                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  Add Money
                                </button>
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

            {/* TAB 2: BULK OPERATIONS */}
            {activeTab === "bulk" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Forms column */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Select Bulk Template */}
                  <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 space-y-4">
                    <h2 className="text-md font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Select Template Type
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBulkTab("daily")}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                          bulkTab === "daily"
                            ? "bg-amber-500 text-gray-900"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        Daily Allowance
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkTab("monthly")}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                          bulkTab === "monthly"
                            ? "bg-amber-500 text-gray-900"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        Monthly Salary
                      </button>
                    </div>
                  </div>

                  {/* Bulk operation inputs */}
                  <form onSubmit={handleBulkCreditSubmit} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 space-y-4">
                    <h2 className="text-md font-bold text-amber-400 capitalize">
                      {bulkTab} Credit Form
                    </h2>
                    
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-400">
                        Amount to Credit per Employee (₹)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={bulkAmount}
                          onChange={(e) => setBulkAmount(e.target.value)}
                          placeholder="e.g. 500"
                          min="1"
                          required
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500 text-white placeholder-gray-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-400">
                        Transaction Note / Purpose
                      </label>
                      <textarea
                        value={bulkNote}
                        onChange={(e) => setBulkNote(e.target.value)}
                        placeholder={
                          bulkTab === "daily"
                            ? "Daily Allowance credit"
                            : "Monthly Salary credit"
                        }
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-amber-500 text-white placeholder-gray-500 text-sm h-20 resize-none"
                      />
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 text-xs text-gray-400 space-y-1">
                      <p className="font-semibold text-amber-400">Operational Summary:</p>
                      <p>Recipient Count: <span className="text-white font-bold">{selectedBulkEmployees.length}</span></p>
                      <p>Credit per person: <span className="text-white font-bold">₹{parseFloat(bulkAmount || 0).toLocaleString()}</span></p>
                      <p className="border-t border-gray-700 pt-1 mt-1 text-sm">
                        Total Outflow: <span className="text-amber-400 font-bold">₹{parseFloat((bulkAmount || 0) * selectedBulkEmployees.length).toLocaleString()}</span>
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || selectedBulkEmployees.length === 0}
                      className="w-full cursor-pointer flex items-center justify-center gap-2 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 text-gray-900 disabled:text-gray-400 rounded-lg font-bold transition-colors text-sm"
                    >
                      {submitting ? "Processing credits..." : `Confirm & Fund ${selectedBulkEmployees.length} Wallets`}
                    </button>
                  </form>
                </div>

                {/* Right Selector Column */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 space-y-4 flex flex-col h-full max-h-[600px]">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                      <div>
                        <h2 className="text-md font-bold text-white">Target Employees</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Toggle checkboxes to include or exclude employees.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSelectAllBulk}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300"
                      >
                        {selectedBulkEmployees.length === employees.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: "thin" }}>
                      {employees.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">No employees registered yet</p>
                      ) : (
                        employees.map((emp) => {
                          const isSelected = selectedBulkEmployees.includes(emp.id);
                          return (
                            <div
                              key={emp.id}
                              onClick={() => handleToggleBulkEmployee(emp.id)}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15"
                                  : "bg-gray-900/40 border-gray-800 hover:bg-gray-800/20"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all duration-150 ${
                                  isSelected ? "bg-amber-500 border-amber-500 text-gray-900" : "border-gray-600"
                                }`}>
                                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white">{emp.full_name}</p>
                                  <span className="text-xs text-gray-500 font-mono">
                                    {emp.employee_id || "ID Pending"} · Wallet: ₹{parseFloat(emp.wallet_balance || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-gray-400">{emp.phone}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CREDIT HISTORY */}
            {activeTab === "history" && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search history by name, ID, UTR or note..."
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-amber-500 text-gray-100 text-sm"
                    />
                  </div>
                  <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                {/* History Table */}
                {filteredHistory.length === 0 ? (
                  <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-12 text-center">
                    <ArrowRightLeft className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No admin-initiated transactions found</p>
                  </div>
                ) : (
                  <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800/80">
                          <tr>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type / Source</th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Transaction ID / UTR</th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Note</th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {filteredHistory.map((item) => {
                            const isBulk = item.utr?.includes("-BULK-");
                            return (
                              <tr key={item.id} className="hover:bg-gray-800/30 transition-all duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <p className="text-sm font-semibold text-white">{item.full_name}</p>
                                    <span className="text-xs text-gray-500 font-mono">{item.employee_id || "ID Pending"}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                    isBulk ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  }`}>
                                    {isBulk ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                    {isBulk ? "Bulk Admin Credit" : "Direct Admin Credit"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                  {item.utr}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">
                                  +₹{parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                                  {item.note}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(item.created_at)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* DIRECT CREDIT MODAL */}
      {showDirectModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-white">Manual Wallet Deposit</h2>
                <p className="text-xs text-gray-400 mt-0.5">Credit balance to employee account</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDirectModal(false);
                  setSelectedEmployee(null);
                  setDirectAmount("");
                  setDirectNote("");
                }}
                className="p-1 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleDirectCreditSubmit}>
              <div className="p-5 space-y-4">
                {/* Employee Details Summary */}
                <div className="bg-gray-900/60 rounded-xl p-3.5 border border-gray-700/50 space-y-1">
                  <span className="text-xs text-gray-500">TARGET ACCOUNT</span>
                  <p className="text-sm font-semibold text-white">{selectedEmployee.full_name}</p>
                  <div className="flex justify-between text-xs text-gray-400 font-mono mt-1">
                    <span>ID: {selectedEmployee.employee_id || "N/A"}</span>
                    <span className="text-amber-400">Current Bal: ₹{parseFloat(selectedEmployee.wallet_balance || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Amount input */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-400">Amount (₹)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={directAmount}
                      onChange={(e) => setDirectAmount(e.target.value)}
                      placeholder="Enter credit amount (e.g. 1000)"
                      min="1"
                      required
                      autoFocus
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500 text-white placeholder-gray-500 text-sm"
                    />
                  </div>
                </div>

                {/* Note input */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-400">Reason / Reference Note</label>
                  <textarea
                    value={directNote}
                    onChange={(e) => setDirectNote(e.target.value)}
                    placeholder="Enter manual credit reason..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-amber-500 text-white placeholder-gray-500 text-sm h-20 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 border-t border-gray-700 bg-gray-900/30 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDirectModal(false);
                    setSelectedEmployee(null);
                    setDirectAmount("");
                    setDirectNote("");
                  }}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 text-gray-900 disabled:text-gray-400 font-bold text-sm transition-colors cursor-pointer"
                >
                  {submitting ? "Processing..." : "Confirm Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeWalletManager;
