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
  Check,
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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl w-[400px] max-w-[400px] border border-gray-700 shadow-2xl">
        <div className="p-2 pl-3 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-white">
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
        <div className="p-4 flex justify-center items-center min-h-[200px] max-h-[50vh] overflow-auto">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={document.document_name || document.document_type || "Document"}
              className="max-w-full max-h-[40vh] object-contain rounded-lg"
            />
          ) : (
            <div className="text-center text-gray-400">
              {getDocumentIcon()}
              <p className="mt-4">No image available</p>
              <p className="text-sm mt-2">Document type: {document.document_type || "N/A"}</p>
            </div>
          )}
        </div>
        <div className="p-2 border-t border-gray-700 flex justify-between items-center">
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
        </div>
      </div>
    </div>
  );
};

// Payment Preview Modal
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
  const isWallet = payment.payment_method?.toLowerCase() === 'wallet';

  return (
    <div 
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl w-[400px] max-w-xl border border-gray-700 shadow-2xl">
        <div className="p-2 pl-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Payment Proof</h3>
            <p className="text-gray-400 text-sm">
              {payment.payment_method === "qr" ? "QR Payment" : 
               payment.payment_method === "upi" ? "UPI Payment" :
               payment.payment_method === "bank" ? "Bank Transfer" :
               payment.payment_method === "wallet" ? "Wallet Payment" :
               payment.payment_method || "Unknown Payment"}
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
        <div className="p-4 flex justify-center items-center min-h-[200px] max-h-[70vh] overflow-auto">
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
                      <svg class="mx-auto mb-4 w-16 h-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p>Failed to load payment image</p>
                      ${payment.utr ? `<p class="text-sm mt-2">UTR: ${payment.utr}</p>` : ''}
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="text-center text-gray-400">
              {isWallet ? (
                <>
                  <Wallet size={64} className="mx-auto mb-4 text-amber-400" />
                  <p>Wallet Payment - No screenshot required</p>
                  {payment.wallet_transaction_id && (
                    <p className="text-sm mt-2">Transaction ID: {payment.wallet_transaction_id}</p>
                  )}
                </>
              ) : (
                <>
                  <ImageIcon size={64} className="mx-auto mb-4 text-amber-400" />
                  <p>No payment screenshot attached</p>
                  {payment.utr && <p className="text-sm mt-2">UTR: {payment.utr}</p>}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Review Modal - Shows all documents and payments with checkboxes
const ReviewModal = ({ citizen, documents, payments, onClose, onApprove, onReject }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewPayment, setPreviewPayment] = useState(null);

  if (!citizen) return null;

  const allItems = [
    ...documents.map(doc => ({ ...doc, type: 'document' })),
    ...payments.map(pay => ({ ...pay, type: 'payment' }))
  ];

  const handleSelectAll = () => {
    const allIds = allItems.map(item => item.id);
    const allSelected = allIds.every(id => selectedItems.includes(id));
    
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allIds);
    }
  };

  const toggleItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = () => {
    const allIds = allItems.map(item => item.id);
    return allIds.length > 0 && allIds.every(id => selectedItems.includes(id));
  };

  const handleApprove = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to approve");
      return;
    }
    
    // Document IDs contain underscore (photo_, aadhaar_, pan_)
    // Payment IDs are numeric (just numbers)
    const docIds = selectedItems.filter(id => String(id).includes("_"));
    const paymentIds = selectedItems
      .filter(id => !String(id).includes("_"))
      .map(id => Number(id)); // Convert to number for API

    setSubmitting(true);
    await onApprove(citizen.id, docIds, paymentIds);
    setSubmitting(false);
    onClose();
  };

  const handleReject = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to reject");
      return;
    }

    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    // Document IDs contain underscore (photo_, aadhaar_, pan_)
    // Payment IDs are numeric (just numbers)
    const docIds = selectedItems.filter(id => String(id).includes("_"));
    const paymentIds = selectedItems
      .filter(id => !String(id).includes("_"))
      .map(id => Number(id)); // Convert to number for API

    setSubmitting(true);
    await onReject(citizen.id, docIds, paymentIds, rejectReason);
    setSubmitting(false);
    onClose();
  };

  const getOverallStatus = () => {
    if (citizen.verification_status === "approved" || citizen.verification_status === "verified") {
      return { label: "Approved", color: "bg-green-500/20 text-green-400", icon: CheckCircle };
    }
    if (citizen.verification_status === "rejected") {
      return { label: "Rejected", color: "bg-red-500/20 text-red-400", icon: XCircle };
    }
    return { label: "Pending", color: "bg-yellow-500/20 text-yellow-400", icon: Clock };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  return (
    <>
      <div 
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" 
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] border border-gray-700 shadow-2xl flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
            <div>
              <h3 className="text-xl font-bold text-white">Review Documents & Payments</h3>
              <p className="text-gray-400 text-sm">{citizen.name}</p>
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

          <div className="p-4 overflow-y-auto flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
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
                <span className="text-gray-400 text-sm">
                  Selected: {selectedItems.length} items
                </span>
              </div>
            </div>

            {/* Documents Section */}
            {documents.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <FileText size={16} /> Documents ({documents.length})
                </h4>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 flex items-center justify-between">
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
              </div>
            )}

            {/* Payments Section */}
            {payments.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <DollarSign size={16} /> Payments ({payments.length})
                </h4>
                <div className="space-y-2">
                  {payments.map((payment) => {
                    const isWallet = payment.payment_method?.toLowerCase() === 'wallet';
                    const hasImage = payment.payment_image && payment.payment_image.length > 0;
                    
                    return (
                      <div key={payment.id} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(payment.id)}
                            onChange={() => toggleItem(payment.id)}
                            className="w-4 h-4 rounded border-gray-500 text-amber-500 focus:ring-amber-500 cursor-pointer flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium">₹{parseFloat(payment.amount || 0).toLocaleString()}</p>
                              <span className="text-xs text-gray-400 capitalize">{payment.payment_method}</span>
                              {isWallet && (
                                <span className="text-xs text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded">
                                  Wallet
                                </span>
                              )}
                              {!isWallet && hasImage && (
                                <span className="text-xs text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">
                                  📷
                                </span>
                              )}
                              {!isWallet && !hasImage && (
                                <span className="text-xs text-gray-500 bg-gray-500/20 px-1.5 py-0.5 rounded">
                                  No Image
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs">Citizen ID: {payment.citizen_id}</p>
                            {payment.utr && (
                              <p className="text-gray-400 text-xs font-mono truncate">UTR: {payment.utr}</p>
                            )}
                            <p className="text-gray-500 text-xs">Submitted: {new Date(payment.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {/* Show Eye button for ANY payment that has an image */}
                        {hasImage && (
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
                        {/* Show Wallet icon for wallet payments without image */}
                        {isWallet && !hasImage && (
                          <div className="p-1.5 text-green-400 flex-shrink-0" title="Wallet Payment">
                            <Wallet size={18} />
                          </div>
                        )}
                        {/* Show No Image icon for non-wallet payments without image */}
                        {!isWallet && !hasImage && (
                          <div className="p-1.5 text-gray-500 flex-shrink-0" title="No payment image">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {documents.length === 0 && payments.length === 0 && (
              <p className="text-gray-400 text-center py-8">No documents or payments to review</p>
            )}

            {/* Rejection Reason */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-300 block mb-2">Rejection Reason (for rejected items)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 text-white resize-none"
                rows={2}
              />
            </div>
          </div>

          <div className="p-4 border-t border-gray-700 flex justify-between items-center flex-shrink-0">
            <span className="text-gray-400 text-sm">
              {selectedItems.length} item(s)
            </span>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={submitting || selectedItems.length === 0}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? <Loader size={16} className="animate-spin" /> : <XCircle size={16} />}
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting || selectedItems.length === 0}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modals rendered outside with higher z-index */}
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
    </>
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
  const [reviewModal, setReviewModal] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const citizensRes = await fetch(`${API_BASE}/citizens/all`);
      const citizensData = await citizensRes.json();

      const docsRes = await fetch(`${API_BASE}/citizen-documents`);
      const docsData = await docsRes.json();

      const paysRes = await fetch(`${API_BASE}/citizen-payment/admin/all`);
      const paysData = await paysRes.json();

      if (citizensData.success) {
        setCitizens(citizensData.data || []);
      }
      
      if (docsData.success) {
        const transformedDocs = [];
        docsData.data.forEach(citizen => {
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
        const paymentsData = paysData.payments || [];
        const uniquePayments = [];
        const seenIds = new Set();
        for (const payment of paymentsData) {
          if (!seenIds.has(payment.id)) {
            seenIds.add(payment.id);
            uniquePayments.push(payment);
          }
        }
        setPayments(uniquePayments);
      }
    } catch (error) {
      setError("Failed to fetch data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDocumentsForCitizen = (citizenId) => {
    return documents.filter((doc) => doc.citizen_id === citizenId);
  };

  const getPaymentsForCitizen = (citizenId) => {
    const citizen = citizens.find(c => c.id === citizenId);
    if (!citizen) {
      return [];
    }
    
    // Use the citizen's user_id to match payments (citizen_payment_history.citizen_id references users.id)
    const userId = citizen.user_id || citizenId;
    
    const filtered = payments.filter((pay) => {
      return pay.citizen_id === userId;
    });
    
    const uniquePayments = [];
    const seenIds = new Set();
    for (const payment of filtered) {
      if (!seenIds.has(payment.id)) {
        seenIds.add(payment.id);
        uniquePayments.push(payment);
      }
    }
    return uniquePayments;
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

  const getStatusBadge = (status) => {
    const statusMap = {
      "approved": { icon: CheckCircle, color: "green", label: "Approved", bg: "bg-green-500/20", text: "text-green-400" },
      "verified": { icon: CheckCircle, color: "green", label: "Verified", bg: "bg-green-500/20", text: "text-green-400" },
      "rejected": { icon: XCircle, color: "red", label: "Rejected", bg: "bg-red-500/20", text: "text-red-400" },
      "pending": { icon: Clock, color: "yellow", label: "Pending", bg: "bg-yellow-500/20", text: "text-yellow-400" },
    };
    const s = statusMap[status] || statusMap.pending;
    const Icon = s.icon;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text} flex items-center gap-1 w-fit`}>
        <Icon size={12} /> {s.label}
      </span>
    );
  };

  const handleBulkApprove = async (citizenId, docIds, paymentIds) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/citizens/${citizenId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verification_status: "approved",
          rejection_reason: null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update citizen");
      }

      for (const paymentId of paymentIds) {
        try {
          await fetch(`${API_BASE}/citizen-payment/admin/approve/${paymentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ admin_id: 1 }),
          });
        } catch (payErr) {
          console.error(`Error approving payment ${paymentId}:`, payErr);
        }
      }

      setSuccessMessage(`Successfully approved ${docIds.length + paymentIds.length} items!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchData();
    } catch (error) {
      setError("Failed to approve items");
      setTimeout(() => setError(""), 3000);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkReject = async (citizenId, docIds, paymentIds, reason) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/citizens/${citizenId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verification_status: "rejected",
          rejection_reason: reason,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update citizen");
      }

      for (const paymentId of paymentIds) {
        try {
          await fetch(`${API_BASE}/citizen-payment/admin/reject/${paymentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              admin_id: 1, 
              rejection_reason: reason 
            }),
          });
        } catch (payErr) {
          console.error(`Error rejecting payment ${paymentId}:`, payErr);
        }
      }

      setSuccessMessage(`Successfully rejected ${docIds.length + paymentIds.length} items!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchData();
    } catch (error) {
      setError("Failed to reject items");
      setTimeout(() => setError(""), 3000);
    } finally {
      setProcessing(false);
    }
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredCitizens.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center px-4 py-8 text-gray-400">
                      No citizens found
                    </td>
                  </tr>
                ) : (
                  filteredCitizens.map((citizen) => {
                    const citizenDocuments = getDocumentsForCitizen(citizen.id);
                    const citizenPayments = getPaymentsForCitizen(citizen.id);
                    
                    return (
                      <tr key={citizen.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-amber-400">{citizen.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{citizen.name || "N/A"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{citizen.nominee_name || citizen.nominee || "N/A"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{citizen.phone || "N/A"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {citizen.aadhaar_number ? `XXXX-XXXX-${citizen.aadhaar_number.slice(-4)}` : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(citizen.verification_status)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => setReviewModal({ 
                              citizen, 
                              documents: citizenDocuments, 
                              payments: citizenPayments 
                            })}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-white text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                            title="Review Documents & Payments"
                          >
                            <Eye size={14} />
                            View All
                            {citizenDocuments.length + citizenPayments.length > 0 && (
                              <span className="ml-1 bg-amber-600 px-1.5 py-0.5 rounded text-xs">
                                {citizenDocuments.length + citizenPayments.length}
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
        {reviewModal && (
          <ReviewModal
            citizen={reviewModal.citizen}
            documents={reviewModal.documents}
            payments={reviewModal.payments}
            onClose={() => setReviewModal(null)}
            onApprove={handleBulkApprove}
            onReject={handleBulkReject}
          />
        )}
      </div>
    </div>
  );
};

export default CitizenDocuments;