import React, { useEffect, useState } from "react";
import { Upload, Trash2, Image as ImageIcon, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const Banners = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Fetch banners
  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API}/banners`);
      const data = await res.json();
      setBanners(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Upload banner
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) return alert("Please select an image");

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);

      const res = await fetch(`${API}/banners/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("Banner uploaded successfully!");
        clearSelectedImage();
        fetchBanners();
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading banner");
    } finally {
      setLoading(false);
    }
  };

  // Delete banner
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      setDeleteLoading(id);
      await fetch(`${API}/banners/${id}`, {
        method: "DELETE",
      });
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert("Error deleting banner");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Banner Management</h2>
        <p className="text-gray-400 text-sm">Manage home page banners and promotional images</p>
      </div>

      {/* Upload Form */}
      <div className="bg-gray-800 rounded-lg mb-8 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-semibold text-white">Upload New Banner</h3>
          <p className="text-gray-400 text-sm">Add a new banner to display on the home page</p>
        </div>
        
        <form onSubmit={handleUpload} className="p-4">
          {imagePreview ? (
            <div className="mb-4 relative">
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-auto rounded-lg object-cover border border-gray-600"
                />
                <button
                  type="button"
                  onClick={clearSelectedImage}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block">
                <div className="flex items-center justify-center w-full h-32 px-4 transition bg-gray-700 border-2 border-gray-600 border-dashed rounded-lg appearance-none cursor-pointer hover:border-amber-500 focus:outline-none">
                  <div className="flex flex-col items-center space-y-2">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      Click to select an image
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !image}
            className="flex items-center gap-2 bg-amber-500 px-4 py-2 rounded text-black hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {loading ? "Uploading..." : "Upload Banner"}
          </button>
        </form>
      </div>

      {/* Banner List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Current Banners</h3>
          <span className="text-sm text-gray-400">{banners.length} banners</span>
        </div>
        
        {banners.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No banners uploaded yet</p>
            <p className="text-gray-500 text-sm mt-1">Upload your first banner using the form above</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="bg-gray-800 rounded-lg overflow-hidden group relative"
              >
                <div className="relative">
                  <img
                    src={`data:image/jpeg;base64,${banner.image}`}
                    alt={`Banner ${banner.id}`}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(banner.id)}
                      disabled={deleteLoading === banner.id}
                      className="bg-red-500 px-3 py-2 rounded-lg text-white hover:bg-red-600 transition disabled:opacity-50"
                    >
                      {deleteLoading === banner.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-2 text-center">
                  <p className="text-xs text-gray-400">
                    ID: {banner.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Banners;