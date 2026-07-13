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

  // Initial Form State
  const [voucherData, setVoucherData] = useState({
    voucherNo: '',
    status: 'Confirmed',
    issueDate: new Date().toISOString().split('T')[0],
    clientName: 'Fly To Way Tour Group',
    guestName: 'MUHAMMAD AHMED',
    makkahContact: '+966 50 123 4567 (WhatsApp Available)',
    madinahContact: '+966 50 765 4321 (WhatsApp Available)',
    importantNotes: 'Standard Check-in time is 16:00 (4 PM) and Check-out is 12:00 (12 PM) noon. Pilgrims must present passport copy upon check-in.',
    isMaheen: false,
    stays: [
      {
        city: 'Makkah',
        hotelName: 'Anjum Hotel Makkah',
        rating: '5 Star',
        roomType: 'Double Room',
        roomView: 'Haram View',
        mealPlan: 'Bed & Breakfast',
        checkIn: '2026-09-10',
        checkOut: '2026-09-15',
        totalNights: 5,
        hcn: 'HCN-9008234'
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
          city: 'Madinah',
          hotelName: '',
          rating: '4 Star',
          roomType: 'Double Room',
          roomView: 'City View',
          mealPlan: 'Bed & Breakfast',
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
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button onClick={() => router.push('/admin/dashboard')} className="btn btn-outline" style={{ padding: '6px 12px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>

        <div className={styles.splitLayout}>
          
          {/* LEFT: Form Panel */}
          <div className={styles.formCard}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>Hotel Confirmation Form</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Add guest credentials and hotels. Changes render in real-time.</p>
            </div>

            {error && <div className={styles.errorBox} style={{ margin: 0 }}>{error}</div>}
            {saveSuccess && <div className={styles.successBox} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: 10, borderRadius: 4, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>Voucher saved successfully in database!</div>}

            {/* Document details */}
            <div className={styles.formSectionTitle}>
              <span>Document Settings</span>
            </div>
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label>Voucher Number</label>
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
                <label>Status</label>
                <select name="status" value={voucherData.status} onChange={handleFieldChange}>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Tentative">Tentative</option>
                  <option value="Hold">Hold</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className={styles.formGrid2}>
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
                <label>Primary Guest Name</label>
                <input
                  type="text"
                  name="guestName"
                  required
                  placeholder="e.g. MUHAMMAD AHMED"
                  value={voucherData.guestName}
                  onChange={(e) => setVoucherData(prev => ({ ...prev, guestName: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>

            {/* Ground support contacts */}
            <div className={styles.formSectionTitle}>
              <span>Saudi Ground Contacts</span>
            </div>
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label>Makkah Representative</label>
                <input
                  type="text"
                  name="makkahContact"
                  value={voucherData.makkahContact}
                  onChange={handleFieldChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Madinah Representative</label>
                <input
                  type="text"
                  name="madinahContact"
                  value={voucherData.madinahContact}
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            {/* General notes */}
            <div className={styles.formGroup}>
              <label>Important Notes</label>
              <textarea
                name="importantNotes"
                value={voucherData.importantNotes}
                onChange={handleFieldChange}
              />
            </div>

            {/* Dynamic stays */}
            <div className={styles.formSectionTitle}>
              <span>Stay Details ({voucherData.stays.length})</span>
              <button type="button" onClick={addStay} className={styles.removeBtn} style={{ color: 'var(--primary)' }}>
                <Plus size={14} /> Add Stay Section
              </button>
            </div>

            {voucherData.stays.map((stay, index) => (
              <div key={index} className={styles.repeaterItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: '700' }}>Stay Segment #{index + 1}</span>
                  {voucherData.stays.length > 1 && (
                    <button type="button" onClick={() => removeStay(index)} className={styles.removeBtn}>
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
                      placeholder="e.g. Anjum Hotel Makkah"
                      value={stay.hotelName}
                      onChange={(e) => handleStayChange(index, 'hotelName', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGrid3} style={{ marginBottom: 10 }}>
                  <div className={styles.formGroup}>
                    <label>Hotel Star Rating</label>
                    <select value={stay.rating} onChange={(e) => handleStayChange(index, 'rating', e.target.value)}>
                      <option value="5 Star">5 Star</option>
                      <option value="4 Star">4 Star</option>
                      <option value="3 Star">3 Star</option>
                      <option value="Standard">Standard / Economy</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Room Category</label>
                    <input
                      type="text"
                      placeholder="Double, Triple, Quad"
                      value={stay.roomType}
                      onChange={(e) => handleStayChange(index, 'roomType', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Room View</label>
                    <input
                      type="text"
                      placeholder="Haram View, City View"
                      value={stay.roomView}
                      onChange={(e) => handleStayChange(index, 'roomView', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGrid3} style={{ marginBottom: 10 }}>
                  <div className={styles.formGroup}>
                    <label>Meal Plan</label>
                    <select value={stay.mealPlan} onChange={(e) => handleStayChange(index, 'mealPlan', e.target.value)}>
                      <option value="Room Only">Room Only (RO)</option>
                      <option value="Bed & Breakfast">Bed & Breakfast (BB)</option>
                      <option value="Half Board">Half Board (HB)</option>
                      <option value="Full Board">Full Board (FB)</option>
                    </select>
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label>Hotel Confirmation # (HCN)</label>
                    <input
                      type="text"
                      placeholder="Hotel PNR or Confirmation ID"
                      value={stay.hcn}
                      onChange={(e) => handleStayChange(index, 'hcn', e.target.value.toUpperCase())}
                    />
                  </div>
                </div>

                <div className={styles.formGrid3}>
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
              </div>
            ))}

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: 10 }}
            >
              <Save size={16} /> {saving ? 'Saving to Database...' : 'Save Hotel Voucher'}
            </button>
          </div>

          {/* RIGHT: Live print layout */}
          {/* RIGHT: Live print layout */}
          <div className={styles.previewPanel}>
            <div className={styles.previewToolbar}>
              <span className={styles.previewToolbarTitle}>VOUCHER PREVIEW (A4 PRINT VIEW)</span>
              <button onClick={() => window.print()} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }}>
                <Printer size={14} /> Print / Export PDF
              </button>
            </div>

            {/* Document sheet */}
            <div className={styles.voucherSheet} style={{ fontFamily: 'Arial, sans-serif', padding: '30px', fontSize: '11px', color: '#1f2937' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f4c81', paddingBottom: '12px', marginBottom: '15px' }}>
                <div>
                  <img src="/logo.png" alt="FTW Logo" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f4c81', letterSpacing: '0.5px' }}>FLY TO WAY TRAVEL & TOURS</h1>
                  <h2 style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: '700', color: '#0f4c81', letterSpacing: '1px' }}>HOTEL BOOKING CONFIRMATION VOUCHER</h2>
                </div>
              </div>

              {/* Greeting & Booking Status Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
                <div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#374151' }}>Dear Sir / Madam,</p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#1f2937' }}>Greeting From FLY TO WAY TRAVEL & TOURS</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#4b5563', lineHeight: '1.4' }}>
                    We are pleased to confirm the following reservation on a <strong style={{ color: '#0f4c81' }}>{voucherData.status.toUpperCase()}</strong> basis.
                  </p>
                </div>
                
                {/* Status Box */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px', fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0f4c81', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Hotel Booking Confirmation
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', gap: '4px' }}>
                    <span style={{ fontWeight: '600' }}>☑ Booking Status:</span>
                    <span style={{ 
                      backgroundColor: voucherData.status.toLowerCase() === 'confirmed' ? '#10b981' : '#ef4444', 
                      color: '#ffffff', 
                      padding: '3px 8px', 
                      borderRadius: '4px', 
                      fontWeight: 'bold', 
                      fontSize: '10px',
                      textTransform: 'uppercase'
                    }}>
                      {voucherData.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: '600' }}>📁 Generated:</span>
                    <span>{voucherData.issueDate ? voucherData.issueDate.split('-').reverse().join('/') : new Date().toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              </div>

              {/* Client & Guest Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '130px', color: '#4b5563', fontWeight: 'bold', fontSize: '11px' }}>Client / Company</span>
                  <span style={{ marginRight: '8px', color: '#4b5563' }}>:</span>
                  <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '11px' }}>{voucherData.clientName ? voucherData.clientName.toUpperCase() : 'FLY TO WAY'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '130px', color: '#4b5563', fontWeight: 'bold', fontSize: '11px' }}>Guest Name</span>
                  <span style={{ marginRight: '8px', color: '#4b5563' }}>:</span>
                  <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '11px' }}>{voucherData.guestName ? voucherData.guestName.toUpperCase() : 'N/A'}</span>
                </div>
              </div>

              {/* Stays Table */}
              <div style={{ marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f4c81', color: '#ffffff' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '700' }}>Stay</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '700' }}>City</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '700' }}>Hotel Name / Category</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '700' }}>Room Type</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '700' }}>View</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '700' }}>Meal Plan</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '700' }}>Check In</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '700' }}>Check Out</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '700' }}>Nights</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '700' }}>HCN #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voucherData.stays.map((stay, index) => {
                      const checkInFormatted = stay.checkIn ? stay.checkIn.split('-').reverse().join('/') : '';
                      const checkOutFormatted = stay.checkOut ? stay.checkOut.split('-').reverse().join('/') : '';
                      
                      let stars = '';
                      if (stay.rating) {
                        const numStars = parseInt(stay.rating) || 0;
                        stars = '★'.repeat(numStars);
                      }
                      
                      let mealPlanCode = stay.mealPlan || '';
                      if (mealPlanCode.toLowerCase().includes('room only')) mealPlanCode = 'RO';
                      else if (mealPlanCode.toLowerCase().includes('breakfast')) mealPlanCode = 'BB';
                      else if (mealPlanCode.toLowerCase().includes('half board')) mealPlanCode = 'HB';
                      else if (mealPlanCode.toLowerCase().includes('full board')) mealPlanCode = 'FB';

                      return (
                        <tr key={index}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>Stay {index + 1}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '700' }}>{stay.city.toUpperCase()}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold', color: '#0f4c81' }}>{stay.hotelName.toUpperCase()}</div>
                            {stars && <div style={{ color: '#f59e0b', fontSize: '10px', marginTop: '2px', letterSpacing: '1px' }}>{stars}</div>}
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>{stay.roomType}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>{stay.roomView}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{mealPlanCode}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>{checkInFormatted}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>{checkOutFormatted}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '700' }}>{stay.totalNights}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontFamily: 'monospace' }}>{stay.hcn || ''}</td>
                        </tr>
                      );
                    })}
                    
                    {/* Total Nights Footer */}
                    <tr style={{ backgroundColor: '#0f4c81', color: '#ffffff' }}>
                      <td colSpan={10} style={{ border: '1px solid #cbd5e1', padding: '7px 10px', textAlign: 'center', fontWeight: '700', letterSpacing: '0.5px' }}>
                        TOTAL NIGHTS: <span style={{ backgroundColor: '#ffffff', color: '#1f2937', padding: '2px 8px', borderRadius: '4px', marginLeft: '6px', fontSize: '11px', fontWeight: '800' }}>{voucherData.stays.reduce((acc, stay) => acc + parseInt(stay.totalNights || 0), 0)}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Two Column Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                
                {/* Left Card: Hotel Information */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '8px 12px', fontWeight: 'bold', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>ⓘ</span> HOTEL INFORMATION
                  </div>
                  <div style={{ padding: '12px 14px', fontSize: '11px', lineHeight: '1.5', color: '#374151' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong>🕒 CHECK IN TIME:</strong>
                      <span>16:00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong>🕒 CHECK OUT TIME:</strong>
                      <span>14:00</span>
                    </div>
                    <div style={{ borderTop: '1px dashed #cbd5e1', margin: '8px 0' }}></div>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '10.5px', fontStyle: 'italic' }}>
                      Early check-in and late check-out are subject to hotel availability.
                    </p>
                  </div>
                </div>

                {/* Right Card: Contact Details */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '8px 12px', fontWeight: 'bold', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📞</span> CONTACT DETAILS
                  </div>
                  <div style={{ padding: '12px 14px', fontSize: '11px', lineHeight: '1.4', color: '#374151', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    {/* Makkah Contact */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '20px', lineHeight: '1' }}>🕋</span>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#0f4c81', fontSize: '11px', marginBottom: '2px' }}>Makkah Hotel Contact</div>
                        <div>Contact Name: {(() => {
                          const contact = voucherData.makkahContact || '';
                          const phoneMatch = contact.match(/[\+\d\s\-]{7,}/);
                          if (phoneMatch) {
                            const phone = phoneMatch[0].trim();
                            let name = contact.replace(phone, '').replace(/[\(\)\:\-\,]/g, '').trim();
                            name = name.replace(/WhatsApp|Available|help|desk/gi, '').trim();
                            return name || 'AMJAD';
                          }
                          return 'AMJAD';
                        })()}</div>
                        <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '2px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span>📱 💬</span> Mobile & WhatsApp: {(() => {
                            const contact = voucherData.makkahContact || '';
                            const phoneMatch = contact.match(/[\+\d\s\-]{7,}/);
                            return phoneMatch ? phoneMatch[0].trim() : contact || '00966123456789';
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Madinah Contact */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '20px', lineHeight: '1' }}>🕌</span>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#0f4c81', fontSize: '11px', marginBottom: '2px' }}>Madinah Hotel Contact</div>
                        <div>Contact Name: {(() => {
                          const contact = voucherData.madinahContact || '';
                          const phoneMatch = contact.match(/[\+\d\s\-]{7,}/);
                          if (phoneMatch) {
                            const phone = phoneMatch[0].trim();
                            let name = contact.replace(phone, '').replace(/[\(\)\:\-\,]/g, '').trim();
                            name = name.replace(/WhatsApp|Available|help|desk/gi, '').trim();
                            return name || 'ANWER';
                          }
                          return 'ANWER';
                        })()}</div>
                        <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '2px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span>📱 💬</span> Mobile & WhatsApp: {(() => {
                            const contact = voucherData.madinahContact || '';
                            const phoneMatch = contact.match(/[\+\d\s\-]{7,}/);
                            return phoneMatch ? phoneMatch[0].trim() : contact || '0096614785968';
                          })()}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Regards Section */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#4b5563' }}>Regards,</p>
                <p style={{ margin: '0 0 2px 0', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '20px', fontWeight: 'bold', color: '#0f4c81', letterSpacing: '1px' }}>ZEESHAN</p>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold', color: '#ef4444', letterSpacing: '0.5px' }}>RESERVATION</p>
              </div>

              {/* Important Note Box */}
              <div style={{ backgroundColor: '#f0f7ff', border: '1px solid #93c5fd', borderRadius: '6px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ color: '#eab308' }}><Bell size={16} style={{ fill: '#eab308' }} /></div>
                <div style={{ fontSize: '10.5px', lineHeight: '1.4', color: '#1e3a8a' }}>
                  <strong style={{ color: '#1e3a8a', display: 'block', marginBottom: '4px', fontSize: '11px' }}>IMPORTANT NOTE</strong>
                  Check in time at: 16:00 any early arrival subject to availability. Check out time at: 14:00, after 14:00 one night will be charged. To guarantee your booking total amount to be transfer to our Account, before option date mentioned in the booking in case of guarantee cancellation full payment will be charged.
                </div>
              </div>

              {/* Full Width Footer Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f4c81', color: '#ffffff', padding: '8px 16px', fontSize: '10px', borderRadius: '4px', fontWeight: '500' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>•</span> College Road, Lahore - Pakistan
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>📱</span> +923082122760
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>✉</span> info@flytoway.com
                </span>
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
