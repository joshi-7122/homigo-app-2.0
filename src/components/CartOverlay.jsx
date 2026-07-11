import React from 'react';
import { X, ShoppingCart, Trash2, ShieldCheck, ArrowRight, Info } from 'lucide-react';

export default function CartOverlay({ 
  isOpen, 
  onClose, 
  cart, 
  onRemoveFromCart, 
  onProceedToCheckout, 
  onGoToPlanner,
  onUpdateCartQty
}) {
  if (!isOpen) return null;

  // Calculate totals (Inclusive of 18% GST, matching CheckoutWizard logic)
  const grandTotal = cart.reduce((sum, item) => sum + ((item.cost || 0) * (item.quantity || 1)), 0);
  const gstAmount = Math.round(grandTotal - grandTotal / 1.18);
  const subtotal = grandTotal - gstAmount;

  return (
    <div className="cart-full-window-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'var(--bg-secondary)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'left'
    }}>
      {/* Header */}
      <div 
        className="full-window-overlay-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
            marginLeft: '-8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
        >
          <X size={22} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Your Protection Cart</h2>
          <p style={{ margin: '1px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Review and checkout your selected plans
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        className="full-window-overlay-body"
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '20px',
          background: 'var(--bg-secondary)'
        }}
      >
        {cart.length === 0 ? (
          /* Empty State */
          <div style={{ padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}>
              <ShoppingCart size={40} strokeWidth={1.5} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Your Cart is Empty</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto', lineHeight: 1.6 }}>
                Add appliance protection plans from the AMC calculator to secure your home devices today.
              </p>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => {
                onClose();
                onGoToPlanner();
              }}
              style={{ padding: '12px 28px', fontWeight: 700, borderRadius: 'var(--radius-sm)' }}
            >
              🛡️ Browse AMC Plans
            </button>
          </div>
        ) : (
          /* Cart Items & Summary */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Items list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cart.map((item) => (
                <div 
                  key={item.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '12px',
                    background: 'var(--bg-secondary)', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border-color)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {/* Top row: Icon + Details */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ 
                      fontSize: '1.8rem', 
                      background: 'var(--bg-primary)', 
                      width: '46px', 
                      height: '46px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)',
                      border: '1px solid var(--border-color)',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>{item.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        Cohort: {item.age} <br /> Term: {item.duration}
                      </span>
                    </div>
                  </div>
                  
                  {/* Bottom row: Control actions */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    borderTop: '1px solid var(--border-color)', 
                    paddingTop: '12px',
                    marginTop: '4px'
                  }}>
                    {/* Quantity Selector */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      background: 'var(--bg-primary)', 
                      border: '1.5px solid var(--border-color)', 
                      borderRadius: '8px', 
                      padding: '2px 8px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <button 
                        onClick={() => onUpdateCartQty(item.id, (item.quantity || 1) - 1)}
                        disabled={(item.quantity || 1) <= 1}
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          cursor: (item.quantity || 1) <= 1 ? 'not-allowed' : 'pointer', 
                          fontWeight: 'bold', 
                          padding: '2px 6px', 
                          color: (item.quantity || 1) <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                          fontSize: '1rem'
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, minWidth: '18px', textAlign: 'center', color: 'var(--text-primary)' }}>
                        {item.quantity || 1}
                      </span>
                      <button 
                        onClick={() => onUpdateCartQty(item.id, (item.quantity || 1) + 1)}
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          cursor: 'pointer', 
                          fontWeight: 'bold', 
                          padding: '2px 6px',
                          color: 'var(--text-primary)',
                          fontSize: '1rem'
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Price with Unit Cost details */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '70px' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                          ₹{((item.cost || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </span>
                        {(item.quantity || 1) > 1 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            ₹{item.cost.toLocaleString('en-IN')} each
                          </span>
                        )}
                      </div>

                      <button 
                        onClick={() => onRemoveFromCart(item.id)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--text-muted)', 
                          cursor: 'pointer', 
                          padding: '6px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          transition: 'var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.backgroundColor = '#fdf2f2'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        title="Remove from Cart"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Subtotal (Excl. GST)</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Integrated GST (18%)</span>
                  <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  borderTop: '1px dashed var(--border-color)', 
                  paddingTop: '12px', 
                  marginTop: '4px',
                  fontSize: '1.2rem', 
                  fontWeight: 800 
                }}>
                  <span style={{ color: 'var(--text-primary)' }}>Grand Total</span>
                  <span style={{ color: 'var(--brand-primary)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Shield Cover badge info */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              alignItems: 'center', 
              padding: '10px 14px', 
              background: 'var(--color-success-light)', 
              borderRadius: '6px', 
              border: '1.5px solid var(--color-success)', 
              fontSize: '0.78rem',
              color: 'var(--text-secondary)'
            }}>
              <ShieldCheck size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
              <div>
                <strong>100% Cashless Coverage Assured</strong>. Includes unlimited labor fees, genuine spares, and 24/7 telemetry tracking.
              </div>
            </div>

            {/* Checkout Action Button */}
            <button 
              className="btn-primary" 
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              style={{ width: '100%', justifyContent: 'center', padding: '15px', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}
            >
              Proceed to Secure Checkout <ArrowRight size={18} style={{ marginLeft: '6px' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
