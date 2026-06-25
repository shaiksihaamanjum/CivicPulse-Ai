import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, ShieldAlert, Award } from "lucide-react";

const testimonials = [
  {
    quote: "A deep pothole outside my village had been ignored for 3 years. I recorded a voice report in Telugu using CivicPulse AI — it was analyzed and assigned instantly, and fixed in 4 days. I didn't even need internet. This platform gave us our voice back.",
    author: "Ravi Kumar",
    role: "Ward Guardian, Anantapur Sector",
    civicScore: "CivicScore: 9,840 ★ Guardian Honor"
  },
  {
    quote: "As a municipal administrative officer, CivicPulse transformed how we dispatch contractors. The automated Gemini task procedures and budgeting saved us over 200 working hours last month alone. We close tickets 3x faster than before.",
    author: "Commissioner S. Reddy",
    role: "Zonal Municipal Commissioner, Hyderabad B",
    civicScore: "Performance Score: Tier A Municipal Zone"
  },
  {
    quote: "I filed a complaint about a dead streetlight on a pitch dark road at midnight in Tamil. By 8am the next morning, Bright Electric had replaced the light. The Polygon ledger tracked every single step of the process. True accountability!",
    author: "Priya Nair",
    role: "Citizen Hero, Chennai Ward 4",
    civicScore: "CivicScore: 8,210 ★ Active Citizen Badge"
  }
];

export default function Impact() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);

  const handleNext = () => {
    setFade(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
      setFade(false);
    }, 150);
  };

  const handlePrev = () => {
    setFade(true);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      setFade(false);
    }, 150);
  };

  return (
    <section id="impact" className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-[#050505]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[400px] bg-orange-950/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-16">
        <div className="flex items-start gap-4 sm:gap-6">
          <span className="text-6xl sm:text-8xl text-white/5 font-display font-light leading-none tracking-tighter">02.</span>
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl text-white font-display font-medium tracking-tight">
              Real Cities. Real Impact.
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed font-sans">
              Discover how citizens and public servants are using CivicPulse to bring concrete accountability to their streets and neighborhoods.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex gap-4 md:gap-8 items-center justify-between">
        
        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          className="hidden md:flex w-12 h-12 rounded-xl border border-white/10 bg-[#0F0F0F] text-neutral-400 items-center justify-center hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300 shadow-lg cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dynamic Testimonial Display Area */}
        <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
          
          {/* Card Wrapper */}
          <div className="lg:col-span-6 relative z-10">
            <div className="bg-[#0A0A0A]/50 border border-white/10 rounded-3xl p-6 sm:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden h-[400px] sm:h-[350px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none"></div>
              
              <Quote className="w-10 h-10 text-orange-500/25 mb-4" />
              
              <blockquote className={`text-sm sm:text-base leading-relaxed text-neutral-200 font-sans tracking-tight transition-all duration-200 ${
                fade ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
              }`}>
                "{testimonials[index].quote}"
              </blockquote>

              <div className={`mt-6 flex items-center gap-4 transition-all duration-200 ${
                fade ? "opacity-0" : "opacity-100"
              }`}>
                <div className="flex flex-col">
                  <span className="text-white text-base font-semibold font-sans">
                    {testimonials[index].author}
                  </span>
                  <span className="text-neutral-500 text-[10px] sm:text-xs uppercase tracking-wider font-semibold font-sans mt-0.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    {testimonials[index].role}
                    <span className="hidden sm:inline text-orange-500">•</span>
                    <span className="text-orange-400 font-semibold">{testimonials[index].civicScore}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side static impact stats summary */}
          <div className="lg:col-span-6 relative h-[350px] rounded-3xl border border-white/5 bg-[#0A0A0A] p-6 sm:p-8 flex flex-col justify-center gap-6 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px"
            }}></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-3xl font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-400">
                  2.4M
                </span>
                <span className="text-[10px] text-neutral-500 block uppercase tracking-wider mt-1 font-sans font-semibold">Citizens Served</span>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-3xl font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-400">
                  94.7%
                </span>
                <span className="text-[10px] text-neutral-500 block uppercase tracking-wider mt-1 font-sans font-semibold">Resolution Rate</span>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-3xl font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-400">
                  32hrs
                </span>
                <span className="text-[10px] text-neutral-500 block uppercase tracking-wider mt-1 font-sans font-semibold">Avg Repair Speed</span>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-3xl font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-400">
                  50+
                </span>
                <span className="text-[10px] text-neutral-500 block uppercase tracking-wider mt-1 font-sans font-semibold">Supported Dialects</span>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-center">
              <span className="text-xl font-display font-bold text-orange-400">
                ₹4.2Cr saved via AI Early Diagnostics
              </span>
              <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-sans font-semibold mt-1">Preventative vs reactive municipal work</p>
            </div>
          </div>

        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          className="hidden md:flex w-12 h-12 rounded-xl border border-white/10 bg-[#0F0F0F] text-neutral-400 items-center justify-center hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300 shadow-lg cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>
    </section>
  );
}
