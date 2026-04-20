// src/pages/SupportPolicy.jsx
import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Edit, 
  X,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  List,
  ListOrdered
} from 'lucide-react';
import DOMPurify from 'dompurify';

const SupportPolicy = () => {
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditPolicy, setCurrentEditPolicy] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [editForm, setEditForm] = useState({
    title: '',
    date: '',
    content: ''
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const cleanContent = (html) => {
    if (!html) return '';
    return html
      ?.replace(/dir="rtl"/gi, "")
      ?.replace(/direction:\s*rtl/gi, "direction:ltr")
      ?.replace(/text-align:\s*right/gi, "text-align:left")
      ?.replace(/[\u202A-\u202E]/g, "");
  };

  const fetchPolicies = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/policies`);
      const data = await res.json();
      setPolicies(
        data.map(p => ({
          id: p.id,
          title: p.title,
          date: p.updated_at ? p.updated_at.split("T")[0] : "",
          content: cleanContent(p.content)
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const applyFormat = (command, value = null) => {
    const editorDiv = document.getElementById('rich-editor');
    if (editorDiv) {
      editorDiv.focus();
      document.execCommand(command, false, value);
      setEditForm({ ...editForm, content: editorDiv.innerHTML });
    }
  };

  // Function to insert bullet list
  const insertBulletList = () => {
    const editorDiv = document.getElementById('rich-editor');
    if (editorDiv) {
      editorDiv.focus();
      document.execCommand('insertUnorderedList', false, null);
      setEditForm({ ...editForm, content: editorDiv.innerHTML });
    }
  };

  // Function to insert numbered list
  const insertNumberedList = () => {
    const editorDiv = document.getElementById('rich-editor');
    if (editorDiv) {
      editorDiv.focus();
      document.execCommand('insertOrderedList', false, null);
      setEditForm({ ...editForm, content: editorDiv.innerHTML });
    }
  };

  const openViewModal = (policy) => {
    setSelectedPolicy(policy);
    setIsViewModalOpen(true);
  };

  const openEditModal = (policy) => {
    setCurrentEditPolicy(policy);
    setEditForm({
      title: policy.title,
      date: policy.date,
      content: policy.content
    });
    setIsEditModalOpen(true);
    
    setTimeout(() => {
      const editorDiv = document.getElementById('rich-editor');
      if (editorDiv) {
        editorDiv.innerHTML = policy.content;
      }
    }, 100);
  };

  const saveEdit = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/policies/${currentEditPolicy.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: editForm.title,
          content: editForm.content,
          updated_at: editForm.date
        })
      });

      if (response.ok) {
        await fetchPolicies();
        setIsEditModalOpen(false);
        setCurrentEditPolicy(null);
      } else {
        console.error("Failed to save");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPolicyIcon = (title) => {
    switch(title) {
      case 'Privacy Policy': return '🔒';
      case 'Support Policy': return '🎧';
      case 'Terms & Conditions': return '📄';
      case 'App Instructions': return '📱';
      default: return '📋';
    }
  };

  return (
    <div className="px-6 py-8 text-white min-h-[550px] bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-transparent py-2 px-4 rounded-2xl border border-amber-500/20 mb-4">
        <h1 className="text-3xl font-bold text-amber-400">Policies & Guidelines</h1>
        <p className="text-gray-400 mt-1">PSWB Business Private Limited - Manage all policies and instructions</p>
      </div>

      <div className="space-y-2">
        {policies.map((policy) => (
          <div key={policy.id} className="bg-gray-800/30 rounded-xl border border-gray-700 hover:border-amber-500/30 transition-all duration-200 overflow-hidden group">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-3xl">{getPolicyIcon(policy.title)}</div>
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {policy.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Last updated: {policy.date}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => openViewModal(policy)}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
                >
                  <Eye className="w-4 h-4" />
                  Open
                </button>
                <button
                  onClick={() => openEditModal(policy)}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedPolicy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700 bg-gray-800/50">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getPolicyIcon(selectedPolicy.title)}</span>
                  <h2 className="text-2xl font-bold text-white">{selectedPolicy.title}</h2>
                </div>
                <p className="text-gray-400 text-sm mt-1 ml-11">Last updated: {selectedPolicy.date}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 cursor-pointer hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div 
                className="prose prose-invert max-w-none text-gray-300"
                style={{ direction: 'ltr', textAlign: 'left' }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(selectedPolicy.content)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal with Rich Text Editor */}
      {isEditModalOpen && currentEditPolicy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getPolicyIcon(currentEditPolicy.title)}</span>
                <h2 className="text-2xl font-bold text-white">Edit {currentEditPolicy.title}</h2>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 cursor-pointer hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="px-6 py-2 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Header Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content (Rich Text Editor)</label>
                  
                  {/* Toolbar */}
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-800 border border-gray-700 rounded-t-lg">
                    <button type="button" onClick={() => applyFormat('bold')} className="p-2 hover:bg-gray-700 rounded transition-colors" title="Bold">
                      <Bold className="w-4 h-4 text-gray-300" />
                    </button>
                    <button type="button" onClick={() => applyFormat('italic')} className="p-2 hover:bg-gray-700 rounded transition-colors" title="Italic">
                      <Italic className="w-4 h-4 text-gray-300" />
                    </button>
                    <button type="button" onClick={() => applyFormat('underline')} className="p-2 hover:bg-gray-700 rounded transition-colors" title="Underline">
                      <Underline className="w-4 h-4 text-gray-300" />
                    </button>
                    
                    <div className="w-px h-6 bg-gray-700 mx-1"></div>
                    
                    {/* Bullet List Button */}
                    <button 
                      type="button" 
                      onClick={insertBulletList} 
                      className="p-2 hover:bg-gray-700 rounded transition-colors" 
                      title="Bullet List"
                    >
                      <List className="w-4 h-4 text-gray-300" />
                    </button>
                    
                    <div className="w-px h-6 bg-gray-700 mx-1"></div>
                    
                    <button type="button" onClick={() => applyFormat('justifyLeft')} className="p-2 hover:bg-gray-700 rounded transition-colors" title="Align Left">
                      <AlignLeft className="w-4 h-4 text-gray-300" />
                    </button>
                    <button type="button" onClick={() => applyFormat('justifyCenter')} className="p-2 hover:bg-gray-700 rounded transition-colors" title="Align Center">
                      <AlignCenter className="w-4 h-4 text-gray-300" />
                    </button>
                    <button type="button" onClick={() => applyFormat('justifyRight')} className="p-2 hover:bg-gray-700 rounded transition-colors" title="Align Right">
                      <AlignRight className="w-4 h-4 text-gray-300" />
                    </button>
                    
                    <div className="w-px h-6 bg-gray-700 mx-1"></div>
                    
                    <select onChange={(e) => applyFormat('formatBlock', e.target.value)} className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white" defaultValue="p">
                      <option value="p">Paragraph</option>
                      <option value="h1">Heading 1</option>
                      <option value="h2">Heading 2</option>
                      <option value="h3">Heading 3</option>
                    </select>
                    
                    <select onChange={(e) => applyFormat('fontSize', e.target.value)} className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white" defaultValue="3">
                      <option value="1">Small</option>
                      <option value="3">Normal</option>
                      <option value="5">Large</option>
                      <option value="7">Huge</option>
                    </select>
                  </div>

                  {/* Editable Content Area */}
                  <div
                    id="rich-editor"
                    contentEditable
                    dir="ltr"
                    onInput={(e) => setEditForm({ ...editForm, content: e.currentTarget.innerHTML })}
                    className="w-full min-h-[300px] p-4 bg-gray-800 border-x border-b border-gray-700 rounded-b-lg text-white focus:outline-none focus:border-amber-500 overflow-y-auto"
                    style={{ 
                      whiteSpace: 'normal', 
                      wordWrap: 'break-word', 
                      direction: 'ltr',
                      textAlign: 'left'
                    }} 
                  />
                </div>

                <div className="flex justify-end gap-3 pb-4 pt-2">
                  <button onClick={saveEdit} className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-white transition-colors">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPolicy;