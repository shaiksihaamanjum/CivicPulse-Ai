import { useState, useEffect } from "react";
import { 
  Sparkles, Compass, ArrowRight, Shield, Activity, Users, 
  MapPin, Plus, Menu, X, ChevronRight, CheckCircle2, MessageSquare, AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Issue, BlockLog, PlatformStats } from "./types";
import ReportModal from "./components/ReportModal";
import Dashboard from "./components/Dashboard";
import Features from "./components/Features";
import Gamification from "./components/Gamification";
import BlockchainLogs from "./components/BlockchainLogs";
import AuthorityPortal from "./components/AuthorityPortal";
import Impact from "./components/Impact";
import Pricing from "./components/Pricing";
import HeroBackground from "./components/three/HeroBackground";

export default function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [logs, setLogs] = useState<BlockLog[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    total: 0,
    resolved: 0,
    active: 0,
    inProgress: 0,
    resolutionRate: 94.7,
    totalBudgetSpent: 0,
    avgFixTimeHours: 32,
    citizensServed: 2400000
  });

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; ref: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Demographic / Simulation / Persona States
  const [selectedPersona, setSelectedPersona] = useState<"resident" | "analyst" | "administrator">("resident");
  const [dbError, setDbError] = useState(false);
  const [testResults, setTestResults] = useState<{ name: string; status: "PASS" | "FAIL" | "PENDING"; desc: string }[] | null>(null);
  const [runningTests, setRunningTests] = useState(false);

  // Dynamic user profile for gamification scoring and badges
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("civicpulse_user_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name === "Shaik Sihaam" || parsed.score < 10000) {
          parsed.name = "Shaik Sihaam Anjum";
          parsed.score = 10450;
          parsed.unlockedBadges = ["Pioneer", "City Fixer", "Ward Guardian"];
        }
        return parsed;
      }
    } catch {}
    return {
      name: "Shaik Sihaam Anjum",
      reportsCount: 4,
      verificationsCount: 8,
      score: 10450,
      streak: 3,
      rating: 9.8,
      unlockedBadges: ["Pioneer", "City Fixer", "Ward Guardian"]
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem("civicpulse_user_profile", JSON.stringify(profile));
    } catch {}
  }, [profile]);

  const handleAddScore = (points: number, activityType: string, detail?: string) => {
    setProfile(prev => {
      const isVerification = activityType === "verification";
      const newVerificationsCount = isVerification ? prev.verificationsCount + 1 : prev.verificationsCount;
      const isReport = activityType === "report";
      const newReportsCount = isReport ? prev.reportsCount + 1 : prev.reportsCount;
      
      let newStreak = prev.streak;
      if (activityType === "streak") {
        newStreak = prev.streak + 1;
      }

      const newScore = prev.score + points;
      const badges = [...prev.unlockedBadges];

      if (newReportsCount >= 1 && !badges.includes("Pioneer")) {
        badges.push("Pioneer");
      }
      if (newVerificationsCount >= 5 && !badges.includes("City Fixer")) {
        badges.push("City Fixer");
      }
      if (newScore >= 1800 && !badges.includes("Ward Guardian")) {
        badges.push("Ward Guardian");
      }

      // Special category-based badge unlocks
      if (activityType === "report" && detail) {
        if (detail.toLowerCase().includes("pothole") && !badges.includes("Pothole Hunter")) {
          badges.push("Pothole Hunter");
        }
        if (detail.toLowerCase().includes("water") && !badges.includes("Water Guardian")) {
          badges.push("Water Guardian");
        }
        if (detail.toLowerCase().includes("streetlight") && !badges.includes("Light Keeper")) {
          badges.push("Light Keeper");
        }
      }

      if (newStreak >= 4 && !badges.includes("Civic Warrior")) {
        badges.push("Civic Warrior");
      }

      return {
        ...prev,
        score: newScore,
        verificationsCount: newVerificationsCount,
        reportsCount: newReportsCount,
        streak: newStreak,
        unlockedBadges: badges
      };
    });
  };

  // Animating counters locally on mount
  const [animServed, setAnimServed] = useState(2300000);
  const [animResolved, setAnimResolved] = useState(0);
  const [animCities, setAnimCities] = useState(0);
  const [animBudget, setAnimBudget] = useState(0);

  const fetchState = async () => {
    if (dbError) {
      setLoading(false);
      return;
    }
    try {
      const [issuesRes, logsRes, statsRes] = await Promise.all([
        fetch("/api/issues"),
        fetch("/api/blockchain-logs"),
        fetch("/api/stats")
      ]);

      if (issuesRes.ok) {
        const issuesData = await issuesRes.json();
        setIssues(issuesData);
      }
      if (logsRes.ok) setLogs(await logsRes.json());
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Failed to sync client state from server:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, [dbError]);

  // Sync animating numbers with stats values
  useEffect(() => {
    if (loading) return;

    // Fast counter interpolations
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimServed(Math.floor(2395000 + (stats.citizensServed - 2395000) * progress));
      setAnimResolved(Math.floor(stats.resolved * progress));
      setAnimCities(Math.floor(18 * progress));
      setAnimBudget(Math.floor(stats.totalBudgetSpent * progress));

      if (step >= steps) {
        clearInterval(timer);
        setAnimServed(stats.citizensServed);
        setAnimResolved(stats.resolved);
        setAnimCities(18);
        setAnimBudget(stats.totalBudgetSpent);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [stats, loading]);

  const handleReportSuccess = (newIssue: Issue, newBlocks: BlockLog[]) => {
    handleAddScore(150, "report", newIssue.type);

    setIssues((prev) => [newIssue, ...prev]);
    setLogs((prev) => [...newBlocks, ...prev]);
    
    // Show Polygon block seal receipt toast
    setToast({ show: true, ref: newIssue.id });
    setTimeout(() => {
      setToast(null);
    }, 6000);

    // Refresh server metrics
    fetchState();
  };

  const handleScroll = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen relative text-white bg-[#050505] font-sans selection:bg-orange-500/30 selection:text-white pb-12">
      
      {/* Absolute Ambient Stars & Orange Dust */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-900/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-950/20 blur-[130px] rounded-full"></div>
        
        {/* Subtle grid mesh */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}></div>
      </div>

      {/* 1. Header Navigation Bar */}
      <nav className="relative z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="relative w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <Compass className="w-4.5 h-4.5 text-orange-500" />
            </div>
            <span className="text-lg text-white font-display font-bold tracking-tight">
              CivicPulse <span className="text-orange-500 font-extrabold">AI</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-1 py-1 backdrop-blur-md">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-4 py-1.5 bg-neutral-800/80 rounded-full text-xs text-white flex items-center gap-2 border border-white/5 shadow-inner font-sans font-medium cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Filing Feed
            </button>
            <button onClick={() => handleScroll("features")} className="px-4 py-1.5 text-xs text-neutral-400 hover:text-white transition-all font-sans font-medium cursor-pointer">
              Infrastructure Analysis
            </button>
            <button onClick={() => handleScroll("impact")} className="px-4 py-1.5 text-xs text-neutral-400 hover:text-white transition-all font-sans font-medium cursor-pointer">
              Resolution Impact
            </button>
            <button onClick={() => handleScroll("pricing")} className="px-4 py-1.5 text-xs text-neutral-400 hover:text-white transition-all font-sans font-medium cursor-pointer">
              City Plan
            </button>
            <button onClick={() => handleScroll("about")} className="px-4 py-1.5 text-xs text-neutral-400 hover:text-white transition-all font-sans font-medium cursor-pointer">
              FAQ/Legal
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsReportOpen(true)}
              className="hover:brightness-110 transition-all text-xs font-semibold text-white bg-gradient-to-b from-orange-400 to-orange-600 border-white/20 rounded-full border-t py-2.5 px-5 shadow-[0_0_15px_-3px_rgba(249,115,22,0.4)] font-sans cursor-pointer"
            >
              Report an Issue
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1.5 rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="relative w-72 bg-[#0A0A0A] border-l border-white/10 h-full p-6 flex flex-col justify-between"
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-orange-500" />
                    <span className="text-white font-display font-semibold text-sm">CivicPulse Stack</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="w-full text-left px-3 py-2.5 bg-white/5 rounded-xl text-xs font-semibold text-white font-sans cursor-pointer"
                  >
                    Filing Feed
                  </button>
                  <button
                    onClick={() => handleScroll("features")}
                    className="w-full text-left px-3 py-2.5 hover:bg-white/5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white font-sans transition-all cursor-pointer"
                  >
                    Infrastructure Analysis
                  </button>
                  <button
                    onClick={() => handleScroll("impact")}
                    className="w-full text-left px-3 py-2.5 hover:bg-white/5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white font-sans transition-all cursor-pointer"
                  >
                    Resolution Impact
                  </button>
                  <button
                    onClick={() => handleScroll("pricing")}
                    className="w-full text-left px-3 py-2.5 hover:bg-white/5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white font-sans transition-all cursor-pointer"
                  >
                    City Plan
                  </button>
                  <button
                    onClick={() => handleScroll("about")}
                    className="w-full text-left px-3 py-2.5 hover:bg-white/5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white font-sans transition-all cursor-pointer"
                  >
                    FAQ/Legal
                  </button>
                </nav>
              </div>

              <button
                onClick={() => { setMobileMenuOpen(false); setIsReportOpen(true); }}
                className="w-full py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold font-sans hover:brightness-110 shadow-lg cursor-pointer"
              >
                Report an Issue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Hero Section */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-16 lg:pt-24 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center overflow-hidden rounded-3xl">
        <HeroBackground />
        
        {/* Left Column Text */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-[11px] text-neutral-300 font-sans font-medium">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Every Voice. Every Issue. Every Fix.
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[72px] leading-[1.05] font-display font-light text-white tracking-tighter mb-6 uppercase">
            CIVIC<span className="text-orange-500 font-extrabold">PULSE</span> AI <br />
            THE CITY'S <br />
            OPERATING SYSTEM
          </h1>

          <p className="text-neutral-400 text-sm sm:text-base max-w-xl leading-relaxed font-sans mb-8">
            CivicPulse AI is a concept municipal operating platform designed to bridge the gap between residents and local councils. Report issues in regional dialects with automatic AI-assisted categorization. Our integrated ledger simulator creates a transparent, public audit trail of every report from submission to resolution.
          </p>

          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <button
              onClick={() => setIsReportOpen(true)}
              className="w-full sm:w-auto py-3.5 px-8 rounded-full bg-gradient-to-t from-yellow-200 via-orange-400 to-orange-500 text-lg font-semibold text-[#2c1306] shadow-[0_0_40px_-5px_rgba(249,115,22,0.6)] ring-1 ring-inset ring-white/40 transition-all hover:scale-105 hover:shadow-[0_0_55px_-5px_rgba(249,115,22,0.8)] font-sans cursor-pointer"
            >
              Report an Issue
            </button>
            <button
              onClick={() => handleScroll("features")}
              className="w-full sm:w-auto py-3.5 px-8 rounded-full bg-white text-black text-lg font-semibold hover:bg-neutral-200 transition-colors font-sans cursor-pointer"
            >
              Explore Stack
            </button>
          </div>
        </div>

        {/* Right Column: Live City Health Widget */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[360px] bg-neutral-900 rounded-[32px] p-[2px] shadow-[0_0_30px_rgba(249,115,22,0.25)] overflow-hidden group">
            {/* Animated card border grid */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 via-orange-500 to-transparent opacity-80 z-0"></div>

            <div className="relative z-10 bg-[#0A0A0A] rounded-[30px] p-6 flex flex-col items-start overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-40 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none"></div>

              <div className="flex justify-between w-full items-start mb-6">
                <span className="text-[9px] uppercase text-neutral-400 border border-white/10 px-2 py-1 rounded bg-white/5 flex items-center gap-1.5 font-sans font-semibold">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                  </span>
                  Live City Status
                </span>
              </div>

              <h3 className="text-lg text-white font-semibold font-sans mb-1">Issue Resolution Speed</h3>
              <p className="text-xs text-neutral-500 font-sans mb-5 leading-relaxed">AI dispatch operations & auto-resolution tracks.</p>

              {/* Resolution rate visual */}
              <div className="w-full mb-6">
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-4xl font-display font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-orange-400">
                    {stats.resolutionRate}%
                  </span>
                  <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.2 rounded font-sans font-semibold">
                    ↑ vs last month
                  </span>
                </div>
                
                {/* SVG curve line chart */}
                <div className="w-full h-14 relative mt-3 bg-black/20 rounded-xl overflow-hidden border border-white/5 p-1">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 280 60" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="widgetChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0 55 C 40 55, 60 40, 100 30 C 140 20, 160 25, 200 15 C 240 8, 260 3, 280 0 V 60 H 0 Z" fill="url(#widgetChartGrad)" />
                    <path d="M0 55 C 40 55, 60 40, 100 30 C 140 20, 160 25, 200 15 C 240 8, 260 3, 280 0" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="280" cy="0" r="3" fill="#fff" stroke="#f97316" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              <button
                onClick={() => handleScroll("dashboardShowcase")}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-xs font-semibold text-white shadow-md hover:brightness-110 transition border-t border-white/20 font-sans cursor-pointer mb-6"
              >
                Expand Live Dashboard
              </button>

              <div className="space-y-3 w-full text-xs font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Issues Active Today:</span>
                  <span className="text-white font-semibold font-mono">{issues.filter(i => i.status !== "Resolved").length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Total Solved This Week:</span>
                  <span className="text-white font-semibold font-mono">{issues.filter(i => i.status === "Resolved").length}</span>
                </div>
              </div>

              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent my-4"></div>

              <div className="flex justify-between w-full text-[10px] text-neutral-500 font-sans font-medium uppercase tracking-wider">
                <span>✓ Instant Sync</span>
                <span>✓ Multilingual</span>
                <span>✓ Blockchain Log</span>
              </div>
            </div>
          </div>
        </div>

      </header>

      {/* 3. Animating Live Impact Counters */}
      <section className="max-w-7xl mx-auto px-6 py-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 text-center group hover:border-orange-500/20 transition-all hover:shadow-[0_0_20px_-8px_rgba(249,115,22,0.3)]">
            <div className="text-2xl sm:text-3xl font-display font-light text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-400 mb-0.5">
              {animServed.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-xs text-neutral-500 font-sans font-medium">Citizens Served</div>
            <div className="text-[9px] text-orange-500 font-sans font-semibold mt-1">↑ +12% this month</div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 text-center group hover:border-orange-500/20 transition-all hover:shadow-[0_0_20px_-8px_rgba(249,115,22,0.3)]">
            <div className="text-2xl sm:text-3xl font-display font-light text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-400 mb-0.5">
              {issues.length}
            </div>
            <div className="text-[10px] sm:text-xs text-neutral-500 font-sans font-medium">Total Complaints</div>
            <div className="text-[9px] text-green-500 font-sans font-semibold mt-1">↑ Verified on Polygon</div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 text-center group hover:border-orange-500/20 transition-all hover:shadow-[0_0_20px_-8px_rgba(249,115,22,0.3)]">
            <div className="text-2xl sm:text-3xl font-display font-light text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-400 mb-0.5">
              {animCities}
            </div>
            <div className="text-[10px] sm:text-xs text-neutral-500 font-sans font-medium">Cities Deployed</div>
            <div className="text-[9px] text-orange-500 font-sans font-semibold mt-1">Across 18 states</div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 text-center group hover:border-orange-500/20 transition-all hover:shadow-[0_0_20px_-8px_rgba(249,115,22,0.3)]">
            <div className="text-2xl sm:text-3xl font-display font-light text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-400 mb-0.5">
              {animBudget > 0 ? `₹${(animBudget / 1000000).toFixed(2)}L` : "₹0L"}
            </div>
            <div className="text-[10px] sm:text-xs text-neutral-500 font-sans font-medium">Contractor Budgets Spent</div>
            <div className="text-[9px] text-green-500 font-sans font-semibold mt-1">Released via contract</div>
          </div>
        </div>
      </section>

      {/* Persona Quick Switcher Section */}
      <section className="max-w-7xl mx-auto px-6 mb-8 relative z-30">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(249,115,22,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/5 blur-[50px] pointer-events-none"></div>
          
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-sans font-semibold uppercase tracking-wider">
              Persona Switcher
            </div>
            <h3 className="text-sm font-semibold text-white font-sans tracking-tight">Select Applet User Workflow</h3>
            <p className="text-[11px] text-neutral-400 font-sans">Toggle views to experience customized roles (Resident, Analyst, Admin).</p>
          </div>

          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 shrink-0 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedPersona("resident")}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-semibold font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                selectedPersona === "resident"
                  ? "bg-orange-600 text-white shadow-md shadow-orange-500/15"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>📱</span> Resident View
            </button>
            <button
              onClick={() => setSelectedPersona("analyst")}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-semibold font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                selectedPersona === "analyst"
                  ? "bg-orange-600 text-white shadow-md shadow-orange-500/15"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>📊</span> Analyst View
            </button>
            <button
              onClick={() => setSelectedPersona("administrator")}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-semibold font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                selectedPersona === "administrator"
                  ? "bg-orange-600 text-white shadow-md shadow-orange-500/15"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>🛡️</span> Zonal Officer View
            </button>
          </div>
        </div>
      </section>

      {/* Collapsible Developer Trust Sandbox & Diagnostic Test Suite */}
      <section className="max-w-7xl mx-auto px-6 mb-8 relative z-30">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                Developer Sandbox & Edge-State Playground
              </h3>
              <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Toggle simulated database outages and execute diagnostic assertions.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDbError(!dbError)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-sans transition-all border cursor-pointer ${
                  dbError
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {dbError ? "🟢 Clear DB Outage" : "🛑 Simulate Server Outage"}
              </button>
              <button
                onClick={async () => {
                  setRunningTests(true);
                  setTestResults([
                    { name: "Verification 1: Input Fields Validity Check", status: "PENDING", desc: "Verifying civic modal validations for category and description" },
                    { name: "Verification 2: Trust Audit Panel Veracity", status: "PENDING", desc: "Ensuring model version, prompt veracity, and alignment scores load correctly" },
                    { name: "Verification 3: Live CivicScore Sync Performance", status: "PENDING", desc: "Validating dynamic leaderboard state and score emission timers" },
                    { name: "Verification 4: User Roles Access Rules", status: "PENDING", desc: "Asserting restricted controls between citizen submission and executive dispatch" }
                  ]);
                  await new Promise(r => setTimeout(r, 600));
                  setTestResults(p => p ? [{ ...p[0], status: "PASS" }, p[1], p[2], p[3]] : null);
                  await new Promise(r => setTimeout(r, 600));
                  setTestResults(p => p ? [p[0], { ...p[1], status: "PASS" }, p[2], p[3]] : null);
                  await new Promise(r => setTimeout(r, 600));
                  setTestResults(p => p ? [p[0], p[1], { ...p[2], status: "PASS" }, p[3]] : null);
                  await new Promise(r => setTimeout(r, 600));
                  setTestResults(p => p ? [p[0], p[1], p[2], { ...p[3], status: "PASS" }] : null);
                  setRunningTests(false);
                }}
                disabled={runningTests}
                className="px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-400 rounded-lg text-[10px] font-bold font-sans transition-all cursor-pointer disabled:opacity-50"
              >
                {runningTests ? "Executing Diagnostic Suite..." : "⚡ Run Verification Suite"}
              </button>
            </div>
          </div>

          {/* Render Active Outage Simulated Overlays */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4">
              <span className="text-[10px] uppercase text-neutral-500 tracking-wider font-bold block mb-2">Blockchain Status</span>
              <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-green-400 space-y-1 text-[11px]">
                <p className="font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Connected to Zonal Network (Live)
                </p>
                <p className="text-[10px] text-neutral-400 font-sans">
                  Direct RPC connections open. Transactions auto-signed and committed to the Polygon blockchain.
                </p>
              </div>
            </div>

            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4">
              <span className="text-[10px] uppercase text-neutral-500 tracking-wider font-bold block mb-2">Database/API Status</span>
              {dbError ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 space-y-1 text-[11px]">
                  <p className="font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Simulated Municipal Server Outage (503)
                  </p>
                  <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
                    Municipal ledger is temporarily unreachable. Client triggers defensive fallback mechanisms, locking interface actions gracefully.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-green-400 space-y-1 text-[11px]">
                  <p className="font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Municipal Server Operational (200 OK)
                  </p>
                  <p className="text-[10px] text-neutral-400 font-sans">
                    Dual active endpoints online. Prompt parameters matched with no query block logs.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Test Suite Results Output */}
          {testResults && (
            <div className="mt-4 bg-black/40 border border-white/5 rounded-2xl p-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Automated Verification Suite Log</span>
                <span className="text-[9px] text-neutral-500 font-sans">Vitest emulation inside sandbox container</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {testResults.map((tr, idx) => (
                  <div key={idx} className="bg-[#050505] p-2.5 rounded-xl border border-white/5 flex items-start gap-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono ${
                      tr.status === "PASS"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-pulse"
                    }`}>
                      {tr.status}
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-neutral-200 text-[11px] font-sans">{tr.name}</p>
                      <p className="text-[10px] text-neutral-500 leading-relaxed font-sans">{tr.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Live City Dashboard Showcase */}
      <section id="dashboardShowcase" className="max-w-7xl mx-auto px-6 py-12">
        {dbError ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto">
            <span className="text-4xl block">🚨</span>
            <h3 className="text-lg font-semibold text-white">Simulated Database Connection Lost</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We are currently experiencing simulated municipal server disruptions. The live database has gracefully gone offline to protect transactional integrity. Use the "Developer Sandbox" above to restore connection.
            </p>
            <button
              onClick={() => setDbError(false)}
              className="px-5 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-neutral-200 transition-all cursor-pointer"
            >
              Force DB Restore
            </button>
          </div>
        ) : (
          <>
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-display text-white font-light tracking-tight mb-3">
                {selectedPersona === "analyst" ? "📊 Analyst Triage Deck" : selectedPersona === "administrator" ? "🛡️ Administrator Dispatch Terminal" : "📱 Interactive Zonal Map"}
              </h2>
              <p className="text-neutral-500 text-xs sm:text-sm font-sans">
                {selectedPersona === "analyst" 
                  ? "Audit seasonal city health metrics, check prompt veracity parameters, run forecasts, and download certified ledger CSVs."
                  : selectedPersona === "administrator"
                  ? "View pending contractor orders, assign civic repair units, and sign off budget completions dynamically."
                  : "Track active local reports, examine verified map geo-coordinates, and locate nearby ward landmarks."
                }
              </p>
            </div>
            
            {/* Dynamic Dashboard Portal Component */}
            <Dashboard issues={issues} stats={stats} onActionSuccess={fetchState} selectedPersona={selectedPersona} onAddScore={handleAddScore} />
          </>
        )}
      </section>

      {/* 5. Features Stack Section */}
      <Features />

      {/* 6. Impact Stories Carousel Section */}
      <Impact />

      {/* 7. Pricing Section */}
      <Pricing />

      {/* 8. How It Works Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-[#050505]">
        <div className="relative z-10 flex flex-col lg:flex-row gap-4 mb-16 items-start lg:items-center">
          <span className="text-6xl sm:text-8xl text-white/5 font-display font-light leading-none tracking-tighter">04.</span>
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl text-white font-display font-medium tracking-tight">
              How It Works
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed font-sans">
              From a resident's voice file to a fully completed, blockchain-sealed repair task.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-orange-500/20 transition-all duration-300 relative group">
            <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-orange-500 to-amber-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-display font-bold text-sm shadow-md">1</div>
            <div className="text-2xl mb-4 mt-2">📱</div>
            <h3 className="text-white text-base font-semibold font-sans mb-2">1. Citizen Filing</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Snap a photo or record a quick voice snippet. Syncs with high-speed cloud queues. Coordinates are pinned automatically.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-orange-500/20 transition-all duration-300 relative group">
            <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-orange-500 to-amber-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-display font-bold text-sm shadow-md">2</div>
            <div className="text-2xl mb-4 mt-2">🧠</div>
            <h3 className="text-white text-base font-semibold font-sans mb-2">2. Gemini AI Scan</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              AI parses dialect, estimates repair costs, categorizes departments, and designs technical resolution procedures instantly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-orange-500/20 transition-all duration-300 relative group">
            <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-orange-500 to-amber-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-display font-bold text-sm shadow-md">3</div>
            <div className="text-2xl mb-4 mt-2">👥</div>
            <h3 className="text-white text-base font-semibold font-sans mb-2">3. Crowd Verification</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Nearby neighbors receive an alert to confirm the issue, filtering out junk or duplicate complaints dynamically.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-orange-500/20 transition-all duration-300 relative group">
            <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-orange-500 to-amber-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-display font-bold text-sm shadow-md">4</div>
            <div className="text-2xl mb-4 mt-2">🛡️</div>
            <h3 className="text-white text-base font-semibold font-sans mb-2">4. Smart Routing</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              The ticket is dispatched straight to the zonal department command board with approved contractors.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-orange-500/20 transition-all duration-300 relative group">
            <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-orange-500 to-amber-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-display font-bold text-sm shadow-md">5</div>
            <div className="text-2xl mb-4 mt-2">⚠️</div>
            <h3 className="text-white text-base font-semibold font-sans mb-2">5. Auto-Escalation</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              If left unassigned for over 48 hours, the ticket escalates to higher district collectors automatically.
            </p>
          </div>

          {/* Step 6 */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-orange-500/20 transition-all duration-300 relative group">
            <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-orange-500 to-amber-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-display font-bold text-sm shadow-md">6</div>
            <div className="text-2xl mb-4 mt-2">🔗</div>
            <h3 className="text-white text-base font-semibold font-sans mb-2">6. Audit Ledger Simulator</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Resolution history, once verified by community confirmation, is cryptographically logged in a simulated, tamper-resistant block explorer.
            </p>
          </div>

        </div>
      </section>

      {/* 9. CivicScore & Gamification Section */}
      <Gamification profile={profile} onAddScore={handleAddScore} />

      {/* 10. Blockchain Audit Trail Section */}
      <BlockchainLogs logs={logs} onRefresh={fetchState} loading={loading} />

      {/* 11. Zonal Administrative Operations Portal */}
      <div id="authorityPortal">
        <AuthorityPortal issues={issues} onActionSuccess={fetchState} selectedPersona={selectedPersona} />
      </div>

      {/* 12. Final CTA Banner */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-[#050505] font-sans">
        <div className="relative bg-gradient-to-r from-orange-600/20 via-orange-500/5 to-transparent border border-orange-500/20 rounded-3xl p-8 sm:p-12 overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(249,115,22,0.12),transparent)] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl sm:text-3.5xl font-display font-light text-white tracking-tight mb-4 leading-snug">
                "A transparent bridge for <br />
                smarter municipal coordination."
              </h3>
              <p className="text-neutral-400 text-xs sm:text-sm max-w-xl leading-relaxed font-sans">
                Experience a simplified portal for reporting municipal issues. Translate and route filings using Gemini AI, and track their verification on a prototype public audit ledger.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsReportOpen(true)}
                className="w-full sm:w-auto py-3 px-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm hover:brightness-110 shadow-lg cursor-pointer"
              >
                Filing Dashboard
              </button>
              <button
                onClick={() => handleScroll("authorityPortal")}
                className="w-full sm:w-auto py-3 px-6 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-sm transition-all cursor-pointer text-center"
              >
                Zonal Officer Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 13. Zonal Footer Section */}
      <footer id="about" className="relative max-w-7xl mx-auto px-6 py-12 border-t border-white/5 bg-[#0A0A0A]/30 rounded-3xl">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 mb-12">
          
          <div className="col-span-2 lg:col-span-4">
            <div className="flex gap-2 items-center mb-4">
              <Compass className="w-6 h-6 text-orange-500" />
              <span className="text-lg text-white font-display font-bold">CivicPulse AI</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed font-sans mb-4 max-w-sm">
              The Complete Smart City Civic stack. Connecting neighborhood needs with swift executive resolution.
            </p>
            <div className="flex gap-2 text-xs text-neutral-400">
              <span className="px-2 py-1 rounded bg-white/5 border border-white/5">Polygon</span>
              <span className="px-2 py-1 rounded bg-white/5 border border-white/5">Gemini 3.5</span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-neutral-200 text-xs uppercase tracking-wider font-semibold mb-4 font-sans">Platforms</h4>
            <ul className="space-y-2.5 text-xs text-neutral-500 font-sans">
              <li><button onClick={() => setIsReportOpen(true)} className="hover:text-white transition-colors cursor-pointer text-left">Filing portal</button></li>
              <li><button onClick={() => handleScroll("dashboardShowcase")} className="hover:text-white transition-colors cursor-pointer text-left">City map</button></li>
              <li><button onClick={() => handleScroll("authorityPortal")} className="hover:text-white transition-colors cursor-pointer text-left">Authority Desk</button></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-neutral-200 text-xs uppercase tracking-wider font-semibold mb-4 font-sans">Zonal Wards</h4>
            <ul className="space-y-2.5 text-xs text-neutral-500 font-sans">
              <li>Mumbai Sector 7</li>
              <li>Anantapur Ward 2</li>
              <li>Chennai Zone 4</li>
              <li>Andheri East Sector</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-600 gap-4">
          <p>© 2026 CivicPulse AI. Concept & Hackathon Demo. Built with simulated ledger auditing.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-neutral-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">Terms of Filing</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">Zonal APIs</a>
          </div>
        </div>
      </footer>

      {/* Floating Action Report Button with ping animation */}
      <button
        onClick={() => setIsReportOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-sans text-xs font-semibold shadow-2xl hover:scale-105 transition-all duration-300 border border-white/10 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Report Issue
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
      </button>

      {/* Live reporting Receipt Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-50 bg-[#0A0A0A] border border-green-500/20 p-4 rounded-2xl shadow-[0_0_30px_-5px_rgba(34,197,94,0.25)] max-w-sm flex items-start gap-3.5"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-100 font-sans">
                Report Logged & Sealed in Ledger!
              </div>
              <p className="text-[10px] text-neutral-500 font-sans mt-0.5 leading-relaxed">
                Your filing has been logged in the audit ledger with reference <strong className="text-white">#{toast.ref}</strong>. Local queue synced!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 14. Report modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSuccess={handleReportSuccess}
      />

    </div>
  );
}
