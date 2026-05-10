// admin/src/pages/GuardiansData.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, RefreshCw, Users, Phone, Mail, User, GraduationCap, Briefcase, AlertCircle, MapPin, CreditCard, Calendar, IdCard } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function GuardiansData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/guardians/data`);
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch guardians data");
      setTimeout(() => setError(""), 3000);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/guardians/status/${id}`, { status });
      setSuccessMessage(`Guardian ${status} successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to update status");
      setTimeout(() => setError(""), 3000);
    }
  };

  const stats = {
    total: data.length,
    approved: data.filter(item => item.status === "approved").length,
    rejected: data.filter(item => item.status === "rejected").length,
    pending: data.filter(item => !item.status || item.status === "pending").length,
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-3 text-sm underline">Dismiss</button>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-500/20 to-amber-500/5 rounded-xl p-6 mb-6 border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Guardians Management</h1>
              <p className="text-gray-400">Manage guardian verifications and approvals</p>
            </div>
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Guardians</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <div className="overflow-y-auto h-full max-h-[calc(100vh-300px)]">
            <table className="w-full min-w-[1400px]">
              <thead className="bg-gray-700/50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Guardian ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Guardian Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Relation</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Occupation</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Aadhaar</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">PAN</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Address</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Student ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Created At</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Updated At</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="17" className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan="17" className="text-center py-8 text-gray-400">
                      No guardians found
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={item.guardian_id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-300">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-mono text-amber-400">{item.guardian_id}</td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{item.guardian_name || "N/A"}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-500" />
                          {item.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-500" />
                          {item.phone || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                          {item.relation || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-gray-500" />
                          {item.occupation || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-300">
                        <div className="flex items-center gap-1">
                          <IdCard className="w-3 h-3 text-gray-500" />
                          {item.aadhaar_number || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-300">
                        {item.pan_number || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <span className="truncate max-w-[150px]" title={item.address}>
                            {item.address || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {item.student_name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-300">
                        {item.student_id || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {item.employee_name || "Not assigned"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {new Date(item.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : item.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {item.status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateStatus(item.guardian_id, "approved")}
                            className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(item.guardian_id, "rejected")}
                            className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
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
      </div>

      {/* Footer Stats */}
      {!loading && data.length > 0 && (
        <div className="mt-4 bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
            <span className="text-gray-400">Total Guardians: <span className="text-amber-400 font-semibold">{stats.total}</span></span>
            <span className="text-gray-400">
              Pending: <span className="text-yellow-400 font-semibold">{stats.pending}</span> | 
              Approved: <span className="text-green-400 font-semibold">{stats.approved}</span> | 
              Rejected: <span className="text-red-400 font-semibold">{stats.rejected}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}