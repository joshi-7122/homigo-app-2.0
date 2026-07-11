import React, { useLayoutEffect, useState } from 'react';
import { 
  ChevronLeft, 
  CreditCard, 
  Landmark, 
  Smartphone, 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  Home as HomeIcon, 
  HelpCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { lookupPincode } from '../utils/pincodeDb';

export default function CheckoutWizard({ appliances, appliance, user, onComplete, onCancel }) {
  // step: 1=select address, '1b'=new address form, 2=payment, 3=processing, 4=receipt
  const [step, setStep] = useState(1);

  useLayoutEffect(() => {
    const resetCheckoutScroll = () => {
      const viewport = document.querySelector('.phone-screen-viewport');
      if (viewport) {
        viewport.scrollTop = 0;
      }

      const mainScroller = document.querySelector('main');
      if (mainScroller) {
        mainScroller.scrollTop = 0;
      }

      window.scrollTo(0, 0);
    };

    resetCheckoutScroll();
    requestAnimationFrame(resetCheckoutScroll);
    setTimeout(resetCheckoutScroll, 0);
    setTimeout(resetCheckoutScroll, 80);
  }, [step]);

  // Saved database helpers — mirrors Account.jsx's loading logic exactly
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem('homigo_saved_addresses');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed;
      }
      // Fallback: build from individual address keys (set via home header)
      const primaryHouse    = localStorage.getItem('homigo_address_house') || '';
      const primaryArea     = localStorage.getItem('homigo_address_area') || '';
      const primaryLandmark = localStorage.getItem('homigo_address_landmark') || '';
      const primaryDistrict = localStorage.getItem('homigo_address_district') || '';
      const primaryPincode  = localStorage.getItem('homigo_address_pincode') || '';
      const primaryCity     = localStorage.getItem('homigo_selected_city') || '';
      const primaryType     = localStorage.getItem('homigo_address_type') || 'Home';
      const primaryFormatted= localStorage.getItem('homigo_user_address') || '';

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
    } catch (_) {
      return [];
    }
  });

  // Pre-select the primary (or first) address
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    try {
      const stored = localStorage.getItem('homigo_saved_addresses');
      if (stored) {
        const list = JSON.parse(stored);
        if (list.length > 0) {
          const primary = list.find(a => a.isPrimary);
          return primary ? primary.id : list[0].id;
        }
      }
      // If fell back to individual keys, the constructed entry has id 'primary'
      const primaryHouse = localStorage.getItem('homigo_address_house') || '';
      const primaryPincode = localStorage.getItem('homigo_address_pincode') || '';
      if (primaryHouse && primaryPincode) return 'primary';
      return null;
    } catch (_) { return null; }
  });


  const [savedCards] = useState(() => {
    try {
      const stored = localStorage.getItem('homigo_payment_cards');
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  });

  const [savedUpiList] = useState(() => {
    try {
      const stored = localStorage.getItem('homigo_payment_upi');
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  });

  const [detectedCity, setDetectedCity] = useState('');
  const [detectedDistrict, setDetectedDistrict] = useState('');



  // Address Form States
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [mobileNo, setMobileNo] = useState(() => {
    const raw = user?.phone || '';
    const clean = raw.replace(/\D/g, '');
    return clean.length >= 10 ? clean.slice(-10) : clean;
  });
  const [alternateNo, setAlternateNo] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressType, setAddressType] = useState('home'); // home, office, other
  const [formErrors, setFormErrors] = useState({});

  // Payment Gateway States
  const [paymentMethod, setPaymentMethod] = useState(''); // upi, card, netbanking, paylater_online, paylater_cash
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [paymentErrors, setPaymentErrors] = useState({});

  // Simulated Loader States
  const [loaderStep, setLoaderStep] = useState(0); // 0: connecting, 1: authenticating, 2: success

  // Normalize single appliance or bulk array
  const items = appliances || (appliance ? [appliance] : []);

  // Base plan cost
  const baseCost = items.reduce((sum, item) => sum + ((item.cost || 0) * (item.quantity || 1)), 0);
  // Convenice fee logic
  const convenienceFee = (paymentMethod === 'paylater_online' || paymentMethod === 'paylater_cash') ? 9 : 0;
  const totalAmount = baseCost + convenienceFee;

  // Called when user confirms a saved address → skip form, go to payment
  const handleUseSavedAddress = () => {
    const addr = savedAddresses.find(a => a.id === selectedAddressId);
    if (!addr) return;
    setAddress(`${addr.house}, ${addr.area}`);
    setLandmark(addr.landmark || '');
    setPincode(addr.pincode);
    setAddressType(addr.type.toLowerCase());
    setDetectedCity(addr.city || '');
    setDetectedDistrict(addr.district || '');
    setStep(2);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!customerName.trim()) errors.customerName = 'Name is required';
    if (!mobileNo.trim()) {
      errors.mobileNo = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(mobileNo)) {
      errors.mobileNo = 'Enter a valid 10-digit mobile number';
    }
    if (alternateNo.trim() && !/^\d{10}$/.test(alternateNo)) {
      errors.alternateNo = 'Enter a valid 10-digit alternate number';
    }
    if (!address.trim()) errors.address = 'Address is required';
    if (!landmark.trim()) errors.landmark = 'Landmark is required';
    if (!pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(pincode)) {
      errors.pincode = 'Enter a valid 6-digit pincode';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setStep(2);
  };

  const getDurationMonths = (durationStr) => {
    if (durationStr.includes('6m') || durationStr.includes('6 Months')) return 6;
    if (durationStr.includes('9m') || durationStr.includes('9 Months')) return 9;
    if (durationStr.includes('1.5y') || durationStr.includes('1.5 Years')) return 18;
    if (durationStr.includes('2y') || durationStr.includes('2 Years')) return 24;
    if (durationStr.includes('3y') || durationStr.includes('3 Years')) return 36;
    return 12; // default fallback
  };

  const getExpiryDate = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const downloadPDFReceipt = () => {
  if (!receiptInfo) return;

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

  const status = receiptInfo.paymentMethodName.includes('COD') ? 'Pending COD Verification' : 'Successful';
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

  let currentRowY = tableY + 16;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

  const receiptItems = receiptInfo.items || [{
    planId: receiptInfo.planId,
    name: receiptInfo.planName,
    durationMonths: receiptInfo.durationMonths,
    basePrice: receiptInfo.basePrice,
    taxAmount: receiptInfo.taxAmount,
    cost: baseCost
  }];

  receiptItems.forEach((item) => {
    doc.setFont('courier', 'bold');
    doc.text(item.planId, 17, currentRowY);

    doc.setFont('helvetica', 'normal');
    doc.text(item.name, 50, currentRowY);
    doc.setFontSize(7.5);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Full repair visit & parts cost shield', 50, currentRowY + 4);

    doc.setFontSize(8.5);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`${item.durationMonths} Months`, 110, currentRowY);
    doc.text(`Rs ${item.basePrice.toLocaleString('en-IN')}`, 140, currentRowY, { align: 'right' });
    doc.text(`Rs ${item.taxAmount.toLocaleString('en-IN')}`, 165, currentRowY, { align: 'right' });
    doc.text(`Rs ${item.cost.toLocaleString('en-IN')}`, 193, currentRowY, { align: 'right' });

    currentRowY += 12;
  });

  let finalRowY = currentRowY;

  if (convenienceFee > 0) {
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.line(15, currentRowY - 4, 195, currentRowY - 4);

    const convY = currentRowY + 2;
    doc.setFont('courier', 'normal');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('-', 17, convY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Pay Later Convenience Fee', 50, convY);
    doc.setFontSize(7.5);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Handling & offline validation fee', 50, convY + 4);

    doc.setFontSize(8.5);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('-', 110, convY);
    doc.text('Rs 9', 140, convY, { align: 'right' });
    doc.text('Rs 0', 165, convY, { align: 'right' });
    doc.text('Rs 9', 193, convY, { align: 'right' });

    finalRowY = convY + 10;
  }

  doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setLineWidth(0.4);
  doc.line(15, finalRowY, 195, finalRowY);

  const totalX = 145;
  const totalYStart = finalRowY + 10;
  doc.setFontSize(8.5);

  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('Net Amount:', totalX, totalYStart);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(`Rs ${(receiptInfo.basePrice + (convenienceFee > 0 ? 9 : 0)).toLocaleString('en-IN')}`, 193, totalYStart, { align: 'right' });

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

  const [receiptInfo, setReceiptInfo] = useState(null);

  const transitionToReceipt = () => {
    const receiptItems = items.map(item => {
      const qty = item.quantity || 1;
      const totalItemCost = item.cost * qty;
      const durationMonths = getDurationMonths(item.duration);
      const taxAmount = Math.round(totalItemCost - totalItemCost / 1.18);
      const basePrice = totalItemCost - taxAmount;
      const planId = `PLAN-${item.id.split('-')[0].toUpperCase()}-${item.duration.split(' ')[0].toUpperCase()}`;
      return {
        id: item.id,
        planId: planId,
        name: `${item.brand} ${item.type || item.name} Cover` + (qty > 1 ? ` (Qty: ${qty})` : ''),
        durationMonths: durationMonths,
        duration: item.duration,
        basePrice: basePrice,
        taxAmount: taxAmount,
        cost: totalItemCost,
        quantity: qty
      };
    });

    const totalBasePrice = receiptItems.reduce((sum, ri) => sum + ri.basePrice, 0);
    const totalTaxAmount = receiptItems.reduce((sum, ri) => sum + ri.taxAmount, 0);

    const currentId = `REC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const gatewayRef = `PAYREF-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const custId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const maxDurationMonths = Math.max(...receiptItems.map(ri => ri.durationMonths), 12);

    setReceiptInfo({
      receiptId: currentId,
      customerId: custId,
      fullName: customerName,
      email: user?.email || 'customer@homigo.com',
      phoneNumber: mobileNo,
      billingAddress: `${address}, ${landmark}, ${detectedDistrict ? detectedDistrict + ', ' : ''}${detectedCity ? detectedCity + ' - ' : ''}Pincode: ${pincode} (${addressType.toUpperCase()})`,
      items: receiptItems,
      planId: receiptItems.length === 1 ? receiptItems[0].planId : 'PLAN-MULTI',
      planName: receiptItems.length === 1 ? receiptItems[0].name : `${receiptItems.length} Appliances Cover Plan`,
      basePrice: totalBasePrice,
      durationMonths: maxDurationMonths,
      taxAmount: totalTaxAmount,
      totalAmount: totalAmount,
      expiryDate: getExpiryDate(maxDurationMonths),
      paymentMethodName: paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'netbanking' ? 'Netbanking' : 'Pay Later (COD)',
      gatewayRef: gatewayRef,
      transactionDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    });
    setStep(4);
  };

  const startPaymentSimulation = () => {
    setStep(3);
    setLoaderStep(0);

    // Step 0: Securing Connection
    setTimeout(() => {
      setLoaderStep(1); // Step 1: Authorizing
      
      setTimeout(() => {
        setLoaderStep(2); // Step 2: Success
        
        setTimeout(() => {
          transitionToReceipt();
        }, 1800);
      }, 2000);
    }, 1500);
  };

  const handleGoToDashboard = () => {
    if (!receiptInfo) return;
    const bookingDetails = {
      address: {
        customerName,
        mobileNo,
        alternateNo,
        address,
        landmark,
        pincode,
        addressType
      },
      payment: {
        method: paymentMethod,
        amountPaid: totalAmount,
        transactionId: receiptInfo.receiptId,
        receiptInfo: receiptInfo
      }
    };
    onComplete(bookingDetails);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!paymentMethod) {
      errors.general = 'Please select a payment method';
      setPaymentErrors(errors);
      return;
    }

    if (paymentMethod === 'upi') {
      if (!upiId.trim()) {
        errors.upiId = 'UPI ID is required';
      } else if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) {
        errors.upiId = 'Enter a valid UPI ID (e.g. name@okhdfc)';
      }
    } else if (paymentMethod === 'card') {
      if (!cardNo.trim() || !/^\d{16}$/.test(cardNo.replace(/\s+/g, ''))) {
        errors.cardNo = 'Enter a valid 16-digit card number';
      }
      if (!cardExpiry.trim() || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        errors.cardExpiry = 'Enter expiry in MM/YY format';
      }
      if (!cardCvv.trim() || !/^\d{3}$/.test(cardCvv)) {
        errors.cardCvv = 'Enter a valid 3-digit CVV';
      }
      if (!cardName.trim()) {
        errors.cardName = 'Cardholder name is required';
      }
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        errors.selectedBank = 'Please select your bank';
      }
    }

    if (Object.keys(errors).length > 0) {
      setPaymentErrors(errors);
      return;
    }
    setPaymentErrors({});
    startPaymentSimulation();
  };

  return (
    <div style={{
      minHeight: '80vh',
      maxWidth: '850px',
      margin: '0 auto',
      padding: '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      
      {/* Header bar with Back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <button 
        onClick={step === '1b' ? () => setStep(1) : step === 2 ? () => setStep(savedAddresses.length > 0 ? 1 : '1b') : onCancel}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-secondary)',
            transition: 'var(--transition-fast)'
          }}
          title="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {step === 1 ? 'Select Service Address' : step === '1b' ? 'Add New Address' : step === 2 ? 'Select Payment Method' : 'Processing Transaction'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
            {(step === 1 || step === '1b')
              ? `Shield Cover for ${items.length === 1 ? items[0].name : `${items.length} appliances`}` 
              : `Amount to pay: ₹${totalAmount.toLocaleString('en-IN')}`
            }
          </p>
        </div>
      </div>

      {/* Steps progress indicator */}
      {(step === 1 || step === '1b' || step === 2) && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: (step === 1 || step === '1b') ? 'var(--brand-primary)' : 'var(--color-success)',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: (step === 1 || step === '1b') ? 'var(--brand-primary)' : 'var(--color-success)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem'
            }}>1</span>
            Address Details
          </div>
          <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--border-color)', alignSelf: 'center' }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: step === 2 ? 'var(--brand-primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: step === 2 ? 'var(--brand-primary)' : 'var(--bg-secondary)',
              color: step === 2 ? 'white' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              border: step === 2 ? 'none' : '1px solid var(--border-color)'
            }}>2</span>
            Payment Mode
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className={step === 2 ? 'checkout-payment-grid' : ''} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        
        {/* LEFT COLUMN: ACTIVE STEP */}
        <div>

          {/* ─── STEP 1: SELECT ADDRESS ─── */}
          {step === 1 && (
            <div className="replicated-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📍 Where do you need the service?
              </h3>

              {/* Saved address cards */}
              {savedAddresses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => setSelectedAddressId(addr.id)}
                        style={{
                          textAlign: 'left',
                          padding: '16px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid var(--brand-primary)' : '1.5px solid var(--border-color)',
                          background: isSelected ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'flex-start',
                          transition: 'all 0.18s ease',
                          width: '100%',
                          position: 'relative'
                        }}
                      >
                        {/* Selected indicator */}
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          border: isSelected ? '2px solid var(--brand-primary)' : '2px solid var(--border-color)',
                          background: isSelected ? 'var(--brand-primary)' : 'transparent',
                          flexShrink: 0, marginTop: '2px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                        </div>

                        <div style={{ fontSize: '1.6rem', flexShrink: 0, lineHeight: 1, marginTop: '1px' }}>
                          {addr.type === 'Home' ? '🏠' : addr.type === 'Office' ? '💼' : '📍'}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{addr.type}</strong>
                            {addr.isPrimary && (
                              <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontWeight: 800 }}>PRIMARY</span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>
                            {addr.formatted}
                          </p>
                          {addr.pincode && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Pincode: {addr.pincode}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📭</div>
                  <p style={{ fontSize: '0.88rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>No saved addresses found.</p>
                  <p style={{ fontSize: '0.78rem' }}>Add an address to continue.</p>
                </div>
              )}

              {/* Add new address button */}
              <button
                type="button"
                onClick={() => setStep('1b')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px', borderRadius: '10px',
                  border: '1.5px dashed var(--border-color)',
                  background: 'transparent', color: 'var(--brand-primary)',
                  fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.18s ease'
                }}
              >
                ＋ Add New Address
              </button>

              {/* Continue button */}
              {savedAddresses.length > 0 && (
                <button
                  className="btn-primary"
                  type="button"
                  disabled={!selectedAddressId}
                  onClick={handleUseSavedAddress}
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', fontWeight: 700, borderRadius: 'var(--radius-sm)', opacity: selectedAddressId ? 1 : 0.5 }}
                >
                  Deliver to This Address →
                </button>
              )}
            </div>
          )}

          {/* ─── STEP 1b: NEW ADDRESS FORM ─── */}
          {step === '1b' && (
            <form onSubmit={handleAddressSubmit} className="replicated-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                📍 Service Address Details
              </h3>

              

              <div className="form-group">
                <label>CUSTOMER NAME</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
                {formErrors.customerName && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>{formErrors.customerName}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label>MOBILE NUMBER</label>
                  <input 
                    type="tel" 
                    placeholder="10-digit number"
                    maxLength={10}
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  {formErrors.mobileNo && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>{formErrors.mobileNo}</span>}
                </div>
                <div className="form-group">
                  <label>ALTERNATE MOBILE (OPTIONAL)</label>
                  <input 
                    type="tel" 
                    placeholder="10-digit number"
                    maxLength={10}
                    value={alternateNo}
                    onChange={(e) => setAlternateNo(e.target.value.replace(/\D/g, ''))}
                  />
                  {formErrors.alternateNo && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>{formErrors.alternateNo}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>STREET ADDRESS</label>
                <textarea 
                  rows={3} 
                  placeholder="Flat No, Wing, Building Name, Street details..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    resize: 'none'
                  }}
                  required
                />
                {formErrors.address && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>{formErrors.address}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                <div className="form-group">
                  <label>LANDMARK</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Near HDFC Bank ATM"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    required
                  />
                  {formErrors.landmark && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>{formErrors.landmark}</span>}
                </div>
                <div className="form-group">
                  <label>PINCODE</label>
                  <input 
                    type="text" 
                    placeholder="6-digit pincode"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPincode(val);
                      if (val.length === 6) {
                        const loc = lookupPincode(val);
                        if (loc) {
                          setDetectedCity(loc.city);
                          setDetectedDistrict(loc.district);
                        } else {
                          setDetectedCity('');
                          setDetectedDistrict('');
                        }
                      } else {
                        setDetectedCity('');
                        setDetectedDistrict('');
                      }
                    }}
                    required
                  />
                  {formErrors.pincode && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>{formErrors.pincode}</span>}
                </div>
              </div>

              {/* District & City — auto-filled from pincode, editable */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    DISTRICT
                    {detectedDistrict && (
                      <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--color-success-light)', color: 'var(--color-success)', fontWeight: 800 }}>AUTO</span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. South West Delhi"
                    value={detectedDistrict}
                    onChange={(e) => setDetectedDistrict(e.target.value)}
                    style={{ background: detectedDistrict ? 'var(--bg-primary)' : undefined }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    CITY
                    {detectedCity && (
                      <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--color-success-light)', color: 'var(--color-success)', fontWeight: 800 }}>AUTO</span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi"
                    value={detectedCity}
                    onChange={(e) => setDetectedCity(e.target.value)}
                    style={{ background: detectedCity ? 'var(--bg-primary)' : undefined }}
                  />
                </div>
              </div>


              <div className="form-group">
                <label style={{ marginBottom: '8px' }}>ADDRESS TYPE</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[
                    { id: 'home', name: 'Home', icon: <HomeIcon size={16} /> },
                    { id: 'office', name: 'Office', icon: <Briefcase size={16} /> },
                    { id: 'other', name: 'Other', icon: <MapPin size={16} /> }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setAddressType(type.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        border: addressType === type.id ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
                        background: addressType === type.id ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                        color: addressType === type.id ? 'var(--brand-primary)' : 'var(--text-primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      {type.icon}
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '15px', borderRadius: 'var(--radius-sm)', marginTop: '8px' }}
              >
                Proceed to Payment (₹{baseCost.toLocaleString('en-IN')})
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
              
              <div className="replicated-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  💳 Select Payment Option
                </h3>

                {paymentErrors.general && (
                  <div style={{ padding: '10px 14px', backgroundColor: '#fdf2f2', border: '1px solid #fbd5d5', borderRadius: '6px', color: 'var(--color-danger)', fontSize: '0.82rem', fontWeight: 600 }}>
                    ⚠️ {paymentErrors.general}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* Option 1: UPI */}
                  <div style={{
                    border: '1.5px solid ' + (paymentMethod === 'upi' ? 'var(--brand-primary)' : 'var(--border-color)'),
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    background: paymentMethod === 'upi' ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                    transition: 'var(--transition-fast)'
                  }} onClick={() => { setPaymentMethod('upi'); setPaymentErrors({}); }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Smartphone size={20} style={{ color: 'var(--brand-primary)' }} />
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.92rem' }}>UPI</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pay instantly using GPay, PhonePe, Paytm, etc.</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        backgroundColor: 'var(--color-success-light)',
                        color: 'var(--color-success)',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        letterSpacing: '0.04em'
                      }}>MOST POPULAR</span>
                    </div>

                    {paymentMethod === 'upi' && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                        
                        {savedUpiList && savedUpiList.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>LINKED UPI ACCOUNTS</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {savedUpiList.map((upi) => (
                                <button
                                  key={upi.id}
                                  type="button"
                                  onClick={() => {
                                    setUpiId(upi.vpa);
                                    setIsUpiVerified(true);
                                    setPaymentErrors({});
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '16px',
                                    border: upiId === upi.vpa ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                                    background: upiId === upi.vpa ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  ⚡ {upi.vpa}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>ENTER UPI ID</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input 
                            type="text" 
                            placeholder="username@bank"
                            value={upiId}
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              setIsUpiVerified(false);
                            }}
                            style={{ flex: 1 }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (/^[\w.-]+@[\w.-]+$/.test(upiId)) {
                                setIsUpiVerified(true);
                                setPaymentErrors({});
                              } else {
                                alert('Please enter a valid UPI ID (e.g. name@okaxis)');
                              }
                            }}
                            className="btn-primary"
                            style={{
                              padding: '10px 16px',
                              backgroundColor: isUpiVerified ? 'var(--color-success)' : 'var(--text-primary)',
                              fontSize: '0.8rem',
                              height: '42px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {isUpiVerified ? 'Verified ✓' : 'Verify'}
                          </button>
                        </div>
                        {paymentErrors.upiId && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 600 }}>{paymentErrors.upiId}</span>}
                      </div>
                    )}
                  </div>

                  {/* Option 2: Cards */}
                  <div style={{
                    border: '1.5px solid ' + (paymentMethod === 'card' ? 'var(--brand-primary)' : 'var(--border-color)'),
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    background: paymentMethod === 'card' ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                    transition: 'var(--transition-fast)'
                  }} onClick={() => { setPaymentMethod('card'); setPaymentErrors({}); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CreditCard size={20} style={{ color: 'var(--brand-primary)' }} />
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ display: 'block', fontSize: '0.92rem' }}>Credit / Debit Card</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Add a new Card securely</span>
                      </div>
                    </div>

                    {paymentMethod === 'card' && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                        
                        {savedCards && savedCards.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>LINKED CARDS</span>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                              {savedCards.map((card) => (
                                <button
                                  key={card.id}
                                  type="button"
                                  onClick={() => {
                                    setCardNo(card.number.match(/.{1,4}/g)?.join(' ') || card.number);
                                    setCardExpiry(card.expiry);
                                    setCardCvv(card.cvv);
                                    setCardName(card.name);
                                    setPaymentErrors({});
                                  }}
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: cardNo.replace(/\s/g, '') === card.number ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                                    background: cardNo.replace(/\s/g, '') === card.number ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <span>💳 {card.brand}</span>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{card.masked.slice(-4)}</span>
                                  </div>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{card.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="form-group">
                          <label>CARD NUMBER</label>
                          <input 
                            type="text" 
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            value={cardNo}
                            onChange={(e) => {
                              // Auto format spaces for card readability
                              const val = e.target.value.replace(/\D/g, '');
                              const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                              setCardNo(formatted);
                            }}
                          />
                          {paymentErrors.cardNo && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 600 }}>{paymentErrors.cardNo}</span>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                          <div className="form-group">
                            <label>EXPIRY (MM/YY)</label>
                            <input 
                              type="text" 
                              placeholder="MM/YY"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length >= 2) {
                                  setCardExpiry(val.substring(0,2) + '/' + val.substring(2,4));
                                } else {
                                  setCardExpiry(val);
                                }
                              }}
                            />
                            {paymentErrors.cardExpiry && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 600 }}>{paymentErrors.cardExpiry}</span>}
                          </div>
                          <div className="form-group">
                            <label>CVV</label>
                            <input 
                              type="password" 
                              placeholder="•••"
                              maxLength={3}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            />
                            {paymentErrors.cardCvv && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 600 }}>{paymentErrors.cardCvv}</span>}
                          </div>
                        </div>

                        <div className="form-group">
                          <label>CARDHOLDER NAME</label>
                          <input 
                            type="text" 
                            placeholder="Name on card"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                          />
                          {paymentErrors.cardName && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 600 }}>{paymentErrors.cardName}</span>}
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Option 3: Netbanking */}
                  <div style={{
                    border: '1.5px solid ' + (paymentMethod === 'netbanking' ? 'var(--brand-primary)' : 'var(--border-color)'),
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    background: paymentMethod === 'netbanking' ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                    transition: 'var(--transition-fast)'
                  }} onClick={() => { setPaymentMethod('netbanking'); setPaymentErrors({}); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Landmark size={20} style={{ color: 'var(--brand-primary)' }} />
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ display: 'block', fontSize: '0.92rem' }}>Netbanking</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select from standard banks</span>
                      </div>
                    </div>

                    {paymentMethod === 'netbanking' && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>SELECT BANK</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                          {[
                            { code: 'sbi', name: 'State Bank of India' },
                            { code: 'hdfc', name: 'HDFC Bank' },
                            { code: 'icici', name: 'ICICI Bank' },
                            { code: 'kotak', name: 'Kotak Mahindra' }
                          ].map((bank) => (
                            <button
                              key={bank.code}
                              type="button"
                              onClick={() => {
                                setSelectedBank(bank.code);
                                setPaymentErrors({});
                              }}
                              style={{
                                padding: '10px',
                                borderRadius: '6px',
                                border: selectedBank === bank.code ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                                background: selectedBank === bank.code ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                transition: 'var(--transition-fast)',
                                textAlign: 'center'
                              }}
                            >
                              {bank.name}
                            </button>
                          ))}
                        </div>
                        {paymentErrors.selectedBank && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 600 }}>{paymentErrors.selectedBank}</span>}
                      </div>
                    )}
                  </div>

                  {/* Option 4: Pay Later Options */}
                  <div style={{
                    border: '1.5px solid ' + ((paymentMethod === 'paylater_online' || paymentMethod === 'paylater_cash') ? 'var(--brand-primary)' : 'var(--border-color)'),
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    background: (paymentMethod === 'paylater_online' || paymentMethod === 'paylater_cash') ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                    transition: 'var(--transition-fast)'
                  }} onClick={() => { setPaymentMethod('paylater_online'); setPaymentErrors({}); }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.2rem', color: 'var(--brand-primary)' }}>🕒</span>
                        <div style={{ textAlign: 'left' }}>
                          <strong style={{ display: 'block', fontSize: '0.92rem' }}>Pay Later / Cash on Delivery</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Book now and complete payment later</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--brand-primary)',
                        fontWeight: 700,
                        marginLeft: '32px',
                        display: 'block'
                      }}>
                        ⚠️ +₹9 convenience fee applies — pay online now to avoid it
                      </span>
                    </div>

                    {(paymentMethod === 'paylater_online' || paymentMethod === 'paylater_cash') && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { id: 'paylater_online', name: 'Pay Later Online (Link sent post visit)' },
                            { id: 'paylater_cash', name: 'Pay Later with Cash / UPI to technician' }
                          ].map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                setPaymentMethod(option.id);
                                setPaymentErrors({});
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 14px',
                                borderRadius: '6px',
                                border: paymentMethod === option.id ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
                                background: paymentMethod === option.id ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'var(--transition-fast)',
                                textAlign: 'left'
                              }}
                            >
                              <span style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                border: '2px solid ' + (paymentMethod === option.id ? 'var(--brand-primary)' : 'var(--text-muted)'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {paymentMethod === option.id && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)' }} />}
                              </span>
                              {option.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '16px', borderRadius: 'var(--radius-sm)' }}
              >
                Pay ₹{totalAmount.toLocaleString('en-IN')}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: BOOKING SUMMARY CARD */}
        {step < 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="replicated-card" style={{ background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🛡️ Quote Checklist
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                {items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.85rem' }}>
                        {item.name} {item.quantity > 1 ? `(Qty: ${item.quantity})` : ''}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {item.brand} • {item.duration} {item.quantity > 1 ? `• ₹${item.cost.toLocaleString('en-IN')} each` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Base AMC rate</span>
                  <span style={{ fontWeight: 600 }}>₹{baseCost.toLocaleString('en-IN')}</span>
                </div>
                {convenienceFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--brand-primary)' }}>Convenience Fee (Pay Later)</span>
                    <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>+₹{convenienceFee}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', fontSize: '0.95rem', fontWeight: 800 }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--brand-primary)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Shield Guarantee badge */}
            <div className="replicated-card" style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 16px', background: 'var(--color-success-light)', border: '1.5px solid var(--color-success)' }}>
              <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
              <div style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-success)' }}>100% Cashless Assured</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Cancel or reschedule anytime. Vetted experts only.</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* STEP 3: FULL SCREEN SIMULATED PAYMENT LOADER & SUCCESS */}
      {step === 3 && (
        <div className="replicated-card" style={{
          padding: '60px 40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
          background: 'var(--bg-primary)',
          maxWidth: '550px',
          margin: '30px auto'
        }}>
          
          {loaderStep < 2 ? (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 
                size={70} 
                className="loading-spinner" 
                style={{ 
                  color: 'var(--brand-primary)', 
                  animation: 'spin 1.5s linear infinite'
                }} 
              />
              <ShieldCheck 
                size={32} 
                style={{ 
                  position: 'absolute', 
                  color: 'var(--brand-primary)' 
                }} 
              />
            </div>
          ) : (
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--color-success-light)', 
              color: 'var(--color-success)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '2.5rem',
              animation: 'bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              ✓
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {loaderStep === 0 && 'Securing connection...'}
              {loaderStep === 1 && 'Authorizing with bank gateway...'}
              {loaderStep === 2 && 'Payment Successful!'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              {loaderStep === 0 && 'Connecting with certified 3D Secure payment portals...'}
              {loaderStep === 1 && 'Verifying payment validation rules and checking limits...'}
              {loaderStep === 2 && 'Shield activated! Activating telemetry logs and returning to dashboard.'}
            </p>
          </div>

          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '16px',
            width: '100%',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            alignItems: 'center'
          }}>
            <span className="pulse-green" /> Powered by HOMIGO PaySecure Gateway
          </div>
        </div>
      )}

      {/* STEP 4: BOOKING CONFIRMED & DETAILED PRINTABLE RECEIPT */}
      {step === 4 && receiptInfo && (
        <div className="checkout-wizard-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Action Buttons (Screen Only) */}
          <div className="no-print" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--brand-primary-light)',
            border: '1.5px solid var(--brand-primary)',
            padding: '16px 24px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left'
          }}>
            <div>
              <span style={{ fontSize: '1.3rem', marginRight: '6px' }}>🎉</span>
              <strong style={{ color: 'var(--brand-primary)', fontSize: '1rem' }}>Booking Confirmed & Shield Activated!</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Your device is now protected. Please download your payment receipt for your records.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={downloadPDFReceipt}
                className="btn-secondary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontWeight: 700,
                  borderColor: 'var(--brand-primary)',
                  color: 'var(--brand-primary)'
                }}
              >
                📥 Download Receipt (PDF)
              </button>
              <button 
                onClick={handleGoToDashboard}
                className="btn-primary"
                style={{ fontWeight: 700 }}
              >
                🏠 Go to Homescreen
              </button>
            </div>
          </div>

          {/* Printable Invoice Card */}
          <div className="printable-receipt-card" style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px',
            fontFamily: 'var(--font-sans)',
            textAlign: 'left'
          }}>
            {/* Invoice Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '2px solid var(--text-primary)', paddingBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                  HOMI<span style={{ color: 'var(--brand-primary)' }}>GO</span>
                </span>
                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.08em', fontWeight: 700, marginTop: '2px' }}>
                  SERVICE ON THE GO
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', margin: 0 }}>
                  Tax Invoice / Receipt
                </h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Original copy for Recipient</span>
              </div>
            </div>

            {/* Billing Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '30px 0', fontSize: '0.85rem', lineHeight: 1.6 }}>
              {/* Left Column: Customer details */}
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Customer Details (Bill To)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Customer ID:</strong> {receiptInfo.customerId}</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Full Name:</strong> {receiptInfo.fullName}</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Phone:</strong> {receiptInfo.phoneNumber}</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {receiptInfo.email}</span>
                  <span style={{ marginTop: '4px' }}><strong style={{ color: 'var(--text-primary)' }}>Billing Address:</strong><br />{receiptInfo.billingAddress}</span>
                </div>
              </div>

              {/* Right Column: Invoice / Transaction details */}
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Transaction Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Receipt ID:</strong> {receiptInfo.receiptId}</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Date:</strong> {receiptInfo.transactionDate}</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Plan Expiry:</strong> {receiptInfo.expiryDate}</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Gateway Ref:</strong> {receiptInfo.gatewayRef}</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Payment Method:</strong> {receiptInfo.paymentMethodName}</span>
                  <span>
                    <strong style={{ color: 'var(--text-primary)' }}>Status: </strong> 
                    <span style={{ 
                      color: receiptInfo.paymentMethodName.includes('COD') ? 'var(--color-warning)' : 'var(--color-success)', 
                      fontWeight: 800 
                    }}>
                      {receiptInfo.paymentMethodName.includes('COD') ? 'Pending COD Verification' : 'Successful (Captured)'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '30px 0' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--text-primary)', textAlign: 'left', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 8px', fontWeight: 800 }}>PLAN ID</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800 }}>PLAN DESCRIPTION</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800 }}>DURATION</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800, textAlign: 'right' }}>BASE PRICE</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800, textAlign: 'right' }}>GST (18%)</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800, textAlign: 'right' }}>TOTAL</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.88rem' }}>
                {receiptInfo.items ? (
                  receiptInfo.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{item.planId}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{item.name}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Full repair visit & parts cost shield</span>
                      </td>
                      <td style={{ padding: '16px 8px', fontWeight: 600 }}>{item.durationMonths} Months</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 500 }}>₹{item.basePrice.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 500 }}>₹{item.taxAmount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 700 }}>₹{item.cost.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{receiptInfo.planId}</td>
                    <td style={{ padding: '16px 8px' }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{receiptInfo.planName}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Full repair visit & parts cost shield</span>
                    </td>
                    <td style={{ padding: '16px 8px', fontWeight: 600 }}>{receiptInfo.durationMonths} Months</td>
                    <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 500 }}>₹{receiptInfo.basePrice.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 500 }}>₹{receiptInfo.taxAmount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 700 }}>₹{baseCost.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {/* Convenience Fee Row (if Pay Later) */}
                {convenienceFee > 0 && (
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>-</td>
                    <td style={{ padding: '12px 8px' }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Pay Later Convenience Fee</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Handling & offline validation fee</span>
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>-</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>₹9</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>₹0</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700 }}>₹9</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total Section */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Net Amount:</span>
                  <span style={{ fontWeight: 600 }}>₹{(receiptInfo.basePrice + (convenienceFee > 0 ? 9 : 0)).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Integrated GST (18%):</span>
                  <span style={{ fontWeight: 600 }}>₹{receiptInfo.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  borderTop: '2px solid var(--brand-primary)', 
                  paddingTop: '10px', 
                  fontSize: '1.1rem', 
                  fontWeight: 800 
                }}>
                  <span style={{ color: 'var(--text-primary)' }}>Grand Total:</span>
                  <span style={{ color: 'var(--brand-primary)' }}>₹{receiptInfo.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Invoice Footer Details */}
            <div style={{ marginTop: '50px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <p style={{ marginBottom: '6px' }}>
                <strong>Terms & Conditions:</strong> Coverage is subject to the HOMIGO Master AMC Service Agreement. Telemetry-linked smart plugs must remain active for 24/7 predictive component monitoring. For cancellation and refund rules, contact priority support via the Live Chat panel.
              </p>
              <p style={{ margin: 0, textAlign: 'center', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '16px' }}>
                Thank you for trusting HOMIGO to protect your home!
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
