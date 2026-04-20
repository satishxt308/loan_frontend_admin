import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save,
  Video as VideoIcon,
  FolderOpen,
  Link as LinkIcon,
  Upload,
  Play,
  Image as ImageIcon,
  Minimize2
} from 'lucide-react';

const Videos = () => {
  const [videoTypes, setVideoTypes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [playingVideo, setPlayingVideo] = useState(null);

  // Form states
  const [typeForm, setTypeForm] = useState({
    name: ""
  });
  
  const [videoForm, setVideoForm] = useState({
    type_id: "",
    name: "",
    description: "",
    video_url: "",
    video_file: null,
    thumbnail_url: "",
    thumbnail_file: null,
    video_source: "url" // 'url' or 'file'
  });

  useEffect(() => {
    fetchVideoTypes();
    fetchVideos();
  }, []);

  const fetchVideoTypes = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/video/video-types`);
      const data = await res.json();
      setVideoTypes(data);
    } catch (err) {
      console.error("Error fetching video types:", err);
      // Demo data if API fails
      setVideoTypes([
        { id: 1, name: "Tutorials" },
        { id: 2, name: "Interviews" },
        { id: 3, name: "Product Demos" }
      ]);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/video/videos`);
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error("Error fetching videos:", err);
      // Demo data if API fails
      setVideos([
        { 
          id: 1, 
          type_id: 1, 
          name: "Getting Started", 
          description: "Learn the basics",
          video_url: "https://example.com/video1.mp4",
          thumbnail_url: "https://via.placeholder.com/300x200",
          video_source: "url"
        },
        { 
          id: 2, 
          type_id: 1, 
          name: "Advanced Tips", 
          description: "Pro tips and tricks",
          video_url: "https://example.com/video2.mp4",
          thumbnail_url: "https://via.placeholder.com/300x200",
          video_source: "url"
        }
      ]);
    }
  };

  // Helper functions for YouTube
  const isYouTube = (url) => {
    if (!url) return false;
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const getYouTubeEmbedUrl = (url) => {
    const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regExp);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  // Video Type CRUD operations
  const handleAddType = async () => {
    if (!typeForm.name.trim()) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/video/video-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(typeForm)
      });
      
      if (response.ok) {
        await fetchVideoTypes();
        setIsTypeModalOpen(false);
        setTypeForm({ name: "" });
      }
    } catch (err) {
      console.error(err);
      // Demo: Add locally
      const newType = { id: Date.now(), ...typeForm };
      setVideoTypes([...videoTypes, newType]);
      setIsTypeModalOpen(false);
      setTypeForm({ name: "" });
    }
  };

  const handleEditType = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/video/video-types/${editingType.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(typeForm)
      });
      
      if (response.ok) {
        await fetchVideoTypes();
        setIsTypeModalOpen(false);
        setEditingType(null);
        setTypeForm({ name: "" });
      }
    } catch (err) {
      console.error(err);
      // Demo: Update locally
      setVideoTypes(videoTypes.map(t => 
        t.id === editingType.id ? { ...t, ...typeForm } : t
      ));
      setIsTypeModalOpen(false);
      setEditingType(null);
      setTypeForm({ name: "" });
    }
  };

  const handleDeleteType = async (typeId) => {
    if (window.confirm("Delete this video type? All videos in this type will be affected.")) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/video/video-types/${typeId}`, {
          method: "DELETE"
        });
        
        if (response.ok) {
          await fetchVideoTypes();
        }
      } catch (err) {
        console.error(err);
        // Demo: Delete locally
        setVideoTypes(videoTypes.filter(t => t.id !== typeId));
      }
    }
  };

  // Video CRUD operations
  const handleAddVideo = async () => {
    if (!videoForm.name.trim() || !videoForm.type_id) return;
    
    const formData = new FormData();
    formData.append("type_id", videoForm.type_id);
    formData.append("name", videoForm.name);
    formData.append("description", videoForm.description);
    formData.append("video_source", videoForm.video_source);
    
    if (videoForm.video_source === "url") {
      formData.append("video_url", videoForm.video_url);
    } else if (videoForm.video_file) {
      formData.append("video_file", videoForm.video_file);
    }
    
    if (videoForm.thumbnail_file) {
      formData.append("thumbnail_file", videoForm.thumbnail_file);
    } else if (videoForm.thumbnail_url) {
      formData.append("thumbnail_url", videoForm.thumbnail_url);
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/video/videos`, {
        method: "POST",
        body: formData
      });
      
      if (response.ok) {
        await fetchVideos();
        setIsVideoModalOpen(false);
        resetVideoForm();
      }
    } catch (err) {
      console.error(err);
      // Demo: Add locally
      const newVideo = {
        id: Date.now(),
        ...videoForm,
        video_url: videoForm.video_source === "url" ? videoForm.video_url : URL.createObjectURL(videoForm.video_file),
        thumbnail_url: videoForm.thumbnail_file ? URL.createObjectURL(videoForm.thumbnail_file) : videoForm.thumbnail_url
      };
      setVideos([...videos, newVideo]);
      setIsVideoModalOpen(false);
      resetVideoForm();
    }
  };

  const handleEditVideo = async () => {
    const formData = new FormData();
    formData.append("type_id", videoForm.type_id);
    formData.append("name", videoForm.name);
    formData.append("description", videoForm.description);
    formData.append("video_source", videoForm.video_source);
    
    if (videoForm.video_source === "url") {
      formData.append("video_url", videoForm.video_url);
    } else if (videoForm.video_file) {
      formData.append("video_file", videoForm.video_file);
    }
    
    if (videoForm.thumbnail_file) {
      formData.append("thumbnail_file", videoForm.thumbnail_file);
    } else if (videoForm.thumbnail_url) {
      formData.append("thumbnail_url", videoForm.thumbnail_url);
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/video/videos/${editingVideo.id}`, {
        method: "PUT",
        body: formData
      });
      
      if (response.ok) {
        await fetchVideos();
        setIsVideoModalOpen(false);
        setEditingVideo(null);
        resetVideoForm();
      }
    } catch (err) {
      console.error(err);
      // Demo: Update locally
      setVideos(videos.map(v => 
        v.id === editingVideo.id ? { ...v, ...videoForm } : v
      ));
      setIsVideoModalOpen(false);
      setEditingVideo(null);
      resetVideoForm();
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm("Delete this video?")) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/video/videos/${videoId}`, {
          method: "DELETE"
        });
        
        if (response.ok) {
          await fetchVideos();
        }
      } catch (err) {
        console.error(err);
        // Demo: Delete locally
        setVideos(videos.filter(v => v.id !== videoId));
      }
    }
  };

  const resetVideoForm = () => {
    setVideoForm({
      type_id: "",
      name: "",
      description: "",
      video_url: "",
      video_file: null,
      thumbnail_url: "",
      thumbnail_file: null,
      video_source: "url"
    });
  };

  const openAddTypeModal = () => {
    setEditingType(null);
    setTypeForm({ name: "" });
    setIsTypeModalOpen(true);
  };

  const openEditTypeModal = (type) => {
    setEditingType(type);
    setTypeForm({ name: type.name });
    setIsTypeModalOpen(true);
  };

  const openAddVideoModal = () => {
    setEditingVideo(null);
    resetVideoForm();
    setIsVideoModalOpen(true);
  };

  const openEditVideoModal = (video) => {
    setEditingVideo(video);
    setVideoForm({
      type_id: video.type_id,
      name: video.name,
      description: video.description || "",
      video_url: video.video_url || "",
      video_file: null,
      thumbnail_url: video.thumbnail_url || "",
      thumbnail_file: null,
      video_source: video.video_source || "url"
    });
    setIsVideoModalOpen(true);
  };

  const filteredVideos = selectedTypeFilter === "all" 
    ? videos 
    : videos.filter(v => v.type_id === parseInt(selectedTypeFilter));

  return (
    <div className="px-6 py-8 text-white min-h-[550px] bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-transparent to-transparent py-2 px-4 rounded-2xl border border-amber-500/20 mb-6">
        <h1 className="text-3xl font-bold text-amber-400">Video Management</h1>
        <p className="text-gray-400 mt-1">Manage video types and content library</p>
      </div>

      {/* Video Types Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            Video Types
          </h2>
          <button
            onClick={openAddTypeModal}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Type
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoTypes.map((type) => (
            <div key={type.id} className="bg-gray-800/30 rounded-xl border border-gray-700 hover:border-amber-500/30 transition-all p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{type.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditTypeModal(type)}
                    className="cursor-pointer p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteType(type.id)}
                    className="cursor-pointer p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Videos Section */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <VideoIcon className="w-5 h-5 text-amber-400" />
            Video Library
          </h2>
          
          <div className="flex gap-3">
            {/* Type Filter */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="cursor-pointer px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Types</option>
              {videoTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            
            <button
              onClick={openAddVideoModal}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Add Video
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-gray-800/30 rounded-xl border border-gray-700 hover:border-amber-500/30 transition-all overflow-hidden group">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-900 overflow-hidden">
                {video.thumbnail_url ? (
                  <img 
                    src={video.thumbnail_url} 
                    alt={video.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoIcon className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play 
                    className="w-12 h-12 text-white cursor-pointer"
                    onClick={() => setPlayingVideo(video)}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{video.name}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{video.description}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Type: {videoTypes.find(t => t.id === video.type_id)?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="cursor-pointer p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <VideoIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No videos found</p>
            <button
              onClick={openAddVideoModal}
              className="cursor-pointer mt-4 text-amber-400 hover:text-amber-300"
            >
              Add your first video
            </button>
          </div>
        )}
      </div>

      {/* Video Player Modal - Minimized Square Box */}
      {playingVideo && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPlayingVideo(null)}
        >
          <div 
            className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden"
            style={{ width: '380px', maxWidth: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-white text-sm truncate max-w-[300px]">
                  {playingVideo.name}
                </h3>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Video Player - Square Aspect Ratio */}
            <div className="relative bg-black">
              {isYouTube(playingVideo.video_url) ? (
                <iframe 
                  src={getYouTubeEmbedUrl(playingVideo.video_url)} 
                  className="w-full aspect-square rounded-none"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={playingVideo.name}
                />
              ) : (
                <video 
                  src={playingVideo.video_url} 
                  controls 
                  autoPlay 
                  className="w-full aspect-square"
                  controlsList="nodownload"
                />
              )}
            </div>

            {/* Description */}
            {playingVideo.description && (
              <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700">
                <p className="text-gray-300 text-xs line-clamp-2">
                  {playingVideo.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Type Modal */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {editingType ? "Edit Video Type" : "Add Video Type"}
              </h2>
              <button onClick={() => setIsTypeModalOpen(false)} className="cursor-pointer p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type Name *</label>
                <input
                  type="text"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g., Tutorials, Interviews"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-700">
              <button onClick={() => setIsTypeModalOpen(false)} className="cursor-pointer px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600">
                Cancel
              </button>
              <button onClick={editingType ? handleEditType : handleAddType} className="cursor-pointer px-4 py-2 bg-amber-500 rounded-lg text-white hover:bg-amber-600 flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingType ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {editingVideo ? "Edit Video" : "Add Video"}
              </h2>
              <button onClick={() => setIsVideoModalOpen(false)} className="cursor-pointer p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Video Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Video Type *</label>
                <select
                  value={videoForm.type_id}
                  onChange={(e) => setVideoForm({ ...videoForm, type_id: e.target.value })}
                  className="cursor-pointer w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select Type</option>
                  {videoTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Video Name *</label>
                <input
                  type="text"
                  value={videoForm.name}
                  onChange={(e) => setVideoForm({ ...videoForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="Enter video title"
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  rows="3"
                  placeholder="Video description"
                />
              </div>
              
              {/* Video Source Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Video Source</label>
                <div className="flex gap-4">
                  <label className="cursor-pointer flex items-center gap-2">
                    <input
                      type="radio"
                      value="url"
                      checked={videoForm.video_source === "url"}
                      onChange={(e) => setVideoForm({ ...videoForm, video_source: e.target.value, video_file: null })}
                      className="cursor-pointer text-amber-500"
                    />
                    <LinkIcon className="w-4 h-4" />
                    URL
                  </label>
                  <label className="cursor-pointer flex items-center gap-2">
                    <input
                      type="radio"
                      value="file"
                      checked={videoForm.video_source === "file"}
                      onChange={(e) => setVideoForm({ ...videoForm, video_source: e.target.value, video_url: "" })}
                      className="cursor-pointer text-amber-500"
                    />
                    <Upload className="w-4 h-4" />
                    Upload File
                  </label>
                </div>
              </div>
              
              {/* Video URL or File Upload */}
              {videoForm.video_source === "url" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Video URL</label>
                  <input
                    type="url"
                    value={videoForm.video_url}
                    onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="https://example.com/video.mp4 or YouTube URL"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supports direct video links and YouTube URLs</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Upload Video File</label>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={(e) => setVideoForm({ ...videoForm, video_file: e.target.files[0] })}
                    className="cursor-pointer w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 file:cursor-pointer"
                  />
                </div>
              )}
              
              {/* Thumbnail Section */}
              <div className="border-t border-gray-700 pt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setVideoForm({ ...videoForm, thumbnail_file: e.target.files[0], thumbnail_url: "" })}
                    className="cursor-pointer w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 file:cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-700">
              <button onClick={() => setIsVideoModalOpen(false)} className="cursor-pointer px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600">
                Cancel
              </button>
              <button onClick={editingVideo ? handleEditVideo : handleAddVideo} className="cursor-pointer px-4 py-2 bg-amber-500 rounded-lg text-white hover:bg-amber-600 flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingVideo ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;