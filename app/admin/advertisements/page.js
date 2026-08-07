'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Trash2, Eye, EyeOff, Plus, ImageIcon, RefreshCw } from 'lucide-react';
import styles from '../generator.module.css';

export default function AdvertisementsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Fetch all ads (admin sees all, including inactive)
  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/advertisements?all=true');
      const data = await res.json();
      if (res.ok) {
        setAds(Array.isArray(data) ? data : []);
      } else {
        setError(data.error || 'Failed to load advertisements.');
      }
    } catch {
      setError('Connection error. Could not load advertisements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // File selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, WebP, and GIF images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }

    setError('');
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Upload new ad
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image file first.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('title', title.trim());

      const res = await fetch('/api/advertisements', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('Advertisement uploaded successfully!');
        setTitle('');
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchAds();
      } else {
        setError(data.error || 'Failed to upload advertisement.');
      }
    } catch {
      setError('Connection error. Could not upload advertisement.');
    } finally {
      setUploading(false);
    }
  };

  // Delete ad
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advertisement? This cannot be undone.')) return;

    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/advertisements?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Advertisement deleted.');
        setAds((prev) => prev.filter((ad) => ad._id !== id));
      } else {
        setError(data.error || 'Failed to delete advertisement.');
      }
    } catch {
      setError('Connection error. Could not delete advertisement.');
    }
  };

  // Toggle active/inactive
  const handleToggle = async (id, currentStatus) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/advertisements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setAds((prev) =>
          prev.map((ad) => (ad._id === id ? { ...ad, isActive: !currentStatus } : ad))
        );
        setSuccess(`Advertisement ${!currentStatus ? 'activated' : 'deactivated'}.`);
      } else {
        setError(data.error || 'Failed to update advertisement.');
      }
    } catch {
      setError('Connection error. Could not update advertisement.');
    }
  };

  return (
    <div className={styles.container}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="btn btn-outline"
            style={{ padding: '6px 12px' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <button
            onClick={fetchAds}
            className="btn btn-outline"
            style={{ padding: '6px 12px' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            📢 Advertisement Manager
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: 4 }}>
            Upload promotional images that appear as a popup when visitors open the website.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: 16, fontSize: '13px', fontWeight: '600' }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#d1fae5', border: '1px solid #10b981', color: '#065f46', padding: '10px 14px', borderRadius: '8px', marginBottom: 16, fontSize: '13px', fontWeight: '600' }}>
            ✅ {success}
          </div>
        )}

        {/* Upload Form */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: 32 }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0f4c81', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Upload New Advertisement
          </h2>

          <form onSubmit={handleUpload}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
              {/* File Input */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: 6 }}>
                  Image File <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#ffffff',
                    transition: 'border-color 0.2s',
                    minHeight: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0f4c81'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: 6, objectFit: 'contain' }}
                    />
                  ) : (
                    <>
                      <ImageIcon size={32} color="#94a3b8" />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Click to select image</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>JPEG, PNG, WebP, GIF · Max 5MB</span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {selectedFile && (
                  <div style={{ marginTop: 6, fontSize: '11px', color: '#10b981', fontWeight: '600' }}>
                    ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </div>
                )}
              </div>

              {/* Title + Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: 6 }}>
                    Ad Title / Label <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Umrah Package 2025 — Starting Rs. 1,20,000"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', fontSize: '13px', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: 4 }}>
                    This label is shown below the image in the popup.
                  </p>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#1d4ed8', lineHeight: 1.6 }}>
                  <strong>Tips:</strong>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: 16 }}>
                    <li>Use landscape images (wider than tall) for best display</li>
                    <li>Recommended size: 800×500 px or similar</li>
                    <li>You can add multiple ads — they will appear as a carousel</li>
                    <li>Toggle an ad inactive to hide it without deleting</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                backgroundColor: uploading || !selectedFile ? '#94a3b8' : '#0f4c81',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '14px',
                border: 'none',
                borderRadius: '8px',
                cursor: uploading || !selectedFile ? 'not-allowed' : 'pointer',
              }}
            >
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload Advertisement'}
            </button>
          </form>
        </div>

        {/* Existing Ads Grid */}
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0f4c81', marginBottom: 16 }}>
            Current Advertisements ({ads.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0', fontSize: '14px' }}>
              Loading advertisements...
            </div>
          ) : ads.length === 0 ? (
            <div style={{ textAlign: 'center', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '48px 24px', color: '#94a3b8' }}>
              <ImageIcon size={48} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>No advertisements yet</p>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Upload your first image above to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {ads.map((ad) => (
                <div
                  key={ad._id}
                  style={{
                    border: `2px solid ${ad.isActive ? '#10b981' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#ffffff',
                    boxShadow: ad.isActive ? '0 4px 16px rgba(16,185,129,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{ position: 'relative', background: '#f1f5f9', lineHeight: 0 }}>
                    <img
                      src={ad.imageUrl}
                      alt={ad.title || 'Advertisement'}
                      style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                    />
                    {/* Status badge */}
                    <span style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      padding: '3px 9px',
                      borderRadius: '20px',
                      fontSize: '10px',
                      fontWeight: '700',
                      background: ad.isActive ? '#10b981' : '#94a3b8',
                      color: '#ffffff',
                      letterSpacing: '0.05em',
                    }}>
                      {ad.isActive ? 'ACTIVE' : 'HIDDEN'}
                    </span>
                  </div>

                  {/* Info + Actions */}
                  <div style={{ padding: '12px' }}>
                    {ad.title && (
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ad.title}
                      </p>
                    )}
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 12px 0' }}>
                      Added {new Date(ad.createdAt).toLocaleDateString('en-GB')}
                    </p>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {/* Toggle active */}
                      <button
                        onClick={() => handleToggle(ad._id, ad.isActive)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          padding: '7px 0',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: `1px solid ${ad.isActive ? '#e2e8f0' : '#10b981'}`,
                          borderRadius: '6px',
                          background: ad.isActive ? '#f8fafc' : '#ecfdf5',
                          color: ad.isActive ? '#64748b' : '#065f46',
                          cursor: 'pointer',
                        }}
                      >
                        {ad.isActive ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Show</>}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(ad._id)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          padding: '7px 0',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: '1px solid #fca5a5',
                          borderRadius: '6px',
                          background: '#fff5f5',
                          color: '#b91c1c',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
