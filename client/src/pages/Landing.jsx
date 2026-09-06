import { Link } from 'react-router-dom';

const Landing = () => {

  const handleCalc = (e) => {
    e.preventDefault();
    const btn = document.getElementById('calcTriggerBtn');
    if (btn) {
      btn.innerHTML = '<span className="material-symbols-outlined text-[18px] animate-spin">sync</span> Validating Rules...';
      setTimeout(() => {
        btn.innerHTML = '<span className="material-symbols-outlined text-[18px]">check_circle</span> Checklist Updated';
        setTimeout(() => {
          btn.innerHTML = '<span className="material-symbols-outlined text-[18px]">verified</span> Compute Statutory Checklist';
        }, 1800);
      }, 600);
    }
  };

  return (
    <div className="bg-surface-canvas text-text-primary font-body-md text-body-md antialiased min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-card/90 backdrop-blur-md shadow-[0_1px_8px_rgba(15,23,42,0.06)]"><div className="h-20 max-w-container-max mx-auto px-gutter-desktop flex items-center justify-between gap-space-md"><div className="flex items-center gap-space-md"><div className="flex items-center gap-space-sm"><img alt="UdyogSanchar Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSqW1tNFVmZJ0N_DUlPZVV7OT16FQoivX9tEGqLahNw7HXuMNVpX5O3UhjdeX41E1W35ax3Mgat2Naf0Z6aTlBpDz9ZNgEfmIrnB6HiOUAeTo0TGyZo4QFYOxYzWpGgmNV8oyCSSScawTK-AU_j_0KUMqJgaXrt8pa6I2LxtUCllnZe72HFCYvh_W6wZDw7pdtx2R1AYGglicw0V08f-zKlR3Drm_lY54-fLVUmj16tevs4sGLghcC"/><div className="flex flex-col"><div className="flex items-center gap-space-xs"><span className="font-headline-sm text-headline-sm text-primary tracking-tight">UdyogSanchar</span><span className="px-space-xs py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps">GOV PORTAL</span></div><span className="font-body-sm text-body-sm text-text-secondary hidden sm:inline-block">National Industrial Statutory Clearance Network</span></div></div><div className="hidden xl:flex items-center pl-space-md border-l border-surface-border"><span className="px-space-sm py-1 rounded bg-surface-container font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">SIH Industrial Initiative | Prototype Demo</span></div></div><nav className="hidden lg:flex items-center gap-space-xs" data-active-classes="bg-primary-container text-on-primary font-label-lg rounded-lg"><Link aria-current="page" className="px-space-md py-2 transition-colors bg-primary-container text-on-primary font-label-lg rounded-lg" data-path="solutions" to="/">Solutions</Link><Link className="px-space-md py-2 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="regulatory-schemes" to="/hub">Regulatory Schemes</Link><Link className="px-space-md py-2 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="industry-hub" to="/dashboard">Industry Hub</Link><Link className="px-space-md py-2 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="inspection-tracker" to="/inspections">Inspection Tracker</Link><Link className="px-space-md py-2 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="knowledge-base" to="/admin/knowledge">Knowledge Base</Link></nav><div className="flex items-center gap-space-sm"><Link className="hidden md:inline-flex items-center px-space-md py-2 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-low transition-colors" data-path="admin-portal" to="/admin/dashboard">Admin Portal</Link><Link className="hidden sm:inline-flex items-center px-space-md py-2 rounded-lg font-label-md text-label-md text-text-secondary hover:bg-surface-container-low hover:text-on-surface transition-colors" data-path="login" to="/login">Log In</Link><Link className="inline-flex items-center px-space-lg py-2.5 rounded-lg bg-primary font-label-md text-label-md text-on-primary hover:bg-primary-hover shadow-[0_1px_3px_0_rgba(15,23,42,0.08)] transition-colors" data-path="registration" to="/register">Get Started / Register</Link><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-xs"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header><main className="w-full pt-20 bg-surface-canvas"><div className="flex flex-col w-full">
{/*  Top Sovereign Institutional Banner  */}
<section className="w-full bg-surface-container-high py-space-xs px-gutter-desktop border-b border-surface-border">
<div className="max-w-container-max mx-auto flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm text-text-secondary">
<span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary">
<span className="material-symbols-outlined text-[14px]">assured_workload</span>
</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary">
          Government of India • Ministry of Commerce &amp; Industry • Industrial Safety &amp; DISH Network
        </span>
</div>
<div className="flex items-center gap-space-md">
<span className="font-label-caps text-label-caps bg-secondary-container text-on-secondary-container px-space-xs py-0.5 rounded font-semibold">
          PROTOTYPE PORTAL • DEMO ENVIRONMENT
        </span>
<span className="font-label-caps text-label-caps text-text-secondary hidden md:inline-flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-status-success inline-block"></span> 3 Demo States Active
        </span>
</div>
</div>
</section>
{/*  Hero Section with Dual Pane & Live Console Preview  */}
<section className="w-full bg-surface-canvas relative overflow-hidden py-space-2xl px-gutter-desktop">
<div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
<div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none"></div>
<div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center relative z-10">
{/*  Left Column: Copy, Trust Badges, Action CTAs  */}
<div className="lg:col-span-6 flex flex-col items-start gap-space-lg">
<div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed shadow-sm">
<span className="material-symbols-outlined text-[18px]">verified_user</span>
<span className="font-label-caps text-label-caps tracking-widest uppercase font-bold">
            Unified Industrial Clearance Gateway
          </span>
</div>
<div className="flex flex-col gap-space-sm">
<h1 className="font-display-lg text-display-lg text-text-primary tracking-tight">
            Faster Approvals. <br/>
<span className="text-primary underline decoration-primary-fixed underline-offset-8">Smarter Compliance.</span> <br/>
            Zero Friction for Industry.
          </h1>
<p className="font-body-lg text-body-lg text-text-secondary max-w-xl">
            A single-window digital statutory engine uniting factory leaders, safety inspectors, and state regulatory authorities (DISH, Pollution Control Boards, Boiler Authorities, and FSSAI) with automated rule validation and instant cryptographically secured clearances.
          </p>
</div>
{/*  Quick CTAs & Demo Track ID  */}
<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md w-full sm:w-auto">
<Link className="inline-flex items-center justify-center gap-space-xs px-space-xl py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-hover shadow-md transition-all group" to="/register">s*<span>Apply for New Approval</span>
<span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
</Link>
<Link className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-lg bg-surface-card text-primary font-label-lg text-label-lg shadow-sm hover:bg-surface-container-low transition-colors" to="/login">
<span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
<span>Officer Review Queue</span>
</Link>
</div>
{/*  Application Tracking Banner  */}
<div className="w-full max-w-lg p-space-md rounded-lg bg-surface-card shadow-sm flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm min-w-0">
<div className="w-9 h-9 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[20px]">manage_search</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-label-caps text-label-caps text-text-muted">FAST QUERY APPLICATION</span>
<span className="font-label-md text-label-md text-text-primary truncate">Reference: #73F551DE (Textile - DISH)</span>
</div>
</div>
<Link className="font-label-caps text-label-caps uppercase text-primary font-bold bg-primary-fixed px-space-sm py-1.5 rounded hover:bg-primary-hover hover:text-on-primary transition-colors flex-shrink-0" to="/">
            Track Status
          </Link>
</div>
{/*  Sovereign Authority Avatars & Quick Stats  */}
<div className="flex flex-wrap items-center gap-space-lg pt-space-xs">
<div className="flex -space-x-2">
<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs shadow-sm">MH</div>
<div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold text-xs shadow-sm">PB</div>
<div className="w-8 h-8 rounded-full bg-status-info flex items-center justify-center text-on-primary font-bold text-xs shadow-sm">GJ</div>
<div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold text-xs shadow-sm">TN</div>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">3 State Labour &amp; Safety Directorates</span>
<span className="font-body-sm text-body-sm text-text-muted">Demonstrating SIH compliance workflows</span>
</div>
</div>
</div>
{/*  Right Column: Interactive Visual Console Mockup  */}
<div className="lg:col-span-6 relative">
<div className="relative bg-surface-card rounded-xl shadow-xl overflow-hidden">
{/*  Mockup Window Bar  */}
<div className="bg-surface-container-high px-space-md py-space-sm flex items-center justify-between border-b border-surface-border">
<div className="flex items-center gap-space-xs">
<div className="w-3 h-3 rounded-full bg-status-danger"></div>
<div className="w-3 h-3 rounded-full bg-status-warning"></div>
<div className="w-3 h-3 rounded-full bg-status-success"></div>
<span className="ml-space-sm font-label-caps text-label-caps text-text-secondary">UdyogSanchar Production Console • DISH Master Node</span>
</div>
<span className="px-space-xs py-0.5 rounded bg-status-success-bg text-status-success font-label-caps text-label-caps font-semibold flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-status-success"></span> LIVE SYNC
            </span>
</div>
{/*  Mockup Dashboard Header  */}
<div className="p-space-lg bg-surface-card flex flex-col gap-space-md">
<div className="flex flex-wrap items-center justify-between gap-space-sm">
<div>
<span className="font-label-caps text-label-caps text-text-muted uppercase">Welcome Back, Industrialist</span>
<h3 className="font-headline-md text-headline-md text-text-primary">Priyanshu Gupta</h3>
<p className="font-body-sm text-body-sm text-text-secondary">Textile Technology Operations • Solapur, Maharashtra</p>
</div>
<span className="px-space-md py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-space-xs shadow-sm">
<span className="material-symbols-outlined text-[16px]">verified</span>
                Verified Unit #91E9A39D
              </span>
</div>
{/*  Dashboard Mini Metric Row  */}
<div className="grid grid-cols-3 gap-space-sm">
<div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col justify-between">
<span className="font-label-caps text-label-caps text-text-muted">ACTIVE PROJECTS</span>
<span className="font-headline-sm text-headline-sm text-text-primary mt-1 font-bold">01 Unit</span>
<span className="font-body-sm text-body-sm text-status-success font-medium">Under Operation</span>
</div>
<div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col justify-between">
<span className="font-label-caps text-label-caps text-text-muted">COMPLIANCE HEALTH</span>
<span className="font-headline-sm text-headline-sm text-status-success mt-1 font-bold">100% Score</span>
<span className="font-body-sm text-body-sm text-text-secondary">2 / 2 Cleared</span>
</div>
<div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col justify-between">
<span className="font-label-caps text-label-caps text-text-muted">AUDIT STATUS</span>
<span className="font-headline-sm text-headline-sm text-primary mt-1 font-bold">00 Pending</span>
<span className="font-body-sm text-body-sm text-text-secondary">Next in 365 Days</span>
</div>
</div>
{/*  Interactive Gauge & Status Card  */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-space-md p-space-md bg-surface-container-lowest rounded-lg border border-surface-border">
<div className="md:col-span-5 flex flex-col items-center justify-center p-space-sm text-center">
{/*  Circular SVG Progress Chart  */}
<div className="relative w-28 h-28 flex items-center justify-center">
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
<path className="text-surface-border" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
<path className="text-status-success" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeLinecap="round" strokeWidth="3.5"></path>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="font-headline-sm text-headline-sm font-bold text-text-primary">100%</span>
<span className="font-label-caps text-label-caps text-status-success uppercase font-semibold">Cleared</span>
</div>
</div>
<span className="font-label-md text-label-md text-text-primary mt-space-xs">Factories Act, 1948</span>
<span className="font-body-sm text-body-sm text-text-secondary">Statutory Compliance Ready</span>
</div>
{/*  Real-time Queue Mini Table  */}
<div className="md:col-span-7 flex flex-col justify-between">
<div className="flex items-center justify-between pb-space-xs border-b border-surface-border">
<span className="font-label-caps text-label-caps text-text-muted">ACTIVE CLEARANCES</span>
<span className="font-label-caps text-label-caps text-primary font-bold">STATE: MAHARASHTRA</span>
</div>
<div className="flex flex-col gap-space-xs py-space-xs">
<div className="flex items-center justify-between py-1 text-body-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px] text-status-success">task_alt</span>
<span className="text-text-primary font-medium">Factory License Renewal</span>
</div>
<span className="px-space-xs py-0.5 rounded bg-status-success-bg text-status-success font-label-caps text-label-caps font-semibold">APPROVED</span>
</div>
<div className="flex items-center justify-between py-1 text-body-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px] text-primary">engineering</span>
<span className="text-text-primary font-medium">Boiler Operation Cert (DISH)</span>
</div>
<span className="px-space-xs py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps font-semibold">INSPECTION</span>
</div>
<div className="flex items-center justify-between py-1 text-body-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px] text-status-warning">pending_actions</span>
<span className="text-text-primary font-medium">Hazardous Waste Auth (MPCB)</span>
</div>
<span className="px-space-xs py-0.5 rounded bg-status-warning-bg text-status-warning font-label-caps text-label-caps font-semibold">IN REVIEW</span>
</div>
</div>
<div className="pt-space-xs border-t border-surface-border flex items-center justify-between text-body-sm text-text-secondary">
<span>Certificate Hash: 91E9-A39D-VALID</span>
<span className="text-primary font-medium">View DISH Dossier</span>
</div>
</div>
</div>
{/*  Dynamic Bottom Ribbon  */}
<div className="bg-surface-container p-space-sm rounded-lg flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[18px]">campaign</span>
<span className="font-body-sm text-body-sm text-text-primary">Eligible for <strong>Maharashtra Textile Subsidy Scheme 2025</strong></span>
</div>
<span className="font-label-caps text-label-caps uppercase text-primary font-bold cursor-pointer hover:underline">Claim Subsidy</span>
</div>
</div>
</div>
{/*  Floating Badge for Sovereign Trust  */}
<div className="absolute -bottom-5 -left-5 bg-surface-card rounded-xl p-space-md shadow-xl border border-surface-border hidden sm:flex items-center gap-space-md">
<div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[24px]">verified</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary font-bold">Zero Paper Physical Queue</span>
<span className="font-body-sm text-body-sm text-text-secondary">100% Cryptographic Audit Trail</span>
</div>
</div>
</div>
</div>
</section>
{/*  Metric Impact Ribbon  */}
<section className="w-full bg-primary text-on-primary py-space-xl px-gutter-desktop">
<div className="max-w-container-max mx-auto grid grid-cols-2 lg:grid-cols-4 gap-space-lg">
<div className="flex flex-col items-center text-center p-space-sm">
<span className="font-metric-val text-metric-val font-bold text-secondary-fixed">3</span>
<span className="font-headline-sm text-headline-sm font-semibold mt-1">Demo States</span>
<span className="font-body-sm text-body-sm text-primary-fixed mt-space-xs">Direct API integration with DISH &amp; SPCBs</span>
</div>
<div className="flex flex-col items-center text-center p-space-sm">
<span className="font-metric-val text-metric-val font-bold text-secondary-fixed">Rule+AI</span>
<span className="font-headline-sm text-headline-sm font-semibold mt-1">Assisted Verification</span>
<span className="font-body-sm text-body-sm text-primary-fixed mt-space-xs">Automated compliance rule checking</span>
</div>
<div className="flex flex-col items-center text-center p-space-sm">
<span className="font-metric-val text-metric-val font-bold text-secondary-fixed">50+</span>
<span className="font-headline-sm text-headline-sm font-semibold mt-1">Demo Units</span>
<span className="font-body-sm text-body-sm text-primary-fixed mt-space-xs">Factories, plants, &amp; MSMEs registered nationwide</span>
</div>
<div className="flex flex-col items-center text-center p-space-sm">
<span className="font-metric-val text-metric-val font-bold text-secondary-fixed">100%</span>
<span className="font-headline-sm text-headline-sm font-semibold mt-1">Digital Audit Trail</span>
<span className="font-body-sm text-body-sm text-primary-fixed mt-space-xs">Robust tracking for hackathon demonstrations</span>
</div>
</div>
</section>
{/*  Key Value Pillars (3-Column Grid)  */}
<section className="w-full py-space-2xl px-gutter-desktop bg-surface-canvas">
<div className="max-w-container-max mx-auto flex flex-col gap-space-2xl">
<div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-space-xs">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">ARCHITECTED FOR STATUTORY VELOCITY</span>
<h2 className="font-headline-lg text-headline-lg text-text-primary">Institutional Capabilities Re-Engineered</h2>
<p className="font-body-md text-body-md text-text-secondary">UdyogSanchar removes bureaucratic gridlock through rule automation, cross-departmental data bridging, and structured compliance workflows.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
{/*  Pillar 1  */}
<div className="bg-surface-card p-space-xl rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
<div className="flex flex-col gap-space-md">
<div className="w-12 h-12 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-[28px]">hub</span>
</div>
<div className="flex flex-col gap-space-xs">
<h3 className="font-headline-md text-headline-md text-text-primary group-hover:text-primary transition-colors">
                Single-Window Clearances
              </h3>
<p className="font-body-md text-body-md text-text-secondary">
                Submit once and route to four statutory boards automatically. Eliminates duplicate filings across Factory Licenses, Hazardous Chemical Authorizations, Boiler Approvals, and FSSAI manufacturing licenses.
              </p>
</div>
</div>
<div className="mt-space-lg pt-space-md border-t border-surface-border flex flex-col gap-space-xs">
<div className="flex items-center gap-space-xs text-body-sm text-text-secondary">
<span className="material-symbols-outlined text-[18px] text-status-success">check_circle</span>
<span>Central &amp; State DISH Synchronization</span>
</div>
<div className="flex items-center gap-space-xs text-body-sm text-text-secondary">
<span className="material-symbols-outlined text-[18px] text-status-success">check_circle</span>
<span>Unified Document Repository (Zero Duplicate PDF)</span>
</div>
</div>
</div>
{/*  Pillar 2  */}
<div className="bg-surface-card p-space-xl rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
<div className="flex flex-col gap-space-md">
<div className="w-12 h-12 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[28px]">rule</span>
</div>
<div className="flex flex-col gap-space-xs">
<h3 className="font-headline-md text-headline-md text-text-primary group-hover:text-secondary transition-colors">
                Automated Rules &amp; Inspection Queue
              </h3>
<p className="font-body-md text-body-md text-text-secondary">
                Pre-validation engine checks boiler specs, chemical limits, and fire safety protocols before officer submission. Schedule geo-verified on-site audits with automatic appointment slot allocation.
              </p>
</div>
</div>
<div className="mt-space-lg pt-space-md border-t border-surface-border flex flex-col gap-space-xs">
<div className="flex items-center gap-space-xs text-body-sm text-text-secondary">
<span className="material-symbols-outlined text-[18px] text-status-success">check_circle</span>
<span>Algorithmic Pre-Flight Rule Check</span>
</div>
<div className="flex items-center gap-space-xs text-body-sm text-text-secondary">
<span className="material-symbols-outlined text-[18px] text-status-success">check_circle</span>
<span>Geo-Fenced Officer Inspection Verification</span>
</div>
</div>
</div>
{/*  Pillar 3  */}
<div className="bg-surface-card p-space-xl rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
<div className="flex flex-col gap-space-md">
<div className="w-12 h-12 rounded-lg bg-status-info-bg text-status-info flex items-center justify-center">
<span className="material-symbols-outlined text-[28px]">payments</span>
</div>
<div className="flex flex-col gap-space-xs">
<h3 className="font-headline-md text-headline-md text-text-primary group-hover:text-status-info transition-colors">
                State &amp; Central Scheme Finder
              </h3>
<p className="font-body-md text-body-md text-text-secondary">
                Direct statutory matching engine detects eligibility for capital subsidies, green fuel incentives, and export promotions as soon as manufacturing parameters and capacity are recorded.
              </p>
</div>
</div>
<div className="mt-space-lg pt-space-md border-t border-surface-border flex flex-col gap-space-xs">
<div className="flex items-center gap-space-xs text-body-sm text-text-secondary">
<span className="material-symbols-outlined text-[18px] text-status-success">check_circle</span>
<span>Instant Scheme & Subsidy Discovery</span>
</div>
<div className="flex items-center gap-space-xs text-body-sm text-text-secondary">
<span className="material-symbols-outlined text-[18px] text-status-success">check_circle</span>
<span>One-Click Application for State Industrial Rebates</span>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  Live Officer Applications Review Queue (Inspired by Admin Dashboard screenshot)  */}
<section className="w-full py-space-2xl px-gutter-desktop bg-surface-container-low border-y border-surface-border">
<div className="max-w-container-max mx-auto flex flex-col gap-space-xl">
{/*  Section Header  */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
<div>
<div className="flex items-center gap-space-xs">
<span className="px-space-xs py-0.5 rounded bg-primary text-on-primary font-label-caps text-label-caps">OFFICER REVIEW ENGINE</span>
<span className="font-body-sm text-body-sm text-text-secondary">Direct Administrative Access</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-text-primary mt-1">Live Applications Queue</h2>
<p className="font-body-md text-body-md text-text-secondary">Real-time statutory clearance queue currently being evaluated by DISH officers and pollution board inspectors.</p>
</div>
{/*  Administrative Counters  */}
<div className="flex items-center gap-space-md">
<div className="bg-surface-card px-space-md py-space-xs rounded-lg shadow-sm flex items-center gap-space-sm">
<span className="w-3 h-3 rounded-full bg-status-info"></span>
<span className="font-label-md text-label-md text-text-primary">31 Active Total</span>
</div>
<div className="bg-surface-card px-space-md py-space-xs rounded-lg shadow-sm flex items-center gap-space-sm">
<span className="w-3 h-3 rounded-full bg-status-warning"></span>
<span className="font-label-md text-label-md text-text-primary">3 Pending Review</span>
</div>
<Link className="px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary-hover transition-colors flex items-center gap-space-xs" to="/">
<span className="material-symbols-outlined text-[16px]">refresh</span>
<span>Live Sync</span>
</Link>
</div>
</div>
{/*  Queue Data Table  */}
<div className="w-full bg-surface-card rounded-xl shadow-sm overflow-x-auto border border-surface-border">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-canvas border-b border-surface-border font-label-caps text-label-caps text-text-muted uppercase">
<th className="py-space-md px-space-lg">ID / Reference</th>
<th className="py-space-md px-space-lg">Industry Name</th>
<th className="py-space-md px-space-lg">Approval Type &amp; State</th>
<th className="py-space-md px-space-lg">Submission</th>
<th className="py-space-md px-space-lg">Regulatory Status</th>
<th className="py-space-md px-space-lg text-right">Statutory Action</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-border text-body-md font-body-md text-text-primary">
<tr className="hover:bg-surface-canvas transition-colors">
<td className="py-space-md px-space-lg font-mono text-body-sm font-semibold text-primary">#91E9A39D</td>
<td className="py-space-md px-space-lg font-semibold">Cement Works Nagpur [DEMO]</td>
<td className="py-space-md px-space-lg text-text-secondary">Hazardous Waste Auth • Maharashtra SPCB</td>
<td className="py-space-md px-space-lg text-text-muted">Today, 09:20 AM</td>
<td className="py-space-md px-space-lg">
<span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span> INSPECTION REQUIRED
                </span>
</td>
<td className="py-space-md px-space-lg text-right">
<button className="inline-flex items-center gap-1 px-space-md py-1.5 rounded bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-hover shadow-sm transition-all">
<span className="material-symbols-outlined text-[16px]">visibility</span> Review
                </button>
</td>
</tr>
<tr className="hover:bg-surface-canvas transition-colors">
<td className="py-space-md px-space-lg font-mono text-body-sm font-semibold text-primary">#91E9A3B3</td>
<td className="py-space-md px-space-lg font-semibold">Plastic Manufacturing Works Amravati</td>
<td className="py-space-md px-space-lg text-text-secondary">Boiler Operation Certificate • DISH Maharashtra</td>
<td className="py-space-md px-space-lg text-text-muted">Yesterday</td>
<td className="py-space-md px-space-lg">
<span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-status-info-bg text-status-info font-label-caps text-label-caps font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-status-info"></span> SUBMITTED
                </span>
</td>
<td className="py-space-md px-space-lg text-right">
<button className="inline-flex items-center gap-1 px-space-md py-1.5 rounded bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-hover shadow-sm transition-all">
<span className="material-symbols-outlined text-[16px]">visibility</span> Review
                </button>
</td>
</tr>
<tr className="hover:bg-surface-canvas transition-colors">
<td className="py-space-md px-space-lg font-mono text-body-sm font-semibold text-primary">#91E9A3D2</td>
<td className="py-space-md px-space-lg font-semibold">Cement Works Jalandhar</td>
<td className="py-space-md px-space-lg text-text-secondary">Drug Manufacturing Compliance • DISH Punjab</td>
<td className="py-space-md px-space-lg text-text-muted">3 Oct 2025</td>
<td className="py-space-md px-space-lg">
<span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span> INSPECTION SCHEDULED
                </span>
</td>
<td className="py-space-md px-space-lg text-right">
<button className="inline-flex items-center gap-1 px-space-md py-1.5 rounded bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-hover shadow-sm transition-all">
<span className="material-symbols-outlined text-[16px]">visibility</span> Review
                </button>
</td>
</tr>
<tr className="hover:bg-surface-canvas transition-colors">
<td className="py-space-md px-space-lg font-mono text-body-sm font-semibold text-primary">#91E9A3E0</td>
<td className="py-space-md px-space-lg font-semibold">Automobile Components Works Mandi Gobindgarh</td>
<td className="py-space-md px-space-lg text-text-secondary">Factory Heavy Machinery Safety • Punjab DISH</td>
<td className="py-space-md px-space-lg text-text-muted">2 Oct 2025</td>
<td className="py-space-md px-space-lg">
<span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-status-warning-bg text-status-warning font-label-caps text-label-caps font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-status-warning"></span> UNDER REVIEW
                </span>
</td>
<td className="py-space-md px-space-lg text-right">
<button className="inline-flex items-center gap-1 px-space-md py-1.5 rounded bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-hover shadow-sm transition-all">
<span className="material-symbols-outlined text-[16px]">visibility</span> Review
                </button>
</td>
</tr>
<tr className="hover:bg-surface-canvas transition-colors">
<td className="py-space-md px-space-lg font-mono text-body-sm font-semibold text-primary">#73F551DE</td>
<td className="py-space-md px-space-lg font-semibold">Textile Technology Works Solapur</td>
<td className="py-space-md px-space-lg text-text-secondary">Annual Factory License Renewal • DISH Maharashtra</td>
<td className="py-space-md px-space-lg text-text-muted">1 Oct 2025</td>
<td className="py-space-md px-space-lg">
<span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-status-success-bg text-status-success font-label-caps text-label-caps font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-status-success"></span> APPROVED / ISSUED
                </span>
</td>
<td className="py-space-md px-space-lg text-right">
<button className="inline-flex items-center gap-1 px-space-md py-1.5 rounded bg-surface-container-high text-primary font-label-md text-label-md hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-[16px]">download</span> Certificate
                </button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</section>
{/*  Interactive Compliance Clearance Calculator Preview  */}
<section className="w-full py-space-2xl px-gutter-desktop bg-surface-canvas">
<div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
{/*  Interactive Input Widget  */}
<div className="lg:col-span-6 bg-surface-card p-space-xl rounded-xl shadow-md border border-surface-border">
<div className="flex items-center gap-space-sm mb-space-md">
<div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-[18px]">calculate</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-text-primary">Clearance &amp; Subsidy Calculator</h3>
<p className="font-body-sm text-body-sm text-text-secondary">Instant statutory checklist mapping for your facility</p>
</div>
</div>
<div className="flex flex-col gap-space-md">
{/*  State Selection  */}
<div className="flex flex-col gap-space-xs">
<label className="font-label-caps text-label-caps uppercase text-text-secondary font-bold">State Jurisdiction</label>
<select className="w-full px-space-md py-2.5 rounded-lg bg-surface-canvas border border-surface-border text-text-primary font-body-md focus:outline-none focus:ring-2 focus:ring-primary" id="calcState">
<option value="MH">Maharashtra (DISH &amp; MPCB)</option>
<option value="PB">Punjab (Labour Dept &amp; PPCB)</option>
<option value="GJ">Gujarat (GPCB &amp; Factories Inspectorate)</option>
<option value="TN">Tamil Nadu (DIS &amp; TNPCB)</option>
<option value="UP">Uttar Pradesh (DISH UP &amp; UPPCB)</option>
</select>
</div>
{/*  Industry Classification  */}
<div className="flex flex-col gap-space-xs">
<label className="font-label-caps text-label-caps uppercase text-text-secondary font-bold">Industrial Sector</label>
<select className="w-full px-space-md py-2.5 rounded-lg bg-surface-canvas border border-surface-border text-text-primary font-body-md focus:outline-none focus:ring-2 focus:ring-primary" id="calcSector">
<option value="textile">Textile Processing &amp; Weaving Units</option>
<option value="chemical">Chemical &amp; Bulk Drug Manufacturing</option>
<option value="food">Agro &amp; Food Processing Facilities (FSSAI/Boiler)</option>
<option value="auto">Automobile &amp; Heavy Engineering</option>
</select>
</div>
{/*  Unit Size  */}
<div className="flex flex-col gap-space-xs">
<label className="font-label-caps text-label-caps uppercase text-text-secondary font-bold">Worker Capacity &amp; Steam Generation</label>
<div className="grid grid-cols-2 gap-space-sm">
<input className="px-space-md py-2 rounded bg-surface-canvas border border-surface-border text-text-primary font-body-md" placeholder="Worker Count (e.g. 150)" type="text" value="120 Workers"/>
<input className="px-space-md py-2 rounded bg-surface-canvas border border-surface-border text-text-primary font-body-md" placeholder="Boiler Capacity" type="text" value="3.5 Tons / Hr"/>
</div>
</div>
{/*  Calculation Trigger  */}
<button className="w-full py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-hover shadow-sm transition-colors mt-space-sm flex items-center justify-center gap-space-xs" id="calcTriggerBtn" type="button" onClick={handleCalc}>
<span className="material-symbols-outlined text-[18px]">verified</span>
<span>Compute Statutory Checklist</span>
</button>
</div>
</div>
{/*  Output Result Panel  */}
<div className="lg:col-span-6 flex flex-col gap-space-md">
<span className="font-label-caps text-label-caps uppercase text-primary tracking-wider font-bold">AUTOMATIC COMPLIANCE MAPPING</span>
<h2 className="font-headline-lg text-headline-lg text-text-primary">Instant Regulatory Clearance Path</h2>
<p className="font-body-md text-body-md text-text-secondary">
          Based on sector classification and worker density thresholds, UdyogSanchar maps the precise statutory certificates required under Indian law:
        </p>
<div className="flex flex-col gap-space-sm">
<div className="p-space-md rounded-lg bg-surface-card shadow-sm border-l-4 border-primary flex items-start justify-between gap-space-md">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">The Factories Act, 1948 (Section 6 &amp; 7)</span>
<span className="font-body-sm text-body-sm text-text-secondary">Mandatory factory license registration &amp; plan approval (Annual renewal).</span>
</div>
<span className="font-label-caps text-label-caps px-space-sm py-1 rounded bg-primary-fixed text-on-primary-fixed font-bold flex-shrink-0">MANDATORY</span>
</div>
<div className="p-space-md rounded-lg bg-surface-card shadow-sm border-l-4 border-secondary flex items-start justify-between gap-space-md">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">Indian Boilers Act, 1923 Clearance</span>
<span className="font-body-sm text-body-sm text-text-secondary">Steam piping certification and safety valve calibration tests via DISH officer.</span>
</div>
<span className="font-label-caps text-label-caps px-space-sm py-1 rounded bg-secondary-container text-on-secondary-container font-bold flex-shrink-0">ONLINE AUDIT</span>
</div>
<div className="p-space-md rounded-lg bg-surface-card shadow-sm border-l-4 border-status-warning flex items-start justify-between gap-space-md">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">Eligible State Subsidy Detected</span>
<span className="font-body-sm text-body-sm text-text-secondary">Maharashtra Industrial Policy: 25% Capital Interest Rebate for Green Boilers.</span>
</div>
<span className="font-label-caps text-label-caps px-space-sm py-1 rounded bg-status-warning-bg text-status-warning font-bold flex-shrink-0">₹45 LAKH SCHEME</span>
</div>
</div>
</div>
</div>
</section>
{/*  4-Step Interactive Timeline Workflow  */}
<section className="w-full py-space-2xl px-gutter-desktop bg-surface-canvas">
<div className="max-w-container-max mx-auto flex flex-col gap-space-2xl">
<div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-space-xs">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">END-TO-END VERIFICATION TIMELINE</span>
<h2 className="font-headline-lg text-headline-lg text-text-primary">How Demo Units Get Cleared</h2>
<p className="font-body-md text-body-md text-text-secondary">From first registration to verifiable digital licensing in four seamless, audit-compliant stages.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-4 gap-space-lg relative">
{/*  Step 1  */}
<div className="bg-surface-card p-space-lg rounded-xl shadow-sm border border-surface-border flex flex-col gap-space-md relative">
<div className="flex items-center justify-between">
<span className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center">01</span>
<span className="material-symbols-outlined text-primary text-[24px]">app_registration</span>
</div>
<div className="flex flex-col gap-space-xs">
<h4 className="font-headline-sm text-headline-sm text-text-primary">Onboarding &amp; Profile</h4>
<p className="font-body-sm text-body-sm text-text-secondary">Submit unit details, machinery specifications, factory blueprints, and state industrial registration numbers.</p>
</div>
<span className="font-label-caps text-label-caps text-text-muted mt-auto">EST. TIME: 15 MINUTES</span>
</div>
{/*  Step 2  */}
<div className="bg-surface-card p-space-lg rounded-xl shadow-sm border border-surface-border flex flex-col gap-space-md relative">
<div className="flex items-center justify-between">
<span className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container font-bold flex items-center justify-center">02</span>
<span className="material-symbols-outlined text-secondary text-[24px]">auto_fix_high</span>
</div>
<div className="flex flex-col gap-space-xs">
<h4 className="font-headline-sm text-headline-sm text-text-primary">Rule Pre-Validation</h4>
<p className="font-body-sm text-body-sm text-text-secondary">Intelligent algorithmic validation scans chimney dimensions, hazardous safety ratios, and employee safety protocols.</p>
</div>
<span className="font-label-caps text-label-caps text-text-muted mt-auto">EST. TIME: INSTANT</span>
</div>
{/*  Step 3  */}
<div className="bg-surface-card p-space-lg rounded-xl shadow-sm border border-surface-border flex flex-col gap-space-md relative">
<div className="flex items-center justify-between">
<span className="w-10 h-10 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center">03</span>
<span className="material-symbols-outlined text-primary-container text-[24px]">fact_check</span>
</div>
<div className="flex flex-col gap-space-xs">
<h4 className="font-headline-sm text-headline-sm text-text-primary">Officer &amp; Field Audit</h4>
<p className="font-body-sm text-body-sm text-text-secondary">Statutory DISH and Pollution officers review file notes, assign inspection dates, and log geo-tagged reports.</p>
</div>
<span className="font-label-caps text-label-caps text-text-muted mt-auto">EST. TIME: 3 - 5 DAYS</span>
</div>
{/*  Step 4  */}
<div className="bg-surface-card p-space-lg rounded-xl shadow-sm border border-surface-border flex flex-col gap-space-md relative">
<div className="flex items-center justify-between">
<span className="w-10 h-10 rounded-full bg-status-success-bg text-status-success font-bold flex items-center justify-center">04</span>
<span className="material-symbols-outlined text-status-success text-[24px]">workspace_premium</span>
</div>
<div className="flex flex-col gap-space-xs">
<h4 className="font-headline-sm text-headline-sm text-text-primary">Digital License Issuance</h4>
<p className="font-body-sm text-body-sm text-text-secondary">Instant cryptographically verified digital clearance certificates with QR verification and 365-day automated renewal alerts.</p>
</div>
<span className="font-label-caps text-label-caps text-text-muted mt-auto">EST. TIME: REAL-TIME</span>
</div>
</div>
</div>
</section>
{/*  Complete Portal System Directory & Navigation Map  */}
<section className="w-full py-space-2xl px-gutter-desktop bg-surface-container-low border-t border-surface-border">
<div className="max-w-container-max mx-auto flex flex-col gap-space-xl">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
<div>
<span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-widest">SYSTEM TOPOLOGY &amp; WORKFLOW HUBS</span>
<h2 className="font-headline-lg text-headline-lg text-text-primary mt-1">Unified Portal Routing Matrix</h2>
<p className="font-body-md text-body-md text-text-secondary">Direct access across all sub-systems, officer dashboards, and regulatory tools.</p>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
{/*  Industry Portal Modules  */}
<div className="bg-surface-card p-space-lg rounded-xl shadow-sm border border-surface-border flex flex-col gap-space-md">
<div className="flex items-center gap-space-sm pb-space-sm border-b border-surface-border">
<span className="material-symbols-outlined text-primary text-[24px]">factory</span>
<h3 className="font-headline-sm text-headline-sm text-text-primary">Industry Unit Portal</h3>
</div>
<ul className="flex flex-col gap-space-xs font-body-md">
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>Enterprise Dashboard</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</Link>
</li>
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>My Clearances &amp; Approvals</span>
<span className="px-space-xs py-0.5 rounded bg-status-success-bg text-status-success font-label-caps text-label-caps">1 Active</span>
</Link>
</li>
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>Compliance Tracker &amp; Scoring</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</Link>
</li>
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>Document Vault &amp; Blueprints</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</Link>
</li>
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>State Industrial Subsidy Aggregator</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</Link>
</li>
</ul>
</div>
{/*  Regulatory & Officer Console  */}
<div className="bg-surface-card p-space-lg rounded-xl shadow-sm border border-surface-border flex flex-col gap-space-md">
<div className="flex items-center gap-space-sm pb-space-sm border-b border-surface-border">
<span className="material-symbols-outlined text-primary text-[24px]">shield_person</span>
<h3 className="font-headline-sm text-headline-sm text-text-primary">Officer &amp; Admin Console</h3>
</div>
<ul className="flex flex-col gap-space-xs font-body-md">
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>Statutory Review Queue</span>
<span className="px-space-xs py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps">3 Pending</span>
</Link>
</li>
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>Regulatory Rules Engine</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</Link>
</li>
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>On-Site Inspection Scheduler</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</Link>
</li>
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>Statutory Audit Logs (CVC Norms)</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</Link>
</li>
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>Scheme Allocation Manager</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</Link>
</li>
</ul>
</div>
{/*  Knowledge & Registration Hub  */}
<div className="bg-surface-card p-space-lg rounded-xl shadow-sm border border-surface-border flex flex-col gap-space-md">
<div className="flex items-center gap-space-sm pb-space-sm border-b border-surface-border">
<span className="material-symbols-outlined text-primary text-[24px]">menu_book</span>
<h3 className="font-headline-sm text-headline-sm text-text-primary">Knowledge &amp; Support Hub</h3>
</div>
<ul className="flex flex-col gap-space-xs font-body-md">
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>The Factories Act 1948 Compliance Handbook</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</Link>
</li>
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>Indian Boilers Act Standard Operating Guidelines</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</Link>
</li>
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>Hazardous Chemicals Authorization Rules</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</Link>
</li>
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>Grievance Redressal &amp; Nodal Contact</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</Link>
</li>
<li>
<Link className="flex items-center justify-between py-1.5 text-text-secondary hover:text-primary transition-colors" to="/">
<span>Enterprise API Access for ERP Systems</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</Link>
</li>
</ul>
</div>
</div>
</div>
</section>
{/*  Industrial Testimonials & Verified Cases  */}
<section className="w-full py-space-2xl px-gutter-desktop bg-surface-canvas">
<div className="max-w-container-max mx-auto flex flex-col gap-space-xl">
<div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-space-xs">
<span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">TRUSTED BY PLANT DIRECTORS</span>
<h2 className="font-headline-lg text-headline-lg text-text-primary">Tested in Real Industrial Operations</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
<div className="bg-surface-card p-space-xl rounded-xl shadow-sm border border-surface-border flex flex-col justify-between gap-space-md">
<p className="font-body-lg text-body-lg text-text-primary italic">
            “Factory license renewals used to involve three separate physical visits to the district labour office and extensive paperwork. On UdyogSanchar, our annual DISH renewal was audited, verified, and issued in under 4 business days.”
          </p>
<div className="flex items-center gap-space-md pt-space-md border-t border-surface-border">
<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
              PG
            </div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary font-bold">Priyanshu Gupta</span>
<span className="font-body-sm text-body-sm text-text-secondary">Director, Solapur Textile Mills &amp; Processing Ltd.</span>
</div>
</div>
</div>
<div className="bg-surface-card p-space-xl rounded-xl shadow-sm border border-surface-border flex flex-col justify-between gap-space-md">
<p className="font-body-lg text-body-lg text-text-primary italic">
            “The automated rules engine detected our boiler capacity safety threshold requirements upfront, preventing a two-month rejection cycle. The integrated pollution clearance pipeline is an absolute benchmark for digital governance.”
          </p>
<div className="flex items-center gap-space-md pt-space-md border-t border-surface-border">
<div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold">
              AK
            </div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary font-bold">Arvinder Kaur</span>
<span className="font-body-sm text-body-sm text-text-secondary">Head of Statutory Compliance, Mandi Agro &amp; Chemical Complex</span>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  Final Call to Action Section  */}
<section className="w-full bg-primary-container text-on-primary py-space-2xl px-gutter-desktop relative overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-hover opacity-90"></div>
<div className="max-w-container-max mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-space-xl text-center lg:text-left">
<div className="flex flex-col gap-space-sm max-w-2xl">
<span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary-fixed font-bold">
          SMART INDIA HACKATHON GOVERNANCE INITIATIVE
        </span>
<h2 className="font-display-lg text-display-lg font-bold text-on-primary">
          Accelerate your statutory industrial clearances today.
        </h2>
<p className="font-body-lg text-body-lg text-primary-fixed">
          Register your manufacturing unit, run algorithmic compliance diagnostics, and experience India’s most transparent industrial clearance network.
        </p>
</div>
<div className="flex flex-col sm:flex-row items-center gap-space-md flex-shrink-0">
<Link className="px-space-xl py-3.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg font-bold hover:bg-secondary transition-all shadow-md" to="/register">
          Register Factory Unit
        </Link>
<Link className="px-space-lg py-3.5 rounded-lg bg-surface-card text-primary font-label-lg text-label-lg font-bold hover:bg-surface-container-low transition-colors shadow-sm" to="/login">
          Access Officer Console
        </Link>
</div>
</div>
</section>
</div>
</main><footer className="w-full bg-surface-card border-t border-surface-border mt-space-2xl"><div className="max-w-container-max mx-auto px-gutter-desktop py-space-2xl"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl"><div className="lg:col-span-2 flex flex-col gap-space-md"><div className="flex items-center gap-space-sm"><img alt="UdyogSanchar Logo" className="h-7 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSqW1tNFVmZJ0N_DUlPZVV7OT16FQoivX9tEGqLahNw7HXuMNVpX5O3UhjdeX41E1W35ax3Mgat2Naf0Z6aTlBpDz9ZNgEfmIrnB6HiOUAeTo0TGyZo4QFYOxYzWpGgmNV8oyCSSScawTK-AU_j_0KUMqJgaXrt8pa6I2LxtUCllnZe72HFCYvh_W6wZDw7pdtx2R1AYGglicw0V08f-zKlR3Drm_lY54-fLVUmj16tevs4sGLghcC"/><span className="font-headline-sm text-headline-sm text-primary tracking-tight">UdyogSanchar</span></div><p className="font-body-md text-body-md text-text-secondary max-w-md">Single-window unified digital clearance mechanism accelerating statutory safety certifications, industrial boiler licensing, pollution clearances, and state inspection workflows across Indian industrial sectors.</p><div className="flex items-center gap-space-sm mt-space-sm"><span className="px-space-sm py-1 rounded bg-secondary-container text-on-secondary-container font-label-caps text-label-caps font-bold">SIH HACKATHON 2026</span><span className="px-space-sm py-1 rounded bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps">GOV-TECH STANDARDS COMPLIANT</span></div></div><div className="flex flex-col gap-space-sm"><span className="font-label-caps text-label-caps text-text-muted uppercase">Ministry Affiliations</span><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">Ministry of Commerce &amp; Industry</Link><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">Ministry of Labour &amp; Employment</Link><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">Central Pollution Control Board (CPCB)</Link><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">DPIIT Industrial Safety Cell</Link><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">Smart India Hackathon Initiative</Link></div><div className="flex flex-col gap-space-sm"><span className="font-label-caps text-label-caps text-text-muted uppercase">State Regulatory Bodies</span><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">DISH Maharashtra (Factories Inspectorate)</Link><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">DISH Punjab &amp; Haryana</Link><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">Gujarat Industrial Safety Division</Link><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">Tamil Nadu Directorate of Industrial Safety</Link><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">State Pollution Control Boards (SPCB)</Link></div><div className="flex flex-col gap-space-sm"><span className="font-label-caps text-label-caps text-text-muted uppercase">Quick Compliance Links</span><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">The Factories Act, 1948 Clearances</Link><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">Indian Boilers Act Approvals</Link><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">Hazardous Waste Authorization</Link><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">Real-time Audit Verification</Link><Link className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors" to="/">API Integration for Enterprise ERP</Link></div></div><div className="border-t border-surface-border mt-space-xl pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-base text-center md:text-left"><p className="font-body-sm text-body-sm text-text-muted">© 2025 UdyogSanchar. Designed &amp; Developed for Statutory Governance under Smart India Hackathon. All Rights Reserved.</p><div className="flex items-center gap-space-lg font-body-sm text-body-sm text-text-secondary"><Link className="hover:text-primary transition-colors" to="/">Privacy Policy</Link><Link className="hover:text-primary transition-colors" to="/">Terms of Statutory Submission</Link><Link className="hover:text-primary transition-colors" to="/">Cyber Security Guidelines</Link><Link className="hover:text-primary transition-colors" to="/">Grievance Redressal</Link></div></div></div></footer>
    </div>
  );
};

export default Landing;
