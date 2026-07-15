'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Hotel, Plus, Trash2, Printer, Save, RefreshCw, 
  User, FileText, ArrowLeft, Calendar, Bell
} from 'lucide-react';
import styles from '../generator.module.css';

function HotelVoucherGeneratorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editVoucherNo = searchParams.get('edit');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Initial Form State matching uploaded Hadaya Tower PDF defaults
  const [voucherData, setVoucherData] = useState({
    voucherNo: '',
    status: 'Tentative',
    issueDate: new Date().toISOString().split('T')[0],
    clientName: 'FLY TO WAY T&T',
    guestName: 'RIZWAN KHAN',
    makkahContact: '+966 50 123 4567 (WhatsApp Available)',
    madinahContact: '+966 50 765 4321 (WhatsApp Available)',
    importantNotes: 'RAMZAN BOOKINS ONCE CONFIMRED (NON REFUNABLE/NON CANCELABLE)\nCHECK IN : 18:00 KSA | CHECK OUT : 12:00 KSA',
    rateOfExchange: '77.50',
    optionalDate: '2026-02-26',
    regards: 'MURTUZA',
    bank1Title: 'Air One Hotels',
    bank1Name: 'Meezan Bank',
    bank1Account: '01970109213093',
    bank1Branch: 'Sharafabad Branch-Karachi',
    bank2Title: 'Air One Travels',
    bank2Name: 'Habib Bank Limited',
    bank2Account: '54497000100203',
    bank2Branch: 'Sharafabad Branch',
    isMaheen: false,
    stays: [
      {
        city: 'Makkah',
        hotelName: 'HADAYA TOWER',
        rating: '4 Star',
        roomType: 'Quad',
        roomView: 'CV',
        mealPlan: 'R.O',
        checkIn: '2026-03-26',
        checkOut: '2026-03-30',
        totalNights: 4,
        hcn: 'ALLOTMENT',
        qty: 1,
        rate: 55,
        total: 220
      }
    ]
  });

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
      generateRandomVoucher();
    }
  }, [editVoucherNo]);

  const generateRandomVoucher = () => {
    const rand = Math.floor(100000 + Math.random() * 900000);
    setVoucherData(prev => ({ ...prev, voucherNo: `FTW-HV-${rand}` }));
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setVoucherData(prev => ({ ...prev, [name]: value }));
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
    
    if (field === 'qty' || field === 'rate' || field === 'total') {
      updated[index][field] = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }
    
    // Auto-calculate nights if check-in or check-out changes
    if (field === 'checkIn' || field === 'checkOut') {
      const checkInVal = field === 'checkIn' ? value : updated[index].checkIn;
      const checkOutVal = field === 'checkOut' ? value : updated[index].checkOut;
      updated[index].totalNights = calculateNights(checkInVal, checkOutVal);
    }
    
    // Auto-calculate stay total price (qty * totalNights * rate)
    const qty = parseFloat(updated[index].qty) || 0;
    const nights = parseFloat(updated[index].totalNights) || 0;
    const rate = parseFloat(updated[index].rate) || 0;
    updated[index].total = qty * nights * rate;
    
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
          rating: '4 Star',
          roomType: 'Quad',
          roomView: 'CV',
          mealPlan: 'R.O',
          checkIn: '',
          checkOut: '',
          totalNights: 0,
          hcn: 'ALLOTMENT',
          qty: 1,
          rate: 0,
          total: 0
        }
      ]
    }));
  };

  const removeStay = (index) => {
    if (voucherData.stays.length === 1) return;
    const updated = voucherData.stays.filter((_, i) => i !== index);
    setVoucherData(prev => ({ ...prev, stays: updated }));
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
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save Hotel Voucher.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className="container">
        
        {/* Navigation */}
        <div className="no-print-bar" style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button onClick={() => router.push('/admin/dashboard')} className="btn btn-outline" style={{ padding: '6px 12px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>

        <div className={styles.splitLayout}>
          
          {/* LEFT: Form Panel */}
          <div className={styles.formCard} style={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#035a37' }}>Hotel Confirmation Form</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Add guest credentials, rates, and hotels. Updates render in real-time.</p>
            </div>

            {error && <div className={styles.errorBox} style={{ margin: 0 }}>{error}</div>}
            {saveSuccess && <div className={styles.successBox} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: 10, borderRadius: 4, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>Voucher saved successfully in database!</div>}

            {/* Document details */}
            <div className={styles.formSectionTitle}>
              <span>Document Settings</span>
            </div>
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label>Voucher / Serial Number</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    name="voucherNo"
                    required
                    readOnly={!!editVoucherNo}
                    value={voucherData.voucherNo}
                    onChange={handleFieldChange}
                  />
                  {!editVoucherNo && (
                    <button type="button" onClick={generateRandomVoucher} className="btn btn-outline" style={{ padding: 10 }}>
                      <RefreshCw size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Booking Status</label>
                <select name="status" value={voucherData.status} onChange={handleFieldChange}>
                  <option value="Tentative">Tentative</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Hold">Hold</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className={styles.formGrid3} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Rate of Exchange</label>
                <input
                  type="text"
                  name="rateOfExchange"
                  value={voucherData.rateOfExchange}
                  onChange={handleFieldChange}
                  placeholder="e.g. 77.50"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Optional/Clearance Date</label>
                <input
                  type="date"
                  name="optionalDate"
                  value={voucherData.optionalDate}
                  onChange={handleFieldChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Regards / Officer</label>
                <input
                  type="text"
                  name="regards"
                  value={voucherData.regards}
                  onChange={handleFieldChange}
                  placeholder="e.g. MURTUZA"
                />
              </div>
            </div>

            <div className={styles.formGrid2} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Client Name / Agency</label>
                <input
                  type="text"
                  name="clientName"
                  value={voucherData.clientName}
                  onChange={handleFieldChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Guest Name</label>
                <input
                  type="text"
                  name="guestName"
                  required
                  placeholder="e.g. RIZWAN KHAN"
                  value={voucherData.guestName}
                  onChange={(e) => setVoucherData(prev => ({ ...prev, guestName: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>

            {/* Bank details customization */}
            <div className={styles.formSectionTitle}>
              <span>Bank Details Customization</span>
            </div>
            <div className={styles.formGrid2}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '12px', color: '#035a37' }}>Bank Account 1 (Left)</strong>
                <div className={styles.formGroup}>
                  <label>Account Title</label>
                  <input type="text" name="bank1Title" value={voucherData.bank1Title} onChange={handleFieldChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Bank Name</label>
                  <input type="text" name="bank1Name" value={voucherData.bank1Name} onChange={handleFieldChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Account Number</label>
                  <input type="text" name="bank1Account" value={voucherData.bank1Account} onChange={handleFieldChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Branch</label>
                  <input type="text" name="bank1Branch" value={voucherData.bank1Branch} onChange={handleFieldChange} />
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '12px', color: '#035a37' }}>Bank Account 2 (Right)</strong>
                <div className={styles.formGroup}>
                  <label>Account Title</label>
                  <input type="text" name="bank2Title" value={voucherData.bank2Title} onChange={handleFieldChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Bank Name</label>
                  <input type="text" name="bank2Name" value={voucherData.bank2Name} onChange={handleFieldChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Account Number</label>
                  <input type="text" name="bank2Account" value={voucherData.bank2Account} onChange={handleFieldChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Branch</label>
                  <input type="text" name="bank2Branch" value={voucherData.bank2Branch} onChange={handleFieldChange} />
                </div>
              </div>
            </div>

            {/* General notes */}
            <div className={styles.formGroup} style={{ marginTop: '10px' }}>
              <label>Important Notes / Terms</label>
              <textarea
                name="importantNotes"
                value={voucherData.importantNotes}
                onChange={handleFieldChange}
                rows={4}
              />
            </div>

            {/* Dynamic stays */}
            <div className={styles.formSectionTitle}>
              <span>Stay & Pricing Details ({voucherData.stays.length})</span>
              <button type="button" onClick={addStay} className={styles.removeBtn} style={{ color: '#035a37', display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                <Plus size={14} /> Add Segment
              </button>
            </div>

            {voucherData.stays.map((stay, index) => (
              <div key={index} className={styles.repeaterItem} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: '700', color: '#035a37' }}>Stay Segment #{index + 1}</span>
                  {voucherData.stays.length > 1 && (
                    <button type="button" onClick={() => removeStay(index)} className={styles.removeBtn} style={{ border: 'none', background: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>

                <div className={styles.formGrid3} style={{ marginBottom: 10 }}>
                  <div className={styles.formGroup}>
                    <label>City Location</label>
                    <select value={stay.city} onChange={(e) => handleStayChange(index, 'city', e.target.value)}>
                      <option value="Makkah">Makkah</option>
                      <option value="Madinah">Madinah</option>
                      <option value="Jeddah">Jeddah</option>
                    </select>
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label>Hotel Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HADAYA TOWER"
                      value={stay.hotelName}
                      onChange={(e) => handleStayChange(index, 'hotelName', e.target.value.toUpperCase())}
                    />
                  </div>
                </div>

                <div className={styles.formGrid3} style={{ marginBottom: 10 }}>
                  <div className={styles.formGroup}>
                    <label>Room Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Quad"
                      value={stay.roomType}
                      onChange={(e) => handleStayChange(index, 'roomType', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Room View</label>
                    <input
                      type="text"
                      placeholder="e.g. CV"
                      value={stay.roomView}
                      onChange={(e) => handleStayChange(index, 'roomView', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Meal Plan (Meal)</label>
                    <input
                      type="text"
                      placeholder="e.g. R.O"
                      value={stay.mealPlan}
                      onChange={(e) => handleStayChange(index, 'mealPlan', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGrid3} style={{ marginBottom: 10 }}>
                  <div className={styles.formGroup}>
                    <label>Check-in Date</label>
                    <input
                      type="date"
                      required
                      value={stay.checkIn}
                      onChange={(e) => handleStayChange(index, 'checkIn', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Check-out Date</label>
                    <input
                      type="date"
                      required
                      value={stay.checkOut}
                      onChange={(e) => handleStayChange(index, 'checkOut', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nights (Auto)</label>
                    <input
                      type="number"
                      readOnly
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                      value={stay.totalNights}
                    />
                  </div>
                </div>

                <div className={styles.formGrid3} style={{ marginTop: '10px' }}>
                  <div className={styles.formGroup}>
                    <label>Qty (Rooms) *</label>
                    <input
                      type="number"
                      required
                      value={stay.qty}
                      onChange={(e) => handleStayChange(index, 'qty', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Rate (SAR per Night) *</label>
                    <input
                      type="number"
                      required
                      value={stay.rate}
                      onChange={(e) => handleStayChange(index, 'rate', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Total Price (Auto)</label>
                    <input
                      type="number"
                      readOnly
                      style={{ backgroundColor: 'var(--bg-tertiary)', fontWeight: 'bold' }}
                      value={stay.total}
                    />
                  </div>
                </div>

                <div className={styles.formGroup} style={{ marginTop: '10px' }}>
                  <label>Hotel Conf. # (Hotel Conf. #)</label>
                  <input
                    type="text"
                    placeholder="e.g. ALLOTMENT"
                    value={stay.hcn}
                    onChange={(e) => handleStayChange(index, 'hcn', e.target.value.toUpperCase())}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: 10, backgroundColor: '#035a37', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              <Save size={16} /> {saving ? 'Saving to Database...' : 'Save Hotel Confirmation'}
            </button>
          </div>

          {/* RIGHT: Live print layout */}
          <div className={styles.previewPanel}>
            <div className={styles.previewToolbar} style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#4b5563' }}>HOTEL CONFIRMATION PREVIEW (A4 PRINT SHEET)</span>
              <button onClick={() => window.print()} className="btn" style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>

            {/* Document sheet */}
            <div id="voucher-print" className={styles.voucherSheet} style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', padding: '40px 30px', fontSize: '12px', color: '#000000', lineHeight: '1.4', textSnap: 'none' }}>
              
              {/* PDF Document Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src="/logo.png" alt="Fly To Way Logo" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#ef4444', fontWeight: '900', fontSize: '20px', letterSpacing: '1px', textTransform: 'uppercase', lineHeight: '1' }}>
                    {voucherData.status.toUpperCase()}
                  </div>
                  <div style={{ color: '#ef4444', fontWeight: '900', fontSize: '28px', lineHeight: '1.1', marginBottom: '4px' }}>
                    {voucherData.voucherNo ? voucherData.voucherNo.replace(/[^\d]/g, '').slice(-4) || '8168' : '8168'}
                  </div>
                  <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a' }}>Hotel Booking Confirmation</h1>
                  <div style={{ fontSize: '13px', margin: '4px 0' }}>
                    <strong>Booking Status:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{voucherData.status}</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', marginTop: '6px', textTransform: 'uppercase', lineHeight: '1.2' }}>
                    {voucherData.stays[0]?.hotelName || 'HADAYA TOWER'}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                    {voucherData.stays[0]?.city || 'MAKKAH'}
                  </div>
                </div>
              </div>

              {/* Salutations and Greeting */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', margin: '0 0 4px 0' }}>Dear Sir :</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '6px' }}>
                  Greeting From <span style={{ color: '#1e3a8a' }}>Fly To Way Travels & Tours</span>.
                </div>
                <div style={{ fontSize: '12px', color: '#1f2937', marginBottom: '4px' }}>
                  First of All, We would like to take this opportunity to welcome you at <span style={{ fontWeight: 'bold' }}>Fly To Way Travels & Tours</span>.
                </div>
                <div style={{ fontSize: '12px', color: '#1f2937', marginBottom: '4px' }}>
                  We are pleased to confirm the following reservation on a <strong style={{ textTransform: 'uppercase' }}>{voucherData.status}</strong> basis.
                </div>
                {voucherData.optionalDate && (
                  <div style={{ fontSize: '12px', color: '#1f2937' }}>
                    Please clear the amount before: <strong style={{ color: '#ef4444' }}>{voucherData.optionalDate.split('-').reverse().join('-')}</strong>
                  </div>
                )}
              </div>

              {/* Client, Hotel, Guest horizontal details block */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', padding: '12px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '120px', fontWeight: 'bold', color: '#1f2937' }}>Client</span>
                  <span style={{ margin: '0 8px' }}>:</span>
                  <span style={{ color: '#000000', textTransform: 'uppercase' }}>{voucherData.clientName || 'FLY TO WAY T&T'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '120px', fontWeight: 'bold', color: '#1f2937' }}>Hotel</span>
                  <span style={{ margin: '0 8px' }}>:</span>
                  <span style={{ color: '#000000', textTransform: 'uppercase' }}>{voucherData.stays[0]?.hotelName || 'HADAYA TOWER'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '120px', fontWeight: 'bold', color: '#1f2937' }}>Guest Name</span>
                  <span style={{ margin: '0 8px' }}>:</span>
                  <span style={{ color: '#000000', fontWeight: 'bold', textTransform: 'uppercase' }}>{voucherData.guestName || 'RIZWAN KHAN'}</span>
                </div>
              </div>

              {/* Main stays details grid table */}
              <div style={{ marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #cbd5e1' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e3a8a', color: '#ffffff' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#1e3a8a', color: '#ffffff' }}>Qty</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#1e3a8a', color: '#ffffff' }}>Room Type</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#1e3a8a', color: '#ffffff' }}>View</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#1e3a8a', color: '#ffffff' }}>Meal</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#1e3a8a', color: '#ffffff' }}>Check In</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#1e3a8a', color: '#ffffff' }}>Check Out</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#1e3a8a', color: '#ffffff' }}>Nights</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#1e3a8a', color: '#ffffff' }}>Hotel Conf. #</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#1e3a8a', color: '#ffffff' }}>Rate</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#1e3a8a', color: '#ffffff' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voucherData.stays.map((stay, idx) => {
                      const checkInFormatted = stay.checkIn ? stay.checkIn.split('-').reverse().join('/') : '';
                      const checkOutFormatted = stay.checkOut ? stay.checkOut.split('-').reverse().join('/') : '';
                      return (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>{stay.qty || 1}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', textTransform: 'uppercase' }}>{stay.roomType || 'Quad'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', textTransform: 'uppercase' }}>{stay.roomView || 'CV'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', textTransform: 'uppercase' }}>{stay.mealPlan || 'R.O'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>{checkInFormatted}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>{checkOutFormatted}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>{stay.totalNights || 0}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', textTransform: 'uppercase', fontWeight: '700' }}>{stay.hcn || 'ALLOTMENT'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>{stay.rate || 0}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{stay.total || 0}</td>
                        </tr>
                      );
                    })}
                    {/* Total Summary Row */}
                    <tr>
                      <td colSpan={7} style={{ border: 'none' }}></td>
                      <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                        SAR {voucherData.stays.reduce((acc, s) => acc + (parseFloat(s.total) || 0), 0)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={7} style={{ border: 'none' }}></td>
                      <td colSpan={3} style={{ border: 'none', padding: '4px', textAlign: 'right', fontSize: '9.5px', fontStyle: 'italic', color: '#64748b' }}>
                        inclusive of all taxes
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rate of Exchange and Optional Date section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px' }}>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Rate of Exchange:</span>{' '}
                  <strong style={{ color: '#ef4444', marginLeft: '6px' }}>{voucherData.rateOfExchange || '77.50'}</strong>
                </div>
                {voucherData.optionalDate && (
                  <div style={{ fontSize: '11px', textAlign: 'right' }}>
                    <div style={{ color: '#ef4444', fontWeight: 'bold' }}>Optional Date</div>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '12px' }}>
                      {voucherData.optionalDate.split('-').reverse().join('-')}
                    </div>
                  </div>
                )}
              </div>

              {/* Hotel Details section */}
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11.5px', color: '#1e3a8a', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Hotel Details
                </div>
                <div style={{ fontSize: '11px', color: '#1f2937', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                  {voucherData.importantNotes}
                </div>
              </div>

              {/* Highlighted Bank Details header */}
              <div style={{ backgroundColor: '#fef08a', padding: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', border: '1px solid #eab308', marginBottom: '12px', textTransform: 'uppercase', color: '#1e293b' }}>
                Bank Details:
              </div>

              {/* Bank accounts side-by-side grids */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '20px', fontSize: '11.5px', lineHeight: '1.4' }}>
                {/* Bank Account 1 */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div><strong>Account Title:</strong> {voucherData.bank1Title}</div>
                  <div><strong>Bank:</strong> {voucherData.bank1Name}</div>
                  <div><strong>Account #:</strong> {voucherData.bank1Account}</div>
                  <div><strong>Branch:</strong> {voucherData.bank1Branch}</div>
                </div>

                {/* Bank Account 2 */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div><strong>Account Title:</strong> {voucherData.bank2Title}</div>
                  <div><strong>Bank:</strong> {voucherData.bank2Name}</div>
                  <div><strong>Account #:</strong> {voucherData.bank2Account}</div>
                  <div><strong>Branch:</strong> {voucherData.bank2Branch}</div>
                </div>
              </div>

              {/* Regards and Reservation Sign off */}
              <div style={{ textAlign: 'right', marginBottom: '25px' }}>
                <div style={{ fontSize: '12px', color: '#1f2937' }}>Regards,</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444', margin: '2px 0', textTransform: 'uppercase' }}>
                  {voucherData.regards}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000000', textTransform: 'uppercase' }}>
                  RESERVATION
                </div>
              </div>

              {/* Terms and conditions / Disclaimer */}
              <div style={{ fontSize: '10.5px', color: '#4b5563', lineHeight: '1.4', marginBottom: '40px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                Check in time at: 16:00 any early arrival subject to availability. Check out time at: 14:00, after 14:00 one night will be charged. To guarantee your booking total amount to be transfer to our Account, before option date mentioned in the booking in case of guarantee cancellation full payment will be charged.
              </div>

              {/* Document footer with coordinates */}
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#475569' }}>
                <div>Office # 806 Zulekha Trade Center Sharafabad Karachi-Pakistan</div>
                <div>Tel # +92 21 34129921-22</div>
                <div>email : info@flytoway.com</div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function HotelVoucherGenerator() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 40, textAlign: 'center' }}>Loading hotel form...</div>}>
      <HotelVoucherGeneratorContent />
    </Suspense>
  );
}
