import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, AlertCircle, Check, Info } from 'lucide-react';

const APPLIANCE_DATA = {
  'mobile': {
    name: 'Mobile Phone',
    icon: '📱',
    brands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google'],
    basePct: 0.070,
    defaultPrice: 50000
  },
  'laptop': {
    name: 'Laptop',
    icon: '💻',
    brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus'],
    basePct: 0.065,
    defaultPrice: 65000
  },
  'tv': {
    name: 'Television',
    icon: '📺',
    brands: ['Sony', 'Samsung', 'LG', 'OnePlus', 'Xiaomi'],
    basePct: 0.055,
    defaultPrice: 45000
  },
  'ac': {
    name: 'Air Conditioner (AC)',
    icon: '❄️',
    brands: ['Daikin', 'Voltas', 'LG', 'Blue Star', 'Samsung'],
    basePct: 0.060,
    defaultPrice: 42000
  },
  'refrigerator': {
    name: 'Refrigerator',
    icon: '🧊',
    brands: ['Samsung', 'LG', 'Whirlpool', 'Haier'],
    basePct: 0.050,
    defaultPrice: 48000
  },
  'washing_machine': {
    name: 'Washing Machine',
    icon: '🧼',
    brands: ['IFB', 'LG', 'Samsung', 'Whirlpool'],
    basePct: 0.055,
    defaultPrice: 28000
  },
  'water_purifier': {
    name: 'RO Purifier',
    icon: '💧',
    brands: ['Kent', 'Aquaguard', 'Pureit'],
    basePct: 0.075,
    defaultPrice: 16000
  },
  'microwave': {
    name: 'Microwave Oven',
    icon: '🔥',
    brands: ['Samsung', 'LG', 'IFB', 'Panasonic'],
    basePct: 0.045,
    defaultPrice: 12000
  },
  'dishwasher': {
    name: 'Dishwasher',
    icon: '🍽️',
    brands: ['Bosch', 'IFB', 'Siemens', 'Voltas'],
    basePct: 0.065,
    defaultPrice: 38000
  },
  'geyser': {
    name: 'Geyser',
    icon: '🔌',
    brands: ['Ao Smith', 'Havells', 'Racold', 'Bajaj'],
    basePct: 0.050,
    defaultPrice: 10000
  },
  'local': {
    name: 'Local / Unbranded Market',
    icon: '🏠',
    brands: ['Local Brand / Unbranded', 'Generic China OEM', 'Local Market Assembled', 'Other Local Market Brand'],
    basePct: 0.085,
    defaultPrice: 15000
  }
};

const TIMELINES = [
  { id: '2021-Present', name: '2021 - Present', multiplier: 0.8, desc: 'Optimal health, lowest premium.' },
  { id: '2016-2020', name: '2016 - 2020', multiplier: 1.0, desc: 'Standard wear rate.' },
  { id: '2011-2015', name: '2011 - 2015', multiplier: 1.25, desc: 'Increased failure likelihood.' },
  { id: '2006-2010', name: '2006 - 2010', multiplier: 1.45, desc: 'High mechanical wear risk.' },
  { id: '2000-2005', name: '2000 - 2005', multiplier: 1.65, desc: 'Legacy bracket, requires pre-inspection.' }
];

const AMC_DURATIONS = [
  { id: '6m', name: '6 Months', multiplier: 0.55, text: 'Seasonal Shield' },
  { id: '9m', name: '9 Months', multiplier: 0.80, text: 'Seasonal Guard' },
  { id: '1.5y', name: '1.5 Years', multiplier: 1.40, text: 'Extended Comfort' },
  { id: '2y', name: '2 Years', multiplier: 1.80, text: 'Double Protection' },
  { id: '3y', name: '3 Years', multiplier: 2.50, text: 'Ultimate Life Extension' },
];

export default function AMCPlanner({ preselectedType, onAddAppliance, onAddToCart, onBuyNow }) {
  const [type, setType] = useState('ac');
  const [brand, setBrand] = useState('Daikin');
  const [timeline, setTimeline] = useState('2021-Present');
  const [purchasePrice, setPurchasePrice] = useState(42000);
  const [duration, setDuration] = useState('1.5y');
  const [addedStatus, setAddedStatus] = useState(false);

  // Sync if preselectedType changes from parent catalog click
  useEffect(() => {
    if (preselectedType && APPLIANCE_DATA[preselectedType]) {
      const timer = setTimeout(() => {
        setType(preselectedType);
        const appInfo = APPLIANCE_DATA[preselectedType];
        setBrand(appInfo.brands[0]);
        setPurchasePrice(appInfo.defaultPrice);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [preselectedType]);

  const handleTypeChange = (newType) => {
    setType(newType);
    const appInfo = APPLIANCE_DATA[newType];
    setBrand(appInfo.brands[0]);
    setPurchasePrice(appInfo.defaultPrice);
  };

  const selectedApplianceInfo = APPLIANCE_DATA[type] || APPLIANCE_DATA['ac'];
  const selectedTimelineObj = TIMELINES.find(t => t.id === timeline) || TIMELINES[0];
  const selectedDurationObj = AMC_DURATIONS.find(d => d.id === duration) || AMC_DURATIONS[2];

  // Pricing calculations
  const annualBaseRate = purchasePrice * selectedApplianceInfo.basePct;
  const ageAdjustedAnnual = annualBaseRate * selectedTimelineObj.multiplier;
  const calculatedCost = Math.round(ageAdjustedAnnual * selectedDurationObj.multiplier);

  const totalMonths = duration === '6m' ? 6 : duration === '9m' ? 9 : duration === '1.5y' ? 18 : duration === '2y' ? 24 : 36;
  const monthlyCost = Math.round(calculatedCost / totalMonths);

  const getFeatures = () => {
    const list = [
      '100% Genuine spare parts coverage included',
      'Unlimited breakdown visits & labor fees covered',
      'Cashless servicing with zero paperwork'
    ];
    if (duration === '3y') {
      list.push('FREE smart vibration & current plugs (IoT kit worth ₹1,999)');
      list.push('Active 24/7 Guardian Live Feed diagnostic tracking');
      list.push('Gas charging and cooling assurance covered');
    } else if (duration === '2y' || duration === '1.5y') {
      list.push('50% Off modular IoT telemetry kit upgrades');
      list.push('Routine health diagnostics checks included');
    }
    return list;
  };

  const handleAction = (actionType) => {
    const finalPrice = Math.max(1000, Number(purchasePrice) || 1000);
    const finalCost = Math.round(finalPrice * selectedApplianceInfo.basePct * selectedTimelineObj.multiplier * selectedDurationObj.multiplier);
    const newApp = {
      id: `${type}-${Date.now()}`,
      name: `${brand} ${selectedApplianceInfo.name}`,
      type: selectedApplianceInfo.name,
      icon: selectedApplianceInfo.icon,
      brand,
      age: selectedTimelineObj.name,
      purchasePrice: finalPrice,
      duration: `${selectedDurationObj.name} (${selectedDurationObj.text})`,
      cost: finalCost,
      status: 'Protected',
      iotEnabled: duration === '3y',
      telemetry: duration === '3y' ? {
        vibration: 0.092,
        temperature: type === 'refrigerator' ? 4.1 : type === 'ac' ? 22.0 : 40.0,
        powerDraw: type === 'ac' ? 150 : 100,
        status: 'Healthy'
      } : null
    };

    if (actionType === 'cart' && onAddToCart) {
      onAddToCart(newApp);
      setAddedStatus(true);
      setTimeout(() => {
        setAddedStatus(false);
      }, 1500);
    } else if (actionType === 'buy' && onBuyNow) {
      onBuyNow(newApp);
    } else if (onAddAppliance) {
      onAddAppliance(newApp);
    }
  };

  return (
    <div className="amcplanner-main-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '32px', padding: '10px 0' }}>
      
      {/* Left Form Panel */}
      <div className="replicated-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-primary)' }}>🛡️ Shield Selection Planner</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Choose your options to configure a dynamic, brand-agnostic AMC quote.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>SELECT APPLIANCE TYPE</label>
          <select value={type} onChange={(e) => handleTypeChange(e.target.value)}>
            {Object.keys(APPLIANCE_DATA).map(key => (
              <option key={key} value={key}>
                {APPLIANCE_DATA[key].icon} {APPLIANCE_DATA[key].name}
              </option>
            ))}
          </select>
        </div>

        <div className="amcplanner-fields-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>BRAND</label>
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              {selectedApplianceInfo.brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>PURCHASE PRICE (₹)</label>
            <input 
              type="number" 
              value={purchasePrice} 
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setPurchasePrice('');
                } else {
                  setPurchasePrice(Number(val));
                }
              }}
              onBlur={() => {
                if (purchasePrice === '' || purchasePrice < 1000) {
                  setPurchasePrice(1000);
                }
              }}
              step="1000"
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>APPLIANCE TIMELINE COHORT</label>
          <select value={timeline} onChange={(e) => setTimeline(e.target.value)}>
            {TIMELINES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <div style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Info size={14} />
            <span>Risk Index: {selectedTimelineObj.multiplier}x — {selectedTimelineObj.desc}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CONTRACT PERIOD</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {AMC_DURATIONS.map(d => (
              <div 
                key={d.id} 
                onClick={() => setDuration(d.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: duration === d.id ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                  border: duration === d.id ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: duration === d.id ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                  {d.name} ({d.text})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Quote Summary Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Quote Card */}
        <div className="replicated-card" style={{
          border: '1.5px solid var(--brand-primary)',
          background: 'var(--bg-primary)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {duration === '3y' && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '-32px',
              background: 'var(--brand-primary)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '4px 32px',
              transform: 'rotate(45deg)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
            }}>
              BEST VALUE
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              background: 'var(--brand-primary-light)',
              padding: '10px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)'
            }}>
              <Shield size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>HOMIGO Shield Cover</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dynamic quote for {brand} {selectedApplianceInfo.name}</p>
            </div>
          </div>

          <div style={{ margin: '24px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Subscription Cost</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--brand-primary)' }}>₹{calculatedCost.toLocaleString('en-IN')}</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>for {selectedDurationObj.name}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Equivalent to roughly <strong style={{ color: 'var(--text-primary)' }}>₹{monthlyCost}/month</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>COVERAGE & PLAN PRIVILEGES:</span>
            {getFeatures().map((feature, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem' }}>
                <div style={{
                  color: feature.includes('IoT') || feature.includes('Guardian') ? 'var(--brand-primary)' : 'var(--color-success)',
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Check size={16} />
                </div>
                <span style={{ color: feature.includes('IoT') || feature.includes('Guardian') ? 'var(--brand-primary)' : 'var(--text-primary)', fontWeight: feature.includes('IoT') ? 600 : 400 }}>{feature}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button 
              id="amc-add-to-cart-btn"
              className={addedStatus ? "btn-success" : "btn-secondary"} 
              onClick={() => handleAction('cart')}
              disabled={addedStatus}
              style={{ 
                flex: 1, 
                padding: '16px', 
                borderRadius: 'var(--radius-sm)', 
                borderColor: addedStatus ? 'var(--color-success)' : 'var(--brand-primary)', 
                color: addedStatus ? 'white' : 'var(--brand-primary)',
                background: addedStatus ? 'var(--color-success)' : 'transparent',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              {addedStatus ? '✓ Added!' : '⚡ Add to Cart'}
            </button>
            <button 
              className="btn-primary" 
              onClick={() => handleAction('buy')}
              style={{ 
                flex: 1, 
                padding: '16px', 
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={18} />
              Buy Now
            </button>
          </div>
        </div>

        {/* Pricing explainer card */}
        <div className="replicated-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'var(--bg-secondary)' }}>
          <AlertCircle size={22} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>How does HOMIGO calculate rates?</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Contract rates are calculated dynamically based on replacement component valuations and age timeline risk indices. Locking in multi-year plans secures parts and labor protection against material inflation.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
