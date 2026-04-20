import React, { useEffect, useState } from "react";
import axios from "axios";
import { CreditCard, Upload, Save, CheckCircle, AlertCircle, X, Trash2, Eye, EyeOff } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const PaymentSettings = () => {
  const [form, setForm] = useState({
    upi_id: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder: "",
    support_email: "",
    support_phone: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showSuccess, setShowSuccess] = useState(false);

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/payment`);
      const data = res.data || {};

      setForm({
        upi_id: data.upi_id || "",
        bank_name: data.bank_name || "",
        account_number: data.account_number || "",
        ifsc_code: data.ifsc_code || "",
        account_holder: data.account_holder || "",
        support_email: data.support_email || "",
        support_phone: data.support_phone || "",
      });

      if (data.qr_image) {
        setPreview(`data:image/jpeg;base64,${data.qr_image}`);
      }
    } catch (err) {
      console.log("Fetch error:", err);
      showMessage("error", "Failed to load payment settings");
    }
  };

  // =========================
  // SHOW MESSAGE
  // =========================
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 5000);
  };

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================
  // FILE CHANGE
  // =========================
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    
    if (selected) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(selected.type)) {
        showMessage("error", "Please select a valid image file (JPEG, PNG, WEBP)");
        return;
      }
      
      // Validate file size (max 2MB)
      if (selected.size > 2 * 1024 * 1024) {
        showMessage("error", "Image size should be less than 2MB");
        return;
      }
      
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selected);
      showMessage("success", "QR code image selected successfully");
    }
  };

  // =========================
  // REMOVE QR CODE
  // =========================
  const handleRemoveQR = () => {
    setFile(null);
    setPreview(null);
    showMessage("info", "QR code removed");
  };

  // =========================
  // VALIDATE FORM
  // =========================
  const validateForm = () => {
    // Basic validation
    if (form.upi_id && !form.upi_id.includes('@')) {
      showMessage("error", "Please enter a valid UPI ID (should contain @)");
      return false;
    }
    
    if (form.ifsc_code && form.ifsc_code.length !== 11) {
      showMessage("error", "IFSC code should be 11 characters long");
      return false;
    }
    
    if (form.account_number && form.account_number.length < 9) {
      showMessage("error", "Account number should be at least 9 digits");
      return false;
    }
    
    if (form.support_email && !form.support_email.includes('@')) {
      showMessage("error", "Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key]) {
          formData.append(key, form[key]);
        }
      });

      if (file) {
        formData.append("qr_image", file);
      }

      await axios.post(`${API}/payment`, formData);

      showMessage("success", "✅ Payment settings saved successfully!");
      await fetchData();
      
      // Clear file after successful save (keep preview)
      setFile(null);
      
    } catch (err) {
      console.log(err);
      showMessage("error", err.response?.data?.message || "❌ Failed to save payment settings");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all changes?")) {
      fetchData();
      setFile(null);
      showMessage("info", "Form has been reset");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Message Toast */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 animate-slide-in-right ${
          message.type === "success" ? "bg-green-500" : 
          message.type === "error" ? "bg-red-500" : 
          "bg-blue-500"
        } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
          {message.type === "success" && <CheckCircle className="w-5 h-5" />}
          {message.type === "error" && <AlertCircle className="w-5 h-5" />}
          {message.type === "info" && <CreditCard className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <CreditCard className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Payment Settings</h1>
            <p className="text-gray-400 mt-1">Configure payment methods and support details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ================= QR SECTION ================= */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-300">
          <div className="p-5 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-400" />
              QR Code
            </h2>
            <p className="text-gray-400 text-sm mt-1">Upload payment QR code (UPI, Bank, etc.)</p>
          </div>
          
          <div className="p-5">
            {!preview ? (
              <label className="flex flex-col items-center justify-center w-full h-48 px-4 transition bg-gray-900 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-amber-500 hover:bg-gray-800/50 group">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-amber-500/10 rounded-full group-hover:bg-amber-500/20 transition">
                    <Upload className="w-8 h-8 text-amber-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Click to upload QR code</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (Max 2MB)</p>
                  </div>
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative group">
                <img
                  src={preview}
                  alt="QR Preview"
                  className="w-48 h-48 object-cover rounded-lg border-2 border-gray-600 mx-auto"
                />
                <button
                  onClick={handleRemoveQR}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
                <p className="text-center text-gray-400 text-sm mt-3">QR Code Preview</p>
              </div>
            )}
          </div>
        </div>

        {/* ================= UPI SECTION ================= */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-300">
          <div className="p-5 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">UPI Details</h2>
            <p className="text-gray-400 text-sm mt-1">Configure UPI payment method</p>
          </div>
          
          <div className="p-5">
            <div className="relative">
              <input
                name="upi_id"
                value={form.upi_id}
                onChange={handleChange}
                placeholder="Enter UPI ID (example@upi)"
                className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-white placeholder-gray-500"
              />
              {form.upi_id && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Example: username@okhdfcbank, merchant@paytm</p>
          </div>
        </div>

        {/* ================= BANK SECTION ================= */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-300 lg:col-span-2">
          <div className="p-5 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Bank Details</h2>
            <p className="text-gray-400 text-sm mt-1">Configure bank account for payments</p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bank Name</label>
                <input
                  name="bank_name"
                  value={form.bank_name}
                  onChange={handleChange}
                  placeholder="e.g., State Bank of India"
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Account Number</label>
                <input
                  name="account_number"
                  value={form.account_number}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">IFSC Code</label>
                <input
                  name="ifsc_code"
                  value={form.ifsc_code}
                  onChange={handleChange}
                  placeholder="e.g., SBIN0001234"
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-white placeholder-gray-500 uppercase"
                  maxLength="11"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Account Holder Name</label>
                <input
                  name="account_holder"
                  value={form.account_holder}
                  onChange={handleChange}
                  placeholder="Enter account holder name"
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= SUPPORT SECTION ================= */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-300 lg:col-span-2">
          <div className="p-5 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Support Details</h2>
            <p className="text-gray-400 text-sm mt-1">Customer support contact information</p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Support Email</label>
                <input
                  name="support_email"
                  value={form.support_email}
                  onChange={handleChange}
                  placeholder="support@example.com"
                  type="email"
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Support Phone</label>
                <input
                  name="support_phone"
                  value={form.support_phone}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
        >
          <X className="w-5 h-5" />
          Reset
        </button>
      </div>

      {/* STYLES */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentSettings;