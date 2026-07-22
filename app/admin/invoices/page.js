'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  FileText, Plus, Trash2, Printer, Save, RefreshCw, 
  User, ArrowLeft, Calendar, Search, DollarSign, Building, CheckCircle2
} from 'lucide-react';
import styles from '../generator.module.css';
import HotelSelect from '@/components/HotelSelect';

function InvoiceGeneratorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editInvoiceNo = searchParams.get('edit');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Default Bank Accounts
  const defaultBanks = [
    {
      accountTitle: 'Air One Hotels',
      bankName: 'Meezan Bank',
      accountNo: '01970109213093',
      branchName: 'Sharfabad Branch-Karachi'
    },
    {
      accountTitle: 'Air One Travels',
      bankName: 'Habib Bank Limited',
      accountNo: '54497000100203',
      branchName: 'Sharfabad Branch'
    }
  ];

  // Initial State matching the PDF Invoice format
  const initialInvoiceState = {
    invoiceNo: '',
    status: 'Tentative',
    title: 'Hotel Booking Confirmation',
    companyLogo: 'flytoway',
    clientName: 'FLY TO WAY T&T',
    guestName: 'RIZWAN KHAN',
    hotelName: 'HADAYA TOWER',
    location: 'MAKKAH',
    issueDate: new Date().toLocaleDateString('en-GB'),
    dueDate: '26-Feb-2026', // example placeholder matching pdf
    rateOfExchange: 77.50,
    hotelDetails: 'RAMZAN BOOKINS ONCE CONFIMRED (NON REFUNABLE/NON CANCELABLE)',
    checkInTime: '18:00 KSA',
    checkOutTime: '12:00 KSA',
    authorizedPerson: 'SHUJA CH',
    remarks: '',
    officeAddress: 'College Road, Lahore - Pakistan',
    phone: '+923082122760',
    email: 'info@flytoway.com',
    bankDetails: defaultBanks,
    items: [
      {
        qty: 1,
        roomType: 'Quad',
        view: 'CV',
        meal: 'R.O',
        checkIn: '2026-03-26',
        checkOut: '2026-03-30',
        nights: 4,
        hcn: 'ALLOTMENT',
        rate: 55,
        total: 220
      }
    ]
  };

  const [invoiceData, setInvoiceData] = useState(initialInvoiceState);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Fetch details if editing
  useEffect(() => {
    if (editInvoiceNo) {
      const fetchInvoice = async () => {
        try {
          const res = await fetch(`/api/vouchers/invoice?search=${editInvoiceNo}`);
          const data = await res.json();
          if (res.ok && data.length > 0) {
            const exactMatch = data.find(i => i.invoiceNo === editInvoiceNo);
            if (exactMatch) {
              setInvoiceData(exactMatch);
            }
          }
        } catch (err) {
          setError('Failed to fetch the invoice details.');
        }
      };
      fetchInvoice();
    } else {
      generateRandomInvoice();
    }
  }, [editInvoiceNo]);

  const generateRandomInvoice = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setInvoiceData(prev => ({ ...prev, invoiceNo: `${rand}` }));
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldChangeUpper = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({ ...prev, [name]: value.toUpperCase() }));
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

  // Item list Handlers
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index][field] = value;
    
    // Auto-calculate nights if dates change
    if (field === 'checkIn' || field === 'checkOut') {
      const checkInVal = field === 'checkIn' ? value : updatedItems[index].checkIn;
      const checkOutVal = field === 'checkOut' ? value : updatedItems[index].checkOut;
      updatedItems[index].nights = calculateNights(checkInVal, checkOutVal);
    }

    // Auto-calculate total for row
    const qty = parseInt(updatedItems[index].qty) || 0;
    const nights = parseInt(updatedItems[index].nights) || 0;
    const rate = parseFloat(updatedItems[index].rate) || 0;
    
    // Total = qty * nights * rate (if nights is 0, default to qty * rate)
    updatedItems[index].total = qty * (nights || 1) * rate;
    
    setInvoiceData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          qty: 1,
          roomType: 'Double',
          view: 'City View',
          meal: 'BB',
          checkIn: '',
          checkOut: '',
          nights: 0,
          hcn: 'PENDING',
          rate: 0,
          total: 0
        }
      ]
    }));
  };

  const removeItem = (index) => {
    if (invoiceData.items.length === 1) return;
    const updated = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData(prev => ({ ...prev, items: updated }));
  };

  // Bank detail Handlers
  const handleBankChange = (index, field, value) => {
    const updatedBanks = [...invoiceData.bankDetails];
    updatedBanks[index][field] = value;
    setInvoiceData(prev => ({ ...prev, bankDetails: updatedBanks }));
  };

  const addBank = () => {
    setInvoiceData(prev => ({
      ...prev,
      bankDetails: [
        ...prev.bankDetails,
        { accountTitle: '', bankName: '', accountNo: '', branchName: '' }
      ]
    }));
  };

  const removeBank = (index) => {
    if (invoiceData.bankDetails.length === 1) return;
    const updated = invoiceData.bankDetails.filter((_, i) => i !== index);
    setInvoiceData(prev => ({ ...prev, bankDetails: updated }));
  };

  const handleReset = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setInvoiceData({
      ...initialInvoiceState,
      invoiceNo: `${rand}`
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  // Search Saved Invoices
  const executeSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/vouchers/invoice?search=${searchQuery}`);
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
      const res = await fetch('/api/vouchers/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });

      if (res.ok) {
        setSaveSuccess(true);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save invoice.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setSaving(false);
    }
  };

  // Auto calculate aggregated total sum
  const grandTotalSAR = invoiceData.items.reduce((acc, item) => acc + (parseFloat(item.total) || 0), 0);
  const grandTotalConverted = (grandTotalSAR * (parseFloat(invoiceData.rateOfExchange) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className={styles.container}>
      <style>{`
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
          #invoice-print {
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            padding: 1.6cm !important;
            margin: 0 !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
          }
          @page {
            size: A4;
            margin: 0 !important;
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
              <Save size={14} style={{ marginRight: 6 }} /> {saving ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </div>

        <div className={styles.stackedLayout}>
          
          {/* LEFT: Form Panel */}
          <div className={`${styles.stackedFormCard} no-print-bar`}>
            
            {/* Search Saved Invoices */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px', marginBottom: '20px', backgroundColor: '#f8fafc' }}>
              <strong style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#0f4c81' }}>Search Saved Invoices</strong>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Search by Invoice #, guest name, client..."
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
                  {searchResults.map((i) => (
                    <div
                      key={i._id}
                      onClick={() => {
                        setInvoiceData(i);
                        setSearchResults([]);
                      }}
                      style={{ padding: '6px 8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '12px', display: 'flex', justifyContent: 'space-between', hover: { backgroundColor: '#f1f5f9' } }}
                    >
                      <span style={{ fontWeight: 'bold', color: '#0f4c81' }}>#{i.invoiceNo}</span>
                      <span style={{ color: '#1e293b' }}>{i.guestName}</span>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{i.clientName}</span>
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
                    Invoice <strong>#{invoiceData.invoiceNo}</strong> has been saved in database and is ready to print or download.
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
                      <Printer size={18} /> Print / Download Invoice PDF
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
                      <Plus size={16} /> Create Another Invoice
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

            {/* 1. Invoice Details */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '6px 10px', borderRadius: '4px' }}>
              <span>1. Invoice Details</span>
            </div>
            <div className={styles.formGrid3} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Invoice Number</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    name="invoiceNo"
                    required
                    value={invoiceData.invoiceNo}
                    onChange={handleFieldChange}
                  />
                  <button type="button" onClick={generateRandomInvoice} className="btn btn-outline" style={{ padding: 8 }}>
                    <RefreshCw size={12} />
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Status / Title Color</label>
                <select name="status" value={invoiceData.status} onChange={handleFieldChange}>
                  <option value="Tentative">Tentative (Blue/Red)</option>
                  <option value="Definite">Definite (Green)</option>
                  <option value="Paid">Paid (Green)</option>
                  <option value="Hold">Hold (Orange)</option>
                  <option value="Cancelled">Cancelled (Red)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Logo Brand</label>
                <select name="companyLogo" value={invoiceData.companyLogo} onChange={handleFieldChange}>
                  <option value="air1">Air 1 Travels &amp; Tours</option>
                  <option value="flytoway">Fly To Way</option>
                  <option value="none">No Logo / Text Only</option>
                </select>
              </div>
            </div>
            <div className={styles.formGrid3} style={{ marginTop: '8px' }}>
              <div className={styles.formGroup}>
                <label>Invoice Heading Title</label>
                <input type="text" name="title" value={invoiceData.title} onChange={handleFieldChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Generated Date</label>
                <input type="text" name="issueDate" placeholder="DD/MM/YYYY" value={invoiceData.issueDate} onChange={handleFieldChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Due Date / Option Date</label>
                <input type="text" name="dueDate" placeholder="e.g. 26-Feb-2026" value={invoiceData.dueDate} onChange={handleFieldChange} />
              </div>
            </div>

            {/* 2. Client & Hotel Context */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>2. Client &amp; Location Details</span>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Client / Company Name</label>
                <input type="text" name="clientName" value={invoiceData.clientName} onChange={handleFieldChangeUpper} />
              </div>
              <div className={styles.formGroup}>
                <label>Guest Name</label>
                <input type="text" name="guestName" value={invoiceData.guestName} onChange={handleFieldChangeUpper} />
              </div>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '8px' }}>
              <div className={styles.formGroup}>
                <label>Hotel Name</label>
                <HotelSelect
                  value={invoiceData.hotelName || ''}
                  city={invoiceData.location}
                  onChange={(val, cityVal) => {
                    setInvoiceData(prev => ({
                      ...prev,
                      hotelName: val,
                      location: (cityVal && cityVal !== 'General') ? cityVal.toUpperCase() : prev.location
                    }));
                  }}
                  placeholder="Select or type hotel name..."
                />
              </div>
              <div className={styles.formGroup}>
                <label>Hotel City (e.g. MAKKAH / MADINAH)</label>
                <input type="text" name="location" value={invoiceData.location} onChange={handleFieldChangeUpper} />
              </div>
            </div>

            {/* 3. Invoice Items Grid */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px', display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
              <span>3. Accommodation / Booking Grid</span>
              <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                <Plus size={12} /> Add Item Row
              </button>
            </div>

            {invoiceData.items.map((item, index) => (
              <div key={index} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px', marginTop: '10px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '13px', color: '#0f4c81' }}>Item Row {index + 1}</strong>
                  {invoiceData.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} style={{ border: 'none', background: '#ef4444', color: '#ffffff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Delete Row
                    </button>
                  )}
                </div>

                <div className={styles.formGrid3}>
                  <div className={styles.formGroup}>
                    <label>Qty</label>
                    <input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 1)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Room Type</label>
                    <input type="text" placeholder="e.g. Quad, Triple" value={item.roomType} onChange={(e) => handleItemChange(index, 'roomType', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>View</label>
                    <input type="text" placeholder="e.g. CV, Haram View" value={item.view} onChange={(e) => handleItemChange(index, 'view', e.target.value)} />
                  </div>
                </div>

                <div className={styles.formGrid3} style={{ marginTop: '8px' }}>
                  <div className={styles.formGroup}>
                    <label>Meal Plan</label>
                    <input type="text" placeholder="e.g. R.O, BB" value={item.meal} onChange={(e) => handleItemChange(index, 'meal', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Check In</label>
                    <input type="date" value={item.checkIn} onChange={(e) => handleItemChange(index, 'checkIn', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Check Out</label>
                    <input type="date" value={item.checkOut} onChange={(e) => handleItemChange(index, 'checkOut', e.target.value)} />
                  </div>
                </div>

                <div className={styles.formGrid3} style={{ marginTop: '8px' }}>
                  <div className={styles.formGroup}>
                    <label>Nights (Auto Calculated)</label>
                    <input type="number" readOnly value={item.nights} style={{ backgroundColor: '#f1f5f9' }} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Hotel Conf. #</label>
                    <input type="text" value={item.hcn} onChange={(e) => handleItemChange(index, 'hcn', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Rate (per night/unit)</label>
                    <input type="number" step="0.01" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className={styles.formGroup} style={{ marginTop: '8px' }}>
                  <label>Row Total (Auto: Qty * Nights * Rate)</label>
                  <strong style={{ fontSize: '14px', color: '#035a37', display: 'block', marginTop: '4px' }}>
                    SAR {item.total}
                  </strong>
                </div>
              </div>
            ))}

            {/* 4. Rates and Converted Currencies */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>4. Currency Conversions</span>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Rate of Exchange (e.g. 77.50)</label>
                <input type="number" step="0.01" name="rateOfExchange" value={invoiceData.rateOfExchange} onChange={handleFieldChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Grand Total (in SAR)</label>
                <strong style={{ fontSize: '18px', color: '#ef4444', display: 'block', marginTop: '4px' }}>
                  SAR {grandTotalSAR}
                </strong>
              </div>
            </div>

            {/* 5. Policy details */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>5. Hotel &amp; Checkout Rules</span>
            </div>
            <div className={styles.formGroup} style={{ marginTop: '10px' }}>
              <label>Hotel Details (Top Note)</label>
              <textarea name="hotelDetails" value={invoiceData.hotelDetails} onChange={handleFieldChange} rows={2} />
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '8px' }}>
              <div className={styles.formGroup}>
                <label>Check In Time</label>
                <input type="text" name="checkInTime" value={invoiceData.checkInTime} onChange={handleFieldChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Check Out Time</label>
                <input type="text" name="checkOutTime" value={invoiceData.checkOutTime} onChange={handleFieldChange} />
              </div>
            </div>

            {/* 6. Bank Details (Highly Dynamic!) */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>6. Bank Details (Editable)</span>
              <button type="button" onClick={addBank} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                <Plus size={12} /> Add Bank
              </button>
            </div>

            {invoiceData.bankDetails.map((bank, index) => (
              <div key={index} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', marginTop: '10px', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '12px', color: '#0f4c81' }}>Bank Account {index + 1}</strong>
                  {invoiceData.bankDetails.length > 1 && (
                    <button type="button" onClick={() => removeBank(index)} style={{ border: 'none', background: '#ef4444', color: '#ffffff', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label>Account Title</label>
                    <input type="text" value={bank.accountTitle} onChange={(e) => handleBankChange(index, 'accountTitle', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Bank Name</label>
                    <input type="text" value={bank.bankName} onChange={(e) => handleBankChange(index, 'bankName', e.target.value)} />
                  </div>
                </div>
                <div className={styles.formGrid2} style={{ marginTop: '6px' }}>
                  <div className={styles.formGroup}>
                    <label>Account / IBAN Number</label>
                    <input type="text" value={bank.accountNo} onChange={(e) => handleBankChange(index, 'accountNo', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Branch / City</label>
                    <input type="text" value={bank.branchName} onChange={(e) => handleBankChange(index, 'branchName', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            {/* 7. Sign off and Contact Footer Info */}
            <div className={styles.formSectionTitle} style={{ backgroundColor: '#0f4c81', color: '#ffffff', padding: '6px 10px', borderRadius: '4px', marginTop: '15px' }}>
              <span>7. Signatures &amp; Contact Footer</span>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '10px' }}>
              <div className={styles.formGroup}>
                <label>Regards (Authorized Name)</label>
                <input type="text" name="authorizedPerson" value={invoiceData.authorizedPerson} onChange={handleFieldChangeUpper} />
              </div>
              <div className={styles.formGroup}>
                <label>Office Address</label>
                <input type="text" name="officeAddress" value={invoiceData.officeAddress} onChange={handleFieldChange} />
              </div>
            </div>
            <div className={styles.formGrid2} style={{ marginTop: '8px' }}>
              <div className={styles.formGroup}>
                <label>Phone / Contact No.</label>
                <input type="text" name="phone" value={invoiceData.phone} onChange={handleFieldChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Reservation Email</label>
                <input type="text" name="email" value={invoiceData.email} onChange={handleFieldChange} />
              </div>
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
                <Save size={18} /> {saving ? 'Submitting Form...' : 'Submit Invoice'}
              </button>
            </div>

          </div>

          {/* RIGHT: Live Print Panel */}
          <div className={styles.stackedPreviewPanel}>
            <div className={`${styles.previewToolbar} no-print-bar`} style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '6px 6px 0 0' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#4b5563' }}>A4 INVOICE SHEET PREVIEW (PDF VIEWER STYLE)</span>
            </div>

            {/* Document sheet */}
            <div id="invoice-print" className={styles.voucherSheet} style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', padding: '45px 35px', fontSize: '13.5px', color: '#000000', lineHeight: '1.5', minHeight: '1000px', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              
              {/* Header block with Logo and Title */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #cbd5e1', paddingBottom: '16px', marginBottom: '25px' }}>
                <div style={{ width: '280px', display: 'flex', alignItems: 'center' }}>
                  {invoiceData.companyLogo === 'air1' ? (
                    <img src="/air1-logo.svg" alt="Air 1 Logo" style={{ height: '85px', width: 'auto', objectFit: 'contain' }} />
                  ) : invoiceData.companyLogo === 'flytoway' ? (
                    <img src="/logo.png" alt="Fly To Way Logo" style={{ height: '85px', width: 'auto', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#0f4c81' }}>AIR 1 TRAVELS</div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0b3c5d', letterSpacing: '1px' }}>
                    {invoiceData.status.toUpperCase()}
                  </h1>
                  <h2 style={{ margin: '2px 0', fontSize: '24px', fontWeight: 'bold', color: '#b91c1c' }}>
                    {invoiceData.invoiceNo}
                  </h2>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', marginTop: '2px' }}>
                    {invoiceData.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    <strong>Booking Status:</strong> <span style={{ textTransform: 'capitalize' }}>{invoiceData.status}</span>
                  </div>
                  {invoiceData.hotelName && (
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0b3c5d', marginTop: '4px' }}>
                      {invoiceData.hotelName}
                    </div>
                  )}
                  {invoiceData.location && (
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#b91c1c', letterSpacing: '0.5px' }}>
                      {invoiceData.location.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Salutations and Greeting */}
              <div style={{ marginBottom: '25px' }}>
                <div style={{ margin: '0 0 6px 0', fontSize: '13.5px' }}>Dear Sir :</div>
                <div style={{ margin: '0 0 10px 0', fontSize: '13.5px', lineHeight: '1.45' }}>
                  Greeting From <strong style={{ color: '#0b3c5d' }}>{invoiceData.companyLogo === 'air1' ? 'Air 1 Travels & Tours' : 'Fly To Way Travels'}</strong>.
                  First of All, We would like to take this opportunity to welcome you at {invoiceData.companyLogo === 'air1' ? 'Air 1 Travels & Tours' : 'Fly To Way Travels'}
                </div>
                <div style={{ margin: 0, fontSize: '13.5px', color: '#1e293b' }}>
                  We are pleased to confirm the following reservation on a <strong style={{ textTransform: 'uppercase', color: '#0b3c5d' }}>{invoiceData.status}</strong> basis.
                </div>
                {invoiceData.dueDate && (
                  <div style={{ margin: '8px 0 0 0', fontSize: '13.5px', color: '#000000' }}>
                    Please clear the amount before: <strong>{invoiceData.dueDate}</strong>
                  </div>
                )}
              </div>

              {/* Client & Guest Details block */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 10px 1fr', gap: '6px', marginBottom: '25px', borderBottom: '1px solid #cbd5e1', paddingBottom: '14px', fontSize: '13px' }}>
                <div>Client</div>
                <div>:</div>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{invoiceData.clientName}</div>
                
                {invoiceData.hotelName && (
                  <>
                    <div>Hotel</div>
                    <div>:</div>
                    <div style={{ textTransform: 'uppercase' }}>{invoiceData.hotelName}</div>
                  </>
                )}

                <div>Guest Name</div>
                <div>:</div>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{invoiceData.guestName}</div>
              </div>

              {/* Items Table */}
              <div style={{ marginBottom: '25px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', border: '1px solid #cbd5e1' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#093a5e', color: '#ffffff' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 'bold' }}>Qty</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 'bold' }}>Room Type</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 'bold' }}>View</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 'bold' }}>Meal</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 'bold' }}>Check In</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 'bold' }}>Check Out</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 'bold' }}>Nights</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 'bold' }}>Hotel Conf. #</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 'bold' }}>Rate</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 'bold' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, idx) => {
                      const checkInFormatted = item.checkIn ? item.checkIn.split('-').reverse().join('/') : '';
                      const checkOutFormatted = item.checkOut ? item.checkOut.split('-').reverse().join('/') : '';
                      return (
                        <tr key={idx} style={{ backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{item.qty}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{item.roomType}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{item.view}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{item.meal}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{checkInFormatted}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{checkOutFormatted}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{item.nights}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: '500' }}>{item.hcn}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{item.rate}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'right', fontWeight: 'bold' }}>{item.total}</td>
                        </tr>
                      );
                    })}
                    
                    {/* Aggregated Total Row */}
                    <tr>
                      <td colSpan={7} style={{ border: 'none', padding: '10px 8px', textAlign: 'right' }}></td>
                      <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '10px 8px', fontWeight: 'bold', backgroundColor: '#f1f5f9', textAlign: 'right' }}>Total</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '10px 8px', fontWeight: 'bold', backgroundColor: '#f1f5f9', textAlign: 'right', color: '#b91c1c' }}>
                        SAR{grandTotalSAR}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b', marginTop: '6px', fontStyle: 'italic' }}>
                  inclusive of all taxes
                </div>
              </div>

              {/* Currency conversion rates / Optional dates */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                  {invoiceData.rateOfExchange && (
                    <div style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: '14.5px' }}>
                      Rate of Exchange: <span style={{ marginLeft: 6 }}>{invoiceData.rateOfExchange}</span>
                    </div>
                  )}
                  {invoiceData.rateOfExchange && grandTotalSAR > 0 && (
                    <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#093a5e', marginTop: '4px' }}>
                      Equivalent Converted Total: <span style={{ color: '#b91c1c' }}>PKR {grandTotalConverted}</span>
                    </div>
                  )}
                </div>
                {invoiceData.dueDate && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#64748b', fontSize: '12px' }}>Optional Date</div>
                    <div style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: '14px' }}>{invoiceData.dueDate}</div>
                  </div>
                )}
              </div>

              {/* Hotel checkout details / cancellation policies */}
              {invoiceData.hotelDetails && (
                <div style={{ border: '1px solid #fca5a5', borderRadius: '4px', padding: '12px 14px', backgroundColor: '#fef2f2', marginBottom: '25px', fontSize: '13px', color: '#991b1b', fontWeight: 'bold' }}>
                  <div style={{ textTransform: 'uppercase', marginBottom: '4px' }}>{invoiceData.hotelDetails}</div>
                  <div style={{ fontSize: '11.5px', color: '#7f1d1d', fontWeight: 'normal' }}>
                    CHECK IN : {invoiceData.checkInTime} | CHECK OUT : {invoiceData.checkOutTime}
                  </div>
                </div>
              )}

              {/* Bank Details section */}
              {invoiceData.bankDetails.length > 0 && (
                <div style={{ border: '1px solid #eab308', borderRadius: '4px', overflow: 'hidden', marginBottom: '25px' }}>
                  <div style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '8px 12px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Bank Details:
                  </div>
                  <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: invoiceData.bankDetails.length > 1 ? '1fr 1fr' : '1fr', gap: '20px', fontSize: '12px', backgroundColor: '#fefcf0' }}>
                    {invoiceData.bankDetails.map((bank, index) => (
                      <div key={index} style={{ borderLeft: '2.5px solid #eab308', paddingLeft: '10px' }}>
                        <div><strong>Account Title:</strong> {bank.accountTitle}</div>
                        <div><strong>Bank:</strong> {bank.bankName}</div>
                        <div><strong>Account / IBAN #:</strong> {bank.accountNo}</div>
                        <div><strong>Branch:</strong> {bank.branchName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regards Section */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'right', marginBottom: '30px' }}>
                <div>
                  <div style={{ fontStyle: 'italic', fontSize: '13.5px', color: '#475569' }}>Regards,</div>
                  <div style={{ fontSize: '17.5px', fontWeight: 'bold', color: '#b91c1c', textTransform: 'uppercase', marginTop: '2px' }}>
                    {invoiceData.authorizedPerson}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#093a5e', letterSpacing: '1px', marginTop: '1px' }}>
                    RESERVATION
                  </div>
                </div>
              </div>

              {/* Bottom fine print legal terms */}
              <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: '1.45', borderTop: '1px solid #cbd5e1', paddingTop: '14px', marginBottom: '35px', textAlign: 'justify' }}>
                Check in time at: 16:00 any early arrival subject to availability. Check out time at: 14:00, after 14:00 one night will be charged. To guarantee your booking total amount to be transfer to our Account, before option date mentioned in the booking in case of guarantee cancellation full payment will be charged.
              </div>

              {/* Footer bar containing agency contact */}
              <div style={{ borderTop: '1.5px solid #cbd5e1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#475569' }}>
                <span>📍 {invoiceData.officeAddress}</span>
                <span>📞 {invoiceData.phone}</span>
                <span>✉ {invoiceData.email}</span>
              </div>

            </div>



          </div>

        </div>

      </div>
    </div>
  );
}

export default function InvoiceGenerator() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 40, textAlign: 'center' }}>Loading invoice form...</div>}>
      <InvoiceGeneratorContent />
    </Suspense>
  );
}
