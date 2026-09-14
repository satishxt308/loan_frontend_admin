// src/pages/citizens/CitizenDocuments.jsx
import React, { useState, useEffect } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
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
  Wallet,
  User,
  CreditCard,
  File,
  Check,
  Download,
  Users2,          // NEW for family card
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// =========================================================
// Document Preview Modal
// =========================================================
const DocumentPreviewModal = ({ document, onClose }) => {
  if (!document) return null;

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
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl w-[420px] max-w-[420px] border border-gray-700 shadow-2xl">
        <div className="p-3 pl-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-white">
              {document.document_key || document.document_type || "Document"}
            </h3>
            <p className="text-gray-400 text-xs">
              {document.document_name || document.citizen_name || "Citizen Document"}
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
              alt="Document"
              className="max-w-full max-h-[40vh] object-contain rounded-lg"
            />
          ) : (
            <div className="text-center text-gray-400">
              <FileText size={48} className="mx-auto text-amber-400" />
              <p className="mt-4">No image available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================
// Payment Preview Modal
// =========================================================
const PaymentPreviewModal = ({ payment, onClose }) => {
  if (!payment) return null;

  const getImageSource = () => {
    if (!payment.payment_image) return null;
    if (payment.payment_image.startsWith("data:image")) return payment.payment_image;
    if (payment.payment_image.startsWith("/9j/"))
      return `data:image/jpeg;base64,${payment.payment_image}`;
    if (payment.payment_image.startsWith("iVBOR"))
      return `data:image/png;base64,${payment.payment_image}`;
    return payment.payment_image;
  };

  const imageSrc = getImageSource();
  const isWallet = payment.payment_method?.toLowerCase() === "wallet";

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl w-full max-w-xl border border-gray-700 shadow-2xl">
        <div className="p-3 pl-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Payment Proof</h3>
            <p className="text-gray-400 text-sm">
              ₹{parseFloat(payment.amount || 0).toLocaleString()} •{" "}
              {payment.payment_type === "family_development_card"
                ? "Family Development Card"
                : "Citizen Card"}{" "}
              • {payment.payment_method}
              {payment.utr && ` • UTR: ${payment.utr}`}
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
            />
          ) : (
            <div className="text-center text-gray-400">
              {isWallet ? (
                <>
                  <Wallet size={64} className="mx-auto mb-4 text-amber-400" />
                  <p>Wallet Payment - No screenshot required</p>
                </>
              ) : (
                <>
                  <ImageIcon size={64} className="mx-auto mb-4 text-amber-400" />
                  <p>No payment screenshot attached</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================
// Family Members Section (inside Review Modal)
// =========================================================
const FamilyMembersSection = ({ members, onPreviewPhoto }) => {
  if (!members || members.length === 0) return null;

  return (
    <div className="mb-6">
      {/* <h4 className="text-md font-semibold text-amber-400 mb-3 flex items-center gap-2">
        <Users2 size={16} /> Family Members ({members.length})
      </h4> */}
      <div className="space-y-2">
        {members.map((m, idx) => (
          <div
            key={m.id || idx}
            className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400 font-bold text-sm">
                  {m.member_number || idx + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{m.name || "N/A"}</p>
                <p className="text-gray-400 text-xs">
                  {m.relation || "N/A"} • Age: {m.age || "N/A"}
                </p>
              </div>
            </div>
            {m.photo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreviewPhoto(m);
                }}
                className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded transition-colors cursor-pointer flex-shrink-0"
                title="Preview Member Photo"
              >
                <Eye size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================
// Review Modal
// =========================================================
const ReviewModal = ({
  citizen,
  documents,
  payments,
  familyMembers,
  onClose,
  onApprove,
  onReject,
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewPayment, setPreviewPayment] = useState(null);
  const [previewMember, setPreviewMember] = useState(null);
  const [showFamily, setShowFamily] = useState(true);

  if (!citizen) return null;

  const allItems = [
    ...documents.map((doc) => ({ ...doc, type: "document" })),
    ...payments.map((pay) => ({ ...pay, type: "payment" })),
  ];

  const handleSelectAll = () => {
    const allIds = allItems.map((item) => item.id);
    const allSelected = allIds.every((id) => selectedItems.includes(id));
    setSelectedItems(allSelected ? [] : allIds);
  };

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = () => {
    const allIds = allItems.map((item) => item.id);
    return allIds.length > 0 && allIds.every((id) => selectedItems.includes(id));
  };

  const handleApprove = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to approve");
      return;
    }

    const docIds = selectedItems.filter((id) => String(id).includes("_"));
    const paymentIds = selectedItems
      .filter((id) => !String(id).includes("_"))
      .map((id) => Number(id));

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

    const docIds = selectedItems.filter((id) => String(id).includes("_"));
    const paymentIds = selectedItems
      .filter((id) => !String(id).includes("_"))
      .map((id) => Number(id));

    setSubmitting(true);
    await onReject(citizen.id, docIds, paymentIds, rejectReason);
    setSubmitting(false);
    onClose();
  };

  const getOverallStatus = () => {
    if (
      citizen.verification_status === "approved" ||
      citizen.verification_status === "verified"
    ) {
      return {
        label: "Approved",
        color: "bg-green-500/20 text-green-400",
        icon: CheckCircle,
      };
    }
    if (citizen.verification_status === "rejected") {
      return {
        label: "Rejected",
        color: "bg-red-500/20 text-red-400",
        icon: XCircle,
      };
    }
    return {
      label: "Pending",
      color: "bg-yellow-500/20 text-yellow-400",
      icon: Clock,
    };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;
  const wantsFamilyCard = citizen.want_family_development_card === true;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] border border-gray-700 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white truncate">
                Review Documents & Payments
              </h3>
              <p className="text-gray-400 text-sm">
                {citizen.name} • ID: {citizen.id}
              </p>

              {/* Family Card Badge */}
              {wantsFamilyCard && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                  <Users2 size={12} />
                  Family Development Card ({citizen.family_member_count || 0} members)
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 ml-3">
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${overallStatus.color} flex items-center gap-2`}
              >
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

          {/* Body */}
          <div className="p-4 overflow-y-auto flex-1">
            {/* Select All row */}
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
                  Selected: {selectedItems.length} of {allItems.length}
                </span>
              </div>
            </div>

            {/* Documents */}
            {documents.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <FileText size={16} /> Documents ({documents.length})
                </h4>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 flex items-center justify-between"
                    >
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
                          <p className="text-gray-400 text-xs capitalize">
                            {doc.document_type || "Document"}
                          </p>
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

            {/* Family Members */}
            {wantsFamilyCard && (
              <>
                <button
                  onClick={() => setShowFamily(!showFamily)}
                  className="w-full flex items-center justify-between text-md font-semibold text-amber-400 mb-3"
                >
                  <span className="flex items-center gap-2">
                    <Users2 size={16} /> Family Members ({familyMembers.length})
                  </span>
                  {showFamily ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showFamily && (
                  <FamilyMembersSection
                    members={familyMembers}
                    onPreviewPhoto={(m) =>
                      setPreviewMember({
                        document_key: `${m.name} (${m.relation})`,
                        document_name: `Family member #${m.member_number}`,
                        document_file: m.photo,
                      })
                    }
                  />
                )}
              </>
            )}

            {/* Payments */}
            {payments.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <DollarSign size={16} /> Payments ({payments.length})
                </h4>
                <div className="space-y-2">
                  {payments.map((payment) => {
                    const isWallet =
                      payment.payment_method?.toLowerCase() === "wallet";
                    const hasImage =
                      payment.payment_image && payment.payment_image.length > 0;
                    const isFamily =
                      payment.payment_type === "family_development_card";

                    return (
                      <div
                        key={payment.id}
                        className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(payment.id)}
                            onChange={() => toggleItem(payment.id)}
                            className="w-4 h-4 rounded border-gray-500 text-amber-500 focus:ring-amber-500 cursor-pointer flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white font-medium">
                                ₹{parseFloat(payment.amount || 0).toLocaleString()}
                              </p>
                              <span className="text-xs text-gray-400 capitalize">
                                {payment.payment_method}
                              </span>
                              {isFamily && (
                                <span className="text-xs text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                                  Family Card
                                </span>
                              )}
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
                            </div>
                            <p className="text-gray-400 text-xs">
                              Status: {payment.status}
                            </p>
                            {payment.utr && (
                              <p className="text-gray-400 text-xs font-mono truncate">
                                UTR: {payment.utr}
                              </p>
                            )}
                            <p className="text-gray-500 text-xs">
                              Submitted:{" "}
                              {new Date(payment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
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
                        {isWallet && !hasImage && (
                          <div
                            className="p-1.5 text-green-400 flex-shrink-0"
                            title="Wallet Payment"
                          >
                            <Wallet size={18} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {documents.length === 0 &&
              payments.length === 0 &&
              familyMembers.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  No documents, family members, or payments to review
                </p>
              )}

            {/* Rejection Reason */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-300 block mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 text-white resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 flex justify-between items-center flex-shrink-0">
            <span className="text-gray-400 text-sm">
              {selectedItems.length} item(s) selected
            </span>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={submitting || selectedItems.length === 0}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white"
              >
                {submitting ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting || selectedItems.length === 0}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white"
              >
                {submitting ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modals */}
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
      {previewMember && (
        <DocumentPreviewModal
          document={previewMember}
          onClose={() => setPreviewMember(null)}
        />
      )}
    </>
  );
};

// =========================================================
// Main Component
// =========================================================
const CitizenDocuments = () => {
  const [citizens, setCitizens] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [familyMembersByCitizen, setFamilyMembersByCitizen] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reviewModal, setReviewModal] = useState(null);
  const [processing, setProcessing] = useState(false);

  // -------- Fetch all data --------
  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      // 1) Citizens
      const citizensRes = await fetch(`${API_BASE}/citizens/all`);
      const citizensData = await citizensRes.json();

      // 2) Documents (from citizens endpoint too)
      const docsRes = await fetch(`${API_BASE}/citizen-documents`);
      const docsData = await docsRes.json();

      // 3) Payments
      const paysRes = await fetch(`${API_BASE}/citizen-payment/admin/all`);
      const paysData = await paysRes.json();

      // ---- Citizens ----
      let citizenList = [];
      if (citizensData.success) {
        citizenList = citizensData.data || [];
        setCitizens(citizenList);
      }

      // ---- Build family members map (from citizens payload) ----
      const familyMap = {};
      citizenList.forEach((c) => {
        if (
          c.want_family_development_card === true &&
          Array.isArray(c.family_members) &&
          c.family_members.length > 0
        ) {
          familyMap[c.id] = c.family_members;
        }
      });
      setFamilyMembersByCitizen(familyMap);

      // ---- Documents ----
      if (docsData.success) {
        const transformedDocs = [];
        (docsData.data || []).forEach((citizen) => {
          if (citizen.photo) {
            transformedDocs.push({
              id: `photo_${citizen.id}`,
              citizen_id: citizen.id,
              document_key: "Photo",
              document_type: "photo",
              document_name: `${citizen.name || "Citizen"}_photo`,
              document_file: citizen.photo,
              status: citizen.verification_status || "pending",
              rejection_reason: citizen.rejection_reason || null,
              created_at: citizen.created_at,
              updated_at: citizen.updated_at,
            });
          }
          if (citizen.aadhaar_card_image) {
            transformedDocs.push({
              id: `aadhaar_${citizen.id}`,
              citizen_id: citizen.id,
              document_key: "Aadhaar Card",
              document_type: "aadhaar_card",
              document_name: `${citizen.name || "Citizen"}_aadhaar`,
              document_file: citizen.aadhaar_card_image,
              status: citizen.verification_status || "pending",
              rejection_reason: citizen.rejection_reason || null,
              created_at: citizen.created_at,
              updated_at: citizen.updated_at,
            });
          }
          if (citizen.pan_card_image) {
            transformedDocs.push({
              id: `pan_${citizen.id}`,
              citizen_id: citizen.id,
              document_key: "PAN Card",
              document_type: "pan_card",
              document_name: `${citizen.name || "Citizen"}_pan`,
              document_file: citizen.pan_card_image,
              status: citizen.verification_status || "pending",
              rejection_reason: citizen.rejection_reason || null,
              created_at: citizen.created_at,
              updated_at: citizen.updated_at,
            });
          }
        });
        setDocuments(transformedDocs);
      }

      // ---- Payments (dedupe by id) ----
      if (paysData.success) {
        const uniquePayments = [
          ...new Map((paysData.payments || []).map((p) => [p.id, p])).values(),
        ];
        setPayments(uniquePayments);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDocumentsForCitizen = (citizenId) =>
    documents.filter((doc) => doc.citizen_id === citizenId);

  const getPaymentsForCitizen = (citizenId) => {
    const citizen = citizens.find((c) => c.id === citizenId);
    if (!citizen) return [];
    const userId = citizen.user_id || citizenId;

    return [
      ...new Map(
        payments.filter((p) => p.citizen_id === userId).map((p) => [p.id, p])
      ).values(),
    ];
  };

  const getFamilyMembersForCitizen = (citizenId) =>
    familyMembersByCitizen[citizenId] || [];

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

    const matchesStatus =
      statusFilter === "all" || citizen.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: {
        icon: CheckCircle,
        label: "Approved",
        bg: "bg-green-500/20",
        text: "text-green-400",
      },
      verified: {
        icon: CheckCircle,
        label: "Verified",
        bg: "bg-green-500/20",
        text: "text-green-400",
      },
      rejected: {
        icon: XCircle,
        label: "Rejected",
        bg: "bg-red-500/20",
        text: "text-red-400",
      },
      pending: {
        icon: Clock,
        label: "Pending",
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
      },
    };
    const s = statusMap[status] || statusMap.pending;
    const Icon = s.icon;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text} flex items-center gap-1 w-fit`}
      >
        <Icon size={12} /> {s.label}
      </span>
    );
  };

  const handleBulkApprove = async (citizenId, docIds, paymentIds) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/citizens/${citizenId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
          await fetch(
            `${API_BASE}/citizen-payment/admin/approve/${paymentId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ admin_id: 1 }),
            }
          );
        } catch (e) {
          console.error("Approve payment error:", e);
        }
      }

      setSuccessMessage(
        `Successfully approved ${docIds.length + paymentIds.length} items!`
      );
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
        headers: { "Content-Type": "application/json" },
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
          await fetch(
            `${API_BASE}/citizen-payment/admin/reject/${paymentId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                admin_id: 1,
                rejection_reason: reason,
              }),
            }
          );
        } catch (e) {
          console.error("Reject payment error:", e);
        }
      }

      setSuccessMessage(
        `Successfully rejected ${docIds.length + paymentIds.length} items!`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchData();
    } catch (error) {
      setError("Failed to reject items");
      setTimeout(() => setError(""), 3000);
    } finally {
      setProcessing(false);
    }
  };

  // ---- Extended stats ----
  const stats = {
    total: citizens.length,
    pending: citizens.filter((c) => c.verification_status === "pending").length,
    approved: citizens.filter(
      (c) =>
        c.verification_status === "approved" ||
        c.verification_status === "verified"
    ).length,
    rejected: citizens.filter((c) => c.verification_status === "rejected")
      .length,
    familyCards: citizens.filter(
      (c) => c.want_family_development_card === true
    ).length,
    pendingPayments: payments.filter((p) => p.status === "PENDING").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Fetching all citizens...</p>
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

        {/* Header with Fetch All */}
        <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-transparent p-4 md:p-6 rounded-2xl border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-amber-400">
              Citizen Documents & Payments
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-1">
              Fetching <span className="text-amber-400 font-semibold">all</span>{" "}
              citizens — {citizens.length} total
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Fetch All
          </button>
        </div>

        {/* Stats - now 6 cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.pending}
                </p>
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
                <p className="text-2xl font-bold text-green-400">
                  {stats.approved}
                </p>
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
                <p className="text-2xl font-bold text-red-400">
                  {stats.rejected}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Family Cards</p>
                <p className="text-2xl font-bold text-amber-400">
                  {stats.familyCards}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Users2 className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Payments</p>
                <p className="text-2xl font-bold text-blue-400">
                  {stats.pendingPayments}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-400" />
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
            className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Nominee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Aadhaar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Family
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredCitizens.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center px-4 py-8 text-gray-400"
                    >
                      No citizens found
                    </td>
                  </tr>
                ) : (
                  filteredCitizens.map((citizen) => {
                    const citizenDocuments = getDocumentsForCitizen(citizen.id);
                    const citizenPayments = getPaymentsForCitizen(citizen.id);
                    const citizenFamily = getFamilyMembersForCitizen(
                      citizen.id
                    );
                    const wantsFamilyCard =
                      citizen.want_family_development_card === true;

                    return (
                      <tr
                        key={citizen.id}
                        className="hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-amber-400">
                          {citizen.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                          {citizen.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {citizen.nominee_name || citizen.nominee || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {citizen.phone || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {citizen.aadhaar_number
                            ? `XXXX-XXXX-${citizen.aadhaar_number.slice(-4)}`
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {wantsFamilyCard ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                              <Users2 size={12} />
                              {citizenFamily.length ||
                                citizen.family_member_count ||
                                0}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(citizen.verification_status)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() =>
                              setReviewModal({
                                citizen,
                                documents: citizenDocuments,
                                payments: citizenPayments,
                                familyMembers: citizenFamily,
                              })
                            }
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-white text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Eye size={14} />
                            View All
                            {citizenDocuments.length +
                              citizenPayments.length +
                              citizenFamily.length >
                              0 && (
                              <span className="ml-1 bg-amber-600 px-1.5 py-0.5 rounded text-xs">
                                {citizenDocuments.length +
                                  citizenPayments.length +
                                  citizenFamily.length}
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
              <span className="text-gray-400">
                Total Citizens:{" "}
                <span className="text-amber-400 font-semibold">
                  {citizens.length}
                </span>
              </span>
              <span className="text-gray-400">
                Showing:{" "}
                <span className="text-amber-400 font-semibold">
                  {filteredCitizens.length}
                </span>
              </span>
              <span className="text-gray-400">
                Pending:{" "}
                <span className="text-yellow-400 font-semibold">
                  {stats.pending}
                </span>{" "}
                | Approved:{" "}
                <span className="text-green-400 font-semibold">
                  {stats.approved}
                </span>{" "}
                | Rejected:{" "}
                <span className="text-red-400 font-semibold">
                  {stats.rejected}
                </span>{" "}
                | Family Cards:{" "}
                <span className="text-amber-400 font-semibold">
                  {stats.familyCards}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {reviewModal && (
          <ReviewModal
            citizen={reviewModal.citizen}
            documents={reviewModal.documents}
            payments={reviewModal.payments}
            familyMembers={reviewModal.familyMembers}
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