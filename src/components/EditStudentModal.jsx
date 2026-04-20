// src/components/EditStudentModal.jsx
import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  Save,
  Edit,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const EditStudentModal = ({
  formData,
  setFormData,
  handleEditStudent,
  handlePhoneChange,
  setShowEditModal,
  resetForm,
  error = '',
  submitting = false
}) => {
  const [localError, setLocalError] = React.useState('');

  // Handle form validation
  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setLocalError('Full name is required');
      return false;
    }
    if (!formData.phone_number || formData.phone_number.length !== 10) {
      setLocalError('Phone number must be exactly 10 digits');
      return false;
    }
    setLocalError('');
    return true;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleEditStudent(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl flex flex-col max-h-[90vh] animate-slideUp">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Student
          </h2>
          <button 
            onClick={() => { setShowEditModal(false); resetForm(); }} 
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
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
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address <span className="text-red-400">*</span>
              <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              Email is read-only for security
            </p>
          </div>

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
            <p className="text-xs text-gray-500 mt-1">
              Current: {formData.phone_number || 'Not set'}
            </p>
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

{/* Role Selection */}
<div className='mb-12'>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Role <span className="text-red-400">*</span>
  </label>

  <div className="relative">
    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

    <select
      value={formData.role}
      onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          role: e.target.value
        }))
      }
      className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white appearance-none cursor-pointer transition-all duration-200"
    >
      <option value="student">Student</option>
      <option value="employee">Employee</option>
    </select>
  </div>

</div>

          {/* Error Message */}
          {(localError || error) && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 animate-shake">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {localError || error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-gray-800 py-4 -mb-6 -mx-6 px-6 mt-4 rounded-b-2xl border-t border-gray-700">
            <button
              type="button"
              onClick={() => { setShowEditModal(false); resetForm(); }}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 font-medium order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating Student...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Student
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
`;

// Add styles to document if not already present
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default React.memo(EditStudentModal);