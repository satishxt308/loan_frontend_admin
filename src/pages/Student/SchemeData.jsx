// admin-panel/src/pages/Student/Schemedata.jsx
import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Plus, Edit, Trash2, X, Upload, Image as ImageIcon, 
  Info, PlusCircle, MinusCircle, FileText, File , Bell
} from 'lucide-react';
import axios from 'axios';

const SchemeData = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [deletingScheme, setDeletingScheme] = useState(null);
  const [viewingScheme, setViewingScheme] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [types, setTypes] = useState([]);
  const [newType, setNewType] = useState("");
  const [schemes, setSchemes] = useState([]);
  const [notifications, setNotifications] = useState([]);
const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Form data structure matching backend
  const [formData, setFormData] = useState({
    schema_name: '',
    schema_type: '',
    short_description: '',
    amount: '',
    frequency: 'yearly',
    full_description: '',
    rating: '',
    enrolled_count: '',
    iconImage: null,
    features: [],           // Array of strings
    coverage_details: [],   // Array of {name, description}
    key_benefits: [],       // Array of strings
    exclusions: [],         // Array of strings
    documents_required: []  // Array of {text, type}
  });

  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/schemes`;

  // Fetch notification requests
const fetchNotifications = async () => {
  setLoadingNotifications(true);
  try {
    const response = await axios.get('http://localhost:5000/notification/notify');
    if (response.data.success) {
      setNotifications(response.data.data);
    }
  } catch (err) {
    console.error('Error fetching notifications:', err);
  } finally {
    setLoadingNotifications(false);
  }
};
  // Fetch schemes from database
  const fetchSchemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/schemas`);
      // Transform backend data to frontend format
      const transformedSchemes = response.data.map(scheme => ({
        id: scheme.id,
        schema_name: scheme.schema_name,
        schema_type: scheme.schema_type,
        short_description: scheme.short_description,
        amount: scheme.amount,
        frequency: scheme.frequency,
        full_description: scheme.full_description,
        rating: scheme.rating,
        enrolled_count: scheme.enrolled_count,
        iconImage: scheme.icon_image,
        features: scheme.features || [],
        coverage_details: scheme.coverage_details || [],
        key_benefits: scheme.key_benefits || [],
        exclusions: scheme.exclusions || [],
        documents_required: scheme.documents_required || []
      }));
      setSchemes(transformedSchemes);
    } catch (err) {
      console.error('Error fetching schemes:', err);
      setError('Failed to fetch schemes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch schema types
  const fetchTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/schema-types`);
      setTypes(res.data);
    } catch (err) {
      console.error("Error fetching types:", err);
    }
  };

  // Add new schema type
  const addNewType = async () => {
    if (!newType.trim()) return;
    try {
      await axios.post(`${API_BASE_URL}/schema-types/add`, {
        type_name: newType
      });
      setNewType("");
      setIsTypeModalOpen(false);
      fetchTypes();
    } catch (err) {
      console.error("Error adding type:", err);
      setError('Failed to add type. Please try again.');
    }
  };

  // Create new scheme
  const createScheme = async (schemeData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/schemas/add`, schemeData);
      if (response.data.success) {
        await fetchSchemes(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating scheme:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create scheme. Please try again.');
      }
      return false;
    }
  };

  // Update existing scheme
  const updateScheme = async (id, schemeData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/schemas/edit/${id}`, schemeData);
      if (response.data.success) {
        await fetchSchemes(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating scheme:', err);
      setError('Failed to update scheme. Please try again.');
      return false;
    }
  };

  // Delete scheme
  const deleteScheme = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/schemas/delete/${id}`);
      if (response.data.success) {
        await fetchSchemes(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting scheme:', err);
      setError('Failed to delete scheme. Please try again.');
      return false;
    }
  };

  useEffect(() => {
  fetchSchemes();
  fetchTypes();
  fetchNotifications(); // Add this line
}, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
  const base64 = reader.result.split(',')[1]; // ✅ remove data:image/... part

  setImagePreview(reader.result); // keep preview
  setFormData(prev => ({ ...prev, iconImage: base64 }));
};
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (scheme = null) => {
    if (scheme) {
      setEditingScheme(scheme);
      setFormData({
        schema_name: scheme.schema_name || '',
        schema_type: scheme.schema_type || '',
        short_description: scheme.short_description || '',
        amount: scheme.amount || '',
        frequency: scheme.frequency || 'yearly',
        full_description: scheme.full_description || '',
        rating: scheme.rating || '',
        enrolled_count: scheme.enrolled_count || '',
        iconImage: scheme.iconImage 
  ? scheme.iconImage.split(',')[1]   // ✅ REMOVE prefix
  : null,
        features: scheme.features || [],
        coverage_details: scheme.coverage_details || [],
        key_benefits: scheme.key_benefits || [],
        exclusions: scheme.exclusions || [],
        documents_required: scheme.documents_required || []
      });
      setImagePreview(scheme.iconImage);
    } else {
      setEditingScheme(null);
      setFormData({
        schema_name: '',
        schema_type: '',
        short_description: '',
        amount: '',
        frequency: 'yearly',
        full_description: '',
        rating: '',
        enrolled_count: '',
        iconImage: null,
        features: [],
        coverage_details: [],
        key_benefits: [],
        exclusions: [],
        documents_required: []
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleInfoClick = (scheme) => {
    setViewingScheme(scheme);
    setIsInfoModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingScheme(null);
    setImagePreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Dynamic array handlers
  const addArrayItem = (field, initialValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], initialValue]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  // Coverage details handlers (objects with name and description)
  const addCoverageItem = () => {
    setFormData(prev => ({
      ...prev,
      coverage_details: [...prev.coverage_details, { name: '', description: '' }]
    }));
  };

  const updateCoverageItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      coverage_details: prev.coverage_details.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeCoverageItem = (index) => {
    setFormData(prev => ({
      ...prev,
      coverage_details: prev.coverage_details.filter((_, i) => i !== index)
    }));
  };

  // Documents handlers (objects with text and type)
  const addDocumentItem = () => {
    setFormData(prev => ({
      ...prev,
      documents_required: [...prev.documents_required, { text: '', type: 'text' }]
    }));
  };

  const updateDocumentItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      documents_required: prev.documents_required.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeDocumentItem = (index) => {
    setFormData(prev => ({
      ...prev,
      documents_required: prev.documents_required.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const submitData = {
  schema_name: formData.schema_name,
  schema_type: formData.schema_type,
  short_description: formData.short_description,
  amount: parseFloat(formData.amount) || 0,
  frequency: formData.frequency,
  full_description: formData.full_description,
  rating: parseFloat(formData.rating) || 4.8,
  enrolled_count: parseInt(formData.enrolled_count) || 0,

  iconImage: formData.iconImage,   // ✅ ADD THIS

  features: formData.features.filter(f => f && f.trim()),
  coverage_details: formData.coverage_details.filter(c => c.name?.trim() || c.description?.trim()),
  key_benefits: formData.key_benefits.filter(b => b && b.trim()),
  exclusions: formData.exclusions.filter(e => e && e.trim()),
  documents_required: formData.documents_required.filter(d => d.text?.trim())
};

    let success = false;
    if (editingScheme) {
      success = await updateScheme(editingScheme.id, submitData);
    } else {
      success = await createScheme(submitData);
    }

    setLoading(false);
    if (success) {
      handleCloseModal();
    }
  };

  const handleDeleteClick = (scheme) => {
    setDeletingScheme(scheme);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    const success = await deleteScheme(deletingScheme.id);
    setLoading(false);
    
    if (success) {
      setIsDeleteModalOpen(false);
      setDeletingScheme(null);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="bg-gradient-to-r from-amber-500/20 to-amber-500/5 rounded-xl p-6 mb-6 border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Scheme Management</h1>
              <p className="text-gray-400">Manage all scholarship schemes and features</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />Add New Scheme
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-3 text-sm underline">Dismiss</button>
        </div>
      )}

      {/* Table with scroll only in body */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <div className="overflow-y-auto h-full max-h-[calc(100vh-250px)]">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-700/50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Icon</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Frequency</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Rating</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Enrolled</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && schemes.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : schemes.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-400">
                      No schemes found. Click "Add New Scheme" to create one.
                    </td>
                  </tr>
                ) : (
                  schemes.map((scheme) => (
                    <tr key={scheme.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        {scheme.iconImage ? 
                          <img src={scheme.iconImage} alt={scheme.schema_name} className="w-8 h-8 rounded-full object-cover" /> : 
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        }
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{scheme.schema_name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs whitespace-nowrap">
                          {scheme.schema_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 max-w-md truncate">{scheme.short_description}</td>
                      <td className="px-4 py-3 text-sm text-white">₹{scheme.amount}</td>
                      <td className="px-4 py-3 text-sm text-gray-300 capitalize">{scheme.frequency}</td>
                      <td className="px-4 py-3 text-sm text-yellow-400">★ {scheme.rating}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{scheme.enrolled_count}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleInfoClick(scheme)} className="p-1 text-green-400 hover:text-green-300 transition-colors" title="View Details">
                            <Info className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleOpenModal(scheme)} className="p-1 text-blue-400 hover:text-blue-300 transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(scheme)} className="p-1 text-red-400 hover:text-red-300 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
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

      {/* Notification Requests Table */}
<div className="mt-8 bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
  <div className="px-6 py-4 border-b border-gray-700">
    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
      <Bell className="w-5 h-5 text-amber-400" />
      Notification Requests
    </h3>
    <p className="text-sm text-gray-400">Users who requested to be notified when new schemes are launched</p>
  </div>
  
  <div className="overflow-x-auto">
    <div className="overflow-y-auto max-h-[300px]">
      <table className="w-full min-w-[600px]">
        <thead className="bg-gray-700/50 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">User Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Scheme Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Requested Date</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {loadingNotifications ? (
            <tr>
              <td colSpan="5" className="text-center py-8">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              </td>
            </tr>
          ) : notifications.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-8 text-gray-400">
                No notification requests found
              </td>
            </tr>
          ) : (
            notifications.map((notif) => (
              <tr key={notif.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3 text-sm text-white">{notif.id}</td>
                <td className="px-4 py-3 text-sm text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <span className="text-xs text-amber-400">
                        {notif.user_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span>{notif.user_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                    {notif.schema_name}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {new Date(notif.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {new Date(notif.updated_at).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingScheme ? 'Edit Scheme' : 'Add New Scheme'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Icon Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Icon Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gray-700 border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden">
                      {imagePreview ? 
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : 
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      }
                    </div>
                    <label className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />Upload Icon
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Scheme Name *</label>
                  <input type="text" name="schema_name" value={formData.schema_name} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type *</label>
                  <div className="flex gap-2">
                    <select name="schema_type" value={formData.schema_type} onChange={handleInputChange} required className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500">
                      <option value="">Select Type</option>
                      {types.map((t) => (
                        <option key={t.id} value={t.type_name}>{t.type_name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setIsTypeModalOpen(true)} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Short Description *</label>
                  <textarea name="short_description" value={formData.short_description} onChange={handleInputChange} required rows="2" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Amount (₹) *</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Frequency *</label>
                  <select name="frequency" value={formData.frequency} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Description</label>
                  <textarea name="full_description" value={formData.full_description} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Rating</label>
                  <input type="number" name="rating" value={formData.rating} onChange={handleInputChange} step="0.1" max="5" min="0" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Enrolled Count</label>
                  <input type="number" name="enrolled_count" value={formData.enrolled_count} onChange={handleInputChange} min="0" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>

                {/* Features */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Key Features</label>
                  {formData.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input type="text" value={feature} onChange={(e) => updateArrayItem('features', idx, e.target.value)} placeholder="Enter feature" className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                      <button type="button" onClick={() => removeArrayItem('features', idx)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addArrayItem('features', '')} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors">
                    <PlusCircle className="w-4 h-4" /> Add Feature
                  </button>
                </div>

                {/* Coverage Details */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Coverage Details</label>
                  {formData.coverage_details.map((coverage, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
                      <input type="text" value={coverage.name} onChange={(e) => updateCoverageItem(idx, 'name', e.target.value)} placeholder="Coverage name" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                      <div className="flex gap-2">
                        <input type="text" value={coverage.description} onChange={(e) => updateCoverageItem(idx, 'description', e.target.value)} placeholder="Description" className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                        <button type="button" onClick={() => removeCoverageItem(idx)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addCoverageItem} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors">
                    <PlusCircle className="w-4 h-4" /> Add Coverage
                  </button>
                </div>

                {/* Key Benefits */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Key Benefits</label>
                  {formData.key_benefits.map((benefit, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input type="text" value={benefit} onChange={(e) => updateArrayItem('key_benefits', idx, e.target.value)} placeholder="Enter benefit" className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                      <button type="button" onClick={() => removeArrayItem('key_benefits', idx)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addArrayItem('key_benefits', '')} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors">
                    <PlusCircle className="w-4 h-4" /> Add Benefit
                  </button>
                </div>

                {/* Exclusions */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Exclusions</label>
                  {formData.exclusions.map((exclusion, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input type="text" value={exclusion} onChange={(e) => updateArrayItem('exclusions', idx, e.target.value)} placeholder="Enter exclusion" className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                      <button type="button" onClick={() => removeArrayItem('exclusions', idx)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addArrayItem('exclusions', '')} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors">
                    <PlusCircle className="w-4 h-4" /> Add Exclusion
                  </button>
                </div>

                {/* Documents Required */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Documents Required</label>
                  {formData.documents_required.map((doc, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input type="text" value={doc.text} onChange={(e) => updateDocumentItem(idx, 'text', e.target.value)} placeholder="Document name" className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                      <select value={doc.type} onChange={(e) => updateDocumentItem(idx, 'type', e.target.value)} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500">
                        <option value="text">Text</option>
                        <option value="pdf">PDF</option>
                      </select>
                      <button type="button" onClick={() => removeDocumentItem(idx)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addDocumentItem} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors">
                    <PlusCircle className="w-4 h-4" /> Add Document
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : (editingScheme ? 'Update' : 'Add')} Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Type Modal */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-4">Add New Type</h2>
            <input
              type="text"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="Enter type name"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-4 focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsTypeModalOpen(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white transition-colors">
                Cancel
              </button>
              <button onClick={addNewType} className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {isInfoModalOpen && viewingScheme && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl w-full max-w-3xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-400" />
                Scheme Details: {viewingScheme.schema_name}
              </h2>
              <button onClick={() => setIsInfoModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-400 block">Scheme Name</label><p className="text-white font-medium">{viewingScheme.schema_name}</p></div>
                <div><label className="text-xs text-gray-400 block">Type</label><p className="text-white"><span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs">{viewingScheme.schema_type}</span></p></div>
                <div className="col-span-2"><label className="text-xs text-gray-400 block">Short Description</label><p className="text-white">{viewingScheme.short_description}</p></div>
                <div><label className="text-xs text-gray-400 block">Amount</label><p className="text-white">₹{viewingScheme.amount}</p></div>
                <div><label className="text-xs text-gray-400 block">Frequency</label><p className="text-white capitalize">{viewingScheme.frequency}</p></div>
                <div><label className="text-xs text-gray-400 block">Rating</label><p className="text-yellow-400">★ {viewingScheme.rating}</p></div>
                <div><label className="text-xs text-gray-400 block">Enrolled</label><p className="text-white">{viewingScheme.enrolled_count}</p></div>
                
                {viewingScheme.full_description && (
                  <div className="col-span-2"><label className="text-xs text-gray-400 block">Full Description</label><p className="text-white">{viewingScheme.full_description}</p></div>
                )}
                
                {viewingScheme.features?.length > 0 && (
                  <div className="col-span-2"><label className="text-xs text-gray-400 block">Key Features</label><ul className="list-disc list-inside text-white">{viewingScheme.features.map((f, i) => <li key={i}>{f}</li>)}</ul></div>
                )}
                
                {viewingScheme.coverage_details?.length > 0 && (
                  <div className="col-span-2"><label className="text-xs text-gray-400 block">Coverage Details</label><div className="space-y-1">{viewingScheme.coverage_details.map((c, i) => <p key={i} className="text-white"><strong>{c.name}:</strong> {c.description}</p>)}</div></div>
                )}
                
                {viewingScheme.key_benefits?.length > 0 && (
                  <div className="col-span-2"><label className="text-xs text-gray-400 block">Key Benefits</label><ul className="list-disc list-inside text-white">{viewingScheme.key_benefits.map((b, i) => <li key={i}>{b}</li>)}</ul></div>
                )}
                
                {viewingScheme.exclusions?.length > 0 && (
                  <div className="col-span-2"><label className="text-xs text-gray-400 block">Exclusions</label><ul className="list-disc list-inside text-white">{viewingScheme.exclusions.map((e, i) => <li key={i}>{e}</li>)}</ul></div>
                )}
                
                {viewingScheme.documents_required?.length > 0 && (
                  <div className="col-span-2"><label className="text-xs text-gray-400 block">Documents Required</label><ul className="list-disc list-inside text-white">{viewingScheme.documents_required.map((d, i) => <li key={i}>{d.text} {d.type === 'pdf' && <File className="w-3 h-3 inline ml-1" />}</li>)}</ul></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white text-center mb-2">Confirm Delete</h3>
              <p className="text-gray-400 text-center mb-6">
                Are you sure you want to delete "{deletingScheme?.schema_name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={handleConfirmDelete} disabled={loading} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeData;