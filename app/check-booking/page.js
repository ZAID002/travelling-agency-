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

            {/* Render Umrah Package / Maheen Voucher receipt */}
            {docType === 'MaheenVoucher' && (
              <div id="voucher-print" className={styles.voucherSheet} style={{ backgroundColor: '#ffffff', fontFamily: '"Outfit", "Inter", "Segoe UI", Arial, sans-serif', padding: '30px 25px', fontSize: '11.5px', color: '#1e293b', lineHeight: '1.4', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                
                 {/* Header block with Logo and Title */}
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0a2e5c', paddingBottom: '12px', marginBottom: '15px' }}>
                   <div style={{ display: 'flex', alignItems: 'center' }}>
                     <img src="/logo.png" alt="Fly To Way Logo" style={{ height: '90px', width: 'auto', objectFit: 'contain' }} />
                   </div>
                   <div style={{ textAlign: 'right', fontSize: '11px', color: '#1e293b' }}>
                     <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0a2e5c', marginBottom: '4px' }}>UMRAH TRAVEL VOUCHER</div>
                     <div><strong>VOUCHER DATE:</strong> {docData.issueDate}</div>
                     <div><strong>PACKAGE:</strong> {docData.packageCode}</div>
                     <div><strong>PAX:</strong> {docData.paxNo}</div>
                     <div><strong>BEDS:</strong> {docData.bedsNo}</div>
                   </div>
                 </div>

                {/* Family Head info bar */}
                <div style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <span><strong>F.Head:</strong> {docData.familyHead}</span>
                    <span><strong>UB No:</strong> {docData.ubNo}</span>
                    {docData.mNo && <span><strong>MNo:</strong> {docData.mNo}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', background: '#10b981', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold', textTransform: 'uppercase' }}>{docData.status}</span>
                    <div style={{ width: '22px', height: '22px', backgroundColor: '#ffffff', display: 'flex', padding: '2px' }}>
                      <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(45deg, #000, #000 2px, #fff 2px, #fff 4px)' }}></div>
                    </div>
                  </div>
                </div>

                {/* Flights details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  {docData.flights.map((flight, idx) => (
                    <div key={idx} style={{ border: '1.5px solid #0a2e5c', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: '4px 10px', fontWeight: 'bold', fontSize: '10.5px' }}>
                        ✈ {flight.type === 'DEPARTURE' ? 'DEPARTURE DETAILS' : 'ARRIVAL DETAILS'}
                      </div>
                      <table style={{ width: '100%', fontSize: '10.5px', borderCollapse: 'collapse', margin: '4px' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '3px 6px', color: '#4b5563', width: '80px' }}><strong>Flight:</strong></td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{flight.flightNo || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '3px 6px', color: '#4b5563' }}><strong>Sector:</strong></td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{flight.sector || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '3px 6px', color: '#4b5563' }}><strong>Departure:</strong></td>
                            <td style={{ padding: '3px 6px' }}>{flight.depDate || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '3px 6px', color: '#4b5563' }}><strong>Arrival:</strong></td>
                            <td style={{ padding: '3px 6px' }}>{flight.arrDate || 'N/A'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>

                {/* Accommodation Stay Grid */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ color: '#0a2e5c', fontWeight: 'bold', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    🏨 Accommodation Plan
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1.5px solid #0a2e5c' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0a2e5c', color: '#ffffff' }}>
                        <th style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'left' }}>City</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'left' }}>Hotel Name</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'center' }}>View</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'center' }}>Meal</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'center' }}>Conf #</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'left' }}>Room Type</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'center' }}>Checkin</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'center' }}>Checkout</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'center' }}>Nights</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docData.stays.map((stay, idx) => {
                        const checkInFormatted = stay.checkIn ? stay.checkIn.split('-').reverse().slice(0,2).join('-') + '-' + stay.checkIn.split('-')[0].slice(2) : '';
                        const checkOutFormatted = stay.checkOut ? stay.checkOut.split('-').reverse().slice(0,2).join('-') + '-' + stay.checkOut.split('-')[0].slice(2) : '';
                        return (
                          <tr key={idx} style={{ backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px', fontWeight: 'bold' }}>{stay.city}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px' }}>{stay.hotelName || 'N/A'}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>{stay.view}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>{stay.mealPlan}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>{stay.hcn || '-'}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px' }}>{stay.roomType}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>{checkInFormatted}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>{checkOutFormatted}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>{stay.totalNights}</td>
                          </tr>
                        );
                      })}
                      <tr style={{ backgroundColor: '#0a2e5c', color: '#ffffff', fontWeight: 'bold' }}>
                        <td colSpan={8} style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'right' }}>Total Nights:</td>
                        <td style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'center', fontSize: '11px' }}>
                          {docData.stays.reduce((acc, s) => acc + (parseInt(s.totalNights) || 0), 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Transport Detail Section */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ color: '#0a2e5c', fontWeight: 'bold', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    🚌 Transport Logistics
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1.5px solid #0a2e5c' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0a2e5c', color: '#ffffff' }}>
                        <th style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'left', width: '20%' }}>Travel Date</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'left', width: '30%' }}>Transporter</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'left', width: '20%' }}>Type</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '5px', textAlign: 'left', width: '30%' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px' }}>{docData.transportTravelDate || 'As per Schedule'}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px', fontWeight: 'bold' }}>{docData.transportTransporter || 'N/A'}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px' }}>{docData.transportType || 'N/A'}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px' }}>{docData.transportDesc || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mutamers Manifest Table */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ color: '#0a2e5c', fontWeight: 'bold', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    👤 Pilgrims (Mutamers) list
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1.5px solid #0a2e5c' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0a2e5c', color: '#ffffff' }}>
                        <th style={{ border: '1px solid #0a2e5c', padding: '4px', textAlign: 'center', width: '5%' }}>SNO</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '4px', textAlign: 'left', width: '15%' }}>Passport</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '4px', textAlign: 'left', width: '40%' }}>Mutamer Name</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '4px', textAlign: 'center', width: '5%' }}>G</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '4px', textAlign: 'center', width: '10%' }}>PAX</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '4px', textAlign: 'center', width: '5%' }}>Bed</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '4px', textAlign: 'left', width: '10%' }}>Group #</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '4px', textAlign: 'left', width: '10%' }}>Visa #</th>
                        <th style={{ border: '1px solid #0a2e5c', padding: '4px', textAlign: 'left', width: '10%' }}>PNR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docData.mutamers.map((mutamer, idx) => (
                        <tr key={idx} style={{ backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: '500', fontFamily: 'monospace' }}>{mutamer.passportNo || 'N/A'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 'bold' }}>{mutamer.name || 'N/A'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>{mutamer.gender}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>{mutamer.paxType}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>{mutamer.bed}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>{mutamer.groupNo || '-'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>{mutamer.visaNo || '-'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 'bold', fontFamily: 'monospace' }}>{mutamer.pnr || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Ground support & Special instructions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px', marginBottom: '15px', alignItems: 'start' }}>
                  <div style={{ border: '1.5px solid #0a2e5c', borderRadius: '4px', padding: '8px' }}>
                    <div><strong>Special Instructions:</strong></div>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '11px', marginTop: '3px', textTransform: 'uppercase' }}>
                      ⚠️ {docData.specialInstructions || 'N/A'}
                    </div>
                  </div>
                  <div style={{ border: '1.5px solid #0a2e5c', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#0a2e5c', color: '#ffffff', padding: '4px 8px', fontWeight: 'bold', fontSize: '10px' }}>
                      📞 GROUND REPRESENTATIVES
                    </div>
                    <div style={{ padding: '6px 8px', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {docData.makkahContactName && (
                        <div>🕋 <strong>MAKKAH Support:</strong> {docData.makkahContactName} ({docData.makkahContactNo})</div>
                      )}
                      {docData.madinahContactName && (
                        <div>🕌 <strong>MADINA Support:</strong> {docData.madinahContactName} ({docData.madinahContactNo})</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Urdu Guidelines */}
                <div style={{ border: '1.5px solid #0a2e5c', borderRadius: '5px', padding: '10px 14px', backgroundColor: '#f0f4fa', marginBottom: '15px' }}>
                  <div dir="rtl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '10.5px', lineHeight: '1.6', color: '#0a2e5c', textAlign: 'right' }}>
                    <strong style={{ display: 'block', fontSize: '12px', marginBottom: '6px', borderBottom: '1px solid #b9c9e3', paddingBottom: '3px' }}>ضروری ہدایات:-</strong>
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
                    <div style={{ marginTop: '5px', fontSize: '9.5px', borderTop: '1px dashed #cbd5e1', paddingTop: '4px', fontWeight: 'bold' }}>
                      نوٹ: مندرجہ بالا ہدایات پر عملدرآمد کو یقینی بنائیں کو تاہی کی صورت میں ہونے والے کسی بھی نقصان کی ذمہ داری معتمرین پر ہوگی۔
                    </div>
                  </div>
                </div>

                {/* Footer details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: '10px', marginTop: '10px' }}>
                  <div style={{ fontSize: '9.5px', color: '#64748b', maxWidth: '60%' }}>
                    <strong>{docData.companyName}</strong> <br />
                    📍 {docData.officeAddress} | ✉ {docData.email} | 📞 {docData.phone}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '10.5px' }}>
                    <div style={{ color: '#4b5563' }}>Authorized Signatory:</div>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0a2e5c', textTransform: 'uppercase', marginTop: '2px' }}>{docData.authorizedPerson}</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>RESERVATION DEPT</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
