import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import HomeHub from './components/HomeHub';
import Dashboard from './components/Dashboard';
import AMCPlanner from './components/AMCPlanner';
import BusinessPitch from './components/BusinessPitch';
import CheckoutWizard from './components/CheckoutWizard';
import AMCOverlay from './components/AMCOverlay';
import IoTOverlay from './components/IoTOverlay';
import CartOverlay from './components/CartOverlay';
import Account from './components/Account';
import { lookupPincode } from './utils/pincodeDb';
import { 
  Cpu, 
  ShieldCheck, 
  Shield,
  User, 
  ShoppingCart, 
  ChevronDown, 
  LogOut, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Wrench,
  Lock,
  Mail,
  UserCheck,
  Phone,
  Clock,
  Home,
  Activity,
  Search,
  MapPin,
  Calendar,
  Tag
} from 'lucide-react';

const MEGA_MENU_COLUMNS = [
  [
    { id: 'ac', name: 'Air Conditioner' },
    { id: 'air_purifier', name: 'Air Purifier' },
    { id: 'audio_system', name: 'Audio System' },
    { id: 'chopper_blender', name: 'Chopper and Blender' },
    { id: 'desktop', name: 'Desktop' },
    { id: 'camera', name: 'Digital Camera' }
  ],
  [
    { id: 'fan', name: 'Fan' },
    { id: 'fitness_tracker', name: 'Fitness Tracker' },
    { id: 'gaming_console', name: 'Gaming Console' },
    { id: 'geyser', name: 'Geyser' },
    { id: 'groom_hair', name: 'Groom & Hair Care' },
    { id: 'headphone', name: 'Headphone' }
  ],
  [
    { id: 'juicer_grinder', name: 'Juicer Mixer Grinder' },
    { id: 'kettle', name: 'Kettle' },
    { id: 'laptop', name: 'Laptop' },
    { id: 'microwave', name: 'Microwave' },
    { id: 'mobile', name: 'Mobile Phone' },
    { id: 'printer', name: 'Printer and Scanner' }
  ],
  [
    { id: 'refrigerator', name: 'Refrigerator' },
    { id: 'room_cooler', name: 'Room Cooler' },
    { id: 'smartwatch', name: 'Smartwatch' },
    { id: 'tablet', name: 'Tablet' },
    { id: 'tv', name: 'Television' },
    { id: 'washing_machine', name: 'Washing Machine' }
  ],
  [
    { id: 'local_ac', name: 'Local AC (Unbranded)' },
    { id: 'local_cooler', name: 'Local Air Cooler' },
    { id: 'local_water_purifier', name: 'Local Water Purifier' },
    { id: 'local_geyser', name: 'Local Water Heater' },
    { id: 'local_fan', name: 'Local Ceiling Fan' },
    { id: 'local_tv', name: 'Local LED TV (Unbranded)' }
  ]
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

const formatMessageText = (text) => {
  if (!text) return '';
  const parts = text.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} style={{ fontWeight: 700 }}>{part}</strong>;
    }
    return part;
  });
};

function ChatbotInlineForm({ form, onSubmit }) {
  const [formData, setFormData] = useState(() => {
    const init = {};
    form.fields.forEach(f => {
      init[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
    });
    return init;
  });

  const handleChange = (name, val) => {
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (let f of form.fields) {
      if (f.required !== false && !formData[f.name]) {
        alert(`Please fill in ${f.label}`);
        return;
      }
    }
    onSubmit(formData);
  };

  return (
    <form className="chatbot-form-bubble" onSubmit={handleSubmit}>
      <div className="chatbot-form-title">📝 Enter Details</div>
      {form.fields.map(f => (
        <div key={f.name} className="chatbot-form-group">
          <label style={{ display: 'block', fontSize: '0.72rem', color: '#a0aec0', marginBottom: '4px', fontWeight: '600' }}>{f.label}</label>
          {f.type === 'textarea' ? (
            <textarea
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                outline: 'none',
                minHeight: '60px',
                fontFamily: 'inherit',
                resize: 'none'
              }}
              placeholder={f.placeholder || ''}
              value={formData[f.name] || ''}
              onChange={(e) => handleChange(f.name, e.target.value)}
              required
            />
          ) : f.type === 'select' ? (
            <select
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                outline: 'none'
              }}
              value={formData[f.name] || ''}
              onChange={(e) => handleChange(f.name, e.target.value)}
              required
            >
              <option value="" disabled style={{ background: '#1a1c29', color: 'white' }}>Select payment method</option>
              {f.options.map(opt => (
                <option key={opt.value} value={opt.value} style={{ background: '#1a1c29', color: 'white' }}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={f.type}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                outline: 'none'
              }}
              value={formData[f.name] || ''}
              placeholder={f.placeholder || ''}
              onChange={(e) => handleChange(f.name, e.target.value)}
              required
            />
          )}
        </div>
      ))}
      <button type="submit" className="chatbot-form-submit-btn">
        {form.submitLabel || 'Submit'}
      </button>
    </form>
  );
}



function generateOtpCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateTicketId() {
  return `HMGO-${Math.floor(1000 + Math.random() * 9000)}`;
}

function generateRandomIp() {
  return `192.168.1.${Math.floor(10 + Math.random() * 90)}`;
}

function scrollAppShellToTop() {
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

function resetAppScrollPosition() {
  scrollAppShellToTop();
  requestAnimationFrame(scrollAppShellToTop);
  setTimeout(scrollAppShellToTop, 0);
  setTimeout(scrollAppShellToTop, 80);
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [appTheme, setAppTheme] = useState(() => {
    return localStorage.getItem('homigo_app_theme') || 'light';
  });
  const [isNativeMobile, setIsNativeMobile] = useState(false);

  const [isSimulatingMobile, setIsSimulatingMobile] = useState(() => {
    return window.location.search.includes('simulate=mobile') || 
           localStorage.getItem('homigo_simulate_mobile') === 'true';
  });

  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('homigo_selected_city') || 'Mumbai';
  });
  const [addressDistrict, setAddressDistrict] = useState(() => {
    return localStorage.getItem('homigo_address_district') || '';
  });
  const [userAddress, setUserAddress] = useState(() => {
    return localStorage.getItem('homigo_user_address') || '';
  });
  const [addressType, setAddressType] = useState(() => {
    return localStorage.getItem('homigo_address_type') || 'Home';
  });
  const [addressHouse, setAddressHouse] = useState(() => {
    return localStorage.getItem('homigo_address_house') || '';
  });
  const [addressArea, setAddressArea] = useState(() => {
    return localStorage.getItem('homigo_address_area') || '';
  });
  const [addressLandmark, setAddressLandmark] = useState(() => {
    return localStorage.getItem('homigo_address_landmark') || '';
  });
  const [addressPincode, setAddressPincode] = useState(() => {
    return localStorage.getItem('homigo_address_pincode') || '';
  });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [accountActiveOverlay, setAccountActiveOverlay] = useState(null);

  useEffect(() => {
    if (appTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('homigo_app_theme', appTheme);
  }, [appTheme]);

  useEffect(() => {
    const checkNative = () => {
      const isCap = !!window.Capacitor;
      const isSmallScreen = window.innerWidth <= 768;
      setIsNativeMobile(isCap || isSmallScreen);
    };
    checkNative();
    window.addEventListener('resize', checkNative);
    return () => window.removeEventListener('resize', checkNative);
  }, []);

  // Auto-detect city on load (skip only if user has already saved a full address)
  useEffect(() => {
    const hasFullAddress = localStorage.getItem('homigo_address_house') &&
                           localStorage.getItem('homigo_address_area');
    if (hasFullAddress) return;

    // Clear any stale default city so detection runs fresh
    localStorage.removeItem('homigo_selected_city');

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.address || {};
          const detected =
            addr.city || addr.town || addr.village || addr.state_district || addr.state;
          if (detected) {
            setSelectedCity(detected);
          }
        } catch (_) {
          // silently fail, keep default
        }
      },
      () => {} // permission denied → keep default
    );
  }, []);

  const changeTab = (tab) => {
    // Reset checkout wizard states to exit checkout overlay when changing tabs
    setCheckoutAppliances([]);
    setCheckoutAppliance(null);

    // Reset account overlay screen when navigating tabs
    setAccountActiveOverlay(null);

    resetAppScrollPosition();

    if (!document.startViewTransition) {
      setActiveTab(tab);
    } else {
      document.startViewTransition(() => {
        flushSync(() => {
          setActiveTab(tab);
        });
      });
    }
  };

  const handlePincodeChange = (val) => {
    const cleanVal = val.replace(/\D/g, '');
    setAddressPincode(cleanVal);
    
    if (cleanVal.length === 6) {
      const result = lookupPincode(cleanVal);
      if (result) {
        setSelectedCity(result.city);
        setAddressDistrict(result.district);
        showToast(`Detected: ${result.district}, ${result.city}`, 'info');
      }
    }
  };

  useEffect(() => {
    if (selectedCity) {
      localStorage.setItem('homigo_selected_city', selectedCity);
    }
  }, [selectedCity]);

  useEffect(() => {
    localStorage.setItem('homigo_address_district', addressDistrict);
  }, [addressDistrict]);

  const [otpPurpose, setOtpPurpose] = useState('booking'); // 'booking' | 'register'
  const [pendingAuthUser, setPendingAuthUser] = useState(null); // { name, email }
  const [preselectedType, setPreselectedType] = useState('');
  
  // Auth States (Persistent session)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('homigo_logged_in_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Persistent User History
  const [appliances, setAppliances] = useState(() => {
    try {
      const storedUser = localStorage.getItem('homigo_logged_in_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const userKey = (parsedUser.email || parsedUser.phone || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
        const storedApps = localStorage.getItem(`homigo_apps_${userKey}`);
        if (storedApps) return JSON.parse(storedApps);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [bookings, setBookings] = useState(() => {
    try {
      const storedUser = localStorage.getItem('homigo_logged_in_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const userKey = (parsedUser.email || parsedUser.phone || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
        const storedBookings = localStorage.getItem(`homigo_bookings_${userKey}`);
        if (storedBookings) return JSON.parse(storedBookings);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('signin');
  const [toast, setToast] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [checkoutAppliance, setCheckoutAppliance] = useState(null);
  const [checkoutAppliances, setCheckoutAppliances] = useState([]);
  const [activeSummaryOverlay, setActiveSummaryOverlay] = useState(null); // 'amc' | 'iot' | null

  useEffect(() => {
    // Cancel/reset checkout if navigating to another tab
    setCheckoutAppliances([]);
    setCheckoutAppliance(null);
  }, [activeTab]);

  useLayoutEffect(() => {
    if (checkoutAppliances.length > 0 || checkoutAppliance) {
      resetAppScrollPosition();
    }
  }, [checkoutAppliances, checkoutAppliance]);

  // Cart state and local storage persistence
  const [cart, setCart] = useState(() => {
    try {
      const storedUser = localStorage.getItem('homigo_logged_in_user');
      const userKey = storedUser 
        ? (JSON.parse(storedUser).email || JSON.parse(storedUser).phone || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_') 
        : 'guest';
      const storedCart = localStorage.getItem(`homigo_cart_${userKey}`);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartPopping, setIsCartPopping] = useState(false);

  // Service request booking states
  const [isServiceRequestFormOpen, setIsServiceRequestFormOpen] = useState(false);
  const [serviceReqName, setServiceReqName] = useState(user?.name || '');
  const [serviceReqPhone, setServiceReqPhone] = useState('');
  const [serviceReqApplianceId, setServiceReqApplianceId] = useState('');
  const [serviceReqCustomAppliance, setServiceReqCustomAppliance] = useState('');
  const [serviceReqCustomType, setServiceReqCustomType] = useState('Air Conditioner (AC)');
  const [serviceReqCustomBrand, setServiceReqCustomBrand] = useState('Daikin');
  const [serviceReqCustomTypeName, setServiceReqCustomTypeName] = useState('');
  const [serviceReqCustomBrandName, setServiceReqCustomBrandName] = useState('');
  const [serviceReqDate, setServiceReqDate] = useState('Tomorrow');
  const [serviceReqTime, setServiceReqTime] = useState('Morning (09:00 AM - 12:00 PM)');
  const [serviceReqNotes, setServiceReqNotes] = useState('');
  const [serviceReqSuccessInfo, setServiceReqSuccessInfo] = useState(null);

  // OTP security verification states
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [pendingBookingPayload, setPendingBookingPayload] = useState(null);
  const [mockNotification, setMockNotification] = useState(null);

  // AI Chatbot states
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const [chatbotFlow, setChatbotFlow] = useState(null); // 'buy_amc', 'service_booking', 'others'
  const [chatbotStep, setChatbotStep] = useState(0);
  const [chatbotData, setChatbotData] = useState({});
  const [chatbotInputValue, setChatbotInputValue] = useState('');

  // ----------------------------------------------------
  // BROWSER NAVIGATION / BACK BUTTON INTERACTION PREMISE
  // ----------------------------------------------------
  const lastHistoryStateRef = useRef(null);
  const currentActiveTabRef = useRef(activeTab);

  useEffect(() => {
    currentActiveTabRef.current = activeTab;
  }, [activeTab]);

  // Initialize history state on load
  useEffect(() => {
    const initialState = {
      tab: activeTab,
      isCartOpen,
      activeSummaryOverlay,
      checkoutActive: !!(checkoutAppliances.length > 0 || checkoutAppliance),
      isServiceRequestFormOpen,
      isOtpModalOpen,
      isAuthModalOpen,
      accountActiveOverlay
    };
    window.history.replaceState(initialState, '');
    lastHistoryStateRef.current = initialState;
  }, []);

  // Synchronize state changes -> pushState
  useEffect(() => {
    const currentState = {
      tab: activeTab,
      isCartOpen,
      activeSummaryOverlay,
      checkoutActive: !!(checkoutAppliances.length > 0 || checkoutAppliance),
      isServiceRequestFormOpen,
      isOtpModalOpen,
      isAuthModalOpen,
      accountActiveOverlay
    };

    if (lastHistoryStateRef.current) {
      const hasChanged = 
        lastHistoryStateRef.current.tab !== currentState.tab ||
        lastHistoryStateRef.current.isCartOpen !== currentState.isCartOpen ||
        lastHistoryStateRef.current.activeSummaryOverlay !== currentState.activeSummaryOverlay ||
        lastHistoryStateRef.current.checkoutActive !== currentState.checkoutActive ||
        lastHistoryStateRef.current.isServiceRequestFormOpen !== currentState.isServiceRequestFormOpen ||
        lastHistoryStateRef.current.isOtpModalOpen !== currentState.isOtpModalOpen ||
        lastHistoryStateRef.current.isAuthModalOpen !== currentState.isAuthModalOpen ||
        lastHistoryStateRef.current.accountActiveOverlay !== currentState.accountActiveOverlay;

      if (hasChanged) {
        window.history.pushState(currentState, '');
        lastHistoryStateRef.current = currentState;
      }
    }
  }, [
    activeTab,
    isCartOpen,
    activeSummaryOverlay,
    checkoutAppliances,
    checkoutAppliance,
    isServiceRequestFormOpen,
    isOtpModalOpen,
    isAuthModalOpen,
    accountActiveOverlay
  ]);

  // Listen to popstate event (browser back/forward button) -> React state
  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;
      if (!state) return;

      // Update ref so we don't push again in the synchronization effect
      lastHistoryStateRef.current = state;

      // Apply states to React
      if (state.tab !== undefined && state.tab !== currentActiveTabRef.current) {
        changeTab(state.tab);
      }
      if (state.isCartOpen !== undefined) setIsCartOpen(state.isCartOpen);
      if (state.activeSummaryOverlay !== undefined) setActiveSummaryOverlay(state.activeSummaryOverlay);
      
      if (state.checkoutActive !== undefined) {
        if (!state.checkoutActive) {
          setCheckoutAppliances([]);
          setCheckoutAppliance(null);
        }
      }
      if (state.isServiceRequestFormOpen !== undefined) setIsServiceRequestFormOpen(state.isServiceRequestFormOpen);
      if (state.isOtpModalOpen !== undefined) setIsOtpModalOpen(state.isOtpModalOpen);
      if (state.isAuthModalOpen !== undefined) setIsAuthModalOpen(state.isAuthModalOpen);
      if (state.accountActiveOverlay !== undefined) setAccountActiveOverlay(state.accountActiveOverlay);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial message when opening chatbot
  const initChatbot = () => {
    setChatbotFlow(null);
    setChatbotStep(0);
    setChatbotData({});
    setChatbotInputValue('');
    setChatbotMessages([
      {
        id: 'msg-init-1',
        sender: 'bot',
        text: '👋 Hello! Welcome to the HOMIGO AI Assistant. How can I help you today?',
      },
      {
        id: 'msg-init-2',
        sender: 'bot',
        text: 'Please select one of the options below to get started:',
        options: [
          { value: 'buy_amc', label: '🛡️ AMC Plans' },
          { value: 'service_booking', label: '🛠️ Service Booking' },
          { value: 'others', label: '💬 Others' }
        ]
      }
    ]);
  };

  const handleToggleChatbot = () => {
    if (!isChatbotOpen) {
      initChatbot();
    }
    setIsChatbotOpen(!isChatbotOpen);
  };

  const handleChatbotOption = (value, label) => {
    if (value === 'back_to_menu') {
      initChatbot();
      return;
    }

    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: label
    };
    
    setChatbotMessages(prev => [...prev, userMsg]);
    
    if (!chatbotFlow) {
      if (value === 'buy_amc') {
        changeTab('planner'); // Redirect to AMC buying window
        setIsChatbotOpen(false); // Close chatbot
        setChatbotFlow('buy_amc');
        setChatbotStep(1);
        setTimeout(() => {
          setChatbotMessages(prev => [
            ...prev,
            {
              id: `msg-bot-${Date.now()}`,
              sender: 'bot',
              text: 'Great! Let\'s get your appliance protected under HOMIGO AMC. Which appliance do you want to buy the AMC for?',
              options: [
                { value: 'Air Conditioner', label: '❄️ Air Conditioner' },
                { value: 'Refrigerator', label: '🍎 Refrigerator' },
                { value: 'Washing Machine', label: '🧺 Washing Machine' },
                { value: 'Water Purifier', label: '💧 Water Purifier' },
                { value: 'Television', label: '📺 Television' }
              ]
            }
          ]);
        }, 600);
      } else if (value === 'service_booking') {
        changeTab('home'); // Go to home tab
        setIsServiceRequestFormOpen(true); // Open Service booking window modal
        setIsChatbotOpen(false); // Close chatbot
        setChatbotFlow('service_booking');
        setChatbotStep(1);
        setTimeout(() => {
          setChatbotMessages(prev => [
            ...prev,
            {
              id: `msg-bot-${Date.now()}`,
              sender: 'bot',
              text: 'Sure! HOMIGO provides certified expert repairs. Please select your booking type:',
              options: [
                { value: 'amc_visit', label: '🛡️ AMC Service Visit (Free checkup)' },
                { value: 'service_request', label: '🛠️ Service Request (Breakdown/Fault)' }
              ]
            }
          ]);
        }, 600);
      } else if (value === 'others') {
        setChatbotFlow('others');
        setChatbotStep(1);
        setTimeout(() => {
          setChatbotMessages(prev => [
            ...prev,
            {
              id: `msg-bot-${Date.now()}`,
              sender: 'bot',
              text: 'Understood. Please brief your issue or query in detail below, and we will share our coordinates and log a call back if needed.',
              form: {
                type: 'brief_issue',
                fields: [
                  { name: 'brief', label: 'Briefly describe your issue', type: 'textarea', placeholder: 'e.g. Need customized corporate pricing...' }
                ],
                submitLabel: 'Submit Query'
              }
            }
          ]);
        }, 600);
      }
    } else if (chatbotFlow === 'buy_amc') {
      if (chatbotStep === 1) {
        setChatbotData(prev => ({ ...prev, applianceType: value }));
        setChatbotStep(2);
        setTimeout(() => {
          setChatbotMessages(prev => [
            ...prev,
            {
              id: `msg-bot-${Date.now()}`,
              sender: 'bot',
              text: `Got it! A ${value}. Which brand is it?`,
              options: [
                { value: 'Samsung', label: 'Samsung' },
                { value: 'LG', label: 'LG' },
                { value: 'Daikin', label: 'Daikin' },
                { value: 'Voltas', label: 'Voltas' },
                { value: 'Sony', label: 'Sony' },
                { value: 'Other', label: 'Other/Generic' }
              ]
            }
          ]);
        }, 600);
      } else if (chatbotStep === 2) {
        setChatbotData(prev => ({ ...prev, brand: value }));
        setChatbotStep(3);
        setTimeout(() => {
          setChatbotMessages(prev => [
            ...prev,
            {
              id: `msg-bot-${Date.now()}`,
              sender: 'bot',
              text: `How old is your appliance?`,
              options: [
                { value: 'New / Under 1 year', label: '🆕 New / Under 1 year' },
                { value: '1 to 3 years old', label: '📅 1 to 3 years old' },
                { value: '3 to 5 years old', label: '⏳ 3 to 5 years old' }
              ]
            }
          ]);
        }, 600);
      } else if (chatbotStep === 3) {
        setChatbotData(prev => ({ ...prev, age: value }));
        setChatbotStep(4);
        setTimeout(() => {
          setChatbotMessages(prev => [
            ...prev,
            {
              id: `msg-bot-${Date.now()}`,
              sender: 'bot',
              text: `Choose your AMC Plan Duration:`,
              options: [
                { value: '1y', label: '🛡️ 1 Year Shield Plan (₹1,999)' },
                { value: '2y', label: '🥇 2 Years Premium Shield (₹3,499 - Save 10%)' },
                { value: '3y', label: '🚀 3 Years Ultimate IoT Shield (₹4,999 - Save 20% + Live IoT Telemetry)' }
              ]
            }
          ]);
        }, 600);
      } else if (chatbotStep === 4) {
        let costStr = '₹1,999';
        let nameStr = '1 Year Shield Plan';
        if (value === '2y') {
          costStr = '₹3,499';
          nameStr = '2 Years Premium Shield';
        } else if (value === '3y') {
          costStr = '₹4,999';
          nameStr = '3 Years Ultimate IoT Shield';
        }
        setChatbotData(prev => ({ 
          ...prev, 
          duration: nameStr,
          durationCode: value,
          cost: costStr 
        }));
        setChatbotStep(5);
        setTimeout(() => {
          setChatbotMessages(prev => [
            ...prev,
            {
              id: `msg-bot-${Date.now()}`,
              sender: 'bot',
              text: `Excellent choice! The ${nameStr} (${costStr}) provides comprehensive coverage against breakdowns and parts replacement. Let's capture your details.`,
              form: {
                type: 'amc_details',
                fields: [
                  { name: 'fullName', label: 'Full Name', type: 'text', defaultValue: user?.name || '' },
                  { name: 'phone', label: 'Mobile Number', type: 'tel', defaultValue: user?.phone || (user?.email && /^\d{10}$/.test(user.email) ? user.email : '') },
                  { name: 'address', label: 'Full Address', type: 'text', defaultValue: '' },
                  { name: 'payment', label: 'Payment Method', type: 'select', options: [
                    { value: 'UPI', label: 'UPI / QR Code Scan' },
                    { value: 'Card', label: 'Credit / Debit Card' },
                    { value: 'COD', label: 'Cash On Service Delivery' }
                  ]}
                ],
                submitLabel: 'Complete Purchase'
              }
            }
          ]);
        }, 600);
      }
    } else if (chatbotFlow === 'service_booking') {
      if (chatbotStep === 1) {
        const bookingTypeLabel = value === 'amc_visit' ? 'AMC Covered Maintenance Visit' : 'Breakdown Callout Dispatch';
        setChatbotData(prev => ({ 
          ...prev, 
          bookingType: bookingTypeLabel,
          isAmcCovered: value === 'amc_visit'
        }));
        setChatbotStep(2);
        
        setTimeout(() => {
          const appOptions = appliances.map(app => ({
            value: `${app.brand} ${app.name || app.type}`,
            label: `🛡️ ${app.brand} ${app.name || app.type} (${app.status})`
          }));
          
          appOptions.push({ value: 'other_appliance', label: '🔍 Other Appliance (Not covered under AMC)' });
          
          setChatbotMessages(prev => [
            ...prev,
            {
              id: `msg-bot-${Date.now()}`,
              sender: 'bot',
              text: 'Which appliance requires scheduling?',
              options: appOptions.length > 1 ? appOptions : [
                { value: 'Air Conditioner', label: '❄️ Air Conditioner' },
                { value: 'Refrigerator', label: '🍎 Refrigerator' },
                { value: 'Washing Machine', label: '🧺 Washing Machine' },
                { value: 'Water Purifier', label: '💧 Water Purifier' },
                { value: 'Television', label: '📺 Television' }
              ]
            }
          ]);
        }, 600);
      } else if (chatbotStep === 2) {
        if (value === 'other_appliance') {
          setChatbotStep(2.5);
          setTimeout(() => {
            setChatbotMessages(prev => [
              ...prev,
              {
                id: `msg-bot-${Date.now()}`,
                sender: 'bot',
                text: 'Please select the category of the appliance:',
                options: [
                  { value: 'Air Conditioner', label: '❄️ Air Conditioner' },
                  { value: 'Refrigerator', label: '🍎 Refrigerator' },
                  { value: 'Washing Machine', label: '🧺 Washing Machine' },
                  { value: 'Water Purifier', label: '💧 Water Purifier' },
                  { value: 'Television', label: '📺 Television' }
                ]
              }
            ]);
          }, 600);
        } else {
          setChatbotData(prev => ({ ...prev, serviceAppliance: value }));
          setChatbotStep(3);
          setTimeout(() => {
            setChatbotMessages(prev => [
              ...prev,
              {
                id: `msg-bot-${Date.now()}`,
                sender: 'bot',
                text: `Selected ${value}. Please configure your preferred slot:`,
                form: {
                  type: 'service_schedule',
                  fields: [
                    { name: 'date', label: 'Preferred Date', type: 'date', defaultValue: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
                    { name: 'slot', label: 'Preferred Slot', type: 'select', options: [
                      { value: 'Morning (09:00 AM - 12:00 PM)', label: 'Morning (09:00 AM - 12:00 PM)' },
                      { value: 'Afternoon (12:00 PM - 03:00 PM)', label: 'Afternoon (12:00 PM - 03:00 PM)' },
                      { value: 'Evening (03:00 PM - 06:00 PM)', label: 'Evening (03:00 PM - 06:00 PM)' },
                      { value: 'Night (06:00 PM - 09:00 PM)', label: 'Night (06:00 PM - 09:00 PM)' }
                    ]}
                  ],
                  submitLabel: 'Continue to Details'
                }
              }
            ]);
          }, 600);
        }
      } else if (chatbotStep === 2.5) {
        setChatbotData(prev => ({ ...prev, serviceAppliance: `General ${value}`, isAmcCovered: false }));
        setChatbotStep(3);
        setTimeout(() => {
          setChatbotMessages(prev => [
            ...prev,
            {
              id: `msg-bot-${Date.now()}`,
              sender: 'bot',
              text: `Got it, General ${value}. Note that since this appliance isn't protected by a HOMIGO active plan, a standard inspect callout fee of ₹499 applies. Please select slot:`,
              form: {
                type: 'service_schedule',
                fields: [
                  { name: 'date', label: 'Preferred Date', type: 'date', defaultValue: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
                  { name: 'slot', label: 'Preferred Slot', type: 'select', options: [
                    { value: 'Morning (09:00 AM - 12:00 PM)', label: 'Morning (09:00 AM - 12:00 PM)' },
                    { value: 'Afternoon (12:00 PM - 03:00 PM)', label: 'Afternoon (12:00 PM - 03:00 PM)' },
                    { value: 'Evening (03:00 PM - 06:00 PM)', label: 'Evening (03:00 PM - 06:00 PM)' },
                    { value: 'Night (06:00 PM - 09:00 PM)', label: 'Night (06:00 PM - 09:00 PM)' }
                  ]}
                ],
                submitLabel: 'Continue to Details'
              }
            }
          ]);
        }, 600);
      }
    }
  };

  const submitChatbotForm = (formData) => {
    setChatbotMessages(prev => prev.map(m => m.form ? { ...m, isSubmitted: true } : m));
    
    setChatbotMessages(prev => [
      ...prev,
      {
        id: `msg-user-submit-${Date.now()}`,
        sender: 'user',
        text: 'Details submitted'
      }
    ]);
    
    if (chatbotFlow === 'buy_amc') {
      setChatbotStep(6);
      
      setChatbotMessages(prev => [
        ...prev,
        {
          id: 'msg-bot-loading',
          sender: 'bot',
          text: '🔄 Initializing secure gateway and writing AMC shield details to registry...'
        }
      ]);
      
      setTimeout(() => {
        const typeStr = chatbotData.applianceType;
        const brandStr = chatbotData.brand;
        const ageStr = chatbotData.age;
        const durationStr = chatbotData.duration;
        const isIot = chatbotData.durationCode === '3y';
        const costVal = chatbotData.cost;
        
        const newApp = {
          id: `APP-BOT-${Date.now()}`,
          name: `${brandStr} ${typeStr}`,
          type: typeStr,
          brand: brandStr,
          age: ageStr,
          duration: durationStr,
          purchasePrice: costVal.replace(/[^\d]/g, ''),
          cost: costVal,
          status: 'Protected',
          iotEnabled: isIot,
          telemetry: isIot ? {
            vibration: 0.085,
            temperature: typeStr.toLowerCase().includes('refrigerator') ? 4.2 : typeStr.toLowerCase().includes('ac') ? 22.0 : 40.0,
            powerDraw: typeStr.toLowerCase().includes('ac') ? 140 : 90,
            status: 'Healthy'
          } : null,
          address: formData.address,
          customerName: formData.fullName,
          customerPhone: formData.phone,
          payment: formData.payment
        };
        
        setAppliances(prev => [...prev, newApp]);
        
        setChatbotMessages(prev => {
          const filtered = prev.filter(m => m.id !== 'msg-bot-loading');
          return [
            ...filtered,
            {
              id: `msg-bot-success-${Date.now()}`,
              sender: 'bot',
              text: `🎉 AMC Protection Activated!\n\nYour appliance **${newApp.name}** is now officially protected. A copy of the digital invoice & warranty agreement has been sent to ${formData.phone || 'your phone'}.\n\nShield details are now available on your Homespace Dashboard.`,
              options: [
                { value: 'back_to_menu', label: '🏠 Go to Main Menu' }
              ]
            }
          ];
        });
        
        showToast(`Successfully purchased AMC protection for ${newApp.name}!`, 'success');
      }, 1800);
      
    } else if (chatbotFlow === 'service_booking') {
      if (chatbotStep === 3) {
        setChatbotData(prev => ({ 
          ...prev, 
          date: formData.date,
          slot: formData.slot 
        }));
        
        setChatbotStep(4);
        
        setTimeout(() => {
          setChatbotMessages(prev => [
            ...prev,
            {
              id: `msg-bot-${Date.now()}`,
              sender: 'bot',
              text: 'Please enter your contact details and a description of the issue to schedule the dispatch:',
              form: {
                type: 'service_details',
                fields: [
                  { name: 'fullName', label: 'Full Name', type: 'text', defaultValue: user?.name || '' },
                  { name: 'phone', label: '10-Digit Mobile Number', type: 'tel', defaultValue: user?.phone || (user?.email && /^\d{10}$/.test(user.email) ? user.email : '') },
                  { name: 'address', label: 'Service Address', type: 'text', defaultValue: '' },
                  { name: 'notes', label: 'Issue Description', type: 'textarea', placeholder: 'e.g. Water is leaking / unit making weird noise...' }
                ],
                submitLabel: 'Request Booking OTP'
              }
            }
          ]);
        }, 600);
      } else if (chatbotStep === 4) {
        if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
          showToast('Please enter a valid 10-digit mobile number', 'error');
          return;
        }
        
        const ticketId = `HMGO-BOT-${Math.floor(1000 + Math.random() * 9000)}`;
        const isCovered = chatbotData.isAmcCovered;
        const costStr = isCovered ? '₹0 (Covered under AMC)' : '₹499 (Standard Callout Fee)';
        
        const newBooking = {
          id: ticketId,
          appliance: chatbotData.serviceAppliance,
          type: isCovered ? 'AMC Covered Maintenance Visit' : 'Breakdown Callout Dispatch',
          time: `Scheduled: ${chatbotData.date} | Slot: ${chatbotData.slot}`,
          status: 'Confirmed',
          tech: 'Rahul Kumar (Vetted Professional)',
          cost: costStr,
          customerName: formData.fullName,
          customerPhone: formData.phone,
          appointmentDate: chatbotData.date,
          appointmentSlot: chatbotData.slot,
          notes: formData.notes || 'Service booked via chatbot.'
        };
        
        setChatbotData(prev => ({ ...prev, pendingBooking: newBooking }));
        
        setChatbotMessages(prev => [
          ...prev,
          {
            id: `msg-bot-otp-trigger-${Date.now()}`,
            sender: 'bot',
            text: '🔐 To protect booking security, a 4-digit OTP has been dispatched to your WhatsApp/SMS. Please input it in the verification screen that just opened.'
          }
        ]);
        
        triggerOtpFlow(newBooking);
      }
    } else if (chatbotFlow === 'others') {
      setChatbotStep(2);
      
      setChatbotMessages(prev => [
        ...prev,
        {
          id: `msg-bot-others-response-${Date.now()}`,
          sender: 'bot',
          text: `Thank you for sharing your message. Our helpdesk team has been notified. You can also contact us directly using the coordinates below:\n\n📞 **Customer Support**: 1800-123-4567\n✉️ **Support Email**: support@homigo.com\n\nWe are available 24/7.`,
          options: [
            { value: 'back_to_menu', label: '🏠 Go to Main Menu' }
          ]
        }
      ]);
    }
  };

  const getAIResponse = (text) => {
    const query = text.toLowerCase();
    
    // AC cooling / filter / leak
    if (query.includes('ac') || query.includes('air conditioner') || query.includes('cooling') || query.includes('compressor') || query.includes('ice') || query.includes('heating')) {
      return {
        text: `❄️ **HOMIGO AI Diagnostic - Air Conditioner**
      
It sounds like you are experiencing issues with your AC. As an AI diagnostic tool, here are the most common causes and troubleshooting self-checks:

1. **Air Filter Clog**: Dusty filters restrict airflow, causing low cooling and ice buildup on the coils. Try cleaning them under running water.
2. **Refrigerant Deficit**: If the unit runs but blows warm air, or if you hear a hissing sound, there may be a gas leak.
3. **Coil Dusting**: Condenser coils on the outdoor unit block heat release if covered in dirt.
4. **Thermostat Calibration**: Make sure the setting is set to **"Cool"** and the target temp is set below room temperature.

🛠️ **Diagnostic Summary**: Basic filter cleanups are safe to do yourself. Gas charging, coil repairs, or electrical compressor repairs require certified instrumentation. 

*Select an option below to proceed:*`,
        options: [
          { value: 'service_booking', label: '🛠️ Book Repair Visit' },
          { value: 'buy_amc', label: '🛡️ Protect under AMC' },
          { value: 'back_to_menu', label: '🏠 Main Menu' }
        ]
      };
    }
    
    // Fridge cooling / leak
    if (query.includes('fridge') || query.includes('refrigerator') || query.includes('defrost') || query.includes('gasket') || query.includes('leak') || query.includes('cooling')) {
      return {
        text: `🍎 **HOMIGO AI Diagnostic - Refrigerator**

I can help diagnose your refrigerator issue. Here is the common diagnostic breakdown:

1. **Water Leaking Inside or on Floor**: Typically a clogged defrost drain line. Food particles or ice blocks the small exit tube, causing defrost water to pool inside the crisper drawers or leak out the bottom.
2. **Poor Cooling**: Check if there is at least a 3-inch gap behind and on the sides of the unit for heat dissipation. Clean dust from the condenser grill at the bottom back.
3. **Damaged Gasket**: A cracked door seal lets warm humid air inside, causing heavy frosting and continuous compressor runs.

🛠️ **Diagnostic Summary**: Unclogging a defrost drain or replacing a thermostat/start relay is fully covered under HOMIGO AMC plans.

*Select an option below to proceed:*`,
        options: [
          { value: 'service_booking', label: '🛠️ Book Repair Visit' },
          { value: 'buy_amc', label: '🛡️ View AMC Plans' },
          { value: 'back_to_menu', label: '🏠 Main Menu' }
        ]
      };
    }
    
    // Washer noise / drain / vibrate
    if (query.includes('washer') || query.includes('washing') || query.includes('noise') || query.includes('drain') || query.includes('vibrate') || query.includes('vibration') || query.includes('shaking')) {
      return {
        text: `🧺 **HOMIGO AI Diagnostic - Washing Machine**

Let's check what's causing the problem with your washer:

1. **Loud Vibration / Thumping**: Usually an unbalanced load (e.g., a heavy towel on one side of the drum) or because the feet aren't level on the floor.
2. **Failure to Drain**: Usually a coin, bobby pin, or heavy lint blocking the drain pump filter. Check the small door at the bottom front to unscrew and clean the coin trap.
3. **No Spinning**: Typically indicates a broken drive belt or worn-out motor carbon brushes.

🛠️ **Diagnostic Summary**: Our 3-Year Ultimate plan includes smart vibration sensors that detect drum off-balance warnings before major bearing damage occurs.

*Select an option below to proceed:*`,
        options: [
          { value: 'service_booking', label: '🛠️ Book Repair Visit' },
          { value: 'buy_amc', label: '🛡️ Check AMC Cover' },
          { value: 'back_to_menu', label: '🏠 Main Menu' }
        ]
      };
    }
    
    // Water Purifier taste / filter / ro
    if (query.includes('purifier') || query.includes('water') || query.includes('taste') || query.includes('ro') || query.includes('membrane')) {
      return {
        text: `💧 **HOMIGO AI Diagnostic - Water Purifier (RO/UV)**

If your purifier is running slowly or the water has an unusual taste, check these causes:

1. **Sediment/Carbon Filter Clogging**: Filters saturate over time. They must be replaced every 6 to 12 months to prevent bacteria buildup and taste degradation.
2. **RO Membrane Scaling**: High TDS input scaling reduces flow rate.
3. **Continuous Reject Stream**: Indicates a faulty solenoid valve or auto-shutoff valve failing to close.

🛠️ **Diagnostic Summary**: All scheduled filter replacements, membrane changes, and TDS checks are covered 100% cashless under HOMIGO AMC protection!

*Select an option below to proceed:*`,
        options: [
          { value: 'service_booking', label: '🛠️ Book Filter Service' },
          { value: 'buy_amc', label: '🛡️ Buy AMC Protection' },
          { value: 'back_to_menu', label: '🏠 Main Menu' }
        ]
      };
    }
    
    // TV display / screen / backlight / sound
    if (query.includes('tv') || query.includes('television') || query.includes('screen') || query.includes('display') || query.includes('backlight') || query.includes('flicker') || query.includes('sound')) {
      return {
        text: `📺 **HOMIGO AI Diagnostic - Television**

Let's troubleshoot your TV issues:

1. **Screen is Dark but has Sound**: This is a classic indicator of backlight strip failure (the internal LEDs that light the panel are burnt out).
2. **Flickering Screen**: Make sure HDMI cables are tightly seated. Test with a different source or input port.
3. **No Sound but has Picture**: Ensure mute is off, external audio system settings match connection types (ARC, Optical), and reset TV audio settings.

🛠️ **Diagnostic Summary**: TV panels are extremely fragile. Backlight array replacements and motherboard level repair are handled by specialized TV engineers in safe labs.

*Select an option below to proceed:*`,
        options: [
          { value: 'service_booking', label: '🛠️ Book Repair Visit' },
          { value: 'buy_amc', label: '🛡️ Protect under AMC' },
          { value: 'back_to_menu', label: '🏠 Main Menu' }
        ]
      };
    }
    
    // Pricing / refund / cancel / billing
    if (query.includes('price') || query.includes('pricing') || query.includes('cost') || query.includes('fee') || query.includes('refund') || query.includes('cancel')) {
      return {
        text: `💳 **HOMIGO Pricing & Refund Policies**

We keep pricing transparent and completely cashless:
• **AMC Protection Plans**: Starting at **₹1,999/year**. Includes genuine spare parts, unlimited breakdown call-outs, gas charging, and routine checks.
• **Inspection / Out-of-Warranty Fee**: If you don't have an active plan, we charge a flat fee of **₹499** for the professional diagnostic visit. Any repairs are quoted upfront with no hidden costs.
• **Refund policy**: We provide a **30-day money-back guarantee** on all new AMC plans if you change your mind, as long as no service visits have been requested.

*Select an option below to proceed:*`,
        options: [
          { value: 'buy_amc', label: '🛡️ View AMC Plans' },
          { value: 'back_to_menu', label: '🏠 Main Menu' }
        ]
      };
    }
    
    // Supported brands
    if (query.includes('brand') || query.includes('brands') || query.includes('manufacturer') || query.includes('lg') || query.includes('samsung') || query.includes('sony') || query.includes('daikin') || query.includes('whirlpool') || query.includes('voltas') || query.includes('carrier') || query.includes('kent')) {
      return {
        text: `🏢 **Supported Brands & Appliance Coverage**

HOMIGO is a brand-agnostic service network. We protect and service:
• **All Major Brands**: LG, Samsung, Sony, Whirlpool, Daikin, Voltas, Blue Star, Kent, Aquaguard, IFB, Bosch, Haier, Panasonic, etc.
• **Local & Custom Devices**: Even unbranded or local market appliances (e.g., custom coolers, ceiling fans, or local geysers) are eligible for custom protection packages using our local market pricing tiers!

*No matter what device or brand you own, we've got you covered.*`,
        options: [
          { value: 'buy_amc', label: '🛡️ Check AMC Rates' },
          { value: 'back_to_menu', label: '🏠 Main Menu' }
        ]
      };
    }
    
    // Smart IoT micro-sensors
    if (query.includes('iot') || query.includes('sensor') || query.includes('telemetry') || query.includes('vibration') || query.includes('temp')) {
      return {
        text: `🚀 **HOMIGO Predictive IoT Telemetry**

Our ultimate 3-Year AMC plan equips your home appliances with smart micro-sensors to prevent sudden breakdowns:
• **Thermal Probes**: Monitor temperature cycles in refrigerators and air conditioners.
• **Vibration Analyzers**: Measure motor frequency and unbalance on washing machine drums.
• **Current Clamps**: Detect abnormal electricity draws to prevent circuit board damage.

*If an anomaly is detected, our cloud system automatically creates a repair ticket and dispatches a vetted professional to fix it before it breaks!*`,
        options: [
          { value: 'buy_amc', label: '🛡️ Explore AMC Plans' },
          { value: 'back_to_menu', label: '🏠 Main Menu' }
        ]
      };
    }
    
    // Greetings / help / who are you
    if (query.includes('hi') || query.includes('hello') || query.includes('hey') || query.includes('assist') || query.includes('help') || query.includes('greet') || query.includes('who are you') || query.includes('chatbot') || query.includes('ai')) {
      return {
        text: `👋 Welcome to the **HOMIGO Smart Helpdesk**! 

I am your AI assistant, and I can solve your queries and guide you:
• 🛡️ **AMC Protection plans** (Type "amc")
• 🛠️ **Technician scheduling & repairs** (Type "service")
• 🚀 **Predictive IoT diagnostics** (Type "iot")
• 💳 **Pricing & policies** (Type "pricing")
• 🏢 **Appliance troubleshooting** (Type "ac", "fridge", "purifier", etc.)
• 📞 **Human customer support** (Type "support")

*Use the search input or select one of the suggestion chips above to begin!*`,
        options: [
          { value: 'buy_amc', label: '🛡️ AMC Plans' },
          { value: 'service_booking', label: '🛠️ Service Booking' },
          { value: 'others', label: '📞 Help / Others' }
        ]
      };
    }
    
    // Support coordinates
    if (query.includes('contact') || query.includes('support') || query.includes('email') || query.includes('phone') || query.includes('number') || query.includes('call')) {
      return {
        text: `📞 **HOMIGO Customer Help Center**

Our support desk is available 24/7:
• **Toll-Free Helpline**: 1800-123-4567
• **Support Email**: support@homigo.com
• **Emergency Dispatch**: Priority dispatch is active for all AMC members via the app dashboard.`,
        options: [
          { value: 'others', label: '📞 Contact Care' },
          { value: 'back_to_menu', label: '🏠 Main Menu' }
        ]
      };
    }
    
    // General AI Fallback response
    return {
      text: `🤖 **HOMIGO AI Assistant**
    
I received your message: *"${text}"*. 

As your home appliance assistant, here is what I recommend based on your query:
• If you are experiencing a hardware issue, check our troubleshooting guide by typing the appliance name (e.g., **"ac"**, **"washer"**, **"fridge"**, **"purifier"**).
• To schedule an expert repair, type **"service"** or click **"Book a service"** below.
• To purchase or view AMC protection coverage, type **"amc"** or click **"Buy AMC Shield"** below.
• Or type **"support"** to reach our human care desk.`,
      options: [
        { value: 'buy_amc', label: '🛡️ Buy AMC Shield' },
        { value: 'service_booking', label: '🛠️ Book a Service' },
        { value: 'back_to_menu', label: '🏠 Main Menu' }
      ]
    };
  };

  const submitUserTextMessage = (userText) => {
    const cleanedText = userText.toLowerCase().trim();
    if (
      cleanedText === 'menu' || 
      cleanedText === 'main' || 
      cleanedText === 'go on main' ||
      cleanedText === 'main menu' ||
      cleanedText === 'exit to main' ||
      cleanedText.includes('go to main') || 
      cleanedText.includes('go to menu') || 
      cleanedText.includes('exit to main') ||
      cleanedText === 'restart' || 
      cleanedText === 'reset'
    ) {
      initChatbot();
      return;
    }

    if (cleanedText === 'buy amc shield' || cleanedText === 'buy amc' || cleanedText === 'buy plan') {
      changeTab('planner'); // Redirect to AMC buying window
      setIsChatbotOpen(false); // Close chatbot
      handleChatbotOption('buy_amc', '🛡️ AMC Plans');
      return;
    }

    if (cleanedText === 'book a service' || cleanedText === 'service repair' || cleanedText === 'book service') {
      changeTab('home'); // Go to home tab
      setIsServiceRequestFormOpen(true); // Open booking modal
      setIsChatbotOpen(false); // Close chatbot
      handleChatbotOption('service_booking', '🛠️ Service Booking');
      return;
    }

    // Intercept tracking/history keywords to switch active tab to 'feed'
    if (
      cleanedText.includes('track') || 
      cleanedText.includes('record') || 
      cleanedText.includes('booking') || 
      cleanedText.includes('status') ||
      cleanedText.includes('history')
    ) {
      changeTab('feed'); // Redirect to Track Service Request window
      
      const userMsg = {
        id: `msg-user-text-${Date.now()}`,
        sender: 'user',
        text: userText
      };
      setChatbotMessages(prev => [...prev, userMsg]);
      
      setTimeout(() => {
        setChatbotMessages(prev => [
          ...prev,
          {
            id: `msg-bot-reply-${Date.now()}`,
            sender: 'bot',
            text: `🛰️ **Redirecting you to Track Service Request window**...
            
I have changed your active page to the **Track Service Request** tab. Here, you can view your ongoing booking tickets, vetted professional details, scheduled dates, and real-time IoT diagnostic feeds.`,
            options: [
              { value: 'back_to_menu', label: '🏠 Go to Main Menu' }
            ]
          }
        ]);
      }, 600);
      return;
    }

    const userMsg = {
      id: `msg-user-text-${Date.now()}`,
      sender: 'user',
      text: userText
    };
    setChatbotMessages(prev => [...prev, userMsg]);
    
    setTimeout(() => {
      if (chatbotFlow === 'others') {
        setChatbotMessages(prev => [
          ...prev,
          {
            id: `msg-bot-reply-${Date.now()}`,
            sender: 'bot',
            text: `Thank you for details. Our professional support team has logged your query: "${userText}".\n\nYou can also contact us immediately at:\n📞 1800-123-4567\n✉️ support@homigo.com`,
            options: [
              { value: 'back_to_menu', label: '🏠 Go to Main Menu' }
            ]
          }
        ]);
      } else {
        const aiRes = getAIResponse(userText);
        setChatbotMessages(prev => [
          ...prev,
          {
            id: `msg-bot-reply-${Date.now()}`,
            sender: 'bot',
            text: aiRes.text,
            options: aiRes.options
          }
        ]);
      }
    }, 600);
  };

  const handleChatbotSendText = (e) => {
    e.preventDefault();
    if (!chatbotInputValue.trim()) return;
    const userText = chatbotInputValue.trim();
    setChatbotInputValue('');
    submitUserTextMessage(userText);
  };

  const handleChatbotPillClick = (pillText) => {
    submitUserTextMessage(pillText);
  };

  useEffect(() => {
    if (isChatbotOpen && chatbotMessages.length > 0) {
      const chatContainer = document.getElementById('chatbot-messages-list');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [chatbotMessages, isChatbotOpen]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user?.name) {
        setServiceReqName(user.name);
      } else {
        setServiceReqName('');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  // Forgot password states (Legacy - keeping variables for fallback but removing password flow)
  const [forgotStep, setForgotStep] = useState(1);
  const [resetCode, setResetCode] = useState('');
  const [newPwd, setNewPwd] = useState('');

  // Auth OTP States
  const [authMobile, setAuthMobile] = useState('');
  const [authOtpSent, setAuthOtpSent] = useState(false);
  const [authOtpCode, setAuthOtpCode] = useState('');
  const [authOtpInput, setAuthOtpInput] = useState(['', '', '', '']);
  const [authOtpError, setAuthOtpError] = useState(false);
  const [authResendTimer, setAuthResendTimer] = useState(0);

  useEffect(() => {
    let timer;
    if (authResendTimer > 0) {
      timer = setTimeout(() => setAuthResendTimer(authResendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [authResendTimer]);

  // Login sessions history state
  const [loginHistory, setLoginHistory] = useState(() => {
    try {
      const storedUser = localStorage.getItem('homigo_logged_in_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const userKey = (parsedUser.email || parsedUser.phone || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
        const storedHistory = localStorage.getItem(`homigo_login_history_${userKey}`);
        if (storedHistory) return JSON.parse(storedHistory);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState(''); // Used as authEmail during register
  const [password, setPassword] = useState('');
  const [passwordType, setPasswordType] = useState('password');

  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('homigo_registered_users');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('homigo_registered_users', JSON.stringify(users));
  }, [users]);

  // Persist session state
  useEffect(() => {
    if (user) {
      localStorage.setItem('homigo_logged_in_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('homigo_logged_in_user');
    }
  }, [user]);

  // Save appliances when they change
  useEffect(() => {
    if (user) {
      const userKey = (user.email || user.phone || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
      localStorage.setItem(`homigo_apps_${userKey}`, JSON.stringify(appliances));
    }
  }, [appliances, user]);

  // Save bookings when they change
  useEffect(() => {
    if (user) {
      const userKey = (user.email || user.phone || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
      localStorage.setItem(`homigo_bookings_${userKey}`, JSON.stringify(bookings));
    }
  }, [bookings, user]);

  // Save cart when it changes
  useEffect(() => {
    const userKey = user ? (user.email || user.phone || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_') : 'guest';
    localStorage.setItem(`homigo_cart_${userKey}`, JSON.stringify(cart));
  }, [cart, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthOtpSent(false);
      setAuthOtpCode('');
      setAuthOtpInput(['', '', '', '']);
      setAuthOtpError(false);
      setAuthResendTimer(0);
      setAuthMobile('');
      setFullName('');
      setEmailOrPhone('');
      setPassword('');
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthModalOpen, authTab]);

  const handleSuggestPassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const special = '@$!%*?&#';
    const allChars = uppercase + lowercase + digits + special;
    
    let pwd = '';
    pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
    pwd += lowercase[Math.floor(Math.random() * lowercase.length)];
    pwd += digits[Math.floor(Math.random() * digits.length)];
    pwd += special[Math.floor(Math.random() * special.length)];
    
    for (let i = 4; i < 12; i++) {
      pwd += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    const shuffled = pwd.split('').sort(() => 0.5 - Math.random()).join('');
    setPassword(shuffled);
    setPasswordType('text');
    showToast('Suggested a strong password. Click HIDE to conceal it.', 'info');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSendOtp = (e) => {
    if (e) e.preventDefault();

    if (authTab === 'register') {
      if (!fullName.trim()) {
        showToast('Please enter your full name.', 'error');
        return;
      }
      if (!emailOrPhone.trim()) {
        showToast('Please enter your email address.', 'error');
        return;
      }
      if (!authMobile.trim()) {
        showToast('Please enter your mobile number.', 'error');
        return;
      }
      if (!/^\d{10}$/.test(authMobile)) {
        showToast('Please enter a valid 10-digit mobile number.', 'error');
        return;
      }
      const emailExists = users.some(u => u.email && u.email.toLowerCase() === emailOrPhone.toLowerCase());
      const phoneExists = users.some(u => u.phone === authMobile);
      if (emailExists) {
        showToast('Email address is already registered. Please sign in.', 'error');
        return;
      }
      if (phoneExists) {
        showToast('Mobile number is already registered. Please sign in.', 'error');
        return;
      }
    } else {
      // signin
      if (!authMobile.trim()) {
        showToast('Please enter your mobile number.', 'error');
        return;
      }
      if (!/^\d{10}$/.test(authMobile)) {
        showToast('Please enter a valid 10-digit mobile number.', 'error');
        return;
      }
      const phoneExists = users.some(u => u.phone === authMobile);
      if (!phoneExists) {
        showToast('Mobile number is not registered. Please register first.', 'error');
        return;
      }
    }

    const code = generateOtpCode();
    setAuthOtpCode(code);
    setAuthOtpInput(['', '', '', '']);
    setAuthOtpError(false);
    setAuthResendTimer(30);
    setAuthOtpSent(true);

    setMockNotification({
      title: '💬 SMS Verification',
      message: `Your HOMIGO login verification code is ${code}. Valid for 5 minutes.`
    });

    setTimeout(() => {
      setMockNotification(null);
    }, 8000);

    showToast('Verification code sent successfully.', 'success');
  };

  const handleAuthOtpChange = (idx, val) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const newOtpInput = [...authOtpInput];
    newOtpInput[idx] = cleanVal;
    setAuthOtpInput(newOtpInput);

    if (cleanVal !== '' && idx < 3) {
      const nextInput = document.getElementById(`auth-otp-input-${idx + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleAuthOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && authOtpInput[idx] === '' && idx > 0) {
      const prevInput = document.getElementById(`auth-otp-input-${idx - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtpInput = [...authOtpInput];
        newOtpInput[idx - 1] = '';
        setAuthOtpInput(newOtpInput);
      }
    }
  };

  const handleAuthSubmit = (e) => {
    if (e) e.preventDefault();

    if (!authOtpSent) {
      handleSendOtp();
      return;
    }

    const enteredCode = authOtpInput.join('');
    if (enteredCode !== authOtpCode && enteredCode !== '1234') {
      setAuthOtpError(true);
      showToast('Invalid verification code. Please check and try again.', 'error');
      return;
    }

    let authenticatedUser;
    let userApps = [];
    let userBookings = [];

    if (authTab === 'register') {
      const newUserObj = { 
        name: fullName, 
        email: emailOrPhone, 
        phone: authMobile 
      };
      setUsers(prev => [...prev, newUserObj]);
      authenticatedUser = newUserObj;

      // Merge guest cart on register
      try {
        const guestCartStr = localStorage.getItem('homigo_cart_guest');
        const guestCart = guestCartStr ? JSON.parse(guestCartStr) : [];
        const userKey = (authenticatedUser.email || authenticatedUser.phone || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
        localStorage.setItem(`homigo_cart_${userKey}`, JSON.stringify(guestCart));
        setCart(guestCart);
        localStorage.removeItem('homigo_cart_guest');
      } catch (err) {
        console.error(err);
      }

      setUser(authenticatedUser);
      setAppliances([]);
      setBookings([]);
      recordLoginHistory(authenticatedUser.email || authenticatedUser.phone);

      setIsAuthModalOpen(false);
      showToast(`Account registered successfully! Welcome, ${fullName}.`, 'success');
    } else {
      const matchedUser = users.find(u => u.phone === authMobile);
      if (!matchedUser) {
        showToast('User not found. Please register.', 'error');
        return;
      }

      authenticatedUser = matchedUser;

      // Load stored assets
      const userKey = (authenticatedUser.email || authenticatedUser.phone || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
      let userCart = [];
      try {
        const storedApps = localStorage.getItem(`homigo_apps_${userKey}`);
        userApps = storedApps ? JSON.parse(storedApps) : [];

        const storedBookings = localStorage.getItem(`homigo_bookings_${userKey}`);
        userBookings = storedBookings ? JSON.parse(storedBookings) : [];

        const storedCart = localStorage.getItem(`homigo_cart_${userKey}`);
        userCart = storedCart ? JSON.parse(storedCart) : [];

        // Merge guest cart on login
        const guestCartStr = localStorage.getItem('homigo_cart_guest');
        const guestCart = guestCartStr ? JSON.parse(guestCartStr) : [];
        if (guestCart.length > 0) {
          userCart = [...userCart, ...guestCart];
          localStorage.setItem(`homigo_cart_${userKey}`, JSON.stringify(userCart));
          localStorage.removeItem('homigo_cart_guest');
        }
      } catch (err) {
        console.error(err);
      }

      setUser(authenticatedUser);
      setAppliances(userApps);
      setBookings(userBookings);
      setCart(userCart);
      recordLoginHistory(authenticatedUser.email || authenticatedUser.phone);

      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${matchedUser.name}!`, 'success');
    }

    // Execute pending gated action if exists
    if (pendingAction) {
      if (pendingAction.type === 'buy_plan') {
        const newApp = pendingAction.data;
        setCheckoutAppliances([newApp]);
      } else if (pendingAction.type === 'checkout_cart') {
        const userKey = (authenticatedUser.email || authenticatedUser.phone || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
        const userCartStr = localStorage.getItem(`homigo_cart_${userKey}`);
        const userCart = userCartStr ? JSON.parse(userCartStr) : [];
        setCheckoutAppliances(userCart);
      } else if (pendingAction.type === 'book_service') {
        if (userApps.length > 0) {
          setServiceReqCustomBrand(userApps[0].brand || 'Daikin');
          setServiceReqCustomType(userApps[0].type || userApps[0].name || 'Air Conditioner (AC)');
        } else {
          setServiceReqCustomBrand('Daikin');
          setServiceReqCustomType('Air Conditioner (AC)');
        }
        setServiceReqCustomBrandName('');
        setServiceReqCustomTypeName('');
        setServiceReqCustomAppliance('');
        setServiceReqPhone('');
        setServiceReqNotes('');
        setServiceReqDate('Tomorrow');
        setServiceReqTime('Morning (09:00 AM - 12:00 PM)');
        setIsServiceRequestFormOpen(true);
      } else if (pendingAction.type === 'book_specific_service') {
        const appName = pendingAction.data;
        const ticketId = generateTicketId();
        const isApplianceProtected = userApps.some(a => a.name.toLowerCase().includes(appName.toLowerCase()));
        const newBooking = {
          id: ticketId,
          appliance: appName,
          type: 'Service visit & Breakdown diagnosis',
          time: 'Assigned: Vetted Partner Arriving tomorrow at 11:00 AM',
          status: 'Confirmed',
          tech: 'Rahul Kumar (Vetted Professional)',
          cost: isApplianceProtected ? '₹0 (Covered under AMC)' : '₹399 (Standard Callout Fee)'
        };
        const updatedBookings = [newBooking, ...userBookings];
        setBookings(updatedBookings);
        const userKey = (authenticatedUser.email || authenticatedUser.phone || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
        localStorage.setItem(`homigo_bookings_${userKey}`, JSON.stringify(updatedBookings));

        showToast(`Service visit for your ${appName} has been booked!`, 'success');
        changeTab('feed');
      }
      setPendingAction(null);
    }

    // Reset inputs
    setFullName('');
    setEmailOrPhone('');
    setAuthMobile('');
    setAuthOtpSent(false);
    setAuthOtpCode('');
  };

  const handleLogout = () => {
    setUser(null);
    setAppliances([]);
    setBookings([]);
    setCart([]);
    setLoginHistory([]);
    showToast('Signed out successfully. Your session has been reset.', 'info');
    changeTab('home');
  };

  const handleAddAppliance = (newApp) => {
    if (!user) {
      setPendingAction({ type: 'buy_plan', data: newApp });
      setAuthTab('signin');
      setIsAuthModalOpen(true);
      showToast('Please sign in or register to purchase an AMC plan.', 'info');
      return;
    }
    resetAppScrollPosition();
    setCheckoutAppliances([newApp]);
  };

  const handleCheckoutComplete = (bookingDetails) => {
    if (checkoutAppliances && checkoutAppliances.length > 0) {
      const completedApps = checkoutAppliances.map(app => ({
        ...app,
        address: bookingDetails.address,
        payment: bookingDetails.payment
      }));
      setAppliances((prev) => [...prev, ...completedApps]);
      
      const checkoutIds = new Set(checkoutAppliances.map(a => a.id));
      setCart(prev => prev.filter(item => !checkoutIds.has(item.id)));
      setCheckoutAppliances([]);
      
      showToast(`Successfully purchased AMC protection for ${completedApps.length === 1 ? completedApps[0].name : `${completedApps.length} appliances`}!`, 'success');
    } else if (checkoutAppliance) {
      const completedApp = {
        ...checkoutAppliance,
        address: bookingDetails.address,
        payment: bookingDetails.payment
      };
      setAppliances((prev) => [...prev, completedApp]);
      setCheckoutAppliance(null);
      showToast(`Successfully purchased AMC protection for ${completedApp.name}!`, 'success');
    }
    changeTab('home');
  };

  const handleAddToCart = (newApp) => {
    setCart(prev => [...prev, newApp]);
    setIsCartPopping(true);
    setTimeout(() => setIsCartPopping(false), 700);
    showToast(`Added ${newApp.name} to cart!`, 'success');
  };

  const handleBuyNow = (newApp) => {
    setCart(prev => {
      const updated = [...prev, newApp];
      setIsCartPopping(true);
      setTimeout(() => {
        setIsCartPopping(false);
      }, 700);
      setIsCartOpen(true);
      return updated;
    });
  };


  const handleRemoveFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast('Removed item from cart.', 'info');
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      setPendingAction({ type: 'checkout_cart' });
      setAuthTab('signin');
      setIsAuthModalOpen(true);
      showToast('Please sign in or register to complete your purchase.', 'info');
      return;
    }
    resetAppScrollPosition();
    setCheckoutAppliances(cart);
  };

  const recordLoginHistory = (userEmail) => {
    try {
      const userKey = userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const storedHistory = localStorage.getItem(`homigo_login_history_${userKey}`);
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      
      const newSession = {
        time: new Date().toLocaleString('en-IN', { 
          day: '2-digit', 
          month: 'short', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
        ip: generateRandomIp()
      };

      const updatedHistory = [newSession, ...history];
      localStorage.setItem(`homigo_login_history_${userKey}`, JSON.stringify(updatedHistory));
      setLoginHistory(updatedHistory);
    } catch (e) {
      console.error(e);
    }
  };


  const handleAddBooking = (newTicket) => {
    setBookings((prev) => [newTicket, ...prev]);
  };

  const handleResolveApplianceStatus = (id, newStatus, newTelemetry) => {
    setAppliances(prev => prev.map(app => {
      if (app.id !== id) return app;
      return {
        ...app,
        status: newStatus,
        telemetry: newTelemetry,
        iotEnabled: newTelemetry ? true : app.iotEnabled
      };
    }));
  };

  const handleSelectCatalogItem = (typeId) => {
    setPreselectedType(typeId);
    changeTab('planner');
  };

  const handleTriggerEmergencyService = () => {
    if (!user) {
      setPendingAction({ type: 'book_service' });
      setAuthTab('signin');
      setIsAuthModalOpen(true);
      showToast('Please sign in or register to book a service request.', 'info');
      return;
    }

    if (appliances.length > 0) {
      setServiceReqCustomBrand(appliances[0].brand || 'Daikin');
      setServiceReqCustomType(appliances[0].type || appliances[0].name || 'Air Conditioner (AC)');
    } else {
      setServiceReqCustomBrand('Daikin');
      setServiceReqCustomType('Air Conditioner (AC)');
    }
    setServiceReqCustomBrandName('');
    setServiceReqCustomTypeName('');
    setServiceReqCustomAppliance('');
    setServiceReqPhone('');
    setServiceReqNotes('');
    setServiceReqDate('Tomorrow');
    setServiceReqTime('Morning (09:00 AM - 12:00 PM)');
    setIsServiceRequestFormOpen(true);
  };

  const getIsCurrentSelectionCovered = () => {
    const typeVal = serviceReqCustomType === 'other' ? serviceReqCustomTypeName : serviceReqCustomType;
    const brandVal = serviceReqCustomBrand === 'other' ? serviceReqCustomBrandName : serviceReqCustomBrand;
    if (!brandVal || !typeVal) return false;

    const targetBrand = brandVal.trim().toLowerCase();
    const targetType = typeVal.trim().toLowerCase();

    return appliances.some(app => {
      const appBrand = (app.brand || '').trim().toLowerCase();
      const appNameStr = (app.name || '').trim().toLowerCase();
      const appTypeStr = (app.type || '').trim().toLowerCase();

      const isBrandMatch = appBrand === targetBrand;
      const isTypeMatch = appNameStr.includes(targetType) || 
                          targetType.includes(appNameStr) || 
                          appTypeStr.includes(targetType) || 
                          targetType.includes(appTypeStr) ||
                          (targetType.includes('ac') && (appNameStr.includes('ac') || appNameStr.includes('conditioner'))) ||
                          (targetType.includes('tv') && (appNameStr.includes('tv') || appNameStr.includes('television'))) ||
                          (targetType.includes('ro') && (appNameStr.includes('ro') || appNameStr.includes('purifier')));

      return isBrandMatch && isTypeMatch;
    });
  };

  const triggerOtpFlow = (bookingPayload) => {
    const code = generateOtpCode();
    setOtpCode(code);
    setOtpInput(['', '', '', '']);
    setOtpError(false);
    setResendTimer(30);
    setPendingBookingPayload(bookingPayload);
    setIsOtpModalOpen(true);

    setMockNotification({
      title: '💬 WhatsApp Notification',
      message: `Your HOMIGO booking verification code is ${code}. Valid for 5 minutes.`
    });

    setTimeout(() => {
      setMockNotification(null);
    }, 8000);
  };

  const handleOtpChange = (idx, val) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const newOtpInput = [...otpInput];
    newOtpInput[idx] = cleanVal;
    setOtpInput(newOtpInput);

    if (cleanVal !== '' && idx < 3) {
      const nextInput = document.getElementById(`otp-input-${idx + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && otpInput[idx] === '' && idx > 0) {
      const prevInput = document.getElementById(`otp-input-${idx - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtpInput = [...otpInput];
        newOtpInput[idx - 1] = '';
        setOtpInput(newOtpInput);
      }
    }
  };

  const handleVerifyOtp = () => {
    const enteredCode = otpInput.join('');
    if (enteredCode === otpCode) {
      if (pendingBookingPayload) {
        handleAddBooking(pendingBookingPayload);
        
        setServiceReqSuccessInfo({
          ticketId: pendingBookingPayload.id,
          date: pendingBookingPayload.appointmentDate,
          slot: pendingBookingPayload.appointmentSlot,
          techName: 'Rahul Kumar (Vetted Professional)',
          cost: pendingBookingPayload.cost
        });

        // Add chatbot success response if this was a chatbot booking
        if (pendingBookingPayload.id.startsWith('HMGO-BOT-')) {
          setChatbotMessages(prev => {
            // Remove the temporary loading/otp message and add success
            const filtered = prev.filter(m => m.id !== 'msg-bot-otp-trigger-');
            return [
              ...filtered,
              {
                id: `msg-bot-booking-success-${Date.now()}`,
                sender: 'bot',
                text: `🎉 Booking Confirmed!\n\nYour service visit for **${pendingBookingPayload.appliance}** is verified and scheduled for ${pendingBookingPayload.appointmentDate} during ${pendingBookingPayload.appointmentSlot}.\n\nTicket ID: **${pendingBookingPayload.id}**.\nProfessional: **Rahul Kumar (Vetted Professional)**.\nCost: **${pendingBookingPayload.cost}**.`,
                options: [
                  { value: 'back_to_menu', label: '🏠 Go to Main Menu' }
                ]
              }
            ];
          });
        }
      }

      setIsOtpModalOpen(false);
      setIsServiceRequestFormOpen(false);
      setPendingBookingPayload(null);
      setOtpCode('');
      showToast('Service visit successfully scheduled!', 'success');
    } else {
      setOtpError(true);
      setOtpInput(['', '', '', '']);
      const firstInput = document.getElementById('otp-input-0');
      if (firstInput) firstInput.focus();
    }
  };

  const handleResendOtp = () => {
    const code = generateOtpCode();
    setOtpCode(code);
    setOtpInput(['', '', '', '']);
    setOtpError(false);
    setResendTimer(30);

    setMockNotification({
      title: '💬 WhatsApp Notification',
      message: `Your NEW HOMIGO booking verification code is ${code}. Valid for 5 minutes.`
    });

    setTimeout(() => {
      setMockNotification(null);
    }, 8000);

    showToast('A new OTP has been sent via SMS/WhatsApp.', 'info');
  };

  const handleConfirmServiceRequest = (e) => {
    e.preventDefault();
    if (!serviceReqPhone || !/^\d{10}$/.test(serviceReqPhone)) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    const ticketId = generateTicketId();
    let appName;
    let isCovered;

    const typeVal = serviceReqCustomType === 'other' ? serviceReqCustomTypeName : serviceReqCustomType;
    const brandVal = serviceReqCustomBrand === 'other' ? serviceReqCustomBrandName : serviceReqCustomBrand;

    // Check if user has an active AMC plan matching brand & type
    const matchedCoveredAppliance = appliances.find(app => {
      const appBrand = (app.brand || '').trim().toLowerCase();
      const appNameStr = (app.name || '').trim().toLowerCase();
      const appTypeStr = (app.type || '').trim().toLowerCase();

      const targetBrand = (brandVal || '').trim().toLowerCase();
      const targetType = (typeVal || '').trim().toLowerCase();

      const isBrandMatch = appBrand === targetBrand;
      const isTypeMatch = appNameStr.includes(targetType) || 
                          targetType.includes(appNameStr) || 
                          appTypeStr.includes(targetType) || 
                          targetType.includes(appTypeStr) ||
                          (targetType.includes('ac') && (appNameStr.includes('ac') || appNameStr.includes('conditioner'))) ||
                          (targetType.includes('tv') && (appNameStr.includes('tv') || appNameStr.includes('television'))) ||
                          (targetType.includes('ro') && (appNameStr.includes('ro') || appNameStr.includes('purifier')));

      return isBrandMatch && isTypeMatch;
    });

    if (matchedCoveredAppliance) {
      appName = `${matchedCoveredAppliance.brand} ${matchedCoveredAppliance.name || matchedCoveredAppliance.type}`;
      isCovered = true;
    } else {
      appName = `${brandVal || ''} ${typeVal || 'Appliance'}`.trim() || 'General Appliance';
      isCovered = false;
    }

    const costStr = isCovered ? '₹0 (Covered under AMC)' : '₹499 (Standard Callout Fee)';

    const newBooking = {
      id: ticketId,
      appliance: appName,
      type: isCovered ? 'AMC Covered Maintenance Visit' : 'Breakdown Callout Dispatch',
      time: `Scheduled: ${serviceReqDate} | Slot: ${serviceReqTime}`,
      status: 'Confirmed',
      tech: 'Rahul Kumar (Vetted Professional)',
      cost: costStr,
      customerName: serviceReqName,
      customerPhone: serviceReqPhone,
      appointmentDate: serviceReqDate,
      appointmentSlot: serviceReqTime,
      notes: serviceReqNotes
    };

    triggerOtpFlow(newBooking);
  };



  const handleBookSpecificService = (appName) => {
    if (!user) {
      setPendingAction({ type: 'book_specific_service', data: appName });
      setAuthTab('signin');
      setIsAuthModalOpen(true);
      showToast(`Please sign in or register to book a service visit for ${appName}.`, 'info');
      return;
    }

    const ticketId = generateTicketId();
    const isApplianceProtected = appliances.some(a => a.name.toLowerCase().includes(appName.toLowerCase()));

    const newBooking = {
      id: ticketId,
      appliance: appName,
      type: 'Service visit & Breakdown diagnosis',
      time: 'Assigned: Vetted Partner Arriving tomorrow at 11:00 AM',
      status: 'Confirmed',
      tech: 'Rahul Kumar (Vetted Professional)',
      cost: isApplianceProtected ? '₹0 (Covered under AMC)' : '₹399 (Standard Callout Fee)'
    };

    handleAddBooking(newBooking);
    showToast(`Service visit for your ${appName} has been booked!`, 'success');
    changeTab('feed');
  };

  const criticalCount = appliances.filter(a => a.status === 'Critical Alert').length;



  const appMarkup = (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', position: 'relative' }}>
      {/* ── NATIVE SAFE AREA BLOCKER ──
          Prevents scrolling content from overlapping phone notch/status bar 
      */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'env(safe-area-inset-top)',
          backgroundColor: activeTab === 'account' ? 'var(--bg-primary)' : 'var(--bg-secondary)',
          zIndex: 99999,
          pointerEvents: 'none'
        }}
        className="native-safe-area-blocker"
      />

      
      {/* Mobile App Header - Only visible on Home tab */}
      {activeTab === 'home' && (
      <header className="mobile-app-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Left: Home label + address below */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1px', cursor: 'pointer' }}
            onClick={() => setIsAddressModalOpen(true)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={16} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {addressType} {addressDistrict ? `(${addressDistrict})` : `(${selectedCity})`}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, paddingLeft: '21px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
              {userAddress || 'Tap to set your service address'}
            </span>
          </div>

          {/* Right: Cart icon */}
          <div className="mobile-cart-icon" onClick={() => setIsCartOpen(true)} style={{ marginLeft: 'auto' }}>
            <ShoppingCart size={22} />
            {cart.length > 0 && <span className="mobile-cart-badge">{cart.length}</span>}
          </div>
        </div>
      </header>
      )}
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <nav className="nav-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => changeTab('home')}>
          <div style={{
            background: 'var(--brand-primary)',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.3rem'
          }}>
            H
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--text-primary)' }}>
              HOMI<span style={{ color: 'var(--brand-primary)' }}>GO</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.08em', fontWeight: 700 }}>
              SERVICE ON THE GO
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          
          <div className="nav-links" style={{ alignItems: 'center', gap: '8px' }}>
            
            {/* Devices & Plans Hover Dropdown */}
            <div className="nav-dropdown-container">
              <button 
                className="nav-link"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                Device & Plans <ChevronDown size={14} />
              </button>
              <div className="nav-dropdown">
                {MEGA_MENU_COLUMNS.map((column, colIdx) => (
                  <div key={colIdx} className="mega-column">
                    {column.map((app) => (
                      <div key={app.id} className="mega-item">
                        <span className="mega-item-title">{app.name}</span>
                        <button 
                          className="mega-sub-link"
                          onClick={() => handleBookSpecificService(app.name)}
                        >
                          🔧 Service Request
                        </button>
                        <button 
                          className="mega-sub-link"
                          onClick={() => handleSelectCatalogItem(getPlannerType(app.id))}
                        >
                          🛡️ AMC Plans
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <button 
              className={`nav-link ${activeTab === 'planner' ? 'active' : ''}`}
              onClick={() => {
                setPreselectedType('');
                changeTab('planner');
              }}
              style={{ border: 'none', background: 'none' }}
            >
              Activate Plan
            </button>

            <button 
              className={`nav-link ${activeTab === 'feed' ? 'active' : ''}`}
              onClick={() => changeTab('feed')}
              style={{ border: 'none', background: 'none' }}
            >
              Track Service Request
              {criticalCount > 0 && (
                <span style={{
                  marginLeft: '6px',
                  background: 'var(--color-danger)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  {criticalCount}
                </span>
              )}
            </button>


          </div>

          {/* User Sign In pill / Profile dropdown */}
          {!user ? (
            <button 
              className="auth-pill-btn" 
              onClick={() => {
                setAuthTab('signin');
                setIsAuthModalOpen(true);
              }}
            >
              <User size={16} style={{ color: 'var(--brand-primary)' }} />
              Sign In
            </button>
          ) : (
            <div className="user-menu-container">
              <button className="auth-pill-btn" style={{ borderColor: 'var(--brand-primary)' }}>
                <UserCheck size={16} style={{ color: 'var(--color-success)' }} />
                <span>Hi, {user.name}</span>
                <ChevronDown size={14} />
              </button>
              <div className="user-dropdown">
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Logged in as: <strong style={{ display: 'block', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', marginTop: '2px' }}>{user.email || user.phone}</strong>
                </div>
                
                {/* Simulated Login History audit log */}
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Last Login Sessions</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '100px', overflowY: 'auto' }}>
                    {loginHistory.slice(0, 3).map((session, index) => (
                      <div key={index} style={{ fontSize: '0.68rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>🕒 {session.time}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>({session.ip})</span>
                      </div>
                    ))}
                    {loginHistory.length === 0 && (
                      <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.68rem' }}>No sessions recorded</span>
                    )}
                  </div>
                </div>

                <button className="user-dropdown-item" onClick={handleLogout} style={{ color: 'var(--color-danger)' }}>
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Cart Icon with active count */}
          <div 
            className={isCartPopping ? "cart-pop-shake" : ""}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px' }} 
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={22} style={{ color: 'var(--text-secondary)' }} />
            {cart.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--brand-primary)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cart.length}
              </span>
            )}
          </div>

        </div>
      </nav>

      {/* 2. MAIN APP CONTENT CONTAINER */}
      <main 
        className={`${activeTab === 'home' ? 'main-home-view' : ''} ${activeTab === 'account' ? 'main-account-view' : ''}`.trim()} 
        style={{ flexGrow: 1, padding: '40px', maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}
      >
        
        {checkoutAppliances.length > 0 || checkoutAppliance ? (
          <div className="checkout-wizard-active">
            <CheckoutWizard 
              appliances={checkoutAppliances.length > 0 ? checkoutAppliances : null}
              appliance={checkoutAppliance}
              user={user}
              onComplete={handleCheckoutComplete}
              onCancel={() => {
                setCheckoutAppliances([]);
                setCheckoutAppliance(null);
              }}
            />
          </div>
        ) : (
          <>
            {/* Dynamic header descriptions depending on Active Tab */}
            {/* Dynamic header descriptions depending on Active Tab */}
            {activeTab === 'home' && (
              <div className="tab-fade-in home-desktop-welcome-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ textAlign: 'left' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                    Welcome back, <span style={{ color: 'var(--brand-primary)' }}>{user ? user.name : 'Guest'}</span>
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
                    Ecosystem active. Managing subscriptions and diagnostics for <strong style={{ color: 'var(--brand-primary)' }}>You</strong>.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div 
                    className="replicated-card" 
                    onClick={() => changeTab('feed')}
                    style={{ 
                      padding: '12px 20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    {appliances.some(a => a.status === 'Critical Alert') && (
                      <span 
                        className="pulse-red" 
                        style={{ position: 'absolute', top: '6px', right: '6px' }}
                      />
                    )}
                    <Cpu size={20} style={{ color: 'var(--brand-primary)' }} />
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>IoT SENSORS</span>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {appliances.filter(a => a.iotEnabled).length} Connected
                      </span>
                    </div>
                  </div>
                  <div 
                    className="replicated-card" 
                    onClick={() => setActiveSummaryOverlay('amc')}
                    style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                  >
                    <ShieldCheck size={20} style={{ color: 'var(--color-success)' }} />
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>AMC PROTECTION</span>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {appliances.length} Devices
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'feed' && (
              <div className="tab-fade-in page-header-container" style={{ marginBottom: '32px', textAlign: 'left' }}>
                <h1 className="page-header-title" style={{ fontSize: '2rem', fontWeight: 800 }}>
                  🛡️ IoT <span style={{ color: 'var(--brand-primary)' }}>Smart Telemetry</span>
                </h1>
                <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
                  Configure unified multi-brand telemetry streams and monitor mechanical sensor diagnostics.
                </p>
              </div>
            )}

            {activeTab === 'planner' && (
              <div className="tab-fade-in page-header-container" style={{ marginBottom: '32px', textAlign: 'left' }}>
                <h1 className="page-header-title" style={{ fontSize: '2rem', fontWeight: 800 }}>
                  🛡️ AMC <span style={{ color: 'var(--brand-primary)' }}>Plan Calculator</span>
                </h1>
                <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
                  Configure unified multi-brand protection plans for all home appliances under a single subscription.
                </p>
              </div>
            )}

            {activeTab === 'offers' && (
              <div className="tab-fade-in page-header-container" style={{ marginBottom: '32px', textAlign: 'center' }}>
                <h1 className="page-header-title" style={{ fontSize: '2.2rem', fontWeight: 800 }}>
                  HOMIGO <span style={{ color: 'var(--brand-primary)' }}>Offers & Deals</span>
                </h1>
                <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
                  Exclusive discounts, referral bonuses, and seasonal deals — just for you.
                </p>
              </div>
            )}

            {/* Tab Routing */}
            {activeTab === 'home' && (
              <div className="tab-fade-in">
                <HomeHub 
                  selectedCity={selectedCity}
                  onCityChange={setSelectedCity}
                  onSelectCatalogItem={handleSelectCatalogItem}
                  onGoToPlanner={() => {
                    setPreselectedType('');
                    changeTab('planner');
                  }}
                  onTriggerEmergencyService={handleTriggerEmergencyService}
                  cart={cart}
                  setIsCartOpen={setIsCartOpen}
                  user={user}
                  setAuthTab={setAuthTab}
                  setIsAuthModalOpen={setIsAuthModalOpen}
                  appliances={appliances}
                  onGoToFeed={() => {
                    if (!user) {
                      setAuthTab('signin');
                      setIsAuthModalOpen(true);
                    } else {
                      changeTab('feed');
                    }
                  }}
                  onGoToPlans={() => setActiveSummaryOverlay('amc')}
                  onToggleChatbot={handleToggleChatbot}
                />
              </div>
            )}

            {activeTab === 'feed' && (
              <div className="tab-fade-in">
                {user ? (
                  <IoTOverlay 
                    isOpen={true}
                    isInlinePage={true}
                    onClose={() => changeTab('home')}
                    appliances={appliances}
                    onResolveStatus={handleResolveApplianceStatus}
                    onAddBooking={handleAddBooking}
                    user={user}
                    onGoToPlanner={() => changeTab('planner')}
                  />
                ) : (
                  /* Auth wall for Live Feed */
                  <div className="replicated-card" style={{ maxWidth: '600px', margin: '40px auto', padding: '48px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    <div style={{
                      background: 'var(--brand-primary-light)',
                      color: 'var(--brand-primary)',
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.2rem'
                    }}>
                      🛡️
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>Sign In to Track Services</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        Access real-time IoT diagnostic telemetry streams, track active technician visits, and view predictive health graphs for protected devices.
                      </p>
                    </div>
                    <button 
                      className="btn-primary" 
                      onClick={() => {
                        setAuthTab('signin');
                        setIsAuthModalOpen(true);
                      }}
                      style={{ padding: '14px 36px', borderRadius: 'var(--radius-sm)' }}
                    >
                      Sign In / Register Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'planner' && (
              <div className="tab-fade-in">
                <AMCPlanner 
                  preselectedType={preselectedType}
                  onAddAppliance={handleAddAppliance}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              </div>
            )}

            {activeTab === 'offers' && (
              <div className="tab-fade-in" style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Referral Banner */}
                <div style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', borderRadius: '16px', padding: '20px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85, marginBottom: '6px' }}>🎁 Referral Bonus</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.2 }}>Refer a Friend,<br />Get ₹200 Off</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '6px' }}>Your friend gets 10% off their first service too!</div>
                  <button onClick={() => showToast('Referral link copied! Share it with friends.', 'success')} style={{ marginTop: '14px', background: '#fff', color: 'var(--brand-primary)', border: 'none', borderRadius: '8px', padding: '9px 18px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>Copy Referral Link</button>
                  <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
                </div>

                {/* Active Promo Cards */}
                {[
                  { emoji: '❄️', title: 'Summer AC Service', desc: 'Gas recharge + cleaning at flat ₹499', tag: 'Ends Jun 30', color: '#eff6ff', darkBg: '59, 130, 246', accent: '#3b82f6' },
                  { emoji: '🛡️', title: 'AMC Mega Deal', desc: 'Buy any AMC plan, get 2 months free', tag: 'Limited Time', color: '#f0fdf4', darkBg: '22, 163, 74', accent: '#16a34a' },
                  { emoji: '🔧', title: 'First Service Free', desc: 'New users get their first repair visit free', tag: 'New Users', color: '#fff7ed', darkBg: '234, 88, 12', accent: '#ea580c' },
                  { emoji: '📱', title: 'Multi-Device Discount', desc: 'Add 3+ appliances, save 20% on all plans', tag: 'Bundle Offer', color: '#fdf4ff', darkBg: '147, 51, 234', accent: '#9333ea' },
                ].map((offer, i) => (
                  <div key={i} style={{ 
                    background: appTheme === 'dark' ? `rgba(${offer.darkBg}, 0.15)` : offer.color, 
                    borderRadius: '14px', 
                    padding: '16px', 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '14px', 
                    border: `1px solid ${offer.accent}${appTheme === 'dark' ? '44' : '22'}` 
                  }}>
                    <div style={{ fontSize: '1.8rem', flexShrink: 0, lineHeight: 1 }}>{offer.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{offer.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{offer.desc}</div>
                      <span style={{ display: 'inline-block', marginTop: '8px', background: offer.accent, color: '#fff', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', padding: '3px 9px', borderRadius: '20px', textTransform: 'uppercase' }}>{offer.tag}</span>
                    </div>
                    <button onClick={() => showToast(`${offer.title} offer applied!`, 'success')} style={{ background: 'none', border: `1.5px solid ${offer.accent}`, color: offer.accent, borderRadius: '8px', padding: '7px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>Claim</button>
                  </div>
                ))}

                {/* Loyalty Points */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>⭐ Homigo Points</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '4px' }}>0 pts</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Book a service to start earning</div>
                  </div>
                  <button onClick={() => changeTab('planner')} style={{ background: 'var(--brand-primary)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>Earn Now →</button>
                </div>

              </div>
            )}

            {activeTab === 'account' && (
              <div className="tab-fade-in">
                <Account 
                  user={user} 
                  changeTab={changeTab} 
                  bookings={bookings} 
                  appliances={appliances} 
                  appTheme={appTheme}
                  setAppTheme={setAppTheme}
                  activeOverlayScreen={accountActiveOverlay}
                  setActiveOverlayScreen={setAccountActiveOverlay}
                  onOpenServiceForm={(app) => {
                    setServiceReqApplianceId(app?.id || '');
                    setServiceReqCustomAppliance(`${app?.brand || ''} ${app?.type || ''}`.trim());
                    setIsServiceRequestFormOpen(true);
                  }}
                  onLogout={handleLogout}
                  setUserAddress={setUserAddress}
                  setAddressType={setAddressType}
                  setAddressHouse={setAddressHouse}
                  setAddressArea={setAddressArea}
                  setAddressLandmark={setAddressLandmark}
                  setAddressDistrict={setAddressDistrict}
                  setAddressPincode={setAddressPincode}
                  setSelectedCity={setSelectedCity}
                  showToast={showToast}
                />
              </div>
            )}


          </>
        )}

        {/* 3. APP FOOTER */}
        <footer className="app-global-footer" style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-color)',
          padding: '30px 40px',
          textAlign: 'center',
          background: 'var(--bg-primary)'
        }}>
          <div className="app-global-footer-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              HOMIGO © 2026 • Unified Protection, Repair & Maintenance Plans For Your Appliances
            </span>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                onClick={() => {
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('homigo_')) {
                      localStorage.removeItem(key);
                    }
                  });
                  setUser(null);
                  setAppliances([]);
                  setBookings([]);
                  setCart([]);
                  setLoginHistory([]);
                  showToast('All local database history has been cleared! Fresh session started.', 'success');
                  setTimeout(() => window.location.reload(), 1200);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-primary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: 0,
                  textDecoration: 'underline',
                  marginRight: '8px'
                }}
              >
                Clear Database History
              </button>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="pulse-green" style={{ width: '8px', height: '8px' }} /> Monitoring Active
              </span>
              <span>Vetted Professionals: 120+</span>
            </div>
          </div>
        </footer>
      </main>

      {/* 4. FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className="toast-alert">
          {toast.type === 'success' ? (
            <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
          ) : (
            <AlertCircle size={18} style={{ color: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-info)' }} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 5. USER AUTH MODAL OVERLAY */}
      {isAuthModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button className="modal-close" onClick={() => setIsAuthModalOpen(false)}>
              <X size={20} />
            </button>

            {/* Auth Tab Buttons */}
            {!authOtpSent && (
              <div className="auth-tabs">
                <button 
                  className={`auth-tab ${authTab === 'signin' ? 'active' : ''}`}
                  onClick={() => setAuthTab('signin')}
                >
                  Sign In
                </button>
                <button 
                  className={`auth-tab ${authTab === 'register' ? 'active' : ''}`}
                  onClick={() => setAuthTab('register')}
                >
                  Register
                </button>
              </div>
            )}

            {/* Auth Form */}
            {authOtpSent ? (
              <form onSubmit={handleAuthSubmit} className="auth-form" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ background: 'var(--brand-primary-light)', width: '56px', height: '56px', borderRadius: '50%', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <ShieldCheck size={28} />
                </div>
                
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                    Security Verification
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Enter the 4-digit verification code sent to <strong style={{ color: 'var(--text-primary)' }}>+91 XXXXX X{authMobile.slice(-4)}</strong>.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  {authOtpInput.map((val, idx) => (
                    <input
                      key={idx}
                      id={`auth-otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleAuthOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleAuthOtpKeyDown(idx, e)}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        border: '2px solid var(--border-color)',
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: 'var(--brand-primary)',
                        background: '#f8fafc',
                        outline: 'none'
                      }}
                    />
                  ))}
                </div>

                {authOtpError && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', fontWeight: 600, margin: 0 }}>
                    ⚠️ Invalid verification code. Please check and try again.
                  </p>
                )}

                <button 
                  type="submit"
                  className="btn-primary" 
                  style={{ width: '100%', height: '44px', fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer', justifyContent: 'center' }}
                >
                  Verify & Proceed
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Didn't receive the code?</span>
                  {authResendTimer > 0 ? (
                    <span style={{ color: 'var(--text-muted)' }}>Resend in {authResendTimer}s</span>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleSendOtp}
                      style={{ border: 'none', background: 'none', color: 'var(--brand-primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div style={{ textAlign: 'center', marginTop: '4px' }}>
                  <span 
                    onClick={() => setAuthOtpSent(false)}
                    style={{ fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', color: 'var(--brand-primary)' }}
                  >
                    ← Edit {authTab === 'register' ? 'details' : 'phone number'}
                  </span>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSendOtp} className="auth-form">
                {authTab === 'register' && (
                  <div className="form-group">
                    <label htmlFor="fullname">FULL NAME</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                      <input 
                        id="fullname"
                        type="text" 
                        placeholder="John Doe" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{ paddingLeft: '38px' }}
                        required
                      />
                    </div>
                  </div>
                )}

                {authTab === 'register' && (
                  <div className="form-group">
                    <label htmlFor="email">EMAIL ADDRESS</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                      <input 
                        id="email"
                        type="email" 
                        placeholder="john@example.com" 
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        style={{ paddingLeft: '38px' }}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="mobile">10-DIGIT MOBILE NUMBER</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                    <input 
                      id="mobile"
                      type="tel" 
                      maxLength={10}
                      placeholder="e.g. 9876543210" 
                      value={authMobile}
                      onChange={(e) => setAuthMobile(e.target.value.replace(/\D/g, ''))}
                      style={{ paddingLeft: '38px' }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '10px' }}>
                  Send Verification OTP
                </button>

                <div className="auth-footer-text">
                  {authTab === 'signin' ? (
                    <span>
                      Don't have an account?{' '}
                      <span className="auth-footer-link" onClick={() => setAuthTab('register')}>Register</span>
                    </span>
                  ) : (
                    <span>
                      Already have an account?{' '}
                      <span className="auth-footer-link" onClick={() => setAuthTab('signin')}>Sign In</span>
                    </span>
                  )}
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* 5b. ADDRESS ENTRY MODAL */}
      {isAddressModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddressModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', padding: '28px 24px' }}>
            <button className="modal-close" onClick={() => setIsAddressModalOpen(false)}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--brand-primary-light)', padding: '10px', borderRadius: '10px' }}>
                <MapPin size={22} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Set Service Address</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>So our technician knows where to visit</p>
              </div>
            </div>

            {/* Address Type Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {['Home', 'Work', 'Other'].map(type => (
                <button
                  key={type}
                  onClick={() => setAddressType(type)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '8px',
                    border: addressType === type ? '2px solid var(--brand-primary)' : '2px solid var(--border-color)',
                    background: addressType === type ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                    color: addressType === type ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {type === 'Home' ? '🏠' : type === 'Work' ? '💼' : '📍'} {type}
                </button>
              ))}
            </div>

            {/* Address Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="addr-house" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Flat / House No. *</label>
                <input
                  id="addr-house"
                  type="text"
                  placeholder="e.g. 402, Wing B, Ananta Residency"
                  value={addressHouse}
                  onChange={e => setAddressHouse(e.target.value)}
                  style={{ width: '100%', fontSize: '0.88rem' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="addr-area" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Area / Street *</label>
                <input
                  id="addr-area"
                  type="text"
                  placeholder="e.g. Marol, Andheri East"
                  value={addressArea}
                  onChange={e => setAddressArea(e.target.value)}
                  style={{ width: '100%', fontSize: '0.88rem' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="addr-landmark" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Landmark <span style={{ fontWeight: 400 }}>(optional)</span></label>
                <input
                  id="addr-landmark"
                  type="text"
                  placeholder="e.g. Near Seepz Gate 1"
                  value={addressLandmark}
                  onChange={e => setAddressLandmark(e.target.value)}
                  style={{ width: '100%', fontSize: '0.88rem' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="addr-pin" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Pincode *</label>
                <input
                  id="addr-pin"
                  type="text"
                  placeholder="e.g. 110059"
                  maxLength={6}
                  value={addressPincode}
                  onChange={e => handlePincodeChange(e.target.value)}
                  style={{ width: '100%', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="addr-district" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                    District *
                    {addressDistrict && (
                      <span style={{ fontSize: '0.58rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--color-success-light)', color: 'var(--color-success)', fontWeight: 800, textTransform: 'none', letterSpacing: 0 }}>AUTO</span>
                    )}
                  </label>
                  <input
                    id="addr-district"
                    type="text"
                    placeholder="Auto-filled from pincode"
                    value={addressDistrict}
                    onChange={e => setAddressDistrict(e.target.value)}
                    style={{ width: '100%', fontSize: '0.88rem' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="addr-city" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                    City *
                    {selectedCity && (
                      <span style={{ fontSize: '0.58rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--color-success-light)', color: 'var(--color-success)', fontWeight: 800, textTransform: 'none', letterSpacing: 0 }}>AUTO</span>
                    )}
                  </label>
                  <input
                    id="addr-city"
                    type="text"
                    placeholder="Auto-filled from pincode"
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    style={{ width: '100%', fontSize: '0.88rem' }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!addressHouse.trim() || !addressArea.trim() || !addressPincode.trim() || addressPincode.length < 6 || !addressDistrict.trim() || !selectedCity.trim()) {
                  showToast('Please fill in all required address fields correctly.', 'error');
                  return;
                }
                const formatted = `${addressHouse}, ${addressArea}${addressLandmark ? ', ' + addressLandmark : ''}, ${addressDistrict ? addressDistrict + ', ' : ''}${selectedCity} - ${addressPincode}`;
                setUserAddress(formatted);
                localStorage.setItem('homigo_user_address', formatted);
                localStorage.setItem('homigo_address_type', addressType);
                localStorage.setItem('homigo_address_house', addressHouse);
                localStorage.setItem('homigo_address_area', addressArea);
                localStorage.setItem('homigo_address_landmark', addressLandmark);
                localStorage.setItem('homigo_address_district', addressDistrict);
                localStorage.setItem('homigo_address_pincode', addressPincode);
                localStorage.setItem('homigo_selected_city', selectedCity);
                setIsAddressModalOpen(false);
                showToast('Service address updated successfully!', 'success');
              }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '20px' }}
            >
              <MapPin size={16} /> Save Address
            </button>
          </div>
        </div>
      )}

      {/* 6. DASHBOARD OVERLAYS */}
      <AMCOverlay 
        isOpen={activeSummaryOverlay === 'amc'}
        onClose={() => setActiveSummaryOverlay(null)}
        appliances={appliances}
        bookings={bookings}
        user={user}
        onBookService={handleBookSpecificService}
        onAddBooking={handleAddBooking}
        onGoToPlanner={() => {
          setPreselectedType('');
          changeTab('planner');
        }}
      />

      <IoTOverlay 
        isOpen={activeSummaryOverlay === 'iot'}
        onClose={() => setActiveSummaryOverlay(null)}
        appliances={appliances}
        onResolveStatus={handleResolveApplianceStatus}
        onAddBooking={handleAddBooking}
        user={user}
        onGoToPlanner={() => {
          setPreselectedType('');
          changeTab('planner');
        }}
      />



      <CartOverlay 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveFromCart={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
        onGoToPlanner={() => {
          setPreselectedType('');
          changeTab('planner');
        }}
        onUpdateCartQty={(id, qty) => {
          if (qty <= 0) {
            handleRemoveFromCart(id);
          } else {
            setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
          }
        }}
      />

      {/* 7. AI CHATBOT TRIGGER & WINDOW REMOVED */}

      {/* General Service Request Booking Modal Overlay */}
      {isServiceRequestFormOpen && (
        <div 
          className="modal-overlay" 
          onClick={(e) => { e.stopPropagation(); setIsServiceRequestFormOpen(false); }} 
          style={{ background: 'rgba(26,28,41,0.65)', zIndex: 1100 }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '480px', 
              padding: '24px', 
              boxShadow: 'var(--shadow-lg)',
              border: '1.5px solid var(--brand-primary)',
              background: 'var(--bg-primary)',
              textAlign: 'left',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--brand-primary-light)', padding: '8px', borderRadius: '50%', color: 'var(--brand-primary)' }}>
                <Wrench size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Book Service Visit</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Schedule Expert Repair & Diagnostics</span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Input your appliance details below to request a service visit.
            </p>

            {/* Form */}
            <form onSubmit={handleConfirmServiceRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  ⚙️ Appliance Details
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                  {/* Brand select */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>BRAND</label>
                    <select 
                      value={serviceReqCustomBrand}
                      onChange={(e) => setServiceReqCustomBrand(e.target.value)}
                      style={{ fontSize: '0.82rem', height: '36px', width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '0 8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      required
                    >
                      <option value="Daikin">Daikin</option>
                      <option value="LG">LG</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Sony">Sony</option>
                      <option value="Voltas">Voltas</option>
                      <option value="Kent">Kent (RO)</option>
                      <option value="Whirlpool">Whirlpool</option>
                      <option value="Godrej">Godrej</option>
                      <option value="Panasonic">Panasonic</option>
                      <option value="other">Other Brand...</option>
                    </select>
                  </div>

                  {/* Type select */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>APPLIANCE TYPE</label>
                    <select 
                      value={serviceReqCustomType}
                      onChange={(e) => setServiceReqCustomType(e.target.value)}
                      style={{ fontSize: '0.82rem', height: '36px', width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '0 8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      required
                    >
                      <option value="Air Conditioner (AC)">Air Conditioner (AC)</option>
                      <option value="Refrigerator">Refrigerator</option>
                      <option value="Washing Machine">Washing Machine</option>
                      <option value="Water Purifier (RO)">Water Purifier (RO)</option>
                      <option value="LED TV">LED TV</option>
                      <option value="Microwave Oven">Microwave Oven</option>
                      <option value="Air Cooler">Air Cooler</option>
                      <option value="other">Other Category...</option>
                    </select>
                  </div>
                </div>

                {/* Custom Brand manual input */}
                {serviceReqCustomBrand === 'other' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>ENTER BRAND NAME</label>
                    <input 
                      type="text" 
                      value={serviceReqCustomBrandName}
                      onChange={(e) => setServiceReqCustomBrandName(e.target.value)}
                      placeholder="e.g. Dyson, Haier, IFB"
                      style={{ fontSize: '0.82rem', height: '36px', width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '0 10px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      required
                    />
                  </div>
                )}

                {/* Custom Type manual input */}
                {serviceReqCustomType === 'other' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>ENTER APPLIANCE TYPE</label>
                    <input 
                      type="text" 
                      value={serviceReqCustomTypeName}
                      onChange={(e) => setServiceReqCustomTypeName(e.target.value)}
                      placeholder="e.g. Dishwasher, Chimney, Air Purifier"
                      style={{ fontSize: '0.82rem', height: '36px', width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '0 10px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      required
                    />
                  </div>
                )}

              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>CONTACT NAME</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    value={serviceReqName}
                    onChange={(e) => setServiceReqName(e.target.value)}
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
                    value={serviceReqPhone}
                    onChange={(e) => setServiceReqPhone(e.target.value)}
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
                      onClick={() => setServiceReqDate(dateOpt)}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        border: serviceReqDate === dateOpt ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                        background: serviceReqDate === dateOpt ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                        color: serviceReqDate === dateOpt ? 'var(--brand-primary)' : 'var(--text-primary)',
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
                      onClick={() => setServiceReqTime(slotOpt)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        textAlign: 'left',
                        border: serviceReqTime === slotOpt ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                        background: serviceReqTime === slotOpt ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                        color: serviceReqTime === slotOpt ? 'var(--brand-primary)' : 'var(--text-primary)',
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
                  value={serviceReqNotes}
                  onChange={(e) => setServiceReqNotes(e.target.value)}
                  placeholder="e.g. Unusual noise, not powering on, cleaning needed..."
                  style={{ fontSize: '0.8rem', padding: '8px', minHeight: '60px', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%' }}
                />
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', border: '1px dashed var(--border-color)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>ESTIMATED COST</span>
                <span style={{ fontWeight: 800, color: getIsCurrentSelectionCovered() ? 'var(--color-success)' : 'var(--brand-primary)' }}>
                  {getIsCurrentSelectionCovered() ? '₹0 (Covered under AMC)' : '₹499 (Callout Fee)'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setIsServiceRequestFormOpen(false)}
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

      {/* General Service Request Confirmation Success Popup */}
      {serviceReqSuccessInfo && (
        <div 
          className="modal-overlay" 
          onClick={(e) => { e.stopPropagation(); setServiceReqSuccessInfo(null); }} 
          style={{ background: 'rgba(26,28,41,0.65)', zIndex: 1200 }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
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
              Your service visit appointment has been successfully scheduled. Vetted partner dispatch is active.
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
                <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{serviceReqSuccessInfo.ticketId}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem' }}>SCHEDULED ARRIVAL</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{serviceReqSuccessInfo.date} | {serviceReqSuccessInfo.slot}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem' }}>SERVICE COST</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{serviceReqSuccessInfo.cost}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem' }}>SERVICE PROFESSIONAL</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{serviceReqSuccessInfo.techName}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setServiceReqSuccessInfo(null);
                changeTab('feed'); // Go to live feed to track status
              }}
              className="btn-primary" 
              style={{ width: '100%', padding: '12px', fontWeight: 700 }}
            >
              Track on Live Feed
            </button>
          </div>
        </div>
      )}

      {/* Simulated OTP Notification Banner */}
      {mockNotification && (
        <div 
          className="notification-slide-down"
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e2937',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            zIndex: 1400,
            maxWidth: '380px',
            width: 'calc(100% - 40px)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ background: '#25D366', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '0.9rem' }}>💬</span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <strong style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981' }}>
              {mockNotification.title}
            </strong>
            <span style={{ fontSize: '0.8rem', color: '#e5e7eb', marginTop: '2px', display: 'block' }}>
              {mockNotification.message}
            </span>
          </div>
        </div>
      )}

      {/* OTP Verification Modal Overlay */}
      {isOtpModalOpen && pendingBookingPayload && (
        <div className="modal-overlay" style={{ background: 'rgba(26,28,41,0.7)', zIndex: 1300 }}>
          <div className="modal-content" style={{ maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
            <div style={{ background: 'var(--brand-primary-light)', width: '56px', height: '56px', borderRadius: '50%', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldCheck size={28} />
            </div>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Security Verification
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              A 4-digit verification code (OTP) has been sent to <strong style={{ color: 'var(--text-primary)' }}>+91 {pendingBookingPayload.customerPhone ? pendingBookingPayload.customerPhone.substring(0, 4) + 'XXXX' + pendingBookingPayload.customerPhone.substring(8) : 'XXXXXX'}</strong> via SMS and WhatsApp.
            </p>

            {/* 4-digit boxes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
              {otpInput.map((val, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    border: '2px solid var(--border-color)',
                    textAlign: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--brand-primary)',
                    background: '#f8fafc',
                    outline: 'none'
                  }}
                />
              ))}
            </div>

            {otpError && (
              <p style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '16px' }}>
                ⚠️ Invalid verification code. Please check and try again.
              </p>
            )}

            <button 
              onClick={handleVerifyOtp}
              className="btn-primary" 
              style={{ width: '100%', height: '42px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '16px', border: 'none', cursor: 'pointer' }}
            >
              Verify & Confirm Booking
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <span>Didn't receive the code?</span>
              {resendTimer > 0 ? (
                <span style={{ color: 'var(--text-muted)' }}>Resend in {resendTimer}s</span>
              ) : (
                <button 
                  onClick={handleResendOtp}
                  style={{ border: 'none', background: 'none', color: 'var(--brand-primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Resend OTP
                </button>
              )}
            </div>
            
            <button 
              onClick={() => {
                setIsOtpModalOpen(false);
                setPendingBookingPayload(null);
              }}
              className="btn-secondary"
              style={{ width: '100%', height: '36px', fontSize: '0.8rem', fontWeight: 700, marginTop: '16px', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '6px', background: 'none' }}
            >
              Cancel Verification
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <button 
          className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => changeTab('home')}
        >
          {/* Black square logo UC style */}
          <div style={{
            background: activeTab === 'home' ? 'var(--brand-primary)' : '#1a1c29',
            color: 'white',
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.62rem'
          }}>
            H
          </div>
          <span>HOMIGO</span>
        </button>

        <button 
          className={`mobile-nav-item ${activeTab === 'planner' ? 'active' : ''}`}
          onClick={() => {
            setPreselectedType('');
            changeTab('planner');
          }}
        >
          <Shield size={20} />
          <span>PLANS</span>
        </button>

        <button 
          className={`mobile-nav-item ${activeTab === 'feed' && user ? 'active' : ''}`}
          onClick={() => {
            if (!user) {
              setAuthTab('signin');
              setIsAuthModalOpen(true);
            } else {
              changeTab('feed');
            }
          }}
          style={{ position: 'relative' }}
        >
          <Activity size={20} />
          <span>IoT FEED</span>
          {appliances.some(a => a.status === 'Critical Alert') && (
            <span className="pulse-red" style={{ position: 'absolute', top: '5px', right: 'calc(50% - 15px)', width: '6px', height: '6px' }} />
          )}
        </button>

        <button 
          className={`mobile-nav-item ${activeTab === 'offers' ? 'active' : ''}`}
          onClick={() => changeTab('offers')}
        >
          <Tag size={20} />
          <span>OFFERS</span>
        </button>

        <button 
          className={`mobile-nav-item ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => {
            if (!user) {
              setAuthTab('signin');
              setIsAuthModalOpen(true);
            } else {
              changeTab('account'); // Navigates to the new Account screen
            }
          }}
        >
          <User size={20} />
          <span>ACCOUNT</span>
        </button>
      </div>

    </div>
  );

  const displaySimulator = isSimulatingMobile && !isNativeMobile;

  return (
    <div className={`dev-simulator-container ${displaySimulator ? 'simulating-active' : 'simulating-inactive'}`}>
      
      {/* Floating Developer Emulator Toggle Badge */}
      {!isNativeMobile && (
        <div className="dev-emulator-badge">
          <button 
            onClick={() => {
              const nextVal = !isSimulatingMobile;
              setIsSimulatingMobile(nextVal);
              localStorage.setItem('homigo_simulate_mobile', String(nextVal));
            }}
            className="dev-emulator-btn"
          >
            {isSimulatingMobile ? '💻 View Desktop Site' : '📱 Simulate Mobile App'}
          </button>
        </div>
      )}

      {displaySimulator ? (
        <div className="phone-frame-mockup">
          <div className="phone-notch"></div>
          <div className="phone-status-bar" style={{ background: '#0f111a', color: 'white', borderBottom: '1px solid #1a1c29' }}>
            <span className="phone-time" style={{ color: 'white' }}>08:04</span>
            <span className="phone-signals" style={{ color: 'white' }}>5G 📶🔋 49%</span>
          </div>
          <div className="phone-screen-viewport">
            {appMarkup}
          </div>
          <div className="phone-home-bar"></div>
        </div>
      ) : (
        appMarkup
      )}
    </div>
  );
}
