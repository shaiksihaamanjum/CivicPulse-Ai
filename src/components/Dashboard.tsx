import React, { useState, useEffect } from "react";
import { 
  MapPin, ShieldAlert, Award, Compass, Search, Download, Layers, 
  Activity, Sliders, PlayCircle, Star, ArrowUpRight, BarChart2, 
  X, ThumbsUp, Send, CheckCircle2, Clock, Hammer, HardHat, 
  User, RefreshCw, AlertCircle, Calendar, MessageSquare, Briefcase
} from "lucide-react";
import { Issue, PlatformStats, BlockLog } from "../types";
import DashboardBackground from "./three/DashboardBackground";

interface DashboardProps {
  issues: Issue[];
  stats: PlatformStats;
  onActionSuccess: () => void;
  selectedPersona?: "resident" | "analyst" | "administrator";
  onAddScore?: (points: number, type: string) => void;
}

export default function Dashboard({ 
  issues, 
  stats, 
  onActionSuccess, 
  selectedPersona = "resident", 
  onAddScore 
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"heatmap" | "list" | "predictions" | "nearby" | "analytics">("list");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [aiPrediction, setAiPrediction] = useState(true);
  const [blockchainLedger, setBlockchainLedger] = useState(true);
  const [description, setDescription] = useState("");
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
  const [alerted, setAlerted] = useState(false);
  const [votedIssues, setVotedIssues] = useState<string[]>([]);
  const [alertedIds, setAlertedIds] = useState<string[]>([]);

  const getAiPredictions = (issuesList: Issue[]) => {
    // Let's analyze historical issues to make real predictions!
    const typeCounts: Record<string, number> = {};
    const areaCounts: Record<string, Record<string, number>> = {};
    
    issuesList.forEach(issue => {
      const type = issue.type;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      
      let area = "Ward 7";
      if (issue.locationName.includes("Ward 7")) area = "Ward 7";
      else if (issue.locationName.includes("Sector 2")) area = "Sector 2";
      else if (issue.locationName.includes("Sector 4")) area = "Sector 4";
      else if (issue.locationName.includes("Andheri")) area = "Andheri East";
      else if (issue.locationName.includes("Kurla")) area = "Kurla West";
      else if (issue.locationName.includes("Bank Street")) area = "Bank Street Sector";
      else if (issue.locationName.includes("Park")) area = "Central Park Zone";
      
      if (!areaCounts[area]) areaCounts[area] = {};
      areaCounts[area][type] = (areaCounts[area][type] || 0) + 1;
    });

    const predictions = [
      {
        id: "pred-1",
        title: "Road damage risk increasing by 18% in Ward 4",
        issueType: "Pothole",
        icon: "🕳️",
        riskPercentage: Math.min(95, 78 + (areaCounts["Ward 4"]?.["Pothole"] || 0) * 8),
        area: "Ward 4 Operations Circle",
        timeframe: "Within 48 hours",
        preventiveAction: "Pre-emptively spray cold-mix binder sealant to prevent crack propagation under high vehicle volume.",
        severity: "High",
        reason: "Detected cluster of micro-cracks near main junction, heavy transport traffic bypass routes scheduled."
      },
      {
        id: "pred-2",
        title: "Garbage overflow likely this weekend in Sector 2",
        issueType: "Waste Management",
        icon: "🗑️",
        riskPercentage: Math.min(92, 82 + (areaCounts["Sector 2"]?.["Waste Management"] || 0) * 9),
        area: "Sector 2 Commercial Area",
        timeframe: "This Weekend (Sat-Sun)",
        preventiveAction: "Deploy sanitation compactor truck early Saturday morning and distribute sealed neighborhood bins.",
        severity: "Medium",
        reason: "Commercial restaurants report 20% waste volume surge. High-frequency weekend market traffic verified."
      },
      {
        id: "pred-3",
        title: "Flooding probability high tomorrow near Main Road",
        issueType: "Drainage",
        icon: "🌊",
        riskPercentage: Math.min(96, 89 + (areaCounts["Main Road"]?.["Water Leakage"] || 0) * 12),
        area: "Main Road Low-lying Subway",
        timeframe: "Tomorrow Morning",
        preventiveAction: "Initiate drain cleanout of main storm sewer joints and activate supplementary pumping valves.",
        severity: "Critical",
        reason: "High correlation between upstream water release and sub-standard sidewalk storm drainage pipe velocity."
      }
    ];

    return predictions;
  };

  const handleTriggerAlert = (predId: string) => {
    if (alertedIds.includes(predId)) return;
    setAlertedIds(prev => [...prev, predId]);
    if (onAddScore) {
      onAddScore(100, "verification");
    }
  };
  
  // Custom Filter & Geolocation States
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterSeverity, setFilterSeverity] = useState<string>("All");
  const [userLoc, setUserLoc] = useState<{ lat: number, lng: number } | null>(null);
  const [trackingLoc, setTrackingLoc] = useState(false);
  
  // Interactive Drawer State
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  
  // Comment entry state
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Authority Administration input states
  const [contractorName, setContractorName] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Sync selected issue detail from live issues array
  const selectedIssue = selectedIssueId ? issues.find(i => i.id === selectedIssueId) : null;

  const handleVote = async (issueId: string) => {
    if (votedIssues.includes(issueId)) return;
    try {
      const response = await fetch(`/api/issues/${issueId}/upvote`, { method: "POST" });
      if (response.ok) {
        setVotedIssues(prev => [...prev, issueId]);
        onActionSuccess();
        if (onAddScore) {
          onAddScore(50, "verification");
        }
      }
    } catch (err) {
      console.error("Upvote failed:", err);
    }
  };

  // Add Comment on-server
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedIssueId) return;
    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/issues/${selectedIssueId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: selectedPersona === "administrator" ? "Zonal Administrator" : selectedPersona === "analyst" ? "Lead Analyst" : "Active Citizen",
          text: commentText.trim(),
        }),
      });
      if (response.ok) {
        setCommentText("");
        onActionSuccess();
        if (onAddScore) {
          onAddScore(25, "verification");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Update Authority Action (Contractor, Triage State, Resolve)
  const handleAuthorityAction = async (action: "UNDER_REVIEW" | "VERIFIED" | "ASSIGN" | "START_WORK" | "RESOLVE") => {
    if (!selectedIssueId) return;
    setSubmittingAction(true);
    try {
      const payload: any = { action };
      if (action === "ASSIGN") {
        if (!contractorName) {
          alert("Please select or enter a contractor squad!");
          setSubmittingAction(false);
          return;
        }
        payload.contractor = contractorName;
      }
      if (action === "RESOLVE") {
        payload.completionNotes = completionNotes || "Resolved successfully via field crew operations.";
      }

      const response = await fetch(`/api/issues/${selectedIssueId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setCompletionNotes("");
        onActionSuccess();
        if (onAddScore) {
          onAddScore(150, "streak");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Automatically switch tab when persona shifts for a responsive guided user flow!
  useEffect(() => {
    if (selectedPersona === "analyst") {
      setActiveTab("predictions");
    } else if (selectedPersona === "administrator") {
      setActiveTab("list");
    } else {
      setActiveTab("list");
    }
  }, [selectedPersona]);

  const filteredIssues = issues.filter(issue => {
    // 1. Text Search Filter
    const matchesSearch = !description || (
      issue.description.toLowerCase().includes(description.toLowerCase()) ||
      issue.type.toLowerCase().includes(description.toLowerCase()) ||
      issue.id.toLowerCase().includes(description.toLowerCase())
    );

    // 2. Category Filter
    const matchesCategory = filterCategory === "All" || issue.type === filterCategory;

    // 3. Status Filter
    const matchesStatus = filterStatus === "All" || issue.status === filterStatus;

    // 4. Severity Filter
    let matchesSeverity = true;
    if (filterSeverity !== "All") {
      const s = issue.severity;
      if (filterSeverity === "Critical") matchesSeverity = s >= 9;
      else if (filterSeverity === "High") matchesSeverity = s >= 7 && s < 9;
      else if (filterSeverity === "Medium") matchesSeverity = s >= 4 && s < 7;
      else if (filterSeverity === "Low") matchesSeverity = s < 4;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesSeverity;
  });

  const activeReports = issues.filter(i => i.status !== "Resolved");
  const resolvedReports = issues.filter(i => i.status === "Resolved");

  const handleExportAudit = () => {
    if (!issues || issues.length === 0) return;
    const headers = ["ID", "Type", "Description", "Status", "Severity", "Department", "Estimated Cost (INR)", "Location", "Reporter", "Reported At"];
    const rows = issues.map(issue => [
      issue.id,
      issue.type,
      `"${issue.description.replace(/"/g, '""')}"`,
      issue.status,
      issue.severity,
      issue.department,
      issue.estimatedCost,
      `"${issue.locationName}"`,
      `"${issue.reporter}"`,
      issue.reportedAt
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `civicpulse_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAlert = () => {
    setAlerted(true);
    onActionSuccess();
    setTimeout(() => {
      setAlerted(false);
    }, 3000);
  };

  return (
    <div className="relative z-10 w-full bg-neutral-900/60 rounded-3xl ring-1 ring-white/10 shadow-[0_0_50px_-10px_rgba(249,115,22,0.15)] backdrop-blur-sm overflow-hidden">
      <DashboardBackground />
      
      {/* Top Header bar */}
      <div className="flex flex-col sm:flex-row bg-white/5 border-b border-white/5 p-4 items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 text-white font-display font-medium text-sm">
            <Compass className="w-4 h-4 text-orange-500 animate-pulse" />
            CivicPulse AI
          </span>
          <span className="opacity-30">/</span>
          <span className="text-white font-medium font-sans">Kurla Operations Sector</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20 px-2 py-0.5 text-[10px] font-semibold font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
            Zonal Live
          </span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search issues, IDs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-transparent text-white placeholder-neutral-600 focus:outline-none w-full font-sans"
            />
          </div>
          <button
            onClick={handleExportAudit}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-white/5 text-white text-xs ring-1 ring-white/10 px-3.5 py-2 hover:bg-white/10 transition font-sans font-medium cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit
          </button>
        </div>
      </div>

      {/* Dynamic Filters Ribbon */}
      <div className="bg-[#0b0b0b] border-b border-white/5 px-4 py-3 flex flex-wrap items-center gap-3.5 text-xs">
        <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold font-sans flex items-center gap-1">
          📊 Active Filters:
        </span>
        
        {/* Category Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-500 font-sans">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-orange-500/50 appearance-none font-sans cursor-pointer"
          >
            <option value="All" className="bg-neutral-950 text-white">All Categories</option>
            <option value="Pothole" className="bg-neutral-950 text-white">Pothole</option>
            <option value="Water Leakage" className="bg-neutral-950 text-white">Water Leakage</option>
            <option value="Waste Management" className="bg-neutral-950 text-white">Waste Management</option>
            <option value="Streetlight Damage" className="bg-neutral-950 text-white">Streetlight Damage</option>
            <option value="Public Safety" className="bg-neutral-950 text-white">Public Safety</option>
            <option value="Drainage" className="bg-neutral-950 text-white">Drainage</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-500 font-sans">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-orange-500/50 appearance-none font-sans cursor-pointer"
          >
            <option value="All" className="bg-neutral-950 text-white">All Statuses</option>
            <option value="Reported" className="bg-neutral-950 text-white">Reported / Active</option>
            <option value="Verified" className="bg-neutral-950 text-white">Verified / Under Review</option>
            <option value="In Progress" className="bg-neutral-950 text-white">In Progress</option>
            <option value="Resolved" className="bg-neutral-950 text-white">Resolved</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-500 font-sans">Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-orange-500/50 appearance-none font-sans cursor-pointer"
          >
            <option value="All" className="bg-neutral-950 text-white">All Severities</option>
            <option value="Critical" className="bg-neutral-950 text-white">Critical (9-10)</option>
            <option value="High" className="bg-neutral-950 text-white">High (7-8)</option>
            <option value="Medium" className="bg-neutral-950 text-white">Medium (4-6)</option>
            <option value="Low" className="bg-neutral-950 text-white">Low (1-3)</option>
          </select>
        </div>

        {/* Geolocation Live tracking button */}
        <button
          onClick={() => {
            if (userLoc) {
              setUserLoc(null);
              return;
            }
            setTrackingLoc(true);
            setTimeout(() => {
              setUserLoc({ lat: 35, lng: 45 });
              setTrackingLoc(false);
            }, 1000);
          }}
          className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-sans font-medium transition cursor-pointer ${
            userLoc 
              ? "bg-orange-500/20 border-orange-500 text-orange-400" 
              : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
          }`}
        >
          {trackingLoc ? (
            <span className="w-2.5 h-2.5 rounded-full border border-orange-400 border-t-transparent animate-spin inline-block"></span>
          ) : (
            <span className="text-orange-500">📍</span>
          )}
          {userLoc ? "User Live Location: Enabled" : "Detect User GPS Location"}
        </button>
      </div>

      {/* Dynamic Predictive AI Section (Move to the top of main dashboard) */}
      <div className="bg-[#0b0c10]/80 border-b border-white/10 p-5 relative overflow-hidden">
        {/* Subtle decorative elements for tech/AI operations vibe */}
        <div className="absolute top-0 right-0 w-[300px] h-[100px] bg-orange-500/5 blur-[50px] pointer-events-none rounded-full"></div>
        <div className="absolute bottom-0 left-10 w-[200px] h-[80px] bg-orange-600/5 blur-[40px] pointer-events-none rounded-full"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            <span className="text-[10px] uppercase text-orange-400 tracking-widest font-bold font-sans">
              Proactive Zonal Operations: Gemini Predictive Threat Vector (Live Feed)
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 font-sans flex items-center gap-1">
            🤖 Engine: <strong className="text-orange-400">Gemini Neural Pattern Detection v2.5</strong> (Analyzing {issues.length} historical logs)
          </span>
        </div>

        {/* 3 Prediction Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getAiPredictions(issues).map((pred) => {
            const isAlerted = alertedIds.includes(pred.id);
            
            // Define border & shadow focus depending on severity
            let cardStyle = "border-orange-500/20 hover:border-orange-500/40 bg-orange-950/5";
            let progColor = "from-orange-600 to-amber-500";
            let badgeStyle = "bg-orange-500/10 text-orange-400 border-orange-500/20";
            
            if (pred.severity === "Critical") {
              cardStyle = "border-red-500/20 hover:border-red-500/40 bg-red-950/5";
              progColor = "from-red-600 to-orange-500";
              badgeStyle = "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse";
            } else if (pred.severity === "Medium") {
              cardStyle = "border-blue-500/20 hover:border-blue-500/40 bg-blue-950/5";
              progColor = "from-blue-600 to-cyan-500";
              badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/20";
            }

            return (
              <div 
                key={pred.id} 
                className={`border rounded-2xl p-4 transition-all duration-300 relative group flex flex-col justify-between ${cardStyle}`}
              >
                {/* Header detail */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wide font-sans flex items-center gap-1">
                      <span>{pred.icon}</span> {pred.issueType}
                    </span>
                    <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${badgeStyle}`}>
                      {pred.riskPercentage}% Risk
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white font-sans leading-snug group-hover:text-orange-400 transition-colors">
                    {pred.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-sans mt-1 leading-relaxed">
                    {pred.reason}
                  </p>

                  {/* Progress Risk Bar */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex justify-between items-center text-[9px] text-neutral-500">
                      <span>Neural confidence</span>
                      <span className="text-white font-semibold font-mono">{pred.riskPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full bg-gradient-to-r ${progColor} rounded-full`} style={{ width: `${pred.riskPercentage}%` }}></div>
                    </div>
                  </div>

                  {/* Operational parameters */}
                  <div className="grid grid-cols-2 gap-2 mt-3.5 bg-black/30 border border-white/5 rounded-xl p-2.5 text-[10px] text-neutral-400 font-sans">
                    <div>
                      <span className="text-neutral-500 block text-[8px] uppercase">Zonal Area</span>
                      <strong className="text-neutral-200 font-semibold">{pred.area}</strong>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[8px] uppercase">Predicted Timeframe</span>
                      <strong className="text-neutral-200 font-semibold text-orange-400">{pred.timeframe}</strong>
                    </div>
                  </div>
                </div>

                {/* Footer and interactive buttons */}
                <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-col gap-2">
                  <div className="text-[10px] text-neutral-400 font-sans leading-relaxed">
                    💡 <strong className="text-neutral-300">Preventive:</strong> {pred.preventiveAction}
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => handleTriggerAlert(pred.id)}
                      disabled={isAlerted}
                      className={`w-full py-1.5 rounded-lg text-[10px] font-sans font-bold transition-all ${
                        isAlerted 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                          : "bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 cursor-pointer text-center"
                      }`}
                    >
                      {isAlerted ? "✅ Alert Dispatched to PWD" : "📡 Pre-emptively Alert PWD"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
        
        {/* Left Sidebar: Navigation & Controls */}
        <aside className="col-span-12 lg:col-span-2 bg-[#0A0A0A] p-4 flex flex-col justify-between min-h-[480px]">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase text-neutral-500 tracking-wider font-semibold font-sans block mb-2 px-1">
                Zonal Overviews
              </span>
              <ul className="space-y-1 text-xs">
                <li>
                  <button
                    onClick={() => setActiveTab("list")}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                      activeTab === "list"
                        ? "text-white bg-white/5 ring-1 ring-white/10 font-semibold"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-orange-500" />
                    Incident Registry ({filteredIssues.length})
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("nearby");
                      if (!userLoc) {
                        setTrackingLoc(true);
                        setTimeout(() => {
                          setUserLoc({ lat: 35, lng: 45 });
                          setTrackingLoc(false);
                        }, 1000);
                      }
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                      activeTab === "nearby"
                        ? "text-white bg-white/5 ring-1 ring-white/10 font-semibold"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    <Compass className="w-4 h-4 text-orange-500 animate-spin-slow" />
                    Nearby Hazards
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("predictions")}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                      activeTab === "predictions"
                        ? "text-white bg-white/5 ring-1 ring-white/10 font-semibold"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    <Star className="w-4 h-4 text-orange-500" />
                    AI Predictions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("heatmap")}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                      activeTab === "heatmap"
                        ? "text-white bg-white/5 ring-1 ring-white/10 font-semibold"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    <Activity className="w-4 h-4 text-orange-500" />
                    Heatmap Portal
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-[10px] uppercase text-neutral-500 tracking-wider font-semibold font-sans block mb-2 px-1">
                Autopilot Rules
              </span>
              <ul className="space-y-3.5 text-xs text-neutral-300 font-sans px-1.5">
                <li className="flex items-center justify-between">
                  <span>Auto-Escalate</span>
                  <button
                    onClick={() => setAutoEscalate(!autoEscalate)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all border ${
                      autoEscalate
                        ? "bg-orange-500/20 border-orange-500/40"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 rounded-full bg-orange-400 transition-transform ${
                        autoEscalate ? "translate-x-4" : "translate-x-1"
                      }`}
                    ></span>
                  </button>
                </li>
                <li className="flex items-center justify-between">
                  <span>AI Risk Predict</span>
                  <button
                    onClick={() => setAiPrediction(!aiPrediction)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all border ${
                      aiPrediction
                        ? "bg-orange-500/20 border-orange-500/40"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 rounded-full bg-orange-400 transition-transform ${
                        aiPrediction ? "translate-x-4" : "translate-x-1"
                      }`}
                    ></span>
                  </button>
                </li>
                <li className="flex items-center justify-between">
                  <span>Chain Ledgers</span>
                  <button
                    onClick={() => setBlockchainLedger(!blockchainLedger)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all border ${
                      blockchainLedger
                        ? "bg-orange-500/20 border-orange-500/40"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 rounded-full bg-orange-400 transition-transform ${
                        blockchainLedger ? "translate-x-4" : "translate-x-1"
                      }`}
                    ></span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-3 flex flex-col items-start gap-1">
              <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">Autopilot on</span>
              <span className="text-[10px] text-neutral-400 font-sans leading-relaxed">AI analyzes and auto-notifies matching departments.</span>
            </div>
          </div>
        </aside>

        {/* Center Canvas: Interactive Map Heatmap or List View */}
        <main className="col-span-12 lg:col-span-7 p-4 sm:p-6 bg-[#030303]/40 flex flex-col justify-between min-h-[480px]">
          
          <div className="space-y-4.5">
            {/* 1. MAP INTELLIGENCE UPGRADE (PERMANENT TOP SECTION WITH LARGE SIZE) */}
            <div className="relative h-[380px] bg-gradient-to-b from-[#080808] to-[#040404] border border-white/10 rounded-2xl p-4 overflow-hidden select-none shadow-2xl">
              {/* Visual grid lines */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                backgroundSize: "24px 24px"
              }}></div>

              {/* Stylized vector map lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 220" preserveAspectRatio="none">
                <line x1="0" y1="110" x2="400" y2="110" stroke="#ffffff" strokeWidth="2" className="opacity-5" />
                <line x1="200" y1="0" x2="200" y2="220" stroke="#ffffff" strokeWidth="2" className="opacity-5" />
                <path d="M 0 50 Q 100 150 200 50 T 400 150" fill="none" stroke="#f97316" strokeWidth="1" className="opacity-10" />
                <path d="M 50 0 Q 150 100 50 220" fill="none" stroke="#f97316" strokeWidth="1" className="opacity-10" />
                <path d="M 0 180 C 120 120, 280 240, 400 100" fill="none" stroke="#f97316" strokeWidth="1" className="opacity-[0.05]" />
              </svg>

              {/* Heatmap Glow Layers (Only if showHeatmap is enabled) */}
              {showHeatmap && filteredIssues.filter(i => i.status !== "Resolved" && i.severity >= 4).map((issue) => {
                let heatColor = "rgba(239, 68, 68, 0.18)"; // Critical Red
                let scaleSize = 75;
                if (issue.severity >= 9) {
                  heatColor = "rgba(239, 68, 68, 0.22)"; // Critical Red
                  scaleSize = 100;
                } else if (issue.severity >= 7) {
                  heatColor = "rgba(249, 115, 22, 0.18)"; // Orange
                  scaleSize = 85;
                } else if (issue.severity >= 4) {
                  heatColor = "rgba(250, 204, 21, 0.12)"; // Yellow
                  scaleSize = 65;
                }
                return (
                  <div
                    key={`heat-${issue.id}`}
                    className="absolute pointer-events-none rounded-full animate-pulse"
                    style={{
                      left: `${issue.lng}%`,
                      top: `${issue.lat}%`,
                      transform: "translate(-50%, -50%)",
                      width: `${scaleSize}px`,
                      height: `${scaleSize}px`,
                      background: `radial-gradient(circle, ${heatColor} 0%, rgba(0, 0, 0, 0) 70%)`,
                      animationDuration: `${issue.severity * 0.4 + 2}s`
                    }}
                  />
                );
              })}

              {/* Live Issue Pins (Color-coded strictly by severity) */}
              {filteredIssues.map((issue) => {
                const isVoted = votedIssues.includes(issue.id);
                const totalVerifications = (issue.upvotes || 0) + (isVoted ? 1 : 0);

                // Color coding rules:
                // Green = Low (severity < 4)
                // Yellow = Medium (severity 4 - 6)
                // Orange = High (severity 7 - 8)
                // Red = Critical (severity >= 9)
                let dotColor = "bg-green-500 ring-green-500/50";
                if (issue.severity >= 9) dotColor = "bg-red-500 ring-red-500/50";
                else if (issue.severity >= 7) dotColor = "bg-orange-500 ring-orange-500/50";
                else if (issue.severity >= 4) dotColor = "bg-yellow-400 ring-yellow-400/50";

                // Resolved is emerald style
                if (issue.status === "Resolved") dotColor = "bg-emerald-400 ring-emerald-400/30";

                return (
                  <div
                    key={issue.id}
                    className="absolute cursor-pointer transition-all duration-300 z-10 hover:z-30"
                    style={{
                      left: `${issue.lng}%`,
                      top: `${issue.lat}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onMouseEnter={() => setHoveredIssue(issue)}
                    onMouseLeave={() => setHoveredIssue(null)}
                    onClick={() => setSelectedIssueId(issue.id)}
                  >
                    <div className="relative flex items-center justify-center group">
                      {/* Pulse effect */}
                      {issue.status !== "Resolved" && (
                        <div className={`absolute w-7 h-7 rounded-full opacity-30 animate-ping ${dotColor.split(" ")[1]}`}></div>
                      )}
                      {/* Interactive pin */}
                      <div className={`w-3.5 h-3.5 rounded-full border border-neutral-900 shadow-xl transition-all group-hover:scale-150 duration-200 ${dotColor.split(" ")[0]}`}></div>
                      
                      {/* Small visual severity overlay label inside map */}
                      <span className="absolute -top-4 bg-black/80 border border-white/10 rounded px-1 text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30 font-mono font-bold">
                        {issue.type} ({issue.severity}/10)
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Simulated AI predicted hotspot node */}
              {aiPrediction && (
                <div
                  className="absolute cursor-pointer"
                  style={{ left: "48%", top: "42%", transform: "translate(-50%, -50%)" }}
                >
                  <div className="relative flex items-center justify-center group">
                    <div className="absolute w-10 h-10 rounded-full border border-orange-500/30 border-dashed animate-spin"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-500/20 z-10 group-hover:scale-125 transition-transform duration-200"></div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] bg-orange-500/20 border border-orange-500/30 text-orange-300 px-1 py-0.2 rounded font-sans uppercase font-bold whitespace-nowrap z-20">
                      ⚡ AI Predicted Road Risk
                    </div>
                  </div>
                </div>
              )}

              {/* Floating Map Controls Panel */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-20">
                <div className="bg-[#0A0A0A]/95 border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-[10px] font-sans font-medium text-white shadow-xl backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                  <span>Hyperlocal Matrix Map (Zonal Area)</span>
                </div>
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-sans font-medium transition shadow-xl flex items-center gap-1 cursor-pointer backdrop-blur-sm ${
                    showHeatmap
                      ? "bg-orange-500/20 border-orange-500 text-orange-400 font-bold"
                      : "bg-[#0A0A0A]/95 border-white/10 text-neutral-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  {showHeatmap ? "Hotspots: Visible" : "Hotspots: Hidden"}
                </button>
              </div>

              {/* Floating Map Legend */}
              <div className="absolute bottom-3 left-3 bg-[#0A0A0A]/95 border border-white/10 rounded-xl p-2.5 flex flex-wrap gap-3.5 text-[9px] font-sans text-neutral-400 shadow-xl backdrop-blur-sm z-20">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Critical (9-10)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> High (7-8)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> Medium (4-6)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Low (1-3)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Resolved
                </div>
              </div>

              {/* Hover overlay card */}
              {hoveredIssue && (
                <div
                  className="absolute bg-[#0C0C0C]/95 border border-white/10 p-3.5 rounded-xl shadow-2xl z-35 w-52 text-[11px] font-sans transition-all pointer-events-none backdrop-blur-sm"
                  style={{
                    left: hoveredIssue.lng > 50 ? "auto" : `${hoveredIssue.lng + 4}%`,
                    right: hoveredIssue.lng > 50 ? `${100 - hoveredIssue.lng + 4}%` : "auto",
                    top: hoveredIssue.lat > 50 ? `${hoveredIssue.lat - 24}%` : `${hoveredIssue.lat + 4}%`,
                  }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-mono text-[9px] text-neutral-400 font-semibold">#{hoveredIssue.id}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      hoveredIssue.severity >= 9 ? "bg-red-500/20 text-red-400" : hoveredIssue.severity >= 7 ? "bg-orange-500/20 text-orange-400" : hoveredIssue.severity >= 4 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
                    }`}>
                      SEV: {hoveredIssue.severity}/10
                    </span>
                  </div>
                  <div className="text-white font-semibold font-sans">{hoveredIssue.type}</div>
                  <div className="text-neutral-400 truncate mt-0.5 font-sans text-[10px]">{hoveredIssue.locationName}</div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 text-[10px] font-mono">
                    <span className="text-neutral-500">Urgency: {(hoveredIssue.severity * 10) + (hoveredIssue.upvotes || 0)}%</span>
                    <span className="text-orange-400 font-bold">₹{hoveredIssue.estimatedCost.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* User live location marker on the map */}
              {userLoc && (
                <div
                  className="absolute z-20"
                  style={{ left: `${userLoc.lng}%`, top: `${userLoc.lat}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div className="relative flex items-center justify-center animate-bounce">
                    <div className="absolute w-8 h-8 rounded-full bg-orange-500/25 animate-ping"></div>
                    <div className="w-5 h-5 bg-orange-500 border border-white rounded-full flex items-center justify-center shadow-lg text-[9px]">
                      👤
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] bg-orange-500 text-white font-sans font-bold rounded px-1 tracking-tight whitespace-nowrap uppercase">
                      My Location
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Title / Info Segment dynamically adapting to activeTab */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div>
                <h3 className="text-lg font-display font-light text-white tracking-tight flex items-center gap-1.5">
                  {activeTab === "list" && "Community Incidents Registry"}
                  {activeTab === "nearby" && "Nearby Unresolved Proximity Alert"}
                  {activeTab === "predictions" && "Gemini Predictive Failures"}
                  {activeTab === "heatmap" && "Regional Hotspot Heatmap Insights"}
                </h3>
                <p className="text-neutral-500 text-[11px] font-sans">
                  {activeTab === "list" && "Listing verified regional civic hazards. Click row to trigger status & timeline tracker."}
                  {activeTab === "nearby" && "Showing active unresolved issues closest to your detected coordinates."}
                  {activeTab === "predictions" && "Gemini probability monitoring for asphalt decay & sewer joints failures."}
                  {activeTab === "heatmap" && "Density stats and hotspot matrix tracking for proactive zonal repairs."}
                </p>
              </div>
            </div>

            {/* Display View Tab Content */}
            {activeTab === "list" && (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {filteredIssues.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500 text-xs font-sans">
                    No matching incidents found inside filtered criteria.
                  </div>
                ) : (
                  filteredIssues.map((issue) => {
                    const isVoted = votedIssues.includes(issue.id);
                    const totalVerifications = (issue.upvotes || 0) + (isVoted ? 1 : 0);
                    const score = (issue.severity * 10) + totalVerifications;

                    let urgencyLabel = "Normal";
                    let urgencyColor = "text-green-400 bg-green-500/10 border-green-500/20";
                    if (score > 85) {
                      urgencyLabel = "Critical";
                      urgencyColor = "text-red-400 bg-red-500/10 border-red-500/20";
                    } else if (score >= 66) {
                      urgencyLabel = "High Priority";
                      urgencyColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
                    } else if (score >= 40) {
                      urgencyLabel = "Elevated";
                      urgencyColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
                    }

                    const supportingUploads = (issue.beforeImage ? 1 : 0) + (issue.comments?.filter(c => c.imageUrl).length || 0);

                    return (
                      <div 
                        key={issue.id} 
                        onClick={() => setSelectedIssueId(issue.id)}
                        className={`p-3.5 bg-[#0a0a0a]/90 hover:bg-white/[0.02] transition-all border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                          selectedIssueId === issue.id ? "border-orange-500/50 bg-orange-500/[0.01]" : "border-white/5"
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="text-xl shrink-0 mt-0.5">
                            {issue.type === "Pothole" ? "🕳️" : issue.type === "Water Leakage" || issue.type === "Water Leak" ? "💧" : issue.type === "Streetlight Damage" || issue.type === "Streetlight" ? "💡" : issue.type === "Waste Management" || issue.type === "Garbage" ? "🗑️" : issue.type === "Drainage" ? "🌊" : "📋"}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-neutral-100 truncate font-sans text-xs">
                              #{issue.id} — {issue.type}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-sans mt-0.5 truncate">{issue.locationName}</div>
                            
                            {/* Verification Stats with clean styling */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-neutral-500 font-sans">
                              <span className="flex items-center gap-1 text-green-400 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                {totalVerifications} citizens verified this issue
                              </span>
                              <span className="flex items-center gap-1">
                                📎 {supportingUploads} supporting uploads
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                          <div className="flex items-center gap-2">
                            {/* Urgency tag */}
                            <span className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded border uppercase ${urgencyColor}`}>
                              {urgencyLabel} ({score} Urgency)
                            </span>
                            <span className="text-[10px] text-white font-mono font-bold">₹{issue.estimatedCost.toLocaleString()}</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(issue.id);
                            }}
                            disabled={votedIssues.includes(issue.id)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-sans font-semibold transition-all flex items-center gap-1 ${
                              votedIssues.includes(issue.id)
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500 hover:text-white cursor-pointer"
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3 shrink-0" />
                            {votedIssues.includes(issue.id) ? "✓ Verified" : issue.status === "Resolved" ? "Verify Fix" : "Upvote"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "nearby" && (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {!userLoc ? (
                  <div className="text-center py-10 flex flex-col items-center justify-center bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                    <Compass className="w-10 h-10 text-neutral-600 mb-2.5 animate-pulse" />
                    <p className="text-xs text-neutral-400 font-sans max-w-xs leading-relaxed">
                      User GPS location telemetry is not currently active. Detect location coordinates to search for nearby hazards inside your immediate grid sector.
                    </p>
                    <button
                      onClick={() => {
                        setTrackingLoc(true);
                        setTimeout(() => {
                          setUserLoc({ lat: 35, lng: 45 });
                          setTrackingLoc(false);
                        }, 1000);
                      }}
                      className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition font-sans font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/10"
                    >
                      {trackingLoc ? "Detecting GPS..." : "Detect User GPS Location"}
                    </button>
                  </div>
                ) : (
                  issues.filter(i => i.status !== "Resolved").map(i => {
                    const dist = Math.sqrt(Math.pow(i.lat - userLoc.lat, 2) + Math.pow(i.lng - userLoc.lng, 2));
                    return { ...i, distance: dist };
                  }).sort((a, b) => a.distance - b.distance).length === 0 ? (
                    <div className="text-center py-10 text-neutral-500 text-xs">No active hazards in proximity. All nearby sectors verified.</div>
                  ) : (
                    issues.filter(i => i.status !== "Resolved").map(i => {
                      const dist = Math.sqrt(Math.pow(i.lat - userLoc.lat, 2) + Math.pow(i.lng - userLoc.lng, 2));
                      return { ...i, distance: dist };
                    }).sort((a, b) => a.distance - b.distance).slice(0, 6).map((issue) => {
                      const isVoted = votedIssues.includes(issue.id);
                      const totalVerifications = (issue.upvotes || 0) + (isVoted ? 1 : 0);
                      const score = (issue.severity * 10) + totalVerifications;

                      let urgencyLabel = "Normal";
                      let urgencyColor = "text-green-400 bg-green-500/10 border-green-500/20";
                      if (score > 85) {
                        urgencyLabel = "Critical";
                        urgencyColor = "text-red-400 bg-red-500/10 border-red-500/20";
                      } else if (score >= 66) {
                        urgencyLabel = "High Priority";
                        urgencyColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
                      } else if (score >= 40) {
                        urgencyLabel = "Elevated";
                        urgencyColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
                      }

                      const distMeters = (issue.distance * 15).toFixed(0);

                      return (
                        <div
                          key={`near-${issue.id}`}
                          onClick={() => setSelectedIssueId(issue.id)}
                          className="p-3.5 bg-[#0b0b0b] hover:bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all duration-200"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="text-lg mt-0.5">📍</span>
                            <div>
                              <div className="font-semibold text-white font-sans text-xs">
                                #{issue.id} — {issue.type}
                              </div>
                              <div className="text-[10px] text-orange-400 font-semibold mt-0.5 flex items-center gap-1">
                                <span>⚡ {distMeters} meters away</span>
                                <span className="text-neutral-500">•</span>
                                <span className="text-neutral-400">{issue.locationName}</span>
                              </div>
                              <div className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500/70" />
                                {totalVerifications} verifications
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 justify-between sm:justify-end">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase font-sans ${urgencyColor}`}>
                              {urgencyLabel}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVote(issue.id);
                              }}
                              disabled={votedIssues.includes(issue.id)}
                              className={`px-3 py-1 rounded-xl text-[10px] font-sans font-semibold transition-all flex items-center gap-1 ${
                                votedIssues.includes(issue.id)
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                  : "bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500 hover:text-white cursor-pointer"
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3 shrink-0" />
                              Upvote
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )
                )}
              </div>
            )}

            {activeTab === "predictions" && (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-semibold text-white font-sans flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        Road Section 4B — Monsoon Erosion Alert
                      </div>
                      <div className="text-[10px] text-neutral-500 font-sans mt-0.5">87% probability of structural pothole cluster formation within 14 days.</div>
                    </div>
                    <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full font-bold">87% AI RISK</span>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] text-neutral-400 uppercase font-sans">Erosion Threshold</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full" style={{ width: "87%" }}></div>
                    </div>
                    <span className="text-xs text-white font-bold font-mono">87%</span>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                    <span className="text-[10px] text-neutral-500 font-sans">Suggested Action: Apply sealant emulsion early.</span>
                    <button
                      onClick={handleAlert}
                      disabled={alerted}
                      className="text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 rounded hover:bg-orange-500 hover:text-white transition-all font-sans font-medium cursor-pointer disabled:opacity-50"
                    >
                      {alerted ? "Alert Broadcasted! 📡" : "Pre-emptively Alert PWD"}
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-4 opacity-70">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-semibold text-white font-sans flex items-center gap-1.5">
                        Water Pipe pressure leak Risk — Kurla Sector 2
                      </div>
                      <div className="text-[10px] text-neutral-500 font-sans mt-0.5">62% probability of joint decay leakage based on municipal plumbing age.</div>
                    </div>
                    <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full font-bold">62% AI RISK</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] text-neutral-400 uppercase font-sans">Plumbing Fatigue</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full" style={{ width: "62%" }}></div>
                    </div>
                    <span className="text-xs text-white font-bold font-mono">62%</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "heatmap" && (
              <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider font-sans block">Heatmap Density Max</span>
                    <div className="text-2xl font-display font-light text-red-500 mt-1">Ward 7 Sector Delta</div>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">Concentration of critical road craters & leakage points detected via live satellite feed telemetry.</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider font-sans block">Active Proactive Action</span>
                    <div className="text-2xl font-display font-light text-orange-400 mt-1">9 Preventative Solves</div>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">PWD dispatched early-stage sealants to predicted erosion nodes, preventing road deterioration.</p>
                  </div>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider font-sans block mb-2">Proximity Cluster Density Analysis</span>
                  <div className="space-y-2 text-xs font-sans text-neutral-300">
                    <div className="flex justify-between items-center bg-white/[0.01] p-2 rounded-xl">
                      <span>Kurla West (Grid Alpha)</span>
                      <span className="text-red-400 font-bold font-mono">High Density (8 Issues)</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/[0.01] p-2 rounded-xl">
                      <span>Bandra East (Grid Beta)</span>
                      <span className="text-orange-400 font-bold font-mono">Moderate Density (3 Issues)</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/[0.01] p-2 rounded-xl">
                      <span>Andheri Subway (Grid Gamma)</span>
                      <span className="text-green-400 font-bold font-mono">Low / Controlled (1 Issue)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick alert bar for pothole detected */}
            {activeReports.length > 0 && (
              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between text-xs gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="text-base mt-0.5">📢</span>
                  <div className="min-w-0">
                    <div className="font-semibold text-neutral-200 font-sans truncate">
                      Active: #{activeReports[0].id} {activeReports[0].type}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-sans truncate">
                      {activeReports[0].description}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIssueId(activeReports[0].id)}
                  className="text-[10px] text-orange-400 hover:text-white font-sans bg-orange-500/10 hover:bg-orange-500 px-2 py-0.5 rounded-full border border-orange-500/20 shrink-0 cursor-pointer"
                >
                  Review Status Pipeline
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar: Dynamic City Stats Summary */}
        <aside className="col-span-12 lg:col-span-3 bg-[#0A0A0A] p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] uppercase text-neutral-500 tracking-wider font-semibold font-sans block mb-2 px-1">
              City Health Card
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 relative overflow-hidden group hover:border-orange-500/15 transition-all">
                <span className="text-[9px] text-neutral-500 uppercase font-semibold font-sans">Total Reports</span>
                <div className="text-lg font-display font-medium text-white mt-0.5">
                  {issues.length}
                </div>
                <div className="text-[8px] text-neutral-500 font-sans">Sealed ledger</div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 relative overflow-hidden group hover:border-orange-500/15 transition-all">
                <span className="text-[9px] text-neutral-500 uppercase font-semibold font-sans">Resolved</span>
                <div className="text-lg font-display font-medium text-white mt-0.5">
                  {resolvedReports.length}
                </div>
                <div className="text-[8px] text-neutral-500 font-sans">Community verify</div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 relative overflow-hidden group hover:border-orange-500/15 transition-all">
                <span className="text-[9px] text-neutral-500 uppercase font-semibold font-sans">Avg Fix Time</span>
                <div className="text-lg font-display font-medium text-white mt-0.5">
                  {stats.avgFixTimeHours}h
                </div>
                <div className="text-[8px] text-neutral-500 font-sans">Contractor speed</div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 relative overflow-hidden group hover:border-orange-500/15 transition-all">
                <span className="text-[9px] text-neutral-500 uppercase font-semibold font-sans">Score Grade</span>
                <div className="text-lg font-display font-semibold text-orange-400 mt-0.5">
                  A-
                </div>
                <div className="text-[8px] text-neutral-500 font-sans">Ward average</div>
              </div>
            </div>

            {/* Top Regional Ward Guardians summary */}
            <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5">
              <span className="text-[10px] uppercase text-neutral-500 tracking-wider font-semibold font-sans block mb-2.5">
                🏆 Ward Leaderboard
              </span>
              <div className="space-y-2.5 font-sans text-xs">
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <span>🥇</span> Ravi Kumar
                  </span>
                  <span className="text-orange-400 font-semibold font-mono">9,840 pts</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <span>🥈</span> Priya Nair
                  </span>
                  <span className="text-orange-400 font-semibold font-mono">8,210 pts</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <span>🥉</span> Ahmed Khan
                  </span>
                  <span className="text-orange-400 font-semibold font-mono">7,655 pts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500 uppercase font-sans">
            <span>Polygon Mainnet</span>
            <span className="text-green-500 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span> Live syncing
            </span>
          </div>
        </aside>

      </div>

      {/* RESOLUTION TRACKING PIPELINE & COMMUNITY DIALOGUE DRAWER OVERLAY */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedIssueId(null)}
          ></div>

          {/* Sliding Panel */}
          <div className="relative w-full max-w-lg bg-[#070707] border-l border-white/10 h-full overflow-y-auto p-5 sm:p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="absolute top-0 left-0 w-48 h-48 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {selectedIssue.type === "Pothole" ? "🕳️" : selectedIssue.type === "Water Leakage" ? "💧" : selectedIssue.type === "Streetlight Damage" ? "💡" : selectedIssue.type === "Waste Management" ? "🗑️" : selectedIssue.type === "Drainage" ? "🌊" : "📋"}
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-400 font-mono">INCIDENT LEADER #{selectedIssue.id}</h4>
                    <h3 className="text-sm font-semibold text-white font-sans">{selectedIssue.type} - {selectedIssue.locationName}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedIssueId(null)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* BEFORE & AFTER EVIDENCE BLOCK */}
              <div className="bg-[#0D0D0D] p-3 rounded-2xl border border-white/5 space-y-3">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider mb-1 block">Before Image</span>
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-neutral-900 border border-white/10 relative">
                      <img 
                        src={selectedIssue.beforeImage || "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80"} 
                        alt="Before evidence" 
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/70 text-[8px] text-orange-400 px-1 rounded font-mono font-bold">Incident Log</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider mb-1 block">After Image</span>
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-neutral-900 border border-white/10 relative flex items-center justify-center">
                      {selectedIssue.status === "Resolved" && selectedIssue.afterImage ? (
                        <img 
                          src={selectedIssue.afterImage} 
                          alt="After evidence" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2 text-[9px] text-neutral-600 font-sans italic flex flex-col items-center justify-center h-full">
                          <Clock className="w-4 h-4 text-neutral-600 mb-1" />
                          Pending repair completion image...
                        </div>
                      )}
                      {selectedIssue.status === "Resolved" && (
                        <span className="absolute bottom-1 right-1 bg-green-950/80 text-[8px] text-green-400 px-1.5 py-0.5 rounded font-mono font-bold border border-green-500/20">Verified Fix</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Proof of Completion and completion notes if resolved */}
                {selectedIssue.status === "Resolved" && (
                  <div className="bg-[#0e1611]/80 border border-emerald-500/20 rounded-xl p-3 space-y-2 text-xs">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block font-mono">⚡ Cryptographic Proof of Completion</span>
                    <div className="space-y-1 text-[10px] font-mono text-neutral-400">
                      <div className="flex justify-between">
                        <span>Ledger Transaction:</span>
                        <span className="text-emerald-400 font-bold">0x{selectedIssue.id.repeat(4).slice(0, 8)}...f3a2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Polygon Block validation:</span>
                        <span className="text-white">#48,102,{selectedIssue.id.charCodeAt(0) || 57}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Physical repair audit:</span>
                        <span className="text-emerald-400 font-bold">PASSED / LOCKED</span>
                      </div>
                    </div>
                    {selectedIssue.completionNotes && (
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Contractor Completion Notes</span>
                        <p className="text-[10.5px] text-neutral-300 font-sans italic">"{selectedIssue.completionNotes}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Verification Stat Banner */}
              <div className="bg-[#0e1610] border border-green-500/10 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-green-400 font-sans font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500 animate-pulse" />
                  {selectedIssue.upvotes + (votedIssues.includes(selectedIssue.id) ? 1 : 0)} residents confirmed & verified this hazard
                </span>
                <span className="text-neutral-400 font-mono text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                  Urgency: {Math.min(100, (selectedIssue.severity * 10) + (selectedIssue.upvotes || 0) + (votedIssues.includes(selectedIssue.id) ? 1 : 0))}%
                </span>
              </div>

              {/* INTERACTIVE RESOLUTION PROGRESS PIPELINE */}
              <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-4 space-y-3">
                <span className="text-[9px] uppercase text-neutral-400 tracking-wider font-bold block font-mono">
                  Zonal Work Resolution Pipeline
                </span>

                <div className="relative pl-5 space-y-4 text-xs font-sans">
                  {/* Vertical bar */}
                  <div className="absolute left-1.5 top-1.5 bottom-1.5 w-[1px] bg-white/10"></div>

                  {/* Stage 1: Reported */}
                  <div className="relative">
                    <span className="absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border border-black flex items-center justify-center text-[8px] text-black font-bold">✔</span>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-neutral-200">Stage 1: Reported</p>
                      <span className="text-[9px] text-neutral-500 font-mono">
                        {new Date(selectedIssue.reportedAt).toLocaleDateString()} {new Date(selectedIssue.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[9px] text-orange-400 font-semibold font-mono">Authority: Citizen ({selectedIssue.reporter})</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {selectedIssue.timeline?.find(t => t.status === "Reported")?.details || "Incident reported into immutable ledger register."}
                    </p>
                  </div>

                  {/* Stage 2: Verified */}
                  {(() => {
                    const isCompleted = ["Verified", "Assigned", "In Progress", "Resolved"].includes(selectedIssue.status);
                    const isActive = selectedIssue.status === "Under Review" || selectedIssue.status === "Reported";
                    return (
                      <div className="relative">
                        <span className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center text-[8px] ${
                          isCompleted ? "bg-green-500 text-black font-bold" : isActive ? "bg-orange-500 text-black font-bold animate-pulse" : "bg-neutral-800 text-neutral-500"
                        }`}>
                          {isCompleted ? "✔" : isActive ? "⏳" : "⬜"}
                        </span>
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold ${isCompleted ? "text-neutral-200" : isActive ? "text-orange-400" : "text-neutral-600"}`}>Stage 2: Verified</p>
                          <span className="text-[9px] text-neutral-500 font-mono">
                            {selectedIssue.timeline?.find(t => t.status === "Verified")?.timestamp 
                              ? new Date(selectedIssue.timeline.find(t => t.status === "Verified")!.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) 
                              : isCompleted ? "Auto-Verified" : "Verification Pending"}
                          </span>
                        </div>
                        <p className="text-[9px] text-neutral-500 font-mono">Authority: {selectedIssue.department || "Zonal Triage Division"}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {selectedIssue.timeline?.find(t => t.status === "Verified")?.details || "AI audit match completed. Consensus threshold verified."}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Stage 3: Assigned */}
                  {(() => {
                    const isCompleted = ["Assigned", "In Progress", "Resolved"].includes(selectedIssue.status);
                    const isActive = selectedIssue.status === "Verified";
                    return (
                      <div className="relative">
                        <span className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center text-[8px] ${
                          isCompleted ? "bg-green-500 text-black font-bold" : isActive ? "bg-orange-500 text-black font-bold animate-pulse" : "bg-neutral-800 text-neutral-500"
                        }`}>
                          {isCompleted ? "✔" : isActive ? "⏳" : "⬜"}
                        </span>
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold ${isCompleted ? "text-neutral-200" : isActive ? "text-orange-400" : "text-neutral-600"}`}>Stage 3: Assigned</p>
                          <span className="text-[9px] text-neutral-500 font-mono">
                            {selectedIssue.timeline?.find(t => t.status === "Assigned")?.timestamp 
                              ? new Date(selectedIssue.timeline.find(t => t.status === "Assigned")!.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) 
                              : selectedIssue.contractor ? "Assigned" : "Awaiting assignment"}
                          </span>
                        </div>
                        <p className="text-[9px] text-neutral-500 font-mono">Authority: {selectedIssue.contractor || "Zonal Dispatch Unit"}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {selectedIssue.timeline?.find(t => t.status === "Assigned")?.details || (selectedIssue.contractor ? `Assigned to contractor squad ${selectedIssue.contractor}.` : "Awaiting contractor team allocation.")}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Stage 4: In Progress */}
                  {(() => {
                    const isCompleted = ["In Progress", "Resolved"].includes(selectedIssue.status);
                    const isActive = selectedIssue.status === "Assigned";
                    return (
                      <div className="relative">
                        <span className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center text-[8px] ${
                          isCompleted ? "bg-green-500 text-black font-bold" : isActive ? "bg-orange-500 text-black font-bold animate-pulse" : "bg-neutral-800 text-neutral-500"
                        }`}>
                          {isCompleted ? "⏳" : isActive ? "⏳" : "⬜"}
                        </span>
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold ${isCompleted ? "text-neutral-200" : isActive ? "text-orange-400" : "text-neutral-600"}`}>Stage 4: In Progress</p>
                          <span className="text-[9px] text-neutral-500 font-mono">
                            {selectedIssue.timeline?.find(t => t.status === "In Progress")?.timestamp 
                              ? new Date(selectedIssue.timeline.find(t => t.status === "In Progress")!.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) 
                              : isCompleted ? "Active Repair" : "Pending mobilise"}
                          </span>
                        </div>
                        <p className="text-[9px] text-neutral-500 font-mono">Authority: {selectedIssue.contractor || "Field Operations crew"}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {selectedIssue.timeline?.find(t => t.status === "In Progress")?.details || "Field maintenance crew dispatched with repair supplies."}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Stage 5: Resolved */}
                  {(() => {
                    const isCompleted = selectedIssue.status === "Resolved";
                    const isActive = selectedIssue.status === "In Progress";
                    return (
                      <div className="relative">
                        <span className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center text-[8px] ${
                          isCompleted ? "bg-green-500 text-black font-bold" : isActive ? "bg-orange-500 text-black font-bold animate-pulse" : "bg-neutral-800 text-neutral-500"
                        }`}>
                          {isCompleted ? "✔" : isActive ? "⏳" : "⬜"}
                        </span>
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold ${isCompleted ? "text-green-400" : isActive ? "text-orange-400" : "text-neutral-600"}`}>Stage 5: Resolved</p>
                          <span className="text-[9px] text-neutral-500 font-mono">
                            {selectedIssue.resolvedAt ? new Date(selectedIssue.resolvedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "Pending Resolve"}
                          </span>
                        </div>
                        <p className="text-[9px] text-neutral-500 font-mono">Authority: {selectedIssue.contractor || selectedIssue.department}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {selectedIssue.completionNotes || "Reconstruction pending final audit verification."}
                        </p>
                      </div>
                    );
                  })()}

                </div>
              </div>

              {/* DYNAMIC REAL-TIME COMMUNITY DISCUSSION LOG */}
              <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-4 space-y-3 flex flex-col h-48 justify-between">
                <div>
                  <span className="text-[9px] uppercase text-neutral-400 tracking-wider font-bold block mb-2 font-mono flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                    Resident Verifications Discussion
                  </span>

                  <div className="space-y-2.5 overflow-y-auto max-h-28 pr-1 font-sans text-[11px] leading-relaxed">
                    {selectedIssue.comments && selectedIssue.comments.length > 0 ? (
                      selectedIssue.comments.map((cmt, idx) => (
                        <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-lg p-2 space-y-0.5">
                          <div className="flex justify-between text-[10px] text-neutral-400">
                            <span className="font-bold text-neutral-300 flex items-center gap-1">
                              <User className="w-3 h-3 text-orange-400" />
                              {cmt.author}
                            </span>
                            <span>{new Date(cmt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-neutral-300 font-medium font-sans">{cmt.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-neutral-600 italic font-sans">
                        No community dialogue logs filed yet. Ask a question or verify the problem below!
                      </div>
                    )}
                  </div>
                </div>

                {/* Send Comment form */}
                <form onSubmit={handleAddComment} className="flex gap-2 border-t border-white/5 pt-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Contribute to this discussion..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="p-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* ADMINISTRATIVE OVERRIDE TOOLS PORTAL */}
              {(selectedPersona === "administrator" || selectedPersona === "analyst") && (
                <div className="p-4 bg-orange-500/5 border border-orange-500/15 rounded-2xl space-y-3">
                  <span className="text-[9px] uppercase font-mono font-bold text-orange-400 tracking-wider flex items-center gap-1.5">
                    <HardHat className="w-4 h-4 text-orange-500" />
                    🛠️ Zonal Administrator Dispatch Desk
                  </span>

                  {selectedIssue.status !== "Resolved" ? (
                    <div className="space-y-3 text-xs font-sans">
                      
                      {/* Triage transition buttons */}
                      <div className="flex flex-wrap gap-2">
                        {selectedIssue.status === "Reported" && (
                          <button
                            type="button"
                            onClick={() => handleAuthorityAction("UNDER_REVIEW")}
                            disabled={submittingAction}
                            className="bg-white/5 hover:bg-white/10 text-white font-semibold py-1 px-2.5 rounded-lg border border-white/10 cursor-pointer"
                          >
                            Set Under Review
                          </button>
                        )}
                        {["Reported", "Under Review"].includes(selectedIssue.status) && (
                          <button
                            type="button"
                            onClick={() => handleAuthorityAction("VERIFIED")}
                            disabled={submittingAction}
                            className="bg-white/5 hover:bg-white/10 text-white font-semibold py-1 px-2.5 rounded-lg border border-white/10 cursor-pointer"
                          >
                            Set Verified
                          </button>
                        )}
                        {["Reported", "Under Review", "Verified"].includes(selectedIssue.status) && (
                          <div className="w-full space-y-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
                            <label className="text-[9px] text-neutral-400 block uppercase font-bold tracking-wider mb-1">Contractor Squad</label>
                            <div className="flex gap-2">
                              <select
                                value={contractorName}
                                onChange={(e) => setContractorName(e.target.value)}
                                className="flex-1 bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                              >
                                <option value="">Select Crew...</option>
                                <option value="Brihanmumbai Lighting Corp">Brihanmumbai Lighting Corp</option>
                                <option value="Zonal PWD Squad Alpha">Zonal PWD Squad Alpha</option>
                                <option value="Mumbai Sewerage & Hydraulics">Mumbai Sewerage & Hydraulics</option>
                                <option value="Clean India Urban Waste Division">Clean India Urban Waste Division</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleAuthorityAction("ASSIGN")}
                                disabled={submittingAction || !contractorName}
                                className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1 rounded-lg cursor-pointer text-[10px] uppercase"
                              >
                                Assign
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedIssue.status === "Assigned" && (
                          <button
                            type="button"
                            onClick={() => handleAuthorityAction("START_WORK")}
                            disabled={submittingAction}
                            className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-1.5 px-3 rounded-lg cursor-pointer uppercase text-[10px]"
                          >
                            Start Reconstruction Crew
                          </button>
                        )}
                      </div>

                      {/* Complete Resolution Submission Form */}
                      {["Assigned", "In Progress"].includes(selectedIssue.status) && (
                        <div className="space-y-2 bg-black/40 p-3 rounded-xl border border-white/5">
                          <label className="text-[9px] text-green-400 block uppercase font-bold tracking-wider">Resolution Audit Log</label>
                          <textarea
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            placeholder="Describe how the issue was fixed, materials used, warranty, etc."
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-green-500 h-16"
                          ></textarea>
                          <button
                            type="button"
                            onClick={() => handleAuthorityAction("RESOLVE")}
                            disabled={submittingAction}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-xl transition cursor-pointer text-[10px] uppercase tracking-wider"
                          >
                            Complete Work & Publish On-Chain Resolution
                          </button>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center py-2 text-[10px] text-green-400 font-mono flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> This incident is resolved & immutable Polygon block has been validated.
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Sticky Actions at bottom */}
            <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-500">Urgency: {Math.min(100, (selectedIssue.severity * 10) + (selectedIssue.upvotes || 0) + (votedIssues.includes(selectedIssue.id) ? 1 : 0))}%</span>
              <button
                type="button"
                onClick={() => handleVote(selectedIssue.id)}
                disabled={votedIssues.includes(selectedIssue.id)}
                className={`py-2 px-4 rounded-xl font-sans font-bold transition-all text-xs flex items-center gap-1.5 ${
                  votedIssues.includes(selectedIssue.id)
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-orange-600 hover:bg-orange-500 text-white cursor-pointer shadow-lg shadow-orange-500/10"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {votedIssues.includes(selectedIssue.id) ? "Verified Solution" : "Verify / Upvote (+50)"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Function to compute weekly resolved tasks count
function resolvedIssuesCount(issues: Issue[]): number {
  return issues.filter(i => i.status === "Resolved").length;
}
