import { useState, useEffect } from "react";
import { MapPin, ShieldAlert, Award, Compass, Search, Download, Layers, Activity, Sliders, PlayCircle, Star, ArrowUpRight, BarChart2 } from "lucide-react";
import { Issue, PlatformStats } from "../types";
import DashboardBackground from "./three/DashboardBackground";

interface DashboardProps {
  issues: Issue[];
  stats: PlatformStats;
  onOpenReportModal: () => void;
  onSelectIssueOnMap: (issueId: string) => void;
}

export default function Dashboard({ issues, stats, onActionSuccess, selectedPersona = "resident" }: { issues: Issue[]; stats: PlatformStats; onActionSuccess: () => void; selectedPersona?: "resident" | "analyst" | "administrator" }) {
  const [activeTab, setActiveTab] = useState<"heatmap" | "list" | "predictions" | "analytics">("heatmap");
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [aiPrediction, setAiPrediction] = useState(true);
  const [blockchainLedger, setBlockchainLedger] = useState(true);
  const [description, setDescription] = useState("");
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
  const [alerted, setAlerted] = useState(false);

  // Automatically switch tab when persona shifts for a responsive guided user flow!
  useEffect(() => {
    if (selectedPersona === "analyst") {
      setActiveTab("predictions");
    } else if (selectedPersona === "administrator") {
      setActiveTab("list");
    } else {
      setActiveTab("heatmap");
    }
  }, [selectedPersona]);

  const filteredIssues = issues.filter(issue => {
    if (!description) return true;
    return (
      issue.description.toLowerCase().includes(description.toLowerCase()) ||
      issue.type.toLowerCase().includes(description.toLowerCase()) ||
      issue.id.toLowerCase().includes(description.toLowerCase())
    );
  });

  const activeReports = issues.filter(i => i.status === "Active" || i.status === "Escalated");
  const resolvedReports = issues.filter(i => i.status === "Resolved");

  // Dynamic status rates
  const resolvedThisWeek = resolvedIssuesCount(issues);

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
                    Issue Grid List ({filteredIssues.length})
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
        <main className="col-span-12 lg:col-span-7 p-4 sm:p-6 bg-black/20 flex flex-col justify-between min-h-[480px]">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-light text-white tracking-tight flex items-center gap-1.5">
                  {activeTab === "heatmap" && "Regional Hotspot Heatmap"}
                  {activeTab === "list" && "Community Incidents Registry"}
                  {activeTab === "predictions" && "Gemini Predictive Failures"}
                </h3>
                <p className="text-neutral-500 text-xs mt-1 font-sans">
                  {activeTab === "heatmap" && "Live Polygon geo-tags shown on virtual matrix map grid."}
                  {activeTab === "list" && "Listing verified civic reports across Kurla sectors."}
                  {activeTab === "predictions" && "Probability tracking for potholes & pipe leaks based on seasonal factors."}
                </p>
              </div>
            </div>

            {/* Display View Panels */}
            {activeTab === "heatmap" && (
              <div className="relative h-[240px] bg-white/[0.01] border border-white/10 rounded-2xl p-4 overflow-hidden select-none">
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
                </svg>

                {/* Hotspot Markers */}
                {filteredIssues.map((issue) => {
                  let dotColor = "bg-blue-500 ring-blue-500/50";
                  if (issue.severity >= 8) dotColor = "bg-red-500 ring-red-500/50";
                  else if (issue.severity >= 5) dotColor = "bg-yellow-400 ring-yellow-400/50";

                  if (issue.status === "Resolved") dotColor = "bg-green-500 ring-green-500/30";

                  return (
                    <div
                      key={issue.id}
                      className="absolute cursor-pointer transition-all duration-300"
                      style={{
                        left: `${issue.lng}%`,
                        top: `${issue.lat}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onMouseEnter={() => setHoveredIssue(issue)}
                      onMouseLeave={() => setHoveredIssue(null)}
                    >
                      <div className="relative flex items-center justify-center">
                        {/* Pulse effect */}
                        {issue.status !== "Resolved" && (
                          <div className={`absolute w-8 h-8 rounded-full opacity-30 animate-ping ${dotColor.split(" ")[1]}`}></div>
                        )}
                        <div className={`w-3.5 h-3.5 rounded-full border border-black z-10 transition-transform hover:scale-125 shadow-lg ${dotColor.split(" ")[0]}`}></div>
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
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-10 h-10 rounded-full border border-orange-500/30 border-dashed animate-spin"></div>
                      <div className="w-2 h-2 rounded-full bg-orange-400 ring-4 ring-orange-500/20 z-10"></div>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] bg-orange-500/20 text-orange-300 px-1 py-0.2 rounded font-sans uppercase font-bold whitespace-nowrap">
                        ⚡ AI Predicted Road Risk
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Map Legend */}
                <div className="absolute bottom-3 left-3 bg-[#0A0A0A]/90 border border-white/10 rounded-lg p-2 flex gap-3 text-[9px] font-sans">
                  <div className="flex items-center gap-1 text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Critical (8-10)
                  </div>
                  <div className="flex items-center gap-1 text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> Medium (4-7)
                  </div>
                  <div className="flex items-center gap-1 text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Resolved
                  </div>
                  <div className="flex items-center gap-1 text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> AI Predict Risk
                  </div>
                </div>

                {/* Hover overlay card */}
                {hoveredIssue && (
                  <div
                    className="absolute bg-neutral-900 border border-white/10 p-3 rounded-xl shadow-2xl z-20 w-48 text-[11px] font-sans transition-all pointer-events-none"
                    style={{
                      left: hoveredIssue.lng > 50 ? "auto" : `${hoveredIssue.lng + 4}%`,
                      right: hoveredIssue.lng > 50 ? `${100 - hoveredIssue.lng + 4}%` : "auto",
                      top: hoveredIssue.lat > 50 ? `${hoveredIssue.lat - 24}%` : `${hoveredIssue.lat + 4}%`,
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-white">#{hoveredIssue.id}</span>
                      <span className={`text-[8px] px-1 py-0.2 rounded uppercase font-semibold ${
                        hoveredIssue.severity >= 8 ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        Sev: {hoveredIssue.severity}/10
                      </span>
                    </div>
                    <div className="text-neutral-300 font-medium truncate">{hoveredIssue.type}</div>
                    <div className="text-neutral-500 truncate mt-0.5">{hoveredIssue.locationName}</div>
                    <div className="text-[10px] text-orange-400 font-semibold mt-1">₹{hoveredIssue.estimatedCost.toLocaleString()} Cost</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "list" && (
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {filteredIssues.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">
                    No matching incidents found in sector.
                  </div>
                ) : (
                  filteredIssues.map((issue) => {
                    let sevColor = "bg-neutral-500/10 text-neutral-400";
                    if (issue.severity >= 8) sevColor = "bg-red-500/10 text-red-400";
                    else if (issue.severity >= 5) sevColor = "bg-yellow-500/10 text-yellow-400";

                    return (
                      <div key={issue.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg flex-shrink-0">
                            {issue.type === "Pothole" ? "🕳️" : issue.type === "Water Leak" ? "💧" : issue.type === "Streetlight" ? "💡" : issue.type === "Garbage" ? "🗑️" : issue.type === "Drainage" ? "🌊" : "📋"}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-neutral-200 truncate font-sans">
                              #{issue.id} — {issue.type} ({issue.locationName})
                            </div>
                            <div className="text-[10px] text-neutral-500 font-sans truncate">{issue.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded font-sans uppercase ${sevColor}`}>
                            {issue.severity}/10 Severity
                          </span>
                          <span className="text-[10px] text-orange-400 font-bold font-mono">₹{issue.estimatedCost.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "predictions" && (
              <div className="space-y-3">
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

            {/* Quick alert bar for pothole detected */}
            {activeReports.length > 0 && (
              <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between text-xs gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="text-base mt-0.5">📢</span>
                  <div>
                    <div className="font-semibold text-neutral-200 font-sans">
                      Active: #{activeReports[0].id} {activeReports[0].type} Complaint
                    </div>
                    <div className="text-[10px] text-neutral-500 font-sans truncate">
                      {activeReports[0].description}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-orange-400 font-bold font-sans bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 shrink-0">
                  Pending Action
                </span>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 relative overflow-hidden group hover:border-orange-500/15 transition-all">
                <span className="text-[9px] text-neutral-500 uppercase font-semibold font-sans">Total Reports</span>
                <div className="text-xl font-display font-medium text-white mt-1">
                  {issues.length}
                </div>
                <div className="text-[9px] text-neutral-400 mt-0.5 font-sans">Sealed on-chain</div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 relative overflow-hidden group hover:border-orange-500/15 transition-all">
                <span className="text-[9px] text-neutral-500 uppercase font-semibold font-sans">Resolved</span>
                <div className="text-xl font-display font-medium text-white mt-1">
                  {resolvedReports.length}
                </div>
                <div className="text-[9px] text-neutral-400 mt-0.5 font-sans">Verifications check</div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 relative overflow-hidden group hover:border-orange-500/15 transition-all">
                <span className="text-[9px] text-neutral-500 uppercase font-semibold font-sans">Avg Fix Time</span>
                <div className="text-xl font-display font-medium text-white mt-1">
                  {stats.avgFixTimeHours}h
                </div>
                <div className="text-[9px] text-neutral-400 mt-0.5 font-sans">Zonal speed</div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 relative overflow-hidden group hover:border-orange-500/15 transition-all">
                <span className="text-[9px] text-neutral-500 uppercase font-semibold font-sans">City Score</span>
                <div className="text-xl font-display font-semibold text-orange-400 mt-1">
                  B+
                </div>
                <div className="text-[9px] text-neutral-400 mt-0.5 font-sans">Ward Zonal average</div>
              </div>
            </div>

            {/* Top Regional Ward Guardians summary */}
            <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
              <span className="text-[10px] uppercase text-neutral-500 tracking-wider font-semibold font-sans block mb-3">
                🏆 Ward Guardian List
              </span>
              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <span className="text-neutral-500">🥇</span> Ravi Kumar
                  </span>
                  <span className="text-orange-400 font-semibold font-mono">9,840 pts</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <span className="text-neutral-500">🥈</span> Priya Nair
                  </span>
                  <span className="text-orange-400 font-semibold font-mono">8,210 pts</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <span className="text-neutral-500">🥉</span> Ahmed Khan
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
    </div>
  );
}

// Function to compute weekly resolved tasks count
function resolvedIssuesCount(issues: Issue[]): number {
  return issues.filter(i => i.status === "Resolved").length;
}
