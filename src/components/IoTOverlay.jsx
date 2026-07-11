import React, { useState, useEffect, useRef } from 'react';
import { X, Cpu, ShieldAlert, Zap, Server, CheckCircle2, ShieldCheck, Loader2, Calendar, Clock, Phone, User, AlertTriangle, Activity } from 'lucide-react';

const APPLIANCE_COMPONENTS = {
  ac: [
    { name: 'Compressor Motor', key: 'compressor', metric: 'Thermal / Load' },
    { name: 'Gas Charge / Pressure', key: 'gas', metric: 'Pressure' },
    { name: 'Condenser Fan Motor', key: 'condenser', metric: 'Vibration' },
    { name: 'Air Filters Efficiency', key: 'filter', metric: 'Cleanliness' }
  ],
  refrigerator: [
    { name: 'Inverter Compressor', key: 'compressor', metric: 'Thermal / Load' },
    { name: 'Coolant Gas Pressure', key: 'gas', metric: 'Coolant Level' },
    { name: 'Digital Thermostat Relay', key: 'thermostat', metric: 'Relay Accuracy' },
    { name: 'Door Seal / Gasket Vacuum', key: 'gasket', metric: 'Seal Integrity' }
  ],
  tv: [
    { name: 'LED Backlight Array', key: 'backlight', metric: 'Luminance Level' },
    { name: 'Power Board Transformer', key: 'power', metric: 'Voltage Stable' },
    { name: 'Main Process Board (CPU)', key: 'logic', metric: 'Core Temperature' },
    { name: 'Stereo Audio Drivers', key: 'audio', metric: 'Frequency Stability' }
  ],
  washing_machine: [
    { name: 'DirectDrive Inverter Motor', key: 'motor', metric: 'Rotation Frequency' },
    { name: 'Drainage Valve / Solenoid', key: 'drain', metric: 'Flow Rate' },
    { name: 'Water Inlet Manifold', key: 'inlet', metric: 'Pressure' },
    { name: 'Tub Unbalance Accelerometer', key: 'balance', metric: 'Tub Vibration' }
  ],
  mobile: [
    { name: 'Lithium Battery Cells', key: 'battery', metric: 'Health / Cycles' },
    { name: 'SoC Core Processor', key: 'soc', metric: 'Thermal Limit' },
    { name: 'OLED Digitizer Panel', key: 'display', metric: 'Touch Scan Rate' }
  ],
  laptop: [
    { name: 'CPU Core Processor', key: 'cpu', metric: 'Thermal Load' },
    { name: 'Li-Polymer Battery Pack', key: 'battery', metric: 'Remaining Life' },
    { name: 'Active Cooling Centrifugal Fan', key: 'fan', metric: 'Rotation Speed' },
    { name: 'System Motherboard Power Rails', key: 'motherboard', metric: 'Voltage Rails' }
  ],
  water_purifier: [
    { name: 'RO Filter Membrane', key: 'membrane', metric: 'TDS Filtration' },
    { name: 'Activated Carbon Block', key: 'carbon', metric: 'Adsorption Index' },
    { name: 'Sediment Filter Cartridge', key: 'sediment', metric: 'Turbidity Removal' },
    { name: 'UV Sterilizer Tube', key: 'uv', metric: 'UVC Dosage Rate' }
  ],
  default: [
    { name: 'Main Power Module Transformer', key: 'power', metric: 'Voltage Rails' },
    { name: 'Mechanical Motor Driver Assembly', key: 'motor', metric: 'Drive Frequency' },
    { name: 'Wiring Harness Insulation', key: 'wiring', metric: 'Resistance' }
  ]
};

export default function IoTOverlay({ isOpen, onClose, appliances, onResolveStatus, onAddBooking, user, onGoToPlanner, isInlinePage = false }) {
  const [localApps, setLocalApps] = useState(appliances);
  const [selectedAppId, setSelectedAppId] = useState(null);
  
  // Coupling sensor states
  const [isConnectingSensor, setIsConnectingSensor] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionMessage, setConnectionMessage] = useState('');

  // Telemetry values
  const [telemetry, setTelemetry] = useState(null);
  const [isConsoleActive, setIsConsoleActive] = useState(false);

  // Calibration diagnostics state
  const [calibrationStep, setCalibrationStep] = useState(-1); // -1: inactive, 0-4: steps, 5: success
  const [calibMessage, setCalibMessage] = useState('');

  // Auto-monitoring telemetry scan states & refs
  const [monitoringTimer, setMonitoringTimer] = useState(0);
  const [showDiagnosticReport, setShowDiagnosticReport] = useState(false);
  const [lastReport, setLastReport] = useState(null);

  const historyRef = useRef([]);
  const telemetryRef = useRef(null);
  const [scanMode, setScanMode] = useState('normal');

  // Sync telemetryRef with latest telemetry state
  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  const startMonitoring = () => {
    historyRef.current = [];
    setShowDiagnosticReport(false);
    setLastReport(null);
    setMonitoringTimer(10); // 10 seconds monitoring scan
    setIsConsoleActive(true);
  };

  const stopMonitoring = () => {
    setIsConsoleActive(false);
    setMonitoringTimer(0);
  };

  // Service Booking Popup State
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingName, setBookingName] = useState(user?.name || 'Valued Customer');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('Tomorrow');
  const [bookingTime, setBookingTime] = useState('Morning (09:00 AM - 12:00 PM)');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccessInfo, setBookingSuccessInfo] = useState(null);

  // OTP Verification States
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [mockNotification, setMockNotification] = useState(null);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Sync with appliances when they change
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalApps(appliances);
      // Auto-select first IoT-enabled or first general appliance if none selected
      if (appliances.length > 0 && !selectedAppId) {
        const firstIot = appliances.find(a => a.iotEnabled);
        const targetId = firstIot ? firstIot.id : appliances[0].id;
        setSelectedAppId(targetId);
        const targetApp = appliances.find(a => a.id === targetId);
        setTelemetry(targetApp?.telemetry || null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [appliances, selectedAppId]);

  const selectedApp = localApps.find(a => a.id === selectedAppId);

  // Trigger simulated fault
  const triggerSimulatedFault = () => {
    if (!selectedApp) return;

    const appType = (selectedApp.type || selectedApp.name || '').toLowerCase();
    const isFridge = appType.includes('refrigerator');
    const isAC = appType.includes('ac') || appType.includes('air');
    
    const anomalyVib = 0.582;
    const anomalyTemp = isFridge ? 15.2 : isAC ? 88.0 : 76.0;
    const anomalyPower = 390;

    const anomalyTelemetry = {
      vibration: anomalyVib,
      temperature: anomalyTemp,
      powerDraw: anomalyPower,
      status: 'Critical'
    };

    setTelemetry(anomalyTelemetry);

    // Turn device status to Critical Alert
    onResolveStatus(selectedApp.id, 'Critical Alert', anomalyTelemetry);

    // Update local listing immediately
    setLocalApps(prev => prev.map(a => {
      if (a.id === selectedApp.id) {
        return {
          ...a,
          status: 'Critical Alert',
          telemetry: anomalyTelemetry
        };
      }
      return a;
    }));
  };

  // Sync booking name with user when user changes
  useEffect(() => {
    if (user?.name) {
      const timer = setTimeout(() => {
        setBookingName(user.name);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Live telemetry loop for selected device
  const hasTelemetry = !!telemetry;
  useEffect(() => {
    if (!selectedApp || !isConsoleActive || !hasTelemetry) return;

    const timer = setInterval(() => {
      // Fluctuating values
      const vibrationJitter = (Math.random() - 0.5) * 0.012;
      const tempJitter = (Math.random() - 0.5) * 0.18;
      const powerJitter = Math.round((Math.random() - 0.5) * 4);

      setTelemetry(prev => {
        if (!prev) return prev;
        const nextVib = Math.max(0.01, parseFloat((prev.vibration + vibrationJitter).toFixed(3)));
        const nextTemp = Math.max(-5, parseFloat((prev.temperature + tempJitter).toFixed(1)));
        const nextPower = Math.max(0, prev.powerDraw + powerJitter);
        
        return {
          ...prev,
          vibration: nextVib,
          temperature: nextTemp,
          powerDraw: nextPower
        };
      });

    }, 1000);

    return () => clearInterval(timer);
  }, [selectedApp, isConsoleActive, hasTelemetry]);

  // Automatic monitoring countdown & analysis
  useEffect(() => {
    if (!isConsoleActive) return;

    if (monitoringTimer <= 0) {
      setTimeout(() => {
        setIsConsoleActive(false);
      }, 0);
      const history = historyRef.current;

      if (history.length > 0) {
        const appType = (selectedApp?.type || selectedApp?.name || '').toLowerCase();
        const isFridge = appType.includes('refrigerator');
        const isAC = appType.includes('ac') || appType.includes('air');

        // Check if any reading exceeds threshold
        const faults = history.filter(pt => {
          const isVibBad = pt.vibration > 0.25;
          const isTempBad = isFridge ? (pt.temperature > 8.0) : (pt.temperature > 40.0);
          const isPowerBad = isAC ? (pt.powerDraw > 250) : (pt.powerDraw > 150);
          return isVibBad || isTempBad || isPowerBad || pt.status === 'Critical';
        });

        const hasFault = faults.length > 0 || selectedApp?.status === 'Critical Alert';

        const maxVib = Math.max(...history.map(h => h.vibration));
        const avgTemp = parseFloat((history.reduce((sum, h) => sum + h.temperature, 0) / history.length).toFixed(1));
        const maxPower = Math.max(...history.map(h => h.powerDraw));

        setLastReport({
          totalCycles: history.length,
          maxVibration: maxVib,
          avgTemperature: avgTemp,
          maxPowerDraw: maxPower,
          hasFault,
          faultType: faults.length > 0 ? 'Sensor Threshold Anomaly' : (selectedApp?.status === 'Critical Alert' ? 'Simulated System Fault' : null)
        });
        setShowDiagnosticReport(true);

        if (hasFault) {
          triggerSimulatedFault();
          setShowBookingForm(true);
        }
      }
      return;
    }

    // Trigger stress test anomaly midway (inject anomaly telemetry values)
    if (scanMode === 'stress' && monitoringTimer === 5) {
      const appType = (selectedApp?.type || selectedApp?.name || '').toLowerCase();
      const isFridge = appType.includes('refrigerator');
      const isAC = appType.includes('ac') || appType.includes('air');

      const anomalyTelemetry = {
        vibration: 0.582,
        temperature: isFridge ? 15.2 : isAC ? 88.0 : 76.0,
        powerDraw: 390,
        status: 'Critical'
      };

      setTelemetry(anomalyTelemetry);
      onResolveStatus(selectedApp.id, 'Critical Alert', anomalyTelemetry);
    }

    const interval = setTimeout(() => {
      setMonitoringTimer(prev => prev - 1);
      if (telemetryRef.current) {
        historyRef.current.push({ ...telemetryRef.current });
      }
    }, 1000);

    return () => clearTimeout(interval);
  }, [isConsoleActive, monitoringTimer, selectedApp, scanMode]);


  // Handle selected node changes
  const handleAppSelect = (id) => {
    setSelectedAppId(id);
    const targetApp = localApps.find(a => a.id === id);
    setTelemetry(targetApp?.telemetry || null);
    setIsConsoleActive(false);
    setCalibrationStep(-1);
    setShowBookingForm(false);
    setBookingSuccessInfo(null);
    
    // Reset monitoring states
    setMonitoringTimer(0);
    setShowDiagnosticReport(false);
    setLastReport(null);
    historyRef.current = [];
  };

  // Calibration Wizard simulation
  const startCalibration = () => {
    if (!selectedApp) return;
    setCalibrationStep(0);
    setCalibMessage('Initiating duplex diagnostic bridge...');

    const steps = [
      { msg: 'Pinging IoT Gateway node and checking signal latency (12ms)...' },
      { msg: 'Measuring line voltage stability and current frequency (50Hz)...' },
      { msg: 'Verifying vibration transducer frequency limit metrics...' },
      { msg: 'Calibrating micro-thermal sensors and thermostat resistance...' },
      { msg: 'Diagnostics successful! All hardware components functioning optimally.' }
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setCalibrationStep(current + 1);
        setCalibMessage(steps[current].msg);
        current++;
      } else {
        clearInterval(interval);
        
        // Reset local telemetry state to optimal healthy values
        const appType = (selectedApp.type || selectedApp.name || '').toLowerCase();
        const healthyTemp = appType.includes('refrigerator') ? 4.0 : appType.includes('ac') ? 22.0 : 38.0;
        const healthyPower = appType.includes('ac') ? 110 : 80;
        const healthyTelemetry = {
          vibration: 0.082,
          temperature: healthyTemp,
          powerDraw: healthyPower,
          status: 'Healthy'
        };

        setTelemetry(healthyTelemetry);

        // Turn device status back to optimal / Protected
        onResolveStatus(selectedApp.id, 'Protected', healthyTelemetry);

        // Update local listing immediately
        setLocalApps(prev => prev.map(a => {
          if (a.id === selectedApp.id) {
            return {
              ...a,
              status: 'Protected',
              telemetry: healthyTelemetry
            };
          }
          return a;
        }));
      }
    }, 1000);
  };



  // Simulate IoT upgrade for standard coverage
  const handleSimulateIotUpgrade = (appId) => {
    setIsConnectingSensor(true);
    setConnectionProgress(0);
    setConnectionMessage('Initializing IoT Smart Mod coupling...');

    setTimeout(() => {
      setConnectionProgress(30);
      setConnectionMessage('Establishing secure digital pairing...');
    }, 400);

    setTimeout(() => {
      setConnectionProgress(65);
      setConnectionMessage('Synchronizing duplex telemetry data streams...');
    }, 1000);

    setTimeout(() => {
      setConnectionProgress(100);
      setConnectionMessage('Sensor network active! Syncing telemetry...');
    }, 1600);

    setTimeout(() => {
      setIsConnectingSensor(false);
      setLocalApps(prev => prev.map(a => {
        if (a.id === appId) {
          const aType = (a.type || a.name || '').toLowerCase();
          const defaultTelemetry = {
            vibration: 0.075,
            temperature: aType.includes('refrigerator') ? 3.5 : aType.includes('ac') ? 21.5 : 37.0,
            powerDraw: aType.includes('ac') ? 130 : 90,
            status: 'Healthy'
          };
          if (appId === selectedAppId) {
            setTelemetry(defaultTelemetry);
          }
          // Bubble up resolution
          onResolveStatus(appId, a.status, defaultTelemetry);
          return {
            ...a,
            iotEnabled: true,
            telemetry: defaultTelemetry
          };
        }
        return a;
      }));
    }, 2100);
  };

  const triggerOtpFlow = (bookingPayload) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCode(code);
    setOtpInput(['', '', '', '']);
    setOtpError(false);
    setResendTimer(30);
    setPendingBooking(bookingPayload);
    setOtpModalOpen(true);

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
      const nextInput = document.getElementById(`iot-otp-input-${idx + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && otpInput[idx] === '' && idx > 0) {
      const prevInput = document.getElementById(`iot-otp-input-${idx - 1}`);
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
      if (pendingBooking) {
        onAddBooking(pendingBooking);

        // Reset local/parent device status to "Scheduled" (covered and solved)
        const appType = (selectedApp.type || selectedApp.name || '').toLowerCase();
        const healthyTemp = appType.includes('refrigerator') ? 4.0 : appType.includes('ac') ? 22.0 : 38.0;
        const healthyPower = appType.includes('ac') ? 110 : 80;
        const healthyTelemetry = {
          vibration: 0.082,
          temperature: healthyTemp,
          powerDraw: healthyPower,
          status: 'Healthy'
        };

        setTelemetry(healthyTelemetry);
        onResolveStatus(selectedApp.id, 'Scheduled', healthyTelemetry);
        setLocalApps(prev => prev.map(a => {
          if (a.id === selectedApp.id) {
            return {
              ...a,
              status: 'Scheduled',
              telemetry: healthyTelemetry
            };
          }
          return a;
        }));

        setBookingSuccessInfo({
          ticketId: pendingBooking.id,
          date: pendingBooking.appointmentDate,
          slot: pendingBooking.appointmentSlot,
          techName: 'Rahul Kumar (Vetted Professional)'
        });
      }

      setOtpModalOpen(false);
      setShowBookingForm(false);
      setPendingBooking(null);
      setOtpCode('');
    } else {
      setOtpError(true);
      setOtpInput(['', '', '', '']);
      const firstInput = document.getElementById('iot-otp-input-0');
      if (firstInput) firstInput.focus();
    }
  };

  const handleResendOtp = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
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
  };

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
      type: 'IoT Predictive Breakdown Dispatch',
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

    triggerOtpFlow(newBooking);
  };

  // Helper to fetch component values
  const getApplianceTypeKey = (typeStr) => {
    const key = (typeStr || '').toLowerCase();
    if (key.includes('ac') || key.includes('condition')) return 'ac';
    if (key.includes('fridge') || key.includes('refrigerator')) return 'refrigerator';
    if (key.includes('tv') || key.includes('television')) return 'tv';
    if (key.includes('wash') || key.includes('machine')) return 'washing_machine';
    if (key.includes('mobile') || key.includes('phone')) return 'mobile';
    if (key.includes('laptop')) return 'laptop';
    if (key.includes('water') || key.includes('purifier') || key.includes('ro')) return 'water_purifier';
    return 'default';
  };

  const appKey = selectedApp ? getApplianceTypeKey(selectedApp.type || selectedApp.name || '') : 'default';
  const componentsList = APPLIANCE_COMPONENTS[appKey] || APPLIANCE_COMPONENTS.default;

  // Resolve component statuses based on telemetry
  const resolveComponentStatus = (compKey, isCritical) => {
    const currentTemp = telemetry?.temperature || 22.0;
    const currentVib = telemetry?.vibration || 0.082;
    const currentPower = telemetry?.powerDraw || 130;

    if (isCritical) {
      if (compKey === 'compressor' || compKey === 'motor' || compKey === 'cpu') {
        return { value: `${currentTemp}°C | Danger Overheat`, status: 'Critical Anomaly', color: 'var(--color-danger)' };
      }
      if (compKey === 'gas') {
        return { value: `18 PSI | Low Gas Pressure`, status: 'Gas Leakage Warning', color: 'var(--brand-primary)' };
      }
      if (compKey === 'balance' || compKey === 'condenser') {
        return { value: `${currentVib}g | Excess Shaking`, status: 'Unbalance Alert', color: 'var(--color-danger)' };
      }
      if (compKey === 'power' || compKey === 'battery') {
        return { value: `${currentPower}W | Overload Surge`, status: 'Overload Alarm', color: 'var(--color-danger)' };
      }
      return { value: 'Fault Alert', status: 'Warning', color: 'var(--color-danger)' };
    }

    // Healthy values
    if (compKey === 'compressor' || compKey === 'cpu') {
      return { value: `${currentTemp}°C | Stable`, status: 'Optimal', color: 'var(--color-success)' };
    }
    if (compKey === 'gas') {
      return { value: '64 PSI | Constant', status: 'Optimal', color: 'var(--color-success)' };
    }
    if (compKey === 'condenser' || compKey === 'balance') {
      return { value: `${currentVib}g | Balanced`, status: 'Optimal', color: 'var(--color-success)' };
    }
    if (compKey === 'power') {
      return { value: '230V | 100% Stable', status: 'Optimal', color: 'var(--color-success)' };
    }
    if (compKey === 'filter' || compKey === 'gasket' || compKey === 'display' || compKey === 'membrane') {
      return { value: '94% Clean / Intact', status: 'Optimal', color: 'var(--color-success)' };
    }
    if (compKey === 'thermostat' || compKey === 'carbon' || compKey === 'soc') {
      return { value: '99% Calibrated', status: 'Optimal', color: 'var(--color-success)' };
    }
    if (compKey === 'battery') {
      return { value: '98% Capacity', status: 'Healthy', color: 'var(--color-success)' };
    }
    if (compKey === 'fan') {
      return { value: '2200 RPM', status: 'Optimal', color: 'var(--color-success)' };
    }

    return { value: 'Functional', status: 'Optimal', color: 'var(--color-success)' };
  };

  const isSelectedAppCritical = selectedApp?.status === 'Critical Alert';

  if (!isOpen) return null;

  return (
    <div 
      className={isInlinePage ? "iot-inline-page-container" : "iot-full-window-overlay"} 
      style={isInlinePage ? {} : {
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
      }}
    >
      {/* Header */}
      {isInlinePage ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={20} className="pulse-orange" style={{ color: 'var(--brand-primary)', cursor: 'pointer' }} onDoubleClick={triggerSimulatedFault} title="Double-click to simulate fault" />
              🛡️ Guardian Diagnostic Shield
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Select a connected device below to stream live mechanical metrics and run calibration sweeps.
            </p>
          </div>
        </div>
      ) : (
        <div 
          className="full-window-overlay-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            position: 'relative',
            flexWrap: 'nowrap'
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
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={20} className="pulse-orange" style={{ color: 'var(--brand-primary)', cursor: 'pointer' }} onDoubleClick={triggerSimulatedFault} title="Double-click to simulate fault" />
              IoT Smart Sensor Telemetry Grid
            </h2>
            <p style={{ margin: '1px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Real-time component tracking, mechanical sensor analytics, and predictive breakdown shielding.
            </p>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div 
        className={isInlinePage ? "" : "full-window-overlay-body"}
        style={isInlinePage ? {
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        } : { 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px', 
          background: 'var(--bg-secondary)'
        }}
      >
        {localApps.length === 0 ? (
          /* Empty State */
          <div style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <Server size={60} style={{ color: 'var(--text-muted)', strokeWidth: 1.5 }} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>No Monitored Nodes Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto', lineHeight: 1.6 }}>
                You do not have any registered devices under an AMC plan yet. Purchase a protection plan to establish sensor links and initiate 24/7 guardian monitoring.
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
              🛡️ Configure AMC Plan
            </button>
          </div>
        ) : (
          /* Main Dashboard Layout */
          <div className="iot-dashboard-grid">
            
            {/* Left Column: Device Nodes Selector */}
            <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '16px', minWidth: 0 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                Monitored Devices ({localApps.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {localApps.map((app) => {
                  const isSelected = selectedAppId === app.id;
                  const isIot = app.iotEnabled;
                  const isCritical = app.status === 'Critical Alert';
                  const isScheduled = app.status === 'Scheduled';

                  return (
                    <div 
                      key={app.id} 
                      onClick={() => handleAppSelect(app.id)}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                        border: isSelected ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                        transition: 'var(--transition-smooth)',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{app.icon}</span>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          padding: '2px 6px', 
                          borderRadius: '10px', 
                          fontWeight: 800,
                          background: isCritical ? '#fff2f2' : isScheduled ? '#eefaff' : !isIot ? 'var(--bg-secondary)' : '#eefff9',
                          color: isCritical ? 'var(--color-danger)' : isScheduled ? 'var(--color-info)' : !isIot ? 'var(--text-secondary)' : 'var(--color-success)'
                        }}>
                          {isCritical ? 'CRITICAL' : isScheduled ? 'SCHEDULED' : !isIot ? 'NO SENSOR' : 'ONLINE'}
                        </span>
                      </div>
                      
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', display: 'block', color: 'var(--text-primary)' }}>{app.name}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                        Brand: {app.brand} | {app.age}
                      </span>

                      {!isIot && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimulateIotUpgrade(app.id);
                          }}
                          className="btn-secondary"
                          style={{
                            width: '100%',
                            marginTop: '10px',
                            padding: '4px 8px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            borderColor: 'var(--brand-primary)',
                            color: 'var(--brand-primary)',
                            background: '#ffffff'
                          }}
                        >
                          ⚡ Plug IoT Telemetry Mod
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Telemetry & Components Status Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, overflow: 'hidden' }}>
              {selectedApp ? (
                <>
                  {/* Selected Device Summary Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                        Interrogating: {selectedApp.name}
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Status: <strong style={{ color: isSelectedAppCritical ? 'var(--color-danger)' : selectedApp.status === 'Scheduled' ? 'var(--color-info)' : 'var(--color-success)' }}>{selectedApp.status}</strong>
                      </p>
                    </div>

                    {selectedApp.iotEnabled && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>SCAN MODE:</span>
                        <select 
                          value={scanMode} 
                          onChange={(e) => setScanMode(e.target.value)}
                          disabled={isConsoleActive}
                          style={{
                            background: '#ffffff',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '4px 6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            maxWidth: '160px'
                          }}
                        >
                          <option value="normal">🟢 Standard Scan</option>
                          <option value="stress">🔴 Stress Test</option>
                        </select>

                        <button 
                          onClick={() => isConsoleActive ? stopMonitoring() : startMonitoring()}
                          className={isConsoleActive ? 'btn-secondary' : 'btn-primary'}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {isConsoleActive ? (
                            <>
                              <Loader2 className="animate-spin" size={13} />
                              {`Scanning... (${monitoringTimer}s)`}
                            </>
                          ) : (
                            <>
                              <Activity size={13} />
                              Start Monitor
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {selectedApp.iotEnabled ? (
                    /* IoT Enabled Telemetry View */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                      {/* Critical Anomaly Warning Banner */}
                      {selectedApp.status === 'Critical Alert' && !showBookingForm && (
                        <div style={{
                          background: '#fff2f2',
                          border: '1.5px solid var(--color-danger)',
                          borderRadius: '10px',
                          padding: '14px',
                          marginBottom: '0px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '10px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                              Critical Anomaly Flagged! Immediate repair visit recommended.
                            </span>
                          </div>
                          <button 
                            onClick={() => setShowBookingForm(true)}
                            className="btn-primary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: 'var(--color-danger)',
                              borderColor: 'var(--color-danger)'
                            }}
                          >
                            🔧 Book Priority Dispatch
                          </button>
                        </div>
                      )}
                      
                      {/* Diagnostic Report Card */}
                      {showDiagnosticReport && lastReport && selectedApp.status !== 'Critical Alert' && (
                        <div style={{
                          background: lastReport.hasFault ? '#fff5f5' : '#f5fff8',
                          border: `1.5px solid ${lastReport.hasFault ? 'var(--color-danger)' : 'var(--color-success)'}`,
                          borderRadius: '10px',
                          padding: '16px',
                          marginBottom: '6px',
                          animation: 'fadeIn 0.3s ease-out'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            {lastReport.hasFault ? (
                              <AlertTriangle style={{ color: 'var(--color-danger)' }} size={18} />
                            ) : (
                              <CheckCircle2 style={{ color: 'var(--color-success)' }} size={18} />
                            )}
                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: lastReport.hasFault ? 'var(--color-danger)' : 'var(--color-success)' }}>
                              {lastReport.hasFault ? 'System Diagnostics: FAULT DETECTED' : 'System Diagnostics: PASS (Optimal)'}
                            </h4>
                          </div>
                          
                          <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            Autonomous telemetry monitoring completed. Monitored <strong>{lastReport.totalCycles} cycles</strong>.
                          </p>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '8px' }}>
                            <div>
                              <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Avg Temperature</span>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{lastReport.avgTemperature} °C</span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Peak Vibration</span>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{lastReport.maxVibration} g</span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Peak Load</span>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{lastReport.maxPowerDraw} W</span>
                            </div>
                          </div>

                          {lastReport.hasFault && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 700 }}>
                              🚨 Safety limits exceeded. A priority technician dispatch window has been opened.
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Telemetry Numbers */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        
                        <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', minWidth: 0 }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>VIBRATION FORCE</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: isSelectedAppCritical ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                            {telemetry ? `${telemetry.vibration} g` : `${selectedApp.telemetry?.vibration || 0.08} g`}
                          </span>
                        </div>

                        <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', minWidth: 0 }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>TEMPERATURE</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: isSelectedAppCritical ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                            {telemetry ? `${telemetry.temperature} °C` : `${selectedApp.telemetry?.temperature || 22} °C`}
                          </span>
                        </div>

                        <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', minWidth: 0 }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>ENERGY LOAD</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: isSelectedAppCritical ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                            {telemetry ? `${telemetry.powerDraw} W` : `${selectedApp.telemetry?.powerDraw || 120} W`}
                          </span>
                        </div>

                      </div>

                      {/* Component-Specific Clean Diagnostics Grid */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          🔧 Integrated Component Telemetry Status
                        </span>
                        
                        <div className="iot-components-grid" style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          padding: '12px',
                          borderRadius: '10px'
                        }}>
                          {componentsList.map((comp) => {
                            const compDiag = resolveComponentStatus(comp.key, isSelectedAppCritical);
                            
                            return (
                              <div 
                                key={comp.key}
                                style={{
                                  background: 'var(--bg-secondary)',
                                  border: `1px solid ${isSelectedAppCritical && compDiag.status !== 'Optimal' ? 'var(--brand-primary-light)' : 'var(--border-color)'}`,
                                  padding: '10px',
                                  borderRadius: '8px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: '6px',
                                  minWidth: 0
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{comp.name}</span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{comp.metric}: <strong style={{ color: 'var(--text-primary)' }}>{compDiag.value}</strong></span>
                                </div>
                                
                                <span style={{
                                  fontSize: '0.65rem',
                                  padding: '3px 6px',
                                  borderRadius: '6px',
                                  fontWeight: 800,
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                  background: compDiag.status === 'Optimal' ? 'var(--color-success-light)' : '#fff2f2',
                                  color: compDiag.color
                                }}>
                                  {compDiag.status}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Calibration and Diagnostics Panel */}
                      <div style={{ 
                        border: '1.5px solid var(--border-color)', 
                        borderRadius: '10px', 
                        padding: '16px', 
                        background: 'var(--bg-secondary)',
                        textAlign: 'left'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>System Recalibration Utility</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                              Reset internal hardware sensor offsets to clear stable diagnostic conditions.
                            </p>
                          </div>
                          
                          <button
                            onClick={startCalibration}
                            disabled={(calibrationStep >= 0 && calibrationStep < 5) || isSelectedAppCritical}
                            className="btn-secondary"
                            style={{ 
                              padding: '8px 16px', 
                              fontSize: '0.78rem', 
                              fontWeight: 700, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              background: '#ffffff',
                              borderColor: isSelectedAppCritical ? 'var(--border-color)' : 'var(--brand-primary)',
                              color: isSelectedAppCritical ? 'var(--text-muted)' : 'var(--brand-primary)'
                            }}
                          >
                            {calibrationStep >= 0 && calibrationStep < 5 ? (
                              <>
                                <Loader2 className="animate-spin" size={14} /> Calibrating...
                              </>
                            ) : (
                              '⚡ Run Sensor Calibration'
                            )}
                          </button>
                        </div>

                        {/* Diagnostic progress wizard bar */}
                        {calibrationStep >= 0 && (
                          <div style={{ marginTop: '12px' }}>
                            <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                              <div style={{
                                height: '100%',
                                width: `${(calibrationStep / 5) * 100}%`,
                                background: calibrationStep === 5 ? 'var(--color-success)' : 'var(--brand-primary)',
                                transition: 'width 0.4s ease'
                              }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: calibrationStep === 5 ? 'var(--color-success)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {calibrationStep === 5 ? (
                                <>
                                  <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                                  Sensor offset calibration completed successfully!
                                </>
                              ) : (
                                <>
                                  <Loader2 className="animate-spin" size={12} />
                                  {calibMessage}
                                </>
                              )}
                            </span>
                          </div>
                        )}

                      </div>

                    </div>
                  ) : (
                    /* Standard coverage View */
                    <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                      <ShieldCheck size={54} style={{ color: 'var(--color-success)', opacity: 0.7 }} />
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Standard Coverage Protection Active</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.5 }}>
                          This device is under the HOMIGO Shield (covers all repair visits, diagnostic labor, and spare parts), but is not currently fitted with real-time IoT tracking hardware.
                        </p>
                      </div>
                      <button 
                        onClick={() => handleSimulateIotUpgrade(selectedApp.id)}
                        className="btn-primary"
                        style={{ padding: '10px 24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Zap size={14} /> Plug & Simulate IoT Smart Mod
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Select an appliance from the node list to interrogate
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Priority Emergency Service Booking Modal Overlay */}
      {showBookingForm && selectedApp && (
        <div className="modal-overlay" style={{ background: 'rgba(26,28,41,0.65)', zIndex: 2100 }}>
          <div 
            className="modal-content" 
            style={{ 
              maxWidth: '480px', 
              padding: '24px', 
              boxShadow: 'var(--shadow-lg)',
              border: '1.5px solid var(--brand-primary)',
              background: '#ffffff',
              textAlign: 'left'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#fff2f2', padding: '6px', borderRadius: '50%', color: 'var(--color-danger)', animation: 'pulse-danger 1.5s infinite' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>IoT Anomaly Detected!</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Book Priority Service Request</span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              A critical fault was flagged on your <strong style={{ color: 'var(--text-primary)' }}>{selectedApp.name}</strong>. Choose a preferred slot below to schedule a cashless dispatcher.
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
                    style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '36px' }}
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
                    style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '36px' }}
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
                        background: bookingDate === dateOpt ? 'var(--brand-primary-light)' : '#ffffff',
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
                        background: bookingTime === slotOpt ? 'var(--brand-primary-light)' : '#ffffff',
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
                  placeholder="e.g. Unusual noise, gas leakage, low cooling..."
                  style={{ fontSize: '0.8rem', padding: '8px', minHeight: '60px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
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
                    // Turn status back or close form temporarily
                    setShowBookingForm(false);
                  }}
                  className="btn-secondary" 
                  style={{ flex: 1, height: '38px', fontSize: '0.8rem', fontWeight: 700 }}
                >
                  Postpone
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
        <div className="modal-overlay" style={{ background: 'rgba(26,28,41,0.65)', zIndex: 2200 }}>
          <div 
            className="modal-content" 
            style={{ 
              maxWidth: '440px', 
              padding: '30px 24px', 
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              background: '#ffffff'
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
              Your service appointment has been successfully scheduled. Priority technician dispatch is active.
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
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem' }}>VETTED PROFESSIONAL</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{bookingSuccessInfo.techName}</span>
              </div>
            </div>

            <button 
              onClick={() => setBookingSuccessInfo(null)}
              className="btn-primary" 
              style={{ width: '100%', padding: '12px', fontWeight: 700 }}
            >
              Return to Diagnostics
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
            zIndex: 2300,
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
            <span style={{ fontSize: '#0.8rem', color: '#e5e7eb', marginTop: '2px', display: 'block' }}>
              {mockNotification.message}
            </span>
          </div>
        </div>
      )}

      {/* OTP Verification Modal Overlay */}
      {otpModalOpen && pendingBooking && (
        <div className="modal-overlay" style={{ background: 'rgba(26,28,41,0.7)', zIndex: 2250 }}>
          <div className="modal-content" style={{ maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
            <div style={{ background: 'var(--brand-primary-light)', width: '56px', height: '56px', borderRadius: '50%', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldCheck size={28} />
            </div>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Security Verification
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              A 4-digit verification code (OTP) has been sent to <strong style={{ color: 'var(--text-primary)' }}>+91 {pendingBooking.customerPhone ? pendingBooking.customerPhone.substring(0, 4) + 'XXXX' + pendingBooking.customerPhone.substring(8) : 'XXXXXX'}</strong> via SMS and WhatsApp.
            </p>

            {/* 4-digit boxes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
              {otpInput.map((val, idx) => (
                <input
                  key={idx}
                  id={`iot-otp-input-${idx}`}
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
                setOtpModalOpen(false);
                setPendingBooking(null);
              }}
              className="btn-secondary"
              style={{ width: '100%', height: '36px', fontSize: '0.8rem', fontWeight: 700, marginTop: '16px', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '6px', background: 'none' }}
            >
              Cancel Verification
            </button>
          </div>
        </div>
      )}

      {/* IoT Sensor Connection Simulation Overlay */}
      {isConnectingSensor && (
        <div className="modal-overlay" style={{ background: 'rgba(15, 17, 26, 0.75)', zIndex: 2400 }}>
          <div className="modal-content" style={{ maxWidth: '400px', padding: '32px', textAlign: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
            <div style={{
              background: 'var(--brand-primary-light)',
              color: 'var(--brand-primary)',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              animation: 'pulse-orange 1.5s infinite'
            }}>
              <Cpu size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Coupling Smart Sensor
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              {connectionMessage}
            </p>
            <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{
                height: '100%',
                width: `${connectionProgress}%`,
                background: 'var(--brand-primary)',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Progress: {connectionProgress}%
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
