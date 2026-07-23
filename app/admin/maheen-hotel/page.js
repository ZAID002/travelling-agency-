'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Plane, Plus, Trash2, Printer, Download, Save, RefreshCw, 
  ArrowLeft, Search, User, FileText, Calendar, Landmark, Info, CheckCircle2
} from 'lucide-react';
import styles from '../generator.module.css';
import HotelSelect from '@/components/HotelSelect';
import QuickAddSelect from '@/components/QuickAddSelect';

function UmrahVoucherGeneratorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editVoucherNo = searchParams.get('edit');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPdf(true);
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      const element = document.getElementById('voucher-print');
      if (!element) return;

      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      const originalMargin = element.style.margin;

      element.style.width = '794px';
      element.style.maxWidth = '794px';
      element.style.margin = '0 auto';

      const opt = {
        margin: [0, 0, 0, 0],
        filename: `${voucherData.voucherNo || 'Umrah-Voucher'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false, 
          width: 794,
          windowWidth: 794,
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await window.html2pdf().set(opt).from(element).save();

      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.style.margin = originalMargin;
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Initial state based on Maheen Umrah Voucher PDF layout
  const initialVoucherState = {
    voucherNo: '',
    status: 'Definite',
    issueDate: new Date().toLocaleDateString('en-GB'),
    packageCode: '',
    paxNo: '1 (A:1, C:0, I:0)',
    bedsNo: '1',
    familyHead: '',
    ubNo: '',
    mNo: '',
    isMaheen: true,
    
    // Flight departures and arrivals
    flights: [
      { type: 'DEPARTURE', flightNo: '', sector: '', depDate: '', arrDate: '' },
      { type: 'ARRIVAL', flightNo: '', sector: '', depDate: '', arrDate: '' }
    ],

    // Stays list
    stays: [
      {
        city: 'Makkah',
        hotelName: '',
        view: 'Standard',
        mealPlan: 'RO',
        hcn: '',
        roomType: 'Sharing (Family)',
        checkIn: '',
        checkOut: '',
        totalNights: 0
      }
    ],

    // Transport Details
    transportTravelDate: '',
    transportTransporter: 'Company Transport',
    transportType: 'Economy By Bus',
    transportDesc: 'Round Trip (Jed-Mak-Med-Mak-Jed)',

    // Mutamers list
    mutamers: [
      { passportNo: '', name: '', gender: 'M', paxType: 'Adult', bed: 'Yes', groupNo: '', visaNo: '', pnr: '' }
    ],

    // Emergency Contacts
    specialInstructions: '',
    makkahContactName: 'Muhammad Waqas',
    makkahContactNo: '+92-347-9416446',
    madinahContactName: 'Mehmood',
    madinahContactNo: '+966-59-863-8330',

    // Company and print config
    companyName: 'FLY TO WAY TRAVEL & TOURS',
    officeAddress: 'College Road, Lahore - Pakistan',
    phone: '+923082122760',
    email: 'info@flytoway.com',
    authorizedPerson: 'SHUJA CH',
    importantNotes: ''
  };

  const sanitizeVoucherData = (data) => {
    if (!data) return initialVoucherState;
    return {
      ...initialVoucherState,
      ...data,
      voucherNo: data.voucherNo ?? '',
      status: data.status ?? 'Definite',
      issueDate: data.issueDate ?? '',
      packageCode: data.packageCode ?? '',
      paxNo: data.paxNo ?? '',
      bedsNo: data.bedsNo ?? '',
      familyHead: data.familyHead ?? '',
      ubNo: data.ubNo ?? '',
      mNo: data.mNo ?? '',
      transportTravelDate: data.transportTravelDate ?? '',
      transportTransporter: data.transportTransporter ?? '',
      transportType: data.transportType ?? '',
      transportDesc: data.transportDesc ?? '',
      specialInstructions: data.specialInstructions ?? '',
      makkahContactName: data.makkahContactName ?? '',
      makkahContactNo: data.makkahContactNo ?? '',
      madinahContactName: data.madinahContactName ?? '',
      madinahContactNo: data.madinahContactNo ?? '',
      companyName: data.companyName ?? '',
      officeAddress: data.officeAddress ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      authorizedPerson: data.authorizedPerson ?? '',
      importantNotes: data.importantNotes ?? '',
      flights: (data.flights && data.flights.length > 0 ? data.flights : initialVoucherState.flights).map(f => ({
        type: f.type ?? 'DEPARTURE',
        flightNo: f.flightNo ?? '',
        sector: f.sector ?? '',
        depDate: f.depDate ?? '',
        arrDate: f.arrDate ?? ''
      })),
      stays: (data.stays && data.stays.length > 0 ? data.stays : initialVoucherState.stays).map(s => ({
        city: s.city ?? 'Makkah',
        hotelName: s.hotelName ?? '',
        view: s.view ?? '',
        mealPlan: s.mealPlan ?? '',
        hcn: s.hcn ?? '',
        roomType: s.roomType ?? '',
        checkIn: s.checkIn ?? '',
        checkOut: s.checkOut ?? '',
        totalNights: s.totalNights ?? 0
      })),
      mutamers: (data.mutamers && data.mutamers.length > 0 ? data.mutamers : initialVoucherState.mutamers).map(m => ({
        passportNo: m.passportNo ?? '',
        name: m.name ?? '',
        gender: m.gender ?? 'M',
        paxType: m.paxType ?? 'Adult',
        bed: m.bed ?? 'Yes',
        groupNo: m.groupNo ?? '',
        visaNo: m.visaNo ?? '',
        pnr: m.pnr ?? ''
      }))
    };
  };

  const [voucherData, setVoucherData] = useState(initialVoucherState);

  // Search local database states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchNextVoucherNumber = async () => {
    try {
      const res = await fetch('/api/vouchers/maheen?nextNumber=true');
      const data = await res.json();
      if (res.ok && data.nextVoucherNo) {
        setVoucherData(prev => ({ ...prev, voucherNo: data.nextVoucherNo }));
      } else {
        setVoucherData(prev => ({ ...prev, voucherNo: 'FTW-8001' }));
      }
    } catch (err) {
      setVoucherData(prev => ({ ...prev, voucherNo: 'FTW-8001' }));
    }
  };

  // Fetch details if editing
  useEffect(() => {
    if (editVoucherNo) {
      const fetchVoucher = async () => {
        try {
          const res = await fetch(`/api/vouchers/maheen?search=${editVoucherNo}`);
          const data = await res.json();
          if (res.ok && data.length > 0) {
            const exactMatch = data.find(v => v.voucherNo === editVoucherNo);
            if (exactMatch) {
              setVoucherData(sanitizeVoucherData(exactMatch));
            }
          }
        } catch (err) {
          setError('Failed to fetch the voucher.');
        }
      };
      fetchVoucher();
    } else {
      fetchNextVoucherNumber();
    }
  }, [editVoucherNo]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setVoucherData(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldChangeUpper = (e) => {
    const { name, value } = e.target;
    setVoucherData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  // Helper to compute nights
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 0 : diffDays;
  };

  // Stay Handlers
  const handleStayChange = (index, field, value) => {
    const updated = [...voucherData.stays];
    updated[index][field] = value;
    
    // Auto-calculate nights if check-in or check-out changes
    if (field === 'checkIn' || field === 'checkOut') {
      const checkInVal = field === 'checkIn' ? value : updated[index].checkIn;
      const checkOutVal = field === 'checkOut' ? value : updated[index].checkOut;
      updated[index].totalNights = calculateNights(checkInVal, checkOutVal);
    }
    
    setVoucherData(prev => ({ ...prev, stays: updated }));
  };

  const addStay = () => {
    setVoucherData(prev => ({
      ...prev,
      stays: [
        ...prev.stays,
        {
          city: 'Makkah',
          hotelName: '',
          view: 'Standard',
          mealPlan: 'RO',
          hcn: '',
          roomType: 'Sharing (Family)',
          checkIn: '',
          checkOut: '',
          totalNights: 0
        }
      ]
    }));
  };

  const removeStay = (index) => {
    if (voucherData.stays.length === 1) return;
    const updated = voucherData.stays.filter((_, i) => i !== index);
    setVoucherData(prev => ({ ...prev, stays: updated }));
  };

  // Flight Handlers
  const handleFlightChange = (index, field, value) => {
    const updated = [...voucherData.flights];
    updated[index][field] = value.toUpperCase();
    setVoucherData(prev => ({ ...prev, flights: updated }));
  };

  // Mutamers Handlers
  const handleMutamerChange = (index, field, value) => {
    const updated = [...voucherData.mutamers];
    updated[index][field] = field === 'passportNo' || field === 'pnr' || field === 'groupNo' || field === 'visaNo'
      ? value.toUpperCase()
      : value;
    setVoucherData(prev => ({ ...prev, mutamers: updated }));
  };

  const addMutamer = () => {
    setVoucherData(prev => ({
      ...prev,
      mutamers: [
        ...prev.mutamers,
        { passportNo: '', name: '', gender: 'M', paxType: 'Adult', bed: 'Yes', groupNo: '', visaNo: '', pnr: '' }
      ]
    }));
  };

  const removeMutamer = (index) => {
    if (voucherData.mutamers.length === 1) return;
    const updated = voucherData.mutamers.filter((_, i) => i !== index);
    setVoucherData(prev => ({ ...prev, mutamers: updated }));
  };

  // Reset form to defaults
  const handleReset = () => {
    setVoucherData(initialVoucherState);
    fetchNextVoucherNumber();
    setSearchResults([]);
    setSearchQuery('');
  };

  // Search Vouchers
  const executeSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/vouchers/maheen?search=${searchQuery}`);
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

  // Save to DB
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/vouchers/maheen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData)
      });

      if (res.ok) {
        setSaveSuccess(true);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save Umrah Voucher.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <style dangerouslySetInnerHTML={{ __html: `
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
            padding: 1.6cm !important;
            margin: 0 !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
          }
          .urdu-instructions {
            page-break-inside: avoid;
          }
          @page {
            size: A4;
            margin: 0 !important;
          }
        }
      `}} />
      <div className="container">
        
        {/* Navigation & Controls header */}
        <div className="no-print-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button onClick={() => router.push('/admin/dashboard')} className="btn btn-outline" style={{ padding: '6px 12px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleReset} className="btn btn-outline" style={{ padding: '8px 16px', fontWeight: 'bold' }}>
              Reset All
            </button>
            <button
              type="button"
              disabled={downloadingPdf}
              onClick={handleDownloadPDF}
              className="btn"
              style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Download size={14} /> {downloadingPdf ? 'Generating PDF...' : 'Download PDF (iPhone/Mobile)'}
            </button>
            <button onClick={handleSave} disabled={saving} className="btn" style={{ padding: '8px 16px', backgroundColor: '#0a2e5c', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              <Save size={14} style={{ marginRight: 6 }} /> {saving ? 'Saving...' : 'Save Voucher'}
            </button>
            <button onClick={() => window.print()} className="btn" style={{ padding: '8px 16px', backgroundColor: '#0f4c81', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              <Printer size={14} style={{ marginRight: 6 }} /> Print
            </button>
          </div>
        </div>

        <div className={styles.stackedLayout}>
          
          {/* LEFT: Form Panel */}
          <div className={`${styles.stackedFormCard} no-print-bar`}>
            
            {/* Search Saved Vouchers */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px', marginBottom: '20px', backgroundColor: '#f8fafc' }}>
              <strong style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#0a2e5c' }}>Search Saved Umrah Vouchers</strong>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Voucher #, Family Head, Package, Passport or Pilgrim Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                />
                <button onClick={executeSearch} className="btn" style={{ padding: '8px 16px', backgroundColor: '#0a2e5c', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  <Search size={14} /> Search
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>Search Results:</span>
                  {searchResults.map((v) => (
                    <div
                      key={v._id}
                      onClick={() => {
                        setVoucherData(sanitizeVoucherData(v));
                        setSearchResults([]);
                      }}
                      style={{ padding: '6px 8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '12px', display: 'flex', justifyContent: 'space-between', hover: { backgroundColor: '#f1f5f9' } }}
                    >
                      <span style={{ fontWeight: 'bold', color: '#0a2e5c' }}>{v.voucherNo}</span>
                      <span style={{ color: '#1e293b' }}>{v.familyHead}</span>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{v.packageCode}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Submission Confirmation Modal Popup */}
            {saveSuccess && (
              <div
                className="no-print-bar"
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 9999,
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '480px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                    overflow: 'hidden',
                    textAlign: 'center',
                    padding: '30px 24px',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#d1fae5',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto'
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>

                  <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
                    Form Submitted Successfully!
                  </h2>
                  <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#475569' }}>
                    Voucher <strong>{voucherData.voucherNo}</strong> has been saved in database and is ready to print or download.
                  </p>

                  {/* Action Buttons inside Popup Modal */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        window.print();
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '14px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 10px rgba(239, 68, 68, 0.25)'
                      }}
                    >
                      <Printer size={18} /> Print / Download Voucher PDF
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSaveSuccess(false);
                        handleReset();
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#0a2e5c',
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '13px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={16} /> Create Another Voucher
                    </button>

                    <button
                      type="button"
                      onClick={() => setSaveSuccess(false)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: 'transparent',
                        color: '#64748b',
                        fontWeight: '600',
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 1. Voucher Details */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: '6px 10px', borderRadius: '4px' }}>
              <span>1. Voucher General Info</span>
            </div>
            <div className={styles.formGrid3} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Voucher / Booking No.</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    name="voucherNo"
                    required
                    value={voucherData.voucherNo || ''}
                    onChange={handleFieldChange}
                  />
                  <button type="button" onClick={fetchNextVoucherNumber} className="btn btn-outline" style={{ padding: 8, title: 'Fetch next serial voucher number' }}>
                    <RefreshCw size={12} />
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Voucher Date</label>
                <input type="text" name="issueDate" value={voucherData.issueDate || ''} onChange={handleFieldChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Package Code</label>
                <input type="text" name="packageCode" value={voucherData.packageCode || ''} onChange={handleFieldChangeUpper} />
              </div>
            </div>
            <div className={styles.formGrid3} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>PAX Summary (e.g. 5 (A:5,C:0,I:0))</label>
                <input type="text" name="paxNo" value={voucherData.paxNo || ''} onChange={handleFieldChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Beds count</label>
                <input type="text" name="bedsNo" value={voucherData.bedsNo || ''} onChange={handleFieldChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Booking Status</label>
                <select name="status" value={voucherData.status || 'Definite'} onChange={handleFieldChange}>
                  <option value="Definite">Definite</option>
                  <option value="Tentative">Tentative</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            <div className={styles.formGrid3} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Family Head Name</label>
                <input type="text" name="familyHead" value={voucherData.familyHead || ''} onChange={handleFieldChangeUpper} />
              </div>
              <div className={styles.formGroup}>
                <label>UB Number</label>
                <input type="text" name="ubNo" value={voucherData.ubNo || ''} onChange={handleFieldChangeUpper} />
              </div>
              <div className={styles.formGroup}>
                <label>MNo (optional)</label>
                <input type="text" name="mNo" value={voucherData.mNo || ''} onChange={handleFieldChangeUpper} />
              </div>
            </div>

            {/* 2. Flight Details */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>2. Flight Details (Departure & Arrival)</span>
            </div>
            {voucherData.flights.map((flight, idx) => (
              <div key={idx} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', marginTop: '10px', backgroundColor: '#ffffff' }}>
                <strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#0a2e5c' }}>{flight.type} Sector</strong>
                <div className={styles.formGrid4}>
                  <div className={styles.formGroup}>
                    <label>Flight No</label>
                    <input type="text" value={flight.flightNo || ''} onChange={(e) => handleFlightChange(idx, 'flightNo', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Sector (e.g. KHI-JED)</label>
                    <input type="text" value={flight.sector || ''} onChange={(e) => handleFlightChange(idx, 'sector', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Departure Date/Time</label>
                    <input type="text" value={flight.depDate || ''} placeholder="e.g. 05-JUL 03:30" onChange={(e) => handleFlightChange(idx, 'depDate', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Arrival Date/Time</label>
                    <input type="text" value={flight.arrDate || ''} placeholder="e.g. 05-JUL 06:05" onChange={(e) => handleFlightChange(idx, 'arrDate', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            {/* 3. Hotel Accommodations */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>3. Accommodation Stays</span>
              <button type="button" onClick={addStay} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                <Plus size={12} /> Add Hotel
              </button>
            </div>
            {voucherData.stays.map((stay, index) => (
              <div key={index} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', marginTop: '10px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '12px', color: '#0a2e5c' }}>Stay {index + 1}</strong>
                  {voucherData.stays.length > 1 && (
                    <button type="button" onClick={() => removeStay(index)} style={{ border: 'none', background: '#ef4444', color: '#ffffff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Delete
                    </button>
                  )}
                </div>
                <div className={styles.formGrid3}>
                  <div className={styles.formGroup}>
                    <label>City</label>
                    <select value={stay.city || 'Makkah'} onChange={(e) => handleStayChange(index, 'city', e.target.value)}>
                      <option value="Makkah">Makkah</option>
                      <option value="Medinah">Medinah</option>
                      <option value="Jeddah">Jeddah</option>
                    </select>
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label>Hotel Name</label>
                    <HotelSelect
                      value={stay.hotelName || ''}
                      city={stay.city === 'Medinah' ? 'Madinah' : stay.city}
                      onChange={(val, cityVal) => {
                        handleStayChange(index, 'hotelName', val);
                        if (cityVal && cityVal !== 'General') {
                          handleStayChange(index, 'city', cityVal === 'Madinah' ? 'Medinah' : cityVal);
                        }
                      }}
                      placeholder="Select or type hotel name..."
                    />
                  </div>
                </div>
                <div className={styles.formGrid3} style={{ marginTop: '6px' }}>
                  <div className={styles.formGroup}>
                    <label>Room View</label>
                    <QuickAddSelect
                      label="Room View"
                      value={stay.view || ''}
                      onChange={(val) => handleStayChange(index, 'view', val)}
                      defaultOptions={['Haram View', 'City View', 'Kaaba View', 'Partial Haram View', 'Courtyard View']}
                      storageKey="ftw_custom_room_views"
                      placeholder="Select or add view..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Meal Plan</label>
                    <QuickAddSelect
                      label="Meal Plan"
                      value={stay.mealPlan || ''}
                      onChange={(val) => handleStayChange(index, 'mealPlan', val)}
                      defaultOptions={['RO', 'BB', 'HB', 'FB']}
                      storageKey="ftw_custom_meal_plans"
                      placeholder="Select or add meal plan..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Room Type</label>
                    <QuickAddSelect
                      label="Room Type"
                      value={stay.roomType || ''}
                      onChange={(val) => handleStayChange(index, 'roomType', val)}
                      defaultOptions={['Quad', 'Triple', 'Double', 'Single']}
                      storageKey="ftw_custom_room_types"
                      placeholder="Select or add room type..."
                    />
                  </div>
                </div>
                <div className={styles.formGrid4} style={{ marginTop: '6px' }}>
                  <div className={styles.formGroup}>
                    <label>Check In</label>
                    <input type="date" value={stay.checkIn || ''} onChange={(e) => handleStayChange(index, 'checkIn', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Check Out</label>
                    <input type="date" value={stay.checkOut || ''} onChange={(e) => handleStayChange(index, 'checkOut', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nights</label>
                    <input type="number" readOnly style={{ backgroundColor: '#f1f5f9' }} value={stay.totalNights || 0} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Conf # (optional)</label>
                    <input type="text" placeholder="HCN / Confirmation No." value={stay.hcn || ''} onChange={(e) => handleStayChange(index, 'hcn', e.target.value.toUpperCase())} />
                  </div>
                </div>
              </div>
            ))}

            {/* 4. Transport Detail */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>4. Transport Details</span>
            </div>
            <div className={styles.formGrid4} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Travel Date</label>
                <input type="text" name="transportTravelDate" value={voucherData.transportTravelDate || ''} placeholder="e.g. 05-JUL" onChange={handleFieldChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Transporter</label>
                <input type="text" name="transportTransporter" value={voucherData.transportTransporter || ''} onChange={handleFieldChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Transport Type</label>
                <input type="text" name="transportType" value={voucherData.transportType || ''} onChange={handleFieldChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <input type="text" name="transportDesc" value={voucherData.transportDesc || ''} onChange={handleFieldChange} />
              </div>
            </div>

            {/* 5. Mutamers (Pilgrims) */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>5. Mutamers Manifest</span>
              <button type="button" onClick={addMutamer} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                <Plus size={12} /> Add Mutamer
              </button>
            </div>
            {voucherData.mutamers.map((mutamer, index) => (
              <div key={index} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', marginTop: '10px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '12px', color: '#0a2e5c' }}>Mutamer {index + 1}</strong>
                  {voucherData.mutamers.length > 1 && (
                    <button type="button" onClick={() => removeMutamer(index)} style={{ border: 'none', background: '#ef4444', color: '#ffffff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Delete
                    </button>
                  )}
                </div>
                <div className={styles.formGrid3}>
                  <div className={styles.formGroup}>
                    <label>Passport No</label>
                    <input type="text" value={mutamer.passportNo || ''} onChange={(e) => handleMutamerChange(index, 'passportNo', e.target.value)} />
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label>Mutamer Name</label>
                    <input type="text" value={mutamer.name || ''} onChange={(e) => handleMutamerChange(index, 'name', e.target.value.toUpperCase())} />
                  </div>
                </div>
                <div className={styles.formGrid3} style={{ marginTop: '6px' }}>
                  <div className={styles.formGroup}>
                    <label>Gender</label>
                    <select value={mutamer.gender || 'M'} onChange={(e) => handleMutamerChange(index, 'gender', e.target.value)}>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>PAX Type</label>
                    <select value={mutamer.paxType || 'Adult'} onChange={(e) => handleMutamerChange(index, 'paxType', e.target.value)}>
                      <option value="Adult">Adult</option>
                      <option value="Child">Child</option>
                      <option value="Infant">Infant</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Bed Included</label>
                    <select value={mutamer.bed || 'Yes'} onChange={(e) => handleMutamerChange(index, 'bed', e.target.value)}>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGrid3} style={{ marginTop: '6px' }}>
                  <div className={styles.formGroup}>
                    <label>Group No</label>
                    <input type="text" value={mutamer.groupNo || ''} onChange={(e) => handleMutamerChange(index, 'groupNo', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Visa #</label>
                    <input type="text" value={mutamer.visaNo || ''} onChange={(e) => handleMutamerChange(index, 'visaNo', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>PNR</label>
                    <input type="text" value={mutamer.pnr || ''} onChange={(e) => handleMutamerChange(index, 'pnr', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            {/* 6. Special Instructions & Management Contacts */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>6. Instructions & Ground Support Contacts</span>
            </div>
            <div className={styles.formGroup} style={{ marginTop: '10px' }}>
              <label>Special Instructions (Hijaz Muqadas pax, etc.)</label>
              <input type="text" name="specialInstructions" value={voucherData.specialInstructions || ''} onChange={handleFieldChange} />
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '10px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                <strong style={{ fontSize: '11px', color: '#0a2e5c', display: 'block', marginBottom: '6px' }}>Makkah Hotel Contact</strong>
                <div className={styles.formGroup} style={{ marginBottom: '6px' }}>
                  <label>Contact Name</label>
                  <input type="text" name="makkahContactName" value={voucherData.makkahContactName || ''} onChange={handleFieldChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>WhatsApp No.</label>
                  <input type="text" name="makkahContactNo" value={voucherData.makkahContactNo || ''} onChange={handleFieldChange} />
                </div>
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                <strong style={{ fontSize: '11px', color: '#0a2e5c', display: 'block', marginBottom: '6px' }}>Madinah Hotel Contact</strong>
                <div className={styles.formGroup} style={{ marginBottom: '6px' }}>
                  <label>Contact Name</label>
                  <input type="text" name="madinahContactName" value={voucherData.madinahContactName || ''} onChange={handleFieldChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>WhatsApp No.</label>
                  <input type="text" name="madinahContactNo" value={voucherData.madinahContactNo || ''} onChange={handleFieldChange} />
                </div>
              </div>
            </div>

            {/* 7. Company Details */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>7. Company Details</span>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Company Name</label>
                <input type="text" name="companyName" value={voucherData.companyName || ''} onChange={handleFieldChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Office Address</label>
                <input type="text" name="officeAddress" value={voucherData.officeAddress || ''} onChange={handleFieldChange} />
              </div>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '8px' }}>
              <div className={styles.formGroup}>
                <label>WhatsApp</label>
                <input type="text" name="phone" value={voucherData.phone || ''} onChange={handleFieldChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="text" name="email" value={voucherData.email || ''} onChange={handleFieldChange} />
              </div>
            </div>
            <div className={styles.formGroup} style={{ marginTop: '8px' }}>
              <label>Authorized Signatory</label>
              <input type="text" name="authorizedPerson" value={voucherData.authorizedPerson || ''} onChange={handleFieldChangeUpper} />
            </div>

            {/* Submit Section at Bottom of Form */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '2px dashed #cbd5e1', display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline"
                style={{ padding: '10px 18px', fontWeight: 'bold' }}
              >
                Reset Form
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '12px 28px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}
              >
                <Save size={18} /> {saving ? 'Submitting Form...' : 'Submit Voucher'}
              </button>
            </div>

          </div>

          {/* RIGHT: Live print layout */}
          <div className={styles.stackedPreviewPanel}>
            <div className={`${styles.previewToolbar} no-print-bar`} style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '6px 6px 0 0' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#4b5563' }}>A4 UMRAH VOUCHER SHEET PREVIEW (PDF VIEWER STYLE)</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={downloadingPdf}
                  onClick={handleDownloadPDF}
                  className="btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  <Download size={14} /> {downloadingPdf ? 'Generating PDF...' : 'Download PDF (iPhone/Mobile)'}
                </button>
                <button onClick={() => window.print()} className="btn" style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#0a2e5c', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            {/* Document sheet */}
            <div id="voucher-print" className={styles.voucherSheet} style={{ backgroundColor: '#ffffff', fontFamily: '"Outfit", "Inter", "Segoe UI", Arial, sans-serif', padding: '45px 35px', fontSize: '13.5px', color: '#1e293b', lineHeight: '1.5', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              
              {/* Header block with Logo and Title */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0a2e5c', paddingBottom: '16px', marginBottom: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src="/logo.png" alt="Fly To Way Logo" style={{ height: '95px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: '12.5px', color: '#1e293b' }}>
                  <div style={{ fontSize: '16.5px', fontWeight: 'bold', color: '#0a2e5c', marginBottom: '4px' }}>UMRAH TRAVEL VOUCHER</div>
                  <div><strong>VOUCHER DATE:</strong> {voucherData.issueDate}</div>
                  <div><strong>PACKAGE:</strong> {voucherData.packageCode}</div>
                  <div><strong>PAX:</strong> {voucherData.paxNo}</div>
                  <div><strong>BEDS:</strong> {voucherData.bedsNo}</div>
                </div>
              </div>

              {/* Family Head info bar in solid Dark Blue */}
              <div style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: '8px 14px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <span><strong>F.Head:</strong> {voucherData.familyHead}</span>
                  <span><strong>UB No:</strong> {voucherData.ubNo}</span>
                  {voucherData.mNo && <span><strong>MNo:</strong> {voucherData.mNo}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11.5px', background: '#10b981', padding: '3px 8px', borderRadius: '3px', fontWeight: 'bold', textTransform: 'uppercase' }}>{voucherData.status}</span>
                  {/* Decorative small printable pseudo QR block */}
                  <div style={{ width: '22px', height: '22px', backgroundColor: '#ffffff', display: 'flex', padding: '2px' }}>
                    <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(45deg, #000, #000 2px, #fff 2px, #fff 4px)' }}></div>
                  </div>
                </div>
              </div>

              {/* Flight Routing Section (DEPARTURE & ARRIVAL side by side) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                {voucherData.flights.map((flight, idx) => (
                  <div key={idx} style={{ border: '1.5px solid #0a2e5c', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: '6px 12px', fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.5px' }}>
                      ✈ {flight.type === 'DEPARTURE' ? 'DEPARTURE DETAILS' : 'ARRIVAL DETAILS'}
                    </div>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', margin: '6px 4px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '5px 8px', color: '#4b5563', width: '80px' }}><strong>Flight:</strong></td>
                          <td style={{ padding: '5px 8px', fontWeight: 'bold' }}>{flight.flightNo || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', color: '#4b5563' }}><strong>Sector:</strong></td>
                          <td style={{ padding: '5px 8px', fontWeight: 'bold' }}>{flight.sector || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', color: '#4b5563' }}><strong>Departure:</strong></td>
                          <td style={{ padding: '5px 8px' }}>{flight.depDate || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', color: '#4b5563' }}><strong>Arrival:</strong></td>
                          <td style={{ padding: '5px 8px' }}>{flight.arrDate || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              {/* Accommodation Table */}
              <div style={{ marginBottom: '25px' }}>
                <div style={{ color: '#0a2e5c', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🏨 Accommodation Plan
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', border: '1.5px solid #0a2e5c' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0a2e5c', color: '#ffffff' }}>
                      <th style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'left' }}>City</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'left' }}>Hotel Name</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'center' }}>View</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'center' }}>Meal</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'center' }}>Conf #</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'left' }}>Room Type</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'center' }}>Checkin</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'center' }}>Checkout</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'center' }}>Nights</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voucherData.stays.map((stay, idx) => {
                      const checkInFormatted = stay.checkIn ? stay.checkIn.split('-').reverse().slice(0,2).join('-') + '-' + stay.checkIn.split('-')[0].slice(2) : '';
                      const checkOutFormatted = stay.checkOut ? stay.checkOut.split('-').reverse().slice(0,2).join('-') + '-' + stay.checkOut.split('-')[0].slice(2) : '';
                      return (
                        <tr key={idx} style={{ backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', fontWeight: 'bold' }}>{stay.city}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px' }}>{stay.hotelName || 'N/A'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{stay.view}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{stay.mealPlan}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '900', fontSize: '17px', color: '#000000', fontFamily: 'monospace, sans-serif' }}>{stay.hcn || '-'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px' }}>{stay.roomType}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{checkInFormatted}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{checkOutFormatted}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 'bold' }}>{stay.totalNights}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ backgroundColor: '#0a2e5c', color: '#ffffff', fontWeight: 'bold' }}>
                      <td colSpan={8} style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'right' }}>Total Nights:</td>
                      <td style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'center', fontSize: '13px' }}>
                        {voucherData.stays.reduce((acc, s) => acc + (parseInt(s.totalNights) || 0), 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Transport Detail Section */}
              <div style={{ marginBottom: '25px' }}>
                <div style={{ color: '#0a2e5c', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🚌 Transport Logistics
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', border: '1.5px solid #0a2e5c' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0a2e5c', color: '#ffffff' }}>
                      <th style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'left', width: '20%' }}>Travel Date</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'left', width: '30%' }}>Transporter</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'left', width: '20%' }}>Type</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '8px 10px', textAlign: 'left', width: '30%' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px' }}>{voucherData.transportTravelDate || 'As per Schedule'}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', fontWeight: 'bold' }}>{voucherData.transportTransporter || 'N/A'}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px' }}>{voucherData.transportType || 'N/A'}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px' }}>{voucherData.transportDesc || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mutamers Manifest Table */}
              <div style={{ marginBottom: '25px' }}>
                <div style={{ color: '#0a2e5c', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  👤 Pilgrims (Mutamers) list
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1.5px solid #0a2e5c' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0a2e5c', color: '#ffffff' }}>
                      <th style={{ border: '1px solid #0a2e5c', padding: '7px 9px', textAlign: 'center', width: '5%' }}>SNO</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '7px 9px', textAlign: 'left', width: '15%' }}>Passport</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '7px 9px', textAlign: 'left', width: '40%' }}>Mutamer Name</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '7px 9px', textAlign: 'center', width: '5%' }}>G</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '7px 9px', textAlign: 'center', width: '10%' }}>PAX</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '7px 9px', textAlign: 'center', width: '5%' }}>Bed</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '7px 9px', textAlign: 'left', width: '10%' }}>Group #</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '7px 9px', textAlign: 'left', width: '10%' }}>Visa #</th>
                      <th style={{ border: '1px solid #0a2e5c', padding: '7px 9px', textAlign: 'left', width: '10%' }}>PNR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voucherData.mutamers.map((mutamer, idx) => (
                      <tr key={idx} style={{ backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '7px 9px', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '7px 9px', fontWeight: '500', fontFamily: 'monospace' }}>{mutamer.passportNo || 'N/A'}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '7px 9px', fontWeight: 'bold' }}>{mutamer.name || 'N/A'}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '7px 9px', textAlign: 'center' }}>{mutamer.gender}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '7px 9px', textAlign: 'center' }}>{mutamer.paxType}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '7px 9px', textAlign: 'center' }}>{mutamer.bed}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '7px 9px' }}>{mutamer.groupNo || '-'}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '7px 9px' }}>{mutamer.visaNo || '-'}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '7px 9px', fontWeight: 'bold', fontFamily: 'monospace' }}>{mutamer.pnr || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ground Support Contacts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '25px', alignItems: 'start' }}>
                <div style={{ border: '1.5px solid #0a2e5c', borderRadius: '4px', padding: '10px 12px' }}>
                  <div><strong>Special Instructions:</strong></div>
                  <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '12.5px', marginTop: '4px', textTransform: 'uppercase' }}>
                    ⚠️ {voucherData.specialInstructions || 'N/A'}
                  </div>
                </div>
                <div style={{ border: '1.5px solid #0a2e5c', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: '6px 10px', fontWeight: 'bold', fontSize: '11.5px' }}>
                    📞 GROUND REPRESENTATIVES
                  </div>
                  <div style={{ padding: '8px 10px', fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {voucherData.makkahContactName && (
                      <div>🕋 <strong>MAKKAH Support:</strong> {voucherData.makkahContactName} ({voucherData.makkahContactNo})</div>
                    )}
                    {voucherData.madinahContactName && (
                      <div>🕌 <strong>MADINA Support:</strong> {voucherData.madinahContactName} ({voucherData.madinahContactNo})</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Urdu Instructions Block */}
              <div className="urdu-instructions" style={{ border: '1.5px solid #0a2e5c', borderRadius: '5px', padding: '14px 18px', backgroundColor: '#f0f4fa', marginBottom: '25px' }}>
                <div dir="rtl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '12.5px', lineHeight: '1.65', color: '#0a2e5c', textAlign: 'right' }}>
                  <strong style={{ display: 'block', fontSize: '14px', marginBottom: '8px', borderBottom: '1px solid #b9c9e3', paddingBottom: '4px' }}>ضروری ہدایات:-</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0px 20px' }}>
                    <div>
                      ⭐ سعودیہ میں معتمرین سے پاسپورٹ لینے کی کسی کو اجازت نہیں ہے۔ لہذا اپنا پاسپورٹ اپنے پاس سنبھال کے رکھیں۔ پاسپورٹ گم ہونے کی صورت میں آوٹ پاس اور ٹکٹ کے چارجز معتمر پر عائد ہونگے۔ <br />
                      ⭐ ہوٹل میں چیک ان اور چیک آوٹ کا وقت ظہر 2 بجے ہے۔ جبکہ مدینہ میں ہوٹل خالی اور صفائی کی صورت میں کچھ دیر انتظار کرنا پڑ سکتا ہے۔ <br />
                      ⭐ معتمرین یہ ووچر درج شیڈول یا ادارے کے اسٹاف کی طرف سے دیئے گئے روانگی اوقات عمل کرنے کے پابند ہونگے۔ <br />
                      ⭐ معتمر کو مکہ سے مدینہ، مدینہ سے مکہ، مکہ سے ایئر پورٹ روانگی سے 24 گھنٹے قبل اسٹاف کو اپنا روانگی شیڈول نوٹ کروانا ہو گا۔
                    </div>
                    <div>
                      ⭐ مدینہ روانگی کیلئے صبح 7 بجے ہوٹل سے اپنا سامان اٹھا کر اسٹاف کی طرف سے بتائے گئے مقام پر آنا ضروری ہو گا۔ <br />
                      ⭐ مکہ سے جدہ ایئرپورٹ روانگی 8 گھنٹے پہلے ہوٹل چھوڑنا ہو گا۔ <br />
                      ⭐ کسی بھی سیکٹر کی ٹرانسپورٹ چھوٹ جانے پر دوبارہ ٹرانسپورٹ فراہم نہیں کی جائے گی (دوبارہ ٹرانسپورٹ حاصل کرنے کے الگ چارجز ہونگے)۔ <br />
                      ⭐ پرواز چھوٹ جانے کی صورت میں ادارہ ذمہ دار نہ ہو گا۔ Extra Night کے چارجز معتمر خود ادا کرنے ہونگے۔ <br />
                      ⭐ سعودی قوانین اور پالیسی پر مکمل عملدرآمد کرنے کی ذمہ داری معتمرین پر عائد ہو گی۔ کسی بھی پریشانی کی صورت میں عازمین یہ ووچر پر درج شدہ سعودی اسٹاف کے نمبر پر رابطہ کریں۔
                    </div>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '11px', borderTop: '1px dashed #cbd5e1', paddingTop: '6px', fontWeight: 'bold' }}>
                    نوٹ: مندرجہ بالا ہدایات پر عملدرآمد کو یقینی بنائیں کو تاہی کی صورت میں ہونے والے کسی بھی نقصان کی ذمہ داری معتمرین پر ہوگی۔
                  </div>
                </div>
              </div>

              {/* Sign off and Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: '14px', marginTop: '20px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '60%' }}>
                  <strong>{voucherData.companyName}</strong> <br />
                  📍 {voucherData.officeAddress} | ✉ {voucherData.email} | 📞 {voucherData.phone}
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px' }}>
                  <div style={{ color: '#4b5563' }}>Authorized Signatory:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '14.5px', color: '#0a2e5c', textTransform: 'uppercase', marginTop: '2px' }}>{voucherData.authorizedPerson}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>RESERVATION DEPT</div>
                </div>
              </div>

            </div>



          </div>

        </div>

      </div>
    </div>
  );
}

export default function UmrahVoucherGenerator() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 40, textAlign: 'center' }}>Loading Umrah voucher sheet...</div>}>
      <UmrahVoucherGeneratorContent />
    </Suspense>
  );
}
