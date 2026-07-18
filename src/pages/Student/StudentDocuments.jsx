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
  Loader,
  Check,
  Building,
  Award,
  Banknote,
  UserCheck,
  Globe,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

// ============================================
// DOCUMENT PREVIEW MODAL
// ============================================
const DocumentPreviewModal = ({ document, onClose }) => {
  if (!document) return null;

  return (
    <div 
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl w-[50vw] max-w-xl border border-gray-700 shadow-2xl">
        <div className="p-2 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">{document.document_key || "Document Preview"}</h3>
            <p className="text-gray-400 text-sm">{document.document_type}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-4 flex justify-center items-center min-h-[35px] max-h-[70vh] overflow-auto">
          {document.document_file ? (
            document.mime_type?.startsWith("image/") ? (
              <img 
                src={document.document_file} 
                alt={document.document_name}
                className="max-w-[50vh] max-h-[50vh] object-contain rounded-lg"
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
      </div>
    </div>
  );
};

// ============================================
// PAYMENT PREVIEW MODAL
// ============================================
const PaymentPreviewModal = ({ payment, onClose }) => {
  if (!payment) return null;

  const getImageSource = () => {
    if (!payment.payment_image) return null;
    
    if (payment.payment_image.startsWith('data:image')) {
      return payment.payment_image;
    }
    
    if (payment.payment_image.startsWith('/9j/')) {
      return `data:image/jpeg;base64,${payment.payment_image}`;
    }
    
    if (payment.payment_image.startsWith('iVBOR')) {
      return `data:image/png;base64,${payment.payment_image}`;
    }
    
    if (payment.payment_image.startsWith('http://') || payment.payment_image.startsWith('https://')) {
      return payment.payment_image;
    }
    
    return payment.payment_image;
  };

  const imageSrc = getImageSource();

  return (
    <div 
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Payment Proof</h3>
            <p className="text-gray-400 text-sm">Transaction: {payment.transaction_id}</p>
            <p className="text-gray-400 text-sm">Amount: ${payment.amount || '2500'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-4 flex justify-center items-center min-h-[350px] max-h-[70vh] overflow-auto">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt="Payment Proof"
              className="max-w-full max-h-[60vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="text-center text-gray-400">
                      <AlertCircle size={48} class="mx-auto mb-4" />
                      <p>Failed to load payment image</p>
                      ${payment.transaction_id ? `<p class="text-sm mt-2">Transaction: ${payment.transaction_id}</p>` : ''}
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="text-center text-gray-400">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p>No payment image available</p>
              {payment.transaction_id && (
                <p className="text-sm mt-2">Transaction: {payment.transaction_id}</p>
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

// ============================================
// COMBINED REVIEW MODAL (Like Employee & Citizen)
// ============================================
const ReviewModal = ({ 
  application, 
  documents, 
  payments, 
  onClose, 
  onUpdateApplicationStatus,
  onUpdateDocumentStatus,
  onUpdatePaymentStatus,
  onRefresh 
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewPayment, setPreviewPayment] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(application?.status || "pending");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [localDocuments, setLocalDocuments] = useState(documents || []);
  const [localPayments, setLocalPayments] = useState(payments || []);
  const [refreshKey, setRefreshKey] = useState(0);
const [reviewLoading, setReviewLoading] = useState(false);

  // Update local state when props change
  useEffect(() => {
    if (application) {
      setApplicationStatus(application.status || "pending");
    }
    setLocalDocuments(documents || []);
    setLocalPayments(payments || []);
  }, [application, documents, payments, refreshKey]);

  if (!application) return null;

  // All items for selection (documents + payments)
  const allItems = [
    ...localDocuments.map(doc => ({ ...doc, type: 'document' })),
    ...localPayments.map(pay => ({ ...pay, type: 'payment' }))
  ];

  const allItemIds = allItems.map(item => item.id);

  const handleSelectAll = () => {
    const allSelected = allItemIds.every(id => selectedItems.includes(id));
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allItemIds);
    }
  };

  const toggleItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = () => {
    return allItemIds.length > 0 && allItemIds.every(id => selectedItems.includes(id));
  };

  // Get overall status badge
  const getOverallStatus = () => {
    if (applicationStatus === "approved") {
      return { label: "Approved", color: "bg-green-500/20 text-green-400", icon: CheckCircle };
    }
    if (applicationStatus === "rejected") {
      return { label: "Rejected", color: "bg-red-500/20 text-red-400", icon: XCircle };
    }
    return { label: "Pending", color: "bg-yellow-500/20 text-yellow-400", icon: Clock };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  // Check if all documents are approved
  const allDocsApproved = localDocuments.length > 0 && localDocuments.every(doc => doc.status === "approved");
  const canApprovePayments = applicationStatus === "approved" && allDocsApproved;

  // Handle application status change
  const handleApplicationStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      if (applicationStatus === newStatus) {
        // Toggle off -> set to pending
        const result = await onUpdateApplicationStatus(application.id, "pending", null);
        if (result) {
          setApplicationStatus("pending");
          await onRefresh();
          setRefreshKey(prev => prev + 1);
        }
      } else {
        if (newStatus === "rejected") {
          const reason = prompt("Please enter rejection reason:");
          if (reason !== null && reason.trim()) {
            const result = await onUpdateApplicationStatus(application.id, newStatus, reason.trim());
            if (result) {
              setApplicationStatus(newStatus);
              await onRefresh();
              setRefreshKey(prev => prev + 1);
            }
          } else if (reason !== null) {
            alert("Rejection reason is required");
          }
        } else {
          const result = await onUpdateApplicationStatus(application.id, newStatus, null);
          if (result) {
            setApplicationStatus(newStatus);
            await onRefresh();
            setRefreshKey(prev => prev + 1);
          }
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle bulk approve
  const handleApprove = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to approve");
      return;
    }

    setSubmitting(true);
    let allSuccess = true;

    for (const id of selectedItems) {
      // Check if it's a document (has document_type) or payment
      const isDocument = localDocuments.some(doc => doc.id === id);
      if (isDocument) {
        const success = await onUpdateDocumentStatus(id, "approved", null);
        if (!success) allSuccess = false;
      } else {
        // Check if payment can be approved
        if (!canApprovePayments) {
          alert("Cannot approve payments. Please ensure:\n1. Application is approved\n2. All documents are approved");
          setSubmitting(false);
          return;
        }
        const success = await onUpdatePaymentStatus(id, "approved", null);
        if (!success) allSuccess = false;
      }
    }

    if (allSuccess) {
      setSelectedItems([]);
      await onRefresh();
      setRefreshKey(prev => prev + 1);
    }
    setSubmitting(false);
  };

  // Handle bulk reject
  const handleReject = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to reject");
      return;
    }

    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setSubmitting(true);
    let allSuccess = true;

    for (const id of selectedItems) {
      const isDocument = localDocuments.some(doc => doc.id === id);
      if (isDocument) {
        const success = await onUpdateDocumentStatus(id, "rejected", rejectReason);
        if (!success) allSuccess = false;
      } else {
        const success = await onUpdatePaymentStatus(id, "rejected", rejectReason);
        if (!success) allSuccess = false;
      }
    }

    if (allSuccess) {
      setSelectedItems([]);
      setRejectReason("");
      await onRefresh();
      setRefreshKey(prev => prev + 1);
    }
    setSubmitting(false);
  };

  // Info Card component for displaying application details
  const InfoCard = ({ label, value, highlight = false }) => (
    <div className="bg-gray-700/30 rounded-lg p-3">
      <label className="text-xs text-gray-400 uppercase block mb-1">{label}</label>
      <p className={`${highlight ? "text-amber-400 font-semibold" : "text-white"} break-words`}>
        {value || "N/A"}
      </p>
    </div>
  );

  return (
    <>
      <div 
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" 
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-gray-800 rounded-2xl w-full max-w-3xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Review Application</h3>
              <p className="text-gray-400 text-sm">ID: {application.id} • {application.full_name}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${overallStatus.color} flex items-center gap-2`}>
                <StatusIcon size={16} />
                {overallStatus.label}
              </span>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Application Status Section with Checkboxes */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <label className="text-xs text-gray-400 uppercase block mb-3">Application Status</label>
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applicationStatus === "approved"}
                    onChange={() => handleApplicationStatusChange("approved")}
                    disabled={updatingStatus}
                    className="w-5 h-5 rounded border-gray-500 text-green-500 focus:ring-green-500 cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-green-400 font-medium">Approved</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applicationStatus === "rejected"}
                    onChange={() => handleApplicationStatusChange("rejected")}
                    disabled={updatingStatus}
                    className="w-5 h-5 rounded border-gray-500 text-red-500 focus:ring-red-500 cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-red-400 font-medium">Rejected</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applicationStatus === "pending"}
                    onChange={() => handleApplicationStatusChange("pending")}
                    disabled={updatingStatus}
                    className="w-5 h-5 rounded border-gray-500 text-yellow-500 focus:ring-yellow-500 cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-yellow-400 font-medium">Pending</span>
                </label>
                {updatingStatus && (
                  <Loader size={16} className="animate-spin text-amber-400" />
                )}
                {application.rejection_reason && applicationStatus === "rejected" && (
                  <span className="text-red-400 text-sm ml-2">Reason: {application.rejection_reason}</span>
                )}
              </div>
            </div>

            {/* Application Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoCard label="Full Name" value={application.full_name} highlight />
              <InfoCard label="Email" value={application.email} />
              <InfoCard label="Phone" value={application.phone} />
              <InfoCard label="Student ID" value={application.student_id} />
              <InfoCard label="Category" value={application.category} />
              <InfoCard label="Course" value={application.course} />
              <InfoCard label="Aadhaar Number" value={application.aadhaar_number} />
              <InfoCard label="PAN Number" value={application.pan_number} />
              <InfoCard label="Submitted Date" value={new Date(application.submitted_date).toLocaleString()} />
            </div>

            {/* Documents Section with Checkboxes */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-amber-400 flex items-center gap-2">
                  <FileText size={16} /> Documents ({localDocuments.length})
                </h4>
                {allItems.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer ${
                      isAllSelected() 
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/50" 
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    <Check size={14} />
                    {isAllSelected() ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>

              {localDocuments.length === 0 ? (
                <p className="text-gray-500 text-sm">No documents uploaded</p>
              ) : (
                <div className="space-y-2">
                  {localDocuments.map((doc) => (
                    <div key={doc.id} className="bg-gray-700/30 rounded-lg p-3 border border-gray-600 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(doc.id)}
                          onChange={() => toggleItem(doc.id)}
                          className="w-4 h-4 rounded border-gray-500 text-amber-500 focus:ring-amber-500 cursor-pointer flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">
                            {doc.document_key || doc.document_type || "Untitled"}
                          </p>
                          <p className="text-gray-400 text-xs capitalize">{doc.document_type || "Document"}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            doc.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : doc.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {doc.status || "pending"}
                          </span>
                          {doc.rejection_reason && doc.status === "rejected" && (
                            <p className="text-xs text-red-400 mt-1">Reason: {doc.rejection_reason}</p>
                          )}
                        </div>
                      </div>
                      {doc.document_file && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDocument(doc);
                          }}
                          className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded transition-colors cursor-pointer flex-shrink-0"
                          title="Preview Document"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payments Section with Checkboxes */}
            <div className="border-t border-gray-700 pt-6">
              <h4 className="text-md font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <DollarSign size={16} /> Payments ({localPayments.length})
              </h4>

              {localPayments.length === 0 ? (
                <p className="text-gray-500 text-sm">No payments recorded</p>
              ) : (
                <div className="space-y-2">
                  {localPayments.map((payment) => (
                    <div key={payment.id} className="bg-gray-700/30 rounded-lg p-3 border border-gray-600 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(payment.id)}
                          onChange={() => toggleItem(payment.id)}
                          className="w-4 h-4 rounded border-gray-500 text-amber-500 focus:ring-amber-500 cursor-pointer flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">${payment.amount || '2500'}</p>
                            <span className="text-xs text-gray-400 capitalize">{payment.payment_method}</span>
                            {payment.payment_image && (
                              <span className="text-xs text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">
                                📷
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs font-mono truncate">Transaction: {payment.transaction_id}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            payment.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : payment.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {payment.status || "pending"}
                          </span>
                          {payment.rejection_reason && payment.status === "rejected" && (
                            <p className="text-xs text-red-400 mt-1">Reason: {payment.rejection_reason}</p>
                          )}
                        </div>
                      </div>
                      {payment.payment_image && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewPayment(payment);
                          }}
                          className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded transition-colors cursor-pointer flex-shrink-0"
                          title="Preview Payment"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Selection Info */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-gray-400 text-sm">
                  {selectedItems.length} item(s) selected
                </span>
                {canApprovePayments && localPayments.some(p => p.status === "pending") && (
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <CheckCircle size={14} /> Ready for payment approval
                  </span>
                )}
                {!canApprovePayments && localPayments.some(p => p.status === "pending") && (
                  <span className="text-yellow-400 text-sm">
                    ⚠️ Approve application & documents first to approve payments
                  </span>
                )}
              </div>
            </div>

            {/* Rejection Reason Input */}
            <div className="border-t border-gray-700 pt-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Rejection Reason {selectedItems.length > 0 && <span className="text-gray-400 text-xs">(for selected items)</span>}
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason for selected documents/payments..."
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 text-white resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Action Buttons */}
          <div className="p-4 border-t border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-gray-800">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleReject}
              disabled={submitting || selectedItems.length === 0}
              className="px-5 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? <Loader size={16} className="animate-spin" /> : <XCircle size={16} />}
              Reject Selected
            </button>
            <button
              onClick={handleApprove}
              disabled={submitting || selectedItems.length === 0}
              className="px-5 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Approve Selected
            </button>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}

      {/* Payment Preview Modal */}
      {previewPayment && (
        <PaymentPreviewModal
          payment={previewPayment}
          onClose={() => setPreviewPayment(null)}
        />
      )}
    </>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const StudentDocuments = () => {
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ============================================
  // DATA FETCHING
  // ============================================
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
  }, [refreshTrigger]);

  // In the parent component - add this useEffect
useEffect(() => {
  // When applications state changes, update selectedApplication if it exists
  if (selectedApplication) {
    const updatedApp = applications.find(a => a.id === selectedApplication.id);
    if (updatedApp) {
      setSelectedApplication(updatedApp);
    }
  }
}, [applications, selectedApplication]);

  // ============================================
  // API HANDLERS
  // ============================================
  
// Update application status - FIXED to update parent state
const updateApplicationStatus = async (id, status, reason) => {
  try {
    const response = await fetch(`${API_BASE}/admin/applications/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejection_reason: reason }),
    });

    const data = await response.json();

    if (!data.success) {
      setError(data.message || "Action failed");
      setTimeout(() => setError(""), 3000);
      return false;
    }

    // 🔥 FIX: Update the applications state immediately
    setApplications(prevApps => 
      prevApps.map(app => 
        app.id === id 
          ? { ...app, status: status, rejection_reason: reason || null }
          : app
      )
    );

    setSuccessMessage(`Application ${status} successfully!`);
    setTimeout(() => setSuccessMessage(""), 3000);
    return true;

  } catch (error) {
    console.error("Error updating application:", error);
    setError("Failed to update application status");
    setTimeout(() => setError(""), 3000);
    return false;
  }
};

  // Update document status
  const updateDocumentStatus = async (id, status, reason) => {
    try {
      const response = await fetch(`${API_BASE}/admin/application-documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejection_reason: reason }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Document ${status} successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating document:", error);
      setError("Failed to update document status");
      setTimeout(() => setError(""), 3000);
      return false;
    }
  };

  // Update payment status
  const updatePaymentStatus = async (id, status, reason) => {
    try {
      const response = await fetch(`${API_BASE}/admin/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejection_reason: reason }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Payment ${status} successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating payment:", error);
      setError("Failed to update payment status");
      setTimeout(() => setError(""), 3000);
      return false;
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
 // ============================================
// HELPER FUNCTIONS - WITH DEDUPLICATION
// ============================================

const getDocumentsForApp = (appId) => {
  return documents.filter((doc) => doc.application_id === appId);
};

const getPaymentsForApp = (appId) => {
  // Filter payments by application_id
  const filtered = payments.filter((pay) => pay.application_id === appId);
  
  // Deduplicate payments by id to prevent duplicates
  const seenIds = new Set();
  const uniquePayments = [];
  
  for (const payment of filtered) {
    if (!seenIds.has(payment.id)) {
      seenIds.add(payment.id);
      uniquePayments.push(payment);
    }
  }
  
  return uniquePayments;
};

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

  // Check if payment can be approved
  const canApprovePayment = (appId) => {
    const app = applications.find(a => a.id === appId);
    const appDocs = getDocumentsForApp(appId);
    const isAppApproved = app?.status === "approved";
    const allDocsApproved = appDocs.length > 0 && appDocs.every(doc => doc.status === "approved");
    return isAppApproved && allDocsApproved;
  };

  // ============================================
  // FILTERING
  // ============================================
  
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

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    approved: applications.filter(a => a.status === "approved").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  // ============================================
  // RENDER
  // ============================================
  
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
        {/* Success/Error Messages */}
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
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400">Applications Management</h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">Review and manage student applications, documents, and payments</p>
        </div>

        {/* Stats */}
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

        {/* Search & Filter */}
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
            onClick={() => setRefreshTrigger(prev => prev + 1)}
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
                    const allDocsApproved = appDocuments.length > 0 && appDocuments.every(doc => doc.status === "approved");
                    
                    return (
                      <tr key={app.id} className="hover:bg-gray-800/50 transition-colors">
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
                            {/* Quick action buttons */}
                            {/* <div className="flex gap-1 ml-2">
                              <button
                                onClick={async () => {
                                  const success = await updateApplicationStatus(app.id, "approved", "");
                                  if (success) setRefreshTrigger(prev => prev + 1);
                                }}
                                className="text-green-400 hover:bg-green-500/20 p-1 rounded text-xs cursor-pointer"
                                title="Approve Application"
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                onClick={async () => {
                                  const reason = prompt("Enter rejection reason:");
                                  if (reason === null) return;
                                  if (!reason.trim()) {
                                    alert("Rejection reason is required");
                                    return;
                                  }
                                  const success = await updateApplicationStatus(app.id, "rejected", reason.trim());
                                  if (success) setRefreshTrigger(prev => prev + 1);
                                }}
                                className="text-red-400 hover:bg-red-500/20 p-1 rounded text-xs cursor-pointer"
                                title="Reject Application"
                              >
                                <XCircle size={14} />
                              </button>
                            </div> */}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={async () => {
  setReviewLoading(true);

  try {
    await fetchData(); // fetch latest applications/documents/payments

    const latestApp =
      applications.find(a => a.id === app.id) || app;

    setSelectedApplication(latestApp);
    setShowReviewModal(true);
  } finally {
    setReviewLoading(false);
  }
}}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-white text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                            title="Review All (Documents & Payments)"
                          >
                            <Eye size={14} />
                            Review All
                            {appDocuments.length + appPayments.length > 0 && (
                              <span className="ml-1 bg-amber-600 px-1.5 py-0.5 rounded text-xs">
                                {appDocuments.length + appPayments.length}
                              </span>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stats */}
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

        {/* Review Modal */}
        {showReviewModal && (
          <ReviewModal
            application={selectedApplication}
            documents={getDocumentsForApp(selectedApplication?.id)}
            payments={getPaymentsForApp(selectedApplication?.id)}
            onClose={() => {
              setShowReviewModal(false);
              setRefreshTrigger(prev => prev + 1);
            }}
            onUpdateApplicationStatus={updateApplicationStatus}
            onUpdateDocumentStatus={updateDocumentStatus}
            onUpdatePaymentStatus={updatePaymentStatus}
            onRefresh={() => setRefreshTrigger(prev => prev + 1)}
          />
        )}
      </div>
    </div>
  );
};

export default StudentDocuments;