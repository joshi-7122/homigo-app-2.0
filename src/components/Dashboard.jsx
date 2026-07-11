import React, { useState, useEffect } from 'react';
import { Activity, Bell, Calendar, Cpu, HardDrive, ShieldCheck, UserCheck, Wrench, AlertTriangle } from 'lucide-react';

export default function Dashboard({ appliances, bookings, onAddBooking, onResolveApplianceStatus }) {
  const [selectedId, setSelectedId] = useState(appliances[0]?.id || '');
  const [localAppliances, setLocalAppliances] = useState(appliances);
  const [alert, setAlert] = useState(null);

  // Sync state when appliances change
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalAppliances(appliances);
      if (appliances.length > 0 && !selectedId) {
        setSelectedId(appliances[0].id);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [appliances, selectedId]);

  const selectedAppliance = localAppliances.find(a => a.id === selectedId);

  // Live telemetry loop
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalAppliances(prev => prev.map(app => {
        if (!app.telemetry || app.telemetry.status === 'Critical') return app;
        
        // Jitter metrics
        const jitter = (Math.random() - 0.5) * 0.015;
        const tempJitter = (Math.random() - 0.5) * 0.15;
        const powerJitter = Math.round((Math.random() - 0.5) * 3);

        return {
          ...app,
          telemetry: {
            ...app.telemetry,
            vibration: Math.max(0.01, parseFloat((app.telemetry.vibration + jitter).toFixed(3))),
            temperature: Math.max(-2, parseFloat((app.telemetry.temperature + tempJitter).toFixed(1))),
            powerDraw: Math.max(0, app.telemetry.powerDraw + powerJitter)
          }
        };
      }));
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  const triggerAnomaly = (id) => {
    setLocalAppliances(prev => prev.map(app => {
      if (app.id !== id) return app;
      
      const appType = (app.type || app.name || '').toLowerCase();
      const appName = (app.name || '').toLowerCase();
      const isAC = appName.includes('ac') || appType.includes('air') || appType.includes('ac');
      const isFridge = appName.includes('refrigerator') || appType.includes('fridge') || appType.includes('refrigerator');
      
      const vibrationVal = 0.54;
      const tempVal = isFridge ? 15.2 : isAC ? 34.0 : 88.0;
      const powerVal = 390;

      // Trigger Push Alert
      setAlert({
        applianceId: app.id,
        name: app.name,
        type: app.type,
        message: `⚠️ HOMIGO Predictive Alert: Vibration anomaly (${vibrationVal}g) & compressor temperature surge (${tempVal}°C) detected on your ${app.name}. Failure risk: CRITICAL.`,
      });

      return {
        ...app,
        status: 'Critical Alert',
        telemetry: {
          vibration: vibrationVal,
          temperature: tempVal,
          powerDraw: powerVal,
          status: 'Critical'
        }
      };
    }));

    onResolveApplianceStatus(id, 'Critical Alert', {
      vibration: 0.54,
      temperature: 34.0,
      powerDraw: 390,
      status: 'Critical'
    });
  };

  const handleBookService = () => {
    if (!alert) return;

    const newTicket = {
      id: `HMGO-${Math.floor(1000 + Math.random() * 9000)}`,
      appliance: alert.name,
      type: 'Predictive Repair (Pre-diagnosed)',
      time: 'Scheduled: Tomorrow, 10:00 AM',
      status: 'Confirmed',
      tech: 'Rahul Kumar (Vetted Partner)',
      cost: '₹0 (Covered under AMC)'
    };

    onAddBooking(newTicket);

    // Resolve appliance back to "Scheduled"
    setLocalAppliances(prev => prev.map(app => {
      if (app.id !== alert.applianceId) return app;
      return {
        ...app,
        status: 'Scheduled',
        telemetry: {
          ...app.telemetry,
          status: 'Pending Repair'
        }
      };
    }));

    onResolveApplianceStatus(alert.applianceId, 'Scheduled', {
      vibration: 0.12,
      temperature: (alert.type || alert.name || '').toLowerCase().includes('refrigerator') ? 4 : 22,
      powerDraw: 120,
      status: 'Pending Repair'
    });

    setAlert(null);
  };

  const handleClearAlert = () => {
    setAlert(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Alert Banner Container */}
      {alert && (
        <div className="notification-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: '#fff2f2',
              padding: '10px',
              borderRadius: '50%',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              animation: 'pulse-danger 1.5s infinite'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ff1744' }}>Guardian Predictive Threat Flagged</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', maxWidth: '800px' }}>{alert.message}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={handleBookService} style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <Wrench size={16} /> Dispatch Technician (₹0)
            </button>
            <button className="btn-secondary" onClick={handleClearAlert} style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-grid" style={{ padding: 0 }}>
        
        {/* Left Column: Live IoT Telemetry Monitoring */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {localAppliances.length > 0 ? (
            <>
              {/* Appliance Selection Carousel */}
              <div className="replicated-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HardDrive size={18} style={{ color: 'var(--brand-primary)' }} />
                  Live Guardian Feed Selector
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '12px'
                }}>
                  {localAppliances.map(app => (
                    <div 
                      key={app.id} 
                      onClick={() => setSelectedId(app.id)}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        background: selectedId === app.id ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                        border: selectedId === app.id ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)',
                        position: 'relative',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <span style={{ fontSize: '1.8rem' }}>{app.icon}</span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          background: 
                            app.status === 'Critical Alert' ? '#fff2f2' :
                            app.status === 'Scheduled' ? '#eefaff' :
                            '#eefff9',
                          color:
                            app.status === 'Critical Alert' ? 'var(--color-danger)' :
                            app.status === 'Scheduled' ? 'var(--color-info)' :
                            'var(--color-success)',
                        }}>
                          {app.status}
                        </span>
                      </div>
                      
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>{app.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AMC Duration: {app.duration.split(' ')[0]} {app.duration.split(' ')[1]}</span>
                      
                      {app.telemetry && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                          <div className={app.telemetry.status === 'Critical' ? 'pulse-red' : 'pulse-green'} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>IoT Sync Active</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Telemetry Stats */}
              {selectedAppliance && (
                <div className="replicated-card" style={{ position: 'relative', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '2.5rem' }}>{selectedAppliance.icon}</span>
                      <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedAppliance.name} Diagnostics</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Brand: {selectedAppliance.brand} | Registered Age timeline: {selectedAppliance.age}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>UNIT HEALTH</span>
                        <span style={{ 
                          fontWeight: 800, 
                          fontSize: '1.25rem',
                          color: selectedAppliance.telemetry?.status === 'Critical' ? 'var(--color-danger)' : 'var(--color-success)'
                        }}>
                          {selectedAppliance.telemetry?.status === 'Critical' ? '42% (Critical)' : '94% (Optimal)'}
                        </span>
                      </div>

                      {selectedAppliance.telemetry ? (
                        <button 
                          className="btn-secondary" 
                          onClick={() => triggerAnomaly(selectedAppliance.id)}
                          disabled={selectedAppliance.telemetry.status === 'Critical'}
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.8rem',
                            borderColor: 'var(--color-danger)',
                            color: selectedAppliance.telemetry.status === 'Critical' ? 'var(--text-muted)' : 'var(--color-danger)',
                            background: '#fff8f8'
                          }}
                        >
                          Trigger Stress Test
                        </button>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '6px', fontWeight: 600 }}>
                          Standard Cover (No IoT)
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedAppliance.telemetry ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                        
                        {/* Vibration Card */}
                        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 700 }}>MOTOR VIBRATION</span>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: selectedAppliance.telemetry.status === 'Critical' ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                              {selectedAppliance.telemetry.vibration}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>g-force</span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(100, (selectedAppliance.telemetry.vibration / 0.6) * 100)}%`,
                              background: selectedAppliance.telemetry.status === 'Critical' ? 'var(--color-danger)' : 'var(--brand-primary)',
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                        </div>

                        {/* Temperature Card */}
                        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 700 }}>INTERNAL TEMPERATURE</span>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: selectedAppliance.telemetry.status === 'Critical' ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                              {selectedAppliance.telemetry.temperature}°
                            </span>
                            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>C</span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(100, Math.abs((selectedAppliance.telemetry.temperature / 90) * 100))}%`,
                              background: selectedAppliance.telemetry.status === 'Critical' ? 'var(--color-danger)' : 'var(--brand-primary)',
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                        </div>

                        {/* Power Draw Card */}
                        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 700 }}>POWER CONSUMPTION</span>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: selectedAppliance.telemetry.status === 'Critical' ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                              {selectedAppliance.telemetry.powerDraw}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Watts</span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(100, (selectedAppliance.telemetry.powerDraw / 400) * 100)}%`,
                              background: selectedAppliance.telemetry.status === 'Critical' ? 'var(--color-danger)' : 'var(--brand-primary)',
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                        </div>

                      </div>

                      {/* Telemetry Chart Mockup */}
                      <div style={{
                        height: '180px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '20px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <span style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                          <Activity size={14} style={{ color: 'var(--brand-primary)' }} />
                          Guardian Core Engine Analytics
                        </span>
                        
                        {/* Simulated Graph Lines */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px', width: '100%' }}>
                          {[...Array(20)].map((_, i) => {
                            const height = selectedAppliance.telemetry.status === 'Critical' 
                              ? 60 + Math.sin(i * 1.5) * 10 + Math.cos(i * 2.2) * 7
                              : 20 + Math.sin(i * 0.4) * 4 + Math.cos(i * 1.8) * 3;
                            return (
                              <div 
                                key={i} 
                                style={{
                                  width: '3.2%',
                                  height: `${height}%`,
                                  background: selectedAppliance.telemetry.status === 'Critical' 
                                    ? 'linear-gradient(to top, var(--color-danger), transparent)' 
                                    : 'linear-gradient(to top, var(--brand-primary), transparent)',
                                  borderRadius: '2px',
                                  opacity: 0.3 + (i / 20) * 0.7,
                                  transition: 'height 1.5s ease'
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <ShieldCheck size={48} style={{ color: 'var(--color-success)', opacity: 0.7 }} />
                      <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '4px', fontWeight: 700 }}>Appliance Protected under Standard AMC</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          This appliance is fully covered for repairs, spare parts, and breakdowns, but does not feature real-time IoT diagnostic sync. Upgrades can be requested by selecting the 3-Year Ultimate plan or adding a modular plug hardware package.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="replicated-card" style={{ padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', justifyContent: 'center', minHeight: '400px' }}>
              <ShieldCheck size={48} style={{ color: 'var(--brand-primary)', opacity: 0.8 }} />
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>No Active Protection Plans</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>
                  Your appliances aren't covered under the HOMIGO Shield yet. Purchase an AMC plan to enable real-time IoT diagnostic feeds and cashless repair coverage.
                </p>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
                ✔ 100% Cashless  •  ✔ Vetted Technicians  •  ✔ IoT Predictive Alerts
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Booking History & Calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Bookings Card */}
          <div className="replicated-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Calendar size={18} style={{ color: 'var(--brand-primary)' }} />
              Active Service Log
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {bookings.length > 0 ? (
                bookings.map(book => (
                  <div 
                    key={book.id}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>ID: {book.id}</span>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        background: 
                          book.status === 'Confirmed' ? 'var(--brand-primary-light)' : 
                          book.status === 'Completed' ? '#eefff9' : 
                          '#fff8f0',
                        color: 
                          book.status === 'Confirmed' ? 'var(--brand-primary)' : 
                          book.status === 'Completed' ? 'var(--color-success)' : 
                          'var(--color-warning)',
                      }}>
                        {book.status}
                      </span>
                    </div>

                    <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>{book.appliance}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{book.type}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>{book.time}</span>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserCheck size={14} style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{book.tech}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)' }}>{book.cost}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                  No active service tickets.
                </p>
              )}
            </div>
          </div>

          {/* Quick FAQ / Predict Advantage Card */}
          <div className="replicated-card" style={{
            background: 'var(--brand-primary-light)',
            borderColor: 'rgba(243, 112, 33, 0.15)',
            textAlign: 'left'
          }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-primary)' }}>
              <Cpu size={16} />
              The Predictive Advantage
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
              HOMIGO's core engineering evaluates electrical signature analysis and vibration telemetry. In the event of anomaly validation, parts are pre-allocated and technicians dispatched, preventing total hardware blackouts.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
              Downtime reduced by up to 92%
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
