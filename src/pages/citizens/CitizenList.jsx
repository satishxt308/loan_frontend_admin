// src/pages/citizens/CitizenList.jsx
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
  Eye
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const CitizenList = () => {
  const [citizens, setCitizens] = useState([]);
  const [filteredCitizens, setFilteredCitizens] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch all citizens (only role = 'citizen')
  const fetchCitizens = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/all-users`);
      if (response.data.success) {
        // Filter only users with role 'citizen'
        const citizenUsers = response.data.users.filter(user => user.role === 'citizen');
        setCitizens(citizenUsers);
        setFilteredCitizens(citizenUsers);
      } else {
        setError('Failed to fetch citizens');
      }
    } catch (err) {
      console.error('Error fetching citizens:', err);
      setError(err.response?.data?.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, []);

  // Filter citizens based on search and status
  useEffect(() => {
    let filtered = [...citizens];
    
    if (search.trim() !== '') {
      filtered = filtered.filter(citizen =>
        citizen.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        citizen.email?.toLowerCase().includes(search.toLowerCase()) ||
        citizen.phone_number?.includes(search)
      );
    }
    
    if (statusFilter === 'active') {
      filtered = filtered.filter(citizen => citizen.is_active === true);
    } else if (statusFilter === 'blocked') {
      filtered = filtered.filter(citizen => citizen.is_active === false);
    }
    
    setFilteredCitizens(filtered);
  }, [search, citizens, statusFilter]);

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

  // Open view modal
  const openViewModal = (citizen) => {
    setSelectedCitizen(citizen);
    setShowViewModal(true);
  };

  // View Citizen Modal
  const ViewCitizenModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" 
         onClick={(e) => e.target === e.currentTarget && setShowViewModal(false)}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 z-10 p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Citizen Details</h2>
            <button
              onClick={() => setShowViewModal(false)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {selectedCitizen && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-3xl font-bold text-amber-400">
                    {selectedCitizen.full_name?.charAt(0) || 'C'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedCitizen.full_name}</h3>
                  <p className="text-gray-400">Citizen ID: #{selectedCitizen.id}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCitizen.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedCitizen.is_active ? 'Active' : 'Blocked'}
                    </span>
                    {selectedCitizen.otp_verified && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/20 p-4 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-white font-medium mt-1">{selectedCitizen.email || 'N/A'}</p>
                </div>
                <div className="bg-gray-700/20 p-4 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-white font-medium mt-1">{selectedCitizen.phone_number || 'N/A'}</p>
                </div>
                <div className="bg-gray-700/20 p-4 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Date of Birth</p>
                  <p className="text-white font-medium mt-1">{formatDateForDisplay(selectedCitizen.date_of_birth)}</p>
                </div>
                <div className="bg-gray-700/20 p-4 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Gender</p>
                  <p className="text-white font-medium mt-1">{selectedCitizen.gender || 'N/A'}</p>
                </div>
                <div className="bg-gray-700/20 p-4 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Role</p>
                  <p className="text-white font-medium mt-1 capitalize">{selectedCitizen.role || 'N/A'}</p>
                </div>
                <div className="bg-gray-700/20 p-4 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Joined</p>
                  <p className="text-white font-medium mt-1">
                    {selectedCitizen.created_at ? new Date(selectedCitizen.created_at).toLocaleDateString('en-GB') : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Created By Section */}
              {selectedCitizen.created_by && (
                <div className="bg-gray-700/20 p-4 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Created By</p>
                  <div className="mt-1">
                    <p className="text-white font-medium">{selectedCitizen.created_by_name || 'Employee'}</p>
                    <p className="text-sm text-gray-400">Employee ID: {selectedCitizen.created_by}</p>
                    {selectedCitizen.created_by_phone && (
                      <p className="text-sm text-gray-400">Phone: {selectedCitizen.created_by_phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
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
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400">Citizen Management</h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">View and manage all citizen records</p>
        </div>

        {/* Search and Filter Bar */}
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
          
          <button
            onClick={fetchCitizens}
            className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 animate-shake">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading citizens...</p>
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
                    {filteredCitizens.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center px-4 py-8 text-gray-400">
                          No citizens found
                        </td>
                      </tr>
                    ) : (
                      filteredCitizens.map((citizen) => (
                        <tr key={citizen.id} className="hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{citizen.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{citizen.full_name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{citizen.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{citizen.phone_number}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">{formatDateForDisplay(citizen.date_of_birth)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">{citizen.gender}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              citizen.is_active 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {citizen.is_active ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {citizen.is_active ? 'Active' : 'Blocked'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                            {citizen.otp_verified ? (
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
                            {citizen.created_by ? (
                              <div>
                                <p className="text-sm font-medium text-violet-300">{citizen.created_by_name || 'Employee'}</p>
                                <p className="text-xs text-gray-500">ID: {citizen.created_by}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">Self / Admin</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => openViewModal(citizen)}
                              className="p-1.5 cursor-pointer hover:bg-amber-500/20 rounded-lg transition-colors group"
                              title="View Citizen"
                            >
                              <Eye className="w-4 h-4 text-gray-400 group-hover:text-amber-400" />
                            </button>
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
        {!loading && filteredCitizens.length > 0 && (
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
              <span className="text-gray-400">Total Citizens: <span className="text-amber-400 font-semibold">{citizens.length}</span></span>
              <span className="text-gray-400">Showing: <span className="text-amber-400 font-semibold">{filteredCitizens.length}</span></span>
              <span className="text-gray-400">
                Active: <span className="text-green-400 font-semibold">{citizens.filter(s => s.is_active).length}</span> | 
                Blocked: <span className="text-red-400 font-semibold">{citizens.filter(s => !s.is_active).length}</span>
              </span>
            </div>
          </div>
        )}

        {/* View Citizen Modal */}
        {showViewModal && <ViewCitizenModal />}
      </div>
    </div>
  );
};

export default CitizenList;