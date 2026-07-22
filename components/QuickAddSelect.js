'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Save, Tag } from 'lucide-react';

export default function QuickAddSelect({
  label = 'Option',
  value = '',
  onChange,
  defaultOptions = [],
  storageKey = '',
  placeholder = '-- Select --',
  style = {}
}) {
  const [customOptions, setCustomOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [modalError, setModalError] = useState('');

  // Load custom items from localStorage
  const loadCustomOptions = () => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCustomOptions(parsed);
        }
      }
    } catch (e) {
      console.error(`Failed to load ${storageKey} from localStorage`, e);
    }
  };

  useEffect(() => {
    loadCustomOptions();

    const handleStorageUpdate = (e) => {
      if (e.detail && e.detail.key === storageKey && Array.isArray(e.detail.items)) {
        setCustomOptions(e.detail.items);
      } else {
        loadCustomOptions();
      }
    };

    window.addEventListener('quick-options-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('quick-options-updated', handleStorageUpdate);
    };
  }, [storageKey]);

  // Combine default options + custom options + current value if not present
  const allOptions = [...defaultOptions];
  customOptions.forEach(opt => {
    if (!allOptions.includes(opt)) allOptions.push(opt);
  });
  if (value && !allOptions.includes(value)) {
    allOptions.push(value);
  }

  const handleSelectChange = (e) => {
    if (onChange) onChange(e.target.value);
  };

  const handleSaveNewItem = (e) => {
    if (e) e.preventDefault();
    const cleanText = newItemText.trim().toUpperCase();
    if (!cleanText) {
      setModalError(`Please enter a valid ${label.toLowerCase()}.`);
      return;
    }

    if (allOptions.map(o => o.toUpperCase()).includes(cleanText)) {
      // If already exists, just select it
      if (onChange) onChange(cleanText);
      setIsModalOpen(false);
      setNewItemText('');
      return;
    }

    const updatedCustom = [...customOptions, cleanText];
    setCustomOptions(updatedCustom);

    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedCustom));
        window.dispatchEvent(new CustomEvent('quick-options-updated', {
          detail: { key: storageKey, items: updatedCustom }
        }));
      } catch (err) {
        console.error('Failed to save custom option to localStorage', err);
      }
    }

    if (onChange) onChange(cleanText);
    setIsModalOpen(false);
    setNewItemText('');
  };

  return (
    <div style={{ display: 'flex', gap: '6px', width: '100%', alignItems: 'center', ...style }}>
      {/* Select Dropdown */}
      <select
        value={value || ''}
        onChange={handleSelectChange}
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
        {!value && <option value="">{placeholder}</option>}
        {allOptions.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {/* Plus (+) button */}
      <button
        type="button"
        onClick={() => {
          setModalError('');
          setNewItemText('');
          setIsModalOpen(true);
        }}
        title={`Add New ${label}`}
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

      {/* Modal Dialog */}
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
              maxWidth: '400px',
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
                <Tag size={18} />
                <span>Add New {label}</span>
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

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                  {label} Name / Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${label} name...`}
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveNewItem();
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

              {/* Modal Footer */}
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
                  onClick={handleSaveNewItem}
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
                  <span>Save {label}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
