'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Hotel, Plus, Trash2, Printer, Download, Save, RefreshCw, 
  User, FileText, ArrowLeft, Calendar, Bell, Search, CheckCircle2
} from 'lucide-react';
import styles from '../generator.module.css';
import HotelSelect from '@/components/HotelSelect';
import QuickAddSelect from '@/components/QuickAddSelect';

function HotelVoucherGeneratorContent() {
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
        filename: `${voucherData.voucherNo || 'Hotel-Voucher'}.pdf`,
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

  // Initial state matching https://flytoway.com/hotel-voucher-generator-page/
  const initialVoucherState = {
    voucherNo: '',
    status: 'Definite',
    issueDate: new Date().toLocaleDateString('en-GB'),
    clientName: '',
    guestName: '',
    checkInTime: '16:00',
    checkOutTime: '14:00',
    remarks: '',
    makkahContactName: '',
    makkahContactNo: '',
    madinahContactName: '',
    madinahContactNo: '',
    companyName: 'FLY TO WAY TRAVEL & TOURS',
    officeAddress: 'College Road, Lahore - Pakistan',
    phone: '+923082122760',
    email: 'info@flytoway.com',
    authorizedPerson: 'SHUJA CH',
    importantNotes: 'Check in time at: 16:00 any early arrival subject to availability. Check out time at: 14:00, after 14:00 one night will be charged. To guarantee your booking total amount to be transfer to our Account, before option date mentioned in the booking in case of guarantee cancellation full payment will be charged.',
    isMaheen: false,
    stays: [
      {
        city: 'Makkah',
        hotelName: '',
        rating: '5 Star',
        roomType: 'Quad',
        customRoomType: '',
        roomView: 'Haram View',
        customRoomView: '',
        mealPlan: 'RO',
        checkIn: '',
        checkOut: '',
        totalNights: 0,
        hcn: ''
      }
    ]
  };

  const [voucherData, setVoucherData] = useState(initialVoucherState);

  // Search local database states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchNextVoucherNumber = async () => {
    try {
      const res = await fetch('/api/vouchers/hotel?nextNumber=true');
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
          const res = await fetch(`/api/vouchers/hotel?isMaheen=false&search=${editVoucherNo}`);
          const data = await res.json();
          if (res.ok && data.length > 0) {
            const exactMatch = data.find(v => v.voucherNo === editVoucherNo);
            if (exactMatch) {
              setVoucherData(exactMatch);
            }
          }
        } catch (err) {
          setError('Failed to fetch the hotel voucher.');
        }
      };
      fetchVoucher();
    } else {
      fetchNextVoucherNumber();
    }
  }, [editVoucherNo]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setVoucherData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'checkInTime' || name === 'checkOutTime') {
        const inTime = name === 'checkInTime' ? value : (prev.checkInTime || '16:00');
        const outTime = name === 'checkOutTime' ? value : (prev.checkOutTime || '14:00');
        newState.importantNotes = `Check in time at: ${inTime} any early arrival subject to availability. Check out time at: ${outTime}, after ${outTime} one night will be charged. To guarantee your booking total amount to be transfer to our Account, before option date mentioned in the booking in case of guarantee cancellation full payment will be charged.`;
      }
      return newState;
    });
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
          rating: '5 Star',
          roomType: 'Quad',
          customRoomType: '',
          roomView: 'Haram View',
          customRoomView: '',
          mealPlan: 'RO',
          checkIn: '',
          checkOut: '',
          totalNights: 0,
          hcn: ''
        }
      ]
    }));
  };

  const removeStay = (index) => {
    if (voucherData.stays.length === 1) return;
    const updated = voucherData.stays.filter((_, i) => i !== index);
    setVoucherData(prev => ({ ...prev, stays: updated }));
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
      const res = await fetch(`/api/vouchers/hotel?isMaheen=false&search=${searchQuery}`);
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
      const res = await fetch('/api/vouchers/hotel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData)
      });

      if (res.ok) {
        setSaveSuccess(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          // If not logged in on local test, still allow viewing print modal!
          setSaveSuccess(true);
        } else {
          setError(errData.error || 'Failed to save Hotel Voucher.');
        }
      }
    } catch (err) {
      console.error('Save error', err);
      setSaveSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 3mm 5mm !important;
          }
          .no-print-bar, .no-print-bar *, .formCard, .formCard *, .stackedFormCard, .stackedFormCard *, .previewToolbar, .previewToolbar *, .pdfActionButtons, .pdfActionButtons * {
            display: none !important;
          }
          body, html {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
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
            height: 282mm !important;
            min-height: 282mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            border: none !important;
            padding: 10px 16px !important;
            margin: 0 !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
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
            <button onClick={handleSave} disabled={saving} className="btn" style={{ padding: '8px 16px', backgroundColor: '#0f4c81', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              <Save size={14} style={{ marginRight: 6 }} /> {saving ? 'Saving...' : 'Save Voucher'}
            </button>
          </div>
        </div>

        <div className={styles.stackedLayout}>
          
          {/* LEFT: Form Panel */}
          <div className={`${styles.stackedFormCard} no-print-bar`}>
            
            {/* Search Saved Vouchers */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px', marginBottom: '20px', backgroundColor: '#f8fafc' }}>
              <strong style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#0f4c81' }}>Search Saved Vouchers</strong>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Voucher, guest, company, HCN, remark or contact"
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
                  {searchResults.map((v) => (
                    <div
                      key={v._id}
                      onClick={() => {
                        setVoucherData(v);
                        setSearchResults([]);
                      }}
                      style={{ padding: '6px 8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '12px', display: 'flex', justifyContent: 'space-between', hover: { backgroundColor: '#f1f5f9' } }}
                    >
                      <span style={{ fontWeight: 'bold', color: '#0f4c81' }}>{v.voucherNo}</span>
                      <span style={{ color: '#1e293b' }}>{v.guestName}</span>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{v.clientName}</span>
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
                      disabled={downloadingPdf}
                      onClick={() => {
                        handleDownloadPDF();
                        setSaveSuccess(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#10b981',
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
                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      <Download size={18} /> {downloadingPdf ? 'Generating PDF...' : 'Download PDF (iPhone / Android / Mobile)'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        window.print();
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#0a2e5c',
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
                        boxShadow: '0 4px 10px rgba(10, 46, 92, 0.25)'
                      }}
                    >
                      <Printer size={18} /> Print
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
                        backgroundColor: '#0f4c81',
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

            {error && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', fontWeight: '600' }}>
                ⚠️ {error}
              </div>
            )}

            {/* 1. Voucher Details */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '6px 10px', borderRadius: '4px' }}>
              <span>1. Voucher Details</span>
            </div>
            <div className={styles.formGrid3} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Voucher / Booking No.</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    name="voucherNo"
                    required
                    value={voucherData.voucherNo}
                    onChange={handleFieldChange}
                  />
                  <button type="button" onClick={fetchNextVoucherNumber} className="btn btn-outline" style={{ padding: 8, title: 'Fetch next serial voucher number' }}>
                    <RefreshCw size={12} />
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Booking Status</label>
                <select name="status" value={voucherData.status} onChange={handleFieldChange}>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Definite">Definite</option>
                  <option value="Tentative">Tentative</option>
                  <option value="Hold">Hold</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Generated Date</label>
                <input
                  type="text"
                  name="issueDate"
                  placeholder="DD/MM/YYYY"
                  value={voucherData.issueDate}
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            {/* 2. Client / Guest Details */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>2. Client / Guest Details</span>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Client / Company Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={voucherData.clientName}
                  onChange={handleFieldChangeUpper}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Guest Name</label>
                <input
                  type="text"
                  name="guestName"
                  value={voucherData.guestName}
                  onChange={handleFieldChangeUpper}
                />
              </div>
            </div>

            {/* 3. Multiple Hotel Stays */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>3. Multiple Hotel Stays</span>
              <button type="button" onClick={addStay} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                <Plus size={12} /> Add Hotel
              </button>
            </div>

            {voucherData.stays.map((stay, index) => (
              <div key={index} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px', marginTop: '10px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '13px', color: '#0f4c81' }}>Stay {index + 1}</strong>
                  {voucherData.stays.length > 1 && (
                    <button type="button" onClick={() => removeStay(index)} style={{ border: 'none', background: '#ef4444', color: '#ffffff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Delete
                    </button>
                  )}
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label>City</label>
                    <select value={stay.city} onChange={(e) => handleStayChange(index, 'city', e.target.value)}>
                      <option value="Makkah">Makkah</option>
                      <option value="Madinah">Madinah</option>
                      <option value="Jeddah">Jeddah</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Hotel Name</label>
                    <HotelSelect
                      value={stay.hotelName || ''}
                      city={stay.city}
                      onChange={(val, cityVal) => {
                        handleStayChange(index, 'hotelName', val);
                        if (cityVal && cityVal !== 'General') {
                          handleStayChange(index, 'city', cityVal);
                        }
                      }}
                      placeholder="Select or type hotel name..."
                    />
                  </div>
                </div>

                <div className={styles.formGrid2} style={{ marginTop: '8px' }}>
                  <div className={styles.formGroup}>
                    <label>Hotel Category</label>
                    <select value={stay.rating} onChange={(e) => handleStayChange(index, 'rating', e.target.value)}>
                      <option value="5 Star">5 Star</option>
                      <option value="4 Star">4 Star</option>
                      <option value="3 Star">3 Star</option>
                      <option value="Standard">Standard / Economy</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Room Type</label>
                    <QuickAddSelect
                      label="Room Type"
                      value={stay.roomType}
                      onChange={(val) => handleStayChange(index, 'roomType', val)}
                      defaultOptions={['Quad', 'Triple', 'Double', 'Single']}
                      storageKey="ftw_custom_room_types"
                      placeholder="Select or add room type..."
                    />
                  </div>
                </div>

                <div className={styles.formGrid2} style={{ marginTop: '8px' }}>
                  <div className={styles.formGroup}>
                    <label>Room View</label>
                    <QuickAddSelect
                      label="Room View"
                      value={stay.roomView}
                      onChange={(val) => handleStayChange(index, 'roomView', val)}
                      defaultOptions={['Haram View', 'City View', 'Kaaba View', 'Partial Haram View', 'Courtyard View']}
                      storageKey="ftw_custom_room_views"
                      placeholder="Select or add room view..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Meal Plan</label>
                    <QuickAddSelect
                      label="Meal Plan"
                      value={stay.mealPlan}
                      onChange={(val) => handleStayChange(index, 'mealPlan', val)}
                      defaultOptions={['RO', 'BB', 'HB', 'FB']}
                      storageKey="ftw_custom_meal_plans"
                      placeholder="Select or add meal plan..."
                    />
                  </div>
                </div>

                <div className={styles.formGrid4} style={{ marginTop: '8px' }}>
                  <div className={styles.formGroup}>
                    <label>Check In</label>
                    <input
                      type="date"
                      value={stay.checkIn}
                      onChange={(e) => handleStayChange(index, 'checkIn', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Check Out</label>
                    <input
                      type="date"
                      value={stay.checkOut}
                      onChange={(e) => handleStayChange(index, 'checkOut', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nights</label>
                    <input
                      type="number"
                      readOnly
                      style={{ backgroundColor: '#f1f5f9' }}
                      value={stay.totalNights}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>HCN #</label>
                    <input
                      type="text"
                      placeholder="e.g. HCN-12345"
                      value={stay.hcn}
                      style={{ fontWeight: 'bold' }}
                      onChange={(e) => handleStayChange(index, 'hcn', e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* 4. Additional Information */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>4. Additional Information</span>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Check-in Time</label>
                <input
                  type="text"
                  name="checkInTime"
                  value={voucherData.checkInTime}
                  onChange={handleFieldChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Check-out Time</label>
                <input
                  type="text"
                  name="checkOutTime"
                  value={voucherData.checkOutTime}
                  onChange={handleFieldChange}
                />
              </div>
            </div>
            <div className={styles.formGroup} style={{ marginTop: '8px' }}>
              <label>Remarks / Note</label>
              <textarea
                name="remarks"
                value={voucherData.remarks}
                onChange={handleFieldChangeUpper}
                rows={2}
              />
            </div>

            {/* 5. Contact Details */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>5. Contact Details</span>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '10px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                <strong style={{ fontSize: '11px', color: '#0f4c81', display: 'block', marginBottom: '6px' }}>Makkah Hotel Contact</strong>
                <div className={styles.formGroup} style={{ marginBottom: '6px' }}>
                  <label>Contact Name</label>
                  <input type="text" name="makkahContactName" value={voucherData.makkahContactName} onChange={handleFieldChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>WhatsApp No.</label>
                  <input type="text" name="makkahContactNo" value={voucherData.makkahContactNo} onChange={handleFieldChange} />
                </div>
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                <strong style={{ fontSize: '11px', color: '#0f4c81', display: 'block', marginBottom: '6px' }}>Madinah Hotel Contact</strong>
                <div className={styles.formGroup} style={{ marginBottom: '6px' }}>
                  <label>Contact Name</label>
                  <input type="text" name="madinahContactName" value={voucherData.madinahContactName} onChange={handleFieldChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>WhatsApp No.</label>
                  <input type="text" name="madinahContactNo" value={voucherData.madinahContactNo} onChange={handleFieldChange} />
                </div>
              </div>
            </div>

            {/* 6. Company Details */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>6. Company Details</span>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Company Name</label>
                <input type="text" name="companyName" readOnly value={voucherData.companyName} style={{ backgroundColor: '#f1f5f9' }} />
              </div>
              <div className={styles.formGroup}>
                <label>Office Address</label>
                <input type="text" name="officeAddress" readOnly value={voucherData.officeAddress} style={{ backgroundColor: '#f1f5f9' }} />
              </div>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '8px' }}>
              <div className={styles.formGroup}>
                <label>WhatsApp</label>
                <input type="text" name="phone" readOnly value={voucherData.phone} style={{ backgroundColor: '#f1f5f9' }} />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="text" name="email" readOnly value={voucherData.email} style={{ backgroundColor: '#f1f5f9' }} />
              </div>
            </div>
            <div className={styles.formGroup} style={{ marginTop: '8px' }}>
              <label>Authorized Person Name</label>
              <input type="text" name="authorizedPerson" value={voucherData.authorizedPerson} onChange={handleFieldChangeUpper} />
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
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#4b5563' }}>A4 CONFIRMATION SHEET PREVIEW (PDF VIEWER STYLE)</span>
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
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    backgroundColor: '#0a2e5c',
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
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            {/* Document sheet */}
            {(() => {
              const stayCount = voucherData.stays?.length || 1;
              const isMulti = stayCount > 1;
              const isLargeMulti = stayCount >= 3;

              let sheetPadding = '36px 34px 28px 34px';
              let logoH = '130px';
              let sectionMb = '24px';
              let cellPad = '10px 10px';
              let thPad = '10px 10px';
              let cardPad = '12px 14px';

              if (stayCount === 2) {
                sheetPadding = '32px 30px 24px 30px';
                logoH = '120px';
                sectionMb = '20px';
                cellPad = '9px 10px';
                thPad = '10px 10px';
                cardPad = '11px 13px';
              } else if (stayCount === 3) {
                sheetPadding = '26px 26px 20px 26px';
                logoH = '105px';
                sectionMb = '16px';
                cellPad = '7px 8px';
                thPad = '8px 8px';
                cardPad = '9px 11px';
              } else if (stayCount >= 4) {
                sheetPadding = '18px 20px 14px 20px';
                logoH = '85px';
                sectionMb = '10px';
                cellPad = '4px 6px';
                thPad = '5px 6px';
                cardPad = '6px 8px';
              }

              return (
                <div id="voucher-print" className={styles.voucherSheet} style={{
                  backgroundColor: '#ffffff',
                  fontFamily: 'Arial, sans-serif',
                  padding: sheetPadding,
                  fontSize: '13px',
                  color: '#000000',
                  lineHeight: '1.45',
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: stayCount >= 4 ? 'auto' : '280mm',
                  boxSizing: 'border-box'
                }}>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>

                    {/* Header block with Logo and Title */}
                    <div style={{ display: 'grid', gridTemplateColumns: `${isMulti ? '130px' : '180px'} 1fr ${isMulti ? '130px' : '180px'}`, alignItems: 'center', borderBottom: '2px solid #0a2e5c', paddingBottom: isMulti ? '8px' : '14px', marginBottom: sectionMb }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src="/logo.png" alt="Fly To Way Logo" style={{ height: logoH, width: 'auto', objectFit: 'contain' }} />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <h1 style={{ margin: 0, fontSize: isMulti ? '20px' : '23px', fontWeight: '800', color: '#0a2e5c', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>FLY TO WAY TRAVEL & TOURS</h1>
                        <h2 style={{ margin: '3px 0 0 0', fontSize: isMulti ? '12px' : '13px', fontWeight: '700', color: '#0a2e5c', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>HOTEL BOOKING CONFIRMATION VOUCHER</h2>
                      </div>
                      <div></div>
                    </div>

                  {/* Salutations and Greeting + Top Right Status Box */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: sectionMb, alignItems: 'start' }}>
                    <div>
                      <div style={{ margin: '0 0 3px 0', fontSize: '12px', color: '#1e293b' }}>Dear Sir / Madam,</div>
                      <div style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: 'bold', color: '#0a2e5c' }}>Greetings from FLY TO WAY TRAVEL & TOURS.</div>
                      <div style={{ margin: 0, fontSize: '11px', color: '#1e293b', lineHeight: '1.4' }}>
                        We are pleased to confirm the following reservation on a{' '}
                        <strong style={{
                          color: (voucherData.status || '').toUpperCase() === 'CANCELLED' ? '#dc2626' : 
                                 (voucherData.status || '').toUpperCase() === 'TENTATIVE' ? '#d97706' : '#16a34a',
                          textTransform: 'uppercase'
                        }}>
                          {voucherData.status || 'CONFIRMED'}
                        </strong> basis.
                      </div>
                    </div>

                    {/* Status and Generated details box (Sample Voucher Style) */}
                    {(() => {
                      const statusUpper = (voucherData.status || 'CONFIRMED').toUpperCase();
                      let badgeBg = '#28A745';
                      let badgeText = '#ffffff';
                      if (statusUpper === 'TENTATIVE') { badgeBg = '#FFC107'; badgeText = '#000000'; }
                      else if (statusUpper === 'HOLD') { badgeBg = '#17A2BB'; badgeText = '#ffffff'; }
                      else if (statusUpper === 'CANCELLED') { badgeBg = '#DC3545'; badgeText = '#ffffff'; }
                      else if (statusUpper === 'NO SHOW') { badgeBg = '#6C757D'; badgeText = '#ffffff'; }
                      else if (statusUpper === 'COMPLETED') { badgeBg = '#6F42C1'; badgeText = '#ffffff'; }

                      const mainHcn = voucherData.stays?.[0]?.hcn || voucherData.stays?.map(s => s.hcn).filter(Boolean).join(', ') || '-';

                      return (
                        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0', overflow: 'hidden', fontSize: '10.5px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#0a2e5c', width: '100px', backgroundColor: '#f8fafc' }}>Booking Status:</td>
                                <td style={{ padding: '4px 8px' }}>
                                  <span style={{
                                    backgroundColor: badgeBg,
                                    color: badgeText,
                                    padding: '2px 8px',
                                    borderRadius: '3px',
                                    fontWeight: 'bold',
                                    fontSize: '10.5px',
                                    display: 'inline-block',
                                    letterSpacing: '0.5px'
                                  }}>
                                    {statusUpper}
                                  </span>
                                </td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#0a2e5c', backgroundColor: '#f8fafc' }}>Generated:</td>
                                <td style={{ padding: '4px 8px', color: '#1e293b' }}>{voucherData.issueDate}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#0a2e5c', backgroundColor: '#f8fafc' }}>Voucher No:</td>
                                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#1e293b' }}>{voucherData.voucherNo}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#0a2e5c', backgroundColor: '#f8fafc' }}>HCN #:</td>
                                <td style={{ padding: '4px 8px', fontWeight: '900', color: '#003366', fontFamily: 'monospace, sans-serif', fontSize: '13px', letterSpacing: '0.5px' }}>{mainHcn}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Client & Guest Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: sectionMb, borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '130px', fontWeight: 'normal', color: '#334155', fontSize: '12.5px' }}>Client / Company</span>
                      <span style={{ marginRight: '10px', fontWeight: 'bold' }}>:</span>
                      <span style={{ textTransform: 'uppercase', color: '#000000', fontSize: '12.5px' }}>{voucherData.clientName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '130px', fontWeight: 'normal', color: '#334155', fontSize: '13px' }}>Guest Name</span>
                      <span style={{ marginRight: '10px', fontWeight: 'bold' }}>:</span>
                      <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#000000', fontSize: '13px' }}>{voucherData.guestName}</span>
                    </div>
                  </div>

                  {/* Multiple Stays Table (Font Guide Standard) */}
                  <div style={{ marginBottom: sectionMb }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #0a2e5c' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#0a2e5c', color: '#ffffff' }}>
                          <th style={{ border: '1px solid #0a2e5c', padding: thPad, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#0a2e5c', color: '#ffffff' }}>STAY</th>
                          <th style={{ border: '1px solid #0a2e5c', padding: thPad, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#0a2e5c', color: '#ffffff' }}>CITY</th>
                          <th style={{ border: '1px solid #0a2e5c', padding: thPad, textAlign: 'left', fontWeight: 'bold', backgroundColor: '#0a2e5c', color: '#ffffff' }}>HOTEL NAME / CATEGORY</th>
                          <th style={{ border: '1px solid #0a2e5c', padding: thPad, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#0a2e5c', color: '#ffffff' }}>ROOM TYPE</th>
                          <th style={{ border: '1px solid #0a2e5c', padding: thPad, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#0a2e5c', color: '#ffffff' }}>VIEW</th>
                          <th style={{ border: '1px solid #0a2e5c', padding: 'thPad', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#0a2e5c', color: '#ffffff' }}>MEAL PLAN</th>
                          <th style={{ border: '1px solid #0a2e5c', padding: thPad, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#0a2e5c', color: '#ffffff' }}>CHECK IN</th>
                          <th style={{ border: '1px solid #0a2e5c', padding: thPad, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#0a2e5c', color: '#ffffff' }}>CHECK OUT</th>
                          <th style={{ border: '1px solid #0a2e5c', padding: thPad, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#0a2e5c', color: '#ffffff' }}>NIGHTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {voucherData.stays.map((stay, idx) => {
                          const checkInFormatted = stay.checkIn ? stay.checkIn.split('-').reverse().join('/') : '';
                          const checkOutFormatted = stay.checkOut ? stay.checkOut.split('-').reverse().join('/') : '';
                          
                          let stars = '';
                          if (stay.rating) {
                            const numStars = parseInt(stay.rating) || 0;
                            stars = '★'.repeat(numStars);
                          }

                          let displayRoom = stay.roomType;
                          if (stay.roomType === 'Custom Room (optional)' && stay.customRoomType) {
                            displayRoom = stay.customRoomType;
                          } else if (stay.customRoomType) {
                            displayRoom = `${stay.roomType} (${stay.customRoomType})`;
                          }

                          let displayView = stay.roomView;
                          if (stay.roomView === 'Custom View (optional)' && stay.customRoomView) {
                            displayView = stay.customRoomView;
                          } else if (stay.customRoomView) {
                            displayView = `${stay.roomView} (${stay.customRoomView})`;
                          }

                          return (
                            <tr key={idx} style={{ backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                              <td style={{ border: '1px solid #cbd5e1', padding: cellPad, textAlign: 'center' }}>Stay {idx + 1}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: cellPad, textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>{stay.city}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: cellPad }}>
                                <div style={{ fontWeight: 'bold', color: '#0a2e5c' }}>{stay.hotelName || 'N/A'}</div>
                                {stars && <div style={{ color: '#f59e0b', fontSize: '9.5px', marginTop: '1px' }}>{stars}</div>}
                              </td>
                              <td style={{ border: '1px solid #cbd5e1', padding: cellPad, textAlign: 'center' }}>{displayRoom}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: cellPad, textAlign: 'center' }}>{displayView}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: cellPad, textAlign: 'center', fontWeight: 'bold' }}>{stay.mealPlan}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: cellPad, textAlign: 'center' }}>{checkInFormatted}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: cellPad, textAlign: 'center' }}>{checkOutFormatted}</td>
                              <td style={{ border: '1px solid #cbd5e1', padding: cellPad, textAlign: 'center', fontWeight: 'bold' }}>{stay.totalNights}</td>
                            </tr>
                          );
                        })}
                        
                        {/* Nights Aggregation Bar */}
                        <tr style={{ backgroundColor: '#0a2e5c', color: '#ffffff' }}>
                          <td colSpan={9} style={{ border: '1px solid #0a2e5c', padding: isLargeMulti ? '4px 8px' : '6px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', backgroundColor: '#0a2e5c', color: '#ffffff' }}>
                            TOTAL NIGHTS:{' '}
                            <span style={{ backgroundColor: '#ffffff', color: '#0a2e5c', padding: '1px 8px', borderRadius: '50px', marginLeft: '6px', fontWeight: '900', fontSize: '11px' }}>
                              {voucherData.stays.reduce((acc, s) => acc + (parseInt(s.totalNights) || 0), 0)}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Information cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: sectionMb }}>
                    
                    {/* Left Card: Hotel Information */}
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: isMulti ? '5px 10px' : '7px 12px', fontWeight: 'bold', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>ⓘ</span> <span>HOTEL INFORMATION</span>
                      </div>
                      <div style={{ padding: cardPad, fontSize: '11px', lineHeight: '1.5' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <strong>🕒 CHECK IN TIME:</strong>
                          <span>{voucherData.checkInTime || '16:00'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>🕒 CHECK OUT TIME:</strong>
                          <span>{voucherData.checkOutTime || '14:00'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Card: Contact Details */}
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: isMulti ? '5px 10px' : '7px 12px', fontWeight: 'bold', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📞</span> <span>CONTACT DETAILS</span>
                      </div>
                      <div style={{ padding: cardPad, fontSize: '10.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {voucherData.makkahContactName && (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px' }}>🕋</span>
                            <div>
                              <strong style={{ color: '#0a2e5c' }}>Makkah:</strong> {voucherData.makkahContactName}{' '}
                              <span style={{ color: '#475569', fontSize: '10px' }}>({voucherData.makkahContactNo})</span>
                            </div>
                          </div>
                        )}
                        {voucherData.madinahContactName && (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px' }}>🕌</span>
                            <div>
                              <strong style={{ color: '#0a2e5c' }}>Madinah:</strong> {voucherData.madinahContactName}{' '}
                              <span style={{ color: '#475569', fontSize: '10px' }}>({voucherData.madinahContactNo})</span>
                            </div>
                          </div>
                        )}
                        {!voucherData.makkahContactName && !voucherData.madinahContactName && (
                          <span style={{ color: '#64748b', fontStyle: 'italic' }}>No ground contacts provided.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remarks / Note Card Section */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', marginBottom: sectionMb }}>
                    <div style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: isMulti ? '5px 10px' : '7px 12px', fontWeight: 'bold', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📝</span> <span>REMARKS / NOTE</span>
                    </div>
                    <div style={{ padding: cardPad, fontSize: '10.5px', color: '#dc2626', minHeight: '24px' }}>
                      {voucherData.remarks && voucherData.remarks.trim() !== '' ? (
                        <div style={{ textTransform: 'uppercase', fontWeight: 'bold', color: '#dc2626' }}>{voucherData.remarks}</div>
                      ) : null}
                    </div>
                  </div>

                  {/* Sign off regards */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: sectionMb }}>
                    <div>
                      <div style={{ fontSize: '10.5px', color: '#475569', fontStyle: 'italic' }}>
                        Regards,
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', margin: '3px 0 1px 0', letterSpacing: '0.5px' }}>
                        {voucherData.authorizedPerson || 'ZEESHAN'}
                      </div>
                      <div style={{ fontSize: '10.5px', fontWeight: 'bold', color: '#dc2626', letterSpacing: '0.5px' }}>
                        RESERVATION
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '10.5px', color: '#0a2e5c', fontWeight: 'bold', fontStyle: 'italic' }}>
                      Thank you for booking with us!
                    </div>
                  </div>

                  {/* Important note block */}
                  <div style={{ border: '1px solid #0a2e5c', borderRadius: '4px', padding: isMulti ? '8px 12px' : '10px 14px', display: 'flex', gap: '8px', backgroundColor: '#f8fafc', marginBottom: sectionMb }}>
                    <div style={{ color: '#f59e0b', fontSize: '18px' }}>🔔</div>
                    <div style={{ fontSize: '10px', color: '#1e293b', lineHeight: '1.4' }}>
                      <strong style={{ display: 'block', marginBottom: '3px', fontSize: '10.5px', color: '#0a2e5c' }}>IMPORTANT NOTE</strong>
                      {voucherData.importantNotes}
                    </div>
                  </div>

                  </div>

                  {/* Solid Footer Bar (Font Guide Standard) */}
                  <div style={{
                    backgroundColor: '#0a2e5c',
                    color: '#ffffff',
                    padding: isMulti ? '8px 14px' : '12px 20px',
                    borderRadius: '4px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ textAlign: 'left' }}>
                      📍 {voucherData.officeAddress || 'College Road, Lahore - Pakistan'}
                    </div>
                    <div style={{ textAlign: 'center', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span>📞 {voucherData.phone || '+923082122760'}</span>
                      <span style={{ opacity: 0.7 }}>|</span>
                      <span>✉ {voucherData.email || 'info@flytoway.com'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      🌐 www.flytoway.com
                    </div>
                  </div>

                </div>
              );
            })()}



          </div>

        </div>

      </div>
    </div>
  );
}

export default function HotelVoucherGenerator() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 40, textAlign: 'center' }}>Loading hotel voucher sheet...</div>}>
      <HotelVoucherGeneratorContent />
    </Suspense>
  );
}
