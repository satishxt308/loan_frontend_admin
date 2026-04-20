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
  Filter,
  Briefcase,
  DollarSign,
  Clock
} from 'lucide-react';
import AddEmployeeModal from "../../components/AddEmployeeModal";
import EditEmployeeModal from "../../components/EditEmployeeModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
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
    role: 'employee',
    employee_role: 'teacher', // Specific role for employees (teacher, admin, accountant, etc.)
    salary: '',
    joining_date: '',
    address: '',
    password: ''
  });

  // Employee role options
  const employeeRoles = [
    { value: 'teacher', label: 'Teacher' },
    { value: 'admin', label: 'Admin' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'librarian', label: 'Librarian' },
    { value: 'sports_coordinator', label: 'Sports Coordinator' },
    { value: 'support_staff', label: 'Support Staff' }
  ];

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/all-users`);
      if (response.data.success) {
        const employeeUsers = response.data.users.filter(user => user.role === 'employee');
        setEmployees(employeeUsers);
        setFilteredEmployees(employeeUsers);
      } else {
        setError('Failed to fetch employees');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.response?.data?.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees based on search, status, and role
  useEffect(() => {
    let filtered = [...employees];
    
    if (search.trim() !== '') {
      filtered = filtered.filter(employee =>
        employee.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        employee.email?.toLowerCase().includes(search.toLowerCase()) ||
        employee.phone_number?.includes(search) ||
        employee.employee_role?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (statusFilter === 'active') {
      filtered = filtered.filter(employee => employee.is_active === true);
    } else if (statusFilter === 'blocked') {
      filtered = filtered.filter(employee => employee.is_active === false);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(employee => employee.employee_role === roleFilter);
    }
    
    setFilteredEmployees(filtered);
  }, [search, employees, statusFilter, roleFilter]);

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

  // Validate salary
  const validateSalary = (salary) => {
    if (!salary) return true;
    return !isNaN(salary) && parseFloat(salary) >= 0;
  };

  // Add new employee
  const handleAddEmployee = async (e) => {
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

    if (!validateSalary(formData.salary)) {
      setError('Please enter a valid salary amount');
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
        role: 'employee',
        employee_role: formData.employee_role,
        salary: formData.salary,
        joining_date: formData.joining_date,
        address: formData.address,
        password: formData.password
      });
      
      if (response.data.success) {
        setSuccessMessage('Employee added successfully!');
        fetchEmployees();
        setShowAddModal(false);
        resetForm();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.data.message || 'Failed to add employee');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error adding employee:', err);
      const errorMsg = err.response?.data?.message || 'Error adding employee';
      setError(errorMsg);
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit employee
  const handleEditEmployee = async (e) => {
    e.preventDefault();

    if (!validatePhoneNumber(formData.phone_number)) {
      setError('Phone number must be exactly 10 digits');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!validateSalary(formData.salary)) {
      setError('Please enter a valid salary amount');
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
        role: formData.role,
        employee_role: formData.employee_role,
        salary: formData.salary,
        joining_date: formData.joining_date,
        address: formData.address
      };
      
      const response = await axios.put(`${API_BASE_URL}/users/update/${selectedEmployee.id}`, updateData);
      if (response.data.success) {
        setSuccessMessage('Employee updated successfully!');
        fetchEmployees();
        setShowEditModal(false);
        resetForm();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.data.message || 'Failed to update employee');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error updating employee:', err);
      setError(err.response?.data?.message || 'Error updating employee');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle employee status (active/blocked)
  const handleToggleStatus = async (employee) => {
    const newStatus = !employee.is_active;

    // Optimistic UI update
    setEmployees(prev =>
      prev.map(e =>
        e.id === employee.id ? { ...e, is_active: newStatus } : e
      )
    );

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/users/update-status/${employee.id}`,
        { is_active: newStatus }
      );

      if (response.data.success) {
        setSuccessMessage(
          `Employee ${newStatus ? 'activated' : 'blocked'} successfully!`
        );
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      // Rollback if API fails
      setEmployees(prev =>
        prev.map(e =>
          e.id === employee.id ? { ...e, is_active: !newStatus } : e
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

  // Delete employee
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    setSubmitting(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/delete/${employeeToDelete.id}`);
      if (response.data.success) {
        setSuccessMessage('Employee deleted successfully!');
        fetchEmployees();
        setShowDeleteConfirm(false);
        setEmployeeToDelete(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.data.message || 'Failed to delete employee');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError(err.response?.data?.message || 'Error deleting employee');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      email: employee.email,
      phone_number: employee.phone_number,
      date_of_birth: formatDateForInput(employee.date_of_birth),
      gender: employee.gender,
      role: 'employee',
      employee_role: employee.employee_role || 'teacher',
      salary: employee.salary || '',
      joining_date: formatDateForInput(employee.joining_date),
      address: employee.address || '',
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
      role: 'employee',
      employee_role: 'teacher',
      salary: '',
      joining_date: '',
      address: '',
      password: ''
    });
    setOtpSent(false);
    setOtpVerified(false);
    setOtpCode('');
    setOtpExpired(false);
    setOtpTimer(300);
    setError('');
    setSelectedEmployee(null);
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

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const colors = {
      teacher: 'bg-blue-500/20 text-blue-400',
      admin: 'bg-purple-500/20 text-purple-400',
      accountant: 'bg-green-500/20 text-green-400',
      librarian: 'bg-yellow-500/20 text-yellow-400',
      sports_coordinator: 'bg-orange-500/20 text-orange-400',
      support_staff: 'bg-gray-500/20 text-gray-400'
    };
    return colors[role] || 'bg-gray-500/20 text-gray-400';
  };

  // Format role for display
  const formatRoleForDisplay = (role) => {
    const roleNames = {
      teacher: 'Teacher',
      admin: 'Admin',
      accountant: 'Accountant',
      librarian: 'Librarian',
      sports_coordinator: 'Sports Coordinator',
      support_staff: 'Support Staff'
    };
    return roleNames[role] || role;
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
            Are you sure you want to delete <span className="text-amber-400 font-semibold">{employeeToDelete?.full_name}</span>? 
            This action cannot be undone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { setShowDeleteConfirm(false); setEmployeeToDelete(null); }}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteEmployee}
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
    <div className="min-h-screen bg-gray-900 md:p-0">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 animate-fade-in">
            <p className="text-green-400 text-center">{successMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-transparent p-4 md:p-6 rounded-2xl border border-amber-500/20">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400">Employee Management</h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">Manage all employee records, add new employees, edit details, and control access</p>
        </div>

        {/* Search, Filter and Add Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or role..."
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
              onClick={fetchEmployees}
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
              <span className="hidden sm:inline">Add Employee</span>
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
              <p className="text-gray-400">Loading employees...</p>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center px-4 py-8 text-gray-400">
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{employee.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{employee.full_name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{employee.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{employee.phone_number}</td>
                         
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">{formatDateForDisplay(employee.date_of_birth)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">{employee.gender}</td>
                          
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleStatus(employee)}
                              className={`flex cursor-pointer items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                employee.is_active 
                                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              }`}
                            >
                              {employee.is_active ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {employee.is_active ? 'Active' : 'Blocked'}
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                            {employee.otp_verified ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                Verified
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(employee)}
                                className="p-1.5 cursor-pointer hover:bg-amber-500/20 rounded-lg transition-colors group"
                                title="Edit Employee"
                              >
                                <Edit className="w-4 h-4 text-gray-400 group-hover:text-amber-400" />
                              </button>
                              <button
                                onClick={() => {
                                  setEmployeeToDelete(employee);
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-1.5 cursor-pointer hover:bg-red-500/20 rounded-lg transition-colors group"
                                title="Delete Employee"
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
        {!loading && filteredEmployees.length > 0 && (
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
              <span className="text-gray-400">Total Employees: <span className="text-amber-400 font-semibold">{employees.length}</span></span>
              <span className="text-gray-400">Showing: <span className="text-amber-400 font-semibold">{filteredEmployees.length}</span></span>
              <span className="text-gray-400">
                Active: <span className="text-green-400 font-semibold">{employees.filter(e => e.is_active).length}</span> | 
                Blocked: <span className="text-red-400 font-semibold">{employees.filter(e => !e.is_active).length}</span>
              </span>
            </div>
          </div>
        )}

        {/* Modals */}
        {showAddModal && (
          <AddEmployeeModal
            formData={formData}
            setFormData={setFormData}
            handleAddEmployee={handleAddEmployee}
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
            employeeRoles={employeeRoles}
          />
        )}

        {showEditModal && (
          <EditEmployeeModal
            formData={formData}
            setFormData={setFormData}
            handleEditEmployee={handleEditEmployee}
            handlePhoneChange={handlePhoneChange}
            setShowEditModal={setShowEditModal}
            resetForm={resetForm}
            error={error}
            submitting={submitting}
            employeeRoles={employeeRoles}
          />
        )}

        {showDeleteConfirm && <DeleteConfirmModal />}
      </div>
    </div>
  );
};

export default EmployeeList;