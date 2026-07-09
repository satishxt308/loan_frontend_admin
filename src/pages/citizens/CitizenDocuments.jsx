// src/pages/citizens/CitizenDocuments.jsx
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
  Loader,
  QrCode,
  Wallet,
  User,
  CreditCard,
  File,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Document Preview Modal
const DocumentPreviewModal = ({ document, onClose }) => {
  if (!document) return null;

  const getDocumentIcon = () => {
    if (document.document_type?.toLowerCase().includes("photo") || document.document_type?.toLowerCase().includes("profile")) {
      return <User size={48} className="text-amber-400" />;
    }
    if (document.document_type?.toLowerCase().includes("aadhaar")) {
      return <CreditCard size={48} className="text-amber-400" />;
    }
    if (document.document_type?.toLowerCase().includes("pan")) {
      return <File size={48} className="text-amber-400" />;
    }
    return <FileText size={48} className="text-amber-400" />;
  };

  // Determine what to display based on document type
  const getImageSource = () => {
    if (document.document_file) return document.document_file;
    if (document.photo) return document.photo;
    if (document.aadhaar_card_image) return document.aadhaar_card_image;
    if (document.pan_card_image) return document.pan_card_image;
    return null;
  };

  const imageSrc = getImageSource();

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {document.document_key || document.document_type || document.name || "Document Preview"}
            </h3>
            <p className="text-gray-400 text-sm">
              {document.document_type || "Citizen Document"} 
              {document.name && ` • ${document.name}`}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-4 flex justify-center items-center min-h-[400px] max-h-[70vh] overflow-auto">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={document.document_name || document.document_type || "Document"}
              className="max-w-full max-h-[60vh] object-contain rounded-lg"
            />
          ) : (
            <div className="text-center text-gray-400">
              {getDocumentIcon()}
              <p className="mt-4">No image available</p>
              <p className="text-sm mt-2">Document type: {document.document_type || "N/A"}</p>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              document.status === "approved" || document.verification_status === "approved" || document.verification_status === "verified"
                ? "bg-green-500/20 text-green-400"
                : document.status === "rejected" || document.verification_status === "rejected"
                ? "bg-red-500/20 text-red-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}>
              {document.status || document.verification_status || "pending"}
            </span>
            {document.rejection_reason && (document.status === "rejected" || document.verification_status === "rejected") && (
              <span className="ml-2 text-red-400 text-xs">Reason: {document.rejection_reason}</span>
            )}
          </div>
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
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Payment Proof</h3>
            <p className="text-gray-400 text-sm">
              {payment.payment_method === "qr" ? "QR Payment" : "Wallet Payment"}
              {payment.utr && ` | UTR: ${payment.utr}`}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
          >
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
              {payment.payment_method === "qr" ? (
                <>
                  <QrCode size={64} className="mx-auto mb-4 text-amber-400" />
                  <p>QR Payment - No image attached</p>
                  {payment.utr && <p className="text-sm mt-2">UTR: {payment.utr}</p>}
                </>
              ) : (
                <>
                  <Wallet size={64} className="mx-auto mb-4 text-amber-400" />
                  <p>Wallet Payment - No image attached</p>
                </>
              )}
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

// Status Change Modal
const StatusChangeModal = ({ citizen, onClose, onUpdate }) => {
  const [status, setStatus] = useState(citizen?.verification_status || "pending");
  const [rejectReason, setRejectReason] = useState("");
  const [showReason, setShowReason] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!citizen) return null;

  const handleSubmit = async () => {
    if (status === "rejected" && !rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    setSubmitting(true);
    await onUpdate(citizen.id, status, rejectReason);
    setSubmitting(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Update Status</h3>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1">{citizen.name}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Select Status</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setStatus("approved");
                  setShowReason(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  status === "approved"
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <CheckCircle className="inline w-4 h-4 mr-1" /> Approve
              </button>
              <button
                onClick={() => {
                  setStatus("rejected");
                  setShowReason(true);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  status === "rejected"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <XCircle className="inline w-4 h-4 mr-1" /> Reject
              </button>
              <button
                onClick={() => {
                  setStatus("pending");
                  setShowReason(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  status === "pending"
                    ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <Clock className="inline w-4 h-4 mr-1" /> Pending
              </button>
            </div>
          </div>

          {showReason && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 text-white resize-none"
                rows={3}
              />
            </div>
          )}
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
            {submitting ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const CitizenDocuments = () => {
  const [citizens, setCitizens] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedCitizenId, setExpandedCitizenId] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewPayment, setPreviewPayment] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);
  const [processingDocId, setProcessingDocId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch citizens
      const citizensRes = await fetch(`${API_BASE}/citizens/all`);
      const citizensData = await citizensRes.json();

      // Fetch documents - this returns citizen data with images
      const docsRes = await fetch(`${API_BASE}/citizen-documents`);
      const docsData = await docsRes.json();

      // Fetch payments
      const paysRes = await fetch(`${API_BASE}/citizen-payment/admin/all`);
      const paysData = await paysRes.json();

      if (citizensData.success) {
        setCitizens(citizensData.data || []);
      }
      
      if (docsData.success) {
        // The data is an array of citizens with their document images
        // We need to transform this into document objects
        const transformedDocs = [];
        docsData.data.forEach(citizen => {
          // Add photo as a document
          if (citizen.photo) {
            transformedDocs.push({
              id: `photo_${citizen.id}`,
              citizen_id: citizen.id,
              document_key: 'Photo',
              document_type: 'photo',
              document_name: `${citizen.name || 'Citizen'}_photo`,
              document_file: citizen.photo,
              status: citizen.verification_status || 'pending',
              rejection_reason: citizen.rejection_reason || null,
              created_at: citizen.created_at,
              updated_at: citizen.updated_at,
              mime_type: 'image/jpeg',
              citizen_name: citizen.name,
            });
          }
          
          // Add Aadhaar card as a document
          if (citizen.aadhaar_card_image) {
            transformedDocs.push({
              id: `aadhaar_${citizen.id}`,
              citizen_id: citizen.id,
              document_key: 'Aadhaar Card',
              document_type: 'aadhaar_card',
              document_name: `${citizen.name || 'Citizen'}_aadhaar`,
              document_file: citizen.aadhaar_card_image,
              status: citizen.verification_status || 'pending',
              rejection_reason: citizen.rejection_reason || null,
              created_at: citizen.created_at,
              updated_at: citizen.updated_at,
              mime_type: 'image/jpeg',
              citizen_name: citizen.name,
            });
          }
          
          // Add PAN card as a document
          if (citizen.pan_card_image) {
            transformedDocs.push({
              id: `pan_${citizen.id}`,
              citizen_id: citizen.id,
              document_key: 'PAN Card',
              document_type: 'pan_card',
              document_name: `${citizen.name || 'Citizen'}_pan`,
              document_file: citizen.pan_card_image,
              status: citizen.verification_status || 'pending',
              rejection_reason: citizen.rejection_reason || null,
              created_at: citizen.created_at,
              updated_at: citizen.updated_at,
              mime_type: 'image/jpeg',
              citizen_name: citizen.name,
            });
          }
        });
        setDocuments(transformedDocs);
      }
      
      if (paysData.success) {
        setPayments(paysData.payments || []);
      }
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

  const updateCitizenStatus = async (id, status, reason) => {
    try {
      const response = await fetch(`${API_BASE}/citizens/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification_status: status, rejection_reason: reason }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(`Citizen ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending'} successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchData();
      } else {
        setError(data.message || "Failed to update status");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("Error updating citizen:", error);
      setError("Failed to update citizen status");
      setTimeout(() => setError(""), 3000);
    }
  };

  const updateDocumentStatus = async (id, status, reason) => {
    // Extract citizen ID from document ID (e.g., "photo_5" -> 5)
    const citizenId = id.split('_')[1];
    setProcessingDocId(id);
    try {
      // Update the citizen's verification status since documents are linked to citizen
      const response = await fetch(`${API_BASE}/citizens/${citizenId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification_status: status, rejection_reason: reason }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(`Document ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending'} successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchData();
      } else {
        setError(data.message || "Failed to update document");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("Error updating document:", error);
      setError("Failed to update document status");
      setTimeout(() => setError(""), 3000);
    } finally {
      setProcessingDocId(null);
    }
  };

 const updatePaymentStatus = async (id, status, reason) => {
  setProcessingPaymentId(id);

  try {
    let endpoint = `${API_BASE}/citizen-payment/admin/`;

    if (status === "approved") {
      endpoint += `approve/${id}`;
    } else {
      endpoint += `reject/${id}`;
    }

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        admin_id: 1,
        rejection_reason: reason,
      }),
    });

    const data = await response.json();

    if (data.success) {

      // ✅ Immediately update payment state
      setPayments(prev =>
        prev.map(payment =>
          payment.id === id
            ? {
                ...payment,
                status:
                  status === "approved"
                    ? "APPROVED"
                    : status === "rejected"
                    ? "REJECTED"
                    : "PENDING",
                approved_at:
                  status === "approved"
                    ? new Date().toISOString()
                    : payment.approved_at,
                rejection_reason:
                  status === "rejected"
                    ? reason
                    : null,
              }
            : payment
        )
      );

      setSuccessMessage(
        `Payment ${status === "approved" ? "approved" : "rejected"} successfully!`
      );

      setTimeout(() => setSuccessMessage(""), 3000);

      // Optional: refresh in background to sync with DB
      fetchData();

    } else {
      setError(data.message || "Failed to update payment");
      setTimeout(() => setError(""), 3000);
    }

  } catch (error) {
    console.error(error);
    setError("Failed to update payment status");
    setTimeout(() => setError(""), 3000);
  } finally {
    setProcessingPaymentId(null);
  }
};

  const getDocumentsForCitizen = (citizenId) => {
    return documents.filter((doc) => doc.citizen_id === citizenId);
  };

  const getPaymentsForCitizen = (citizenId) => {
    return payments.filter((pay) => pay.citizen_id === citizenId || pay.citizen_table_id === citizenId);
  };

  const getDocumentTypeIcon = (type) => {
    if (!type) return <FileText size={14} className="text-amber-400" />;
    const lowerType = type.toLowerCase();
    if (lowerType.includes("photo")) {
      return <User size={14} className="text-blue-400" />;
    }
    if (lowerType.includes("aadhaar")) {
      return <CreditCard size={14} className="text-orange-400" />;
    }
    if (lowerType.includes("pan")) {
      return <File size={14} className="text-purple-400" />;
    }
    return <FileText size={14} className="text-amber-400" />;
  };

  const filteredCitizens = citizens.filter((citizen) => {
    const name = citizen.name || "";
    const email = citizen.email || "";
    const phone = citizen.phone || "";
    const citizenId = citizen.id || "";
    
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      citizenId.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || citizen.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status, citizen = null) => {
    const statusMap = {
      "approved": { icon: CheckCircle, color: "green", label: "Approved", bg: "bg-green-500/20", text: "text-green-400" },
      "verified": { icon: CheckCircle, color: "green", label: "Verified", bg: "bg-green-500/20", text: "text-green-400" },
      "rejected": { icon: XCircle, color: "red", label: "Rejected", bg: "bg-red-500/20", text: "text-red-400" },
      "pending": { icon: Clock, color: "yellow", label: "Pending", bg: "bg-yellow-500/20", text: "text-yellow-400" },
    };
    const s = statusMap[status] || statusMap.pending;
    const Icon = s.icon;
    
    if (citizen) {
      return (
        <button
          onClick={() => setStatusModal(citizen)}
          className={`px-2 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text} flex items-center gap-1 w-fit hover:ring-2 hover:ring-amber-500/50 transition-all cursor-pointer`}
          title="Click to change status"
        >
          <Icon size={12} /> {s.label}
        </button>
      );
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text} flex items-center gap-1 w-fit`}>
        <Icon size={12} /> {s.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      "APPROVED": { icon: CheckCircle, color: "green", label: "Approved", bg: "bg-green-500/20", text: "text-green-400" },
      "REJECTED": { icon: XCircle, color: "red", label: "Rejected", bg: "bg-red-500/20", text: "text-red-400" },
      "PENDING": { icon: Clock, color: "yellow", label: "Waiting for Approval", bg: "bg-yellow-500/20", text: "text-yellow-400" },
    };
    const s = statusMap[status] || statusMap.PENDING;
    const Icon = s.icon;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text} flex items-center gap-1 w-fit`}>
        <Icon size={10} /> {s.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    if (method === "qr") {
      return <QrCode size={14} className="text-amber-400" />;
    }
    return <Wallet size={14} className="text-blue-400" />;
  };

  const stats = {
    total: citizens.length,
    pending: citizens.filter(c => c.verification_status === "pending").length,
    approved: citizens.filter(c => c.verification_status === "approved" || c.verification_status === "verified").length,
    rejected: citizens.filter(c => c.verification_status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading citizens...</p>
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

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-transparent p-4 md:p-6 rounded-2xl border border-amber-500/20">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400">Citizen Documents & Payments</h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">Review and manage citizen documents and payment history</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Citizens</p>
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

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, name, email, or phone..."
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

        {/* Table */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nominee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Aadhaar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Documents</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payments</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredCitizens.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center px-4 py-8 text-gray-400">
                      No citizens found
                    </td>
                  </tr>
                ) : (
                  filteredCitizens.map((citizen) => {
                    const citizenDocuments = getDocumentsForCitizen(citizen.id);
                    const citizenPayments = getPaymentsForCitizen(citizen.id);
                    const isExpanded = expandedCitizenId === citizen.id;
                    
                    return (
                      <React.Fragment key={citizen.id}>
                        <tr className="hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-amber-400">{citizen.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{citizen.name || "N/A"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{citizen.nominee_name || citizen.nominee || "N/A"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{citizen.phone || "N/A"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                            {citizen.aadhaar_number ? `XXXX-XXXX-${citizen.aadhaar_number.slice(-4)}` : "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {getStatusBadge(citizen.verification_status, citizen)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                            {citizenDocuments.length > 0 ? (
                              <span className="text-amber-400 font-semibold">{citizenDocuments.length}</span>
                            ) : (
                              <span className="text-gray-500">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                            {citizenPayments.length > 0 ? (
                              <span className="text-amber-400 font-semibold">{citizenPayments.length}</span>
                            ) : (
                              <span className="text-gray-500">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => setExpandedCitizenId(isExpanded ? null : citizen.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isExpanded 
                                  ? "text-amber-400 bg-amber-500/20" 
                                  : "text-blue-400 hover:bg-blue-500/20"
                              }`}
                              title={isExpanded ? "Hide Documents & Payments" : "View Documents & Payments"}
                            >
                              <FileText size={18} />
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Row */}
                        {isExpanded && (
                          <tr className="bg-gray-900/50">
                            <td colSpan={8} className="px-4 py-4">
                              <div className="space-y-6">
                                {/* Documents Section */}
                                <div>
                                  <h4 className="text-md font-semibold text-amber-400 mb-3 flex items-center gap-2">
                                    <FileText size={16} /> Documents ({citizenDocuments.length})
                                  </h4>
                                  {citizenDocuments.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No documents uploaded</p>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {citizenDocuments.map((doc) => {
                                        const isProcessing = processingDocId === doc.id;
                                        const docStatus = doc.status || "pending";
                                        
                                        return (
                                          <div key={doc.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-amber-500/30 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                  {getDocumentTypeIcon(doc.document_type)}
                                                  <p className="text-white font-medium text-sm truncate">
                                                    {doc.document_key || doc.document_type || "Untitled"}
                                                  </p>
                                                </div>
                                                <p className="text-gray-500 text-xs capitalize">{doc.document_type || "Document"}</p>
                                                {doc.document_name && (
                                                  <p className="text-gray-500 text-xs truncate">{doc.document_name}</p>
                                                )}
                                              </div>
                                              {doc.document_file && (
                                                <button
                                                  onClick={() => setPreviewDocument(doc)}
                                                  className="p-1 text-amber-400 hover:bg-amber-500/20 rounded transition-colors cursor-pointer flex-shrink-0"
                                                  title="Preview"
                                                >
                                                  <Eye size={14} />
                                                </button>
                                              )}
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                docStatus === "approved" || docStatus === "verified"
                                                  ? "bg-green-500/20 text-green-400"
                                                  : docStatus === "rejected"
                                                  ? "bg-red-500/20 text-red-400"
                                                  : "bg-yellow-500/20 text-yellow-400"
                                              }`}>
                                                {docStatus || "pending"}
                                              </span>
                                              
                                              {/* Always show Approve/Reject buttons for documents */}
                                              <div className="flex gap-1">
                                                <button
                                                  onClick={() => {
                                                    if (window.confirm(docStatus === "approved" ? "Revert this document to pending?" : "Approve this document?")) {
                                                      updateDocumentStatus(doc.id, docStatus === "approved" ? "pending" : "approved");
                                                    }
                                                  }}
                                                  disabled={isProcessing}
                                                  className={`p-1 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    docStatus === "approved" 
                                                      ? "text-yellow-400 hover:bg-yellow-500/20" 
                                                      : "text-green-400 hover:bg-green-500/20"
                                                  }`}
                                                  title={docStatus === "approved" ? "Revert to Pending" : "Approve Document"}
                                                >
                                                  {isProcessing ? (
                                                    <Loader size={14} className="animate-spin" />
                                                  ) : docStatus === "approved" ? (
                                                    <Clock size={14} />
                                                  ) : (
                                                    <CheckCircle size={14} />
                                                  )}
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    if (docStatus === "rejected") {
                                                      if (window.confirm("Revert this document to pending?")) {
                                                        updateDocumentStatus(doc.id, "pending");
                                                      }
                                                      return;
                                                    }
                                                    const reason = prompt("Enter rejection reason:");
                                                    if (reason !== null) {
                                                      if (window.confirm(docStatus === "rejected" ? "Revert to pending?" : "Reject this document?")) {
                                                        updateDocumentStatus(doc.id, docStatus === "rejected" ? "pending" : "rejected", reason);
                                                      }
                                                    }
                                                  }}
                                                  disabled={isProcessing}
                                                  className={`p-1 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    docStatus === "rejected"
                                                      ? "text-yellow-400 hover:bg-yellow-500/20"
                                                      : "text-red-400 hover:bg-red-500/20"
                                                  }`}
                                                  title={docStatus === "rejected" ? "Revert to Pending" : "Reject Document"}
                                                >
                                                  {isProcessing ? (
                                                    <Loader size={14} className="animate-spin" />
                                                  ) : docStatus === "rejected" ? (
                                                    <Clock size={14} />
                                                  ) : (
                                                    <XCircle size={14} />
                                                  )}
                                                </button>
                                              </div>
                                            </div>
                                            {doc.rejection_reason && docStatus === "rejected" && (
                                              <p className="text-xs text-red-400 mt-2 truncate">Reason: {doc.rejection_reason}</p>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Payments Section */}
                                <div>
                                  <h4 className="text-md font-semibold text-amber-400 mb-3 flex items-center gap-2">
                                    <DollarSign size={16} /> Payments ({citizenPayments.length})
                                  </h4>
                                  {citizenPayments.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No payments recorded</p>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {citizenPayments.map((payment) => {
                                        const paymentStatus = payment.status || "PENDING";
                                        const isProcessing = processingPaymentId === payment.id;
                                        
                                        return (
                                          <div key={payment.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-amber-500/30 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                  <p className="text-white font-medium">₹{parseFloat(payment.amount || 0).toLocaleString()}</p>
                                                  <span className="flex items-center gap-1 text-xs text-gray-400">
                                                    {getPaymentMethodIcon(payment.payment_method)}
                                                    <span className="capitalize">{payment.payment_method}</span>
                                                  </span>
                                                </div>
                                                {payment.utr && (
                                                  <p className="text-gray-500 text-xs font-mono mt-1 truncate">UTR: {payment.utr}</p>
                                                )}
                                                <p className="text-gray-500 text-xs">Submitted: {new Date(payment.created_at).toLocaleDateString()}</p>
                                                {payment.approved_at && paymentStatus === "APPROVED" && (
                                                  <p className="text-green-400 text-xs">Approved: {new Date(payment.approved_at).toLocaleString()}</p>
                                                )}
                                                {payment.rejection_reason && paymentStatus === "REJECTED" && (
                                                  <p className="text-red-400 text-xs mt-1 truncate">Reason: {payment.rejection_reason}</p>
                                                )}
                                              </div>
                                              {(payment.payment_image || payment.payment_method === "qr") && (
                                                <button
                                                  onClick={() => setPreviewPayment(payment)}
                                                  className="p-1 text-amber-400 hover:bg-amber-500/20 rounded transition-colors cursor-pointer flex-shrink-0"
                                                  title="View Payment Details"
                                                >
                                                  {payment.payment_image ? (
                                                    <ImageIcon size={16} />
                                                  ) : (
                                                    <QrCode size={16} />
                                                  )}
                                                </button>
                                              )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-2">
                                              {getPaymentStatusBadge(paymentStatus)}
                                              
                                              {/* Always show Approve/Reject buttons for payments */}
                                              <div className="flex gap-1">
                                                <button
                                                  onClick={() => {
                                                    if (paymentStatus === "APPROVED") {
                                                      if (window.confirm("Revert this payment to pending?")) {
                                                        updatePaymentStatus(payment.id, "pending");
                                                      }
                                                      return;
                                                    }
                                                    if (citizen.verification_status !== "approved" && citizen.verification_status !== "verified") {
                                                      alert("❌ Cannot approve payment.\n\nPlease ensure:\n1. Citizen is approved/verified first");
                                                      return;
                                                    }
                                                    if (window.confirm(`Approve this ${payment.payment_method} payment?`)) {
                                                      updatePaymentStatus(payment.id, "approved");
                                                    }
                                                  }}
                                                  disabled={isProcessing}
                                                  className={`p-1 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    paymentStatus === "APPROVED"
                                                      ? "text-yellow-400 hover:bg-yellow-500/20"
                                                      : "text-green-400 hover:bg-green-500/20"
                                                  }`}
                                                  title={paymentStatus === "APPROVED" ? "Revert to Pending" : `Approve ${payment.payment_method} Payment`}
                                                >
                                                  {isProcessing ? (
                                                    <Loader size={14} className="animate-spin" />
                                                  ) : paymentStatus === "APPROVED" ? (
                                                    <Clock size={14} />
                                                  ) : (
                                                    <CheckCircle size={14} />
                                                  )}
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    if (paymentStatus === "REJECTED") {
                                                      if (window.confirm("Revert this payment to pending?")) {
                                                        updatePaymentStatus(payment.id, "pending");
                                                      }
                                                      return;
                                                    }
                                                    const reason = prompt("Enter rejection reason:");
                                                    if (reason !== null) {
                                                      if (window.confirm(`Reject this ${payment.payment_method} payment?`)) {
                                                        updatePaymentStatus(payment.id, "rejected", reason);
                                                      }
                                                    }
                                                  }}
                                                  disabled={isProcessing}
                                                  className={`p-1 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    paymentStatus === "REJECTED"
                                                      ? "text-yellow-400 hover:bg-yellow-500/20"
                                                      : "text-red-400 hover:bg-red-500/20"
                                                  }`}
                                                  title={paymentStatus === "REJECTED" ? "Revert to Pending" : `Reject ${payment.payment_method} Payment`}
                                                >
                                                  {isProcessing ? (
                                                    <Loader size={14} className="animate-spin" />
                                                  ) : paymentStatus === "REJECTED" ? (
                                                    <Clock size={14} />
                                                  ) : (
                                                    <XCircle size={14} />
                                                  )}
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
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

        {/* Footer Stats */}
        {!loading && filteredCitizens.length > 0 && (
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
              <span className="text-gray-400">Total Citizens: <span className="text-amber-400 font-semibold">{citizens.length}</span></span>
              <span className="text-gray-400">Showing: <span className="text-amber-400 font-semibold">{filteredCitizens.length}</span></span>
              <span className="text-gray-400">
                Pending: <span className="text-yellow-400 font-semibold">{stats.pending}</span> | 
                Approved: <span className="text-green-400 font-semibold">{stats.approved}</span> | 
                Rejected: <span className="text-red-400 font-semibold">{stats.rejected}</span>
              </span>
            </div>
          </div>
        )}

        {/* Modals */}
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

        {statusModal && (
          <StatusChangeModal
            citizen={statusModal}
            onClose={() => setStatusModal(null)}
            onUpdate={updateCitizenStatus}
          />
        )}
      </div>
    </div>
  );
};

export default CitizenDocuments;