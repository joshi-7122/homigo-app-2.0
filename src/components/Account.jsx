import React, { useState, useEffect } from 'react';
import { lookupPincode } from '../utils/pincodeDb';
import BusinessPitch from './BusinessPitch';
import { 
  Edit2, 
  ClipboardList, 
  Cpu, 
  HeadphonesIcon,
  FileText,
  Star,
  MapPin,
  CreditCard,
  Settings,
  Info,
  ChevronRight,
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  Sun,
  Moon,
  CheckCircle2,
  Activity,
  ShieldCheck,
  Bookmark,
  LogOut
} from 'lucide-react';

function generateInvoiceNumber() {
  return `HMG-INV-${Math.floor(100000 + Math.random() * 900000)}`;
}

export default function Account({ 
  user, 
  changeTab, 
  bookings = [], 
  appliances = [], 
  appTheme, 
  setAppTheme,
  activeOverlayScreen,
  setActiveOverlayScreen,
  onOpenServiceForm,
  setUserAddress,
  setAddressType,
  setAddressHouse,
  setAddressArea,
  setAddressLandmark,
  setAddressDistrict,
  setAddressPincode,
  setSelectedCity,
  showToast,
  onLogout
}) {

  useEffect(() => {
    if (activeOverlayScreen) {
      const viewport = document.querySelector('.phone-screen-viewport');
      if (viewport) {
        viewport.scrollTop = 0;
      }
      const mainScroller = document.querySelector('main');
      if (mainScroller) {
        mainScroller.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    }
  }, [activeOverlayScreen]);

  // Saved Addresses book states
  const [savedAddresses, setSavedAddresses] = useState(() => {
    const stored = localStorage.getItem('homigo_saved_addresses');
    if (stored) return JSON.parse(stored);

    // Default: Construct from current active home address details
    const primaryHouse = localStorage.getItem('homigo_address_house') || '';
    const primaryArea = localStorage.getItem('homigo_address_area') || '';
    const primaryLandmark = localStorage.getItem('homigo_address_landmark') || '';
    const primaryDistrict = localStorage.getItem('homigo_address_district') || '';
    const primaryPincode = localStorage.getItem('homigo_address_pincode') || '';
    const primaryCity = localStorage.getItem('homigo_selected_city') || 'Mumbai';
    const primaryType = localStorage.getItem('homigo_address_type') || 'Home';
    const primaryFormatted = localStorage.getItem('homigo_user_address') || '';

    if (primaryHouse && primaryArea && primaryPincode) {
      return [{
        id: 'primary',
        house: primaryHouse,
        area: primaryArea,
        landmark: primaryLandmark,
        district: primaryDistrict,
        pincode: primaryPincode,
        city: primaryCity,
        type: primaryType,
        formatted: primaryFormatted,
        isPrimary: true
      }];
    }
    return [];
  });

  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddrHouse, setNewAddrHouse] = useState('');
  const [newAddrArea, setNewAddrArea] = useState('');
  const [newAddrLandmark, setNewAddrLandmark] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');
  const [newAddrDistrict, setNewAddrDistrict] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrType, setNewAddrType] = useState('Home');

  // Payment Methods States
  const [savedCards, setSavedCards] = useState(() => {
    const stored = localStorage.getItem('homigo_payment_cards');
    return stored ? JSON.parse(stored) : [];
  });
  const [savedUpiList, setSavedUpiList] = useState(() => {
    const stored = localStorage.getItem('homigo_payment_upi');
    return stored ? JSON.parse(stored) : [];
  });

  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [cardNo, setCardNo] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [showAddUpiForm, setShowAddUpiForm] = useState(false);
  const [upiId, setUpiId] = useState('');

  // Fallback user object
  const currentUser = user || {
    name: 'Guest User',
    phone: '+91 9315398975',
    email: 'joshiaryan998@gmail.com'
  };

  const isProtected = appliances && appliances.length > 0;
  const isSmartHubConnected = appliances && appliances.some(app => app.iotEnabled);
  const bookingsCount = bookings ? bookings.length : 0;

  const getInitials = (name) => {
    if (!name) return 'H';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Expiration calculation helper
  const calculateExpiry = (app) => {
    // Standard mock starting date: May 15, 2026
    const start = new Date(2026, 4, 15);
    const dur = app.duration ? app.duration.toLowerCase() : '';
    let monthsToAdd = 12;
    if (dur.includes('6m') || dur.includes('6 month')) monthsToAdd = 6;
    else if (dur.includes('9m') || dur.includes('9 month')) monthsToAdd = 9;
    else if (dur.includes('1.5y') || dur.includes('1.5 year') || dur.includes('18 month')) monthsToAdd = 18;
    else if (dur.includes('2y') || dur.includes('2 year') || dur.includes('24 month')) monthsToAdd = 24;
    else if (dur.includes('3y') || dur.includes('3 year') || dur.includes('36 month')) monthsToAdd = 36;

    const expiry = new Date(start.getTime());
    expiry.setMonth(expiry.getMonth() + monthsToAdd);
    return expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Dynamic text file invoice downloader
  const handleDownloadInvoice = (app) => {
    const pDate = new Date(2026, 4, 15).toLocaleDateString('en-IN');
    const expDate = calculateExpiry(app);
    const invoiceNum = generateInvoiceNumber();

    const text = `===================================================
HOMIGO SMART CARE - SUBSCRIPTION INVOICE
===================================================
Invoice No:     ${invoiceNum}
Purchase Date:  ${pDate}
Expiry Date:    ${expDate}
Payment Status: SUCCESSFUL (PAID)

CUSTOMER DETAILS:
-----------------
Customer Name:  ${currentUser.name}
Mobile No:      ${currentUser.phone || 'No Phone Linked'}
Email:          ${currentUser.email || 'No Email Linked'}

SUBSCRIPTION DETAILS:
---------------------
Item Protected:  ${app.name}
Appliance Type:  ${app.type}
Age Cohort:      ${app.age}
AMC Duration:    ${app.duration}
IoT Telemetry:   ${app.iotEnabled ? 'ACTIVE (TinyML Accel Plugs)' : 'STANDARD'}

AMOUNT SUMMARY:
---------------
Base Premium:   ₹${Math.round(app.cost - app.cost * 0.18).toLocaleString('en-IN')}
GST (18%):      ₹${Math.round(app.cost * 0.18).toLocaleString('en-IN')}
---------------------------------------------------
Grand Total:    ₹${app.cost.toLocaleString('en-IN')}
===================================================
This is a verified digital transaction record.
Thank you for choosing HOMIGO. Service on the go!
===================================================`;

    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `HOMIGO_Invoice_${app.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    if (showToast) showToast('Invoice download started!', 'success');
  };

  // Saved addresses book actions
  const handleNewAddrPincodeChange = (val) => {
    const cleanVal = val.replace(/\D/g, '');
    setNewAddrPincode(cleanVal);
    if (cleanVal.length === 6 && lookupPincode) {
      const res = lookupPincode(cleanVal);
      if (res) {
        setNewAddrCity(res.city);
        setNewAddrDistrict(res.district);
        if (showToast) showToast(`Detected: ${res.district}, ${res.city}`, 'info');
      }
    }
  };

  const handleSaveAddress = () => {
    if (savedAddresses.length >= 4) {
      if (showToast) showToast('You can add a maximum of 4 addresses.', 'error');
      return;
    }
    if (!newAddrHouse.trim() || !newAddrArea.trim() || !newAddrPincode.trim() || newAddrPincode.length < 6 || !newAddrDistrict.trim() || !newAddrCity.trim()) {
      if (showToast) showToast('Please fill in all required address fields.', 'error');
      return;
    }

    const formatted = `${newAddrHouse}, ${newAddrArea}${newAddrLandmark ? ', ' + newAddrLandmark : ''}, ${newAddrDistrict ? newAddrDistrict + ', ' : ''}${newAddrCity} - ${newAddrPincode}`;
    const newAddressObj = {
      id: `addr-${Date.now()}`,
      house: newAddrHouse,
      area: newAddrArea,
      landmark: newAddrLandmark,
      district: newAddrDistrict,
      pincode: newAddrPincode,
      city: newAddrCity,
      type: newAddrType,
      formatted,
      isPrimary: savedAddresses.length === 0
    };

    const updated = [...savedAddresses, newAddressObj];
    setSavedAddresses(updated);
    localStorage.setItem('homigo_saved_addresses', JSON.stringify(updated));

    // Reset Address inputs
    setNewAddrHouse('');
    setNewAddrArea('');
    setNewAddrLandmark('');
    setNewAddrPincode('');
    setNewAddrDistrict('');
    setNewAddrCity('');
    setNewAddrType('Home');
    setShowAddAddressForm(false);
    if (showToast) showToast('Address added to your address book!', 'success');
  };

  const handleSetAddressPrimary = (id) => {
    const updated = savedAddresses.map(addr => ({
      ...addr,
      isPrimary: addr.id === id
    }));
    setSavedAddresses(updated);
    localStorage.setItem('homigo_saved_addresses', JSON.stringify(updated));

    const selected = updated.find(addr => addr.id === id);
    if (selected && setUserAddress) {
      setUserAddress(selected.formatted);
      setAddressType(selected.type);
      setAddressHouse(selected.house);
      setAddressArea(selected.area);
      setAddressLandmark(selected.landmark);
      setAddressDistrict(selected.district);
      setAddressPincode(selected.pincode);
      setSelectedCity(selected.city);
      if (showToast) showToast(`Active address set to ${selected.type}!`, 'success');
    }
  };

  const handleDeleteAddress = (id) => {
    const target = savedAddresses.find(addr => addr.id === id);
    if (target && target.isPrimary) {
      if (showToast) showToast('Cannot delete the primary address. Set another address as primary first.', 'error');
      return;
    }
    const updated = savedAddresses.filter(addr => addr.id !== id);
    setSavedAddresses(updated);
    localStorage.setItem('homigo_saved_addresses', JSON.stringify(updated));
    if (showToast) showToast('Address deleted successfully.', 'info');
  };

  // Payment Linker actions
  const handleSaveCard = () => {
    if (!cardNo || cardNo.replace(/\s/g, '').length < 16 || !cardName.trim() || !cardExpiry || !cardCvv || cardCvv.length < 3) {
      if (showToast) showToast('Please enter valid credit/debit card details.', 'error');
      return;
    }
    const cleanNo = cardNo.replace(/\s/g, '');
    const maskedNo = `•••• •••• •••• ${cleanNo.substring(12)}`;
    const newCardObj = {
      id: `card-${Date.now()}`,
      number: cleanNo,
      masked: maskedNo,
      name: cardName,
      expiry: cardExpiry,
      cvv: cardCvv,
      brand: cleanNo.startsWith('4') ? 'Visa' : cleanNo.startsWith('5') ? 'Mastercard' : 'RuPay'
    };

    const updated = [...savedCards, newCardObj];
    setSavedCards(updated);
    localStorage.setItem('homigo_payment_cards', JSON.stringify(updated));

    setCardNo('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
    setShowAddCardForm(false);
    if (showToast) showToast('Card linked to profile successfully!', 'success');
  };

  const handleSaveUpi = () => {
    if (!upiId || !upiId.includes('@')) {
      if (showToast) showToast('Please enter a valid UPI address (e.g. username@upi)', 'error');
      return;
    }
    const newUpiObj = {
      id: `upi-${Date.now()}`,
      vpa: upiId.toLowerCase()
    };

    const updated = [...savedUpiList, newUpiObj];
    setSavedUpiList(updated);
    localStorage.setItem('homigo_payment_upi', JSON.stringify(updated));

    setUpiId('');
    setShowAddUpiForm(false);
    if (showToast) showToast('UPI linked to profile successfully!', 'success');
  };

  const handleDeleteCard = (id) => {
    const updated = savedCards.filter(c => c.id !== id);
    setSavedCards(updated);
    localStorage.setItem('homigo_payment_cards', JSON.stringify(updated));
    if (showToast) showToast('Card unlinked.', 'info');
  };

  const handleDeleteUpi = (id) => {
    const updated = savedUpiList.filter(u => u.id !== id);
    setSavedUpiList(updated);
    localStorage.setItem('homigo_payment_upi', JSON.stringify(updated));
    if (showToast) showToast('UPI ID removed.', 'info');
  };

  const sections = [
    {
      title: 'Plan & Service Profile',
      items: [
        { icon: <FileText size={16} color="var(--brand-primary)" />, label: 'My Active Plans', action: () => setActiveOverlayScreen('active_plans') },
        { icon: <MapPin size={16} color="var(--brand-primary)" />, label: 'Manage Addresses', action: () => setActiveOverlayScreen('addresses') },
        { icon: <CreditCard size={16} color="var(--brand-primary)" />, label: 'Manage Payment Methods', action: () => setActiveOverlayScreen('payments') }
      ]
    },
    {
      title: 'Preferences & Details',
      items: [
        { icon: <Star size={16} color="var(--brand-primary)" />, label: 'My Customer Ratings', action: () => {} },
        { icon: <Settings size={16} color="var(--brand-primary)" />, label: 'System Settings', action: () => setActiveOverlayScreen('settings') },
        { icon: <Info size={16} color="var(--brand-primary)" />, label: 'About Homigo Smart Care', action: () => setActiveOverlayScreen('about') }
      ]
    }
  ];

  const renderOverlayContent = () => {
    switch (activeOverlayScreen) {
      
      case 'bookings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              Track your service scheduling and professional arrivals.
            </p>
            {bookings.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <ClipboardList size={48} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <h4 style={{ margin: 0, fontWeight: 800 }}>No Bookings Yet</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    You have no active or past service bookings.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {bookings.map((b) => (
                  <div key={b.id} className="replicated-card" style={{ padding: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ background: '#eff6ff', color: '#3b82f6', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ClipboardList size={18} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.92rem', display: 'block' }}>{b.appliance}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {b.id}</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '10px',
                        background: b.status === 'Confirmed' ? '#ecfdf5' : 'var(--bg-secondary)',
                        color: b.status === 'Confirmed' ? '#10b981' : 'var(--text-secondary)'
                      }}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Type</span>
                        <strong style={{ color: 'var(--text-primary)', textAlign: 'right' }}>{b.type}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Schedule</span>
                        <strong style={{ color: 'var(--text-primary)', textAlign: 'right' }}>{b.time}</strong>
                      </div>
                      {b.tech && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Professional</span>
                          <strong style={{ color: 'var(--text-primary)', textAlign: 'right' }}>{b.tech}</strong>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Cost</span>
                        <strong style={{ color: b.cost.includes('Covered') ? 'var(--color-success)' : 'var(--text-primary)', textAlign: 'right' }}>{b.cost}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'active_plans':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              Verify active coverage metrics and claim preventative maintenance visits.
            </p>

            {appliances.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <ShieldCheck size={48} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <h4 style={{ margin: 0, fontWeight: 800 }}>No Active Plans</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Purchase subscription shields to protect your appliances.
                  </p>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => { setActiveOverlayScreen(null); changeTab('planner'); }}
                  style={{ padding: '10px 20px', fontSize: '0.8rem', fontWeight: 700 }}
                >
                  🛡️ Design AMC Plan
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {appliances.map((app) => (
                  <div key={app.id} className="replicated-card" style={{ padding: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.6rem' }}>{app.icon || '🛡️'}</span>
                        <div>
                          <strong style={{ fontSize: '0.92rem', display: 'block' }}>{app.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cohort: {app.age}</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '10px',
                        background: '#eefff9',
                        color: 'var(--color-success)'
                      }}>
                        ACTIVE COVER
                      </span>
                    </div>

                    <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ display: 'block', color: 'var(--text-muted)' }}>COVERAGE TERM</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{app.duration}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: 'var(--text-muted)' }}>EXPIRATION DATE</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{calculateExpiry(app)}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button 
                        onClick={() => handleDownloadInvoice(app)}
                        className="btn-secondary" 
                        style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'transparent' }}
                      >
                        <Download size={14} /> Invoice
                      </button>
                      <button 
                        onClick={() => {
                          setActiveOverlayScreen(null);
                          if (onOpenServiceForm) onOpenServiceForm(app);
                        }}
                        className="btn-primary" 
                        style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Activity size={14} /> Request Service
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'addresses':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                Manage saved active addresses (Max 4 locations).
              </p>
              {savedAddresses.length < 4 && !showAddAddressForm && (
                <button 
                  onClick={() => setShowAddAddressForm(true)}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent' }}
                >
                  <Plus size={14} /> Add
                </button>
              )}
            </div>

            {/* Save Address Mini Form */}
            {showAddAddressForm && (
              <div className="replicated-card" style={{ padding: '16px', border: '1.5px solid var(--brand-primary)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>➕ Save New Location</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>House / Flat *</label>
                    <input type="text" placeholder="e.g. 402, Wing B" value={newAddrHouse} onChange={e => setNewAddrHouse(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Area / Street *</label>
                    <input type="text" placeholder="e.g. Dwarka Sec 13" value={newAddrArea} onChange={e => setNewAddrArea(e.target.value)} />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.65rem' }}>Landmark (Optional)</label>
                  <input type="text" placeholder="e.g. Near Seepz Gate" value={newAddrLandmark} onChange={e => setNewAddrLandmark(e.target.value)} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.65rem' }}>Pincode *</label>
                  <input type="text" maxLength={6} placeholder="e.g. 110059" value={newAddrPincode} onChange={e => handleNewAddrPincodeChange(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      District *
                      {newAddrDistrict && (
                        <span style={{ fontSize: '0.55rem', padding: '1px 4px', borderRadius: '3px', background: 'var(--color-success-light)', color: 'var(--color-success)', fontWeight: 800 }}>AUTO</span>
                      )}
                    </label>
                    <input type="text" placeholder="Auto-filled from pincode" value={newAddrDistrict} onChange={e => setNewAddrDistrict(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      City *
                      {newAddrCity && (
                        <span style={{ fontSize: '0.55rem', padding: '1px 4px', borderRadius: '3px', background: 'var(--color-success-light)', color: 'var(--color-success)', fontWeight: 800 }}>AUTO</span>
                      )}
                    </label>
                    <input type="text" placeholder="Auto-filled from pincode" value={newAddrCity} onChange={e => setNewAddrCity(e.target.value)} />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.65rem' }}>Location Label</label>
                  <select value={newAddrType} onChange={e => setNewAddrType(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid var(--border-color)', borderRadius: '8px' }}>
                    <option value="Home">🏠 Home</option>
                    <option value="Office">💼 Office</option>
                    <option value="Other">📍 Other</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button className="btn-secondary" onClick={() => setShowAddAddressForm(false)} style={{ flex: 1, padding: '10px', background: 'transparent' }}>Cancel</button>
                  <button className="btn-primary" onClick={handleSaveAddress} style={{ flex: 1, padding: '10px' }}>Save Address</button>
                </div>
              </div>
            )}

            {/* Saved Addresses list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {savedAddresses.map((addr) => (
                <div key={addr.id} className="replicated-card" style={{ padding: '16px', border: addr.isPrimary ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
                  <div style={{ fontSize: '1.5rem', marginTop: '2px' }}>
                    {addr.type === 'Home' ? '🏠' : addr.type === 'Office' ? '💼' : '📍'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{addr.type}</strong>
                      {addr.isPrimary && (
                        <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontWeight: 800 }}>PRIMARY</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4, wordBreak: 'break-word' }}>
                      {addr.formatted}
                    </p>

                    <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
                      {!addr.isPrimary && (
                        <button 
                          onClick={() => handleSetAddressPrimary(addr.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '0.75rem', fontWeight: 700, padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          Use Primary
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteAddress(addr.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 600, padding: 0, cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {savedAddresses.length === 0 && (
                <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No saved addresses found.</span>
              )}
              
              {savedAddresses.length >= 4 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  ℹ️ You have reached the maximum of 4 addresses in your address book.
                </div>
              )}
            </div>
          </div>
        );

      case 'payments':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              Pre-link your payments to enable seamless checkouts inside the Shield booking window.
            </p>

            {/* UPI Option Wrapper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>UPI Profiles</h4>
                {!showAddUpiForm && (
                  <button onClick={() => setShowAddUpiForm(true)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px', background: 'transparent' }}>
                    <Plus size={12} /> Link UPI
                  </button>
                )}
              </div>

              {showAddUpiForm && (
                <div className="replicated-card" style={{ padding: '14px', border: '1px solid var(--brand-primary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Enter UPI ID (VPA) *</label>
                    <input type="text" placeholder="e.g. username@okhdfcbank" value={upiId} onChange={e => setUpiId(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" onClick={() => setShowAddUpiForm(false)} style={{ flex: 1, padding: '6px', fontSize: '0.75rem', background: 'transparent' }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSaveUpi} style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}>Link Account</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savedUpiList.map((upi) => (
                  <div key={upi.id} className="replicated-card" style={{ padding: '12px 14px', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.3rem' }}>⚡</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{upi.vpa}</span>
                    </div>
                    <button onClick={() => handleDeleteUpi(upi.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {savedUpiList.length === 0 && (
                  <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No linked UPI profiles.</span>
                )}
              </div>
            </div>

            {/* Credit Cards Wrapper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cards Book</h4>
                {!showAddCardForm && (
                  <button onClick={() => setShowAddCardForm(true)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px', background: 'transparent' }}>
                    <Plus size={12} /> Link Card
                  </button>
                )}
              </div>

              {showAddCardForm && (
                <div className="replicated-card" style={{ padding: '14px', border: '1px solid var(--brand-primary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Card Number *</label>
                    <input 
                      type="text" 
                      placeholder="16-digit card number" 
                      maxLength={19}
                      value={cardNo} 
                      onChange={e => {
                        const clean = e.target.value.replace(/\D/g, '');
                        // Format into chunks of 4 digits
                        const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
                        setCardNo(formatted);
                      }} 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.65rem' }}>Expiry (MM/YY) *</label>
                      <input type="text" placeholder="MM/YY" maxLength={5} value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.65rem' }}>CVV *</label>
                      <input type="password" placeholder="3 digits" maxLength={3} value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))} />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.65rem' }}>Cardholder Name *</label>
                    <input type="text" placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)} />
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" onClick={() => setShowAddCardForm(false)} style={{ flex: 1, padding: '6px', fontSize: '0.75rem', background: 'transparent' }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSaveCard} style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}>Link Card</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savedCards.map((card) => (
                  <div key={card.id} className="replicated-card" style={{ padding: '14px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.4rem' }}>💳</span>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>{card.brand} ({card.masked})</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Exp: {card.expiry} | {card.name}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCard(card.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {savedCards.length === 0 && (
                  <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No linked Credit or Debit cards.</span>
                )}
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              Adjust user interface themes. Changes apply across the entire application interface instantly.
            </p>

            <div className="replicated-card" style={{ padding: '18px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem' }}>Color Palette Settings</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dynamic contrast swapping with persistent memory.</span>
              
              <div style={{ display: 'flex', gap: '14px', marginTop: '16px' }}>
                <div 
                  onClick={() => setAppTheme('light')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '12px',
                    background: appTheme === 'light' ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                    border: `2px solid ${appTheme === 'light' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-primary)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Sun size={24} style={{ color: appTheme === 'light' ? 'var(--brand-primary)' : 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Light Mode</span>
                </div>

                <div 
                  onClick={() => setAppTheme('dark')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '12px',
                    background: appTheme === 'dark' ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                    border: `2px solid ${appTheme === 'dark' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-primary)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Moon size={24} style={{ color: appTheme === 'dark' ? 'var(--brand-primary)' : 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Dark Mode</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'about':
        return <BusinessPitch />;

      default:
        return null;
    }
  };

  const getOverlayTitle = () => {
    switch (activeOverlayScreen) {
      case 'active_plans': return 'My Active Plans';
      case 'bookings': return 'My Service Bookings';
      case 'addresses': return 'Manage Addresses';
      case 'payments': return 'Manage Payments';
      case 'settings': return 'System Settings';
      case 'about': return 'About Homigo Smart Care';
      default: return '';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>

      {/* ── STICKY CURTAIN HEADER ─────────────────────────────────
           position:sticky + top:0 inside the scroll viewport.
           Uses 100% opaque var(--bg-primary) so content scrolls UP
           and disappears completely behind it without transparent overlaps.
      ──────────────────────────────────────────────────────────── */}
      {!activeOverlayScreen && (
        <div className="account-curtain-header" style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 20px 14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 850,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              Profile
            </h1>
            <p style={{
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              margin: '2px 0 0 0',
              letterSpacing: '0.01em'
            }}>
              Account Details &amp; Settings
            </p>
          </div>

          {/* Orange accent dot — brand touch */}
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--brand-primary)',
            boxShadow: '0 0 0 3px rgba(243,112,33,0.15)'
          }} />
        </div>
      )}

      {/* 1. Main Account Menu Panel (Visible when no overlay is active) */}
      <div style={{ 
        display: activeOverlayScreen ? 'none' : 'block',
        padding: '20px 20px 100px 20px',
        textAlign: 'left',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Profile Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%)',
          borderRadius: '16px',
          padding: '24px 20px',
          color: '#ffffff',
          marginBottom: '26px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(30, 27, 75, 0.12)'
        }}>
          {/* Glowing background circles */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'rgba(247, 147, 30, 0.12)',
            filter: 'blur(20px)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f7931e 0%, #f05a28 100%)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(247, 147, 30, 0.25)',
              flexShrink: 0
            }}>
              {getInitials(currentUser.name)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 5px 0', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                  Mobile: {currentUser.phone || 'No Mobile Linked'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Email: {currentUser.email || 'No Email Linked'}
                </span>
              </div>
            </div>

            <button style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'background 0.2s'
            }}>
              <Edit2 size={15} />
            </button>
          </div>

          {/* Telemetry Stats Strip */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '10px',
            padding: '10px 8px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>Protection</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 800, color: isProtected ? '#10b981' : '#ef4444', marginTop: '3px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isProtected ? '#10b981' : '#ef4444' }} /> {isProtected ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>Smart Hub</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 800, color: isSmartHubConnected ? '#f7931e' : '#ef4444', marginTop: '3px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSmartHubConnected ? '#f7931e' : '#ef4444' }} className={isSmartHubConnected ? "pulse-orange" : ""} /> {isSmartHubConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>Services</span>
              <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#3b82f6', marginTop: '3px' }}>
                📋 {bookingsCount} Booked
              </span>
            </div>
          </div>
        </div>

        {/* Smart Care Widgets */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Smart Care Hub
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div 
              onClick={() => setActiveOverlayScreen('bookings')}
              style={{
                background: 'var(--bg-primary)',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s'
              }}
            >
              <div style={{ background: '#eff6ff', color: '#3b82f6', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0, justifyContent: 'center' }}>
                <ClipboardList size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>My Service Bookings</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Track scheduling and professional arrivals</div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#3b82f6' }} />
            </div>

            <div 
              onClick={() => changeTab('feed')}
              style={{
                background: 'var(--bg-primary)',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s'
              }}
            >
              <div style={{ background: '#fff7ed', color: '#f97316', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0, justifyContent: 'center' }}>
                <Cpu size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  IoT Sensors Telemetry
                  <span className="pulse-orange" style={{ width: '6px', height: '6px', display: 'inline-block', borderRadius: '50%', background: '#f97316' }} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Monitor voltage, temperature & filter health</div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#f97316' }} />
            </div>

            <div 
              style={{
                background: 'var(--bg-primary)',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s'
              }}
            >
              <div style={{ background: '#ecfdf5', color: '#10b981', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0, justifyContent: 'center' }}>
                <HeadphonesIcon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>Help & Support Care</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Chat with vetting team or raise breakdown tickets</div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#10b981' }} />
            </div>
          </div>
        </div>

        {/* Profile Settings Options */}
        <div>
          {sections.map((sec, i) => (
            <div key={i} style={{ marginBottom: '24px' }}>
              <h3 className="account-section-sticky-label">
                {sec.title}
              </h3>
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '14px',
                padding: '6px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {sec.items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={item.action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: 'var(--bg-primary)',
                      border: '1px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      background: 'var(--bg-secondary)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      {item.icon}
                    </div>
                    <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.label}
                    </span>
                    <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Log Out Action Button */}
        <div style={{ marginTop: '32px' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1.5px solid rgba(239, 68, 68, 0.25)',
              color: 'var(--color-danger)',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = 'var(--color-danger)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

      {/* 2. Separate Full-Screen Overlay Window (Rendered with smooth Page transition) */}
      {activeOverlayScreen && (
        <div className="tab-fade-in account-overlay-window" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-primary)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'left'
        }}>
          {/* Compact sticky label layer */}
          <div className="account-sticky-header-shell">
            <button 
              className="account-sticky-back-btn"
              onClick={() => {
                setShowAddAddressForm(false);
                setShowAddCardForm(false);
                setShowAddUpiForm(false);
                setActiveOverlayScreen(null);
              }}
              aria-label="Back to account"
            >
              <ArrowLeft size={22} />
            </button>
            <h2 className="account-sticky-title-pill">
              {getOverlayTitle()}
            </h2>
          </div>

          {/* Overlay Body container */}
          <div className="account-overlay-scrollbody" style={{ 
            flex: 1, 
            overflowY: 'auto',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)'
          }}>
            {renderOverlayContent()}
          </div>
        </div>
      )}
    </div>
  );
}
