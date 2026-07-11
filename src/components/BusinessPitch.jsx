import React from 'react';
import { Cpu, Award, Users, AlertTriangle, BookOpen, Clock, Heart, Shield, CheckCircle, HelpCircle, Activity } from 'lucide-react';

export default function BusinessPitch() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px 16px',
      color: 'var(--text-primary)',
      fontFamily: 'inherit',
      textAlign: 'left',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
      
      {/* Blog Header Card */}
      <div style={{
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--brand-primary)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          <BookOpen size={14} />
          <span>Homigo Smart Care Blog</span>
        </div>
        <h1 style={{
          fontSize: '1.95rem',
          fontWeight: 900,
          color: 'var(--text-primary)',
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          margin: '0 0 12px 0'
        }}>
          Rethinking Appliance Care: How Homigo Ends the Nightmare of Sudden Breakdowns
        </h1>
        <p style={{
          fontSize: '0.98rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          margin: '0 0 16px 0'
        }}>
          Traditional warranties are broken and emergency repairs are stressful. Discover how brand-agnostic coverage and predictive smart IoT technology keep your home running smoothly.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.62rem' }}>H</div>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>HOMIGO Editorial Team</span>
          </div>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            <span>4 Min Read</span>
          </div>
        </div>
      </div>

      {/* Intro USP Banner */}
      <div style={{
        background: 'var(--brand-primary-light)',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid var(--brand-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} style={{ color: 'var(--brand-primary)' }} />
          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>HOMIGO: Service On The Go</strong>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Washing machines overflowing, air conditioners blowing warm air during a heatwave, refrigerators failing on weekends—appliances are the silent engines of our daily life, and they only get noticed when they break. Homigo was built to replace stress with smart, seamless protection.
        </p>
      </div>

      {/* Section 1: The Gaps We Uncovered */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>The Gaps in Today's Appliance Care</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          We took a hard look at the home maintenance industry in India and discovered three massive frustrations that homeowners deal with daily:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '6px' }}>
          <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <h4 style={{ color: 'var(--color-danger)', fontSize: '0.88rem', fontWeight: 800, marginBottom: '6px' }}>1. The Multi-Brand Warranty Maze</h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, display: 'block' }}>
              Your AC is Daikin, your fridge is Samsung, your water purifier is Kent. Juggling separate customer service numbers, searching for paper receipts, and waiting days for manufacturer inspections is an administrative nightmare.
            </span>
          </div>
          <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <h4 style={{ color: 'var(--color-danger)', fontSize: '0.88rem', fontWeight: 800, marginBottom: '6px' }}>2. Stressful, Reactive Repair Cycles</h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, display: 'block' }}>
              Traditional repairs are reactive—meaning you only know an appliance has failed when it stops working entirely. This leaves you scrambling to find local technicians, paying emergency rates, and waiting days for parts.
            </span>
          </div>
          <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <h4 style={{ color: 'var(--color-danger)', fontSize: '0.88rem', fontWeight: 800, marginBottom: '6px' }}>3. The Local Technician Trust Gap</h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, display: 'block' }}>
              Hiring unverified local technicians is a gamble. Arbitrary pricing on spare parts, lack of diagnostic expertise, and no guarantees on the quality of work lead to repeat failures and wasted money.
            </span>
          </div>
        </div>
      </section>

      {/* Section 2: What We Offer */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <Shield size={18} style={{ color: 'var(--brand-primary)' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>What We Offer: The Homigo Shield</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Homigo simplifies household maintenance by consolidating appliance repair, preventive maintenance, and smart telemetry under a single roof:
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '6px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--brand-primary-light)', padding: '6px', borderRadius: '50%', color: 'var(--brand-primary)', flexShrink: 0 }}>
              <Award size={16} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Unified Brand-Agnostic AMC Protection</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', lineHeight: 1.4 }}>
                A single subscription plan that covers your Air Conditioners, Refrigerators, Washing Machines, RO Water Purifiers, Microwaves, TVs, and Laptops. No matter the brand, age, or where you bought them.
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--brand-primary-light)', padding: '6px', borderRadius: '50%', color: 'var(--brand-primary)', flexShrink: 0 }}>
              <Activity size={16} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Smart IoT-Driven Preventive Diagnostics</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', lineHeight: 1.4 }}>
                We provide plug-and-play smart sensors that monitor the health of your heavy-duty appliances (like ACs and Refrigerators) by measuring electrical anomalies, vibration levels, and temperature changes.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--brand-primary-light)', padding: '6px', borderRadius: '50%', color: 'var(--brand-primary)', flexShrink: 0 }}>
              <Users size={16} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Vetted, Background-Verified Experts</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', lineHeight: 1.4 }}>
                Say goodbye to random service personnel. All Homigo technicians undergo strict background checks, technical training, and customer service certification to ensure your home receives premium expertise.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The Homigo Edge */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>The Homigo Edge: Why Choose Us?</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Here is how Homigo compares to standard brand warranties and local repair options:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '8px', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={16} />
                Predictive vs. Reactive Care
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                Traditional warranties only help after an appliance has broken down. Homigo's IoT telemetry identifies failing components (like a worn compressor bearing or clogged filter) before a breakdown occurs, letting us service it proactively at your convenience.
              </p>
            </div>
            
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '8px', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={16} />
                One Subscription for Everything
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                Instead of managing 5 different maintenance contracts, Homigo covers your entire household appliances under a single subscription. Standard services, emergency repairs, and spare parts are all managed from one unified mobile app.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '8px', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} />
                100% Transparency & Fixed Rates
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                No more haggling with technicians over spare part costs. Homigo provides upfront fixed rate plans, transparent itemized invoicing, and fully guarantees the performance of both our labor and the components used.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '8px', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={16} />
                Hassle-Free Direct Scheduling
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                Forget receipt hunting or proof of purchase checks. Your subscription handles verification instantly. Booking a scheduled checkup or raising an emergency repair ticket takes only two taps in the app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <Activity size={18} style={{ color: 'var(--brand-primary)' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>How Homigo Works For Your Home</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Protecting your home with Homigo is simple and automatic:
        </p>
        
        {/* Customer Value Flow block */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '12px', padding: '20px', marginTop: '6px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ background: 'var(--brand-primary)', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>1</span>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.88rem' }}>Choose Your Coverage</strong>
                <span style={{ display: 'block', marginTop: '2px', fontSize: '0.8rem', lineHeight: 1.4 }}>Register your home appliances in the app and select your subscription duration (Annual or 3-Year Protection plans).</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ background: 'var(--brand-primary)', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>2</span>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.88rem' }}>Set Up Smart Telemetry Kit</strong>
                <span style={{ display: 'block', marginTop: '2px', fontSize: '0.8rem', lineHeight: 1.4 }}>For heavy appliances, connect the plug-and-play Homigo smart plugs. They begin safely monitoring energy draws and abnormal cycle patterns.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ background: 'var(--brand-primary)', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>3</span>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.88rem' }}>Automated Anomaly Alerting</strong>
                <span style={{ display: 'block', marginTop: '2px', fontSize: '0.8rem', lineHeight: 1.4 }}>If our algorithms detect an unusual voltage spike or heating cycle, the app sends you a warning and suggests a proactive inspection.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ background: 'var(--brand-primary)', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>4</span>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.88rem' }}>Instant Vetted Dispatch</strong>
                <span style={{ display: 'block', marginTop: '2px', fontSize: '0.8rem', lineHeight: 1.4 }}>With a single tap, confirm a repair schedule. Our service engineer arrives at your doorstep pre-equipped with the exact diagnostic data and replacement parts needed.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Our Expertise */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <Users size={18} style={{ color: 'var(--brand-primary)' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Our Servicing Expertise</h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          With years of experience managing complex hardware systems, we guarantee high-quality home care services:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '6px' }}>
          <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>👨‍🔧</span>
            <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>120+ Professionals</strong>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>Fully trained in diagnosing major global brands and configurations.</span>
          </div>
          <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>⚡</span>
            <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>30-Min Response</strong>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>Ultra-fast emergency booking response window to resolve critical failures.</span>
          </div>
          <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>🛡️</span>
            <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>100% Genuine Parts</strong>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>All replacement components are sourced directly from verified manufacturers.</span>
          </div>
        </div>
      </section>

      {/* Love/Trust Signoff Footer */}
      <div style={{
        textAlign: 'center',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}>
        <span>HOMIGO Care Team</span>
        <span>•</span>
        <span>Dedicated to hassle-free appliance life</span>
        <Heart size={10} style={{ color: 'var(--color-danger)', fill: 'var(--color-danger)' }} />
      </div>

    </div>
  );
}
