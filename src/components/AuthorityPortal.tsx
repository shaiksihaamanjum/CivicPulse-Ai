import { useState } from "react";
import { Shield, Hammer, AlertTriangle, CheckCircle, ArrowRight, UserCheck, BarChart2, TrendingUp, DollarSign } from "lucide-react";
import { Issue, BlockLog } from "../types";

interface AuthorityPortalProps {
  issues: Issue[];
  onActionSuccess: () => void;
  selectedPersona?: "resident" | "analyst" | "administrator";
}

const contractorsList = [
  { name: "Rajesh Plumbing Co.", specialty: "Water & Drainage", rating: "4.8★", distance: "2km away" },
  { name: "Metro Road Works", specialty: "Roads & Potholes", rating: "4.6★", distance: "5km away" },
  { name: "Bright Electric Ltd.", specialty: "Street Lighting", rating: "4.9★", distance: "1km away" },
  { name: "Mumbai Waste Clear", specialty: "Waste & Sanitation", rating: "4.5★", distance: "3km away" },
];

export default function AuthorityPortal({ issues, onActionSuccess, selectedPersona = "resident" }: AuthorityPortalProps) {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [assigningForId, setAssigningForId] = useState<string | null>(null);
  const [sliderVal, setSliderVal] = useState<number>(50);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleEscalate = async (issueId: string) => {
    setLoadingId(issueId);
    try {
      const response = await fetch(`/api/issues/${issueId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ESCALATE" }),
      });
      if (response.ok) {
        onActionSuccess();
      }
    } catch (err) {
      console.error("Escalation failed:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAssignContractor = async (issueId: string, contractorName: string) => {
    setLoadingId(issueId);
    try {
      const response = await fetch(`/api/issues/${issueId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSIGN_CONTRACTOR",
          contractor: contractorName,
          progress: 15,
        }),
      });
      if (response.ok) {
        onActionSuccess();
        setAssigningForId(null);
      }
    } catch (err) {
      console.error("Contractor assignment failed:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdateProgress = async (issueId: string, progress: number) => {
    setLoadingId(issueId);
    try {
      const response = await fetch(`/api/issues/${issueId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_PROGRESS",
          progress,
        }),
      });
      if (response.ok) {
        onActionSuccess();
        setSelectedIssueId(null);
      }
    } catch (err) {
      console.error("Progress update failed:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleResolve = async (issueId: string) => {
    setLoadingId(issueId);
    try {
      const response = await fetch(`/api/issues/${issueId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESOLVE" }),
      });
      if (response.ok) {
        onActionSuccess();
        setSelectedIssueId(null);
      }
    } catch (err) {
      console.error("Resolution failed:", err);
    } finally {
      setLoadingId(null);
    }
  };

  // Compute stats based on current issues
  const pendingCount = issues.filter(i => i.status === "Active" || i.status === "Escalated").length;
  const inProgressIssues = issues.filter(i => i.status === "In Progress");
  const resolvedIssues = issues.filter(i => i.status === "Resolved");
  const totalCostResolved = resolvedIssues.reduce((acc, i) => acc + i.estimatedCost, 0);

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-[#050505]">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[300px] bg-orange-600/5 blur-[120px] pointer-events-none rounded-full"></div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-4 mb-16 items-start lg:items-center">
        <span className="text-6xl sm:text-8xl text-white/5 font-display font-light leading-none tracking-tighter">07.</span>
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl text-white font-display font-medium tracking-tight">
            Authority Command Center
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed font-sans">
            A complete municipal administration portal. Zonal commissioners and city contractors track public filings, check Gemini repair techniques, approve budgets, and close out tickets in full transparency.
          </p>
        </div>
      </div>

      <div className="relative">
        {selectedPersona !== "administrator" && (
          <div className="absolute inset-0 bg-[#050505]/92 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-6 rounded-3xl border border-white/5">
            <div className="bg-[#0A0A0A] border border-orange-500/20 p-8 rounded-3xl max-w-md space-y-4 shadow-2xl">
              <span className="text-4xl block">🛡️ Locked to Residents</span>
              <h3 className="text-lg font-semibold text-white font-sans">Administrative Operations Dashboard</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                You are currently previewing the platform in <strong className="text-orange-400">Resident View</strong>. The ability to allocate contractor budgets, route tasks, and sign off completed tasks is reserved for accredited Zonal Officers.
              </p>
              <div className="p-3.5 bg-orange-500/5 rounded-xl border border-orange-500/10 text-[11px] text-orange-400 leading-normal font-sans">
                💡 <strong>Try this:</strong> Scroll up to the <strong>Persona Switcher</strong> and click <strong>Zonal Officer View</strong> to instantly unlock this command center!
              </div>
            </div>
          </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Column: Active Issue Inbox */}
        <div className="lg:col-span-7">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5 gap-3">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-orange-500" />
                <span className="text-white text-sm font-semibold font-sans tracking-tight">Zonal Officer Inbox</span>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full font-sans font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                  {pendingCount} Pending tickets
                </span>
              </div>
              <span className="text-xs text-neutral-400 font-sans">Kurla & Ward 7 Sector</span>
            </div>

            {/* Issue Rows */}
            <div className="divide-y divide-white/5">
              {issues.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 font-sans text-xs">
                  No active complaints found. The city is clean!
                </div>
              ) : (
                issues.map((issue) => {
                  let statusColor = "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
                  if (issue.status === "Active") statusColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                  if (issue.status === "Escalated") statusColor = "bg-red-500/10 text-red-400 border-red-500/20";
                  if (issue.status === "In Progress") statusColor = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
                  if (issue.status === "Resolved") statusColor = "bg-green-500/10 text-green-400 border-green-500/20";

                  const isAssigning = assigningForId === issue.id;
                  const isActionActive = selectedIssueId === issue.id;

                  return (
                    <div
                      key={issue.id}
                      className={`p-6 transition-all duration-200 ${
                        isActionActive ? "bg-white/[0.02]" : "hover:bg-white/[0.01]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex gap-3 items-start min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                            {issue.type === "Pothole" ? "🕳️" : issue.type === "Water Leak" ? "💧" : issue.type === "Streetlight" ? "💡" : issue.type === "Garbage" ? "🗑️" : issue.type === "Drainage" ? "🌊" : "📋"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-neutral-100 font-sans">
                                #{issue.id} — {issue.type} ({issue.locationName})
                              </span>
                              <span className={`text-[9px] font-semibold border px-1.5 py-0.5 rounded uppercase ${statusColor}`}>
                                {issue.status}
                              </span>
                            </div>
                            
                            <p className="text-xs text-neutral-400 mt-1 leading-relaxed font-sans line-clamp-2">
                              {issue.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-[10px] text-neutral-500 font-sans">
                              <span>Reporter: <strong className="text-neutral-300 font-medium">{issue.reporter}</strong></span>
                              <span>• Zonal Dept: <strong className="text-neutral-300 font-medium">{issue.department}</strong></span>
                              <span>• Repair Cost: <strong className="text-orange-400 font-medium">₹{issue.estimatedCost.toLocaleString()}</strong></span>
                              {issue.contractor && (
                                <span>• Contractor: <strong className="text-yellow-400 font-medium">{issue.contractor}</strong></span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Direct Action Buttons */}
                        <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                          {issue.status === "Active" && (
                            <>
                              <button
                                onClick={() => setAssigningForId(isAssigning ? null : issue.id)}
                                className="text-xs text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-lg px-3 py-1.5 font-sans font-medium hover:brightness-110 shadow-sm transition cursor-pointer"
                              >
                                Assign Contractor
                              </button>
                              <button
                                onClick={() => handleEscalate(issue.id)}
                                disabled={loadingId === issue.id}
                                className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 font-sans hover:bg-red-500/20 transition cursor-pointer disabled:opacity-50"
                              >
                                Escalate Ticket
                              </button>
                            </>
                          )}

                          {issue.status === "Escalated" && (
                            <button
                              onClick={() => setAssigningForId(isAssigning ? null : issue.id)}
                              className="text-xs text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-lg px-3 py-1.5 font-sans font-medium hover:brightness-110 shadow-sm transition cursor-pointer"
                            >
                              Fast-Track Contractor
                            </button>
                          )}

                          {issue.status === "In Progress" && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedIssueId(isActionActive ? null : issue.id);
                                  setSliderVal(issue.progress || 50);
                                }}
                                className="text-xs text-white bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 font-sans hover:bg-white/10 transition cursor-pointer"
                              >
                                Adjust Progress
                              </button>
                              <button
                                onClick={() => handleResolve(issue.id)}
                                disabled={loadingId === issue.id}
                                className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5 font-sans hover:bg-green-500/20 transition cursor-pointer"
                              >
                                Mark Resolved
                              </button>
                            </>
                          )}

                          {issue.status === "Resolved" && (
                            <span className="text-[10px] text-green-400 font-sans flex items-center gap-1 font-semibold pr-2">
                              <CheckCircle className="w-3.5 h-3.5" /> Verified Fixed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable Contractor Assignment Tray */}
                      {isAssigning && (
                        <div className="mt-4 p-4 rounded-2xl bg-black border border-white/5 space-y-3">
                          <div className="text-xs text-neutral-400 font-sans font-semibold uppercase tracking-wider">
                            Select Local Pre-Approved Contractor
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {contractorsList.map((c, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleAssignContractor(issue.id, c.name)}
                                className="p-3 rounded-xl bg-white/5 hover:bg-orange-500/5 hover:border-orange-500/30 border border-white/5 text-left text-xs transition duration-200"
                              >
                                <div className="text-white font-semibold font-sans">{c.name}</div>
                                <div className="text-neutral-500 mt-1 flex justify-between font-sans">
                                  <span>{c.specialty}</span>
                                  <span>{c.distance}</span>
                                </div>
                                <div className="text-[10px] text-orange-400 mt-1 font-sans">{c.rating} reliability</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expandable Progress Slider Tray */}
                      {isActionActive && issue.status === "In Progress" && (
                        <div className="mt-4 p-4 rounded-2xl bg-black border border-white/5 space-y-3">
                          <div className="flex justify-between items-center text-xs font-sans font-medium text-neutral-400">
                            <span>Update Work Completion Percentage</span>
                            <span className="text-white font-bold text-sm font-mono">{sliderVal}%</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="15"
                              max="100"
                              step="5"
                              value={sliderVal}
                              onChange={(e) => setSliderVal(parseInt(e.target.value))}
                              className="flex-1 accent-orange-500 bg-white/5 h-1.5 rounded-full focus:outline-none cursor-pointer"
                            />
                            <button
                              onClick={() => handleUpdateProgress(issue.id, sliderVal)}
                              className="text-xs text-white bg-orange-500 hover:bg-orange-600 rounded-lg px-3 py-1.5 font-sans font-medium transition cursor-pointer"
                            >
                              Seal Progress Update
                            </button>
                          </div>
                        </div>
                      )}

                      {/* AI Plan Preview Box (Always shown for pending and active items to larp properly) */}
                      {issue.aiPlan && (issue.status === "Active" || issue.status === "Escalated") && (
                        <div className="mt-3.5 bg-[#0e0c0a] border border-orange-500/10 rounded-2xl p-3.5">
                          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest font-sans flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-orange-500" />
                            Zonal AI Action Plan
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-[11px] text-neutral-400 font-sans">
                            <div>• Method: <strong className="text-neutral-200 font-medium">{issue.aiPlan.technique}</strong></div>
                            <div>• Recommended Crew: <strong className="text-neutral-200 font-medium">{issue.aiPlan.crewSize} workers</strong></div>
                            <div>• Estimated Hours: <strong className="text-neutral-200 font-medium">{issue.aiPlan.hoursEstimate}h</strong></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Analytics, Contractors, Budget */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Officer Metrics */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-white text-base font-semibold font-sans mb-5 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-orange-500" />
              Zonal Officer Performance
            </h3>
            
            <div className="space-y-4 font-sans text-xs">
              <div>
                <div className="flex justify-between text-neutral-400 mb-1.5">
                  <span>Total Resolution Rate</span>
                  <span className="text-green-400 font-semibold font-mono">94.7%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: "94.7%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1.5">
                  <span>Avg Response Speed</span>
                  <span className="text-white font-mono">32hrs (Target: 48hrs)</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: "67%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1.5">
                  <span>Citizen Satisfaction Index</span>
                  <span className="text-white font-semibold font-mono">88%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: "88%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Contractors Panel */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-white text-base font-semibold font-sans mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-orange-500" />
              Zonal Contractor Registry
            </h3>

            <div className="space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
                <div>
                  <div className="text-white font-semibold">Rajesh Plumbing Co.</div>
                  <div className="text-neutral-500 text-[10px] mt-0.5">Water & Drainage Specialist • Mumbai</div>
                </div>
                <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded">
                  Available
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
                <div>
                  <div className="text-white font-semibold">Metro Road Works</div>
                  <div className="text-neutral-500 text-[10px] mt-0.5">Paving & Asphalt Crew • Kurla Sector</div>
                </div>
                <span className="text-[10px] font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded animate-pulse">
                  Active Job
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
                <div>
                  <div className="text-white font-semibold">Bright Electric Ltd.</div>
                  <div className="text-neutral-500 text-[10px] mt-0.5">Lighting & Grid Maintenance • Bandra</div>
                </div>
                <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded">
                  Available
                </span>
              </div>
            </div>
          </div>

          {/* Allocated Budget Tracker */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5">
              <DollarSign className="w-32 h-32 text-orange-500" />
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-base font-semibold font-sans flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-500" />
                Zonal Budget Ledger
              </h3>
              <span className="text-xs text-orange-400 font-sans font-medium">Kurla Ward</span>
            </div>

            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-3xl font-display font-semibold text-white">
                ₹{(2480000 + totalCostResolved).toLocaleString()}
              </span>
              <span className="text-xs text-neutral-500 font-sans">/ ₹3,440,000 allocated</span>
            </div>

            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((2480000 + totalCostResolved) / 3440000) * 100)}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center font-sans">
              <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                <div className="text-[10px] text-neutral-500 font-semibold uppercase">Roads</div>
                <div className="text-xs text-white font-semibold mt-0.5">₹1,120,000</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                <div className="text-[10px] text-neutral-500 font-semibold uppercase">Water</div>
                <div className="text-xs text-white font-semibold mt-0.5">₹840,000</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                <div className="text-[10px] text-neutral-500 font-semibold uppercase">Closed Tasks</div>
                <div className="text-xs text-orange-400 font-bold mt-0.5">₹{totalCostResolved.toLocaleString()}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    </section>
  );
}
