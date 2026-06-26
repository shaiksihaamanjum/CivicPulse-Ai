import { useState, useEffect } from "react";
import { Award, ShieldCheck, Flame, Star, Trophy, Target } from "lucide-react";

const badges = [
  { emoji: "🥇", label: "Pioneer", desc: "First verified filing" },
  { emoji: "🕳️", label: "Pothole Hunter", desc: "Pothole reported" },
  { emoji: "⚡", label: "City Fixer", desc: "5 community verifications" },
  { emoji: "🔥", label: "Civic Warrior", desc: "30-day streak active" },
  { emoji: "💧", label: "Water Guardian", desc: "Water leak reported" },
  { emoji: "💡", label: "Light Keeper", desc: "Streetlight reported" },
  { emoji: "👑", label: "Ward Guardian", desc: "1800+ score achieved" },
];

interface GamificationProps {
  profile: {
    name: string;
    reportsCount: number;
    verificationsCount: number;
    score: number;
    streak: number;
    rating: number;
    unlockedBadges: string[];
  };
  onAddScore?: (points: number, type: string, detail?: string) => void;
}

export default function Gamification({ profile, onAddScore }: GamificationProps) {
  const [checkedIn, setCheckedIn] = useState(() => {
    try {
      const val = localStorage.getItem("civicpulse_checked_in");
      return val === "true";
    } catch {
      return false;
    }
  });

  const [triviaAnswered, setTriviaAnswered] = useState(() => {
    try {
      const val = localStorage.getItem("civicpulse_trivia_answered");
      return val === "true";
    } catch {
      return false;
    }
  });

  const handleCheckIn = () => {
    if (checkedIn) return;
    setCheckedIn(true);
    try {
      localStorage.setItem("civicpulse_checked_in", "true");
    } catch {}
    if (onAddScore) {
      onAddScore(100, "streak");
    }
  };

  const handleTrivia = (answer: string) => {
    if (triviaAnswered) return;
    if (answer === "dry") {
      setTriviaAnswered(true);
      try {
        localStorage.setItem("civicpulse_trivia_answered", "true");
      } catch {}
      if (onAddScore) {
        onAddScore(150, "verification");
      }
    } else {
      alert("Incorrect category! Please think about what can be repurposed/recycled (dry waste) versus wet waste or hazardous electronics.");
    }
  };

  // Sort leaderboard dynamically based on user's live score
  const sortedLeaderboard = [
    { name: "Priya Nair", reports: 121, score: 8210, tag: "City Fixer" },
    { name: "Ahmed Khan", reports: 98, score: 7655, tag: "Civic Warrior" },
    { name: `${profile.name} (You)`, reports: profile.reportsCount, score: profile.score, tag: profile.score >= 1800 ? "Ward Guardian" : "Active Citizen" },
    { name: "Sunita Sharma", reports: 87, score: 6490, tag: "Pioneer" },
  ].sort((a, b) => b.score - a.score);

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-[#050505]">
      {/* Background neon blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[60%] h-[400px] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-4 mb-16 items-start lg:items-center">
        <span className="text-6xl sm:text-8xl text-white/5 font-display font-light leading-none tracking-tighter">05.</span>
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl text-white font-display font-medium tracking-tight">
            CivicScore & Gamification Engine
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed font-sans">
            Participate in real public service with custom incentives. Report issues, upvote local solutions, earn actual CivicScore points, unlock unique milestone badges, and watch yourself climb the neighborhood leaderboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Card: Your Personal Civic Score */}
        <div className="lg:col-span-5 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-white text-lg font-sans font-medium flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-500" />
              Your Civic Profile
            </h3>
            <span className="text-[10px] uppercase text-orange-400 border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 rounded font-display tracking-wider font-semibold">
              {profile.score >= 1800 ? "Ward Guardian" : "Active Resident"}
            </span>
          </div>

          {/* Progress Ring Visualizer with live score */}
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
            <div className="relative w-32 h-32 flex items-center justify-center bg-black/40 rounded-full border border-white/5">
              <svg className="w-28 h-28 -rotate-90 overflow-visible" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff03" strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#gradientScore)"
                  strokeWidth="6"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * Math.min(profile.score, 3000)) / 3000}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ea580c" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <div className="text-3xl text-white font-display font-semibold">{profile.score}</div>
                <div className="text-[9px] text-orange-400 uppercase tracking-widest font-semibold font-sans mt-0.5">Points</div>
              </div>
            </div>

            <div className="space-y-4 flex-1 w-full">
              <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-sans">Total reports</span>
                  <span className="text-white font-medium text-xs sm:text-sm font-sans">{profile.reportsCount} filed</span>
                </div>
                <Trophy className="w-4 h-4 text-orange-400" />
              </div>

              <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-sans">Verifications</span>
                  <span className="text-white font-medium text-xs sm:text-sm font-sans">{profile.verificationsCount} validated</span>
                </div>
                <Target className="w-4 h-4 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Progress Breakdown Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-sans font-medium">
                <span className="text-neutral-400">Report Accuracy Rating</span>
                <span className="text-orange-400">97%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full" style={{ width: "97%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-sans font-medium">
                <span className="text-neutral-400">Community Vote Trust</span>
                <span className="text-orange-400">91%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full" style={{ width: "91%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-sans font-medium">
                <span className="text-neutral-400">Neighbor Help Rate</span>
                <span className="text-orange-400">84%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full" style={{ width: "84%" }}></div>
              </div>
            </div>
          </div>

          {/* Daily Interactive Civic Actions */}
          <div className="mt-8 pt-6 border-t border-white/5 space-y-6">
            <h4 className="text-white text-xs uppercase tracking-wider font-semibold font-sans flex items-center gap-1.5 text-neutral-400">
              <Star className="w-3.5 h-3.5 text-orange-400" />
              Daily Civic Activities
            </h4>

            {/* Daily Check-In */}
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-white text-sm font-sans font-medium">Daily Ward Attendance</h5>
                <p className="text-neutral-500 text-[11px] font-sans mt-0.5">Check in daily to build your streak and earn points.</p>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={checkedIn}
                className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold transition-all ${
                  checkedIn
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer shadow-[0_4px_12px_rgba(249,115,22,0.15)]"
                }`}
              >
                {checkedIn ? "Checked In Today ✓" : `Check In (+100)`}
              </button>
            </div>

            {/* Daily Trivia */}
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h5 className="text-white text-sm font-sans font-medium">Daily Ward Trivia</h5>
                  <span className="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded uppercase font-semibold font-sans">
                    +150 XP
                  </span>
                </div>
                <p className="text-neutral-400 text-xs font-sans mt-1">
                  Which type of waste belongs exclusively in the <strong className="text-blue-400 font-medium">Blue Recycling Bin</strong>?
                </p>
              </div>

              {!triviaAnswered ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => handleTrivia("wet")}
                    className="p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/10 text-left text-xs font-sans text-neutral-300 transition-all cursor-pointer"
                  >
                    🍎 Organic/Wet Waste
                  </button>
                  <button
                    onClick={() => handleTrivia("dry")}
                    className="p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/10 text-left text-xs font-sans text-neutral-300 transition-all cursor-pointer"
                  >
                    📰 Paper & Plastic
                  </button>
                  <button
                    onClick={() => handleTrivia("e-waste")}
                    className="p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/10 text-left text-xs font-sans text-neutral-300 transition-all cursor-pointer"
                  >
                    🔋 E-waste
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-green-500/10 bg-green-500/[0.02] text-xs font-sans text-neutral-400 leading-relaxed flex items-start gap-2.5">
                  <span className="text-green-400 text-base">✓</span>
                  <div>
                    <span className="text-green-400 font-semibold block">Correct! (+150 Score)</span>
                    Blue bins are strictly designated for dry recyclable wastes like paper, cardboard, plastics, and metal cans.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Badges Grid & Leaderboard List */}
        <div className="lg:col-span-7 space-y-6 w-full">
          
          {/* Achievement Badges Grid */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8">
            <h3 className="text-white text-lg font-sans font-medium mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              Milestone Achievements
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {badges.map((b, i) => {
                const isUnlocked = profile.unlockedBadges.includes(b.label);
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center gap-1.5 p-3 border rounded-2xl transition-all duration-300 group cursor-help text-center ${
                      isUnlocked 
                        ? "bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/10" 
                        : "bg-white/[0.01] border-white/5 opacity-30"
                    }`}
                    title={isUnlocked ? b.desc : `Locked: ${b.desc}`}
                  >
                    <span className={`text-3xl filter transition-transform ${isUnlocked ? "saturate-100 group-hover:scale-110" : "grayscale opacity-50"}`}>
                      {b.emoji}
                    </span>
                    <span className="text-xs font-semibold text-neutral-300 font-sans tracking-tight">{b.label}</span>
                    <span className="text-[9px] text-neutral-500 leading-tight font-sans">
                      {isUnlocked ? b.desc : "Locked"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Regional Leaderboard */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-sans font-medium flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                Live Zonal Leaderboard
              </h3>
              <span className="text-xs text-orange-400 border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 rounded font-sans">
                Ward 7 — Mumbai
              </span>
            </div>

            <div className="space-y-3">
              {sortedLeaderboard.map((user, index) => {
                const isUser = user.name.includes("(You)");
                const rankEmojis = ["👑", "🥈", "🥉", "4️⃣", "5️⃣"];
                const rankDisplay = rankEmojis[index] || `#${index + 1}`;

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isUser
                        ? "bg-gradient-to-r from-orange-500/20 to-transparent border-orange-500/30 shadow-[0_0_15px_-3px_rgba(249,115,22,0.15)]"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg w-6 text-center font-display font-bold text-neutral-400">
                        {rankDisplay}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-neutral-100 font-sans flex items-center gap-2">
                          {user.name}
                          {isUser && (
                            <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.2 rounded font-sans uppercase">
                              Active Player
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-sans">
                          {user.reports} reports submitted • {user.tag}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-400">
                        {user.score.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-neutral-500 block font-sans font-semibold">SCORE</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
