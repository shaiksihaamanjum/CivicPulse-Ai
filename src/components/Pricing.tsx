import { useState } from "react";
import { CheckCircle2, ArrowRight, User, Building2, Globe, Loader2, Sparkles } from "lucide-react";

interface PlanDetails {
  title: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
}

const plans: Record<string, PlanDetails> = {
  citizen: {
    title: "Citizen Free",
    price: "₹0",
    period: "/forever",
    desc: "For every resident. Report civic issues, verify neighbor filings, earn CivicScore, and help secure your ward completely free, forever.",
    features: [
      "Unlimited Issue Reporting",
      "Voice Reporting in 50+ Languages",
      "Instant Live Synchronization",
      "CivicScore Achievements & Badges",
      "Real-time Local Issue Tracking",
    ],
    cta: "Start Reporting Free",
  },
  municipality: {
    title: "Municipality Pro",
    price: "₹4,999",
    period: "/month",
    desc: "For municipal bodies, ward offices, and town councils to manage, assign, track, and resolve civic complaints at scale.",
    features: [
      "Everything in Citizen Free",
      "Zonal Officer Command Dashboard",
      "Gemini AI Task Diagnostic Procedural Drafts",
      "Contractor Registry & Work Sliders",
      "Immutable Blockchain Log Audits",
      "AI Preventative Asset Degradation Alerts",
    ],
    cta: "Deploy for Zonal Area",
  },
  enterprise: {
    title: "Enterprise / State",
    price: "Custom",
    period: "pricing",
    desc: "For state developers, large municipal corporations, smart city projects, and NGOs managing thousands of reports across regions.",
    features: [
      "Everything in Municipality Pro",
      "Multi-city Zonal Administration",
      "Satellite Defect Identification Mapping",
      "Smart IoT Sensor Grid Feeds",
      "Direct API access & GIS export layers",
      "Dedicated 24/7 Priority SLA Support",
    ],
    cta: "Request Zonal Consultation",
  },
};

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<"citizen" | "municipality" | "enterprise">("citizen");
  const [deployingPlan, setDeployingPlan] = useState<string | null>(null);
  const [deployedPlan, setDeployedPlan] = useState<string | null>(null);

  const plan = plans[selectedPlan];

  const handleDeploy = (planTitle: string) => {
    setDeployingPlan(planTitle);
    setDeployedPlan(null);
    setTimeout(() => {
      setDeployingPlan(null);
      setDeployedPlan(planTitle);
    }, 1800);
  };

  return (
    <section id="pricing" className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-[#050505]">
      {/* Background neon blurs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[60%] h-[300px] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-4 mb-16 items-start lg:items-center">
        <span className="text-6xl sm:text-8xl text-white/5 font-display font-light leading-none tracking-tighter">03.</span>
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl text-white font-display font-medium tracking-tight">
            Plans for Every City
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed font-sans">
            Choose the plan that fits your role. Whether you're an individual resident or a major municipal administrator, we have a tier to streamline your civic execution.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left column: Plan Selectors */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Citizen Selector */}
          <button
            onClick={() => {
              setSelectedPlan("citizen");
              setDeployedPlan(null);
            }}
            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all text-left group cursor-pointer ${
              selectedPlan === "citizen"
                ? "bg-gradient-to-r from-orange-600 to-amber-500 border-orange-500 text-white shadow-xl shadow-orange-500/10"
                : "bg-white/5 border-white/5 text-neutral-300 hover:border-white/10 hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-center gap-3">
              <User className={`w-5 h-5 ${selectedPlan === "citizen" ? "text-white" : "text-neutral-400"}`} />
              <div>
                <span className="font-semibold block text-sm font-sans">Citizen Free</span>
                <span className="text-[10px] text-white/60 block font-sans">For individuals & local ward upvoters</span>
              </div>
            </div>
            <span className="text-sm font-display font-bold">₹0</span>
          </button>

          {/* Municipality Selector */}
          <button
            onClick={() => {
              setSelectedPlan("municipality");
              setDeployedPlan(null);
            }}
            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all text-left group cursor-pointer ${
              selectedPlan === "municipality"
                ? "bg-gradient-to-r from-orange-600 to-amber-500 border-orange-500 text-white shadow-xl shadow-orange-500/10"
                : "bg-white/5 border-white/5 text-neutral-300 hover:border-white/10 hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className={`w-5 h-5 ${selectedPlan === "municipality" ? "text-white" : "text-neutral-400"}`} />
              <div>
                <span className="font-semibold block text-sm font-sans">Municipality Pro</span>
                <span className="text-[10px] text-white/60 block font-sans">For municipal boards & regional officials</span>
              </div>
            </div>
            <span className="text-sm font-display font-bold">₹4,999</span>
          </button>

          {/* Enterprise Selector */}
          <button
            onClick={() => {
              setSelectedPlan("enterprise");
              setDeployedPlan(null);
            }}
            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all text-left group cursor-pointer ${
              selectedPlan === "enterprise"
                ? "bg-gradient-to-r from-orange-600 to-amber-500 border-orange-500 text-white shadow-xl shadow-orange-500/10"
                : "bg-white/5 border-white/5 text-neutral-300 hover:border-white/10 hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Globe className={`w-5 h-5 ${selectedPlan === "enterprise" ? "text-white" : "text-neutral-400"}`} />
              <div>
                <span className="font-semibold block text-sm font-sans">Enterprise / State</span>
                <span className="text-[10px] text-white/60 block font-sans">For smart city developers & state budgets</span>
              </div>
            </div>
            <span className="text-sm font-display font-bold">Custom</span>
          </button>

        </div>

        {/* Middle: Beautiful animated SVG Connector Lines */}
        <div className="hidden lg:block lg:col-span-2 h-[350px] relative">
          <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 160 300">
            {/* Top Connector */}
            <path
              d="M 0 50 Q 80 50 80 150 L 160 150"
              fill="none"
              stroke={selectedPlan === "citizen" ? "#f97316" : "#ffffff"}
              strokeWidth="2"
              className={`transition-all duration-300 ${
                selectedPlan === "citizen" ? "opacity-100" : "opacity-10"
              }`}
              strokeDasharray={selectedPlan === "citizen" ? "4 4" : "0"}
            />
            {/* Middle Connector */}
            <path
              d="M 0 150 L 160 150"
              fill="none"
              stroke={selectedPlan === "municipality" ? "#f97316" : "#ffffff"}
              strokeWidth="2"
              className={`transition-all duration-300 ${
                selectedPlan === "municipality" ? "opacity-100" : "opacity-10"
              }`}
              strokeDasharray={selectedPlan === "municipality" ? "4 4" : "0"}
            />
            {/* Bottom Connector */}
            <path
              d="M 0 250 Q 80 250 80 150 L 160 150"
              fill="none"
              stroke={selectedPlan === "enterprise" ? "#f97316" : "#ffffff"}
              strokeWidth="2"
              className={`transition-all duration-300 ${
                selectedPlan === "enterprise" ? "opacity-100" : "opacity-10"
              }`}
              strokeDasharray={selectedPlan === "enterprise" ? "4 4" : "0"}
            />

            {/* Glowing active node marker */}
            <circle cx="160" cy="150" r="3" fill="#f97316" className="animate-pulse" />
          </svg>
        </div>

        {/* Right column: Selected Plan detailed spec card */}
        <div className="lg:col-span-5 h-full">
          <div className="bg-[#0A0A0A] border border-orange-500/20 rounded-[32px] p-[2px] shadow-2xl relative overflow-hidden h-full">
            {/* Outer animated border glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500 to-amber-500 opacity-20 z-0"></div>

            <div className="relative z-10 bg-[#0A0A0A] rounded-[30px] p-6 sm:p-8 h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-full h-40 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none"></div>

              <div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h3 className="text-2xl font-display font-light text-white tracking-tight">
                    {plan.title}
                  </h3>
                  <div className="text-right">
                    <span className="text-2xl font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-400">
                      {plan.price}
                    </span>
                    <span className="text-[10px] text-neutral-500 block uppercase tracking-widest font-sans font-semibold">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6 border-b border-white/5 pb-6">
                  {plan.desc}
                </p>

                {/* Features Checklist */}
                <div className="space-y-3.5 mb-8">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 group/item">
                      <CheckCircle2 className="w-4.5 h-4.5 text-orange-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                      <span className="text-xs text-neutral-300 font-medium font-sans leading-relaxed group-hover/item:text-neutral-200 transition-colors">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deployment / Activation Feedback overlay */}
              {deployedPlan === plan.title && (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-xs text-neutral-200 font-sans mb-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Smart-Contract Ledger Deployed!</span>
                    Successfully activated <strong className="text-orange-400">{plan.title}</strong> nodes on the Polygon gasless ledger for Kurla Sector.
                  </div>
                </div>
              )}

              {/* CTA Trigger */}
              <button
                onClick={() => handleDeploy(plan.title)}
                disabled={deployingPlan !== null}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:brightness-110 text-white font-sans font-medium text-xs transition-all duration-300 shadow-[0_8px_25px_-5px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 group/cta border-t border-white/20 cursor-pointer disabled:opacity-50"
              >
                {deployingPlan === plan.title ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    Deploying Smart Contract Nodes...
                  </>
                ) : (
                  <>
                    {deployedPlan === plan.title ? "Redeploy Ledger Node" : plan.cta}
                    <ArrowRight className="w-4 h-4 text-white/80 transition-transform group-hover/cta:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
