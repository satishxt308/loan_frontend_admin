// src/pages/Student/StudentDocuments.jsx
import React, { useState, useEffect } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  FileText,
  Users,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Image as ImageIcon,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  BookOpen,
  IdCard,
  GraduationCap,
  Briefcase,
  Heart,
  Home,
  CreditCard,
  Download,
} from "lucide-react";


const API_BASE = import.meta.env.VITE_API_URL;

// Application Details Modal
const ApplicationModal = ({ application, onClose, onUpdateStatus }) => {
  const [status, setStatus] = useState(application?.status || "pending");
  const [rejectReason, setRejectReason] = useState("");
  const [showReason, setShowReason] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!application) return null;

  const handleSubmit = async () => {
    if (status === "rejected" && !rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    setSubmitting(true);
    await onUpdateStatus(application.id, status, rejectReason);
    setSubmitting(false);
    onClose();
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
        <Icon size={18} /> {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );

  const InfoCard = ({ label, value, highlight = false }) => (
    <div className="bg-gray-700/30 rounded-lg p-3">
      <label className="text-xs text-gray-400 uppercase block mb-1">{label}</label>
      <p className={`${highlight ? "text-amber-400 font-semibold" : "text-white"} break-words`}>
        {value || "N/A"}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-4xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Application Details</h2>
              <p className="text-gray-400 text-sm mt-1">ID: {application.id}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <Section title="Personal Information" icon={User}>
            <InfoCard label="Full Name" value={application.full_name} highlight />
            <InfoCard label="Email" value={application.email} />
            <InfoCard label="Phone" value={application.phone} />
            <InfoCard label="Student ID" value={application.student_id} />
          </Section>

          <Section title="Address & IDs" icon={MapPin}>
            <InfoCard label="Full Address" value={application.full_address} />
            <InfoCard label="Aadhaar Number" value={application.aadhaar_number} />
            <InfoCard label="PAN Number" value={application.pan_number} />
          </Section>

          <Section title="Education Details" icon={GraduationCap}>
            <InfoCard label="Category" value={application.category} />
            <InfoCard label="Course" value={application.course} />
            {application.category === "school" ? (
              <>
                <InfoCard label="Class" value={application.class} />
                <InfoCard label="Board" value={application.board} />
                <InfoCard label="School Name" value={application.school_name} />
                <InfoCard label="Previous Class" value={application.previous_class} />
                <InfoCard label="Previous Result" value={application.previous_class_result} />
              </>
            ) : application.category === "college" ? (
              <>
                <InfoCard label="Degree" value={application.degree} />
                <InfoCard label="Year/Semester" value={application.year || application.semester} />
                <InfoCard label="College Name" value={application.college_name} />
                <InfoCard label="University" value={application.university_name} />
                <InfoCard label="Previous Sem Result" value={application.previous_sem_result} />
              </>
            ) : (
              <>
                <InfoCard label="Employment Status" value={application.employment_status} />
                <InfoCard label="Application Reason" value={application.loan_reason} />
              </>
            )}
          </Section>

          <Section title="Guardian Details" icon={Heart}>
            <InfoCard label="Guardian Name" value={application.guardian_name} />
            <InfoCard label="Guardian Number" value={application.guardian_number} />
            <InfoCard label="Relation" value={application.guardian_relation} />
            <InfoCard label="Guardian Aadhaar" value={application.guardian_aadhaar} />
            <InfoCard label="Guardian PAN" value={application.guardian_pan} />
          </Section>

          <Section title="Timeline" icon={Calendar}>
            <InfoCard label="Submitted Date" value={new Date(application.submitted_date).toLocaleString()} />
            <InfoCard label="Last Updated" value={new Date(application.last_updated).toLocaleString()} />
          </Section>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Update Status</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => {
                  setStatus("approved");
                  setShowReason(false);
                }}
                className={`px-5 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                  status === "approved"
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <CheckCircle size={18} /> Approve
              </button>
              <button
                onClick={() => {
                  setStatus("rejected");
                  setShowReason(true);
                }}
                className={`px-5 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                  status === "rejected"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <XCircle size={18} /> Reject
              </button>
              <button
                onClick={() => {
                  setStatus("pending");
                  setShowReason(false);
                }}
                className={`px-5 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                  status === "pending"
                    ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <Clock size={18} /> Pending
              </button>
            </div>
            {showReason && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Document Preview Modal
const DocumentPreviewModal = ({ document, onClose }) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">{document.document_key || "Document Preview"}</h3>
            <p className="text-gray-400 text-sm">{document.document_type}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-4 flex justify-center items-center min-h-[400px] max-h-[70vh] overflow-auto">
          {document.document_file ? (
            document.mime_type?.startsWith("image/") ? (
              <img 
                src={document.document_file} 
                alt={document.document_name}
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            ) : document.mime_type === "application/pdf" ? (
              <iframe 
                src={document.document_file} 
                className="w-full h-[60vh] rounded-lg"
                title={document.document_name}
              />
            ) : (
              <div className="text-center text-gray-400">
                <FileText size={48} className="mx-auto mb-4" />
                <p>Preview not available for this file type</p>
                <a 
                  href={document.document_file} 
                  download 
                  className="mt-4 inline-flex items-center gap-2 text-amber-400 hover:text-amber-300"
                >
                  <Download size={16} /> Download File
                </a>
              </div>
            )
          ) : (
            <div className="text-center text-gray-400">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p>No file available</p>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Payment Preview Modal
const PaymentPreviewModal = ({ payment, onClose }) => {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Payment Proof</h3>
            <p className="text-gray-400 text-sm">Transaction: {payment.transaction_id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-4 flex justify-center items-center min-h-[400px] max-h-[70vh] overflow-auto">
          {payment.payment_image ? (
            <img 
              src={payment.payment_image} 
              alt="Payment Proof"
              className="max-w-full max-h-[60vh] object-contain rounded-lg"
            />
          ) : (
            <div className="text-center text-gray-400">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p>No payment image available</p>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const StudentDocuments = () => {
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewPayment, setPreviewPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedAppId, setExpandedAppId] = useState(null);


  const canApprovePayment = (appId) => {
  const app = applications.find(a => a.id === appId);
  const appDocs = getDocumentsForApp(appId);

  const isAppApproved = app?.status === "approved";
  const allDocsApproved =
    appDocs.length > 0 &&
    appDocs.every(doc => doc.status === "approved");

  return isAppApproved && allDocsApproved;
};

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [appsRes, docsRes, paysRes] = await Promise.all([
        fetch(`${API_BASE}/admin/applications`),
        fetch(`${API_BASE}/admin/application-documents`),
        fetch(`${API_BASE}/admin/payments`),
      ]);

      const appsData = await appsRes.json();
      const docsData = await docsRes.json();
      const paysData = await paysRes.json();

      if (appsData.success) setApplications(appsData.data || []);
      if (docsData.success) setDocuments(docsData.data || []);
      if (paysData.success) setPayments(paysData.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

 const updateApplicationStatus = async (id, status, reason) => {
  try {
    const response = await fetch(`${API_BASE}/admin/applications/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejection_reason: reason }),
    });

    const data = await response.json(); // ✅ ADD THIS 

    if (!data.success) {
      setError(data.message || "Action failed");  // ✅ SHOW ALERT
      setTimeout(() => setError(""), 3000);
      return;
    }

    setSuccessMessage(`Application ${status} successfully!`);
    setTimeout(() => setSuccessMessage(""), 3000);
    fetchData();

  } catch (error) {
    console.error("Error updating application:", error);
    setError("Failed to update application status");
  }
};

  const updateDocumentStatus = async (id, status, reason) => {
    try {
      const response = await fetch(`${API_BASE}/admin/application-documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejection_reason: reason }),
      });
      if (response.ok) {
        setSuccessMessage(`Document ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchData();
      }
    } catch (error) {
      console.error("Error updating document:", error);
      setError("Failed to update document status");
      setTimeout(() => setError(""), 3000);
    }
  };

  const updatePaymentStatus = async (id, status, reason) => {
    try {
      const response = await fetch(`${API_BASE}/admin/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejection_reason: reason }),
      });
      if (response.ok) {
        setSuccessMessage(`Payment ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchData();
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      setError("Failed to update payment status");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getDocumentsForApp = (appId) => {
    return documents.filter((doc) => doc.application_id === appId);
  };

  const getPaymentsForApp = (appId) => {
    return payments.filter((pay) => pay.application_id === appId);
  };

  const filteredApplications = applications.filter((app) => {
    const fullName = app.full_name || "";
    const email = app.email || "";
    const studentId = app.student_id || "";
    const appId = app.id || "";
    
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1 w-fit"><CheckCircle size={12} /> Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 flex items-center gap-1 w-fit"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 flex items-center gap-1 w-fit"><Clock size={12} /> Pending</span>;
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    approved: applications.filter(a => a.status === "approved").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400 text-center">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-transparent p-4 md:p-6 rounded-2xl border border-amber-500/20">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400">Applications Management</h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">Review and manage student applications, documents, and payments</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Applications</p>
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
                <Clock className="w-5 h-5 text-yellow-400" />
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

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-amber-500 text-gray-100"
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={fetchData}
            className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">App ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Student ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center px-4 py-8 text-gray-400">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => {
                    const appDocuments = getDocumentsForApp(app.id);
                    const appPayments = getPaymentsForApp(app.id);
                    const isExpanded = expandedAppId === app.id;
                    
                    return (
                      <React.Fragment key={app.id}>
                        <tr className="hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-amber-400">{app.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-300">{app.student_id || "N/A"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{app.full_name || "N/A"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{app.email || "N/A"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 capitalize">{app.category || "N/A"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                            {new Date(app.submitted_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(app.status)}
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={() => updateApplicationStatus(app.id, "approved", "")}
                                  className="text-green-400 hover:bg-green-500/20 p-1 rounded text-xs cursor-pointer"
                                  title="Approve"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt("Enter rejection reason:");
                                    if (!reason) return alert("Rejection reason is required");
                                    updateApplicationStatus(app.id, "rejected", reason);
                                  }}
                                  className="text-red-400 hover:bg-red-500/20 p-1 rounded text-xs cursor-pointer"
                                  title="Reject"
                                >
                                  <XCircle size={14} />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setShowApplicationModal(true);
                                }}
                                className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                                className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors cursor-pointer"
                                title={isExpanded ? "Hide Documents & Payments" : "View Documents & Payments"}
                              >
                                <FileText size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {isExpanded && (
                          <tr className="bg-gray-900/50">
                            <td colSpan={8} className="px-4 py-4">
                              <div className="space-y-6">
                                <div>
                                  <h4 className="text-md font-semibold text-amber-400 mb-3 flex items-center gap-2">
                                    <FileText size={16} /> Documents
                                  </h4>
                                  {appDocuments.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No documents uploaded</p>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {appDocuments.map((doc) => (
                                        <div key={doc.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                                          <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                              <p className="text-white font-medium text-sm">{doc.document_key || "Untitled"}</p>
                                              <p className="text-gray-500 text-xs">{doc.document_type}</p>
                                            </div>
                                            <button
                                              onClick={() => setPreviewDocument(doc)}
                                              className="p-1 text-amber-400 hover:bg-amber-500/20 rounded transition-colors"
                                              title="Preview"
                                            >
                                              <Eye size={14} />
                                            </button>
                                          </div>
                                          <div className="flex items-center justify-between mt-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                              doc.status === "approved"
                                                ? "bg-green-500/20 text-green-400"
                                                : doc.status === "rejected"
                                                ? "bg-red-500/20 text-red-400"
                                                : "bg-yellow-500/20 text-yellow-400"
                                            }`}>
                                              {doc.status || "pending"}
                                            </span>
                                            <div className="flex gap-1">
                                              <button
                                                onClick={() => updateDocumentStatus(doc.id, "approved")}
                                                className="p-1 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                                                title="Approve"
                                              >
                                                <CheckCircle size={14} />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  const reason = prompt("Enter rejection reason:");
                                                  if (reason) updateDocumentStatus(doc.id, "rejected", reason);
                                                }}
                                                className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                                title="Reject"
                                              >
                                                <XCircle size={14} />
                                              </button>
                                            </div>
                                          </div>
                                          {doc.rejection_reason && doc.status === "rejected" && (
                                            <p className="text-xs text-red-400 mt-2">{doc.rejection_reason}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <h4 className="text-md font-semibold text-amber-400 mb-3 flex items-center gap-2">
                                    <DollarSign size={16} /> Payments
                                  </h4>
                                  {appPayments.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No payments recorded</p>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {appPayments.map((payment) => (
                                        <div key={payment.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                                          <div className="flex items-start justify-between mb-2">
                                            <div>
                                              <p className="text-white font-medium">$2500</p>
                                              <p className="text-gray-500 text-xs">{payment.payment_method}</p>
                                              <p className="text-gray-500 text-xs font-mono">{payment.transaction_id}</p>
                                            </div>
                                            {payment.payment_image && (
                                              <button
                                                onClick={() => setPreviewPayment(payment)}
                                                className="p-1 text-amber-400 hover:bg-amber-500/20 rounded transition-colors"
                                                title="View Proof"
                                              >
                                                <ImageIcon size={14} />
                                              </button>
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between mt-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                              payment.status === "approved"
                                                ? "bg-green-500/20 text-green-400"
                                                : payment.status === "rejected"
                                                ? "bg-red-500/20 text-red-400"
                                                : "bg-yellow-500/20 text-yellow-400"
                                            }`}>
                                              {payment.status || "pending"}
                                            </span>
                                            <div className="flex gap-1">
                                              <button
                                                onClick={() => {
  const allowed = canApprovePayment(payment.application_id);

  if (!allowed) {
    alert("❌ Cannot approve payment.\n\nPlease ensure:\n1. Application is approved\n2. All documents are approved");
    return;
  }

  updatePaymentStatus(payment.id, "approved");
}}
                                                className="p-1 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                                                title="Approve"
                                              >
                                                <CheckCircle size={14} />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  const reason = prompt("Enter rejection reason:");
                                                  if (reason) updatePaymentStatus(payment.id, "rejected", reason);
                                                }}
                                                className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                                title="Reject"
                                              >
                                                <XCircle size={14} />
                                              </button>
                                            </div>
                                          </div>
                                          {payment.rejection_reason && payment.status === "rejected" && (
                                            <p className="text-xs text-red-400 mt-2">{payment.rejection_reason}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && filteredApplications.length > 0 && (
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
              <span className="text-gray-400">Total Applications: <span className="text-amber-400 font-semibold">{applications.length}</span></span>
              <span className="text-gray-400">Showing: <span className="text-amber-400 font-semibold">{filteredApplications.length}</span></span>
              <span className="text-gray-400">
                Pending: <span className="text-yellow-400 font-semibold">{stats.pending}</span> | 
                Approved: <span className="text-green-400 font-semibold">{stats.approved}</span> | 
                Rejected: <span className="text-red-400 font-semibold">{stats.rejected}</span>
              </span>
            </div>
          </div>
        )}

        {showApplicationModal && (
          <ApplicationModal
            application={selectedApplication}
            onClose={() => setShowApplicationModal(false)}
            onUpdateStatus={updateApplicationStatus}
          />
        )}

        {previewDocument && (
          <DocumentPreviewModal
            document={previewDocument}
            onClose={() => setPreviewDocument(null)}
          />
        )}

        {previewPayment && (
          <PaymentPreviewModal
            payment={previewPayment}
            onClose={() => setPreviewPayment(null)}
          />
        )}
      </div>
    </div>
  );
};

export default StudentDocuments;