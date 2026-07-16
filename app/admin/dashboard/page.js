'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { 
  Plane, Hotel, ShieldCheck, Search, Plus, 
  Eye, FileText, Settings, User, RefreshCw,
  ChevronDown, ChevronUp, Mail, Phone, MessageSquare, Trash2
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [maheenVouchers, setMaheenVouchers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('vouchers'); // 'vouchers' or 'inquiries'
  const [expandedInquiryId, setExpandedInquiryId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch functions
  const fetchData = async (query = '') => {
    setLoading(true);
    try {
      // Fetch tickets
      const ticketRes = await fetch(`/api/vouchers/e-ticket?search=${query}`);
      const ticketData = await ticketRes.json();
      
      // Fetch hotel vouchers
      const hotelRes = await fetch(`/api/vouchers/hotel?search=${query}`);
      const hotelData = await hotelRes.json();

      // Fetch invoices
      const invoiceRes = await fetch(`/api/vouchers/invoice?search=${query}`);
      const invoiceData = await invoiceRes.json();

      // Fetch Maheen vouchers
      const maheenRes = await fetch(`/api/vouchers/maheen?search=${query}`);
      const maheenData = await maheenRes.json();

      // Fetch inquiries
      const inquiryRes = await fetch('/api/inquiries');
      const inquiryData = await inquiryRes.json();

      if (ticketRes.ok && hotelRes.ok && invoiceRes.ok && inquiryRes.ok && maheenRes.ok) {
        setTickets(ticketData);
        setVouchers(hotelData);
        setInvoices(invoiceData);
        setInquiries(inquiryData);
        setMaheenVouchers(maheenData);
      } else {
        setError('Failed to fetch some records.');
      }
    } catch (err) {
      setError('Could not connect to database services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(search);
  };

  // Compute stats
  const totalTickets = tickets.length;
  const totalHotels = vouchers.length;
  const totalInvoices = invoices.length;

  // Combine history for a single unified log, sorted by newest first
  const unifiedHistory = [
    ...tickets.map(t => ({
      id: t._id,
      voucherNo: t.voucherNo,
      type: 'E-Ticket',
      client: t.airline,
      primaryName: t.passengers[0] ? `${t.passengers[0].givenName} ${t.passengers[0].surname}` : 'N/A',
      date: new Date(t.createdAt).toLocaleDateString(),
      status: t.status,
      link: `/admin/e-tickets?edit=${t.voucherNo}`
    })),
    ...vouchers.map(v => ({
      id: v._id,
      voucherNo: v.voucherNo,
      type: 'Hotel Voucher',
      client: v.clientName || 'N/A',
      primaryName: v.guestName || 'N/A',
      date: new Date(v.createdAt).toLocaleDateString(),
      status: v.status,
      link: `/admin/hotel-vouchers?edit=${v.voucherNo}`
    })),
    ...invoices.map(i => ({
      id: i._id,
      voucherNo: i.invoiceNo,
      type: 'Invoice',
      client: i.clientName || 'N/A',
      primaryName: i.guestName || 'N/A',
      date: new Date(i.createdAt).toLocaleDateString(),
      status: i.status,
      link: `/admin/invoices?edit=${i.invoiceNo}`
    })),
    ...maheenVouchers.map(m => ({
      id: m._id,
      voucherNo: m.voucherNo,
      type: 'Umrah Voucher',
      client: m.packageCode || 'N/A',
      primaryName: m.familyHead || 'N/A',
      date: new Date(m.createdAt).toLocaleDateString(),
      status: m.status,
      link: `/admin/maheen-hotel?edit=${m.voucherNo}`
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    let endpoint = '';
    if (type === 'E-Ticket') {
      endpoint = `/api/vouchers/e-ticket?id=${id}`;
    } else if (type === 'Hotel Voucher') {
      endpoint = `/api/vouchers/hotel?id=${id}`;
    } else if (type === 'Invoice') {
      endpoint = `/api/vouchers/invoice?id=${id}`;
    } else if (type === 'Umrah Voucher') {
      endpoint = `/api/vouchers/maheen?id=${id}`;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (res.ok) {
        if (type === 'E-Ticket') {
          setTickets(prev => prev.filter(item => item._id !== id));
        } else if (type === 'Hotel Voucher') {
          setVouchers(prev => prev.filter(item => item._id !== id));
        } else if (type === 'Invoice') {
          setInvoices(prev => prev.filter(item => item._id !== id));
        } else if (type === 'Umrah Voucher') {
          setMaheenVouchers(prev => prev.filter(item => item._id !== id));
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete the record.');
      }
    } catch (err) {
      alert('Connection error. Could not delete record.');
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className="container">
        
        {/* Header section */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Travel Dashboard</h1>
            <p className={styles.subtitle}>Welcome back, administrator. Manage and issue passenger logs.</p>
          </div>
          <div className={styles.actions}>
            <Link href="/admin/e-tickets" className="btn btn-primary">
              <Plus size={16} /> New E-Ticket
            </Link>
            <Link href="/admin/hotel-vouchers" className="btn btn-secondary">
              <Plus size={16} /> New Hotel Voucher
            </Link>
            <Link href="/admin/maheen-hotel" className="btn btn-secondary" style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: '#ffffff' }}>
              <Plus size={16} /> New Umrah Voucher
            </Link>
            <Link href="/admin/invoices" className="btn btn-secondary" style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5', color: '#ffffff' }}>
              <Plus size={16} /> New Invoice
            </Link>
          </div>
        </div>

        {error && <div className="card" style={{ color: 'var(--danger)', marginBottom: 20 }}>{error}</div>}

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Plane size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Flight E-Tickets</span>
              <span className={styles.statValue}>{loading ? '...' : totalTickets}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Hotel size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Hotel Confirmation Vouchers</span>
              <span className={styles.statValue}>{loading ? '...' : totalHotels}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5' }}>
              <FileText size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Issued Invoices</span>
              <span className={styles.statValue}>{loading ? '...' : totalInvoices}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <ShieldCheck size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Umrah Vouchers</span>
              <span className={styles.statValue}>{loading ? '...' : maheenVouchers.length}</span>
            </div>
          </div>
        </div>

        {/* History Search Logs */}
        <div className={styles.historySection}>
          <div className={styles.tabsHeader}>
            <div className={styles.tabsGroup}>
              <button 
                onClick={() => setActiveTab('vouchers')}
                className="btn"
                style={{ 
                  background: activeTab === 'vouchers' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'vouchers' ? '#ffffff' : 'var(--text-secondary)',
                  border: activeTab === 'vouchers' ? 'none' : '1px solid var(--border)',
                  padding: '8px 16px',
                  fontSize: '14px',
                  boxShadow: 'none',
                  cursor: 'pointer'
                }}
              >
                Issued Vouchers ({unifiedHistory.length})
              </button>
              <button 
                onClick={() => setActiveTab('inquiries')}
                className="btn"
                style={{ 
                  background: activeTab === 'inquiries' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'inquiries' ? '#ffffff' : 'var(--text-secondary)',
                  border: activeTab === 'inquiries' ? 'none' : '1px solid var(--border)',
                  padding: '8px 16px',
                  fontSize: '14px',
                  boxShadow: 'none',
                  cursor: 'pointer'
                }}
              >
                Booking Inquiries ({inquiries.length})
              </button>
            </div>
            <button 
              onClick={() => { setSearch(''); fetchData(); }} 
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {activeTab === 'vouchers' ? (
            <>
              <form onSubmit={handleSearch} className={styles.searchContainer}>
                <div className={styles.searchBar} style={{ position: 'relative' }}>
                  <Search 
                    size={16} 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: 'var(--text-muted)' 
                    }} 
                  />
                  <input
                    type="text"
                    placeholder="Search by Passenger, Voucher No, PNR, Hotel, or Carrier..."
                    style={{ paddingLeft: '38px' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </form>

              {loading ? (
                <div className={styles.emptyState}>Loading databases...</div>
              ) : unifiedHistory.length === 0 ? (
                <div className={styles.emptyState}>No voucher records found matching your search.</div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Voucher Number</th>
                        <th>Document Type</th>
                        <th>Client / Carrier</th>
                        <th>Primary Passenger / Guest</th>
                        <th>Date Generated</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unifiedHistory.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{item.voucherNo}</td>
                          <td>
                            <span className={`${styles.badge} ${
                              item.type === 'E-Ticket' ? styles.badgeTicket : item.type === 'Hotel Voucher' ? styles.badgeHotel : item.type === 'Umrah Voucher' ? styles.badgeMaheen : styles.badgeInvoice
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td>{item.client}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <User size={14} color="var(--text-muted)" />
                              <span>{item.primaryName}</span>
                            </div>
                          </td>
                          <td>{item.date}</td>
                          <td>
                            <span style={{ 
                              color: item.status === 'Confirmed' || item.status === 'Ticketed' ? 'var(--success)' : 'var(--warning)',
                              fontWeight: '600',
                              fontSize: '13px'
                            }}>
                              {item.status}
                            </span>
                          </td>
                          <td style={{ display: 'flex', gap: '8px' }}>
                            <Link href={item.link} className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Eye size={12} /> Edit
                            </Link>
                            <button 
                              onClick={() => handleDelete(item.id, item.type)}
                              className="btn btn-outline"
                              style={{ padding: '6px 10px', fontSize: 12, borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: 'transparent' }}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            // Inquiries Tab
            <div>
              {loading ? (
                <div className={styles.emptyState}>Loading inquiries...</div>
              ) : inquiries.length === 0 ? (
                <div className={styles.emptyState}>No booking inquiries have been submitted yet.</div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Sender Name</th>
                        <th>Contact Information</th>
                        <th>Interested Package</th>
                        <th>Date Received</th>
                        <th>Message Preview</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map((inq) => {
                        const isExpanded = expandedInquiryId === inq._id;
                        return (
                          <Fragment key={inq._id}>
                            <tr>
                              <td style={{ fontWeight: '700' }}>{inq.name}</td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Mail size={12} color="var(--text-muted)" />
                                    <span>{inq.email}</span>
                                  </div>
                                  {inq.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Phone size={12} color="var(--text-muted)" />
                                      <span>{inq.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className={`${styles.badge} ${styles.badgeHotel}`}>
                                  {inq.packageType || 'General Enquiry'}
                                </span>
                              </td>
                              <td>{new Date(inq.createdAt).toLocaleString()}</td>
                              <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {inq.message}
                              </td>
                              <td>
                                <button 
                                  onClick={() => setExpandedInquiryId(isExpanded ? null : inq._id)} 
                                  className="btn btn-outline"
                                  style={{ padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', width: 'auto', boxShadow: 'none' }}
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp size={12} /> Hide
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown size={12} /> Read
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr style={{ background: 'var(--bg-tertiary)' }}>
                                <td colSpan={6} style={{ padding: '16px 20px', background: 'var(--bg-tertiary)' }}>
                                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <MessageSquare size={16} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <div>
                                      <h5 style={{ fontWeight: '700', fontSize: '13px', marginBottom: 4, color: 'var(--text-primary)' }}>Full Message Text:</h5>
                                      <p style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        "{inq.message}"
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
