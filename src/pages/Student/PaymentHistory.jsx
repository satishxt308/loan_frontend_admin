import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  RefreshCw,
  Search,
  ChevronRight,
  History,
  FileText,
  User,
  Hash,
  Calendar,
  CreditCard,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

/* ─────────────────────────────────────────
   HELPER: Format date nicely
   ───────────────────────────────────────── */
const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ─────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────── */
export default function PaymentHistory() {
  const [inflow, setInflow] = useState([]);
  const [outflow, setOutflow] = useState([]);
  const [stats, setStats] = useState({
    totalInflow: 0,
    totalOutflow: 0,
    pendingInflow: 0,
    rejectedInflow: 0,
    netCashflow: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigation tabs: 'inflow' or 'outflow'
  const [activeTab, setActiveTab] = useState("inflow");
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/payment/admin/history`);
      if (res.data.success) {
        setInflow(res.data.inflow || []);
        setOutflow(res.data.outflow || []);
        setStats(res.data.stats || {
          totalInflow: 0,
          totalOutflow: 0,
          pendingInflow: 0,
          rejectedInflow: 0,
          netCashflow: 0
        });
      } else {
        setError("Failed to load payment history.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Server error. Please retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtering Logic
  const filteredInflow = inflow.filter((item) => {
    const matchesSearch =
      item.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.utr?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "emi" && !!item.emi_id) ||
      (typeFilter === "reg" && !item.emi_id);

    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredOutflow = outflow.filter((item) => {
    const matchesSearch =
      item.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.scheme_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bank_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.account_number?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 p-6 text-gray-100">
      
      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span>Student</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-amber-400">Payment History</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-500/30 flex items-center justify-center shadow-lg">
              <History className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">System Cashbook</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Monitor money flow: all student deposits (inflow) and scheme disbursements (outflow)
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-300 hover:text-white text-sm transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Summary Grid ── */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-8">
        {/* Total Inflow */}
        <div className="relative bg-gray-800/40 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-5 overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <ArrowUpRight className="w-20 h-20 text-emerald-400" />
          </div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Total Money Inflow</p>
          <h2 className="text-3xl font-bold text-emerald-400 mt-2">
            ₹{stats.totalInflow.toLocaleString("en-IN")}
          </h2>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <span className="text-emerald-500 font-semibold">✓ Cash In</span>
            <span>from repayments &amp; fees</span>
          </div>
        </div>

        {/* Total Outflow */}
        <div className="relative bg-gray-800/40 backdrop-blur-sm border border-red-500/20 rounded-2xl p-5 overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <ArrowDownLeft className="w-20 h-20 text-red-400" />
          </div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Total Money Outflow</p>
          <h2 className="text-3xl font-bold text-red-400 mt-2">
            ₹{stats.totalOutflow.toLocaleString("en-IN")}
          </h2>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <span className="text-red-500 font-semibold">⬇ Cash Out</span>
            <span>via scheme disbursements</span>
          </div>
        </div>

        {/* Net Flow Balance */}
        <div className={`relative bg-gray-800/40 backdrop-blur-sm border rounded-2xl p-5 overflow-hidden group ${
          stats.netCashflow >= 0 ? "border-amber-500/20" : "border-red-500/20"
        }`}>
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <DollarSign className="w-20 h-20 text-amber-400" />
          </div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Net System Cashflow</p>
          <h2 className={`text-3xl font-bold mt-2 ${
            stats.netCashflow >= 0 ? "text-amber-400" : "text-red-400"
          }`}>
            {stats.netCashflow >= 0 ? "+" : ""}₹{stats.netCashflow.toLocaleString("en-IN")}
          </h2>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <span className={`${stats.netCashflow >= 0 ? "text-amber-500" : "text-red-500"} font-semibold`}>
              {stats.netCashflow >= 0 ? "Surplus" : "Deficit"}
            </span>
            <span>Net System Balance</span>
          </div>
        </div>

        {/* Pending Verification */}
        <div className="relative bg-gray-800/40 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-5 overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <Clock className="w-20 h-20 text-blue-400" />
          </div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Pending Review Total</p>
          <h2 className="text-3xl font-bold text-blue-400 mt-2">
            ₹{stats.pendingInflow.toLocaleString("en-IN")}
          </h2>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <span className="text-blue-500 font-semibold">⏳ Unverified</span>
            <span>awaiting admin approval</span>
          </div>
        </div>
      </div>

      {/* ── Main View Control Section ── */}
      <div className="bg-gray-800/20 border border-gray-700/60 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Table/List Filter Bar */}
        <div className="p-5 border-b border-gray-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-800/30">
          
          {/* Tabs */}
          <div className="flex bg-gray-900/60 p-1.5 rounded-2xl border border-gray-700/80 w-fit shrink-0">
            <button
              onClick={() => { setActiveTab("inflow"); setSearchQuery(""); }}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "inflow"
                  ? "bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Paisa Aaya (Inflow)
            </button>
            <button
              onClick={() => { setActiveTab("outflow"); setSearchQuery(""); }}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "outflow"
                  ? "bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              Paisa Gaya (Outflow)
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] md:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === "inflow" ? "Search UTR, name, id..." : "Search Bank, account, name..."}
                className="w-full bg-gray-900 border border-gray-700 focus:border-amber-500/60 focus:outline-none placeholder-gray-500 text-sm rounded-xl pl-10 pr-4 py-2.5 text-white transition-colors"
              />
            </div>

            {/* Filters (Inflow specific) */}
            {activeTab === "inflow" && (
              <>
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-900 border border-gray-700 text-gray-300 focus:border-amber-500/60 focus:outline-none text-sm rounded-xl px-4 py-2.5 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-gray-900 border border-gray-700 text-gray-300 focus:border-amber-500/60 focus:outline-none text-sm rounded-xl px-4 py-2.5 transition-colors"
                >
                  <option value="all">All Types</option>
                  <option value="emi">EMI Repayments</option>
                  <option value="reg">Registration Fees</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* ── Table Content Area ── */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
              <p className="text-gray-500 text-sm">Loading transactions history…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertCircle className="w-12 h-12 text-red-400" />
              <p className="text-red-400 font-medium">{error}</p>
              <button
                onClick={fetchData}
                className="px-5 py-2.5 bg-amber-500 text-gray-950 font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-amber-500/10"
              >
                Retry
              </button>
            </div>
          ) : activeTab === "inflow" ? (
            /* =========================================================
               INFLOW TABLE (PAYMENTS RECEIVED)
               ========================================================= */
            filteredInflow.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-500">
                <Banknote className="w-12 h-12 opacity-35" />
                <p className="text-sm font-medium">No matching inflow transactions found.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-900/40 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-700/60">
                    <th className="p-4 pl-6">Student Info</th>
                    <th className="p-4">Transaction UTR</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Scheme</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Via</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {filteredInflow.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/20 transition-all group">
                      {/* Student Info */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:border-amber-500/30 transition-colors">
                            <User className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-white">{item.full_name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.student_id || "No ID"}</p>
                          </div>
                        </div>
                      </td>

                      {/* UTR */}
                      <td className="p-4">
                        <span className="font-mono text-xs text-gray-300 bg-gray-900 border border-gray-700 px-2.5 py-1 rounded-lg">
                          {item.utr || "N/A"}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          item.emi_id 
                            ? "bg-violet-500/15 border-violet-500/30 text-violet-400" 
                            : "bg-blue-500/15 border-blue-500/30 text-blue-400"
                        }`}>
                          {item.emi_id ? <Layers className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                          {item.emi_id ? `EMI #${item.emi_number}` : "Reg Fee"}
                        </span>
                      </td>

                      {/* Loan Scheme */}
                      <td className="p-4">
                        <span className="text-sm text-gray-300 max-w-[200px] truncate block" title={item.scheme_name || "Registration Payment"}>
                          {item.scheme_name || "—"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-bold text-sm text-emerald-400">
                        ₹{(parseFloat(item.amount) || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Via */}
                      <td className="p-4 text-xs font-semibold text-gray-400 uppercase">
                        {item.via_payment?.replace("_", " ") || "UPI Manual"}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          item.status === "approved"
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : item.status === "rejected"
                            ? "bg-red-500/15 border-red-500/30 text-red-400"
                            : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                        }`}>
                          {item.status === "approved" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : item.status === "rejected" ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3 animate-pulse" />
                          )}
                          {item.status?.toUpperCase()}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 pr-6 text-xs text-gray-400">
                        {formatDate(item.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            /* =========================================================
               OUTFLOW TABLE (DISBURSEMENTS PAID)
               ========================================================= */
            filteredOutflow.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-500">
                <Banknote className="w-12 h-12 opacity-35" />
                <p className="text-sm font-medium">No disbursed transactions found.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-900/40 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-700/60">
                    <th className="p-4 pl-6">Student Info</th>
                    <th className="p-4">Scheme name</th>
                    <th className="p-4">Tenure</th>
                    <th className="p-4">Bank Details</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6">Disbursed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {filteredOutflow.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/20 transition-all group">
                      {/* Student Info */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:border-amber-500/30 transition-colors">
                            <User className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-white">{item.full_name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.student_id || "No ID"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Scheme Name */}
                      <td className="p-4">
                        <span className="text-sm font-medium text-gray-300">
                          {item.scheme_name}
                        </span>
                      </td>

                      {/* Tenure */}
                      <td className="p-4 text-xs text-gray-400">
                        {item.tenure_months} Months
                      </td>

                      {/* Bank Details */}
                      <td className="p-4">
                        <div className="text-xs text-gray-400 space-y-0.5">
                          <p className="font-medium text-gray-200">{item.bank_name}</p>
                          <p className="font-mono text-gray-400">A/C: {item.account_number}</p>
                          <p className="text-[10px] text-gray-500">{item.account_holder} ({item.ifsc_code})</p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-bold text-sm text-red-400">
                        ₹{(parseFloat(item.amount) || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-500/15 border-blue-500/30 text-blue-400 uppercase">
                          <CheckCircle className="w-3 h-3" />
                          {item.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 pr-6 text-xs text-gray-400">
                        {formatDate(item.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
}
