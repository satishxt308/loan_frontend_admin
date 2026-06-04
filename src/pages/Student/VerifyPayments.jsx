import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  Eye,
  X,
  AlertTriangle,
  Clock,
  RefreshCw,
  User,
  Hash,
  Calendar,
  CreditCard,
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck,
  Loader2,
  FileText,
  DollarSign,
  Layers,
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
   STATUS BADGE
───────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    pending: {
      bg: "bg-amber-500/15 border-amber-500/40",
      text: "text-amber-400",
      icon: <Clock className="w-3 h-3" />,
      label: "Pending",
    },
    approved: {
      bg: "bg-emerald-500/15 border-emerald-500/40",
      text: "text-emerald-400",
      icon: <CheckCircle className="w-3 h-3" />,
      label: "Approved",
    },
    rejected: {
      bg: "bg-red-500/15 border-red-500/40",
      text: "text-red-400",
      icon: <XCircle className="w-3 h-3" />,
      label: "Rejected",
    },
  };
  const s = map[status] || map.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${s.bg} ${s.text}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
};

/* ─────────────────────────────────────────
   PAYMENT TYPE BADGE
───────────────────────────────────────── */
const PaymentTypeBadge = ({ isEmi }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
      isEmi
        ? "bg-violet-500/15 border-violet-500/40 text-violet-400"
        : "bg-blue-500/15 border-blue-500/40 text-blue-400"
    }`}
  >
    {isEmi ? <Layers className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
    {isEmi ? "EMI Payment" : "Registration Fee"}
  </span>
);

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function VerifyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Screenshot modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Reject reason modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Action loading
  const [actionLoading, setActionLoading] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Fetch pending payments ── */
  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/payment/admin/pending`);
      if (res.data.success) {
        setPayments(res.data.payments || []);
      } else {
        setError("Failed to load payments.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Server error. Please retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  /* ── Open screenshot modal ── */
  const openModal = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  /* ── APPROVE ── */
  const handleApprove = async (paymentId) => {
    setActionLoading(paymentId + "_approve");
    try {
      const res = await axios.post(`${API}/payment/admin/approve/${paymentId}`);
      if (res.data.success) {
        showToast("success", "Payment approved successfully! Student notified.");
        setPayments((prev) => prev.filter((p) => p.id !== paymentId));
        if (showModal && selectedPayment?.id === paymentId) closeModal();
      } else {
        showToast("error", res.data.message || "Approval failed.");
      }
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Server error.");
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Open reject reason modal ── */
  const openRejectModal = (payment) => {
    setRejectTarget(payment);
    setRejectReason("");
    setShowRejectModal(true);
  };
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectTarget(null);
    setRejectReason("");
  };

  /* ── REJECT ── */
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showToast("error", "Please provide a rejection reason.");
      return;
    }
    const paymentId = rejectTarget.id;
    setActionLoading(paymentId + "_reject");
    try {
      const res = await axios.post(`${API}/payment/admin/reject/${paymentId}`, {
        reason: rejectReason.trim(),
      });
      if (res.data.success) {
        showToast("error", "Payment rejected. Student notified.");
        setPayments((prev) => prev.filter((p) => p.id !== paymentId));
        closeRejectModal();
        if (showModal && selectedPayment?.id === paymentId) closeModal();
      } else {
        showToast("error", res.data.message || "Rejection failed.");
      }
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Server error.");
    } finally {
      setActionLoading(null);
    }
  };

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 p-6">

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
              : "bg-red-500/20 border-red-500/50 text-red-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span>Student</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-amber-400">Verify Payments</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-500/30 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Payment Verification</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Review and approve EMI repayments &amp; registration payments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pending count badge */}
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-semibold text-sm">
                {payments.length} Pending
              </span>
            </div>
            {/* Refresh */}
            <button
              onClick={fetchPending}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/60 hover:bg-gray-700 border border-gray-600 rounded-xl text-gray-300 hover:text-white text-sm transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
          <p className="text-gray-400 text-sm">Loading pending payments…</p>
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={fetchPending}
            className="px-5 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 rounded-xl text-sm transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && payments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-white font-semibold text-lg">All caught up!</h3>
          <p className="text-gray-500 text-sm text-center max-w-xs">
            No pending payment verifications right now. Check back later.
          </p>
        </div>
      )}

      {/* ── Payment Cards Grid ── */}
      {!loading && !error && payments.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {payments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onView={() => openModal(payment)}
              onApprove={() => handleApprove(payment.id)}
              onReject={() => openRejectModal(payment)}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════
          SCREENSHOT MODAL
      ══════════════════════════════════════════ */}
      {showModal && selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-3xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-700/60 bg-gray-800/60">
              <div>
                <h2 className="text-white font-semibold text-lg">Payment Details</h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  {selectedPayment.full_name} — {selectedPayment.student_id || "No ID yet"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 max-h-[75vh] overflow-auto">
              {/* Screenshot */}
              <div className="p-5 flex flex-col items-center justify-center bg-gray-800/30 border-r border-gray-700/50 min-h-64">
                {selectedPayment.payment_image_base64 ? (
                  <img
                    src={`data:image/jpeg;base64,${selectedPayment.payment_image_base64}`}
                    alt="Payment Screenshot"
                    className="max-w-full max-h-96 object-contain rounded-xl border border-gray-700 shadow-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <ImageIcon className="w-12 h-12 opacity-40" />
                    <span className="text-sm">No screenshot uploaded</span>
                  </div>
                )}
              </div>

              {/* Info panel */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <PaymentTypeBadge isEmi={!!selectedPayment.emi_id} />
                  <StatusBadge status={selectedPayment.status} />
                </div>

                {/* EMI Details if applicable */}
                {selectedPayment.emi_id && (
                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-3 space-y-2">
                    <p className="text-violet-300 text-xs font-semibold uppercase tracking-wide mb-1">EMI Details</p>
                    <InfoRow icon={<Layers className="w-4 h-4 text-violet-400" />} label="Scheme" value={selectedPayment.scheme_name || "—"} />
                    <InfoRow icon={<Hash className="w-4 h-4 text-violet-400" />} label="EMI Number" value={selectedPayment.emi_number ? `EMI #${selectedPayment.emi_number}` : "—"} />
                    <InfoRow icon={<DollarSign className="w-4 h-4 text-violet-400" />} label="EMI Amount" value={selectedPayment.emi_amount ? `₹${parseFloat(selectedPayment.emi_amount).toLocaleString('en-IN')}` : "—"} />
                    <InfoRow icon={<Calendar className="w-4 h-4 text-violet-400" />} label="Due Date" value={selectedPayment.due_date ? new Date(selectedPayment.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"} />
                  </div>
                )}

                <InfoRow icon={<User className="w-4 h-4 text-amber-400" />} label="Student Name" value={selectedPayment.full_name} />
                <InfoRow icon={<Hash className="w-4 h-4 text-amber-400" />} label="UTR / Reference" value={selectedPayment.utr || "—"} mono />
                <InfoRow icon={<CreditCard className="w-4 h-4 text-amber-400" />} label="Payment Via" value={selectedPayment.via_payment?.toUpperCase() || "—"} />
                <InfoRow icon={<Calendar className="w-4 h-4 text-amber-400" />} label="Submitted On" value={formatDate(selectedPayment.created_at)} />
                <InfoRow icon={<User className="w-4 h-4 text-amber-400" />} label="Email" value={selectedPayment.email} />
                <InfoRow icon={<User className="w-4 h-4 text-amber-400" />} label="Phone" value={selectedPayment.phone_number} />

                {/* Action Buttons */}
                <div className="flex gap-3 pt-3 border-t border-gray-700/50">
                  <button
                    onClick={() => handleApprove(selectedPayment.id)}
                    disabled={actionLoading === selectedPayment.id + "_approve"}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-400 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                  >
                    {actionLoading === selectedPayment.id + "_approve" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => { closeModal(); openRejectModal(selectedPayment); }}
                    disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 hover:border-red-400/60 text-red-400 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          REJECT REASON MODAL
      ══════════════════════════════════════════ */}
      {showRejectModal && rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeRejectModal}
        >
          <div
            className="w-full max-w-md bg-gray-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-700/60 bg-red-500/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Reject Payment</h2>
                  <p className="text-gray-400 text-xs mt-0.5">{rejectTarget.full_name}</p>
                </div>
              </div>
              <button onClick={closeRejectModal} className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-gray-400 text-sm">
                Please provide a clear reason for rejecting this payment. The student will be notified with your reason.
              </p>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
                  Rejection Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Screenshot is unclear, UTR number mismatch, payment not received..."
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-600 focus:border-red-500/60 focus:outline-none text-white placeholder-gray-500 text-sm rounded-xl px-4 py-3 resize-none transition-colors"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeRejectModal}
                  className="flex-1 py-2.5 px-4 bg-gray-700/60 hover:bg-gray-700 border border-gray-600 text-gray-300 rounded-xl text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading === rejectTarget.id + "_reject" || !rejectReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {actionLoading === rejectTarget.id + "_reject" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   PAYMENT CARD COMPONENT
───────────────────────────────────────── */
function PaymentCard({ payment, onView, onApprove, onReject, actionLoading }) {
  const isApproving = actionLoading === payment.id + "_approve";
  const isRejecting = actionLoading === payment.id + "_reject";
  const busy = isApproving || isRejecting;

  return (
    <div className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
      {/* Gold shimmer line at top */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{payment.full_name}</p>
            <p className="text-gray-500 text-xs truncate">{payment.email}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={payment.status} />
          <PaymentTypeBadge isEmi={!!payment.emi_id} />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <DetailChip icon={<Hash className="w-3 h-3" />} label="UTR" value={payment.utr ? payment.utr.slice(0, 14) + (payment.utr.length > 14 ? "…" : "") : "—"} />
        <DetailChip icon={<CreditCard className="w-3 h-3" />} label="Via" value={payment.via_payment?.toUpperCase() || "—"} />
        <DetailChip icon={<Calendar className="w-3 h-3" />} label="Date" value={formatDate(payment.created_at).split(",")[0]} />
        <DetailChip icon={<User className="w-3 h-3" />} label="Phone" value={payment.phone_number || "—"} />
      </div>

      {/* EMI Details if applicable */}
      {payment.emi_id && (
        <div className="mb-4 bg-violet-500/10 border border-violet-500/30 rounded-xl p-3">
          <p className="text-violet-400 text-xs font-semibold uppercase tracking-wide mb-2">EMI Details</p>
          <div className="grid grid-cols-2 gap-2">
            <DetailChip icon={<Layers className="w-3 h-3" />} label="Scheme" value={payment.scheme_name || "—"} />
            <DetailChip icon={<Hash className="w-3 h-3" />} label="EMI No." value={payment.emi_number ? `#${payment.emi_number}` : "—"} />
            <DetailChip icon={<DollarSign className="w-3 h-3" />} label="Amount" value={payment.emi_amount ? `₹${parseFloat(payment.emi_amount).toLocaleString('en-IN')}` : "—"} />
            <DetailChip icon={<Calendar className="w-3 h-3" />} label="Due Date" value={payment.due_date ? new Date(payment.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "—"} />
          </div>
        </div>
      )}

      {/* Screenshot thumbnail */}
      {payment.payment_image_base64 && (
        <button
          onClick={onView}
          className="w-full mb-4 relative overflow-hidden rounded-xl border border-gray-700 hover:border-amber-500/50 transition-all group/img"
          style={{ height: "100px" }}
        >
          <img
            src={`data:image/jpeg;base64,${payment.payment_image_base64}`}
            alt="Screenshot"
            className="w-full h-full object-cover opacity-70 group-hover/img:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover/img:bg-black/20 transition-all">
            <div className="flex items-center gap-2 text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">
              <Eye className="w-3.5 h-3.5" />
              View Screenshot
            </div>
          </div>
        </button>
      )}

      {!payment.payment_image_base64 && (
        <div className="w-full mb-4 h-16 rounded-xl border border-dashed border-gray-700 flex items-center justify-center gap-2 text-gray-600 text-xs">
          <ImageIcon className="w-4 h-4" />
          No screenshot uploaded
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50"
        >
          {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Approve
        </button>
        <button
          onClick={onView}
          disabled={busy}
          className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-400 rounded-xl transition-all duration-200 disabled:opacity-50"
          title="View Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onReject}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-400 text-red-400 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50"
        >
          {isRejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
          Reject
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SMALL HELPERS
───────────────────────────────────────── */
function DetailChip({ icon, label, value }) {
  return (
    <div className="bg-gray-700/40 rounded-lg px-3 py-2">
      <div className="flex items-center gap-1 text-gray-500 text-xs mb-0.5">
        {icon}
        {label}
      </div>
      <p className="text-gray-200 text-xs font-medium truncate">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value, mono = false }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className={`text-sm text-gray-200 break-all ${mono ? "font-mono" : "font-medium"}`}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
