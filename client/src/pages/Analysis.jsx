import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Factory,
  CheckCircle2,
  XCircle,
  Loader2,
  BarChart3,
  ShieldCheck,
  MapPin,
  Leaf,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import api from "../api/api";

// ── Analysis steps shown to the user ─────────────────────────────────────────
const ANALYSIS_STEPS = [
  { id: 1, label: "Loading Industry Profile",        icon: Factory,       duration: 800  },
  { id: 2, label: "Analysing Sector & Activity",     icon: BarChart3,     duration: 1000 },
  { id: 3, label: "Checking State-Level Rules",      icon: MapPin,        duration: 1100 },
  { id: 4, label: "Evaluating Environmental Impact", icon: Leaf,          duration: 1000 },
  { id: 5, label: "Applying Regulatory Framework",   icon: ShieldCheck,   duration: 900  },
  { id: 6, label: "Building Approval Roadmap",       icon: ClipboardList, duration: 700  },
];

const STEP_DONE    = "done";
const STEP_ACTIVE  = "active";
const STEP_PENDING = "pending";
const STEP_ERROR   = "error";

export default function Analysis() {
  const navigate = useNavigate();

  const [stepStates, setStepStates] = useState(
    ANALYSIS_STEPS.map(() => STEP_PENDING)
  );
  const [currentStep, setCurrentStep] = useState(0); // index
  const [error, setError]             = useState("");
  const [industryId, setIndustryId]   = useState(null);
  const [resultCount, setResultCount] = useState(null);
  const ran = useRef(false);

  // ── Fetch industry profile then run analysis ──────────────────────────────
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    runAnalysis();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const markStep = (index, state) =>
    setStepStates((prev) => {
      const next = [...prev];
      next[index] = state;
      return next;
    });

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const runAnalysis = async () => {
    try {
      // ── Step 0: Load profile ──────────────────────────────────────────
      setCurrentStep(0);
      markStep(0, STEP_ACTIVE);
      await delay(ANALYSIS_STEPS[0].duration);

      const indRes = await api.get("/industries/me");
      const profile = indRes.data?.data;

      if (!profile || !profile._id) {
        markStep(0, STEP_ERROR);
        setError("Industry profile not found. Please complete the wizard first.");
        return;
      }

      setIndustryId(profile._id);
      markStep(0, STEP_DONE);

      // ── Steps 1–4: Animated visual only ──────────────────────────────
      for (let i = 1; i <= 4; i++) {
        setCurrentStep(i);
        markStep(i, STEP_ACTIVE);
        await delay(ANALYSIS_STEPS[i].duration);
        markStep(i, STEP_DONE);
      }

      // ── Step 5: Actual API call ───────────────────────────────────────
      setCurrentStep(5);
      markStep(5, STEP_ACTIVE);

      const analysisRes = await api.post("/approvals/analyze", {
        industryId: profile._id,
      });

      await delay(ANALYSIS_STEPS[5].duration);

      if (!analysisRes.data?.success) {
        markStep(5, STEP_ERROR);
        setError("Analysis failed. Please try again.");
        return;
      }

      setResultCount(analysisRes.data.data?.length ?? 0);
      markStep(5, STEP_DONE);

      // ── Short pause then redirect to roadmap ─────────────────────────
      await delay(900);
      navigate(`/roadmap/${profile._id}`);
    } catch (err) {
      const idx = stepStates.findIndex((s) => s === STEP_ACTIVE);
      if (idx !== -1) markStep(idx, STEP_ERROR);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unexpected error during analysis.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  const allDone = stepStates.every((s) => s === STEP_DONE);

  return (
    <div className="min-h-screen bg-[#fdf7ff] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-[#cbc4d2] bg-white px-6 py-4">
        <img src="/udyog-sanchar-icon.png" alt="UdyogSanchar" className="h-10 w-auto" />
        <span className="text-lg font-bold text-[#1d1b20]">UdyogSanchar</span>
      </header>

      {/* Body */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">

          {/* Title */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ebff]">
              {error ? (
                <AlertTriangle className="h-8 w-8 text-red-500" />
              ) : allDone ? (
                <CheckCircle2 className="h-8 w-8 text-[#4f378a]" />
              ) : (
                <Loader2 className="h-8 w-8 animate-spin text-[#4f378a]" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-[#1d1b20]">
              {error
                ? "Analysis Failed"
                : allDone
                ? `Found ${resultCount} Applicable Approval${resultCount === 1 ? "" : "s"}`
                : "Analysing Your Profile"}
            </h1>
            <p className="mt-2 text-sm text-[#494551]">
              {error
                ? "Something went wrong. Please try again."
                : allDone
                ? "Redirecting to your Approval Roadmap…"
                : "Please wait while we evaluate applicable regulatory requirements."}
            </p>
          </div>

          {/* Step list */}
          <div className="rounded-xl border border-[#cbc4d2] bg-white p-6 shadow-sm space-y-1">
            {ANALYSIS_STEPS.map((step, i) => {
              const state = stepStates[i];
              const Icon  = step.icon;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all duration-300 ${
                    state === STEP_ACTIVE
                      ? "bg-[#f0ebff]"
                      : state === STEP_DONE
                      ? "bg-transparent"
                      : "bg-transparent opacity-40"
                  }`}
                >
                  {/* Left icon */}
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                      state === STEP_DONE
                        ? "bg-[#4f378a] text-white"
                        : state === STEP_ACTIVE
                        ? "bg-[#cfbcff] text-[#4f378a]"
                        : state === STEP_ERROR
                        ? "bg-red-100 text-red-500"
                        : "bg-[#e6e0e9] text-[#7a7582]"
                    }`}
                  >
                    <Icon size={18} />
                  </span>

                  {/* Label */}
                  <span
                    className={`flex-1 text-sm font-medium transition-colors duration-300 ${
                      state === STEP_DONE
                        ? "text-[#1d1b20]"
                        : state === STEP_ACTIVE
                        ? "text-[#4f378a] font-semibold"
                        : state === STEP_ERROR
                        ? "text-red-600"
                        : "text-[#7a7582]"
                    }`}
                  >
                    {step.label}
                  </span>

                  {/* Right status icon */}
                  <span className="shrink-0">
                    {state === STEP_DONE && (
                      <CheckCircle2 size={18} className="text-[#4f378a]" />
                    )}
                    {state === STEP_ACTIVE && (
                      <Loader2 size={18} className="animate-spin text-[#4f378a]" />
                    )}
                    {state === STEP_ERROR && (
                      <XCircle size={18} className="text-red-500" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          {!error && (
            <div className="mt-6">
              <div className="mb-1 flex justify-between text-xs text-[#494551]">
                <span>Progress</span>
                <span>
                  {Math.round(
                    (stepStates.filter((s) => s === STEP_DONE).length /
                      ANALYSIS_STEPS.length) *
                      100
                  )}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e6e0e9]">
                <div
                  className="h-full rounded-full bg-[#4f378a] transition-all duration-500"
                  style={{
                    width: `${
                      (stepStates.filter((s) => s === STEP_DONE).length /
                        ANALYSIS_STEPS.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Error actions */}
          {error && (
            <div className="mt-6 space-y-3">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStepStates(ANALYSIS_STEPS.map(() => STEP_PENDING));
                    setCurrentStep(0);
                    ran.current = false;
                    runAnalysis();
                  }}
                  className="flex-1 rounded-lg bg-[#4f378a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6750a4]"
                >
                  Retry Analysis
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/wizard")}
                  className="flex-1 rounded-lg border border-[#4f378a] px-4 py-2 text-sm font-semibold text-[#4f378a] hover:bg-[#f8f2fa]"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
