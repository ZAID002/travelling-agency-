'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Plane, Plus, Trash2, Printer, Save, RefreshCw, 
  UserPlus, FileCheck, ArrowLeft, ArrowRight, Upload,
  CheckCircle2, Briefcase, Utensils, Armchair, Headphones,
  Tag, ShieldCheck, FileText, User
} from 'lucide-react';
import styles from '../generator.module.css';

// Helper to resolve airline codes to name
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
  return 'YY';
};

// Helper to map airport codes to details
const getAirportDetails = (str) => {
  if (!str) return { city: 'N/A', airport: 'N/A' };
  
  const clean = str.toUpperCase().trim();
  let code = clean;
  if (clean.includes('-')) {
    code = clean.split('-')[0].trim();
  }
  
  const mapping = {
    'MUX': { city: 'Multan, PAKISTAN', airport: 'Multan International Airport' },
    'JED': { city: 'Jeddah, SAUDI ARABIA', airport: 'King Abdulaziz Int. Airport' },
    'MED': { city: 'Madinah, SAUDI ARABIA', airport: 'Prince Mohammad bin Abdulaziz Airport' },
    'LHE': { city: 'Lahore, PAKISTAN', airport: 'Allama Iqbal International Airport' },
    'ISB': { city: 'Islamabad, PAKISTAN', airport: 'Islamabad International Airport' },
    'KHI': { city: 'Karachi, PAKISTAN', airport: 'Jinnah International Airport' },
    'RUH': { city: 'Riyadh, SAUDI ARABIA', airport: 'King Khalid International Airport' },
    'DXB': { city: 'Dubai, UAE', airport: 'Dubai International Airport' }
  };
  
  return mapping[code] || { city: str, airport: 'International Airport' };
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
  
  // Custom airline state addition
  const [customAirlineCode, setCustomAirlineCode] = useState('');
  const [customAirlines, setCustomAirlines] = useState([]);

  // Initial Form State matching screenshot
  const [ticketData, setTicketData] = useState({
    voucherNo: '',
    status: 'Ticketed',
    airline: 'Saudi Arabian Airlines',
    airlineCode: 'SV',
    classCabin: 'ECONOMY',
    baggageChecked: '23, 46',
    baggageHand: '7 KG',
    meals: 'Yes',
    seatNo: 'Unassigned',
    otherInfo: 'Buy on board, if available',
    passengers: [
      {
        title: 'MR',
        givenName: 'MUHAMMAD ALI',
        surname: 'SHAHID',
        dob: '1988-06-12',
        nationality: 'PAKISTANI',
        passportNo: 'PY5165911',
        pnr: 'SV8ABC',
        status: 'CONFIRMED',
        passportExpiry: '2032-10-15'
      },
      {
        title: 'MRS',
        givenName: 'NIGHAT',
        surname: 'SHAHID',
        dob: '1992-04-20',
        nationality: 'PAKISTANI',
        passportNo: 'LR5165071',
        pnr: 'SV8ABC',
        status: 'CONFIRMED',
        passportExpiry: '2033-02-18'
      }
    ],
    sectors: [
      {
        flightNo: 'SV 801',
        from: 'MUX - Multan',
        to: 'JED - Jeddah',
        depDate: '2026-07-12',
        depTime: '16:44',
        arrDate: '2026-07-12',
        arrTime: '19:27'
      },
      {
        flightNo: 'SV 800',
        from: 'JED - Jeddah',
        to: 'MUX - Multan',
        depDate: '2026-08-01',
        depTime: '08:30',
        arrDate: '2026-08-01',
        arrTime: '15:05'
      }
    ]
  });

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
              setTicketData({
                ...exactMatch,
                airlineCode: exactMatch.airlineCode || getAirlineCodeFromName(exactMatch.airline)
              });
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

  const generateRandomVoucher = () => {
    const rand = Math.floor(100000 + Math.random() * 900000);
    setTicketData(prev => ({ ...prev, voucherNo: `FTW-ET-${rand}` }));
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setTicketData(prev => ({ ...prev, [name]: value }));
  };

  const handleAirlineSelectChange = (e) => {
    const airlineName = e.target.value;
    const code = getAirlineCodeFromName(airlineName);
    setTicketData(prev => ({ ...prev, airline: airlineName, airlineCode: code }));
  };

  // Add custom airline by code
  const handleAddCustomAirline = () => {
    if (!customAirlineCode) return;
    const code = customAirlineCode.toUpperCase().trim();
    const name = `${code} Airways`;
    const newAir = { code, name };
    setCustomAirlines(prev => [...prev, newAir]);
    setTicketData(prev => ({ ...prev, airline: name, airlineCode: code }));
    setCustomAirlineCode('');
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
          title: 'MR',
          givenName: '',
          surname: '',
          dob: '',
          nationality: 'PAKISTANI',
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
          from: 'MUX - Multan',
          to: 'JED - Jeddah',
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
    setTicketData(prev => ({ ...prev, sectors: updated }));
  };

  // Reset page
  const handleReset = () => {
    setTicketData({
      voucherNo: `FTW-ET-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Ticketed',
      airline: 'Saudi Arabian Airlines',
      airlineCode: 'SV',
      classCabin: 'ECONOMY',
      baggageChecked: '23, 46',
      baggageHand: '7 KG',
      meals: 'Yes',
      seatNo: 'Unassigned',
      otherInfo: 'Buy on board, if available',
      passengers: [
        {
          title: 'MR',
          givenName: 'MUHAMMAD ALI',
          surname: 'SHAHID',
          dob: '1988-06-12',
          nationality: 'PAKISTANI',
          passportNo: 'PY5165911',
          pnr: 'SV8ABC',
          status: 'CONFIRMED',
          passportExpiry: '2032-10-15'
        }
      ],
      sectors: [
        {
          flightNo: 'SV 801',
          from: 'MUX - Multan',
          to: 'JED - Jeddah',
          depDate: '2026-07-12',
          depTime: '16:44',
          arrDate: '2026-07-12',
          arrTime: '19:27'
        }
      ]
    });
  };

  // Save to DB
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

  // SVG Logo Renderer
  const renderAirlineLogo = (code, name) => {
    const cleanCode = (code || '').toUpperCase().trim();
    const cleanName = (name || '').toUpperCase().trim();
    const isSaudia = cleanCode === 'SV' || cleanName.includes('SAUDI') || cleanName.includes('SAUDIA');
    
    if (isSaudia) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="60" height="60" viewBox="0 0 120 120" style={{ marginRight: '10px' }}>
            <g fill="#c5a059">
              <path d="M 28 92 L 85 35 A 2 2 0 0 1 88 38 L 31 95 A 2 2 0 0 1 28 92 Z" />
              <path d="M 85 35 L 90 30 L 88 38 Z" />
              <path d="M 36 86 L 30 92 L 32 94 L 38 88 Z" />
              <circle cx="28" cy="95" r="3" />
              <path d="M 92 92 L 35 35 A 2 2 0 0 0 32 38 L 89 95 A 2 2 0 0 0 92 92 Z" />
              <path d="M 35 35 L 30 30 L 38 38 Z" />
              <path d="M 84 86 L 90 92 L 88 94 L 82 88 Z" />
              <circle cx="92" cy="95" r="3" />
              <path d="M 57 80 L 57 45 C 57 45 58 35 60 32 C 62 35 63 45 63 45 L 63 80 Z" />
              <path d="M 60 32 C 55 30 45 32 38 40 C 45 42 53 38 58 35 Z" />
              <path d="M 60 32 C 52 26 42 27 35 34 C 43 35 52 33 57 32 Z" />
              <path d="M 60 32 C 50 20 40 18 32 25 C 41 26 48 27 55 30 Z" />
              <path d="M 60 32 C 48 10 38 12 30 18 C 39 19 46 22 53 27 Z" />
              <path d="M 60 32 C 65 30 75 32 82 40 C 75 42 67 38 62 35 Z" />
              <path d="M 60 32 C 68 26 78 27 85 34 C 77 35 68 33 63 32 Z" />
              <path d="M 60 32 C 70 20 80 18 88 25 C 79 26 72 27 65 30 Z" />
              <path d="M 60 32 C 72 10 82 12 90 18 C 81 19 74 22 67 27 Z" />
              <path d="M 60 32 C 60 22 60 10 60 5 C 60 10 60 22 60 32 Z" stroke="#c5a059" strokeWidth="2" />
            </g>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '18px', color: '#035a37', fontWeight: '800', fontFamily: 'Arial, sans-serif', lineHeight: '1.1' }}>السعودية</span>
            <span style={{ fontSize: '20px', color: '#035a37', fontWeight: '900', letterSpacing: '1px', lineHeight: '1.0' }}>SAUDIA</span>
          </div>
        </div>
      );
    }
    
    const isPia = cleanCode === 'PK' || cleanName.includes('PAKISTAN') || cleanName.includes('PIA');
    if (isPia) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ background: '#00401b', color: '#ffffff', padding: '6px 12px', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '1px', lineHeight: '1' }}>PIA</span>
            <span style={{ fontSize: '8px', opacity: 0.8, letterSpacing: '0.5px' }}>Pakistan International</span>
          </div>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#00401b' }}>PIA</span>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#035a37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
          <Plane size={20} />
        </div>
        <span style={{ fontSize: '18px', fontWeight: '800', color: '#035a37' }}>{name || 'AIRLINE'}</span>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Print stylesheet to isolate print sheet and hide top-bar */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print-bar {
            display: none !important;
          }
          body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .${styles.container} {
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
          .${styles.splitLayout} {
            display: block !important;
            grid-template-columns: 1fr !important;
          }
          .${styles.formCard} {
            display: none !important;
          }
          .${styles.previewPanel} {
            position: static !important;
            display: block !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .${styles.voucherSheet} {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
          }
          @page {
            size: A4;
            margin: 1.2cm;
          }
        }
      `}} />

      {/* Top Header / Toolbar */}
      <div className="no-print-bar" style={{ backgroundColor: '#061e38', color: '#ffffff', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/admin/dashboard')} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '0.5px' }}>E-Ticket Voucher Generator</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => window.print()} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            <Printer size={16} /> Print / Save PDF
          </button>
          <button onClick={handleReset} style={{ backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #ffffff', padding: '8px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            <RefreshCw size={16} /> Reset
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '24px', flex: 1 }}>
        <div className={styles.splitLayout}>
          
          {/* LEFT: Builder Form */}
          <div className={styles.formCard} style={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
            
            {error && <div className={styles.errorBox}>{error}</div>}
            {saveSuccess && <div className={styles.successBox} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: 10, borderRadius: 4, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>Saved successfully in database!</div>}

            {/* 1. Select Airline */}
            <div className={styles.stepTitle}>1. Select Airline</div>
            <div className={styles.formGroup} style={{ marginBottom: '10px' }}>
              <label>Select Airline *</label>
              <select name="airline" value={ticketData.airline} onChange={handleAirlineSelectChange}>
                <option value="Saudi Arabian Airlines">Saudia (SV) - Saudi Arabian Airlines</option>
                <option value="Pakistan International Airlines">PIA (PK) - Pakistan International Airlines</option>
                <option value="Emirates">Emirates (EK) - Emirates</option>
                <option value="Qatar Airways">Qatar Airways (QR) - Qatar Airways</option>
                <option value="Oman Air">Oman Air (WY) - Oman Air</option>
                <option value="Etihad Airways">Etihad Airways (EY) - Etihad Airways</option>
                <option value="Gulf Air">Gulf Air (GF) - Gulf Air</option>
                {customAirlines.map(air => (
                  <option key={air.code} value={air.name}>{air.name} ({air.code})</option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label>Airline Code *</label>
                <input
                  type="text"
                  name="airlineCode"
                  required
                  value={ticketData.airlineCode}
                  onChange={handleFieldChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Can't find your airline?</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    placeholder="Enter airline code"
                    value={customAirlineCode}
                    onChange={(e) => setCustomAirlineCode(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={handleAddCustomAirline} className="btn" style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '0 12px', fontSize: '12px', fontWeight: '700', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                    Add Code
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.formNotice}>
              <CheckCircle2 size={16} style={{ color: '#166534', flexShrink: 0, marginTop: '2px' }} />
              <div>If your airline is not listed, enter the airline code above and click "Add Code". It will be available for future use.</div>
            </div>

            {/* 2. Passenger Details */}
            <div className={styles.stepTitle}>2. Passenger Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
              {ticketData.passengers.map((p, idx) => (
                <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#035a37' }}>Passenger #{idx + 1}</span>
                    {ticketData.passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePassenger(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600' }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    )}
                  </div>

                  <div className={styles.formGrid3} style={{ gap: '10px', marginBottom: '10px' }}>
                    <div className={styles.formGroup}>
                      <label>Title *</label>
                      <select
                        value={p.title}
                        onChange={(e) => handlePassengerChange(idx, 'title', e.target.value)}
                        style={{ padding: '8px', fontSize: '13px' }}
                      >
                        <option value="MR">MR</option>
                        <option value="MRS">MRS</option>
                        <option value="MISS">MISS</option>
                        <option value="MSTR">MSTR</option>
                      </select>
                    </div>
                    <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                      <label>Given Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MUHAMMAD ALI"
                        value={p.givenName || ''}
                        onChange={(e) => handlePassengerChange(idx, 'givenName', e.target.value)}
                        style={{ padding: '8px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div className={styles.formGrid3} style={{ gap: '10px' }}>
                    <div className={styles.formGroup}>
                      <label>Surname / Last Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SHAHID"
                        value={p.surname || ''}
                        onChange={(e) => handlePassengerChange(idx, 'surname', e.target.value)}
                        style={{ padding: '8px', fontSize: '13px' }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Passport No *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. PY5165911"
                        value={p.passportNo || ''}
                        onChange={(e) => handlePassengerChange(idx, 'passportNo', e.target.value)}
                        style={{ padding: '8px', fontSize: '13px' }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>PNR *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SV8ABC"
                        value={p.pnr || ''}
                        onChange={(e) => handlePassengerChange(idx, 'pnr', e.target.value)}
                        style={{ padding: '8px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div className={styles.formGrid2} style={{ gap: '10px', marginTop: '10px' }}>
                    <div className={styles.formGroup}>
                      <label>Status *</label>
                      <select
                        value={p.status}
                        onChange={(e) => handlePassengerChange(idx, 'status', e.target.value)}
                        style={{ padding: '8px', fontSize: '13px' }}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="TICKETED">TICKETED</option>
                        <option value="STANDBY">STANDBY</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
              <button type="button" onClick={addPassenger} className="btn" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px', cursor: 'pointer' }}>
                <Plus size={14} /> Add Passenger
              </button>
            </div>

            {/* 3. Journey Details */}
            <div className={styles.stepTitle}>3. Journey Details</div>
            {ticketData.sectors.map((sector, index) => (
              <div key={index} style={{ borderBottom: '1px dashed #e5e7eb', paddingBottom: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '700', fontSize: '12px', color: '#475569' }}>
                    {index === 0 ? 'Journey 1 (Departure)' : index === 1 ? 'Journey 2 (Return)' : `Journey ${index + 1}`}
                  </div>
                  {ticketData.sectors.length > 1 && (
                    <button type="button" onClick={() => removeSector(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Trash2 size={12} /> Remove Sector
                    </button>
                  )}
                </div>
                
                <div className={styles.formGrid3} style={{ marginBottom: '10px' }}>
                  <div className={styles.formGroup}>
                    <label>Flight No *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SV 801"
                      value={sector.flightNo}
                      onChange={(e) => handleSectorChange(index, 'flightNo', e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>From (Code - City) *</label>
                    <select
                      value={sector.from}
                      onChange={(e) => handleSectorChange(index, 'from', e.target.value)}
                    >
                      <option value="MUX - Multan">MUX - Multan</option>
                      <option value="JED - Jeddah">JED - Jeddah</option>
                      <option value="MED - Madinah">MED - Madinah</option>
                      <option value="LHE - Lahore">LHE - Lahore</option>
                      <option value="ISB - Islamabad">ISB - Islamabad</option>
                      <option value="KHI - Karachi">KHI - Karachi</option>
                      <option value="RUH - Riyadh">RUH - Riyadh</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>To (Code - City) *</label>
                    <select
                      value={sector.to}
                      onChange={(e) => handleSectorChange(index, 'to', e.target.value)}
                    >
                      <option value="JED - Jeddah">JED - Jeddah</option>
                      <option value="MUX - Multan">MUX - Multan</option>
                      <option value="MED - Madinah">MED - Madinah</option>
                      <option value="LHE - Lahore">LHE - Lahore</option>
                      <option value="ISB - Islamabad">ISB - Islamabad</option>
                      <option value="KHI - Karachi">KHI - Karachi</option>
                      <option value="RUH - Riyadh">RUH - Riyadh</option>
                    </select>
                  </div>
                </div>
                
                <div className={styles.formGrid3}>
                  <div className={styles.formGroup}>
                    <label>Date *</label>
                    <input
                      type="date"
                      required
                      value={sector.depDate}
                      onChange={(e) => handleSectorChange(index, 'depDate', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Departure Time *</label>
                    <input
                      type="time"
                      required
                      value={sector.depTime}
                      onChange={(e) => handleSectorChange(index, 'depTime', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Arrival Time *</label>
                    <input
                      type="time"
                      required
                      value={sector.arrTime}
                      onChange={(e) => handleSectorChange(index, 'arrTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
              <button type="button" onClick={addSector} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={14} /> Add Sector
              </button>
            </div>

            {/* 4. Fare / Service Info */}
            <div className={styles.stepTitle}>4. Fare / Service Info</div>
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label>Cabin Class</label>
                <select name="classCabin" value={ticketData.classCabin} onChange={handleFieldChange}>
                  <option value="ECONOMY">ECONOMY</option>
                  <option value="PREMIUM ECONOMY">PREMIUM ECONOMY</option>
                  <option value="BUSINESS">BUSINESS</option>
                  <option value="FIRST CLASS">FIRST CLASS</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Baggage (Pieces)</label>
                <input
                  type="text"
                  name="baggageChecked"
                  placeholder="e.g. 23, 46"
                  value={ticketData.baggageChecked}
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            <div className={styles.formGrid3} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Meal</label>
                <select name="meals" value={ticketData.meals} onChange={handleFieldChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Standard Meal">Standard Meal</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Seat</label>
                <input
                  type="text"
                  name="seatNo"
                  placeholder="e.g. Unassigned"
                  value={ticketData.seatNo}
                  onChange={handleFieldChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Other Info</label>
                <input
                  type="text"
                  name="otherInfo"
                  placeholder="e.g. Buy on board"
                  value={ticketData.otherInfo}
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="btn"
              style={{ width: '100%', padding: '12px', marginTop: '20px', backgroundColor: '#035a37', color: '#ffffff', fontSize: '14px', fontWeight: '700', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Generate PDF / Preview'}
            </button>
          </div>

          {/* RIGHT: Live print sheet */}
          <div className={styles.previewPanel}>
            
            {/* Document sheet */}
            <div id="voucher-print" className={styles.voucherSheet}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '15px' }}>
                {renderAirlineLogo(ticketData.airlineCode, ticketData.airline)}
                <div style={{ textAlign: 'right' }}>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>E-Ticket Voucher</h1>
                </div>
              </div>

              {/* Your booking is Ticketed Box */}
              <div className={styles.ticketAlert}>
                <CheckCircle2 size={24} style={{ color: '#10b981', flexShrink: 0 }} />
                <div>
                  <div className={styles.ticketAlertTitle}>Your booking is Ticketed</div>
                  <div className={styles.ticketAlertDesc}>Thank you for booking with us.</div>
                </div>
              </div>

              {/* Passenger Details Table */}
              <div className={styles.voucherSection}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 10px 0', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b' }}>
                  Passenger details
                </h4>
                <table className={styles.printTable} style={{ marginTop: '0px' }}>
                  <thead>
                    <tr>
                      <th className={styles.greenTableHeader} style={{ width: '40px', textAlign: 'center' }}>#</th>
                      <th className={styles.greenTableHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-start' }}>
                          <User size={13} style={{ color: '#ffffff' }} /> Passenger Name
                        </div>
                      </th>
                      <th className={styles.greenTableHeader} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                          <FileText size={13} style={{ color: '#ffffff' }} /> Passport No
                        </div>
                      </th>
                      <th className={styles.greenTableHeader} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                          <Tag size={13} style={{ color: '#ffffff' }} /> PNR
                        </div>
                      </th>
                      <th className={styles.greenTableHeader} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                          <ShieldCheck size={13} style={{ color: '#ffffff' }} /> Status
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketData.passengers.map((p, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', fontWeight: '600' }}>{idx + 1}</td>
                        <td style={{ fontWeight: '700', color: '#1e293b' }}>
                          {p.title} {p.givenName} {p.surname}
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '12px' }}>{p.passportNo || 'N/A'}</td>
                        <td style={{ textAlign: 'center', fontWeight: '700', fontFamily: 'monospace', color: '#035a37' }}>{p.pnr || 'N/A'}</td>
                        <td style={{ textAlign: 'center', fontWeight: '800', color: '#035a37', fontSize: '11px' }}>{p.status || 'CONFIRMED'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Journey Details Cards */}
              {ticketData.sectors.map((sector, idx) => {
                const depDetails = getAirportDetails(sector.from);
                const arrDetails = getAirportDetails(sector.to);
                
                return (
                  <div key={idx} className={styles.ticketCard}>
                    <div className={styles.ticketCardHeader}>
                      <Plane size={15} style={{ transform: 'rotate(90deg)' }} />
                      Departure from {depDetails.city.split(',')[0].toUpperCase()} {sector.flightNo}
                    </div>
                    
                    <div className={styles.ticketCardBody}>
                      {/* Left: Route details */}
                      <div className={styles.routeDetails}>
                        <div className={styles.routeCol}>
                          <div className={styles.routeDate}>{formatFlightDate(sector.depDate)}</div>
                          <div className={styles.routeTime}>{sector.depTime || '00:00'}</div>
                          <div className={styles.routeCode}>{(sector.from || '').split('-')[0].trim().toUpperCase()}</div>
                          <div className={styles.routeCity}>{depDetails.city}</div>
                          <div className={styles.routeAirport}>{depDetails.airport}</div>
                        </div>
                        
                        <div className={styles.flightPath}>
                          <div className={styles.flightLine}></div>
                          <Plane size={18} className={styles.flightIcon} style={{ transform: 'rotate(90deg)' }} />
                        </div>
                        
                        <div className={styles.routeCol}>
                          <div className={styles.routeDate}>{formatFlightDate(sector.arrDate)}</div>
                          <div className={styles.routeTime}>{sector.arrTime || '00:00'}</div>
                          <div className={styles.routeCode}>{(sector.to || '').split('-')[0].trim().toUpperCase()}</div>
                          <div className={styles.routeCity}>{arrDetails.city}</div>
                          <div className={styles.routeAirport}>{arrDetails.airport}</div>
                        </div>
                      </div>
                      
                      {/* Right: Service details */}
                      <div className={styles.serviceDetails}>
                        <div className={styles.serviceClass}>{ticketData.classCabin}</div>
                        
                        <div className={styles.serviceItem}>
                          <Briefcase size={14} className={styles.serviceIcon} />
                          <span>{ticketData.baggageChecked || '23'}</span>
                        </div>
                        
                        <div className={styles.serviceItem}>
                          <Utensils size={14} className={styles.serviceIcon} />
                          <span>{ticketData.meals === 'Yes' ? 'Yes' : ticketData.meals || 'No'}</span>
                        </div>
                        
                        <div className={styles.serviceItem}>
                          <Armchair size={14} className={styles.serviceIcon} />
                          <span>{ticketData.seatNo || 'Unassigned'}</span>
                        </div>
                        
                        <div className={styles.serviceItem}>
                          <Headphones size={14} className={styles.serviceIcon} />
                          <span>{ticketData.otherInfo || 'Buy on board'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Rules Section */}
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
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ETicketGenerator() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 40, textAlign: 'center' }}>Loading e-ticket form...</div>}>
      <ETicketGeneratorContent />
    </Suspense>
  );
}
