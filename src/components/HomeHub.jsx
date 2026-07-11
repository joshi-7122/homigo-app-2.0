import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Wrench, Shield, ArrowRight, Star, ChevronLeft, ChevronRight, Check, ShoppingCart, ChevronDown, Cpu, ShieldCheck, Bell, ChevronRight as ChevronRightIcon } from 'lucide-react';

const CITIES = ['Mumbai', 'Bengaluru', 'New Delhi NCR', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata'];

const SERVICES = [
  { id: 'ac', name: 'Air Conditioner', desc: 'Cooling & gas charging cover', imgUrl: 'https://i.postimg.cc/GpSjB9H4/image.png' },
  { id: 'tv', name: 'Television', desc: 'Panel & sound cover', imgUrl: 'https://i.postimg.cc/Y90M3Drn/image.png' },
  { id: 'mobile', name: 'Mobile Phone', desc: 'Screen & hardware protection', imgUrl: 'https://i.postimg.cc/br4M13rS/image.png' },
  { id: 'refrigerator', name: 'Refrigerator', desc: 'Compressor thermal shield', imgUrl: 'https://i.postimg.cc/FHSfbRWr/image.png' },
  { id: 'washing_machine', name: 'Washing Machine', desc: 'Motor unbalance protection', imgUrl: 'https://i.postimg.cc/xdqvSYtQ/image.png' },
  { id: 'microwave', name: 'Microwave', desc: 'Magnetron efficiency check', imgUrl: 'https://i.postimg.cc/HsyWRNQ9/image.png' },
  { id: 'printer', name: 'Printer and Scanner', desc: 'Paper rollers & nozzle cover', imgUrl: 'https://i.postimg.cc/NjjT1BhD/image.png' },
  { id: 'audio_system', name: 'Audio System', desc: 'Channel & amplifier protection', imgUrl: 'https://i.postimg.cc/TwLB1zYd/image.png' },
  { id: 'laptop', name: 'Laptop', desc: 'System speed & battery guard', imgUrl: 'https://i.postimg.cc/qRyCk7KS/image.png' },
  { id: 'camera', name: 'Digital Camera', desc: 'Sensor & mechanical lens cover', imgUrl: 'https://i.postimg.cc/9FWqhCQn/image.png' }
];

const SEARCH_ITEMS = [
  { id: 'ac', name: 'Air Conditioner', category: 'Home Appliances' },
  { id: 'air_purifier', name: 'Air Purifier', category: 'Home Appliances' },
  { id: 'audio_system', name: 'Audio System', category: 'Entertainment' },
  { id: 'chopper_blender', name: 'Chopper and Blender', category: 'Kitchen Appliances' },
  { id: 'desktop', name: 'Desktop', category: 'Gadgets' },
  { id: 'camera', name: 'Digital Camera', category: 'Gadgets' },
  { id: 'fan', name: 'Fan', category: 'Home Appliances' },
  { id: 'fitness_tracker', name: 'Fitness Tracker', category: 'Gadgets' },
  { id: 'gaming_console', name: 'Gaming Console', category: 'Entertainment' },
  { id: 'geyser', name: 'Geyser', category: 'Home Appliances' },
  { id: 'groom_hair', name: 'Groom & Hair Care', category: 'Gadgets' },
  { id: 'headphone', name: 'Headphone', category: 'Gadgets' },
  { id: 'juicer_grinder', name: 'Juicer Mixer Grinder', category: 'Kitchen Appliances' },
  { id: 'kettle', name: 'Kettle', category: 'Kitchen Appliances' },
  { id: 'laptop', name: 'Laptop', category: 'Gadgets' },
  { id: 'microwave', name: 'Microwave Oven', category: 'Kitchen Appliances' },
  { id: 'mobile', name: 'Mobile Phone', category: 'Gadgets' },
  { id: 'printer', name: 'Printer and Scanner', category: 'Gadgets' },
  { id: 'refrigerator', name: 'Refrigerator', category: 'Home Appliances' },
  { id: 'room_cooler', name: 'Room Cooler', category: 'Home Appliances' },
  { id: 'smartwatch', name: 'Smartwatch', category: 'Gadgets' },
  { id: 'tablet', name: 'Tablet', category: 'Gadgets' },
  { id: 'tv', name: 'Television', category: 'Entertainment' },
  { id: 'washing_machine', name: 'Washing Machine', category: 'Home Appliances' },
  { id: 'local_ac', name: 'Local AC (Unbranded)', category: 'Local Market' },
  { id: 'local_cooler', name: 'Local Air Cooler', category: 'Local Market' },
  { id: 'local_water_purifier', name: 'Local Water Purifier', category: 'Local Market' },
  { id: 'local_geyser', name: 'Local Water Heater', category: 'Local Market' },
  { id: 'local_fan', name: 'Local Ceiling Fan', category: 'Local Market' },
  { id: 'local_tv', name: 'Local LED TV (Unbranded)', category: 'Local Market' }
];

const getPlannerType = (appId) => {
  const mapping = {
    mobile: 'mobile', smartwatch: 'mobile', tablet: 'mobile', headphone: 'mobile', fitness_tracker: 'mobile',
    laptop: 'laptop', desktop: 'laptop', gaming_console: 'laptop', camera: 'laptop', printer: 'laptop',
    tv: 'tv', audio_system: 'tv',
    ac: 'ac', room_cooler: 'ac', fan: 'ac',
    refrigerator: 'refrigerator',
    washing_machine: 'washing_machine',
    water_purifier: 'water_purifier',
    microwave: 'microwave', chopper_blender: 'microwave', juicer_grinder: 'microwave', kettle: 'microwave',
    geyser: 'geyser',
    local_ac: 'local',
    local_cooler: 'local',
    local_water_purifier: 'local',
    local_geyser: 'local',
    local_fan: 'local',
    local_tv: 'local'
  };
  return mapping[appId] || 'ac';
};

const TESTIMONIALS = [
  {
    name: 'Rajesh Pradhan',
    city: 'Bangalore',
    rating: 5,
    review: "The team handled my request with utmost professionalism and ensured the service was done on time. I'm glad the engineer came before time and followed all safety protocols."
  },
  {
    name: 'Ashish Sharma',
    city: 'Mumbai',
    rating: 5,
    review: "Booking a service request for my AC was an easy process. The engineer was prompt and provided excellent service. All this, at very competitive rates."
  },
  {
    name: 'Snehan P Rajan',
    city: 'Mumbai',
    rating: 5,
    review: "A friend recommended your service so I booked a request online for my water purifier and it was a good experience. Service was cashless and convenient."
  },
  {
    name: 'Dipika Badiger',
    city: 'Hyderabad',
    rating: 5,
    review: "It was a great experience and I will recommend your AMC plans to everyone in need! Highly satisfied with the prompt technician routing."
  }
];

const BRANDS = ['Samsung', 'LG', 'Whirlpool', 'Daikin', 'Kent', 'Bosch', 'Voltas', 'Haier', 'Aquaguard', 'IFB', 'Blue Star'];

const PROMO_BANNERS = [
  {
    gradient: 'linear-gradient(135deg, #f37021 0%, #c2410c 100%)',
    tag: 'Limited Offer',
    title: 'AMC Plans from ₹1,999/yr',
    sub: 'Cover all appliances under one plan. Save up to 40%.',
    onClick: 'plans'
  },
  {
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
    tag: 'Smart Home',
    title: 'IoT Sensors Now Live',
    sub: 'Monitor real-time health of your devices. Zero manual checks.',
    onClick: 'feed'
  },
  {
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    tag: 'Same Day',
    title: 'Doorstep Repair Visit',
    sub: 'Book a certified technician in under 2 minutes.',
    onClick: 'repair'
  }
];

const POPULAR_SERVICES = [
  { id: 'ac', name: 'AC Servicing', desc: 'Cooling & gas charging', price: '₹599', rating: '4.9', imgUrl: 'https://i.postimg.cc/GpSjB9H4/image.png' },
  { id: 'tv', name: 'TV Repair', desc: 'Panel & sound diagnosis', price: '₹399', rating: '4.8', imgUrl: 'https://i.postimg.cc/Y90M3Drn/image.png' },
  { id: 'refrigerator', name: 'Fridge Repair', desc: 'Compressor & cooling', price: '₹499', rating: '4.7', imgUrl: 'https://i.postimg.cc/FHSfbRWr/image.png' },
  { id: 'washing_machine', name: 'Washing Machine', desc: 'Motor & drum service', price: '₹449', rating: '4.8', imgUrl: 'https://i.postimg.cc/xdqvSYtQ/image.png' },
  { id: 'laptop', name: 'Laptop Repair', desc: 'Speed & battery fix', price: '₹699', rating: '4.9', imgUrl: 'https://i.postimg.cc/qRyCk7KS/image.png' },
];

export default function HomeHub({ 
  selectedCity, 
  onCityChange, 
  onSelectCatalogItem, 
  onGoToPlanner, 
  onTriggerEmergencyService,
  cart = [],
  setIsCartOpen,
  user,
  setAuthTab,
  setIsAuthModalOpen,
  appliances = [],
  onGoToFeed = () => {},
  onGoToPlans = () => {},
  onToggleChatbot = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [showInclusions, setShowInclusions] = useState(false);
  const bannerTimerRef = useRef(null);

  const filteredServices = SERVICES.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  // Auto-advance promo banners every 3.5 seconds
  useEffect(() => {
    bannerTimerRef.current = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % PROMO_BANNERS.length);
    }, 3500);
    return () => clearInterval(bannerTimerRef.current);
  }, []);

  const handleBannerClick = (onClick) => {
    if (onClick === 'plans') onGoToPlans();
    else if (onClick === 'feed') onGoToFeed();
    else if (onClick === 'repair') onTriggerEmergencyService();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '0' }}>

      {/* ==========================================
         A. MOBILE-ONLY NATIVE APPLICATION HOME PAGE
         ========================================== */}
      <div className="mobile-only-home-layout uc-tab-enter" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: '32px' }}>

        {/* ── STAT WIDGETS (IoT + AMC) ── */}
        <section className="mobile-home-welcome-block">
          <h2 className="mobile-home-welcome-title">
            Welcome back, <span>{user ? user.name.split(' ')[0] : 'Guest'}</span> 👋
          </h2>
          <p className="mobile-home-welcome-sub">
            Ecosystem active. Managing subscriptions and diagnostics for <strong>You</strong>.
          </p>
          <div className="mobile-home-stats-row">
            <div className="mobile-home-stat-widget tap-press" onClick={() => onGoToFeed()} style={{ cursor: 'pointer' }}>
              <div className="mobile-home-stat-widget-icon" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                <Cpu size={18} />
              </div>
              <div className="mobile-home-stat-widget-info">
                <span className="mobile-home-stat-widget-label">IoT Sensors</span>
                <span className="mobile-home-stat-widget-value" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="pulse-green-dot" />
                  {appliances.filter(a => a.iotEnabled).length} Connected
                </span>
              </div>
            </div>
            <div className="mobile-home-stat-widget tap-press" onClick={() => onGoToPlans()} style={{ cursor: 'pointer' }}>
              <div className="mobile-home-stat-widget-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                <ShieldCheck size={18} />
              </div>
              <div className="mobile-home-stat-widget-info">
                <span className="mobile-home-stat-widget-label">AMC Protection</span>
                <span className="mobile-home-stat-widget-value" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="pulse-blue-dot" />
                  {appliances.length} Devices
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── HERO CARD V2 (Orange gradient, new typography) ── */}
        <section className="mobile-home-hero-card-v2">
          <h1 className="mobile-home-hero-title-v2">Expert Care For <span>Your Devices</span></h1>
          <p className="mobile-home-hero-sub-v2">
            Book certified technicians for repairs, AMC plans &amp; smart IoT monitoring.
          </p>

          {/* Search Bar */}
          <div className="mobile-uc-search-container" style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} onClick={() => {
            const input = document.getElementById('mobile-uc-search-input-v2');
            if (input) input.focus();
          }}>
            <Search size={18} className="mobile-uc-search-icon" />
            <input
              id="mobile-uc-search-input-v2"
              type="text"
              placeholder="Search appliance (e.g. AC, TV, Fridge...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsMobileSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsMobileSearchFocused(false), 250)}
            />
          </div>

          {/* Offer Chips */}
          <div className="uc-offer-chip-row" style={{ padding: '10px 0 0 0' }}>
            <button className="uc-offer-chip" onClick={onGoToPlans}>
              <span className="chip-dot" />
              Save ₹500 on AMC
            </button>
            <button className="uc-offer-chip" onClick={onTriggerEmergencyService}>
              <span className="chip-dot" />
              Same Day Repair
            </button>
            <button className="uc-offer-chip" onClick={onGoToFeed}>
              <span className="chip-dot" />
              Free IoT Setup
            </button>
          </div>

          {/* Search Dropdown */}
          {isMobileSearchFocused && (
            <div
              className="mobile-search-dropdown"
              style={{
                marginTop: '10px', borderRadius: '12px', background: 'var(--bg-primary)',
                border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.07)',
                maxHeight: '280px', overflowY: 'auto', textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: '4px',
                padding: '8px', zIndex: 50, position: 'relative'
              }}
            >
              {searchQuery.trim() === '' ? (
                <>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94a3b8', padding: '6px 8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Branded Plans</div>
                  {SEARCH_ITEMS.filter(item => item.category !== 'Local Market').slice(0, 5).map(item => (
                    <button key={item.id} onMouseDown={() => { setSearchQuery(item.name); onSelectCatalogItem(getPlannerType(item.id)); }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>❄️ {item.name}</span>
                      <span style={{ fontSize: '0.6rem', color: '#f37021', fontWeight: 800 }}>AMC Shield</span>
                    </button>
                  ))}
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94a3b8', padding: '8px 8px 4px 8px', letterSpacing: '0.04em', textTransform: 'uppercase', borderTop: '1px solid #f1f5f9' }}>Local Covered</div>
                  {SEARCH_ITEMS.filter(item => item.category === 'Local Market').slice(0, 5).map(item => (
                    <button key={item.id} onMouseDown={() => { setSearchQuery(item.name); onSelectCatalogItem(getPlannerType(item.id)); }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>🛠️ {item.name}</span>
                      <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>Unbranded</span>
                    </button>
                  ))}
                </>
              ) : (
                SEARCH_ITEMS.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8).map(item => (
                  <button key={item.id} onMouseDown={() => { setSearchQuery(item.name); onSelectCatalogItem(getPlannerType(item.id)); }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>{item.category === 'Local Market' ? '🛠️' : '🔍'} {item.name}</span>
                    <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>{item.category}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </section>

        {/* ── AUTO-SCROLLING PROMO BANNER CAROUSEL ── */}
        <div className="uc-promo-banner-section">
          <div className="uc-promo-banner-track-wrap">
            <div className="uc-promo-banner-track" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
              {PROMO_BANNERS.map((banner, idx) => (
                <div
                  key={idx}
                  className="uc-promo-banner-slide"
                  style={{ background: banner.gradient }}
                  onClick={() => handleBannerClick(banner.onClick)}
                >
                  <span className="uc-promo-slide-tag">{banner.tag}</span>
                  <p className="uc-promo-slide-title">{banner.title}</p>
                  <p className="uc-promo-slide-sub">{banner.sub}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="uc-promo-dots">
            {PROMO_BANNERS.map((_, idx) => (
              <button
                key={idx}
                className={`uc-promo-dot${currentBanner === idx ? ' active' : ''}`}
                onClick={() => {
                  setCurrentBanner(idx);
                  clearInterval(bannerTimerRef.current);
                  bannerTimerRef.current = setInterval(() => setCurrentBanner(p => (p + 1) % PROMO_BANNERS.length), 3500);
                }}
              />
            ))}
          </div>
        </div>

        {/* ── ACTION CARDS ── */}
        <section className="mobile-home-action-cards-grid">
          <div className="mobile-home-action-card tap-press">
            <div>
              <h3 className="mobile-home-action-card-header">Service Request</h3>
              <p className="mobile-home-action-card-desc">Book an expert technician for quick home appliance repairs.</p>
            </div>
            <button className="mobile-home-action-card-btn" onClick={onTriggerEmergencyService}>
              Request Repair Visit <ArrowRight size={12} />
            </button>
          </div>
          <div className="mobile-home-action-card tap-press">
            <div>
              <h3 className="mobile-home-action-card-header">Activate AMC Plan</h3>
              <p className="mobile-home-action-card-desc">Protect your appliances under HOMIGO's protection shield.</p>
            </div>
            <button className="mobile-home-action-card-btn" onClick={onGoToPlanner}>
              Buy Protection Plan <ArrowRight size={12} />
            </button>
          </div>
        </section>

        {/* ── TRUST BADGE STRIP ── */}
        <div className="uc-trust-strip">
          <div className="uc-trust-item">
            <div className="uc-trust-icon">✅</div>
            <span className="uc-trust-label">Verified Experts</span>
          </div>
          <div className="uc-trust-divider" />
          <div className="uc-trust-item">
            <div className="uc-trust-icon">⭐</div>
            <span className="uc-trust-label">4.8 Rated</span>
          </div>
          <div className="uc-trust-divider" />
          <div className="uc-trust-item">
            <div className="uc-trust-icon">🔒</div>
            <span className="uc-trust-label">Secure Payment</span>
          </div>
          <div className="uc-trust-divider" />
          <div className="uc-trust-item">
            <div className="uc-trust-icon">⚡</div>
            <span className="uc-trust-label">Same Day</span>
          </div>
        </div>

        {/* ── POPULAR SERVICES HORIZONTAL SCROLL ── */}
        <section className="uc-popular-section">
          <div className="uc-popular-header">
            <span className="uc-popular-title">Popular Services</span>
            <button className="uc-popular-see-all" onClick={onGoToPlanner}>
              See all <ChevronRight size={12} />
            </button>
          </div>
          <div className="uc-popular-scroll">
            {POPULAR_SERVICES.map(svc => (
              <div key={svc.id} className="uc-popular-card" onClick={() => onSelectCatalogItem(getPlannerType(svc.id))}>
                <div className="uc-popular-card-img">
                  <img src={svc.imgUrl} alt={svc.name} />
                </div>
                <div className="uc-popular-card-body">
                  <div className="uc-popular-card-name">{svc.name}</div>
                  <div className="uc-popular-card-desc">{svc.desc}</div>
                  <div className="uc-popular-card-footer">
                    <span className="uc-popular-card-price">{svc.price}</span>
                    <span className="uc-popular-card-rating"><span className="star">★</span>{svc.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BROWSE EXPERTISE (Enhanced Orange Icon Grid) ── */}
        <section className="mobile-home-explore-section">
          <h2 className="mobile-home-explore-title">Browse Our Expertise</h2>
          <div className="mobile-home-explore-grid">
            {filteredServices.map(service => (
              <div
                key={service.id}
                className="mobile-home-explore-item"
                onClick={() => onSelectCatalogItem(getPlannerType(service.id))}
              >
                <div className="mobile-home-explore-circle-v2">
                  <img
                    src={service.imgUrl}
                    alt={service.name}
                    className="mobile-home-explore-img"
                  />
                </div>
                <span className="mobile-home-explore-label-v2">{service.name}</span>
              </div>
            ))}
          </div>
          {filteredServices.length === 0 && (
            <p style={{ color: '#718096', fontSize: '0.8rem', textAlign: 'center', padding: '16px 0' }}>
              No services found matching "{searchQuery}"
            </p>
          )}
        </section>

        {/* ── IN THE SPOTLIGHT (kept, refreshed) ── */}
        <section className="mobile-uc-spotlight-section">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1c29', margin: '0 0 12px 0' }}>In the spotlight</h2>
          <div className="mobile-uc-spotlight-scroll">
            <div className="mobile-uc-spotlight-card" onClick={onGoToPlanner}>
              <span className="mobile-uc-spotlight-tag">AMC Offer</span>
              <div className="mobile-uc-spotlight-text" style={{ textAlign: 'left' }}>
                <h4>AMC Plans</h4>
                <p>Unified cover from ₹1,999/yr.</p>
              </div>
            </div>
            <div className="mobile-uc-spotlight-card" onClick={onGoToFeed}>
              <span className="mobile-uc-spotlight-tag">Smart IoT</span>
              <div className="mobile-uc-spotlight-text" style={{ textAlign: 'left' }}>
                <h4>IoT Sensors</h4>
                <p>Real-time device health monitoring.</p>
              </div>
            </div>
            <div className="mobile-uc-spotlight-card" onClick={onToggleChatbot}>
              <span className="mobile-uc-spotlight-tag">Support</span>
              <div className="mobile-uc-spotlight-text" style={{ textAlign: 'left' }}>
                <h4>24/7 Support</h4>
                <p>Expert chat assistance anytime.</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ==========================================
         B. DESKTOP-ONLY WEB LAYOUT
         ========================================== */}
      <div className="desktop-only-home-layout" style={{ display: 'flex', flexDirection: 'column', gap: '48px', padding: '10px 0' }}>
        
        {/* 1. HERO CTA SECTION */}
        <section className="homehub-hero-section" style={{
          background: 'linear-gradient(180deg, #fff7f2 0%, #ffffff 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '64px 40px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.03em' }}>
            Expert Care For Your Devices
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '32px' }}>
            Quick & easy repair and maintenance services for your electronics. Instant repairs, damage protection & AMC plans available.
          </p>

          {/* Search Dropdown Bar */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-primary)',
            border: '1.5px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '8px',
            maxWidth: '750px',
            margin: '0 auto',
            gap: '8px',
            alignItems: 'center',
            boxShadow: 'var(--shadow-md)',
            position: 'relative'
          }}>
            {/* Map Pin City Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', borderRight: '1.5px solid var(--border-color)' }}>
              <MapPin size={20} style={{ color: 'var(--brand-primary)' }} />
              <select 
                value={selectedCity} 
                onChange={(e) => onCityChange(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px 20px 6px 0',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  width: 'auto',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {Array.from(new Set([...CITIES, selectedCity])).filter(Boolean).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Search Field wrapper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, padding: '0 8px', position: 'relative' }}>
              <Search size={20} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search for an appliance (e.g. Air Conditioner, Refrigerator...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.95rem'
                }}
              />

              {/* Autocomplete Suggestion Dropdown */}
              {isSearchFocused && (
                <div className="search-dropdown" style={{ minWidth: '550px', right: '-8px', left: 'auto', maxHeight: '420px', overflow: 'hidden' }}>
                  {searchQuery.trim() === '' ? (
                    /* 2-column layout when empty / focused */
                    <div style={{ display: 'flex', width: '100%' }}>
                      
                      {/* Left Column: Popular Branded Plans */}
                      <div style={{ flex: 1, borderRight: '1px solid var(--border-color)', padding: '16px' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px', textTransform: 'uppercase' }}>
                          Popular Branded Plans
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {SEARCH_ITEMS.filter(item => item.category !== 'Local Market').slice(0, 6).map((item) => (
                            <button
                              key={item.id}
                              className="search-dropdown-item"
                              onMouseDown={() => {
                                setSearchQuery(item.name);
                                onSelectCatalogItem(getPlannerType(item.id));
                              }}
                            >
                              <span>🔍 {item.name}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 700 }}>AMC Shield</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right Column: Local / Unbranded Covered Items */}
                      <div style={{ flex: 1, padding: '16px', background: 'var(--bg-secondary)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px', textTransform: 'uppercase' }}>
                          Local covered appliances
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {SEARCH_ITEMS.filter(item => item.category === 'Local Market').slice(0, 6).map((item) => (
                            <button
                              key={item.id}
                              className="search-dropdown-item"
                              onMouseDown={() => {
                                setSearchQuery(item.name);
                                onSelectCatalogItem(getPlannerType(item.id));
                              }}
                            >
                              <span>🛠️ {item.name}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Unbranded</span>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* Search results lists */
                    <div style={{ padding: '8px' }}>
                      {SEARCH_ITEMS.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                        SEARCH_ITEMS.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                          <button
                            key={item.id}
                            className="search-dropdown-item"
                            onMouseDown={() => {
                              setSearchQuery(item.name);
                              onSelectCatalogItem(getPlannerType(item.id));
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{item.category === 'Local Market' ? '🛠️' : '🔍'}</span>
                              <span style={{ fontWeight: 700 }}>{item.name}</span>
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{item.category}</span>
                          </button>
                        ))
                      ) : (
                        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          ⚠️ No plans found for "{searchQuery}". Try searching for 'AC', 'TV', or 'Laptop'.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '32px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>✔️ Unified AMC Subscription</span>
            <span>✔️ Smart Telemetry Sensors</span>
            <span>✔️ Same-Day Doorstep Service</span>
          </div>
        </section>

        {/* 2. QUICK ACTION CARDS */}
        <section className="homehub-actions-section">
          
          {/* Card A: Service Request */}
          <div className="replicated-card homehub-action-card" onClick={onTriggerEmergencyService}>
            <div className="homehub-action-icon-wrapper" style={{ background: '#fff2f2', color: 'var(--color-danger)' }}>
              <Wrench size={32} />
            </div>
            <div style={{ flexGrow: 1, textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Request Repair Visit</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Book verified technicians for diagnostic troubleshooting or standard breakdowns.</p>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Card B: Activate Plan */}
          <div className="replicated-card homehub-action-card" onClick={onGoToPlanner}>
            <div className="homehub-action-icon-wrapper" style={{ background: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
              <Shield size={32} />
            </div>
            <div style={{ flexGrow: 1, textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Buy Protection Plan</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Create custom multi-brand subscription quotes and claim cashless coverage.</p>
            </div>
            <ArrowRight size={20} style={{ color: 'var(--text-muted)' }} />
          </div>

        </section>

        {/* 3. BROWSE OUR EXPERTISE GRID */}
        <section style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '32px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Browse Our Expertise
          </h2>
          
          {filteredServices.length > 0 ? (
            <div className="homehub-services-grid">
              {filteredServices.map(service => (
                <div 
                  key={service.id} 
                  onClick={() => onSelectCatalogItem(getPlannerType(service.id))}
                  className="homehub-service-item"
                >
                  <div className="homehub-service-icon-container service-icon-circle-hover">
                    <img 
                      src={service.imgUrl} 
                      alt={service.name}
                      className="homehub-service-icon-img"
                    />
                  </div>
                  <div>
                    <span className="homehub-service-label">
                      {service.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No appliance categories found matching your query.</p>
          )}
        </section>

        <section className="homehub-why-choose-us" style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brand-primary)', display: 'block' }}>10,000+</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>Retail Stores</p>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brand-primary)', display: 'block' }}>3,300+</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>Service Centers</p>
          </div>
          <div>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brand-primary)', display: 'block' }}>2.5 Crore+</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>Customers Serviced</p>
          </div>
        </section>

        {/* 5. CUSTOMER TESTIMONIALS CAROUSEL */}
        <section className="replicated-card" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '36px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Why Our Customers Trust HOMIGO</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-secondary" onClick={prevTestimonial} style={{ padding: '8px 12px' }}>
                <ChevronLeft size={16} />
              </button>
              <button className="btn-secondary" onClick={nextTestimonial} style={{ padding: '8px 12px' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '12px 0',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)' }}>
              {[...Array(TESTIMONIALS[currentTestimonial].rating)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--text-primary)', fontWeight: 500 }}>
              "{TESTIMONIALS[currentTestimonial].review}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{TESTIMONIALS[currentTestimonial].name}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>|</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{TESTIMONIALS[currentTestimonial].city} Customer</span>
            </div>
          </div>
        </section>

        {/* 5b. SAFE & SECURE TRUST STRIP */}
        <div className="uc-safe-strip">
          <div className="uc-safe-item">🔒 100% Secure Payments</div>
          <div className="uc-safe-item">✅ Verified & Background-Checked Experts</div>
          <div className="uc-safe-item">💳 EMI Options Available</div>
          <div className="uc-safe-item">⚡ Same-Day Doorstep Service</div>
          <div className="uc-safe-item">🛡️ 30-Day Service Guarantee</div>
        </div>

        {/* 6. SUPPORTED BRANDS SLIDER */}
        <section style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
            Supported Brands Covered under AMC
          </h2>
          
          <div className="brands-logo-row">
            {['Apple', 'Samsung', 'LG', 'Sony', 'Dell', 'HP', 'Lenovo', 'Xiaomi', 'Panasonic', 'Daikin', 'Voltas', 'Blue Star', 'Whirlpool', 'Godrej', 'Havells'].map((brand, idx) => (
              <div 
                key={idx} 
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#9297a6'
                }}
              >
                {brand}
              </div>
            ))}
          </div>
        </section>

        {/* 7. GET WOW EXPERIENCE ON OUR APP BANNER */}
        <section className="app-promo-section">
          <div>
            <h2 className="app-promo-title">Get WOW Experience<br/>on Our App</h2>
            <div className="app-promo-bullets">
              <div className="app-promo-bullet">
                <Check size={18} style={{ color: 'white' }} />
                <span>Same Day Service & Repairs</span>
              </div>
              <div className="app-promo-bullet">
                <Check size={18} style={{ color: 'white' }} />
                <span>Get Expert Assistance</span>
              </div>
              <div className="app-promo-bullet">
                <Check size={18} style={{ color: 'white' }} />
                <span>Best Offers & Discounts</span>
              </div>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
              Get the app download link on your mobile phone
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); alert('App download link sent to your mobile phone!'); }} className="phone-input-container">
              <span className="phone-prefix">+91</span>
              <input 
                type="text" 
                placeholder="Enter Mobile Number" 
                className="phone-input-field"
                required
              />
              <button type="submit" className="btn-get-link">GET APP LINK</button>
            </form>

            <div style={{ textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '16px', color: 'rgba(255,255,255,0.8)' }}>
              DOWNLOAD HOMIGO APP
            </div>

            <div className="app-badges-row">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                alt="Google Play" 
                className="app-store-badge"
              />
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                alt="App Store" 
                className="app-store-badge"
              />
            </div>
          </div>

          {/* CSS-DRAWN PHONE MOCKUP */}
          <div className="phone-mockup-wrapper">
            <div className="phone-mockup-img" style={{
              width: '240px',
              height: '440px',
              background: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              fontFamily: 'var(--font-sans)',
              overflow: 'hidden'
            }}>
              {/* Notch */}
              <div style={{
                width: '110px',
                height: '18px',
                background: '#1a1c29',
                borderRadius: '0 0 10px 10px',
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10
              }} />
              
              {/* Phone Screen Content */}
              <div style={{ padding: '24px 12px 12px', display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
                {/* Fake Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  <span>11:57</span>
                  <span>5G 🔋</span>
                </div>
                
                {/* Fake App Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0e7c8a', color: 'white', padding: '6px 8px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>HOMIGO App</span>
                  <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>Mumbai ▾</span>
                </div>
                
                {/* Promo Banner inside phone screen */}
                <div style={{
                  background: 'linear-gradient(to right, #0e7c8a, #084c56)',
                  borderRadius: '8px',
                  padding: '12px 10px',
                  color: 'white',
                  textAlign: 'left'
                }}>
                  <span style={{ fontSize: '0.52rem', fontWeight: 800, background: '#fff', color: '#0e7c8a', padding: '2px 4px', borderRadius: '3px', textTransform: 'uppercase' }}>OFFER</span>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: '4px', color: 'white' }}>AMC Plans</h4>
                  <p style={{ fontSize: '0.55rem', opacity: 0.9, marginTop: '2px', color: 'rgba(255,255,255,0.9)' }}>Save up to 40% on appliance repairs & maintenance.</p>
                </div>

                {/* Grid of mini app tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '6px' }}>
                  {[
                    { icon: '🔧', name: 'Device Repair' },
                    { icon: '❄️', name: 'AC Service' },
                    { icon: '🛡️', name: 'Home Cover' },
                    { icon: '📺', name: 'TV Protection' },
                    { icon: '🧊', name: 'Fridge Protection' },
                    { icon: '💧', name: 'Water Purifier' }
                  ].map((tile, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{tile.icon}</span>
                      <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-primary)' }}>{tile.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. COMPREHENSIVE DARK FOOTER */}
        <footer className="dark-footer">
          
          {/* Top row */}
          <div className="footer-top-brand">
            <div>
              <span className="footer-logo-text">
                HOMI<span style={{ color: 'var(--brand-primary)' }}>GO</span>
              </span>
              <p style={{ color: '#9297a6', fontSize: '0.85rem' }}>Expert Care For Your Devices & Appliances</p>
              <div className="footer-social-icons">
                <button className="social-icon-btn">FB</button>
                <button className="social-icon-btn">X</button>
                <button className="social-icon-btn">IG</button>
                <button className="social-icon-btn">YT</button>
              </div>
            </div>
          </div>

          {/* Link columns grid */}
          <div className="footer-links-grid">
            
            <div className="footer-col">
              <h4 className="footer-col-title">Company</h4>
              <ul className="footer-links-list">
                <li className="footer-link-item"><a href="#about">About Us</a></li>
                <li className="footer-link-item"><a href="#blog">Blog</a></li>
                <li className="footer-link-item"><a href="#careers">Careers</a></li>
                <li className="footer-link-item"><a href="#media">In The Media</a></li>
                <li className="footer-link-item"><a href="#whitepapers">Whitepapers</a></li>
                <li className="footer-link-item"><a href="#contact">Contact Us</a></li>
                <li className="footer-link-item"><a href="#sitemap">Sitemap</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Products</h4>
              <ul className="footer-links-list">
                <li className="footer-link-item"><a href="#mobiles">Mobile Phones</a></li>
                <li className="footer-link-item"><a href="#laptops">Laptops</a></li>
                <li className="footer-link-item"><a href="#tablets">Tablets</a></li>
                <li className="footer-link-item"><a href="#cameras">Digital Cameras</a></li>
                <li className="footer-link-item"><a href="#printers">Printers & Scanners</a></li>
                <li className="footer-link-item"><a href="#ac">Air Conditioners</a></li>
                <li className="footer-link-item"><a href="#washing">Washing Machine</a></li>
                <li className="footer-link-item"><a href="#fridges">Refrigerators</a></li>
                <li className="footer-link-item"><a href="#microwaves">Microwaves</a></li>
                <li className="footer-link-item"><a href="#tvs">Televisions</a></li>
                <li className="footer-link-item"><a href="#fitness">Fitness Tracker</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Policies</h4>
              <ul className="footer-links-list">
                <li className="footer-link-item"><a href="#terms">Terms of Use</a></li>
                <li className="footer-link-item"><a href="#privacy">Privacy Policy</a></li>
                <li className="footer-link-item"><a href="#service">Terms of Service</a></li>
                <li className="footer-link-item"><a href="#returns">Annual Returns</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Warranty Check</h4>
              <ul className="footer-links-list">
                <li className="footer-link-item"><a href="#apple">Apple Warranty Check</a></li>
                <li className="footer-link-item"><a href="#iphone">Iphone Warranty Check</a></li>
                <li className="footer-link-item"><a href="#dell">Dell Warranty Check</a></li>
                <li className="footer-link-item"><a href="#sony">Sony Warranty Check</a></li>
                <li className="footer-link-item"><a href="#lenovo">Lenovo Warranty Check</a></li>
                <li className="footer-link-item"><a href="#samsung">Samsung Warranty Check</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Other Business</h4>
              <ul className="footer-links-list">
                <li className="footer-link-item"><a href="#b2b">B2B</a></li>
                <li className="footer-link-item"><a href="#enterprise">Enterprise</a></li>
              </ul>
            </div>

          </div>

          <hr className="footer-divider" />

          {/* Bottom row */}
          <div className="footer-bottom-row">
            <span style={{ fontSize: '0.85rem', color: '#9297a6' }}>
              2010-2026 © HOMIGO. All Rights Reserved.
            </span>
            <div className="payments-row">
              <span className="payment-badge">VISA</span>
              <span className="payment-badge">MASTERCARD</span>
              <span className="payment-badge">AMEX</span>
              <span className="payment-badge">NET BANKING</span>
              <span className="payment-badge">EASY EMI</span>
            </div>
          </div>

        </footer>

      </div>

    </div>
  );
}
