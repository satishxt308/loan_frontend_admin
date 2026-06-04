// admin-panel/src/pages/CreateLoans.jsx
import React, { useState, useEffect } from 'react';
import { 
  Coins, Plus, Edit, Trash2, X, Upload, Image as ImageIcon, 
  Info, PlusCircle, MinusCircle, FileText, Percent, Calendar, Award,
  ShieldCheck, HelpCircle, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const CreateLoans = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [deletingLoan, setDeletingLoan] = useState(null);
  const [viewingLoan, setViewingLoan] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [types, setTypes] = useState([]);
  const [newType, setNewType] = useState("");
  const [loans, setLoans] = useState([]);

  // Form data structure matching updated backend
  const [formData, setFormData] = useState({
    schema_name: '',
    schema_type: '',
    short_description: '',
    amount: '',
    frequency: 'monthly',
    full_description: '',
    rating: '4.8',
    enrolled_count: '0',
    iconImage: null,
    interest_rate: '',
    tenure_months: '12',
    eligibility: '',
    features: [],           // Array of strings
    coverage_details: [],   // Array of {name, description}
    key_benefits: [],       // Array of strings
    exclusions: [],         // Array of strings
    documents_required: []  // Array of {text, type}
  });

  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/schemes`;

  // Fetch loans from database
  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/schemas`);
      // Transform backend data to frontend format
      const transformedLoans = response.data.map(loan => ({
        id: loan.id,
        schema_name: loan.schema_name,
        schema_type: loan.schema_type,
        short_description: loan.short_description,
        amount: loan.amount,
        frequency: loan.frequency,
        full_description: loan.full_description,
        rating: loan.rating,
        enrolled_count: loan.enrolled_count,
        iconImage: loan.icon_image,
        interest_rate: loan.interest_rate,
        tenure_months: loan.tenure_months,
        eligibility: loan.eligibility,
        features: loan.features || [],
        coverage_details: loan.coverage_details || [],
        key_benefits: loan.key_benefits || [],
        exclusions: loan.exclusions || [],
        documents_required: loan.documents_required || []
      }));
      setLoans(transformedLoans);
    } catch (err) {
      console.error('Error fetching loans:', err);
      setError('Failed to fetch loans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch loan types
  const fetchTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/schema-types`);
      setTypes(res.data);
    } catch (err) {
      console.error("Error fetching loan types:", err);
    }
  };

  // Add new loan type
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
      console.error("Error adding loan type:", err);
      setError('Failed to add loan type. Please try again.');
    }
  };

  // Create new loan
  const createLoan = async (loanData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/schemas/add`, loanData);
      if (response.data.success) {
        await fetchLoans(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating loan:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create loan. Please try again.');
      }
      return false;
    }
  };

  // Update existing loan
  const updateLoan = async (id, loanData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/schemas/edit/${id}`, loanData);
      if (response.data.success) {
        await fetchLoans(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating loan:', err);
      setError('Failed to update loan. Please try again.');
      return false;
    }
  };

  // Delete loan
  const deleteLoan = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/schemas/delete/${id}`);
      if (response.data.success) {
        await fetchLoans(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting loan:', err);
      setError('Failed to delete loan. Please try again.');
      return false;
    }
  };

  useEffect(() => {
    fetchLoans();
    fetchTypes();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]; // remove prefix
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, iconImage: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (loan = null) => {
    if (loan) {
      setEditingLoan(loan);
      setFormData({
        schema_name: loan.schema_name || '',
        schema_type: loan.schema_type || '',
        short_description: loan.short_description || '',
        amount: loan.amount || '',
        frequency: loan.frequency || 'monthly',
        full_description: loan.full_description || '',
        rating: loan.rating || '4.8',
        enrolled_count: loan.enrolled_count || '0',
        iconImage: loan.iconImage ? loan.iconImage.split(',')[1] : null,
        interest_rate: loan.interest_rate || '',
        tenure_months: loan.tenure_months || '12',
        eligibility: loan.eligibility || '',
        features: loan.features || [],
        coverage_details: loan.coverage_details || [],
        key_benefits: loan.key_benefits || [],
        exclusions: loan.exclusions || [],
        documents_required: loan.documents_required || []
      });
      setImagePreview(loan.iconImage);
    } else {
      setEditingLoan(null);
      setFormData({
        schema_name: '',
        schema_type: '',
        short_description: '',
        amount: '',
        frequency: 'monthly',
        full_description: '',
        rating: '4.8',
        enrolled_count: '0',
        iconImage: null,
        interest_rate: '',
        tenure_months: '12',
        eligibility: '',
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

  const handleInfoClick = (loan) => {
    setViewingLoan(loan);
    setIsInfoModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLoan(null);
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

  // Documents handlers
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
      iconImage: formData.iconImage,
      interest_rate: parseFloat(formData.interest_rate) || 0,
      tenure_months: parseInt(formData.tenure_months) || 12,
      eligibility: formData.eligibility,
      features: formData.features.filter(f => f && f.trim()),
      coverage_details: formData.coverage_details.filter(c => c.name?.trim() || c.description?.trim()),
      key_benefits: formData.key_benefits.filter(b => b && b.trim()),
      exclusions: formData.exclusions.filter(e => e && e.trim()),
      documents_required: formData.documents_required.filter(d => d.text?.trim())
    };

    let success = false;
    if (editingLoan) {
      success = await updateLoan(editingLoan.id, submitData);
    } else {
      success = await createLoan(submitData);
    }

    setLoading(false);
    if (success) {
      handleCloseModal();
    }
  };

  const handleDeleteClick = (loan) => {
    setDeletingLoan(loan);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    const success = await deleteLoan(deletingLoan.id);
    setLoading(false);
    
    if (success) {
      setIsDeleteModalOpen(false);
      setDeletingLoan(null);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/5 rounded-xl p-6 mb-6 border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Coins className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create & Manage Schemes</h1>
              <p className="text-gray-400">Configure scheme plans, rates, tenures, and eligibility requirements</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all duration-200 font-medium"
          >
            <Plus className="w-4 h-4" />Create New Scheme
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-sm underline">Dismiss</button>
        </div>
      )}

      {/* Loans Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <div className="overflow-y-auto h-full max-h-[calc(100vh-250px)]">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-700/50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Icon</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Scheme Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Max Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Interest (%)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Tenure</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Eligibility</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && loans.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : loans.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-400">
                      No scheme plans found. Click "Create New Scheme" to design one!
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => (
                    <tr key={loan.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        {loan.iconImage ? 
                          <img src={loan.iconImage} alt={loan.schema_name} className="w-8 h-8 rounded-full object-cover" /> : 
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        }
                      </td>
                      <td className="px-4 py-3 text-sm text-white font-medium">{loan.schema_name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-semibold whitespace-nowrap">
                          {loan.schema_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white font-semibold">₹{loan.amount}</td>
                      <td className="px-4 py-3 text-sm text-green-400 font-semibold">{loan.interest_rate}%</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{loan.tenure_months} Months</td>
                      <td className="px-4 py-3 text-sm text-gray-300 max-w-xs truncate">{loan.eligibility || 'Any Student'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleInfoClick(loan)} className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-all" title="View Details">
                            <Info className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleOpenModal(loan)} className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-all" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(loan)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all" title="Delete">
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                {editingLoan ? 'Modify Scheme Plan' : 'Design New Scheme Plan'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Icon Image */}
                <div className="md:col-span-2 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Scheme Plan Icon Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gray-700 border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden">
                      {imagePreview ? 
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : 
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      }
                    </div>
                    <label className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2 border border-gray-600">
                      <Upload className="w-4 h-4" />Upload Icon
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Basic Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <Coins className="w-4 h-4 text-amber-500" /> Scheme Plan Name *
                  </label>
                  <input type="text" name="schema_name" value={formData.schema_name} onChange={handleInputChange} required placeholder="e.g. Organic Agriculture Initiative" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-500" /> Scheme Category *
                  </label>
                  <div className="flex gap-2">
                    <select name="schema_type" value={formData.schema_type} onChange={handleInputChange} required className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500">
                      <option value="">Select Category</option>
                      {types.map((t) => (
                        <option key={t.id} value={t.type_name}>{t.type_name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setIsTypeModalOpen(true)} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" title="Add New Category">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <Coins className="w-4 h-4 text-amber-500" /> Maximum Funding/Amount (₹) *
                  </label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required placeholder="e.g. 50000" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <Percent className="w-4 h-4 text-amber-500" /> Interest Percentage (%) *
                  </label>
                  <input type="number" step="0.01" name="interest_rate" value={formData.interest_rate} onChange={handleInputChange} required placeholder="e.g. 6.5" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-amber-500" /> Scheme Tenure (Months) *
                  </label>
                  <input type="number" name="tenure_months" value={formData.tenure_months} onChange={handleInputChange} required placeholder="e.g. 12" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-500" /> Eligibility Criteria
                  </label>
                  <input type="text" name="eligibility" value={formData.eligibility} onChange={handleInputChange} placeholder="e.g. Min 60% marks in 10th & 12th standard" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Short Plan Summary *</label>
                  <textarea name="short_description" value={formData.short_description} onChange={handleInputChange} required rows="2" placeholder="Brief summary displayed on listings" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Detailed Description</label>
                  <textarea name="full_description" value={formData.full_description} onChange={handleInputChange} rows="3" placeholder="Detailed terms, conditions and particulars" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"></textarea>
                </div>

                {/* Features */}
                <div className="md:col-span-2 bg-gray-900/30 p-4 rounded-xl border border-gray-700">
                  <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-amber-500" /> Key Features & Benefits
                  </label>
                  {formData.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input type="text" value={feature} onChange={(e) => updateArrayItem('features', idx, e.target.value)} placeholder="e.g. Instant approval within 24 hours" className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                      <button type="button" onClick={() => removeArrayItem('features', idx)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addArrayItem('features', '')} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-medium mt-1">
                    <PlusCircle className="w-4 h-4" /> Add Feature
                  </button>
                </div>

                {/* Required Documents */}
                <div className="md:col-span-2 bg-gray-900/30 p-4 rounded-xl border border-gray-700">
                  <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-amber-500" /> Required Verification Documents
                  </label>
                  {formData.documents_required.map((doc, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input type="text" value={doc.text} onChange={(e) => updateDocumentItem(idx, 'text', e.target.value)} placeholder="e.g. Parent Salary Slip / Income Certificate" className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                      <select value={doc.type} onChange={(e) => updateDocumentItem(idx, 'type', e.target.value)} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500">
                        <option value="text">Text (Image/Scan)</option>
                        <option value="pdf">PDF File</option>
                      </select>
                      <button type="button" onClick={() => removeDocumentItem(idx)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addDocumentItem} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-medium mt-1">
                    <PlusCircle className="w-4 h-4" /> Add Document Requirement
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center gap-2">
                  {loading ? 'Processing...' : (editingLoan ? 'Save Changes' : 'Launch Scheme Plan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Type/Category Modal */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-700 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              Add Scheme Category
            </h2>
            <input
              type="text"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="e.g. Higher Education, K-12, Skill Development"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-4 focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsTypeModalOpen(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors font-medium">
                Cancel
              </button>
              <button onClick={addNewType} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-white transition-colors font-semibold">
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingLoan && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-red-500/20 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2 text-red-400">
              <Trash2 className="w-5 h-5" />
              Delete Scheme Plan?
            </h2>
            <p className="text-gray-300 mb-6 text-sm">
              Are you sure you want to permanently delete the <strong>{deletingLoan.schema_name}</strong> scheme plan? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors font-medium">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors font-semibold">
                Yes, Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Info Modal */}
      {isInfoModalOpen && viewingLoan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl w-full max-w-3xl mx-4 my-8 max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-500" />
                Scheme Plan Particulars
              </h2>
              <button onClick={() => setIsInfoModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 bg-gray-900/40 p-4 rounded-xl border border-gray-700">
                {viewingLoan.iconImage ? (
                  <img src={viewingLoan.iconImage} alt={viewingLoan.schema_name} className="w-16 h-16 rounded-full object-cover border border-amber-500/35" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{viewingLoan.schema_name}</h3>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-semibold">
                    {viewingLoan.schema_type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-900/20 p-4 rounded-xl border border-gray-700">
                <div>
                  <label className="text-xs text-gray-400 block uppercase font-bold tracking-wider">Max Amount</label>
                  <p className="text-white font-semibold text-lg">₹{viewingLoan.amount}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block uppercase font-bold tracking-wider">Interest Rate</label>
                  <p className="text-green-400 font-semibold text-lg">{viewingLoan.interest_rate}% per annum</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block uppercase font-bold tracking-wider">Tenure Limit</label>
                  <p className="text-white font-medium">{viewingLoan.tenure_months} Months</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block uppercase font-bold tracking-wider">Repayment Frequency</label>
                  <p className="text-white font-medium capitalize">{viewingLoan.frequency}</p>
                </div>
                <div className="col-span-2 border-t border-gray-700 pt-3 mt-1">
                  <label className="text-xs text-gray-400 block uppercase font-bold tracking-wider mb-0.5">Eligibility Criteria</label>
                  <p className="text-white">{viewingLoan.eligibility || 'Open to all registered student applicants'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1">Short Summary</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{viewingLoan.short_description}</p>
              </div>

              {viewingLoan.full_description && (
                <div>
                  <h4 className="font-semibold text-white mb-1">Full Specifications</h4>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{viewingLoan.full_description}</p>
                </div>
              )}

              {viewingLoan.features?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-amber-500" /> Key Features
                  </h4>
                  <ul className="list-disc list-inside text-gray-300 text-sm space-y-1 pl-1">
                    {viewingLoan.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {viewingLoan.documents_required?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-amber-500" /> Required Verification Documents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-1">
                    {viewingLoan.documents_required.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-900/40 px-3 py-2 rounded-lg border border-gray-700">
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-sm text-gray-300">{doc.text}</span>
                        <span className="ml-auto text-xs px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded uppercase">
                          {doc.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-900/20 border-t border-gray-700 flex justify-end">
              <button onClick={() => setIsInfoModalOpen(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-sm">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLoans;
