import { useState, useEffect } from 'react';
// Custom hook for scroll reveals using IntersectionObserver
const useScrollReveal = () => {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    };

    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = document.querySelectorAll('.reveal-hidden');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

import { Link } from 'react-router-dom';

const Landing = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [calcState, setCalcState] = useState('idle');
  const [score, setScore] = useState(0);

  useScrollReveal();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setTimeout(() => setScore(100), 0);
      return;
    }

    let start = 0;
    const end = 100;
    const duration = 1500;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setScore(100);
        clearInterval(timer);
      } else {
        setScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, []);

  const handleCalc = (e) => {
    e.preventDefault();
    setCalcState('loading');
    setTimeout(() => {
      setCalcState('done');
      setTimeout(() => setCalcState('idle'), 2000);
    }, 800);
  };

  return (
    <div className="bg-surface-canvas text-text-primary font-body-md text-body-md antialiased min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-card/90 backdrop-blur-md border-b border-surface-border">
        <div className="h-16 max-w-container-max mx-auto px-gutter-desktop flex items-center justify-between gap-space-md">
          {/* Logo & Brand */}
          <div className="flex items-center gap-space-sm group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <img 
              alt="UdyogSanchar Logo" 
              className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
              src="/udyog-sanchar-icon.png"
            />
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">UdyogSanchar</span>
              <span className="hidden sm:inline-block px-space-xs py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps">PROTOTYPE</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-space-lg">
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-1.5 rounded-md transition-all duration-200" to="/">Solutions</Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-1.5 rounded-md transition-all duration-200" to="/hub">Regulatory Schemes</Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-1.5 rounded-md transition-all duration-200" to="/dashboard">Industry Hub</Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-1.5 rounded-md transition-all duration-200" to="/inspections">Inspection Tracker</Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-1.5 rounded-md transition-all duration-200" to="/admin/knowledge">Knowledge Base</Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-space-md">
            <Link className="font-label-md text-label-md text-primary hover:bg-surface-container-low px-4 py-2 rounded-lg transition-all duration-200" to="/admin/dashboard">Admin Portal</Link>
            <div className="w-px h-6 bg-surface-border"></div>
            <Link className="font-label-md text-label-md text-text-secondary hover:text-primary transition-colors" to="/login">Log In</Link>
            <Link className="inline-flex items-center px-6 py-2.5 rounded-lg bg-primary font-label-md text-label-md text-on-primary hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-200 focus-ring-purple" to="/register">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-text-secondary hover:text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-surface-card pt-16 flex flex-col border-b border-surface-border shadow-2xl lg:hidden animate-fade-in-up">
          <nav className="flex flex-col p-gutter-desktop gap-space-lg">
            <Link className="font-headline-sm text-headline-sm text-text-primary" to="/" onClick={() => setIsMobileMenuOpen(false)}>Solutions</Link>
            <Link className="font-headline-sm text-headline-sm text-text-primary" to="/hub" onClick={() => setIsMobileMenuOpen(false)}>Regulatory Schemes</Link>
            <Link className="font-headline-sm text-headline-sm text-text-primary" to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Industry Hub</Link>
            <Link className="font-headline-sm text-headline-sm text-text-primary" to="/inspections" onClick={() => setIsMobileMenuOpen(false)}>Inspection Tracker</Link>
            <Link className="font-headline-sm text-headline-sm text-text-primary" to="/admin/knowledge" onClick={() => setIsMobileMenuOpen(false)}>Knowledge Base</Link>
            <div className="h-px w-full bg-surface-border my-space-sm"></div>
            <Link className="font-headline-sm text-headline-sm text-primary" to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Admin Portal</Link>
            <Link className="font-headline-sm text-headline-sm text-text-secondary" to="/login" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
            <Link className="w-full text-center px-space-lg py-3 rounded-lg bg-primary font-label-lg text-label-lg text-on-primary shadow-sm" to="/register" onClick={() => setIsMobileMenuOpen(false)}>
              Get Started
            </Link>
          </nav>
        </div>
      )}

      <main className="w-full pt-16 flex-1 flex flex-col">
        {/* INSTITUTIONAL BANNER */}
        <section className="w-full bg-surface-container-high py-2 px-gutter-desktop border-b border-surface-border">
          <div className="max-w-container-max mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-sm text-center sm:text-left opacity-0 animate-fade-in-up">
            <div className="flex items-center gap-space-sm text-text-secondary">
              <span className="material-symbols-outlined text-[16px] text-primary">assured_workload</span>
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary">
                Smart India Hackathon 2026 • Industrial Compliance Platform
              </span>
            </div>
            <span className="font-label-caps text-label-caps bg-secondary-container text-on-secondary-container px-space-sm py-0.5 rounded font-bold tracking-widest">
              PROTOTYPE DEMONSTRATION
            </span>
          </div>
        </section>

        {/* HERO SECTION */}
        <section className="w-full relative overflow-hidden py-16 lg:py-24 px-gutter-desktop bg-gradient-to-b from-surface-canvas to-surface-container-lowest">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
          
          <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
            {/* Left: Copy & CTAs */}
            <div className="flex flex-col items-start gap-space-xl">
              <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed shadow-sm border border-primary/10 opacity-0 animate-fade-in-up delay-100">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span className="font-label-caps text-label-caps tracking-widest uppercase font-bold">
                  Unified Prototype Workspace
                </span>
              </div>
              
              <div className="flex flex-col gap-space-md opacity-0 animate-fade-in-up delay-200">
                <h1 className="font-display-lg text-display-lg text-text-primary tracking-tight leading-tight">
                  Faster Approvals.<br />
                  <span className="text-primary relative whitespace-nowrap">
                    Smarter Compliance.
                    <span className="absolute bottom-1 left-0 w-full h-3 bg-primary-fixed -z-10 rounded-sm"></span>
                  </span><br />
                  One Regulatory Workspace.
                </h1>
                <p className="font-body-lg text-body-lg text-text-secondary max-w-lg leading-relaxed">
                  Discover required approvals, track regulatory workflows, and match your industrial profile to state schemes—all assisted by intelligent compliance validation designed for the Smart India Hackathon.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md w-full sm:w-auto opacity-0 animate-fade-in-up delay-300">
                <Link className="inline-flex items-center justify-center gap-space-xs px-8 py-3.5 rounded-[10px] bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-hover shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 group focus-ring-purple" to="/register">
                  <span>Create Industry Profile</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
                <Link className="inline-flex items-center justify-center gap-space-xs px-8 py-3.5 rounded-[10px] bg-surface-card text-primary font-label-lg text-label-lg border border-surface-border shadow-sm hover:bg-surface-container-low hover:-translate-y-0.5 active:scale-95 transition-all duration-300 focus-ring-purple" to="/login">
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  <span>Officer Login</span>
                </Link>
              </div>

              <div className="flex items-center gap-space-sm pt-space-sm text-text-secondary opacity-0 animate-fade-in-up delay-400">
                <span className="material-symbols-outlined text-[18px] text-status-success">check_circle</span>
                <span className="font-body-sm text-body-sm">Supporting Dummy Data for MH, PB, & UP</span>
              </div>
            </div>
            
            {/* Right: Simplified Dashboard Preview */}
            <div className="relative w-full max-w-xl mx-auto lg:ml-auto opacity-0 animate-fade-scale-in delay-500">
              <div className="bg-surface-card rounded-xl shadow-2xl border border-surface-border overflow-hidden transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(15,23,42,0.15)] group">
                {/* Mock Browser Header */}
                <div className="bg-surface-container-low px-4 py-3 flex items-center justify-between border-b border-surface-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-status-danger"></div>
                    <div className="w-3 h-3 rounded-full bg-status-warning"></div>
                    <div className="w-3 h-3 rounded-full bg-status-success"></div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse-subtle"></span>
                    <span className="font-label-caps text-label-caps text-status-success uppercase font-bold tracking-wider">LIVE SYNC</span>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-6 flex flex-col gap-6">
                  {/* Header Row */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-text-primary">Demo Steel Works</h3>
                      <p className="font-body-sm text-body-sm text-text-secondary mt-1">Ludhiana, Punjab • Heavy Engineering</p>
                    </div>
                    <span className="px-3 py-1 rounded bg-status-success-bg text-status-success font-label-caps text-label-caps font-bold">VERIFIED</span>
                  </div>
                  
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-canvas border border-surface-border rounded-lg p-4 transition-colors duration-300 hover:border-primary/30">
                      <span className="font-label-caps text-label-caps text-text-muted block mb-1">COMPLIANCE SCORE</span>
                      <span className="font-headline-lg text-headline-lg text-primary font-bold">{score}%</span>
                    </div>
                    <div className="bg-surface-canvas border border-surface-border rounded-lg p-4">
                      <span className="font-label-caps text-label-caps text-text-muted block mb-1">ACTIVE CLEARANCES</span>
                      <span className="font-headline-lg text-headline-lg text-text-primary font-bold">3 Approved</span>
                    </div>
                  </div>
                  
                  {/* Mini Tracker */}
                  <div className="flex flex-col gap-3">
                    <span className="font-label-caps text-label-caps text-text-secondary border-b border-surface-border pb-2">RECENT WORKFLOWS</span>
                    <div className="flex justify-between items-center bg-surface-canvas p-3 rounded-lg border border-surface-border">
                      <span className="font-label-md text-label-md text-text-primary">Boiler Operation Cert</span>
                      <span className="font-label-caps text-label-caps text-primary-hover bg-primary-fixed px-2 py-1 rounded">INSPECTION</span>
                    </div>
                    <div className="flex justify-between items-center bg-surface-canvas p-3 rounded-lg border border-surface-border">
                      <span className="font-label-md text-label-md text-text-primary">Consent to Establish</span>
                      <span className="font-label-caps text-label-caps text-status-success bg-status-success-bg px-2 py-1 rounded">CLEARED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS SECTION */}
        <section className="reveal-hidden w-full bg-primary text-on-primary py-12 px-gutter-desktop">
          <div className="max-w-container-max mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-primary-hover">
            <div className="flex flex-col items-center text-center p-4 transition-transform duration-300 hover:-translate-y-1">
              <span className="font-metric-val text-metric-val font-bold text-secondary-fixed">3</span>
              <span className="font-headline-sm text-headline-sm font-semibold mt-2">Demo States</span>
              <span className="font-body-sm text-body-sm text-primary-fixed mt-1 opacity-90">Simulated regulatory logic</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 transition-transform duration-300 hover:-translate-y-1">
              <span className="font-metric-val text-metric-val font-bold text-secondary-fixed">50+</span>
              <span className="font-headline-sm text-headline-sm font-semibold mt-2">Demo Units</span>
              <span className="font-body-sm text-body-sm text-primary-fixed mt-1 opacity-90">Seed profiles across sectors</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 transition-transform duration-300 hover:-translate-y-1">
              <span className="font-metric-val text-metric-val font-bold text-secondary-fixed">Rule+AI</span>
              <span className="font-headline-sm text-headline-sm font-semibold mt-2">Assisted Workflow</span>
              <span className="font-body-sm text-body-sm text-primary-fixed mt-1 opacity-90">Deterministic checks + RAG</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 transition-transform duration-300 hover:-translate-y-1">
              <span className="font-metric-val text-metric-val font-bold text-secondary-fixed">Tracked</span>
              <span className="font-headline-sm text-headline-sm font-semibold mt-2">Clearance Audits</span>
              <span className="font-body-sm text-body-sm text-primary-fixed mt-1 opacity-90">End-to-end transparent logging</span>
            </div>
          </div>
        </section>

        {/* CAPABILITIES SECTION */}
        <section className="w-full py-20 px-gutter-desktop bg-surface-canvas">
          <div className="max-w-container-max mx-auto flex flex-col gap-12">
            <div className="reveal-hidden flex flex-col items-center text-center max-w-2xl mx-auto gap-4">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">CORE CAPABILITIES</span>
              <h2 className="font-headline-lg text-headline-lg text-text-primary">Institutional Workflows Re-Engineered</h2>
              <p className="font-body-md text-body-md text-text-secondary">UdyogSanchar maps regulatory requirements, tracks applications, and leverages AI to simplify complex compliance guidelines.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-surface-card p-8 rounded-[12px] shadow-sm border border-surface-border hover:shadow-lg hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300 reveal-hidden group">
                <div className="w-12 h-12 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-on-primary-fixed flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[28px]">account_tree</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-text-primary mb-3">Approval Discovery</h3>
                <p className="font-body-sm text-body-sm text-text-secondary mb-6">Dynamically map your factory profile to state-specific statutory requirements including Boiler, Factory, and Pollution rules.</p>
                <div className="flex items-center gap-2 text-body-sm text-text-primary">
                  <span className="material-symbols-outlined text-[16px] text-primary">check</span> Dynamic Roadmap
                </div>
              </div>

              <div className="bg-surface-card p-8 rounded-[12px] shadow-sm border border-surface-border hover:shadow-lg hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300 reveal-hidden group">
                <div className="w-12 h-12 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-on-secondary-container flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[28px]">pending_actions</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-text-primary mb-3">Application Tracking</h3>
                <p className="font-body-sm text-body-sm text-text-secondary mb-6">Centralized queue for industrialists to track submissions and for designated officers to schedule inspections and approvals.</p>
                <div className="flex items-center gap-2 text-body-sm text-text-primary">
                  <span className="material-symbols-outlined text-[16px] text-primary">check</span> Officer Queues
                </div>
              </div>

              <div className="bg-surface-card p-8 rounded-[12px] shadow-sm border border-surface-border hover:shadow-lg hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300 reveal-hidden group">
                <div className="w-12 h-12 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-status-info flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[28px]">payments</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-text-primary mb-3">Scheme Intelligence</h3>
                <p className="font-body-sm text-body-sm text-text-secondary mb-6">Automatic filtering of central and state industrial subsidies, matching sector and investment parameters instantly.</p>
                <div className="flex items-center gap-2 text-body-sm text-text-primary">
                  <span className="material-symbols-outlined text-[16px] text-primary">check</span> Eligibility Matching
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* APPLICATION QUEUE PREVIEW */}
        <section className="w-full py-20 px-gutter-desktop bg-surface-container-low border-y border-surface-border">
          <div className="reveal-hidden max-w-container-max mx-auto flex flex-col gap-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="font-label-caps text-label-caps text-primary uppercase font-bold">PLATFORM PREVIEW</span>
                <h2 className="font-headline-lg text-headline-lg text-text-primary mt-2">Demo Application Queue</h2>
                <p className="font-body-md text-body-md text-text-secondary mt-1">A unified view of active clearance workflows and officer review statuses.</p>
              </div>
            </div>

            <div className="w-full bg-surface-card rounded-xl shadow-sm overflow-x-auto border border-surface-border">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-canvas border-b border-surface-border font-label-caps text-label-caps text-text-muted uppercase">
                    <th className="py-4 px-6">Industry Unit</th>
                    <th className="py-4 px-6">Approval Type</th>
                    <th className="py-4 px-6">Submitted</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-body-md font-body-md text-text-primary">
                  <tr className="hover:bg-surface-container-low transition-colors duration-200">
                    <td className="py-4 px-6 font-semibold">Pharma Works Pune</td>
                    <td className="py-4 px-6 text-text-secondary">Drug Manufacturing Compliance • MH</td>
                    <td className="py-4 px-6 text-text-muted">Today, 09:20 AM</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps font-semibold">
                        INSPECTION
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors duration-200">
                    <td className="py-4 px-6 font-semibold">Automobile Components Noida</td>
                    <td className="py-4 px-6 text-text-secondary">Factory Registration • UP</td>
                    <td className="py-4 px-6 text-text-muted">Yesterday</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded bg-status-warning-bg text-status-warning font-label-caps text-label-caps font-semibold">
                        UNDER REVIEW
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors duration-200">
                    <td className="py-4 px-6 font-semibold">Textile Works Ludhiana</td>
                    <td className="py-4 px-6 text-text-secondary">Boiler Operation Cert • PB</td>
                    <td className="py-4 px-6 text-text-muted">Oct 2, 2025</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded bg-status-success-bg text-status-success font-label-caps text-label-caps font-semibold">
                        APPROVED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CALCULATOR PREVIEW */}
        <section className="w-full py-20 px-gutter-desktop bg-surface-canvas">
          <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-hidden flex flex-col gap-6">
              <span className="font-label-caps text-label-caps uppercase text-primary font-bold">INTERACTIVE PREVIEW</span>
              <h2 className="font-headline-lg text-headline-lg text-text-primary">Compliance Roadmap Generation</h2>
              <p className="font-body-md text-body-md text-text-secondary">
                See how UdyogSanchar maps operational parameters to potential statutory obligations. 
                This preview demonstrates the core logic used in the actual platform profiling engine.
              </p>
              
              <div className={`bg-surface-card p-6 rounded-xl border border-surface-border mt-4 flex flex-col gap-4 shadow-sm transition-all duration-500 ${calcState === "done" ? "opacity-100 translate-y-0" : "opacity-80 translate-y-2"}`}>
                <div className="flex items-center justify-between border-l-4 border-primary pl-4">
                  <div>
                    <h4 className="font-label-lg text-label-lg text-text-primary">The Factories Act, 1948</h4>
                    <span className="font-body-sm text-body-sm text-text-secondary">Triggered by worker count &gt; 20</span>
                  </div>
                  <span className="font-label-caps text-label-caps px-2 py-1 bg-primary-fixed text-primary rounded">MANDATORY</span>
                </div>
                <div className="h-px w-full bg-surface-border"></div>
                <div className="flex items-center justify-between border-l-4 border-status-warning pl-4">
                  <div>
                    <h4 className="font-label-lg text-label-lg text-text-primary">Boiler Operation Certificate</h4>
                    <span className="font-body-sm text-body-sm text-text-secondary">Triggered by steam generation equipment</span>
                  </div>
                  <span className="font-label-caps text-label-caps px-2 py-1 bg-status-warning-bg text-status-warning rounded">REVIEW</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-card p-8 rounded-xl shadow-lg border border-surface-border flex flex-col gap-6 reveal-hidden delay-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">calculate</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-text-primary">Demo Calculator</h3>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-text-secondary font-bold">Industrial Sector</label>
                <select className="w-full p-3 rounded-lg bg-surface-canvas border border-surface-border text-body-md outline-none focus:border-primary">
                  <option>Textile Processing</option>
                  <option>Chemical Manufacturing</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-text-secondary font-bold">Worker Capacity</label>
                <input type="number" placeholder="e.g. 50" defaultValue="120" className="w-full p-3 rounded-lg bg-surface-canvas border border-surface-border text-body-md outline-none focus:border-primary" />
              </div>

              <button 
                onClick={handleCalc}
                className="w-full py-3.5 mt-2 rounded-[10px] bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 focus-ring-purple"
              >
                {calcState === 'loading' && <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>}
                {calcState === 'done' && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                {calcState === 'idle' && <span className="material-symbols-outlined text-[18px]">verified</span>}
                
                {calcState === 'loading' ? 'Validating...' : calcState === 'done' ? 'Roadmap Updated' : 'Compute Demo Requirements'}
              </button>
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="w-full py-20 px-gutter-desktop bg-surface-container-high border-y border-surface-border">
          <div className="max-w-container-max mx-auto flex flex-col gap-16">
            <div className="reveal-hidden text-center max-w-2xl mx-auto">
              <h2 className="font-headline-lg text-headline-lg text-text-primary">How Industrial Units Get Cleared</h2>
              <p className="font-body-md text-body-md text-text-secondary mt-4">A structured, four-step digital workflow utilized in our SIH prototype.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {['Profile Creation', 'Rule Pre-Validation', 'Officer Review', 'Status & Compliance'].map((step, idx) => (
                <div key={idx} className="bg-surface-card p-8 rounded-[12px] shadow-sm border border-surface-border flex flex-col gap-4 relative hover:-translate-y-1.5 hover:shadow-md hover:border-primary/20 transition-all duration-300 reveal-hidden group">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
                    0{idx + 1}
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors">{step}</h4>
                  <p className="font-body-sm text-body-sm text-text-secondary">
                    {idx === 0 && 'Submit unit details, machinery specifications, and location data securely.'}
                    {idx === 1 && 'Algorithmic checks match profile parameters against required statutory approvals.'}
                    {idx === 2 && 'Designated state officers evaluate documents and schedule any necessary inspections.'}
                    {idx === 3 && 'Track application outcomes, receive clearance status, and monitor compliance tasks.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PORTAL DIRECTORY */}
        <section className="w-full py-20 px-gutter-desktop bg-surface-canvas">
          <div className="max-w-container-max mx-auto flex flex-col gap-12">
            <div className="reveal-hidden text-center">
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-widest">SYSTEM TOPOLOGY</span>
              <h2 className="font-headline-lg text-headline-lg text-text-primary mt-2">Unified Portal Matrix</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link to="/dashboard" className="bg-surface-card p-8 rounded-[12px] shadow-sm border border-surface-border hover:border-primary/30 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-4 group reveal-hidden">
                <span className="material-symbols-outlined text-primary text-[32px]">factory</span>
                <h3 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors">Industry Workspace</h3>
                <p className="font-body-md text-body-md text-text-secondary">Dashboards for industrial users to manage profiles, track clearances, and view recommended schemes.</p>
              </Link>
              <Link to="/admin/dashboard" className="bg-surface-card p-8 rounded-[12px] shadow-sm border border-surface-border hover:border-primary/30 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-4 group reveal-hidden">
                <span className="material-symbols-outlined text-primary text-[32px]">shield_person</span>
                <h3 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors">Admin Console</h3>
                <p className="font-body-md text-body-md text-text-secondary">Dedicated interfaces for officers to manage regulatory rules, review applications, and audit workflows.</p>
              </Link>
              <Link to="/admin/knowledge" className="bg-surface-card p-8 rounded-[12px] shadow-sm border border-surface-border hover:border-primary/30 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-4 group reveal-hidden">
                <span className="material-symbols-outlined text-primary text-[32px]">menu_book</span>
                <h3 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors">Knowledge & AI</h3>
                <p className="font-body-md text-body-md text-text-secondary">Query regulatory chunks using our RAG-enabled AI assistant to resolve complex compliance ambiguities.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="w-full py-20 px-gutter-desktop bg-surface-container-low border-t border-surface-border">
          <div className="reveal-hidden max-w-container-max mx-auto flex flex-col items-center text-center gap-6 max-w-3xl">
            <h2 className="font-headline-lg text-headline-lg text-text-primary">Built for SIH Compliance Workflows</h2>
            <p className="font-body-lg text-body-lg text-text-secondary">
              UdyogSanchar demonstrates how deterministic rules, state-aware tracking, and AI-assisted guidance can modernize the industrial clearance lifecycle.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="w-full bg-primary-container text-on-primary py-24 px-gutter-desktop relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-hover opacity-90 transition-opacity duration-1000 hover:opacity-100"></div>
          <div className="reveal-hidden max-w-container-max mx-auto flex flex-col items-center text-center gap-8">
            <h2 className="font-display-lg text-display-lg font-bold text-on-primary max-w-2xl">
              Make Industrial Compliance Easier to Navigate.
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link className="w-full sm:w-auto px-8 py-4 rounded-[10px] bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg font-bold hover:bg-secondary hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg focus-ring-purple" to="/register">
                Create Industry Profile
              </Link>
              <Link className="w-full sm:w-auto px-8 py-4 rounded-[10px] bg-surface-card text-primary font-label-lg text-label-lg font-bold hover:bg-surface-container-low hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-md focus-ring-purple" to="/login">
                Access Existing Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface-card border-t border-surface-border">
        <div className="max-w-container-max mx-auto px-gutter-desktop py-12">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            <div className="flex flex-col items-center md:items-start gap-4 max-w-sm text-center md:text-left">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">UdyogSanchar</span>
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary">
                A prototype single-window digital clearance mechanism for the Smart India Hackathon.
              </p>
            </div>
            
            <div className="flex gap-16 text-center md:text-left">
              <div className="flex flex-col gap-3">
                <span className="font-label-caps text-label-caps text-text-muted uppercase">Platform</span>
                <Link className="font-body-sm text-body-sm text-text-secondary hover:text-primary" to="/login">Officer Login</Link>
                <Link className="font-body-sm text-body-sm text-text-secondary hover:text-primary" to="/register">Register Industry</Link>
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-label-caps text-label-caps text-text-muted uppercase">Demo States</span>
                <span className="font-body-sm text-body-sm text-text-secondary">Maharashtra</span>
                <span className="font-body-sm text-body-sm text-text-secondary">Punjab</span>
                <span className="font-body-sm text-body-sm text-text-secondary">Uttar Pradesh</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-surface-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body-sm text-body-sm text-text-muted">
              © 2026 UdyogSanchar. Prototype Developed for Smart India Hackathon.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
