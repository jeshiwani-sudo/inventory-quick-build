import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

// ── Scroll reveal hook ──
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible'); },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
};

const RevealSection = ({ children, style }) => {
  const ref = useReveal();
  return <div ref={ref} className="lp-reveal" style={style}>{children}</div>;
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: '📦', title: 'Real-Time Stock Tracking', desc: 'Log received quantities, spoilage, and in-stock levels for every product across all branches — instantly updated.' },
    { icon: '🏪', title: 'Multi-Store Management', desc: 'Run multiple branches from one merchant dashboard. Compare performance and view consolidated reports.' },
    { icon: '🔐', title: 'Secure Invite System', desc: 'Onboard staff via secure email invite tokens with 24-hour expiry. No unauthorized access ever.' },
    { icon: '🚚', title: 'Supply Request Workflow', desc: 'Clerks request supplies in seconds. Admins approve or decline with a note — all tracked in real time.' },
    { icon: '📊', title: 'Visual Reports & Charts', desc: 'Bar and line charts surface stock trends, payment summaries and per-store comparisons at a glance.' },
    { icon: '💳', title: 'Payment Status Tracking', desc: 'Mark inventory entries as paid or unpaid. Track outstanding amounts per store with instant totals.' },
  ];

  const roles = [
    {
      emoji: '👑', role: 'Merchant', color: '#A78BFA',
      glow: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)',
      perks: ['Full visibility across all stores', 'Invite and manage admins', 'View consolidated reports', 'Create and delete stores & products'],
    },
    {
      emoji: '👔', role: 'Admin', color: '#38BDF8',
      glow: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.2)',
      perks: ['Manage products per store', 'Approve or decline supply requests', 'Update payment status', 'Invite and manage clerks'],
    },
    {
      emoji: '📝', role: 'Clerk', color: '#34D399',
      glow: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)',
      perks: ['Record daily inventory entries', 'Submit supply requests', 'View personal entry history', 'Track stock and spoilage'],
    },
  ];

  const stats = [
    { value: '3',    label: 'User Roles' },
    { value: '∞',    label: 'Store Branches' },
    { value: 'JWT',  label: 'Secure Auth' },
    { value: 'Live', label: 'Real-Time Data' },
  ];

  const techStack = ['Flask', 'React', 'PostgreSQL', 'JWT Auth', 'Redux', 'Tailwind CSS', 'Cloudinary', 'GitHub Actions'];

  return (
    <div className="lp-page">

      {/* ══ NAVBAR ══ */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-icon">📦</div>
            <span className="lp-logo-text">LocalShop</span>
          </div>
          <div className="lp-nav-links">
            {['Features', 'Roles', 'About'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="lp-nav-link">{l}</a>
            ))}
            
            <button className="lp-btn-secondary" onClick={() => navigate('/register')}>
              Register
            </button>
            <button className="lp-btn-primary" onClick={() => navigate('/login')}>
              Sign In →
            </button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className="lp-mobile-menu-btn"
            style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 24, cursor: 'pointer' }}
          >
            ☰
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lp-mobile-menu">
            {['Features', 'Roles', 'About'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>{l}</a>
            ))}
            <button className="lp-mobile-btn" onClick={() => navigate('/register')}>Register</button>
            <button className="lp-mobile-btn" onClick={() => navigate('/login')}>Sign In →</button>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section className="lp-hero">
        <div className="lp-grid-bg" />
        <div className="lp-hero-orb-left" />
        <div className="lp-hero-orb-right" />

        <div className="lp-hero-badge lp-badge">
          <span className="lp-badge-dot" />
          Inventory Management · Built for Real Business
        </div>

        <h1 className="lp-hero-title lp-hero-heading">
          Control Every Store.<br />
          <span className="accent">From One Dashboard.</span>
        </h1>

        <p className="lp-hero-sub lp-hero-paragraph">
          LocalShop gives merchants, admins and clerks a unified platform to track inventory,
          manage supply chains and make smarter decisions — in real time.
        </p>

        <div className="lp-hero-btns lp-hero-buttons">
          {/* UPDATED BUTTONS FROM UPDATE FILE */}
          <button className="lp-btn-primary hero" onClick={() => navigate('/register')}>
            Register as Merchant
          </button>
          <button className="lp-btn-secondary" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <a href="#features" className="lp-btn-secondary">
            Explore Features ↓
          </a>
        </div>

        <div className="lp-hero-stats lp-stats-row">
          {stats.map((s, i) => (
            <div key={i} className="lp-stat-card">
              <span className="lp-stat-value">{s.value}</span>
              <span className="lp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="lp-section">
        <div className="lp-section-inner">
          <RevealSection style={{ textAlign: 'center', marginBottom: 64 }}>
            <p className="lp-eyebrow">What We Offer</p>
            <h2 className="lp-section-title">
              Everything your team needs.<br />
              <span className="muted">Nothing they don't.</span>
            </h2>
          </RevealSection>

          <div className="lp-features-grid">
            {features.map((f, i) => (
              <RevealSection key={i} style={{ transitionDelay: `${i * 0.07}s` }}>
                <div className="lp-feature-card">
                  <span className="lp-feature-icon">{f.icon}</span>
                  <h3 className="lp-feature-title">{f.title}</h3>
                  <p className="lp-feature-desc">{f.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ROLES ══ */}
      <section id="roles" className="lp-section-alt">
        <div className="lp-section-inner">
          <RevealSection style={{ textAlign: 'center', marginBottom: 64 }}>
            <p className="lp-eyebrow">Built For Your Team</p>
            <h2 className="lp-section-title">One platform. Three powerful roles.</h2>
          </RevealSection>

          <div className="lp-roles-grid">
            {roles.map((r, i) => (
              <RevealSection key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div
                  className="lp-role-card"
                  style={{ background: r.glow, border: `1px solid ${r.border}` }}
                >
                  <span className="lp-role-emoji">{r.emoji}</span>
                  <h3 className="lp-role-title" style={{ color: r.color }}>{r.role}</h3>
                  <ul className="lp-role-list">
                    {r.perks.map((p, j) => (
                      <li key={j} className="lp-role-item">
                        <span className="lp-role-check" style={{ color: r.color }}>✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section id="about" className="lp-section">
        <div className="lp-section-inner narrow">
          <RevealSection>
            <p className="lp-eyebrow">About</p>
            <h2 className="lp-section-title">Built for growing retail businesses</h2>
            <p className="lp-about-text">
              LocalShop was designed to solve the real operational challenges that small and medium
              retail businesses face when managing inventory across multiple store branches. From recording
              daily stock to approving supply requests, every workflow is built to be fast, simple and reliable.
            </p>
            <p className="lp-about-text">
              Powered by Flask, React and PostgreSQL — with JWT authentication, role-based access
              control, Cloudinary image uploads and a clean dashboard experience for every member of your team.
            </p>
            <div className="lp-tech-pills">
              {techStack.map(t => (
                <span key={t} className="lp-tech-pill">{t}</span>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="lp-section-cta">
        <RevealSection>
          <div className="lp-cta-inner">
            <h2 className="lp-cta-title">
              Ready to take control<br />of your inventory?
            </h2>
            <p className="lp-cta-sub">
              Sign in and start managing your stores in minutes. No setup required.
            </p>
            <button className="lp-cta-btn" onClick={() => navigate('/login')}>
              Sign In to Your Dashboard →
            </button>
          </div>
        </RevealSection>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-logo">
            <div className="lp-logo-icon" style={{ width: 30, height: 30, fontSize: 15, borderRadius: 8 }}>📦</div>
            <span className="lp-logo-text" style={{ color: '#334155' }}>LocalShop</span>
          </div>
          <p className="lp-footer-text">© 2026 LocalShop · Phase 5 Capstone Project</p>
          <div className="lp-footer-links">
            <span className="lp-footer-link" onClick={() => navigate('/login')}>Sign In</span>
            <a href="#features" className="lp-footer-link">Features</a>
            <a href="#about" className="lp-footer-link">About</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;