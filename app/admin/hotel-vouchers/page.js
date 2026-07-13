'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Hotel, Plus, Trash2, Printer, Save, RefreshCw, 
  User, FileText, ArrowLeft, Calendar
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
          <div className={styles.previewPanel}>
            <div className={styles.previewToolbar}>
              <span className={styles.previewToolbarTitle}>VOUCHER PREVIEW (A4 PRINT VIEW)</span>
              <button onClick={() => window.print()} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }}>
                <Printer size={14} /> Print / Export PDF
              </button>
            </div>

            {/* Document sheet */}
            <div className={styles.voucherSheet}>
              
              {/* Header */}
              <div>
                <div className={styles.voucherHeader}>
                  <div className={styles.voucherBrand}>
                    <div className={styles.voucherLogo}>
                      <Hotel size={24} style={{ color: 'var(--secondary)' }} />
                      <span style={{ color: '#1f2937' }}>Fly To Way</span>
                    </div>
                    <span className={styles.voucherAgencyInfo}>Hajj & Umrah Hospitality Coordination desk | info@flytoway.com</span>
                  </div>
                  <div className={styles.voucherTitleBlock}>
                    <span className={styles.voucherTitle} style={{ color: 'var(--secondary)' }}>HOTEL CONFIRMATION VOUCHER</span>
                    <table className={styles.voucherRefTable} style={{ marginLeft: 'auto' }}>
                      <tbody>
                        <tr>
                          <td>Voucher Number</td>
                          <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{voucherData.voucherNo}</td>
                        </tr>
                        <tr>
                          <td>Status</td>
                          <td style={{ color: voucherData.status === 'Confirmed' ? '#10b981' : '#f59e0b', fontWeight: '700' }}>
                            {voucherData.status.toUpperCase()}
                          </td>
                        </tr>
                        <tr>
                          <td>Date of Issue</td>
                          <td>{voucherData.issueDate}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 1: Guest info */}
                <div className={styles.voucherSection}>
                  <h4 className={styles.voucherSectionTitle} style={{ borderColor: 'var(--secondary)' }}>Guest Details</h4>
                  <div className={styles.voucherGrid2}>
                    <div>
                      <p><span className={styles.infoLabel}>Primary Guest:</span><span className={styles.infoValue} style={{ fontWeight: 700 }}>{voucherData.guestName}</span></p>
                    </div>
                    <div>
                      <p><span className={styles.infoLabel}>Booking Client:</span><span className={styles.infoValue}>{voucherData.clientName}</span></p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Stay details */}
                <div className={styles.voucherSection}>
                  <h4 className={styles.voucherSectionTitle} style={{ borderColor: 'var(--secondary)' }}>Accommodation Stays Itinerary</h4>
                  <table className={styles.printTable}>
                    <thead>
                      <tr>
                        <th>City</th>
                        <th>Hotel Details</th>
                        <th>Room Configuration</th>
                        <th>Meal Plan</th>
                        <th>Check-in / Check-out</th>
                        <th>Nights</th>
                        <th>HCN #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voucherData.stays.map((stay, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '700' }}>{stay.city.toUpperCase()}</td>
                          <td>
                            <strong>{stay.hotelName}</strong><br />
                            <span style={{ fontSize: '9px', color: '#6b7280' }}>({stay.rating})</span>
                          </td>
                          <td>{stay.roomType} &bull; {stay.roomView}</td>
                          <td>{stay.mealPlan}</td>
                          <td>
                            In: {stay.checkIn}<br />
                            Out: {stay.checkOut}
                          </td>
                          <td style={{ fontWeight: '700', textAlign: 'center' }}>{stay.totalNights}</td>
                          <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>{stay.hcn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 3: Local WhatsApp contacts */}
                <div className={styles.voucherSection}>
                  <h4 className={styles.voucherSectionTitle} style={{ borderColor: 'var(--secondary)' }}>Local Ground Coordination</h4>
                  <div className={styles.voucherGrid2}>
                    <div>
                      <p><span className={styles.infoLabel}>Makkah Help Desk:</span><span className={styles.infoValue}>{voucherData.makkahContact}</span></p>
                    </div>
                    <div>
                      <p><span className={styles.infoLabel}>Madinah Help Desk:</span><span className={styles.infoValue}>{voucherData.madinahContact}</span></p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Notes */}
                {voucherData.importantNotes && (
                  <div className={styles.voucherSection}>
                    <h4 className={styles.voucherSectionTitle} style={{ borderColor: 'var(--secondary)' }}>Important Notice</h4>
                    <p style={{ fontSize: '11px', color: '#4b5563', fontStyle: 'italic' }}>
                      {voucherData.importantNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={styles.voucherFooter}>
                <p>Verify or modify this reservation by calling +92 300 1234567.</p>
                <p style={{ marginTop: '4px', fontSize: '9px', color: '#9ca3af' }}>Fly To Way Travels Hospitality Network.</p>
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
