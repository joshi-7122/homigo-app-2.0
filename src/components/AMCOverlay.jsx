import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Download, Calendar, Activity, Wrench, ShieldAlert, AlertTriangle, Clock, Phone, User } from 'lucide-react';
import { jsPDF } from 'jspdf';

function generateFallbackReceiptInfo(app, user) {
  const baseCost = app.cost || 1200;
  const durationMonths = app.duration.includes('6m') || app.duration.includes('6 Months') ? 6 :
                         app.duration.includes('9m') || app.duration.includes('9 Months') ? 9 :
                         app.duration.includes('1.5y') || app.duration.includes('1.5 Years') ? 18 :
                         app.duration.includes('2y') || app.duration.includes('2 Years') ? 24 : 36;
  const taxAmount = Math.round(baseCost - baseCost / 1.18);
  const basePrice = baseCost - taxAmount;
  const currentId = `REC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const gatewayRef = `PAYREF-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const custId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
  const planId = `PLAN-${app.id.split('-')[0].toUpperCase()}-${app.duration.split(' ')[0].toUpperCase()}`;

  const d = new Date();
  d.setMonth(d.getMonth() + durationMonths);
  const expiryDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return {
    receiptId: currentId,
    customerId: custId,
    fullName: user?.name || 'Valued Customer',
    email: user?.email || 'customer@homigo.com',
    phoneNumber: '9876543210',
    billingAddress: '102, Skyline Towers, Andheri West, Mumbai, 400053 (HOME)',
    planId: planId,
    planName: `${app.brand} ${app.type} Cover`,
    basePrice: basePrice,
    durationMonths: durationMonths,
    taxAmount: taxAmount,
    totalAmount: baseCost,
    expiryDate: expiryDate,
    paymentMethodName: 'UPI Payment',
    gatewayRef: gatewayRef,
    transactionDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  };
}

export default function AMCOverlay({ isOpen, onClose, appliances, bookings, user, onBookService, onGoToPlanner, onAddBooking }) {
  // Booking states
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [bookingName, setBookingName] = useState(user?.name || '');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('Tomorrow');
  const [bookingTime, setBookingTime] = useState('Morning (09:00 AM - 12:00 PM)');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccessInfo, setBookingSuccessInfo] = useState(null);

  // Auto-fill user name if it becomes available or changes
  useEffect(() => {
    if (user?.name) {
      const timer = setTimeout(() => {
        setBookingName(user.name);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Submit Booking Form
  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!bookingPhone || !/^\d{10}$/.test(bookingPhone)) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    const ticketId = `HMGO-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      id: ticketId,
      appliance: selectedApp.name,
      type: 'AMC Scheduled Maintenance Visit',
      time: `Scheduled: ${bookingDate} | Slot: ${bookingTime}`,
      status: 'Confirmed',
      tech: 'Rahul Kumar (Vetted Professional)',
      cost: '₹0 (Covered under AMC)',
      customerName: bookingName,
      customerPhone: bookingPhone,
      appointmentDate: bookingDate,
      appointmentSlot: bookingTime,
      notes: bookingNotes
    };

    if (onAddBooking) {
      onAddBooking(newBooking);
    }

    setBookingSuccessInfo({
      ticketId,
      date: bookingDate,
      slot: bookingTime,
      techName: 'Rahul Kumar (Vetted Professional)'
    });

    setShowBookingForm(false);
  };

  // Helper to format date
  const getExpiryDate = (durationStr) => {
    const months = durationStr.includes('6m') || durationStr.includes('6 Months') ? 6 :
                   durationStr.includes('9m') || durationStr.includes('9 Months') ? 9 :
                   durationStr.includes('1.5y') || durationStr.includes('1.5 Years') ? 18 :
                   durationStr.includes('2y') || durationStr.includes('2 Years') ? 24 : 36;
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getBookedServicesCount = (appName) => {
    const safeAppName = (appName || '').toLowerCase();
    return bookings.filter(b => {
      const safeBApp = (b.appliance || b.applianceName || b.name || '').toLowerCase();
      return safeBApp.includes(safeAppName) || safeAppName.includes(safeBApp);
    }).length;
  };

  // PDF Download Helper
  const downloadReceipt = (app) => {
    let receiptInfo = app.payment?.receiptInfo;
    const baseCost = app.cost || 1200;

    if (!receiptInfo) {
      receiptInfo = generateFallbackReceiptInfo(app, user);
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [243, 112, 33]; 
    const darkColor = [26, 28, 41];     
    const grayColor = [82, 86, 102];    
    const lightGray = [229, 229, 231];  

    doc.setProperties({
      title: `HOMIGO-Receipt-${receiptInfo.receiptId}`,
      subject: 'AMC Protection Plan Tax Invoice',
      author: 'HOMIGO',
      keywords: 'invoice, amc, receipt, homigo'
    });

    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('HOMI', 15, 25);
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('GO', 38, 25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('SERVICE ON THE GO', 15, 29);

    doc.setFontSize(16);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('TAX INVOICE / RECEIPT', 195, 25, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Original copy for Recipient', 195, 29, { align: 'right' });

    doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setLineWidth(0.6);
    doc.line(15, 33, 195, 33);

    doc.setFontSize(9);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('CUSTOMER DETAILS (BILL TO)', 15, 42);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    let y = 48;
    doc.text(`Customer ID:  ${receiptInfo.customerId}`, 15, y);
    doc.text(`Full Name:     ${receiptInfo.fullName}`, 15, y + 6);
    doc.text(`Phone:          ${receiptInfo.phoneNumber}`, 15, y + 12);
    doc.text(`Email:          ${receiptInfo.email}`, 15, y + 18);
    
    doc.text('Billing Address:', 15, y + 24);
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    const splitAddress = doc.splitTextToSize(receiptInfo.billingAddress, 80);
    doc.text(splitAddress, 15, y + 29);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('TRANSACTION DETAILS', 115, 42);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`Receipt ID:      ${receiptInfo.receiptId}`, 115, y);
    doc.text(`Date:             ${receiptInfo.transactionDate}`, 115, y + 6);
    doc.text(`Plan Expiry:     ${receiptInfo.expiryDate}`, 115, y + 12);
    doc.text(`Gateway Ref:    ${receiptInfo.gatewayRef}`, 115, y + 18);
    doc.text(`Payment Mode:  ${receiptInfo.paymentMethodName}`, 115, y + 24);
    
    const status = (receiptInfo.paymentMethodName || '').includes('COD') ? 'Pending COD Verification' : 'Successful';
    doc.text('Status:', 115, y + 30);
    if (status === 'Successful') {
      doc.setTextColor(0, 178, 118); 
    } else {
      doc.setTextColor(243, 112, 33); 
    }
    doc.setFont('helvetica', 'bold');
    doc.text(status, 128, y + 30);

    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(0.2);
    doc.line(15, 100, 195, 100);

    const tableY = 108;
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(15, tableY, 180, 8, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('PLAN ID', 17, tableY + 5.5);
    doc.text('PLAN DESCRIPTION', 50, tableY + 5.5);
    doc.text('DURATION', 110, tableY + 5.5);
    doc.text('BASE PRICE', 140, tableY + 5.5, { align: 'right' });
    doc.text('GST (18%)', 165, tableY + 5.5, { align: 'right' });
    doc.text('TOTAL', 193, tableY + 5.5, { align: 'right' });

    const rowY = tableY + 16;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    
    doc.setFont('courier', 'bold');
    doc.text(receiptInfo.planId, 17, rowY);
    
    doc.setFont('helvetica', 'normal');
    doc.text(receiptInfo.planName, 50, rowY);
    doc.setFontSize(7.5);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Full repair visit & parts cost shield', 50, rowY + 4);
    
    doc.setFontSize(8.5);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`${receiptInfo.durationMonths} Months`, 110, rowY);
    doc.text(`Rs ${receiptInfo.basePrice.toLocaleString('en-IN')}`, 140, rowY, { align: 'right' });
    doc.text(`Rs ${receiptInfo.taxAmount.toLocaleString('en-IN')}`, 165, rowY, { align: 'right' });
    doc.text(`Rs ${baseCost.toLocaleString('en-IN')}`, 193, rowY, { align: 'right' });

    const finalRowY = rowY + 10;

    doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setLineWidth(0.4);
    doc.line(15, finalRowY, 195, finalRowY);

    const totalX = 145;
    const totalYStart = finalRowY + 10;
    doc.setFontSize(8.5);
    
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Net Amount:', totalX, totalYStart);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`Rs ${receiptInfo.basePrice.toLocaleString('en-IN')}`, 193, totalYStart, { align: 'right' });

    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Integrated GST (18%):', totalX, totalYStart + 6);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`Rs ${receiptInfo.taxAmount.toLocaleString('en-IN')}`, 193, totalYStart + 6, { align: 'right' });

    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.6);
    doc.line(totalX, totalYStart + 10, 195, totalYStart + 10);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Grand Total:', totalX, totalYStart + 16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Rs ${receiptInfo.totalAmount.toLocaleString('en-IN')}`, 193, totalYStart + 16, { align: 'right' });

    const footerY = 250;
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(0.2);
    doc.line(15, footerY, 195, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Terms & Conditions:', 15, footerY + 6);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    const termsText = 'Coverage is subject to the HOMIGO Master AMC Service Agreement. Telemetry-linked smart plugs must remain active for 24/7 predictive component monitoring. For cancellation and refund rules, contact priority support via the Live Chat panel.';
    const splitTerms = doc.splitTextToSize(termsText, 180);
    doc.text(splitTerms, 15, footerY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Thank you for trusting HOMIGO to protect your home!', 105, footerY + 24, { align: 'center' });

    doc.save(`HOMIGO-Receipt-${receiptInfo.receiptId}.pdf`);
  };

  const cumulativePremium = appliances.reduce((sum, app) => sum + (app.cost || 0), 0);
  const totalValueProtected = appliances.reduce((sum, app) => sum + (app.purchasePrice || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '850px', 
          width: '90%', 
          padding: '24px', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          textAlign: 'left'
        }}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ background: 'var(--brand-primary-light)', padding: '10px', borderRadius: '50%', color: 'var(--brand-primary)' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>AMC Protection Shield</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Professional subscriber dashboard for active coverage policies and billing records.
            </p>
          </div>
        </div>

        {appliances.length === 0 ? (
          /* Empty State */
          <div style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <ShieldAlert size={60} style={{ color: 'var(--text-muted)', strokeWidth: 1.5 }} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>No Active Protection Policies</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto', lineHeight: 1.6 }}>
                You haven't purchased any AMC protection shields yet. Protect your home appliances from costly diagnostic fees, hardware failures, and breakdowns under a single unified plan.
              </p>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => {
                onClose();
                onGoToPlanner();
              }}
              style={{ padding: '12px 30px', fontWeight: 700 }}
            >
              🛡️ Create & Buy Protection Plan
            </button>
          </div>
        ) : (
          /* Dashboard Content */
          <div>
            {/* Stats Row */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '16px', 
              marginBottom: '24px' 
            }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>ACTIVE PLANS</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{appliances.length} Devices</span>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>TOTAL SERVICES BOOKED</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{bookings.length} Tickets</span>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>TOTAL VALUE COVERED</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)' }}>₹{totalValueProtected.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>AMC FEES PAID</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{cumulativePremium.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* List of plans */}
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              Subscribed Assets & Contracts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {appliances.map((app) => {
                const bookedCount = getBookedServicesCount(app.name);
                const expiryDate = app.payment?.receiptInfo?.expiryDate || getExpiryDate(app.duration);
                const isIot = app.iotEnabled;

                return (
                  <div 
                    key={app.id} 
                    style={{ 
                      border: '1.5px solid var(--border-color)', 
                      borderRadius: '12px', 
                      background: 'var(--bg-primary)',
                      padding: '20px',
                      transition: 'border-color 0.2s ease',
                      position: 'relative'
                    }}
                    className="hover-card-accent"
                  >
                    {/* Status Badge */}
                    <span style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      fontSize: '0.7rem',
                      padding: '4px 8px',
                      borderRadius: '20px',
                      fontWeight: 700,
                      background: 'var(--color-success-light)',
                      color: 'var(--color-success)',
                      textTransform: 'uppercase'
                    }}>
                      Shield Active
                    </span>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
                      {/* Icon & Details */}
                      <div style={{ fontSize: '2.5rem', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '12px', minWidth: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {app.icon}
                      </div>

                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>{app.name}</h4>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <span>Brand: <strong style={{ color: 'var(--text-primary)' }}>{app.brand}</strong></span>
                          <span>Timeline Cohort: <strong style={{ color: 'var(--text-primary)' }}>{app.age}</strong></span>
                          <span>Asset Price: <strong style={{ color: 'var(--text-primary)' }}>₹{(app.purchasePrice || 0).toLocaleString('en-IN')}</strong></span>
                        </div>

                        {/* Plan Specs */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px 16px', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>COVERAGE EXPIRE DATE</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Calendar size={14} style={{ color: 'var(--brand-primary)' }} />
                              {expiryDate}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>BOOKED VISITS HISTORY</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Wrench size={14} style={{ color: 'var(--brand-primary)' }} />
                              {bookedCount === 0 ? '0 Booked visits' : `${bookedCount} Services active`}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>AMC CONTRACT VALUE</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '2px', display: 'block' }}>
                              ₹{(app.cost || 0).toLocaleString('en-IN')} ({app.duration.split(' ')[0]} plan)
                            </span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>SHIELD LEVEL</span>
                            <span style={{ color: isIot ? 'var(--brand-primary)' : 'var(--color-success)', fontWeight: 700, marginTop: '2px', display: 'block' }}>
                              {isIot ? '⚡ Premium IoT Monitored' : '🛡️ Standard Protection'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div style={{ 
                      marginTop: '16px', 
                      paddingTop: '14px', 
                      borderTop: '1px solid var(--border-color)', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        <span className="pulse-green" />
                        <span>Coverage status: Online and Vetted</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => downloadReceipt(app)}
                          className="btn-secondary" 
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            borderColor: 'var(--brand-primary)',
                            color: 'var(--brand-primary)'
                          }}
                        >
                          <Download size={12} /> Invoice Receipt (PDF)
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedApp(app);
                            setBookingPhone('');
                            setBookingDate('Tomorrow');
                            setBookingTime('Morning (09:00 AM - 12:00 PM)');
                            setBookingNotes('');
                            setShowBookingForm(true);
                          }}
                          className="btn-primary" 
                          style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          🔧 Book AMC Service Visit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* AMC Service Booking Modal Overlay */}
      {showBookingForm && selectedApp && (
        <div 
          className="modal-overlay" 
          onClick={(e) => e.stopPropagation()} 
          style={{ background: 'rgba(26,28,41,0.65)', zIndex: 1100 }}
        >
          <div 
            className="modal-content" 
            style={{ 
              maxWidth: '480px', 
              padding: '24px', 
              boxShadow: 'var(--shadow-lg)',
              border: '1.5px solid var(--brand-primary)',
              background: 'var(--bg-primary)',
              textAlign: 'left'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--brand-primary-light)', padding: '8px', borderRadius: '50%', color: 'var(--brand-primary)' }}>
                <Wrench size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Schedule AMC Service</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Book Covered Maintenance Visit</span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Schedule a cashless maintenance or repair service visit for your <strong style={{ color: 'var(--text-primary)' }}>{selectedApp.name}</strong>. This visit is 100% covered under your active AMC plan.
            </p>

            {/* Form */}
            <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>CONTACT NAME</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder="Enter customer name"
                    style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '36px', width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>MOBILE NO.</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '36px', width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>PREFERRED SERVICE DATE</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['Tomorrow', 'Day After', 'Monday'].map((dateOpt) => (
                    <button
                      key={dateOpt}
                      type="button"
                      onClick={() => setBookingDate(dateOpt)}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        border: bookingDate === dateOpt ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                        background: bookingDate === dateOpt ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                        color: bookingDate === dateOpt ? 'var(--brand-primary)' : 'var(--text-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {dateOpt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>PREFERRED TIME SLOT</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    'Morning (09:00 AM - 12:00 PM)',
                    'Afternoon (12:00 PM - 03:00 PM)',
                    'Evening (03:00 PM - 06:00 PM)'
                  ].map((slotOpt) => (
                    <button
                      key={slotOpt}
                      type="button"
                      onClick={() => setBookingTime(slotOpt)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        textAlign: 'left',
                        border: bookingTime === slotOpt ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                        background: bookingTime === slotOpt ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                        color: bookingTime === slotOpt ? 'var(--brand-primary)' : 'var(--text-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Clock size={12} />
                      {slotOpt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>SPECIAL OBSERVATIONS</label>
                <textarea 
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g. Regular maintenance, unusual sound, low efficiency..."
                  style={{ fontSize: '0.8rem', padding: '8px', minHeight: '60px', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%' }}
                />
              </div>

              {/* Pricing / Callout Info */}
              <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', border: '1px dashed var(--border-color)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>ESTIMATED COST</span>
                <span style={{ fontWeight: 800, color: 'var(--color-success)' }}>₹0 (Covered under AMC)</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false);
                  }}
                  className="btn-secondary" 
                  style={{ flex: 1, height: '38px', fontSize: '0.8rem', fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary" 
                  style={{ flex: 1, height: '38px', fontSize: '0.8rem', fontWeight: 700 }}
                >
                  Confirm Booking
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Booking Confirmation Success Popup */}
      {bookingSuccessInfo && (
        <div 
          className="modal-overlay" 
          onClick={(e) => e.stopPropagation()} 
          style={{ background: 'rgba(26,28,41,0.65)', zIndex: 1200 }}
        >
          <div 
            className="modal-content" 
            style={{ 
              maxWidth: '440px', 
              padding: '30px 24px', 
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)'
            }}
          >
            <div style={{
              background: 'var(--color-success-light)',
              color: 'var(--color-success)',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '2rem'
            }}>
              ✓
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Booking Confirmed!</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Your AMC service visit has been successfully scheduled. Cashless maintenance dispatch is active.
            </p>

            <div style={{ 
              background: 'var(--bg-secondary)', 
              padding: '14px', 
              borderRadius: '8px', 
              textAlign: 'left', 
              fontSize: '0.78rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '24px',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem' }}>BOOKING TICKET ID</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{bookingSuccessInfo.ticketId}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem' }}>SCHEDULED ARRIVAL</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{bookingSuccessInfo.date} | {bookingSuccessInfo.slot}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem' }}>SERVICE PROFESSIONAL</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{bookingSuccessInfo.techName}</span>
              </div>
            </div>

            <button 
              onClick={() => setBookingSuccessInfo(null)}
              className="btn-primary" 
              style={{ width: '100%', padding: '12px', fontWeight: 700 }}
            >
              Return to Protection Shield
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
