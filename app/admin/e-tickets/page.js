'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Plane, Plus, Trash2, Printer, Save, RefreshCw, 
  ArrowLeft, CheckCircle2, Briefcase, Utensils, 
  Armchair, Headphones, FileText, User, Search, Upload
} from 'lucide-react';
import styles from '../generator.module.css';

// Helper to resolve airline codes to name
const getAirlineNameFromCode = (code) => {
  const mapping = {
    'SV': 'Saudi Arabian Airlines',
    'PK': 'Pakistan International Airlines',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'WY': 'Oman Air',
    'EY': 'Etihad Airways',
    'GF': 'Gulf Air',
    'F3': 'Flyadeal',
    'XY': 'Flynas',
    'G9': 'Air Arabia'
  };
  return mapping[code.toUpperCase().trim()] || 'Custom Airline';
};

const getAirlineCodeFromName = (name) => {
  if (!name) return 'SV';
  const clean = name.toUpperCase();
  if (clean.includes('SAUDI') || clean.includes('SAUDIA')) return 'SV';
  if (clean.includes('PAKISTAN') || clean.includes('PIA')) return 'PK';
  if (clean.includes('EMIRATES')) return 'EK';
  if (clean.includes('QATAR')) return 'QR';
  if (clean.includes('OMAN')) return 'WY';
  if (clean.includes('ETIHAD')) return 'EY';
  if (clean.includes('GULF')) return 'GF';
  if (clean.includes('ADEAL') || clean.includes('FLYADEAL')) return 'F3';
  if (clean.includes('NAS') || clean.includes('FLYNAS')) return 'XY';
  if (clean.includes('ARABIA')) return 'G9';
  return 'YY';
};

// Parser to split airport selection string e.g. "MUX - Multan - Multan International Airport"
const parseAirportSelection = (val) => {
  if (!val) return { code: 'YYY', city: 'Unknown', airport: 'Airport' };
  const parts = val.split(' - ');
  return {
    code: (parts[0] || 'YYY').trim().toUpperCase(),
    city: (parts[1] || val).trim(),
    airport: (parts[2] || 'International Airport').trim()
  };
};

// Helper to format dates to "SUNDAY, 12 Jul 2026"
const formatFlightDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      const date = new Date(year, month, day);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const dayNum = date.getDate();
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const yearNum = date.getFullYear();
      return `${weekday}, ${dayNum} ${monthName} ${yearNum}`;
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const yearNum = date.getFullYear();
    return `${weekday}, ${dayNum} ${monthName} ${yearNum}`;
  } catch (e) {
    return dateStr;
  }
};

function ETicketGeneratorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editVoucherNo = searchParams.get('edit');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Scanning simulation overlays state
  const [scanningIndex, setScanningIndex] = useState(null);

  // Search local database states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Initial state matching https://flytoway.com/fly-to-way-e-ticket-voucher-generator/
  const initialTicketState = {
    voucherNo: '',
    status: 'CONFIRMED',
    airline: 'Saudi Arabian Airlines',
    airlineCode: 'SV',
    classCabin: 'Economy',
    baggageChecked: '23',
    baggageHand: '7',
    meals: 'Yes',
    seatNo: 'Unassigned',
    otherInfo: 'Buy on board, if available',
    tripType: 'One Way',
    passengers: [
      {
        title: 'Mr',
        givenName: 'MUHAMMAD',
        surname: 'ALI',
        dob: '1990-01-01',
        nationality: 'Pakistan',
        passportNo: 'AB1234567',
        pnr: 'PNR888',
        status: 'CONFIRMED',
        passportExpiry: '2032-12-31'
      }
    ],
    sectors: [
      {
        flightNo: 'SV-801',
        from: 'MUX - Multan - Multan International Airport',
        to: 'JED - Jeddah - King Abdulaziz International Airport',
        depDate: '',
        depTime: '',
        arrDate: '',
        arrTime: ''
      }
    ]
  };

  const [ticketData, setTicketData] = useState(initialTicketState);

  // Generate random voucher number
  const generateRandomVoucher = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setTicketData(prev => ({ ...prev, voucherNo: `FLY-${rand}` }));
  };

  // Fetch ticket details if editing
  useEffect(() => {
    if (editVoucherNo) {
      const fetchTicket = async () => {
        try {
          const res = await fetch(`/api/vouchers/e-ticket?search=${editVoucherNo}`);
          const data = await res.json();
          if (res.ok && data.length > 0) {
            const exactMatch = data.find(t => t.voucherNo === editVoucherNo);
            if (exactMatch) {
              setTicketData(exactMatch);
            }
          }
        } catch (err) {
          setError('Failed to fetch the ticket record.');
        }
      };
      fetchTicket();
    } else {
      generateRandomVoucher();
    }
  }, [editVoucherNo]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setTicketData(prev => ({ ...prev, [name]: value }));
  };

  const handleAirlineSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'Custom') {
      setTicketData(prev => ({ ...prev, airline: 'Custom Airline', airlineCode: '' }));
    } else {
      const code = getAirlineCodeFromName(val);
      setTicketData(prev => ({ ...prev, airline: val, airlineCode: code }));
    }
  };

  const handleAirlineCodeChange = (e) => {
    const code = e.target.value.toUpperCase();
    const name = getAirlineNameFromCode(code);
    setTicketData(prev => ({ ...prev, airlineCode: code, airline: name }));
  };

  // Passenger Handlers
  const handlePassengerChange = (index, field, value) => {
    const updated = [...ticketData.passengers];
    if (field === 'givenName' || field === 'surname' || field === 'passportNo' || field === 'pnr') {
      updated[index][field] = value.toUpperCase();
    } else {
      updated[index][field] = value;
    }
    setTicketData(prev => ({ ...prev, passengers: updated }));
  };

  const addPassenger = () => {
    setTicketData(prev => ({
      ...prev,
      passengers: [
        ...prev.passengers,
        {
          title: 'Mr',
          givenName: '',
          surname: '',
          dob: '',
          nationality: 'Pakistan',
          passportNo: '',
          pnr: ticketData.passengers[0]?.pnr || '',
          status: 'CONFIRMED',
          passportExpiry: ''
        }
      ]
    }));
  };

  const removePassenger = (index) => {
    if (ticketData.passengers.length === 1) return;
    const updated = ticketData.passengers.filter((_, i) => i !== index);
    setTicketData(prev => ({ ...prev, passengers: updated }));
  };

  // Simulated passport scanner OCR triggers
  const triggerPassportScan = (index) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,application/pdf';
    fileInput.onchange = () => {
      // Show scanning spinner for 1.5 seconds
      setScanningIndex(index);
      setTimeout(() => {
        const randNo = Math.floor(1000000 + Math.random() * 9000000);
        const updated = [...ticketData.passengers];
        updated[index] = {
          ...updated[index],
          title: Math.random() > 0.5 ? 'Mr' : 'Mrs',
          givenName: 'MUHAMMAD',
          surname: 'ARSHAD',
          dob: '1989-05-14',
          nationality: 'Pakistan',
          passportNo: `EA${randNo}`,
          passportExpiry: '2034-08-25',
          pnr: ticketData.passengers[0]?.pnr || 'SV9KSL',
          status: 'CONFIRMED'
        };
        setTicketData(prev => ({ ...prev, passengers: updated }));
        setScanningIndex(null);
      }, 1500);
    };
    fileInput.click();
  };

  // Sector Handlers
  const handleSectorChange = (index, field, value) => {
    const updated = [...ticketData.sectors];
    updated[index][field] = value;
    setTicketData(prev => ({ ...prev, sectors: updated }));
  };

  const addSector = () => {
    setTicketData(prev => ({
      ...prev,
      sectors: [
        ...prev.sectors,
        {
          flightNo: '',
          from: 'MUX - Multan - Multan International Airport',
          to: 'JED - Jeddah - King Abdulaziz International Airport',
          depDate: '',
          depTime: '',
          arrDate: '',
          arrTime: ''
        }
      ]
    }));
  };

  const removeSector = (index) => {
    if (ticketData.sectors.length === 1) return;
    const updated = ticketData.sectors.filter((_, i) => i !== index);
    setTicketData(prev => ({ ...prev, stays: updated, sectors: updated }));
  };

  // Reset page to initial defaults
  const handleReset = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setTicketData({
      ...initialTicketState,
      voucherNo: `FLY-${rand}`
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  // Search saved tickets
  const executeSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/vouchers/e-ticket?search=${searchQuery}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearching(false);
    }
  };

  // Save ticket to DB
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/vouchers/e-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save E-Ticket record.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setSaving(false);
    }
  };

  // SVG Airline Logo renderer matching reference visuals
  const renderAirlineLogo = (code, name) => {
    const cleanCode = (code || '').toUpperCase().trim();
    const cleanName = (name || '').toUpperCase().trim();
    const isSaudia = cleanCode === 'SV' || cleanName.includes('SAUDIA') || cleanName.includes('SAUDI');

    if (isSaudia) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="45" height="45" viewBox="0 0 120 120" style={{ marginRight: '10px' }}>
            <g fill="#c5a059">
              <path d="M 28 92 L 85 35 A 2 2 0 0 1 88 38 L 31 95 A 2 2 0 0 1 28 92 Z" />
              <circle cx="28" cy="95" r="3" />
              <path d="M 92 92 L 35 35 A 2 2 0 0 0 32 38 L 89 95 A 2 2 0 0 0 92 92 Z" />
              <circle cx="92" cy="95" r="3" />
              <path d="M 57 80 L 57 45 C 57 45 58 35 60 32 C 62 35 63 45 63 45 L 63 80 Z" />
              <path d="M 60 32 C 55 30 45 32 38 40 C 45 42 53 38 58 35 Z" />
              <path d="M 60 32 C 52 26 42 27 35 34 C 43 35 52 33 57 32 Z" />
              <path d="M 60 32 C 65 30 75 32 82 40 C 75 42 67 38 62 35 Z" />
              <path d="M 60 32 C 68 26 78 27 85 34 C 77 35 68 33 63 32 Z" />
            </g>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', color: '#035a37', fontWeight: '800', lineHeight: '1.1' }}>السعودية</span>
            <span style={{ fontSize: '15px', color: '#035a37', fontWeight: '900', letterSpacing: '0.5px', lineHeight: '1.0' }}>SAUDIA</span>
          </div>
        </div>
      );
    }

    const isPia = cleanCode === 'PK' || cleanName.includes('PIA') || cleanName.includes('PAKISTAN');
    if (isPia) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ background: '#00401b', color: '#ffffff', padding: '4px 8px', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '1px', lineHeight: '1' }}>PIA</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#00401b' }}>PIA</span>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#035a37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
          <Plane size={15} />
        </div>
        <span style={{ fontSize: '14px', fontWeight: '800', color: '#035a37' }}>{name}</span>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <style>{`
        @media print {
          .no-print-bar, .no-print-bar *, .formCard, .formCard *, .stackedFormCard, .stackedFormCard *, .previewToolbar, .previewToolbar *, .pdfActionButtons, .pdfActionButtons * {
            display: none !important;
          }
          body, html {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .previewPanel, .stackedPreviewPanel {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          #voucher-print {
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
      <div className="container">
        
        {/* Navigation & Action Controls Header */}
        <div className="no-print-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button onClick={() => router.push('/admin/dashboard')} className="btn btn-outline" style={{ padding: '6px 12px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleReset} className="btn btn-outline" style={{ padding: '8px 16px', fontWeight: 'bold' }}>
              Reset All
            </button>
            <button onClick={handleSave} disabled={saving} className="btn" style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              <Save size={14} style={{ marginRight: 6 }} /> {saving ? 'Saving...' : 'Save Ticket'}
            </button>
            <button onClick={() => window.print()} className="btn" style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              <Printer size={14} style={{ marginRight: 6 }} /> Print / Save PDF
            </button>
          </div>
        </div>

        <div className={styles.stackedLayout}>
          
          {/* LEFT: Form Panel */}
          <div className={styles.stackedFormCard}>
            
            {/* Search Saved Tickets */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px', marginBottom: '20px', backgroundColor: '#f8fafc' }}>
              <strong style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#035a37' }}>Search ticket by Passenger Name, PNR or Voucher No.</strong>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Type name, PNR or FLY-1001"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                />
                <button onClick={executeSearch} className="btn" style={{ padding: '8px 16px', backgroundColor: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  <Search size={14} /> Search
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>Search Results:</span>
                  {searchResults.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => {
                        setTicketData(t);
                        setSearchResults([]);
                      }}
                      style={{ padding: '6px 8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '12px', display: 'flex', justifyContent: 'space-between', hover: { backgroundColor: '#f1f5f9' } }}
                    >
                      <span style={{ fontWeight: 'bold', color: '#035a37' }}>{t.voucherNo}</span>
                      <span style={{ color: '#1e293b' }}>{t.passengers[0]?.givenName} {t.passengers[0]?.surname}</span>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{t.airlineCode} - {t.passengers[0]?.pnr}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div className={styles.errorBox} style={{ margin: '0 0 15px 0' }}>{error}</div>}
            {saveSuccess && <div className={styles.successBox} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: 10, borderRadius: 4, fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 15 }}>Ticket saved successfully in database!</div>}

            {/* 1. Ticket Record */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#035a37', color: '#ffffff', padding: '6px 10px', borderRadius: '4px' }}>
              <span>1. Ticket Record</span>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Voucher No.</label>
                <input
                  type="text"
                  readOnly
                  style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                  value={ticketData.voucherNo || 'FLY-1001 automatic'}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Ticket Status</label>
                <select name="status" value={ticketData.status} onChange={handleFieldChange}>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="TENTATIVE">TENTATIVE</option>
                  <option value="HOLD">HOLD</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            {/* 2. Select Airline */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#035a37', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>2. Select Airline</span>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Select Airline</label>
                <select value={ticketData.airline} onChange={handleAirlineSelectChange}>
                  <option value="Saudi Arabian Airlines">Saudia (SV)</option>
                  <option value="Pakistan International Airlines">Pakistan International Airlines (PK)</option>
                  <option value="Qatar Airways">Qatar Airways (QR)</option>
                  <option value="Emirates">Emirates (EK)</option>
                  <option value="Oman Air">Oman Air (WY)</option>
                  <option value="Etihad Airways">Etihad Airways (EY)</option>
                  <option value="Gulf Air">Gulf Air (GF)</option>
                  <option value="Flyadeal">Flyadeal (F3)</option>
                  <option value="Flynas">Flynas (XY)</option>
                  <option value="Air Arabia">Air Arabia (G9)</option>
                  <option value="Custom">Custom Airline...</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Airline Code</label>
                <input
                  type="text"
                  maxLength={3}
                  value={ticketData.airlineCode}
                  onChange={handleAirlineCodeChange}
                />
              </div>
            </div>

            {/* 3. Passport Scan */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#035a37', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>3. Passport Scan</span>
            </div>
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '6px', padding: '12px', marginTop: '10px', fontSize: '12px', color: '#1e3a8a', display: 'flex', gap: '8px' }}>
              <span>ℹ️</span>
              <span>Please use the "Scan Passport" button on each passenger card. Scanned details will be populated automatically for that passenger.</span>
            </div>

            {/* 4. Passenger Details */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#035a37', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>4. Passenger Details</span>
              <button type="button" onClick={addPassenger} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                <Plus size={12} /> Add Passenger
              </button>
            </div>

            {ticketData.passengers.map((p, index) => (
              <div key={index} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px', marginTop: '10px', backgroundColor: '#ffffff', position: 'relative' }}>
                
                {/* Scanning overlay loader */}
                {scanningIndex === index && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.85)', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '6px' }}>
                    <div style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #035a37', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '12px', color: '#035a37', fontWeight: 'bold', marginTop: '8px' }}>Scanning Passport OCR...</span>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '13px', color: '#035a37' }}>Passenger {index + 1}</strong>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => triggerPassportScan(index)} style={{ border: 'none', background: '#2563eb', color: '#ffffff', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Upload size={12} /> Scan Passport
                    </button>
                    {ticketData.passengers.length > 1 && (
                      <button type="button" onClick={() => removePassenger(index)} style={{ border: 'none', background: '#ef4444', color: '#ffffff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Title</label>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    {['Mr', 'Mrs', 'Ms'].map(t => (
                      <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`title-${index}`}
                          checked={p.title === t}
                          onChange={() => handlePassengerChange(index, 'title', t)}
                        /> {t}
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label>Given Name</label>
                    <input
                      type="text"
                      value={p.givenName}
                      onChange={(e) => handlePassengerChange(index, 'givenName', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Surname</label>
                    <input
                      type="text"
                      value={p.surname}
                      onChange={(e) => handlePassengerChange(index, 'surname', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGrid3} style={{ marginTop: '8px' }}>
                  <div className={styles.formGroup}>
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={p.dob}
                      onChange={(e) => handlePassengerChange(index, 'dob', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Passport Number</label>
                    <input
                      type="text"
                      value={p.passportNo}
                      onChange={(e) => handlePassengerChange(index, 'passportNo', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Passport Expiry</label>
                    <input
                      type="date"
                      value={p.passportExpiry}
                      onChange={(e) => handlePassengerChange(index, 'passportExpiry', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGrid3} style={{ marginTop: '8px' }}>
                  <div className={styles.formGroup}>
                    <label>Nationality</label>
                    <input
                      type="text"
                      value={p.nationality}
                      onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>PNR</label>
                    <input
                      type="text"
                      value={p.pnr}
                      onChange={(e) => handlePassengerChange(index, 'pnr', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Status</label>
                    <select value={p.status} onChange={(e) => handlePassengerChange(index, 'status', e.target.value)}>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="TICKETED">TICKETED</option>
                      <option value="STANDBY">STANDBY</option>
                      <option value="PENDING">PENDING</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

              </div>
            ))}

            {/* 5. Journey Details */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#035a37', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>5. Journey Details</span>
              <button type="button" onClick={addSector} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                <Plus size={12} /> Add Sector
              </button>
            </div>

            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Trip Type</label>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                {['One Way', 'Return', 'Multi-city'].map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="tripType"
                      checked={ticketData.tripType === t}
                      onChange={() => setTicketData(prev => ({ ...prev, tripType: t }))}
                    /> {t}
                  </label>
                ))}
              </div>
            </div>

            {ticketData.sectors.map((sector, index) => (
              <div key={index} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px', marginTop: '10px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '12px', color: '#035a37' }}>Sector {index + 1}</strong>
                  {ticketData.sectors.length > 1 && (
                    <button type="button" onClick={() => removeSector(index)} style={{ border: 'none', background: '#ef4444', color: '#ffffff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Delete
                    </button>
                  )}
                </div>

                <div className={styles.formGrid3}>
                  <div className={styles.formGroup}>
                    <label>Flight No</label>
                    <input
                      type="text"
                      placeholder="e.g. SV-801"
                      value={sector.flightNo}
                      onChange={(e) => handleSectorChange(index, 'flightNo', e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>From (Code - City - Airport)</label>
                    <select value={sector.from} onChange={(e) => handleSectorChange(index, 'from', e.target.value)}>
                      <option value="MUX - Multan - Multan International Airport">MUX - Multan - Multan International Airport</option>
                      <option value="JED - Jeddah - King Abdulaziz International Airport">JED - Jeddah - King Abdulaziz International Airport</option>
                      <option value="MED - Madinah - Prince Mohammad bin Abdulaziz Airport">MED - Madinah - Prince Mohammad bin Abdulaziz Airport</option>
                      <option value="LHE - Lahore - Allama Iqbal International Airport">LHE - Lahore - Allama Iqbal International Airport</option>
                      <option value="ISB - Islamabad - Islamabad International Airport">ISB - Islamabad - Islamabad International Airport</option>
                      <option value="KHI - Karachi - Jinnah International Airport">KHI - Karachi - Jinnah International Airport</option>
                      <option value="RUH - Riyadh - King Khalid International Airport">RUH - Riyadh - King Khalid International Airport</option>
                      <option value="DXB - Dubai - Dubai International Airport">DXB - Dubai - Dubai International Airport</option>
                      <option value="DOH - Doha - Hamad International Airport">DOH - Doha - Hamad International Airport</option>
                      <option value="MCT - Muscat - Muscat International Airport">MCT - Muscat - Muscat International Airport</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>To (Code - City - Airport)</label>
                    <select value={sector.to} onChange={(e) => handleSectorChange(index, 'to', e.target.value)}>
                      <option value="JED - Jeddah - King Abdulaziz International Airport">JED - Jeddah - King Abdulaziz International Airport</option>
                      <option value="MUX - Multan - Multan International Airport">MUX - Multan - Multan International Airport</option>
                      <option value="MED - Madinah - Prince Mohammad bin Abdulaziz Airport">MED - Madinah - Prince Mohammad bin Abdulaziz Airport</option>
                      <option value="LHE - Lahore - Allama Iqbal International Airport">LHE - Lahore - Allama Iqbal International Airport</option>
                      <option value="ISB - Islamabad - Islamabad International Airport">ISB - Islamabad - Islamabad International Airport</option>
                      <option value="KHI - Karachi - Jinnah International Airport">KHI - Karachi - Jinnah International Airport</option>
                      <option value="RUH - Riyadh - King Khalid International Airport">RUH - Riyadh - King Khalid International Airport</option>
                      <option value="DXB - Dubai - Dubai International Airport">DXB - Dubai - Dubai International Airport</option>
                      <option value="DOH - Doha - Hamad International Airport">DOH - Doha - Hamad International Airport</option>
                      <option value="MCT - Muscat - Muscat International Airport">MCT - Muscat - Muscat International Airport</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGrid4} style={{ marginTop: '8px' }}>
                  <div className={styles.formGroup}>
                    <label>Departure Date</label>
                    <input
                      type="date"
                      value={sector.depDate}
                      onChange={(e) => handleSectorChange(index, 'depDate', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Departure Time</label>
                    <input
                      type="time"
                      value={sector.depTime}
                      onChange={(e) => handleSectorChange(index, 'depTime', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Arrival Date</label>
                    <input
                      type="date"
                      value={sector.arrDate}
                      onChange={(e) => handleSectorChange(index, 'arrDate', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Arrival Time</label>
                    <input
                      type="time"
                      value={sector.arrTime}
                      onChange={(e) => handleSectorChange(index, 'arrTime', e.target.value)}
                    />
                  </div>
                </div>

              </div>
            ))}

            {/* 6. Fare / Service Info */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#035a37', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>6. Fare / Service Info</span>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Cabin Class</label>
                <select name="classCabin" value={ticketData.classCabin} onChange={handleFieldChange}>
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business</option>
                  <option value="First">First Class</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Meal</label>
                <select name="meals" value={ticketData.meals} onChange={handleFieldChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div className={styles.formGrid2} style={{ marginTop: '8px' }}>
              <div className={styles.formGroup}>
                <label>Checked Baggage</label>
                <select name="baggageChecked" value={ticketData.baggageChecked} onChange={handleFieldChange}>
                  <option value="23">23</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                  <option value="46">46</option>
                  <option value="No Baggage">No Baggage</option>
                </select>
                <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>kg checked baggage (included)</span>
              </div>
              <div className={styles.formGroup}>
                <label>Hand Baggage</label>
                <select name="baggageHand" value={ticketData.baggageHand} onChange={handleFieldChange}>
                  <option value="7">7</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
                <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>kg hand baggage (included)</span>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '8px' }}>
              <label>Seat</label>
              <input type="text" name="seatNo" value={ticketData.seatNo} onChange={handleFieldChange} />
            </div>

            <div className={styles.formGroup} style={{ marginTop: '8px' }}>
              <label>Other Info</label>
              <textarea name="otherInfo" value={ticketData.otherInfo} onChange={handleFieldChange} rows={2} />
            </div>

          </div>

          {/* RIGHT: Live print layout */}
          <div className={styles.stackedPreviewPanel}>
            <div className={styles.previewToolbar} style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '6px 6px 0 0' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#4b5563' }}>A4 FLIGHT TICKET PREVIEW (PDF VIEWER STYLE)</span>
              <button onClick={() => window.print()} className="btn" style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#ef4444', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                <Printer size={14} /> Print PDF
              </button>
            </div>

            {/* Document sheet */}
            <div id="voucher-print" className={styles.voucherSheet} style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', padding: '35px 25px', fontSize: '11.5px', color: '#000000', lineHeight: '1.4', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', marginBottom: '15px' }}>
                <img src="/logo.png" alt="Fly To Way Logo" style={{ height: '75px', width: 'auto', objectFit: 'contain' }} />
                <div style={{ textAlign: 'right' }}>
                  <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f4c81', letterSpacing: '0.5px' }}>E-Ticket Voucher</h1>
                  <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 'bold' }}>{ticketData.voucherNo || 'FLY-1001'}</span>
                </div>
              </div>

              {/* Status Alert Box */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', padding: '10px 12px', marginBottom: '15px' }}>
                <span style={{ fontSize: '20px' }}>🟢</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#065f46', fontSize: '12px' }}>
                    Your booking is {ticketData.status}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#047857' }}>
                    Thank you for booking with us.
                  </div>
                </div>
              </div>

              {/* Passenger Table */}
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#1e293b' }}>Passenger Details</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #cbd5e1' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#035a37', color: '#ffffff' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#035a37', color: '#ffffff' }}>#</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#035a37', color: '#ffffff' }}>Passenger Name</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#035a37', color: '#ffffff' }}>Passport No</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#035a37', color: '#ffffff' }}>PNR</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#035a37', color: '#ffffff' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketData.passengers.map((p, idx) => (
                      <tr key={idx}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          {p.title} {p.givenName} {p.surname}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center', fontFamily: 'monospace' }}>{p.passportNo || 'N/A'}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center', fontWeight: 'bold', color: '#035a37' }}>{p.pnr || 'N/A'}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center', fontWeight: 'bold', color: '#10b981', fontSize: '10px' }}>{p.status || 'CONFIRMED'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Journey Details Cards */}
              {ticketData.sectors.map((sector, idx) => {
                const dep = parseAirportSelection(sector.from);
                const arr = parseAirportSelection(sector.to);
                
                return (
                  <div key={idx} className={styles.ticketCard} style={{ marginBottom: '15px' }}>
                    {/* Dark Green Departure Header */}
                    <div className={styles.ticketCardHeader} style={{ backgroundColor: '#035a37' }}>
                      ✈ DEPARTURE FROM {dep.city.toUpperCase()} {sector.flightNo}
                    </div>

                    <div className={styles.ticketCardBody}>
                      {/* Left: Flight Details Row */}
                      <div className={styles.routeDetails}>
                        <div className={styles.routeCol}>
                          <div className={styles.routeDate}>{formatFlightDate(sector.depDate)}</div>
                          <div className={styles.routeTime}>{sector.depTime || '00:00'}</div>
                          <div className={styles.routeCode} style={{ fontSize: '13px' }}>{dep.code}</div>
                          <div className={styles.routeCity}>{dep.city}</div>
                          <div className={styles.routeAirport}>{dep.airport}</div>
                        </div>

                        <div className={styles.flightPath}>
                          <div className={styles.flightLine}></div>
                          <Plane size={14} className={styles.flightIcon} style={{ transform: 'rotate(90deg)', color: '#035a37' }} />
                        </div>

                        <div className={styles.routeCol}>
                          <div className={styles.routeDate}>{formatFlightDate(sector.arrDate)}</div>
                          <div className={styles.routeTime}>{sector.arrTime || '00:00'}</div>
                          <div className={styles.routeCode} style={{ fontSize: '13px' }}>{arr.code}</div>
                          <div className={styles.routeCity}>{arr.city}</div>
                          <div className={styles.routeAirport}>{arr.airport}</div>
                        </div>
                      </div>

                      {/* Right: Baggage / Meals Service info box */}
                      <div className={styles.serviceDetails} style={{ padding: '12px' }}>
                        <div className={styles.serviceClass}>{ticketData.classCabin}</div>
                        
                        <div className={styles.serviceItem}>
                          <Briefcase size={13} className={styles.serviceIcon} />
                          <span>{ticketData.baggageChecked} kg checked baggage</span>
                        </div>

                        <div className={styles.serviceItem}>
                          <Briefcase size={13} className={styles.serviceIcon} style={{ opacity: 0.7 }} />
                          <span>{ticketData.baggageHand} kg hand baggage</span>
                        </div>

                        <div className={styles.serviceItem}>
                          <Utensils size={13} className={styles.serviceIcon} />
                          <span>Meal: {ticketData.meals}</span>
                        </div>

                        <div className={styles.serviceItem}>
                          <Armchair size={13} className={styles.serviceIcon} />
                          <span>Seat: {ticketData.seatNo}</span>
                        </div>

                        {ticketData.otherInfo && (
                          <div className={styles.serviceItem}>
                            <Headphones size={13} className={styles.serviceIcon} />
                            <span style={{ fontSize: '9.5px' }}>{ticketData.otherInfo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Rules Bullet points list */}
              <div className={styles.rulesContainer}>
                <div className={styles.rulesTitle}>Rules:-</div>
                <ul className={styles.rulesList}>
                  <li>
                    <span className={styles.rulesBullet}>&bull;</span>
                    Please Report Airline Check-In Counter 4 Hours Before Flight Departure.
                  </li>
                  <li>
                    <span className={styles.rulesBullet}>&bull;</span>
                    Please Reconfirm the Ticket Before 48 Hours of Flight Departure.
                  </li>
                  <li>
                    <span className={styles.rulesBullet}>&bull;</span>
                    All Visa and Travel Document are Traveler Own Responsibility.
                  </li>
                  <li>
                    <span className={styles.rulesBullet}>&bull;</span>
                    All Groups Tickets are Non-Refundable and Non-Changeable.
                  </li>
                  <li>
                    <span className={styles.rulesBullet}>&bull;</span>
                    All (Non-PK market / LLC) tickets are Non-Refundable / Non-Changeable.
                  </li>
                </ul>
              </div>

            </div>

            {/* PDF Action Buttons at bottom of document viewer */}
            <div className={`${styles.pdfActionButtons} no-print-bar`}>
              <button 
                onClick={() => window.print()} 
                className="btn" 
                style={{ 
                  padding: '12px 28px', 
                  fontSize: '15px', 
                  backgroundColor: '#035a37', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <Printer size={18} /> Print E-Ticket
              </button>
              <button 
                onClick={() => window.print()} 
                className="btn" 
                style={{ 
                  padding: '12px 28px', 
                  fontSize: '15px', 
                  backgroundColor: '#2563eb', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <Save size={18} /> Download PDF
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default function ETicketGenerator() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 40, textAlign: 'center' }}>Loading flight e-ticket sheet...</div>}>
      <ETicketGeneratorContent />
    </Suspense>
  );
}
