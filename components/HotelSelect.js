'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Building, Save } from 'lucide-react';

export default function HotelSelect({ 
  value = '', 
  onChange, 
  city = null, 
  placeholder = '-- Select Hotel --',
  style = {}
}) {
  const [hotels, setHotels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelCity, setNewHotelCity] = useState('Makkah');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Fetch all saved hotels from database
  const loadHotels = async () => {
    try {
      const res = await fetch('/api/hotels');
      const data = await res.json();
      if (Array.isArray(data)) {
        setHotels(data);
      }
    } catch (err) {
      console.error('Failed to load hotels list', err);
    }
  };

  // Sync city prop to modal city state if provided
  useEffect(() => {
    if (city) {
      if (city.toLowerCase().includes('makkah')) setNewHotelCity('Makkah');
      else if (city.toLowerCase().includes('madin') || city.toLowerCase().includes('medin')) setNewHotelCity('Madinah');
      else if (city.toLowerCase().includes('jeddah')) setNewHotelCity('Jeddah');
    }
  }, [city]);

  // Load hotels on mount & listen to window 'hotels-updated' event
  useEffect(() => {
    loadHotels();

    const handleGlobalUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setHotels(e.detail);
      } else {
        loadHotels();
      }
    };

    window.addEventListener('hotels-updated', handleGlobalUpdate);
    return () => {
      window.removeEventListener('hotels-updated', handleGlobalUpdate);
    };
  }, []);

  const handleSelectChange = (e) => {
    const selectedName = e.target.value;
    const found = hotels.find(h => h.name === selectedName);
    const foundCity = found ? found.city : null;
    if (onChange) onChange(selectedName, foundCity);
  };

  const handleSaveNewHotel = async (e) => {
    if (e) e.preventDefault();
    const cleanName = newHotelName.trim().toUpperCase();
    if (!cleanName) {
      setModalError('Please enter a hotel name.');
      return;
    }

    setSaving(true);
    setModalError('');

    try {
      const res = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, city: newHotelCity })
      });
      const data = await res.json();
      if (res.ok && data.hotels) {
        setHotels(data.hotels);
        
        // Broadcast custom window event so EVERY HotelSelect on the page updates its dropdown list
        window.dispatchEvent(new CustomEvent('hotels-updated', { detail: data.hotels }));
        
        // Auto select newly saved hotel in parent form
        if (onChange) onChange(cleanName, newHotelCity);
        
        setIsModalOpen(false);
        setNewHotelName('');
      } else {
        setModalError(data.error || 'Failed to save hotel.');
      }
    } catch (err) {
      setModalError('Failed to save hotel. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '6px', width: '100%', alignItems: 'center', ...style }}>
      {/* True HTML <select> Dropdown List */}
      <select
        value={value || ''}
        onChange={handleSelectChange}
        onFocus={loadHotels}
        style={{
          flex: 1,
          padding: '8px 10px',
          fontSize: '13px',
          border: '1px solid #cbd5e1',
          borderRadius: '4px',
          backgroundColor: '#ffffff',
          color: value ? '#0f172a' : '#64748b',
          fontWeight: value ? '600' : '400',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        <option value="">{placeholder}</option>
        
        {/* If value exists but is not in loaded hotels list yet */}
        {value && !hotels.some(h => h.name === value) && (
          <option value={value}>{value}</option>
        )}

        {/* Saved Hotels List from MongoDB */}
        {hotels.map((h) => (
          <option key={h._id || h.name} value={h.name}>
            {h.name} {h.city ? `(${h.city})` : ''}
          </option>
        ))}
      </select>

      {/* Plus Button to open Add Hotel modal */}
      <button
        type="button"
        onClick={() => {
          loadHotels();
          setModalError('');
          setNewHotelName('');
          setIsModalOpen(true);
        }}
        title="Add New Hotel to Dropdown List"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '34px',
          backgroundColor: '#0d9488',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background-color 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f766e'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
      >
        <Plus size={16} />
      </button>

      {/* Modal Dialog for Adding Hotel Name & City */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                backgroundColor: '#0f4c81',
                color: '#ffffff',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '15px' }}>
                <Building size={18} />
                <span>Add New Hotel to Dropdown</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  opacity: 0.8,
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              {modalError && (
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    color: '#dc2626',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginBottom: '14px'
                  }}
                >
                  {modalError}
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                  Hotel Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. PULLMAN ZAMZAM MAKKAH"
                  value={newHotelName}
                  onChange={(e) => setNewHotelName(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveNewHotel();
                    }
                  }}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    fontSize: '13px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    outline: 'none',
                    textTransform: 'uppercase',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                  City Location
                </label>
                <select
                  value={newHotelCity}
                  onChange={(e) => setNewHotelCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    fontSize: '13px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Makkah">Makkah</option>
                  <option value="Madinah">Madinah</option>
                  <option value="Jeddah">Jeddah</option>
                  <option value="General">General / Other</option>
                </select>
              </div>

              {/* Modal Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#64748b',
                    backgroundColor: '#f1f5f9',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewHotel}
                  disabled={saving}
                  style={{
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#ffffff',
                    backgroundColor: '#0d9488',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={14} />
                  <span>{saving ? 'Saving...' : 'Save Hotel'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
