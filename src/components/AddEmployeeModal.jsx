import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  CheckCircle, 
  Save,
  UserPlus,
  Send,
  Key,
  Shield,
  AlertCircle,
  Briefcase,
  DollarSign,
  MapPin,
  Clock
} from 'lucide-react';

const AddEmployeeModal = ({
  formData,
  setFormData,
  handleAddEmployee,
  handlePhoneChange,
  setShowAddModal,
  resetForm,
  otpSent,
  otpVerified,
  otpCode,
  setOtpCode,
  handleSendOtp,
  handleVerifyOtp,
  handleResendOtp,
  sendingOtp = false,
  verifyingOtp = false,
  resendCooldown = 0,
  error = '',
  submitting = false,
  employeeRoles = []
}) => {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone_number || formData.phone_number.length < 10) {
      newErrors.phone_number = "Phone must be 10 digits";
    }

    if (!otpVerified) {
      newErrors.otp = "Please verify email first";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleAddEmployee(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl flex flex-col max-h-[90vh] animate-slideUp">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New Employee
          </h2>
          <button 
            onClick={() => { setShowAddModal(false); resetForm(); }} 
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-3 py-2 rounded-lg flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    full_name: e.target.value
                  }))
                }
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-gray-500 transition-all duration-200"
                required
              />
            </div>
            {errors.full_name && (
              <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>
            )}
          </div>

          {/* Email with OTP */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="employee@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))
                }
                className="w-full pl-10 pr-24 py-2.5 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-gray-500 transition-all duration-200"
                required
                disabled={otpVerified}
              />
              {!otpVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !formData.email}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-amber-400 text-sm flex items-center gap-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingOtp ? (
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      Send OTP
                    </>
                  )}
                </button>
              )}
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* OTP Section */}
          {otpSent && !otpVerified && (
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 animate-slideDown">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Enter Verification Code
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  maxLength="6"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                  className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white text-center text-lg tracking-wider placeholder-gray-500 transition-all duration-200"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp}
                  className="px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 flex items-center justify-center gap-1 transition-all duration-200 disabled:opacity-50"
                >
                  {verifyingOtp ? (
                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Verify
                    </>
                  )}
                </button>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
                <p className="text-xs text-gray-500">OTP expires in 5 minutes</p>
              </div>
            </div>
          )}

          {/* Verified Badge */}
          {otpVerified && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-center animate-pulse">
              <p className="text-green-400 text-sm flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Email verified successfully!
              </p>
            </div>
          )}

          {errors.otp && (
            <p className="text-red-400 text-xs mt-1">{errors.otp}</p>
          )}

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number <span className="text-red-400">*</span>
              <span className="text-xs text-gray-500 ml-2">(exactly 10 digits)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                placeholder="9876543210"
                value={formData.phone_number}
                onChange={handlePhoneChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-gray-500 transition-all duration-200"
                required
                minLength={10}
                maxLength={10}
              />
            </div>
            {errors.phone_number && (
              <p className="text-red-400 text-xs mt-1">{errors.phone_number}</p>
            )}
          </div>


          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    date_of_birth: e.target.value
                  }))
                }
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-gray-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gender
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    gender: e.target.value
                  }))
                }
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white appearance-none cursor-pointer transition-all duration-200"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="mb-10">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password <span className="text-red-400">*</span>
              <span className="text-xs text-gray-500 ml-2">(minimum 6 characters)</span>
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  password: e.target.value
                }))
              }
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-gray-500 transition-all duration-200"
              required
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-gray-800 py-4 -mb-6 -mx-6 px-6 mt-4 rounded-b-2xl border-t border-gray-700">
            <button
              type="button"
              onClick={() => { setShowAddModal(false); resetForm(); }}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 font-medium order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !otpVerified}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding Employee...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Add Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add CSS animations to your global CSS file
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }

  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }

  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }

  .animate-shake {
    animation: shake 0.3s ease-out;
  }

  .animate-pulse {
    animation: pulse 0.5s ease-out;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

// Add styles to document if not already present
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default React.memo(AddEmployeeModal);