import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Factory,
  Building2,
  MapPin,
  Users,
  Lightbulb,
  Droplets,
  Trash2,
  AlertTriangle,
  Palette,
  Hammer,
  ListChecks,
  BarChart3,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import api from "../api/api";

const steps = [
  { id: 1, title: "Business Info",       description: "Company details & location" },
  { id: 2, title: "Scale & Activity",    description: "Production capacity" },
  { id: 3, title: "Environmental Impact",description: "Emissions & waste" },
  { id: 4, title: "Project Stage",       description: "Current phase" },
];

const initialForm = {
  // Step 1 — Business & Location
  companyName:      "",
  sector:           "",
  state:            "",
  district:         "",
  projectLocation:  "",
  pincode:          "",

  // Step 2 — Scale & Activity
  investment:           "",
  employees:            "",
  productionCapacity:   "",
  capacityUnit:         "Tons",
  manufacturingActivity:"",
  processes:            "",

  // Step 3 — Environment
  waterUsage:           "",
  waterSource:          "",
  generatesWastewater:  false,
  wastewater:           "",
  treatmentFacility:    "none",
  hazardousWaste:       false,
  wasteCategory:        "",
  wasteQty:             "",
  disposalMethod:       "",

  // Step 4 — Stage
  projectStage: "operational",
};

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli",
  "Daman & Diu","Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const SECTORS = [
  { value: "manufacturing",  label: "Manufacturing" },
  { value: "energy",         label: "Energy & Power" },
  { value: "mining",         label: "Mining & Extraction" },
  { value: "chemicals",      label: "Chemicals & Pharmaceuticals" },
  { value: "textiles",       label: "Textiles & Apparel" },
  { value: "food",           label: "Food Processing" },
  { value: "construction",   label: "Construction & Infrastructure" },
  { value: "technology",     label: "Information Technology / Electronics" },
  { value: "automobile",     label: "Automobile & Auto Parts" },
  { value: "other",          label: "Other" },
];

const inputClass =
  "w-full rounded-lg border border-[#cbc4d2] bg-white px-4 py-3 text-[#1d1b20] outline-none transition focus:border-[#4f378a] focus:ring-2 focus:ring-[#cfbcff]";

const inputErrorClass =
  "w-full rounded-lg border border-red-400 bg-red-50 px-4 py-3 text-[#1d1b20] outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200";

const labelClass =
  "mb-2 block text-xs font-semibold uppercase tracking-wider text-[#1d1b20]";

// ── Per-step validation ─────────────────────────────────────────────────────
const validateStep = (step, form) => {
  const errs = {};

  if (step === 1) {
    if (!form.companyName.trim())     errs.companyName     = "Company name is required";
    if (!form.sector)                 errs.sector          = "Please select a sector";
    if (!form.state)                  errs.state           = "Please select a state";
    if (!form.district.trim())        errs.district        = "District is required";
    if (!form.projectLocation.trim()) errs.projectLocation = "Project location is required";
    if (!form.pincode.trim())         errs.pincode         = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode.trim()))
                                      errs.pincode         = "Pincode must be exactly 6 digits";
  }

  if (step === 2) {
    if (!form.investment || Number(form.investment) <= 0)
      errs.investment = "Investment must be greater than 0";
    if (!form.employees || Number(form.employees) <= 0)
      errs.employees = "Number of employees must be greater than 0";
    if (!form.productionCapacity || Number(form.productionCapacity) <= 0)
      errs.productionCapacity = "Production capacity must be greater than 0";
    if (!form.manufacturingActivity.trim())
      errs.manufacturingActivity = "Manufacturing activity is required";
    if (!form.processes.trim())
      errs.processes = "Key processes are required";
  }

  if (step === 3) {
    if (!form.waterUsage || Number(form.waterUsage) <= 0)
      errs.waterUsage = "Daily water usage must be greater than 0";
    if (form.generatesWastewater && (!form.wastewater || Number(form.wastewater) <= 0))
      errs.wastewater = "Wastewater volume must be greater than 0";
    if (form.hazardousWaste && !form.wasteCategory.trim())
      errs.wasteCategory = "Waste category is required when hazardous waste is selected";
  }

  // Step 4 always valid — radio always has a default value
  return errs;
};

// ── Tooltip helper ──────────────────────────────────────────────────────────
function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative ml-1 inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#e6e0e9] text-[10px] font-bold text-[#4f378a]"
      >
        ?
      </button>
      {show && (
        <span className="absolute bottom-6 left-0 z-50 w-52 rounded-lg border border-[#cbc4d2] bg-white px-3 py-2 text-xs text-[#494551] shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
function IndustryProfileWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm]               = useState(initialForm);
  const [submitted, setSubmitted]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [existingId, setExistingId]   = useState(null); // existing industry _id
  const navigate = useNavigate();

  // ── Load existing profile on mount ──────────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/industries/me");
        const profile = res.data?.data;
        if (profile) {
          setExistingId(profile._id);
          setForm({
            companyName:          profile.companyName         || "",
            sector:               profile.sector              || "",
            state:                profile.state               || "",
            district:             profile.district            || "",
            projectLocation:      profile.projectLocation     || "",
            pincode:              profile.pincode             || "",
            investment:           profile.investment          ?? "",
            employees:            profile.employees           ?? "",
            productionCapacity:   profile.productionCapacity  ?? "",
            capacityUnit:         "Tons",
            manufacturingActivity:profile.manufacturingActivity || "",
            processes:            profile.processes           || "",
            waterUsage:           profile.waterUsage          ?? "",
            waterSource:          profile.waterSource         || "",
            generatesWastewater:  profile.generatesWastewater ?? false,
            wastewater:           profile.wastewater          ?? "",
            treatmentFacility:    profile.treatmentFacility   || "none",
            hazardousWaste:       profile.hazardousWaste      ?? false,
            wasteCategory:        profile.wasteCategory       || "",
            wasteQty:             profile.wasteQty            ?? "",
            disposalMethod:       profile.disposalMethod      || "",
            projectStage:         profile.projectStage        || "operational",
          });
        }
      } catch {
        // No profile yet — start fresh
      }
    };
    loadProfile();
  }, []);

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Build payload matching Industry model ──────────────────────────────
  const buildPayload = () => ({
    companyName:           form.companyName,
    sector:                form.sector,
    state:                 form.state,
    district:              form.district,
    projectLocation:       form.projectLocation,
    pincode:               form.pincode,
    investment:            Number(form.investment)         || 0,
    employees:             Number(form.employees)          || 0,
    productionCapacity:    Number(form.productionCapacity) || 0,
    manufacturingActivity: form.manufacturingActivity,
    processes:             form.processes,
    waterUsage:            Number(form.waterUsage)         || 0,
    waterSource:           form.waterSource,
    generatesWastewater:   form.generatesWastewater,
    wastewater:            Number(form.wastewater)         || 0,
    treatmentFacility:     form.treatmentFacility,
    hazardousWaste:        form.hazardousWaste,
    wasteCategory:         form.wasteCategory,
    wasteQty:              Number(form.wasteQty)           || 0,
    disposalMethod:        form.disposalMethod,
    projectStage:          form.projectStage,
  });

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = buildPayload();
      if (existingId) {
        await api.put(`/industries/${existingId}`, payload);
      } else {
        const res = await api.post("/industries", payload);
        setExistingId(res.data?.data?.industryId);
      }
      setSubmitted(true);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save profile. Please try again.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    setError("");
    const errs = validateStep(currentStep, form);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setFieldErrors({});
    if (currentStep < 4) {
      setCurrentStep((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const previousStep = () => {
    setError("");
    setFieldErrors({});
    if (currentStep > 1) {
      setCurrentStep((p) => p - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const resetWizard = () => {
    setForm(initialForm);
    setCurrentStep(1);
    setSubmitted(false);
    setError("");
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-[#fdf7ff] text-[#1d1b20] antialiased">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#cbc4d2] bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <img src="/udyog-sanchar-icon.png" alt="UdyogSanchar" className="h-10 w-auto" />
          <span className="text-xl font-bold">UdyogSanchar</span>
        </div>
        <div className="flex items-center gap-4">
          {existingId && (
            <span className="rounded-full bg-[#f8f2fa] px-3 py-1 text-xs font-semibold text-[#4f378a]">
              Editing existing profile
            </span>
          )}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#4f378a] hover:underline"
          >
            <X size={16} />
            Exit
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-8 md:flex-row md:px-10">
        {/* Sidebar */}
        <aside className="w-full shrink-0 md:w-64">
          <div className="sticky top-6 rounded-xl border border-[#cbc4d2] bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold">Setup Progress</h2>
            <ol>
              {steps.map((step, index) => {
                const active    = currentStep === step.id;
                const completed = currentStep > step.id;
                return (
                  <li key={step.id} className={`relative ${index !== steps.length - 1 ? "pb-10" : ""}`}>
                    {index !== steps.length - 1 && (
                      <div className="absolute left-4 top-4 h-full w-0.5 bg-[#cbc4d2]" />
                    )}
                    <button
                      type="button"
                      onClick={() => { if (step.id <= currentStep) setCurrentStep(step.id); }}
                      className="relative flex w-full items-start text-left"
                    >
                      <span className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                        active || completed
                          ? "border-[#4f378a] bg-[#4f378a] text-white"
                          : "border-[#7a7582] bg-[#e6e0e9] text-[#7a7582]"
                      }`}>
                        {completed ? <CheckCircle2 size={16} /> : step.id}
                      </span>
                      <span className="ml-4 flex min-w-0 flex-col">
                        <span className={`mt-0.5 text-xs font-semibold uppercase tracking-wider ${active ? "text-[#4f378a]" : "text-[#494551]"}`}>
                          {step.title}
                        </span>
                        <span className="text-sm text-[#494551]">{step.description}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {/* Wizard Content */}
        <section className="w-full max-w-3xl">
          {currentStep === 1 && <StepOne form={form} updateField={updateField} errors={fieldErrors} />}
          {currentStep === 2 && <StepTwo form={form} updateField={updateField} errors={fieldErrors} />}
          {currentStep === 3 && <StepThree form={form} updateField={updateField} errors={fieldErrors} />}
          {currentStep === 4 && (
            <StepFour
              form={form}
              updateField={updateField}
              submitted={submitted}
              resetWizard={resetWizard}
              existingId={existingId}
              navigate={navigate}
            />
          )}

          {/* Error banner */}
          {error && !submitted && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Navigation */}
          {!submitted && (
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={previousStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 rounded-lg border border-[#4f378a] px-6 py-3 text-sm font-semibold transition ${
                  currentStep === 1
                    ? "cursor-not-allowed opacity-40"
                    : "text-[#4f378a] hover:bg-[#f8f2fa]"
                }`}
              >
                <ArrowLeft size={18} />
                Previous
              </button>

              <button
                type="button"
                onClick={nextStep}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-[#4f378a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6750a4] disabled:opacity-60"
              >
                {saving ? (
                  <><Loader2 size={18} className="animate-spin" /> Saving…</>
                ) : currentStep === 4 ? (
                  <><CheckCircle2 size={18} /> {existingId ? "Update Profile" : "Submit Profile"}</>
                ) : (
                  <>Next Step <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* ============================================================
   PAGE HEADER (progress bar)
============================================================ */
function PageHeader({ step, title }) {
  const progress = step * 25;
  return (
    <>
      <div className="mb-8 flex items-center gap-3">
        <img src="/udyog-sanchar-icon.png" alt="UdyogSanchar" className="h-12 w-auto" />
        <div>
          <h1 className="text-2xl font-semibold">UdyogSanchar</h1>
          <p className="text-sm text-[#494551]">Step {step} of 4: {title}</p>
        </div>
      </div>
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-wider">
          <span className="text-[#494551]">Progress</span>
          <span className="text-[#4f378a]">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#e6e0e9]">
          <div
            className="h-full rounded-full bg-[#4f378a] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  );
}

/* ============================================================
   STEP 1 — Business Info & Location
============================================================ */
function StepOne({ form, updateField, errors }) {
  const ic = (field) => errors[field] ? inputErrorClass : inputClass;
  return (
    <>
      <PageHeader step={1} title="Business & Location" />

      <div className="overflow-hidden rounded-xl border border-[#cbc4d2] bg-white shadow-sm">
        <div className="p-6 md:p-8">
          {/* Entity Details */}
          <div className="mb-6">
            <h2 className="flex items-center gap-2 border-b border-[#cbc4d2] pb-4 text-2xl font-semibold">
              <Building2 className="text-[#4f378a]" size={24} />
              Entity Details
            </h2>
          </div>

          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className={labelClass}>
                Company / Enterprise Name <span className="text-red-500">*</span>
              </label>
              <input
                className={ic("companyName")}
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                placeholder="e.g. Acme Industries Ltd."
              />
              {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
            </div>

            {/* Sector */}
            <div>
              <label className={labelClass}>
                Industry Sector <span className="text-red-500">*</span>
                <Tooltip text="Select the sector that best describes your core operational activity." />
              </label>
              <select
                className={ic("sector")}
                value={form.sector}
                onChange={(e) => updateField("sector", e.target.value)}
              >
                <option value="">Select Primary Sector</option>
                {SECTORS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {errors.sector && <p className="mt-1 text-xs text-red-500">{errors.sector}</p>}
            </div>

            {/* Location Section */}
            <div className="pt-2">
              <h2 className="mb-6 flex items-center gap-2 border-b border-[#cbc4d2] pb-4 text-2xl font-semibold">
                <MapPin className="text-[#4f378a]" size={24} />
                Project Location
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* State */}
                <div>
                  <label className={labelClass}>
                    State / Union Territory <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={ic("state")}
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                </div>

                {/* District */}
                <div>
                  <label className={labelClass}>
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={ic("district")}
                    value={form.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    placeholder="e.g. Pune"
                  />
                  {errors.district && <p className="mt-1 text-xs text-red-500">{errors.district}</p>}
                </div>
              </div>

              {/* Project Location */}
              <div className="mt-6">
                <label className={labelClass}>
                  Exact Project Location / Plot Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={ic("projectLocation")}
                  rows={3}
                  value={form.projectLocation}
                  onChange={(e) => updateField("projectLocation", e.target.value)}
                  placeholder="Plot No, Industrial Estate Name, Village/City..."
                />
                {errors.projectLocation && <p className="mt-1 text-xs text-red-500">{errors.projectLocation}</p>}
              </div>

              {/* Pincode */}
              <div className="mt-6 w-full md:w-1/3">
                <label className={labelClass}>
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  className={ic("pincode")}
                  value={form.pincode}
                  onChange={(e) => updateField("pincode", e.target.value)}
                  maxLength={6}
                  placeholder="6-digit pincode"
                />
                {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   STEP 2 — Scale & Activity
============================================================ */
function StepTwo({ form, updateField, errors }) {
  const ic = (field) => errors[field] ? inputErrorClass : inputClass;
  return (
    <>
      <PageHeader step={2} title="Scale & Activity" />

      <div className="overflow-hidden rounded-xl border border-[#cbc4d2] bg-white shadow-sm">
        <div className="border-b border-[#cbc4d2] bg-[#f8f2fa] px-6 py-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Industry Profile</h2>
              <p className="text-sm text-[#494551]">Step 2: Scale & Activity</p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4f378a]">
              50% Completed
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Investment */}
            <div>
              <label className={labelClass}>
                Total Investment (INR in Lakhs)
                <Tooltip text="Total capital investment including land, building, plant & machinery in Lakhs INR." />
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#494551]">₹</span>
                <input
                  className={`${ic("investment")} pl-8`}
                  type="number"
                  min={0}
                  value={form.investment}
                  onChange={(e) => updateField("investment", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {errors.investment
                ? <p className="mt-1 text-xs text-red-500">{errors.investment}</p>
                : <p className="mt-1 text-sm text-[#494551]">Enter value in Lakhs.</p>}
            </div>

            {/* Employees */}
            <div>
              <label className={labelClass}>
                Number of Employees <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7582]" size={18} />
                <input
                  className={`${ic("employees")} pl-10`}
                  type="number"
                  min={0}
                  value={form.employees}
                  onChange={(e) => updateField("employees", e.target.value)}
                  placeholder="e.g. 250"
                />
              </div>
              {errors.employees && <p className="mt-1 text-xs text-red-500">{errors.employees}</p>}
            </div>

            {/* Production Capacity */}
            <div className="md:col-span-2">
              <label className={labelClass}>
                Annual Production Capacity <span className="text-red-500">*</span>
                <Tooltip text="Total output per year in selected units." />
              </label>
              <div className="flex">
                <input
                  className={`${ic("productionCapacity")} rounded-r-none`}
                  type="number"
                  min={0}
                  value={form.productionCapacity}
                  onChange={(e) => updateField("productionCapacity", e.target.value)}
                  placeholder="e.g. 10000"
                />
                <select
                  className="rounded-r-lg border border-l-0 border-[#cbc4d2] bg-[#f8f2fa] px-4 text-sm text-[#494551] outline-none"
                  value={form.capacityUnit}
                  onChange={(e) => updateField("capacityUnit", e.target.value)}
                >
                  <option>Tons</option>
                  <option>Units</option>
                  <option>Liters</option>
                  <option>Meters</option>
                  <option>KW</option>
                </select>
              </div>
              {errors.productionCapacity && <p className="mt-1 text-xs text-red-500">{errors.productionCapacity}</p>}
            </div>

            {/* Manufacturing Activity */}
            <div className="md:col-span-2">
              <label className={labelClass}>
                Primary Manufacturing Activity <span className="text-red-500">*</span>
                <Tooltip text="Describe the main product or service produced at this facility." />
              </label>
              <input
                className={ic("manufacturingActivity")}
                value={form.manufacturingActivity}
                onChange={(e) => updateField("manufacturingActivity", e.target.value)}
                placeholder="e.g. Steel rolling, Textile dyeing, Chemical synthesis..."
              />
              {errors.manufacturingActivity && <p className="mt-1 text-xs text-red-500">{errors.manufacturingActivity}</p>}
            </div>

            {/* Processes */}
            <div className="md:col-span-2">
              <label className={labelClass}>
                Key Manufacturing Processes <span className="text-red-500">*</span>
              </label>
              <textarea
                className={ic("processes")}
                rows={4}
                value={form.processes}
                onChange={(e) => updateField("processes", e.target.value)}
                placeholder="Briefly describe the core manufacturing or operational processes..."
              />
              {errors.processes
                ? <p className="mt-1 text-xs text-red-500">{errors.processes}</p>
                : <p className="mt-1 flex items-center text-sm text-[#494551]">
                    <Lightbulb size={14} className="mr-1" />
                    Provide a high-level overview of the production lifecycle.
                  </p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   STEP 3 — Environmental Impact
============================================================ */
function StepThree({ form, updateField, errors }) {
  const ic = (field) => errors[field] ? inputErrorClass : inputClass;
  return (
    <>
      <PageHeader step={3} title="Environmental Impact" />

      <div className="overflow-hidden rounded-xl border border-[#cbc4d2] bg-white shadow-sm">
        <div className="p-6 md:p-8">
          <div className="mb-8 border-b border-[#e6e0e9] pb-6">
            <h2 className="mb-2 flex items-center gap-3 text-2xl font-semibold">
              <Droplets className="text-[#4f378a]" size={26} />
              Environmental Impact Data
            </h2>
            <p className="text-base text-[#494551]">
              Provide accurate estimates for resource consumption and waste generation.
              This data is crucial for regulatory compliance and sustainability scoring.
            </p>
          </div>

          <div className="space-y-10">
            {/* Water Usage */}
            <section>
              <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                <Droplets className="text-[#63597c]" size={22} />
                Water Resource Management
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Daily Water Usage (Liters/Day) <span className="text-red-500">*</span>
                    <Tooltip text="Total volume of water consumed daily from all sources." />
                  </label>
                  <input
                    className={ic("waterUsage")}
                    type="number"
                    min={0}
                    value={form.waterUsage}
                    onChange={(e) => updateField("waterUsage", e.target.value)}
                    placeholder="e.g. 5000"
                  />
                  {errors.waterUsage
                    ? <p className="mt-1 text-xs text-red-500">{errors.waterUsage}</p>
                    : <span className="text-sm text-[#494551]">Total volume extracted from all sources.</span>}
                </div>

                <div>
                  <label className={labelClass}>Primary Water Source</label>
                  <select
                    className={inputClass}
                    value={form.waterSource}
                    onChange={(e) => updateField("waterSource", e.target.value)}
                  >
                    <option value="">Select Source</option>
                    <option value="municipal">Municipal Supply</option>
                    <option value="groundwater">Groundwater (Borewell)</option>
                    <option value="surface">Surface Water (River/Lake)</option>
                    <option value="recycled">Recycled/Treated</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Wastewater */}
            <section>
              <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                <Trash2 className="text-[#63597c]" size={22} />
                Wastewater Generation
              </h3>

              {/* Toggle */}
              <div className="mb-6 rounded-lg border border-[#e6e0e9] bg-[#f8f2fa] p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    className="h-4 w-4 accent-[#4f378a]"
                    type="checkbox"
                    checked={form.generatesWastewater}
                    onChange={(e) => updateField("generatesWastewater", e.target.checked)}
                  />
                  <span className="font-semibold">Facility generates industrial wastewater</span>
                </label>
              </div>

              {form.generatesWastewater && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-l-2 border-[#4f378a] pl-6">
                  <div>
                    <label className={labelClass}>
                      Daily Wastewater Volume (Liters/Day)
                    </label>
                    <input
                      className={ic("wastewater")}
                      type="number"
                      min={0}
                      value={form.wastewater}
                      onChange={(e) => updateField("wastewater", e.target.value)}
                      placeholder="e.g. 3500"
                    />
                    {errors.wastewater && <p className="mt-1 text-xs text-red-500">{errors.wastewater}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>
                      On-site Treatment Facility (ETP/STP)
                      <Tooltip text="An Effluent Treatment Plant (ETP) treats industrial wastewater. STP treats sewage water." />
                    </label>
                    <select
                      className={inputClass}
                      value={form.treatmentFacility}
                      onChange={(e) => updateField("treatmentFacility", e.target.value)}
                    >
                      <option value="none">No Facility</option>
                      <option value="etp">Effluent Treatment Plant (ETP)</option>
                      <option value="stp">Sewage Treatment Plant (STP)</option>
                      <option value="both">Both ETP & STP</option>
                    </select>
                  </div>
                </div>
              )}
            </section>

            {/* Hazardous Waste */}
            <section>
              <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                <AlertTriangle className="text-[#ba1a1a]" size={22} />
                Hazardous Waste Details
              </h3>

              <div className="mb-6 rounded-lg border border-[#e6e0e9] bg-[#f8f2fa] p-6">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    className="mt-1 h-4 w-4 accent-[#4f378a]"
                    type="checkbox"
                    checked={form.hazardousWaste}
                    onChange={(e) => updateField("hazardousWaste", e.target.checked)}
                  />
                  <span className="font-semibold">
                    Facility generates hazardous waste as per Schedule I/II.
                  </span>
                </label>
                <p className="ml-7 mt-2 text-sm text-[#494551]">
                  Check this box to expand hazardous material categories.
                </p>
              </div>

              {form.hazardousWaste && (
                <div className="space-y-6 border-l-2 border-[#4f378a] pl-6">
                  <div>
                    <label className={labelClass}>Waste Category (Authorization Required)</label>
                    <input
                      className={ic("wasteCategory")}
                      value={form.wasteCategory}
                      onChange={(e) => updateField("wasteCategory", e.target.value)}
                      placeholder="e.g. Used Oil, Chemical Sludge"
                    />
                    {errors.wasteCategory && <p className="mt-1 text-xs text-red-500">{errors.wasteCategory}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Annual Quantity (MTA)</label>
                      <input
                        className={inputClass}
                        type="number"
                        min={0}
                        value={form.wasteQty}
                        onChange={(e) => updateField("wasteQty", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Disposal Method</label>
                      <select
                        className={inputClass}
                        value={form.disposalMethod}
                        onChange={(e) => updateField("disposalMethod", e.target.value)}
                      >
                        <option value="">Select Method</option>
                        <option value="tsdf">Authorized TSDF</option>
                        <option value="coprocessing">Co-processing</option>
                        <option value="recycling">Authorized Recycler</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   STEP 4 — Project Stage
============================================================ */
function StepFour({ form, updateField, submitted, resetWizard, existingId, navigate }) {
  const stages = [
    { value: "Pre-establishment", title: "Pre-establishment", description: "Planning, land acquisition, design.",      icon: Palette    },
    { value: "construction",      title: "Construction",      description: "Active building phase.",                   icon: Hammer     },
    { value: "pre-operation",     title: "Pre-operation",     description: "Testing, trial runs, inspections.",        icon: ListChecks },
    { value: "operational",       title: "Operational",       description: "Full commercial production.",              icon: Factory    },
    { value: "expansion",         title: "Expansion / Modernization", description: "Modifying existing operations.",   icon: BarChart3  },
  ];

  if (submitted) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-[#cbc4d2] bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f8f2fa]">
          <CheckCircle2 size={44} className="text-[#4f378a]" />
        </div>

        <h2 className="mb-3 text-3xl font-semibold">
          Profile {existingId ? "Updated" : "Saved"} Successfully
        </h2>

        <p className="mx-auto mb-8 max-w-md text-base text-[#494551]">
          Your industrial profile has been securely saved. The system is ready to generate
          your tailored compliance and regulatory roadmap.
        </p>

        <button
          type="button"
          onClick={() => navigate("/analyze")}
          className="mx-auto flex items-center gap-2 rounded-lg bg-[#4f378a] px-8 py-3 font-bold text-white shadow-sm hover:bg-[#6750a4]"
        >
          <BarChart3 size={18} />
          Analyze My Project
        </button>

        <button
          type="button"
          onClick={resetWizard}
          className="mt-4 text-sm font-semibold text-[#4f378a] hover:underline block mx-auto"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <>
      <PageHeader step={4} title="Project Stage" />

      <div className="mb-8 text-center">
        <h2 className="mb-2 text-4xl font-bold">Project Stage</h2>
        <p className="text-lg text-[#494551]">
          Define the current lifecycle phase of your industrial project to tailor compliance requirements.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#cbc4d2] bg-white p-6 shadow-sm md:p-8">
        <h3 className="mb-6 border-b border-[#cbc4d2] pb-3 text-2xl font-semibold">
          Select Current Stage
        </h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {stages.map((stage) => {
            const Icon     = stage.icon;
            const selected = form.projectStage === stage.value;
            return (
              <label
                key={stage.value}
                className={`cursor-pointer rounded-lg border p-4 transition ${
                  selected
                    ? "border-[#4f378a] bg-[#f8f2fa] ring-1 ring-[#4f378a]"
                    : "border-[#cbc4d2] bg-white hover:bg-[#f8f2fa]"
                } ${stage.value === "expansion" ? "md:col-span-2" : ""}`}
              >
                <input
                  type="radio"
                  name="project_stage"
                  value={stage.value}
                  checked={selected}
                  onChange={(e) => updateField("projectStage", e.target.value)}
                  className="sr-only"
                />
                <span className="flex items-center gap-4">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    selected ? "bg-[#4f378a] text-white" : "bg-[#e6e0e9] text-[#494551]"
                  }`}>
                    <Icon size={20} />
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold">{stage.title}</span>
                    <span className="text-sm text-[#494551]">{stage.description}</span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default IndustryProfileWizard;
