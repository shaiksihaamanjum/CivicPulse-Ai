import { useState } from "react";
import { 
  Shield, Hammer, AlertTriangle, CheckCircle, ArrowRight, UserCheck, 
  BarChart2, TrendingUp, DollarSign, Clock, Sliders, ArrowUpDown, 
  Filter, Upload, Image, ChevronRight, CheckCircle2 
} from "lucide-react";
import { Issue } from "../types";

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

const simulatedProofs = [
  { name: "Clean Asphalt Patch", url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80" },
  { name: "New PVC Valve Fitted", url: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&w=600&q=80" },
  { name: "Garbage Cleared & Bleached", url: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80" },
  { name: "LED Bracket Installed", url: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=600&q=80" },
];

const departmentsMapping = [
  { label: "Roads (PWD Roads)", value: "PWD Roads" },
  { label: "Water (BMC Water Dept)", value: "BMC Water Dept" },
  { label: "Sanitation (BMC Sanitation)", value: "BMC Sanitation" },
  { label: "Electricity (BEST Electricity)", value: "BEST Electricity" },
  { label: "Public Safety (Municipal Safety)", value: "Municipal Safety" },
];

export default function AuthorityPortal({ issues, onActionSuccess, selectedPersona = "resident" }: AuthorityPortalProps) {
  // Inbox Filters & Sorting States
  const [filterDept, setFilterDept] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("Pending"); // "All", "Pending" (not Resolved), "Reported", "Under Review", "Verified", "Assigned", "In Progress", "Escalated", "Resolved"
  const [sortBy, setSortBy] = useState<"priority" | "cost" | "date">("priority");

  // Selected Issue Operations State
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Administrative Field Edit States (populated on ticket selection)
  const [editStatus, setEditStatus] = useState<string>("");
  const [editDept, setEditDept] = useState<string>("");
  const [editSeverity, setEditSeverity] = useState<number>(5);
  const [editNotes, setEditNotes] = useState<string>("");
  const [editProofImage, setEditProofImage] = useState<string>("");
  const [editContractor, setEditContractor] = useState<string>("");
  const [editProgress, setEditProgress] = useState<number>(0);

  // Before/After Image Slider value (0-100)
  const [compareSlider, setCompareSlider] = useState<number>(50);

  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  const handleSelectIssue = (issue: Issue) => {
    setSelectedIssueId(issue.id);
    setEditStatus(issue.status);
    setEditDept(issue.department);
    setEditSeverity(issue.severity);
    setEditNotes(issue.completionNotes || "");
    setEditProofImage(issue.afterImage || "");
    setEditContractor(issue.contractor || "");
    setEditProgress(issue.progress || 0);
    setIsEditing(true);
  };

  const handleSaveAdminUpdate = async () => {
    if (!selectedIssueId) return;
    setLoadingId(selectedIssueId);
    try {
      const response = await fetch(`/api/issues/${selectedIssueId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADMIN_UPDATE",
          status: editStatus,
          department: editDept,
          severity: editSeverity,
          contractor: editContractor,
          progress: editProgress,
          afterImage: editProofImage,
          completionNotes: editNotes
        }),
      });
      if (response.ok) {
        onActionSuccess();
        setIsEditing(false);
        // Refresh selected issue values locally
        const updated = issues.find(i => i.id === selectedIssueId);
        if (updated) {
          setEditStatus(updated.status);
          setEditDept(updated.department);
          setEditSeverity(updated.severity);
          setEditNotes(updated.completionNotes || "");
          setEditProofImage(updated.afterImage || "");
          setEditContractor(updated.contractor || "");
          setEditProgress(updated.progress || 0);
        }
      }
    } catch (err) {
      console.error("Admin update failed:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleQuickAssignContractor = (contractorName: string) => {
    setEditContractor(contractorName);
    if (editStatus === "Reported" || editStatus === "Under Review" || editStatus === "Verified") {
      setEditStatus("In Progress");
    }
    if (editProgress < 15) {
      setEditProgress(15);
    }
  };

  const handleSelectSimulatedProof = (url: string) => {
    setEditProofImage(url);
    setEditStatus("Resolved");
    setEditProgress(100);
    if (!editNotes) {
      setEditNotes("Zonal engineer verified structural fix in field. Quality benchmarks achieved.");
    }
  };

  // Compute stats based on current issues
  const pendingCount = issues.filter(i => i.status !== "Resolved").length;
  const resolvedIssues = issues.filter(i => i.status === "Resolved");
  const totalCostResolved = resolvedIssues.reduce((acc, i) => acc + i.estimatedCost, 0);

  // Dynamic Department Performance analytics computed from live issues list
  const municipalDepartments = [
    "PWD Roads",
    "BMC Water Dept",
    "BMC Sanitation",
    "BEST Electricity",
    "Municipal Safety"
  ];

  const deptStats = municipalDepartments.map(dept => {
    const deptIssues = issues.filter(i => {
      const issueD = i.department.toLowerCase();
      const mappedD = dept.toLowerCase();
      return issueD.includes(mappedD) || mappedD.includes(issueD);
    });
    
    const total = deptIssues.length;
    const resolved = deptIssues.filter(i => i.status === "Resolved").length;
    const active = total - resolved;
    
    // Performance score: base reliability is 85%, adjust based on actual issues
    let successRate = 92;
    if (total > 0) {
      successRate = Math.round((resolved / total) * 100);
    } else {
      // Small randomized high standard for empty departments to look realistic
      const hash = dept.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      successRate = 88 + (hash % 10);
    }
    
    // Avg resolution time: dynamic
    let avgTime = 28;
    const resolvedWithTime = deptIssues.filter(i => i.status === "Resolved" && i.resolvedAt);
    if (resolvedWithTime.length > 0) {
      const totalTime = resolvedWithTime.reduce((sum, i) => {
        const reported = new Date(i.reportedAt).getTime();
        const resolved = new Date(i.resolvedAt!).getTime();
        const diffHrs = Math.max(1, (resolved - reported) / (1000 * 3600));
        return sum + diffHrs;
      }, 0);
      avgTime = Math.round(totalTime / resolvedWithTime.length);
    } else {
      avgTime = Math.max(16, 48 - (successRate * 0.25));
    }

    return {
      name: dept === "PWD Roads" ? "Roads" : dept === "BMC Water Dept" ? "Water" : dept === "BMC Sanitation" ? "Sanitation" : dept === "BEST Electricity" ? "Electricity" : "Public Safety",
      fullName: dept,
      total,
      resolved,
      active,
      successRate,
      avgTimeHours: parseFloat(avgTime.toFixed(1))
    };
  });

  const overallAvgResTime = Math.round(
    deptStats.reduce((sum, d) => sum + d.avgTimeHours, 0) / deptStats.length
  );

  // Process issues inside the inbox list using active filters and sorting
  const processedIssues = issues.filter(issue => {
    // 1. Department filter
    let matchesDept = true;
    if (filterDept !== "All") {
      const issueD = issue.department.toLowerCase();
      const filterD = filterDept.toLowerCase();
      matchesDept = issueD.includes(filterD) || filterD.includes(issueD);
    }

    // 2. Status filter
    let matchesStatus = true;
    if (filterStatus === "Pending") {
      matchesStatus = issue.status !== "Resolved";
    } else if (filterStatus !== "All") {
      matchesStatus = issue.status === filterStatus;
    }

    return matchesDept && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "priority") {
      // Sort by severity (1-10) descending
      return b.severity - a.severity;
    } else if (sortBy === "cost") {
      // Sort by cost descending
      return b.estimatedCost - a.estimatedCost;
    } else {
      // Sort by date reported descending
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
    }
  });

  const handleExportCSV = () => {
    const headers = ["ID", "Type", "Status", "Department", "Severity", "Location", "ReportedAt", "Cost", "Contractor", "Progress"];
    const rows = processedIssues.map(issue => [
      issue.id,
      issue.type,
      issue.status,
      issue.department,
      issue.severity,
      issue.locationName.replace(/"/g, '""'),
      issue.reportedAt,
      issue.estimatedCost,
      issue.contractor || "Unassigned",
      issue.progress || 0
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `civicpulse_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(processedIssues, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `civicpulse_ledger_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-[#050505]">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[300px] bg-orange-600/5 blur-[120px] pointer-events-none rounded-full"></div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-4 mb-16 items-start lg:items-center">
        <span className="text-6xl sm:text-8xl text-white/5 font-display font-light leading-none tracking-tighter">07.</span>
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl text-white font-display font-medium tracking-tight flex items-center gap-3">
            Authority Command Center
            <span className="inline-flex items-center gap-1.5 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full font-sans font-semibold">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Zonal Operations Live
            </span>
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
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Header & Filter Controls Bar */}
            <div className="bg-white/5 border-b border-white/5 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <span className="text-white text-sm font-semibold font-sans tracking-tight">Zonal Incident Desk</span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full font-sans font-semibold">
                    {pendingCount} Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1 text-[10px] text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-2.5 py-1 rounded-lg transition font-sans cursor-pointer"
                    title="Export filtered records to CSV"
                  >
                    📥 Export CSV
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="inline-flex items-center gap-1 text-[10px] text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-2.5 py-1 rounded-lg transition font-sans cursor-pointer"
                    title="Export filtered records to JSON"
                  >
                    📄 JSON
                  </button>
                  <span className="text-xs text-neutral-500 font-sans hidden sm:inline">|</span>
                  <span className="text-xs text-neutral-400 font-sans">Kurla Ward 7</span>
                </div>
              </div>

              {/* Advanced Operations Filter Ribbons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Pending Issue Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-neutral-500 font-bold font-sans flex items-center gap-1">
                    <Filter className="w-3 h-3 text-orange-500" /> Filter Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-sans focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="All">All Tickets</option>
                    <option value="Pending">All Pending (Unresolved)</option>
                    <option value="Reported">Reported</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Verified">Verified</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Resolved">Resolved (Fixed)</option>
                  </select>
                </div>

                {/* Department Assignment Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-neutral-500 font-bold font-sans flex items-center gap-1">
                    🏢 Zonal Department
                  </label>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-sans focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="All">All Departments</option>
                    <option value="PWD Roads">Roads</option>
                    <option value="BMC Water Dept">Water</option>
                    <option value="BMC Sanitation">Sanitation</option>
                    <option value="BEST Electricity">Electricity</option>
                    <option value="Municipal Safety">Public Safety</option>
                  </select>
                </div>

                {/* Priority Sorting dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-neutral-500 font-bold font-sans flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-orange-500" /> Sort Registry
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-sans focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="priority">Priority (Severity DESC)</option>
                    <option value="cost">Estimated Repair Cost</option>
                    <option value="date">Date Filed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Issue Rows */}
            <div className="divide-y divide-white/5 max-h-[640px] overflow-y-auto">
              {processedIssues.length === 0 ? (
                <div className="text-center py-20 text-neutral-500 font-sans text-xs flex flex-col items-center justify-center space-y-2">
                  <span>📋</span>
                  <span>No incidents match the active search filters.</span>
                </div>
              ) : (
                processedIssues.map((issue) => {
                  let statusColor = "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
                  if (issue.status === "Reported") statusColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                  if (issue.status === "Under Review") statusColor = "bg-sky-500/10 text-sky-400 border-sky-500/20";
                  if (issue.status === "Verified") statusColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
                  if (issue.status === "Escalated") statusColor = "bg-red-500/10 text-red-400 border-red-500/20";
                  if (issue.status === "In Progress" || issue.status === "Assigned") statusColor = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
                  if (issue.status === "Resolved") statusColor = "bg-green-500/10 text-green-400 border-green-500/20";

                  const isCurrentActive = selectedIssueId === issue.id;

                  return (
                    <div
                      key={issue.id}
                      onClick={() => handleSelectIssue(issue)}
                      className={`p-5 transition-all duration-200 cursor-pointer ${
                        isCurrentActive ? "bg-orange-500/[0.03] border-l-2 border-orange-500" : "hover:bg-white/[0.01]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex gap-3 items-start min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                            {issue.type === "Pothole" ? "🕳️" : issue.type === "Water Leak" || issue.type === "Water Leakage" ? "💧" : issue.type === "Streetlight" || issue.type === "Streetlight Damage" ? "💡" : issue.type === "Garbage" || issue.type === "Waste Management" ? "🗑️" : issue.type === "Drainage" ? "🌊" : "📋"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-neutral-100 font-sans">
                                #{issue.id} — {issue.type}
                              </span>
                              <span className={`text-[9px] font-semibold border px-1.5 py-0.5 rounded uppercase ${statusColor}`}>
                                {issue.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-1 font-sans">{issue.locationName}</div>
                            
                            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans line-clamp-2">
                              {issue.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[10px] text-neutral-500 font-sans">
                              <span>Priority Score: <strong className="text-orange-400 font-mono font-bold">Sev {issue.severity}/10</strong></span>
                              <span>• Dept: <strong className="text-neutral-300 font-medium">{issue.department}</strong></span>
                              <span>• Cost: <strong className="text-neutral-300 font-medium">₹{issue.estimatedCost.toLocaleString()}</strong></span>
                              {issue.contractor && (
                                <span>• Contractor: <strong className="text-yellow-400 font-medium">{issue.contractor}</strong></span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Visual indicator arrow */}
                        <div className="shrink-0 self-center">
                          <ChevronRight className={`w-4 h-4 text-neutral-500 transition-transform ${isCurrentActive ? "rotate-90 text-orange-500" : ""}`} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Analytics, Control Hub, Registry */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Municipal Command Incident Control Hub (Shows when a ticket is clicked) */}
          {isEditing && selectedIssue ? (
            <div className="bg-[#0A0A0A] border border-orange-500/20 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <div>
                    <h3 className="text-white text-sm font-bold font-sans">Incident Command Hub</h3>
                    <span className="text-[10px] text-neutral-500 font-mono">Modifying ticket #{selectedIssue.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-neutral-400 hover:text-white bg-white/5 rounded-lg px-2 py-1 font-sans cursor-pointer"
                >
                  Close Hub
                </button>
              </div>

              {/* Before/After slider section */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase text-neutral-400 font-bold font-sans flex items-center justify-between">
                  <span>Interactive Slider Audit</span>
                  <span className="text-orange-400 text-[9px]">Drag slider to compare before/after</span>
                </span>
                
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 bg-black">
                  {/* After Image (Full width background) */}
                  <img 
                    src={editProofImage || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80"} 
                    alt="Resolution After" 
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded font-sans uppercase z-10">
                    After (Proof)
                  </div>

                  {/* Before Image (Clipped width) */}
                  <div 
                    className="absolute inset-y-0 left-0 overflow-hidden border-r border-orange-500"
                    style={{ width: `${compareSlider}%` }}
                  >
                    <img 
                      src={selectedIssue.beforeImage || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80"} 
                      alt="Complaint Before" 
                      className="absolute inset-y-0 left-0 w-full h-full object-cover max-w-none"
                      style={{ width: "100%", height: "180px" }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-sans uppercase z-10">
                      Before
                    </div>
                  </div>

                  {/* Slider controller range overlay */}
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={compareSlider} 
                    onChange={(e) => setCompareSlider(parseInt(e.target.value))} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                  />
                  
                  {/* Sliding marker line */}
                  <div 
                    className="absolute inset-y-0 pointer-events-none flex items-center justify-center"
                    style={{ left: `${compareSlider}%`, transform: "translateX(-50%)" }}
                  >
                    <div className="w-0.5 h-full bg-orange-500 shadow-xl"></div>
                    <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[8px] font-bold shadow-xl border border-white/20">
                      ↔
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit status, edit department, edit severity (Priority) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-semibold font-sans">Set Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs font-sans focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="Reported">Reported</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Verified">Verified</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-semibold font-sans">Assign Department</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs font-sans focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {departmentsMapping.map((d, i) => (
                      <option key={i} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Severity/Priority slider & Contractor Assignment */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-neutral-400">
                    <span>Priority Severity Index</span>
                    <strong className="text-orange-400 font-mono font-bold">{editSeverity}/10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={editSeverity}
                    onChange={(e) => setEditSeverity(parseInt(e.target.value))}
                    className="w-full h-1.5 accent-orange-500 bg-white/5 rounded-full cursor-pointer focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-semibold font-sans">Active Contractor</label>
                  <input
                    type="text"
                    value={editContractor}
                    onChange={(e) => setEditContractor(e.target.value)}
                    placeholder="Type or click registry contractor below..."
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs font-sans focus:outline-none focus:border-orange-500"
                  />
                  
                  {/* Small quick select contractors list */}
                  <div className="flex gap-1.5 overflow-x-auto pt-1 scrollbar-none">
                    {contractorsList.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleQuickAssignContractor(c.name)}
                        className={`text-[9px] shrink-0 font-sans px-2 py-1 rounded bg-white/5 border border-white/5 hover:border-orange-500/40 text-neutral-300 hover:text-white cursor-pointer ${
                          editContractor === c.name ? "border-orange-500 text-orange-400 bg-orange-500/5 font-semibold" : ""
                        }`}
                      >
                        {c.name.split(" ")[0]} ({c.specialty.split(" ")[0]})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-neutral-400">
                  <span>Work Progress Percentage</span>
                  <strong className="text-white font-mono font-bold">{editProgress}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editProgress}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setEditProgress(val);
                    if (val === 100) {
                      setEditStatus("Resolved");
                    } else if (val > 0 && editStatus === "Reported") {
                      setEditStatus("In Progress");
                    }
                  }}
                  className="w-full h-1.5 accent-orange-500 bg-white/5 rounded-full cursor-pointer focus:outline-none"
                />
              </div>

              {/* Upload Resolution Proof / Simulation Proof */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 font-semibold font-sans flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-orange-500" /> Resolution Proof Image
                </label>
                <input
                  type="text"
                  value={editProofImage}
                  onChange={(e) => setEditProofImage(e.target.value)}
                  placeholder="Paste verified complete image URL..."
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-1.5 text-white text-[11px] font-mono focus:outline-none focus:border-orange-500"
                />
                
                {/* Simulated Quick Select Proof Assets */}
                <div className="space-y-1">
                  <span className="text-[8px] text-neutral-500 uppercase font-bold tracking-wider font-sans block">Simulate Resolution Proof Asset (Demo Click)</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {simulatedProofs.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSimulatedProof(p.url)}
                        className={`text-[9px] text-left p-1.5 rounded bg-white/5 border border-white/5 hover:bg-orange-500/5 hover:border-orange-500/30 text-neutral-400 hover:text-white font-sans transition truncate cursor-pointer ${
                          editProofImage === p.url ? "border-orange-500 text-orange-400 bg-orange-500/5 font-semibold" : ""
                        }`}
                      >
                        ✅ {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Completion Notes */}
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-semibold font-sans">Resolution Completion Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Describe technical procedures achieved, materials deployed..."
                  rows={2}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 resize-none font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  onClick={handleSaveAdminUpdate}
                  disabled={loadingId === selectedIssueId}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold font-sans hover:brightness-110 shadow-lg disabled:opacity-50 transition cursor-pointer text-center"
                >
                  {loadingId === selectedIssueId ? "Writing Ledger..." : "💾 Commit Changes to Ledger"}
                </button>
              </div>

            </div>
          ) : null}

          {/* Department Performance Stats Panel (Always shown, or below edit hub if edited) */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
            <h3 className="text-white text-base font-semibold font-sans flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-orange-500" />
                Department Performance Stats
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] text-neutral-500 bg-white/5 px-2 py-0.5 rounded font-mono font-bold">
                Live Audit
              </span>
            </h3>
            
            <div className="divide-y divide-white/5 space-y-4">
              {deptStats.map((dept, idx) => (
                <div key={idx} className="pt-3.5 first:pt-0">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-neutral-200 font-medium font-sans">{dept.name}</span>
                    <span className="text-neutral-500 text-[10px] font-sans flex gap-2">
                      <span>Resolved: <strong className="text-green-400">{dept.resolved}</strong></span>
                      <span>•</span>
                      <span>Active: <strong className="text-neutral-400">{dept.active}</strong></span>
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400 mb-1.5 text-[10px] font-sans">
                    <span>Resolution Rate: <strong className="text-green-400 font-mono">{dept.successRate}%</strong></span>
                    <span>Avg Speed: <strong className="text-white font-mono">{dept.avgTimeHours}hrs</strong></span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${
                        dept.successRate >= 85 ? "from-green-500 to-emerald-400" : dept.successRate >= 60 ? "from-yellow-500 to-orange-400" : "from-red-500 to-orange-500"
                      }`} 
                      style={{ width: `${dept.successRate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-sans text-neutral-400">
              <span>Overall Average Resolution Time:</span>
              <span className="text-white font-mono font-bold">{overallAvgResTime} hours</span>
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

          {/* Available Contractors Panel */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-white text-base font-semibold font-sans mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-orange-500" />
              Zonal Contractor Registry
            </h3>

            <div className="space-y-3 font-sans text-xs">
              {contractorsList.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <div>
                    <div className="text-white font-semibold">{c.name}</div>
                    <div className="text-neutral-500 text-[10px] mt-0.5">{c.specialty} Specialist • {c.distance}</div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    i % 2 === 0 
                      ? "text-green-400 bg-green-500/10 border-green-500/20" 
                      : "text-yellow-400 bg-yellow-500/10 border-yellow-500/20 animate-pulse"
                  }`}>
                    {i % 2 === 0 ? "Available" : "Active Job"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
    </section>
  );
}
