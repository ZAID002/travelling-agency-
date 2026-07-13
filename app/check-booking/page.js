'use client';

import { useState } from 'react';
import { Plane, Hotel, Printer, ArrowLeft, Search, ShieldCheck } from 'lucide-react';
import styles from '../admin/generator.module.css';

export default function CheckBookingPage() {
  const [voucherNo, setVoucherNo] = useState('');
  const [secondaryValue, setSecondaryValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States to hold the fetched document
  const [docType, setDocType] = useState(null); // 'ETicket' or 'HotelVoucher'
  const [docData, setDocData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDocType(null);
    setDocData(null);

    try {
      const res = await fetch('/api/vouchers/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucherNo, secondaryValue }),
      });

      const data = await res.json();

      if (res.ok) {
        setDocType(data.type);
        setDocData(data.data);
      } else {
        setError(data.error || 'No matching records found.');
      }
    } catch (err) {
      setError('Connection failure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDocType(null);
    setDocData(null);
    setError('');
    setVoucherNo('');
    setSecondaryValue('');
  };

  return (
    <div className={styles.container} style={{ minHeight: 'calc(100vh - 140px)' }}>
      <div className="container" style={{ maxWidth: docData ? '800px' : '450px' }}>
        
        {/* LOGIN FORM CASE */}
        {!docData && (
          <div className="card animate-fade-in" style={{ padding: '40px 30px', marginTop: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <ShieldCheck size={40} color="var(--primary)" style={{ marginBottom: '12px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Retrieve Your Booking</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Enter your voucher details to access, print, or download your official travel documents.
              </p>
            </div>

            {error && <div className={styles.errorBox} style={{ marginBottom: '20px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flex: 'column', gap: '20px', flexDirection: 'column' }}>
              <div className={styles.formGroup}>
                <label>Voucher Reference Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FTW-ET-123456 or FTW-HV-123456"
                  value={voucherNo}
                  onChange={(e) => setVoucherNo(e.target.value.toUpperCase())}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Secondary Verification</label>
                <input
                  type="text"
                  required
                  placeholder="Enter Passport Number OR Guest Last Name"
                  value={secondaryValue}
                  onChange={(e) => setSecondaryValue(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Use Passport Number for flight tickets, and Guest Name for hotel vouchers.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              >
                <Search size={16} /> {loading ? 'Searching Records...' : 'Retrieve My Ticket'}
              </button>
            </form>
          </div>
        )}

        {/* COMPILED DOCUMENT PREVIEW CASE */}
        {docData && (
          <div className="animate-fade-in" style={{ marginTop: '20px' }}>
            
            {/* Toolbar control */}
            <div className={styles.previewToolbar} style={{ marginBottom: '20px' }}>
              <button onClick={handleReset} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }}>
                <ArrowLeft size={14} /> Search Another Booking
              </button>
              <button onClick={() => window.print()} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                <Printer size={14} /> Print / Download PDF
              </button>
            </div>

            {/* Render Flight E-Ticket receipt */}
            {docType === 'ETicket' && (
              <div className={styles.voucherSheet}>
                <div>
                  <div className={styles.voucherHeader}>
                    <div className={styles.voucherBrand}>
                      <div className={styles.voucherLogo}>
                        <Plane size={24} />
                        <span>Fly To Way</span>
                      </div>
                      <span className={styles.voucherAgencyInfo}>210 D, Military Accounts, Lahore | info@flytoway.com</span>
                    </div>
                    <div className={styles.voucherTitleBlock}>
                      <span className={styles.voucherTitle}>ELECTRONIC TICKET RECEIPT</span>
                      <table className={styles.voucherRefTable} style={{ marginLeft: 'auto' }}>
                        <tbody>
                          <tr>
                            <td>Voucher Number</td>
                            <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{docData.voucherNo}</td>
                          </tr>
                          <tr>
                            <td>Status</td>
                            <td style={{ color: docData.status === 'Confirmed' || docData.status === 'Ticketed' ? '#10b981' : '#f59e0b', fontWeight: '700' }}>
                              {docData.status.toUpperCase()}
                            </td>
                          </tr>
                          <tr>
                            <td>Issue Date</td>
                            <td>{new Date(docData.createdAt).toLocaleDateString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

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
                        {docData.passengers.map((p, idx) => (
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
                        {docData.sectors.map((s, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '700' }}>{docData.airline}</td>
                            <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{s.flightNo}</td>
                            <td>{s.from}</td>
                            <td>{s.depDate} &bull; <strong>{s.depTime}</strong></td>
                            <td>{s.to}</td>
                            <td>{s.arrDate} &bull; <strong>{s.arrTime}</strong></td>
                            <td>{docData.classCabin}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.voucherSection}>
                    <h4 className={styles.voucherSectionTitle}>Allowances & Services</h4>
                    <div className={styles.voucherGrid2}>
                      <div>
                        <p><span className={styles.infoLabel}>Checked Baggage:</span><span className={styles.infoValue}>{docData.baggageChecked}</span></p>
                        <p><span className={styles.infoLabel}>Cabin Baggage:</span><span className={styles.infoValue}>{docData.baggageHand}</span></p>
                      </div>
                      <div>
                        <p><span className={styles.infoLabel}>Meal Plan:</span><span className={styles.infoValue}>{docData.meals}</span></p>
                        <p><span className={styles.infoLabel}>Assigned Seat:</span><span className={styles.infoValue}>{docData.seatNo}</span></p>
                      </div>
                    </div>
                  </div>

                  {docData.otherInfo && (
                    <div className={styles.voucherSection}>
                      <h4 className={styles.voucherSectionTitle}>Remarks & Important Notices</h4>
                      <p style={{ fontSize: '11px', color: '#4b5563', fontStyle: 'italic' }}>
                        {docData.otherInfo}
                      </p>
                    </div>
                  )}
                </div>

                <div className={styles.voucherFooter}>
                  <p>Thank you for choosing Fly To Way Travels. For inquiries, contact info@flytoway.com.</p>
                  <p style={{ marginTop: '4px', fontSize: '9px', color: '#9ca3af' }}>Generates on Fly To Way Travel Management Portal.</p>
                </div>
              </div>
            )}

            {/* Render Hotel Voucher receipt */}
            {docType === 'HotelVoucher' && (
              <div className={styles.voucherSheet}>
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
                            <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{docData.voucherNo}</td>
                          </tr>
                          <tr>
                            <td>Status</td>
                            <td style={{ color: docData.status === 'Confirmed' ? '#10b981' : '#f59e0b', fontWeight: '700' }}>
                              {docData.status.toUpperCase()}
                            </td>
                          </tr>
                          <tr>
                            <td>Date of Issue</td>
                            <td>{docData.issueDate}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className={styles.voucherSection}>
                    <h4 className={styles.voucherSectionTitle} style={{ borderColor: 'var(--secondary)' }}>Guest Details</h4>
                    <div className={styles.voucherGrid2}>
                      <div>
                        <p><span className={styles.infoLabel}>Primary Guest:</span><span className={styles.infoValue} style={{ fontWeight: 700 }}>{docData.guestName}</span></p>
                      </div>
                      <div>
                        <p><span className={styles.infoLabel}>Booking Client:</span><span className={styles.infoValue}>{docData.clientName}</span></p>
                      </div>
                    </div>
                  </div>

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
                        {docData.stays.map((stay, idx) => (
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

                  <div className={styles.voucherSection}>
                    <h4 className={styles.voucherSectionTitle} style={{ borderColor: 'var(--secondary)' }}>Local Ground Coordination</h4>
                    <div className={styles.voucherGrid2}>
                      <div>
                        <p><span className={styles.infoLabel}>Makkah Help Desk:</span><span className={styles.infoValue}>{docData.makkahContact}</span></p>
                      </div>
                      <div>
                        <p><span className={styles.infoLabel}>Madinah Help Desk:</span><span className={styles.infoValue}>{docData.madinahContact}</span></p>
                      </div>
                    </div>
                  </div>

                  {docData.importantNotes && (
                    <div className={styles.voucherSection}>
                      <h4 className={styles.voucherSectionTitle} style={{ borderColor: 'var(--secondary)' }}>Important Notice</h4>
                      <p style={{ fontSize: '11px', color: '#4b5563', fontStyle: 'italic' }}>
                        {docData.importantNotes}
                      </p>
                    </div>
                  )}
                </div>

                <div className={styles.voucherFooter}>
                  <p>Verify or modify this reservation by calling +92 300 1234567.</p>
                  <p style={{ marginTop: '4px', fontSize: '9px', color: '#9ca3af' }}>Fly To Way Travels Hospitality Network.</p>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
