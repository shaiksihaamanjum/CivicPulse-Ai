import { Map, Lock, BrainCircuit, Mic, Camera, Navigation, ArrowUpRight, Shield, Layers } from "lucide-react";
import OrbitSphere from "./three/OrbitSphere";

const pillars = [
  {
    icon: <Map className="w-6 h-6 text-neutral-400 group-hover:text-orange-500 transition-colors" />,
    title: "Resilient Synchronization",
    description: "Works with robust synchronization pipelines. Reports are instantly stored and securely synchronized in real-time with our Node.js database, ensuring prompt dispatch to zonal queues.",
  },
  {
    icon: <Lock className="w-6 h-6 text-neutral-400 group-hover:text-orange-500 transition-colors" />,
    title: "Ledger Accountability Simulator",
    description: "Every submission, municipal assignment, contractor update, and citizen verification is recorded in a simulated unalterable ledger, demonstrating how complete transparency prevents tampering.",
  },
  {
    icon: <BrainCircuit className="w-6 h-6 text-neutral-400 group-hover:text-orange-500 transition-colors" />,
    title: "Risk Diagnostics (Demo)",
    description: "Analyzes report categories, frequency, and cluster locations using Gemini to flag high-risk infrastructure failures before they impact the broader community.",
  },
];

const departments = [
  { icon: "🛣️", label: "Roads", angle: 0 },
  { icon: "💧", label: "Water", angle: 60 },
  { icon: "💡", label: "Power", angle: 120 },
  { icon: "🗑️", label: "Waste", angle: 180 },
  { icon: "🌳", label: "Parks", angle: 240 },
  { icon: "🔗", label: "Blockchain", angle: 300 },
];

export default function Features() {
  return (
    <section id="features" className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-[#050505]">
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[500px] bg-orange-950/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-16">
        <div className="flex items-start gap-4 sm:gap-6">
          <span className="text-6xl sm:text-8xl text-white/5 font-display font-light leading-none tracking-tighter">01.</span>
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl text-white font-display font-medium tracking-tight">
              The 5-Layer Civic OS
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed font-sans">
              From voice submissions in native dialects to automated blockchain audits, CivicPulse AI bridges the gap between public voice and civic execution with an immutable operating stack.
            </p>
          </div>
        </div>
      </div>

      {/* Grid containing Interactive Features */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 relative z-10">
        
        {/* Left Side: Dynamic Feature Block */}
        <div className="lg:col-span-7 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50"></div>
          
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-orange-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-sans">Multimodal reporting layers</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/20 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 mb-2">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-xs text-neutral-300 font-medium font-sans">Voice Reporting</span>
                <span className="text-[10px] text-neutral-500 mt-1 font-sans">50+ Languages</span>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/20 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 mb-2">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs text-neutral-300 font-medium font-sans">Vision AI Scan</span>
                <span className="text-[10px] text-neutral-500 mt-1 font-sans">Estimate severity</span>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/20 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 mb-2">
                  <Navigation className="w-5 h-5" />
                </div>
                <span className="text-xs text-neutral-300 font-medium font-sans">Auto Geo-Tag</span>
                <span className="text-[10px] text-neutral-500 mt-1 font-sans">Pin coordinates</span>
              </div>
            </div>

            {/* Simulated Live Routing Progress Table */}
            <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/40 p-4 space-y-3 mb-6">
              <div className="flex justify-between text-[11px] text-neutral-500 uppercase tracking-wider font-semibold font-sans px-1">
                <span>Core Channels</span>
                <span>Zonal Priority</span>
                <span>Audit Status</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-xs text-neutral-300 font-sans">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span>
                    Pothole Cluster (PWD Roads)
                  </span>
                  <span className="text-red-400 font-medium">8/10 Severity</span>
                  <span className="text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-[10px]">Escalated</span>
                </div>

                <div className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-xs text-neutral-300 font-sans">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    Water Burst (BMC Water Dept)
                  </span>
                  <span className="text-yellow-400 font-medium">9/10 Severity</span>
                  <span className="text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px]">In Progress</span>
                </div>

                <div className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-xs text-neutral-300 font-sans">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span>
                    Streetlight Out (BEST Elect)
                  </span>
                  <span className="text-green-400 font-medium">5/10 Severity</span>
                  <span className="text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded text-[10px]">Resolved</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
            <span className="text-xs text-neutral-400 font-sans">
              Filings are translated and categorized using our integrated Gemini LLM system.
            </span>
            <span className="text-xs text-orange-400 font-medium hover:underline flex items-center gap-1 cursor-pointer font-sans">
              Learn about vision mapping
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Right Side: Stunning Department Orbit Visualization */}
        <div className="lg:col-span-5 bg-[#0A0A0A] border border-white/10 rounded-3xl h-[400px] lg:h-auto min-h-[400px] flex items-center justify-center relative group overflow-hidden">
          <OrbitSphere />

          {/* Absolute title */}
          <div className="absolute bottom-4 left-6 right-6 flex justify-between text-[10px] text-neutral-500 uppercase tracking-widest font-semibold font-sans z-20">
            <span>Automated routing grid</span>
            <span>Real-time dispatch</span>
          </div>
        </div>
      </div>

      {/* Pillars of CivicPulse */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 border-t border-white/5 relative z-10 mb-16">
        {pillars.map((p, index) => (
          <div key={index} className="flex flex-col items-start group relative">
            <div className="w-8 h-[2px] bg-neutral-800 group-hover:bg-orange-500 transition-colors duration-300 mb-6"></div>
            <div className="mb-4 bg-white/5 p-3 rounded-xl border border-white/5 group-hover:border-orange-500/10 group-hover:bg-orange-500/5 transition-all">
              {p.icon}
            </div>
            <h3 className="text-white text-lg font-display font-medium tracking-tight mb-2.5">
              {p.title}
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-sans group-hover:text-neutral-300 transition-colors">
              {p.description}
            </p>
          </div>
        ))}
      </div>

      {/* Live Now vs Planned Later Feature Separation */}
      <div className="pt-16 border-t border-white/5 relative z-10 font-sans">
        <div className="max-w-3xl mb-10">
          <span className="text-[10px] uppercase text-orange-500 tracking-wider font-bold block mb-2">Development Status & Roadmap</span>
          <h3 className="text-2xl sm:text-3.5xl font-display font-light text-white tracking-tight mb-3">Feature Integrity Matrix</h3>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
            In compliance with open civic accountability standards, we explicitly publish which municipal management systems are fully functional in the current core, and what systems are designated for the next district version release.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Active Now */}
          <div className="bg-[#0A0A0A] border border-green-500/10 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden group hover:border-green-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/[0.02] blur-[50px] pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 text-green-400 ring-1 ring-green-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Active Live Layers
              </span>
              <span className="text-xs text-neutral-500 font-mono">v1.1 Core Ready</span>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm">
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold mt-0.5">✓</span>
                <div>
                  <h4 className="text-white font-semibold">Multimodal Dialect Filing</h4>
                  <p className="text-neutral-500 text-xs mt-0.5 font-sans leading-relaxed">Supports 50+ localized voice dialects with automatic model-driven translation & structured mapping.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold mt-0.5">✓</span>
                <div>
                  <h4 className="text-white font-semibold">Interactive District Heatmaps</h4>
                  <p className="text-neutral-500 text-xs mt-0.5 font-sans leading-relaxed">Presents dynamic lat/long coordinates with custom sector prioritization and incident lists.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold mt-0.5">✓</span>
                <div>
                  <h4 className="text-white font-semibold">Contractor Dispatch Console</h4>
                  <p className="text-neutral-500 text-xs mt-0.5 font-sans leading-relaxed">Enables zonal officers to allocate local budgets, dispatch crews, and track progress interactively.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold mt-0.5">✓</span>
                <div>
                  <h4 className="text-white font-semibold">Simulated Public Ledger Audits</h4>
                  <p className="text-neutral-500 text-xs mt-0.5 font-sans leading-relaxed">Seals submission hashes and resolution records to a mock, blockchain-inspired cryptographic block list.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Planned Later */}
          <div className="bg-[#0A0A0A] border border-orange-500/10 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden group hover:border-orange-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.02] blur-[50px] pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                ⏳ Planned Roadmap
              </span>
              <span className="text-xs text-neutral-500 font-mono">v1.2 In Development</span>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm">
              <li className="flex items-start gap-3">
                <span className="text-orange-400 font-bold mt-0.5">✦</span>
                <div>
                  <h4 className="text-white font-semibold">Zonal Laser Road Scanning</h4>
                  <p className="text-neutral-500 text-xs mt-0.5 font-sans leading-relaxed">Deploying physical lasers to garbage vehicle fleets to identify street cracks before potholes occur.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 font-bold mt-0.5">✦</span>
                <div>
                  <h4 className="text-white font-semibold">Escrow Smart Contracts</h4>
                  <p className="text-neutral-500 text-xs mt-0.5 font-sans leading-relaxed">Funds are auto-released to contractor wallets only upon secure verification signatures from 3 ward citizens.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 font-bold mt-0.5">✦</span>
                <div>
                  <h4 className="text-white font-semibold">Decentralized Ward Allocation (DAOs)</h4>
                  <p className="text-neutral-500 text-xs mt-0.5 font-sans leading-relaxed">Allows citizens to vote on neighborhood development projects with vote weighting based on their CivicScore.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 font-bold mt-0.5">✦</span>
                <div>
                  <h4 className="text-white font-semibold">Autonomous Drone Verification</h4>
                  <p className="text-neutral-500 text-xs mt-0.5 font-sans leading-relaxed">Automated regional drone dispatching to scan resolved coordinates and sign off on completion data.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
