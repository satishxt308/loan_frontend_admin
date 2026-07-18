// src/pages/Employee/EmployeeDocuments.jsx
import React, { useState, useEffect } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Users,
  Clock,
  Search,
  Filter,
  RefreshCw,
  X,
  User,
  Calendar,
  MapPin,
  Briefcase,
  Heart,
  Download,
  Building,
  Award,
  Banknote,
  UserCheck,
  Globe,
  Check,
  Loader,
  IdCard,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

// Employee Details Modal with Documents
const EmployeeDetailsModal = ({ 
  employee, 
  documents, 
  onClose, 
  onBulkApprove, 
  onBulkReject, 
  onGenerateId,
  onUpdateEmployeeStatus,
  onRefresh,
  onEmployeeUpdate
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [generatingId, setGeneratingId] = useState(false);
  const [employeeStatus, setEmployeeStatus] = useState(employee?.status || "pending");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [localDocuments, setLocalDocuments] = useState(documents || []);
  const [refreshKey, setRefreshKey] = useState(0);
const [previewLoading, setPreviewLoading] = useState(false);

  // Update local state when props change
  useEffect(() => {
    if (employee) {
      setEmployeeStatus(employee.status || "pending");
    }
    setLocalDocuments(documents || []);
  }, [employee, documents, refreshKey]);

  // Check if all documents are approved
  const allDocsApproved = localDocuments.length > 0 && localDocuments.every(doc => doc.status === "approved");
  const canGenerateId = employeeStatus === "approved" && allDocsApproved && !employee?.emp_card_verified;

  const allItemIds = localDocuments.map(doc => doc.id);

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

  const handleApprove = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one document to approve");
      return;
    }
    setSubmitting(true);
    const success = await onBulkApprove(employee.id, selectedItems);
    if (success) {
      setLocalDocuments(prev => 
        prev.map(doc => 
          selectedItems.includes(doc.id) 
            ? { ...doc, status: "approved" } 
            : doc
        )
      );
      setSelectedItems([]);
      await onRefresh();
      setRefreshKey(prev => prev + 1);
    }
    setSubmitting(false);
  };

  const handleReject = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one document to reject");
      return;
    }
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    setSubmitting(true);
    const success = await onBulkReject(employee.id, selectedItems, rejectReason);
    if (success) {
      setLocalDocuments(prev => 
        prev.map(doc => 
          selectedItems.includes(doc.id) 
            ? { ...doc, status: "rejected", reason: rejectReason } 
            : doc
        )
      );
      setSelectedItems([]);
      setRejectReason("");
      await onRefresh();
      setRefreshKey(prev => prev + 1);
    }
    setSubmitting(false);
  };

  const handleGenerateId = async () => {
    setGeneratingId(true);
    const success = await onGenerateId(employee.id);
    if (success) {
      await onRefresh();
      setRefreshKey(prev => prev + 1);
    }
    setGeneratingId(false);
  };

  // Handle employee status change with checkbox
  const handleEmployeeStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      if (employeeStatus === newStatus) {
        const result = await onUpdateEmployeeStatus(employee.id, "pending", null);
        if (result) {
          setEmployeeStatus("pending");
          await onRefresh();
          setRefreshKey(prev => prev + 1);
          if (onEmployeeUpdate) {
            const updatedEmployee = await onEmployeeUpdate(employee.id);
            if (updatedEmployee) {
              setEmployeeStatus(updatedEmployee.status || "pending");
            }
          }
        }
      } else {
        if (newStatus === "rejected") {
          const reason = prompt("Please enter rejection reason:");
          if (reason !== null && reason.trim()) {
            const result = await onUpdateEmployeeStatus(employee.id, newStatus, reason.trim());
            if (result) {
              setEmployeeStatus(newStatus);
              await onRefresh();
              setRefreshKey(prev => prev + 1);
              if (onEmployeeUpdate) {
                const updatedEmployee = await onEmployeeUpdate(employee.id);
                if (updatedEmployee) {
                  setEmployeeStatus(updatedEmployee.status || "pending");
                }
              }
            }
          } else if (reason !== null) {
            alert("Rejection reason is required");
          }
        } else {
          const result = await onUpdateEmployeeStatus(employee.id, newStatus, null);
          if (result) {
            setEmployeeStatus(newStatus);
            await onRefresh();
            setRefreshKey(prev => prev + 1);
            if (onEmployeeUpdate) {
              const updatedEmployee = await onEmployeeUpdate(employee.id);
              if (updatedEmployee) {
                setEmployeeStatus(updatedEmployee.status || "pending");
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const DocumentPreviewModal = ({ document, onClose }) => {
    if (!document) return null;

    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bg-gray-800 rounded-2xl w-[500px] max-w-xl border border-gray-700 shadow-2xl">
          <div className="p-2 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">{document.document_key || "Document Preview"}</h3>
              <p className="text-gray-400 text-sm">{document.document_type}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="p-0 flex justify-center items-center min-h-[350px] max-h-[50vh] overflow-auto">
            {document.document_file ? (
              document.mime_type?.startsWith("image/") ? (
                <img 
                  src={document.document_file} 
                  alt={document.document_name}
                  className="max-w-full max-h-[50vh] object-contain rounded-lg"
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

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bg-gray-800 rounded-2xl w-full max-w-3xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Employee Details</h2>
                <p className="text-gray-400 text-sm mt-1">ID: {employee.id}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Employee Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-3">
                <label className="text-xs text-gray-400 uppercase block">Full Name</label>
                <p className="text-white font-semibold">{employee.full_name || "N/A"}</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <label className="text-xs text-gray-400 uppercase block">Email</label>
                <p className="text-white">{employee.email || "N/A"}</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <label className="text-xs text-gray-400 uppercase block">Phone</label>
                <p className="text-white">{employee.phone || "N/A"}</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <label className="text-xs text-gray-400 uppercase block">Employee ID</label>
                <p className="text-amber-400 font-semibold">{employee.employee_id || "Not Generated"}</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <label className="text-xs text-gray-400 uppercase block">Aadhaar Number</label>
                <p className="text-white">{employee.aadhaar_number || "N/A"}</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <label className="text-xs text-gray-400 uppercase block">PAN Number</label>
                <p className="text-white">{employee.pan_number || "N/A"}</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <label className="text-xs text-gray-400 uppercase block">Full Address</label>
                <p className="text-white">{employee.full_address || "N/A"}</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <label className="text-xs text-gray-400 uppercase block">Referral Source</label>
                <p className="text-white">{employee.referral_source || "N/A"}</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <label className="text-xs text-gray-400 uppercase block">Department</label>
                <p className="text-white">{employee.department || "N/A"}</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3">
                <label className="text-xs text-gray-400 uppercase block">Submitted Date</label>
                <p className="text-white">{new Date(employee.submitted_date).toLocaleString()}</p>
              </div>
              
              {/* Current Status with Checkbox */}
              <div className="bg-gray-700/30 rounded-lg p-3 col-span-1 md:col-span-2">
                <label className="text-xs text-gray-400 uppercase block mb-3">Current Status</label>
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={employeeStatus === "approved"}
                      onChange={() => handleEmployeeStatusChange("approved")}
                      disabled={updatingStatus}
                      className="w-5 h-5 rounded border-gray-500 text-green-500 focus:ring-green-500 cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-green-400 font-medium">Approved</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={employeeStatus === "rejected"}
                      onChange={() => handleEmployeeStatusChange("rejected")}
                      disabled={updatingStatus}
                      className="w-5 h-5 rounded border-gray-500 text-red-500 focus:ring-red-500 cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-red-400 font-medium">Rejected</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={employeeStatus === "pending"}
                      onChange={() => handleEmployeeStatusChange("pending")}
                      disabled={updatingStatus}
                      className="w-5 h-5 rounded border-gray-500 text-yellow-500 focus:ring-yellow-500 cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-yellow-400 font-medium">Pending</span>
                  </label>
                  {updatingStatus && (
                    <Loader size={16} className="animate-spin text-amber-400" />
                  )}
                  {employee.rejection_reason && employeeStatus === "rejected" && (
                    <span className="text-red-400 text-sm ml-2">Reason: {employee.rejection_reason}</span>
                  )}
                </div>
              </div>

              {employee.emp_card_verified && (
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <label className="text-xs text-gray-400 uppercase block">Card Verified</label>
                  <p className="text-green-400 font-semibold flex items-center gap-2">
                    <CheckCircle size={16} /> Yes
                  </p>
                </div>
              )}
            </div>

            {/* Documents Section with Checkboxes */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                  <FileText size={18} /> Documents ({localDocuments.length})
                </h3>
                {localDocuments.length > 0 && (
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
                <div className="space-y-3">
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
                          {doc.reason && doc.status === "rejected" && (
                            <p className="text-xs text-red-400 mt-1">Reason: {doc.reason}</p>
                          )}
                        </div>
                      </div>
                      <button
  onClick={async (e) => {
    e.stopPropagation();

    try {
      setPreviewLoading(true);

      const res = await fetch(
        `${API_BASE}/admin/employee-documents/${doc.id}`
      );

      const data = await res.json();

      if (data.success) {
        setPreviewDocument({
          ...doc,
          document_file: data.data.document_file,
          mime_type: "image/png",
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load document");
    } finally {
      setPreviewLoading(false);
    }
  }}
  className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded transition-colors cursor-pointer"
>
  {previewLoading ? (
    <Loader size={18} className="animate-spin" />
  ) : (
    <Eye size={18} />
  )}
</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Selection Info */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-gray-400 text-sm">
                  {selectedItems.length} document(s) selected
                </span>
              </div>
            </div>

            {/* Generate ID Section */}
            {canGenerateId && (
              <div className="border-t border-green-500/30 pt-6">
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h4 className="text-green-400 font-semibold flex items-center gap-2">
                        <CheckCircle size={18} />
                        Ready for ID Generation
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Employee approved and all documents approved. Click to generate Employee ID.
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateId}
                      disabled={generatingId}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingId ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <IdCard size={18} />
                          Generate Employee ID
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Reason Input */}
            <div className="border-t border-gray-700 pt-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Rejection Reason {selectedItems.length > 0 && <span className="text-gray-400 text-xs">(for selected documents)</span>}
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason for selected documents..."
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 text-white resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer with Action Buttons */}
          <div className="p-6 border-t border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-gray-800">
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
    </>
  );
};

// Main Component
const EmployeeDocuments = () => {
  const [employees, setEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [departments, setDepartments] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [empsRes, docsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/employees`),
        fetch(`${API_BASE}/admin/employee-documents`),
      ]);

      const empsData = await empsRes.json();
      const docsData = await docsRes.json();

      if (empsData.success) {
        setEmployees(empsData.data || []);
        const uniqueDepts = [...new Set(empsData.data?.map(emp => emp.department).filter(Boolean))];
        setDepartments(uniqueDepts);
      }
      if (docsData.success) {
        setDocuments(docsData.data || []);
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
  }, [refreshTrigger]);

  // 🔥 FIX: Keep selectedEmployee in sync with employees state
  useEffect(() => {
    if (selectedEmployee) {
      const updatedEmp = employees.find(e => e.id === selectedEmployee.id);
      if (updatedEmp && updatedEmp.status !== selectedEmployee.status) {
        setSelectedEmployee(updatedEmp);
      }
    }
  }, [employees]);

  // Fetch single employee data and update state
  const fetchAndUpdateEmployee = async (empId) => {
    try {
      const response = await fetch(`${API_BASE}/admin/employees/${empId}`);
      const data = await response.json();
      if (data.success) {
        const freshEmployee = data.data;
        setEmployees(prev => prev.map(e => 
          e.id === freshEmployee.id ? freshEmployee : e
        ));
        if (selectedEmployee && selectedEmployee.id === freshEmployee.id) {
          setSelectedEmployee(freshEmployee);
        }
        return freshEmployee;
      }
      return null;
    } catch (error) {
      console.error("Error fetching employee:", error);
      return null;
    }
  };

  // Update employee status (emp_cards)
  const updateEmployeeStatus = async (id, status, reason) => {
    try {
      const response = await fetch(`${API_BASE}/admin/employees/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          status, 
          rejection_reason: reason || null 
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Action failed");
        setTimeout(() => setError(""), 3000);
        return false;
      }

      // 🔥 FIX: Update the employees state immediately
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === id 
            ? { ...emp, status: status, rejection_reason: reason || null }
            : emp
        )
      );

      setSuccessMessage(`Employee status updated to ${status}!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      return true;
    } catch (error) {
      console.error("Error updating employee:", error);
      setError("Failed to update employee status");
      setTimeout(() => setError(""), 3000);
      return false;
    }
  };

  // Generate ID for employee
  const generateEmployeeId = async (empId) => {
    try {
      const response = await fetch(`${API_BASE}/admin/employees/${empId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`✅ Employee ID generated successfully! ID: ${data.data.employee_id}`);
        setTimeout(() => setSuccessMessage(""), 5000);
        setRefreshTrigger(prev => prev + 1);
        return true;
      } else {
        setError(data.message || "Failed to generate ID");
        setTimeout(() => setError(""), 3000);
        return false;
      }
    } catch (error) {
      console.error("Error generating ID:", error);
      setError("Failed to generate employee ID");
      setTimeout(() => setError(""), 3000);
      return false;
    }
  };

  // Update document status
  const updateDocumentStatus = async (id, status, reason = "") => {
    try {
      const response = await fetch(`${API_BASE}/admin/employee-documents/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          status, 
          rejection_reason: reason || null 
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        // 🔥 FIX: Update documents state immediately
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === id 
              ? { ...doc, status: status, rejection_reason: reason || null }
              : doc
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating document:", error);
      return false;
    }
  };

  // Bulk approve handler
  const handleBulkApprove = async (employeeId, docIds) => {
    try {
      let allSuccess = true;
      
      for (const docId of docIds) {
        const success = await updateDocumentStatus(docId, "approved");
        if (!success) allSuccess = false;
      }
      
      if (allSuccess) {
        setSuccessMessage(`✅ ${docIds.length} document(s) approved successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        setRefreshTrigger(prev => prev + 1);
        return true;
      } else {
        setError("Some documents failed to update");
        setTimeout(() => setError(""), 3000);
        return false;
      }
    } catch (error) {
      console.error("Error in bulk approve:", error);
      setError("Failed to approve documents");
      setTimeout(() => setError(""), 3000);
      return false;
    }
  };

  // Bulk reject handler
  const handleBulkReject = async (employeeId, docIds, reason) => {
    try {
      let allSuccess = true;
      
      for (const docId of docIds) {
        const success = await updateDocumentStatus(docId, "rejected", reason);
        if (!success) allSuccess = false;
      }
      
      if (allSuccess) {
        setSuccessMessage(`❌ ${docIds.length} document(s) rejected successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        setRefreshTrigger(prev => prev + 1);
        return true;
      } else {
        setError("Some documents failed to update");
        setTimeout(() => setError(""), 3000);
        return false;
      }
    } catch (error) {
      console.error("Error in bulk reject:", error);
      setError("Failed to reject documents");
      setTimeout(() => setError(""), 3000);
      return false;
    }
  };

  const getDocumentsForEmp = (empId) => {
    return documents.filter((doc) => doc.employee_id === empId);
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName = emp.full_name || "";
    const email = emp.email || "";
    const employeeId = emp.employee_id || "";
    const empId = emp.id || "";
    const department = emp.department || "";
    
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
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
    total: employees.length,
    pending: employees.filter(e => e.status === "pending").length,
    approved: employees.filter(e => e.status === "approved").length,
    rejected: employees.filter(e => e.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading employees...</p>
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
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400">Employee Management</h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">Review and manage employee applications and documents</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Employees</p>
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

        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Employee ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center px-4 py-8 text-gray-400">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    const empDocuments = getDocumentsForEmp(emp.id);
                    
                    const allDocsApproved = empDocuments.length > 0 && empDocuments.every(doc => doc.status === "approved");
                    const showGenerateIdButton = emp.status === "approved" && allDocsApproved && !emp.emp_card_verified;

                    return (
                      <tr key={emp.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-amber-400">{emp.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-300">{emp.employee_id || "N/A"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{emp.full_name || "N/A"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{emp.email || "N/A"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {new Date(emp.submitted_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(emp.status)}
                            {emp.emp_card_verified && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400 flex items-center gap-1">
                                <IdCard size={12} /> ID Generated
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                const freshEmployee = await fetchAndUpdateEmployee(emp.id);
                                if (freshEmployee) {
                                  setSelectedEmployee(freshEmployee);
                                  setShowEmployeeModal(true);
                                } else {
                                  setSelectedEmployee(emp);
                                  setShowEmployeeModal(true);
                                }
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-white text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                              title="View Details & Documents"
                            >
                              <Eye size={14} />
                              View Details
                              {empDocuments.length > 0 && (
                                <span className="ml-1 bg-amber-600 px-1.5 py-0.5 rounded text-xs">
                                  {empDocuments.length}
                                </span>
                              )}
                            </button>
                            
                            {showGenerateIdButton && (
                              <button
                                onClick={async () => {
                                  const success = await generateEmployeeId(emp.id);
                                  if (success) {
                                    setRefreshTrigger(prev => prev + 1);
                                  }
                                }}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                                title="Generate Employee ID"
                              >
                                <IdCard size={14} />
                                Generate ID
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && filteredEmployees.length > 0 && (
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
              <span className="text-gray-400">Total Employees: <span className="text-amber-400 font-semibold">{employees.length}</span></span>
              <span className="text-gray-400">Showing: <span className="text-amber-400 font-semibold">{filteredEmployees.length}</span></span>
              <span className="text-gray-400">
                Pending: <span className="text-yellow-400 font-semibold">{stats.pending}</span> | 
                Approved: <span className="text-green-400 font-semibold">{stats.approved}</span> | 
                Rejected: <span className="text-red-400 font-semibold">{stats.rejected}</span>
              </span>
            </div>
          </div>
        )}

        {showEmployeeModal && (
          <EmployeeDetailsModal
            employee={selectedEmployee}
            documents={getDocumentsForEmp(selectedEmployee?.id)}
            onClose={() => {
              setShowEmployeeModal(false);
              setRefreshTrigger(prev => prev + 1);
            }}
            onBulkApprove={handleBulkApprove}
            onBulkReject={handleBulkReject}
            onGenerateId={generateEmployeeId}
            onUpdateEmployeeStatus={updateEmployeeStatus}
            onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            onEmployeeUpdate={fetchAndUpdateEmployee}
          />
        )}
      </div>
    </div>
  ); 
};

export default EmployeeDocuments;