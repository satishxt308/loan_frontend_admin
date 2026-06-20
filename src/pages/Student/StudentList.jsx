import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  AlertCircle,
  Save,
  UserPlus,
  Send,
  Key,
  Shield,
  Filter
} from 'lucide-react';
import AddStudentModal from "../../components/AddStudentModal";
import EditStudentModal from "../../components/EditStudentModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const [otpTimer, setOtpTimer] = useState(300);

  // Form data for add/edit
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: 'Male',
    role: 'student',
    password: ''
  });

  // Fetch all students
  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/all-users`);
      if (response.data.success) {
        const studentUsers = response.data.users.filter(user => user.role === 'student');
        setStudents(studentUsers);
        setFilteredStudents(studentUsers);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on search and status
  useEffect(() => {
    let filtered = [...students];
    
    if (search.trim() !== '') {
      filtered = filtered.filter(student =>
        student.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        student.email?.toLowerCase().includes(search.toLowerCase()) ||
        student.phone_number?.includes(search)
      );
    }
    
    if (statusFilter === 'active') {
      filtered = filtered.filter(student => student.is_active === true);
    } else if (statusFilter === 'blocked') {
      filtered = filtered.filter(student => student.is_active === false);
    }
    
    setFilteredStudents(filtered);
  }, [search, students, statusFilter]);

  // OTP Timer
  useEffect(() => {
    let interval;
    if (otpSent && !otpVerified && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setOtpExpired(true);
            setOtpSent(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpVerified, otpTimer]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Check if email already exists
  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/check-email/${email}`);
      return response.data.exists;
    } catch (err) {
      console.error('Error checking email:', err);
      return false;
    }
  };

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateString.split('T')[0];
  };

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        if (dateString.includes('/')) {
          return dateString;
        }
        return 'N/A';
      }
      return date.toLocaleDateString('en-GB');
    } catch {
      return 'N/A';
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Check if email already exists and is verified
    const emailExists = await checkEmailExists(formData.email);
    if (emailExists) {
      setError('Email already registered! Please use a different email address.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setSendingOtp(true);
    setError('');
    setOtpExpired(false);
    setOtpTimer(300);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/users/send-otp`, {
        email: formData.email.trim().toLowerCase(),
        phone_number: formData.phone_number
      });
      
      if (response.data.success) {
        setOtpSent(true);
        setOtpVerified(false);
        setOtpCode('');
        setResendCooldown(60);
        setSuccessMessage('OTP sent successfully! Check your email.');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        if (response.data.otp) {
          console.log('Test OTP:', response.data.otp);
        }
      } else {
        setError(response.data.message || 'Failed to send OTP');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      const errorMsg = err.response?.data?.message || 'Error sending OTP';
      setError(errorMsg);
      setTimeout(() => setError(''), 3000);
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter 6-digit OTP');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (otpExpired) {
      setError('OTP has expired. Please request a new one.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setVerifyingOtp(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/users/verify-otp`, {
        email: formData.email.trim().toLowerCase(),
        otp: otpCode
      });
      
      if (response.data.verified) {
        setOtpVerified(true);
        setSuccessMessage('Email verified successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Invalid OTP! Please check and try again.');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.response?.data?.message || 'Error verifying OTP');
      setTimeout(() => setError(''), 3000);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setSendingOtp(true);
    setOtpExpired(false);
    setOtpTimer(300);
    try {
      const response = await axios.post(`${API_BASE_URL}/users/resend-otp`, {
        email: formData.email.trim().toLowerCase()
      });
      
      if (response.data.success) {
        setResendCooldown(60);
        setSuccessMessage('OTP resent successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.data.message || 'Failed to resend OTP');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error resending OTP');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSendingOtp(false);
    }
  };

  // Validate phone number
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  // Validate password (minimum 6 characters)
  const validatePassword = (password) => {
    return password && password.length >= 6;
  };

  // Add new student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    if (!otpVerified) {
      setError('Please verify your email with OTP first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!validatePhoneNumber(formData.phone_number)) {
      setError('Phone number must be exactly 10 digits');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be at least 6 characters');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/users/complete-registration`, {
  fullName: formData.full_name,
  email: formData.email.trim().toLowerCase(),
  phoneNumber: formData.phone_number,
  dateOfBirth: formData.date_of_birth,
  gender: formData.gender,
  role: 'student',
  password: formData.password
});
      
      if (response.data.success) {
        setSuccessMessage('Student added successfully!');
        fetchStudents();
        setShowAddModal(false);
        resetForm();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.data.message || 'Failed to add student');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error adding student:', err);
      const errorMsg = err.response?.data?.message || 'Error adding student';
      setError(errorMsg);
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit student
  const handleEditStudent = async (e) => {
    e.preventDefault();

    if (!validatePhoneNumber(formData.phone_number)) {
      setError('Phone number must be exactly 10 digits');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const updateData = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        role: formData.role
      };
      
      const response = await axios.put(`${API_BASE_URL}/users/update/${selectedStudent.id}`, updateData);
      if (response.data.success) {
        setSuccessMessage('Student updated successfully!');
        fetchStudents();
        setShowEditModal(false);
        resetForm();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.data.message || 'Failed to update student');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error updating student:', err);
      setError(err.response?.data?.message || 'Error updating student');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

 const handleToggleStatus = async (student) => {
  const newStatus = !student.is_active;

  // ✅ Optimistic UI update (instant feel)
  setStudents(prev =>
    prev.map(s =>
      s.id === student.id ? { ...s, is_active: newStatus } : s
    )
  );

  try {
    const response = await axios.patch(
      `${API_BASE_URL}/users/update-status/${student.id}`,
      { is_active: newStatus }
    );

    if (response.data.success) {
      setSuccessMessage(
        `Student ${newStatus ? 'activated' : 'blocked'} successfully!`
      );
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    // ❌ rollback if API fails
    setStudents(prev =>
      prev.map(s =>
        s.id === student.id ? { ...s, is_active: !newStatus } : s
      )
    );

    setError(err.response?.data?.message || 'Error updating status');
  } finally {
    setTimeout(() => {
      setSuccessMessage('');
      setError('');
    }, 3000);
  }
};

  // Delete student
  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    setSubmitting(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/delete/${studentToDelete.id}`);
      if (response.data.success) {
        setSuccessMessage('Student deleted successfully!');
        fetchStudents();
        setShowDeleteConfirm(false);
        setStudentToDelete(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.data.message || 'Failed to delete student');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      setError(err.response?.data?.message || 'Error deleting student');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      full_name: student.full_name,
      email: student.email,
      phone_number: student.phone_number,
      date_of_birth: formatDateForInput(student.date_of_birth),
      gender: student.gender,
      role: 'student',
      password: ''
    });
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone_number: '',
      date_of_birth: '',
      gender: 'Male',
      role: 'student',
      password: ''
    });
    setOtpSent(false);
    setOtpVerified(false);
    setOtpCode('');
    setOtpExpired(false);
    setOtpTimer(300);
    setError('');
    setSelectedStudent(null);
  };

  // Handle phone number input
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    setFormData(prev => ({
      ...prev,
      phone_number: value
    }));
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-white mb-2">Confirm Delete</h2>
          <p className="text-gray-400 text-center mb-6">
            Are you sure you want to delete <span className="text-amber-400 font-semibold">{studentToDelete?.full_name}</span>? 
            This action cannot be undone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { setShowDeleteConfirm(false); setStudentToDelete(null); }}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteStudent}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-0">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 animate-fade-in">
            <p className="text-green-400 text-center">{successMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-transparent p-4 md:p-6 rounded-2xl border border-amber-500/20">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400">Student Management</h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">Manage all student records, add new students, edit details, and control access</p>
        </div>

        {/* Search, Filter and Add Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchStudents}
              className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Student</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && !showAddModal && !showEditModal && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 animate-shake">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading students...</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">DOB</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Gender</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">OTP Verified</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden xl:table-cell">Created By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center px-4 py-8 text-gray-400">
                          No students found
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{student.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{student.full_name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{student.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{student.phone_number}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">{formatDateForDisplay(student.date_of_birth)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">{student.gender}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleStatus(student)}
                              className={`flex cursor-pointer items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                student.is_active 
                                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              }`}
                            >
                              {student.is_active ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {student.is_active ? 'Active' : 'Blocked'}
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                            {student.otp_verified ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                Verified
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden xl:table-cell">
                            {student.created_by ? (
                              <div>
                                <p className="text-sm font-medium text-violet-300">{student.created_by_name || 'Employee'}</p>
                                <p className="text-xs text-gray-500">ID: {student.created_by} • {student.created_by_phone || ''}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">Self / Admin</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(student)}
                                className="p-1.5 cursor-pointer hover:bg-amber-500/20 rounded-lg transition-colors group"
                                title="Edit Student"
                              >
                                <Edit className="w-4 h-4 text-gray-400 group-hover:text-amber-400" />
                              </button>
                              <button
                                onClick={() => {
                                  setStudentToDelete(student);
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-1.5 cursor-pointer hover:bg-red-500/20 rounded-lg transition-colors group"
                                title="Delete Student"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Footer */}
        {!loading && filteredStudents.length > 0 && (
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
              <span className="text-gray-400">Total Students: <span className="text-amber-400 font-semibold">{students.length}</span></span>
              <span className="text-gray-400">Showing: <span className="text-amber-400 font-semibold">{filteredStudents.length}</span></span>
              <span className="text-gray-400">
                Active: <span className="text-green-400 font-semibold">{students.filter(s => s.is_active).length}</span> | 
                Blocked: <span className="text-red-400 font-semibold">{students.filter(s => !s.is_active).length}</span>
              </span>
            </div>
          </div>
        )}

        {/* Modals */}
        {showAddModal && (
          <AddStudentModal
            formData={formData}
            setFormData={setFormData}
            handleAddStudent={handleAddStudent}
            handlePhoneChange={handlePhoneChange}
            setShowAddModal={setShowAddModal}
            resetForm={resetForm}
            otpSent={otpSent}
            otpVerified={otpVerified}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            handleSendOtp={handleSendOtp}
            handleVerifyOtp={handleVerifyOtp}
            handleResendOtp={handleResendOtp}
            sendingOtp={sendingOtp}
            verifyingOtp={verifyingOtp}
            resendCooldown={resendCooldown}
            error={error}
            submitting={submitting}
          />
        )}

        {showEditModal && (
          <EditStudentModal
            formData={formData}
            setFormData={setFormData}
            handleEditStudent={handleEditStudent}
            handlePhoneChange={handlePhoneChange}
            setShowEditModal={setShowEditModal}
            resetForm={resetForm}
            error={error}
            submitting={submitting}
          />
        )}

        {showDeleteConfirm && <DeleteConfirmModal />}
      </div>
    </div>
  );
};

export default StudentList;