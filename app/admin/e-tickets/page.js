'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Plane, Plus, Trash2, Printer, Save, RefreshCw, 
  UserPlus, FileCheck, ArrowLeft, ArrowRight
} from 'lucide-react';
import styles from '../generator.module.css';
import AnimatedLogo from '@/components/AnimatedLogo';

// Component wrapped in Suspense to satisfy search params usage
function ETicketGeneratorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editVoucherNo = searchParams.get('edit');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Initial Form State with premium standard default values
  const [ticketData, setTicketData] = useState({
    voucherNo: '',
    status: 'Confirmed',
    airline: 'Saudi Arabian Airlines',
    classCabin: 'Economy',
    baggageChecked: '30 KG',
    baggageHand: '7 KG',
    meals: 'Standard Halal Meals',
    seatNo: '18A, 18B',
    otherInfo: 'Please arrive at the airport 4 hours prior to departure for international flights.',
    passengers: [
      {
        title: 'MR',
        givenName: 'MUHAMMAD',
        surname: 'AHMED',
        dob: '1985-05-15',
        nationality: 'PAKISTANI',
        passportNo: 'AB1234567',
        passportExpiry: '2030-08-20',
        pnr: 'SVXYZ8',
        status: 'Ticketed'
      }
    ],
    sectors: [
      {
        flightNo: 'SV-737',
        from: 'LHE - Lahore',
        to: 'JED - Jeddah',
        depDate: '2026-09-10',
        depTime: '13:30',
        arrDate: '2026-09-10',
        arrTime: '17:45'
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
            // Find exact match
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
      // Generate a random voucher number on load if not editing
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

  // Passenger Handlers
  const handlePassengerChange = (index, field, value) => {
    const updated = [...ticketData.passengers];
    updated[index][field] = value.toUpperCase();
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
          passportExpiry: '',
          pnr: '',
          status: 'Ticketed'
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
          from: '',
          to: '',
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

  return (
    <div className={styles.container}>
      <div className="container">
        
        {/* Navigation Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button onClick={() => router.push('/admin/dashboard')} className="btn btn-outline" style={{ padding: '6px 12px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>

        <div className={styles.splitLayout}>
          
          {/* LEFT: Builder Form */}
          <div className={styles.formCard}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>E-Ticket Voucher Form</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Modify passenger info and segments. Changes render in real-time.</p>
            </div>

            {error && <div className={styles.errorBox} style={{ margin: 0 }}>{error}</div>}
            {saveSuccess && <div className={styles.successBox} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: 10, borderRadius: 4, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>Voucher saved successfully in database!</div>}

            {/* General Record Fields */}
            <div className={styles.formSectionTitle}>
              <span>Document Details</span>
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
                    value={ticketData.voucherNo}
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
                <label>Voucher Status</label>
                <select name="status" value={ticketData.status} onChange={handleFieldChange}>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Ticketed">Ticketed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label>Carrier / Airline Name</label>
                <input
                  type="text"
                  name="airline"
                  required
                  value={ticketData.airline}
                  onChange={handleFieldChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Cabin Class</label>
                <select name="classCabin" value={ticketData.classCabin} onChange={handleFieldChange}>
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business</option>
                  <option value="First Class">First Class</option>
                </select>
              </div>
            </div>

            {/* Baggage & Meal Info */}
            <div className={styles.formGrid3}>
              <div className={styles.formGroup}>
                <label>Checked Baggage</label>
                <input
                  type="text"
                  name="baggageChecked"
                  value={ticketData.baggageChecked}
                  onChange={handleFieldChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Hand Baggage</label>
                <input
                  type="text"
                  name="baggageHand"
                  value={ticketData.baggageHand}
                  onChange={handleFieldChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Seats assigned</label>
                <input
                  type="text"
                  name="seatNo"
                  placeholder="e.g. 18A"
                  value={ticketData.seatNo}
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label>Meal Type</label>
                <input
                  type="text"
                  name="meals"
                  value={ticketData.meals}
                  onChange={handleFieldChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Important Notes / Remarks</label>
                <input
                  type="text"
                  name="otherInfo"
                  value={ticketData.otherInfo}
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            {/* Dynamic Passengers Form Block */}
            <div className={styles.formSectionTitle}>
              <span>Passenger Manifest ({ticketData.passengers.length})</span>
              <button type="button" onClick={addPassenger} className={styles.removeBtn} style={{ color: 'var(--primary)' }}>
                <UserPlus size={14} /> Add Passenger
              </button>
            </div>

            {ticketData.passengers.map((passenger, index) => (
              <div key={index} className={styles.repeaterItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: '700' }}>Passenger #{index + 1}</span>
                  {ticketData.passengers.length > 1 && (
                    <button type="button" onClick={() => removePassenger(index)} className={styles.removeBtn}>
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>

                <div className={styles.formGrid3} style={{ marginBottom: 10 }}>
                  <div className={styles.formGroup}>
                    <label>Title</label>
                    <select value={passenger.title} onChange={(e) => handlePassengerChange(index, 'title', e.target.value)}>
                      <option value="MR">MR</option>
                      <option value="MRS">MRS</option>
                      <option value="MISS">MISS</option>
                      <option value="MSTR">MSTR</option>
                    </select>
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label>Given Name(s)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MUHAMMAD"
                      value={passenger.givenName}
                      onChange={(e) => handlePassengerChange(index, 'givenName', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGrid2} style={{ marginBottom: 10 }}>
                  <div className={styles.formGroup}>
                    <label>Surname</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AHMED"
                      value={passenger.surname}
                      onChange={(e) => handlePassengerChange(index, 'surname', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={passenger.dob}
                      onChange={(e) => handlePassengerChange(index, 'dob', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGrid3} style={{ marginBottom: 10 }}>
                  <div className={styles.formGroup}>
                    <label>Nationality</label>
                    <input
                      type="text"
                      required
                      value={passenger.nationality}
                      onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Passport Number</label>
                    <input
                      type="text"
                      required
                      placeholder="Passport #"
                      value={passenger.passportNo}
                      onChange={(e) => handlePassengerChange(index, 'passportNo', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Passport Expiry</label>
                    <input
                      type="date"
                      required
                      value={passenger.passportExpiry}
                      onChange={(e) => handlePassengerChange(index, 'passportExpiry', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label>PNR (Record Locator)</label>
                    <input
                      type="text"
                      required
                      placeholder="PNR e.g. SVXYZ8"
                      value={passenger.pnr}
                      onChange={(e) => handlePassengerChange(index, 'pnr', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Flight Ticket Status</label>
                    <select value={passenger.status} onChange={(e) => handlePassengerChange(index, 'status', e.target.value)}>
                      <option value="Ticketed">Ticketed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Standby">Standby</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Dynamic Flights Sector Block */}
            <div className={styles.formSectionTitle}>
              <span>Flight Routing Sectors ({ticketData.sectors.length})</span>
              <button type="button" onClick={addSector} className={styles.removeBtn} style={{ color: 'var(--primary)' }}>
                <Plus size={14} /> Add Sector
              </button>
            </div>

            {ticketData.sectors.map((sector, index) => (
              <div key={index} className={styles.repeaterItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: '700' }}>Sector #{index + 1}</span>
                  {ticketData.sectors.length > 1 && (
                    <button type="button" onClick={() => removeSector(index)} className={styles.removeBtn}>
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>

                <div className={styles.formGrid3} style={{ marginBottom: 10 }}>
                  <div className={styles.formGroup}>
                    <label>Flight No</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SV-737"
                      value={sector.flightNo}
                      onChange={(e) => handleSectorChange(index, 'flightNo', e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>From (Origin)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LHE - Lahore"
                      value={sector.from}
                      onChange={(e) => handleSectorChange(index, 'from', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>To (Destination)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JED - Jeddah"
                      value={sector.to}
                      onChange={(e) => handleSectorChange(index, 'to', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGrid2} style={{ marginBottom: 10 }}>
                  <div className={styles.formGroup}>
                    <label>Departure Date</label>
                    <input
                      type="date"
                      required
                      value={sector.depDate}
                      onChange={(e) => handleSectorChange(index, 'depDate', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Departure Time</label>
                    <input
                      type="time"
                      required
                      value={sector.depTime}
                      onChange={(e) => handleSectorChange(index, 'depTime', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label>Arrival Date</label>
                    <input
                      type="date"
                      required
                      value={sector.arrDate}
                      onChange={(e) => handleSectorChange(index, 'arrDate', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Arrival Time</label>
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

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: 10 }}
            >
              <Save size={16} /> {saving ? 'Saving to Database...' : 'Save Voucher Record'}
            </button>
          </div>

          {/* RIGHT: Live print sheet */}
          <div className={styles.previewPanel}>
            <div className={styles.previewToolbar}>
              <span className={styles.previewToolbarTitle}>VOUCHER PREVIEW (A4 PRINT VIEW)</span>
              <button onClick={() => window.print()} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }}>
                <Printer size={14} /> Print / Export PDF
              </button>
            </div>

            {/* Document sheet */}
            <div id="voucher-print" className={styles.voucherSheet}>
              
              {/* Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0d9488', paddingBottom: '12px', marginBottom: '15px' }}>
                  <div style={{ width: '150px', height: '65px', display: 'flex', alignItems: 'center' }}>
                    <AnimatedLogo theme="light" />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0d9488', letterSpacing: '0.5px' }}>FLY TO WAY TRAVEL & TOURS</h1>
                    <h2 style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: '700', color: '#0d9488', letterSpacing: '1px' }}>ELECTRONIC TICKET RECEIPT</h2>
                  </div>
                </div>
                    <table className={styles.voucherRefTable} style={{ marginLeft: 'auto' }}>
                      <tbody>
                        <tr>
                          <td>Voucher Number</td>
                          <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{ticketData.voucherNo}</td>
                        </tr>
                        <tr>
                          <td>Status</td>
                          <td style={{ color: ticketData.status === 'Confirmed' || ticketData.status === 'Ticketed' ? '#10b981' : '#f59e0b', fontWeight: '700' }}>
                            {ticketData.status.toUpperCase()}
                          </td>
                        </tr>
                        <tr>
                          <td>Issue Date</td>
                          <td>{new Date().toLocaleDateString()}</td>
                        </tr>
                      </tbody>
                    </table>

                {/* Section 1: Passenger manifest list */}
                <div className={styles.voucherSection}>
                  <h4 className={styles.voucherSectionTitle}>Passenger Manifest</h4>
                  <table className={styles.printTable}>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Passenger Name</th>
                        <th>Nationality</th>
                        <th>Passport No.</th>
                        <th>Expiry Date</th>
                        <th>Record Locator (PNR)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketData.passengers.map((p, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: '700' }}>
                            {p.title} {p.givenName} {p.surname}
                          </td>
                          <td>{p.nationality || 'PAKISTANI'}</td>
                          <td style={{ fontFamily: 'monospace' }}>{p.passportNo}</td>
                          <td>{p.passportExpiry}</td>
                          <td style={{ fontWeight: '700', fontFamily: 'monospace', color: '#0d9488' }}>{p.pnr}</td>
                          <td style={{ fontWeight: '700' }}>{p.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 2: Sector routing details list */}
                <div className={styles.voucherSection}>
                  <h4 className={styles.voucherSectionTitle}>Flight Itinerary Sectors</h4>
                  <table className={styles.printTable}>
                    <thead>
                      <tr>
                        <th>Carrier</th>
                        <th>Flight No</th>
                        <th>Departing From</th>
                        <th>Departure Date / Time</th>
                        <th>Arriving To</th>
                        <th>Arrival Date / Time</th>
                        <th>Class</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketData.sectors.map((s, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '700' }}>{ticketData.airline}</td>
                          <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{s.flightNo}</td>
                          <td>{s.from}</td>
                          <td>{s.depDate} &bull; <strong>{s.depTime}</strong></td>
                          <td>{s.to}</td>
                          <td>{s.arrDate} &bull; <strong>{s.arrTime}</strong></td>
                          <td>{ticketData.classCabin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 3: Baggage & Service rules */}
                <div className={styles.voucherSection}>
                  <h4 className={styles.voucherSectionTitle}>Allowances & Services</h4>
                  <div className={styles.voucherGrid2}>
                    <div>
                      <p><span className={styles.infoLabel}>Checked Baggage:</span><span className={styles.infoValue}>{ticketData.baggageChecked}</span></p>
                      <p><span className={styles.infoLabel}>Cabin Baggage:</span><span className={styles.infoValue}>{ticketData.baggageHand}</span></p>
                    </div>
                    <div>
                      <p><span className={styles.infoLabel}>Meal Plan:</span><span className={styles.infoValue}>{ticketData.meals}</span></p>
                      <p><span className={styles.infoLabel}>Assigned Seat:</span><span className={styles.infoValue}>{ticketData.seatNo}</span></p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Remarks */}
                {ticketData.otherInfo && (
                  <div className={styles.voucherSection}>
                    <h4 className={styles.voucherSectionTitle}>Remarks & Important Notices</h4>
                    <p style={{ fontSize: '11px', color: '#4b5563', fontStyle: 'italic' }}>
                      {ticketData.otherInfo}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={styles.voucherFooter}>
                <p>Thank you for choosing Fly To Way Travels. For inquiries, contact info@flytoway.com.</p>
                <p style={{ marginTop: '4px', fontSize: '9px', color: '#9ca3af' }}>Generates on Fly To Way Travel Management Portal.</p>
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
