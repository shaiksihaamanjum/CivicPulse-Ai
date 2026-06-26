import React, { useState, useEffect } from "react";
import { X, Sparkles, Languages, Loader2, CheckCircle, ShieldAlert, Award, Mic, MicOff, Volume2, ChevronRight, MapPin, Navigation, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Issue, BlockLog } from "../types";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newIssue: Issue, blocks: BlockLog[]) => void;
}

const issueTypes = [
  { value: "Pothole", label: "Pothole", icon: "🕳️" },
  { value: "Water Leakage", label: "Water Leakage", icon: "💧" },
  { value: "Waste Management", label: "Waste Management", icon: "🗑️" },
  { value: "Streetlight Damage", label: "Streetlight Damage", icon: "💡" },
  { value: "Public Safety", label: "Public Safety", icon: "🛡️" },
  { value: "Drainage", label: "Drainage", icon: "🌊" },
  { value: "Other", label: "Other", icon: "📋" },
];

const languages = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi (हिंदी)" },
  { value: "Tamil", label: "Tamil (தமிழ்)" },
  { value: "Telugu", label: "Telugu (తెలుగు)" },
  { value: "Marathi", label: "Marathi (मराठी)" },
  { value: "Kannada", label: "Kannada (ಕನ್ನಡ)" },
];

const defaultThumbnails: Record<string, string> = {
  Pothole: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80",
  "Water Leakage": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
  "Waste Management": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
  "Streetlight Damage": "https://images.unsplash.com/photo-1501901614258-907e4d444b43?auto=format&fit=crop&w=600&q=80",
  "Public Safety": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
  Drainage: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=600&q=80",
  Other: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80"
};

export default function ReportModal({ isOpen, onClose, onSuccess }: ReportModalProps) {
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [language, setLanguage] = useState("English");
  const [reporterName, setReporterName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Custom Geolocation & Map Coordinates (Simulated 2D % layout)
  const [lat, setLat] = useState<number>(45);
  const [lng, setLng] = useState<number>(45);
  const [locationName, setLocationName] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  // Duplicate Check Warning Block
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateFound, setDuplicateFound] = useState<Issue | null>(null);

  const [aiAnalysis, setAiAnalysis] = useState<{
    type: string;
    severity: number;
    department: string;
    estimatedCost: number;
    technique: string;
    crewSize: number;
    hoursEstimate: number;
    urgencyScore?: number;
    severityLabel?: string;
  } | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  // Voice dictation triggers
  const startRecording = () => {
    setRecordError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsRecording(true);
      setTimeout(() => {
        let simulatedSpeech = "";
        if (language === "Hindi") {
          simulatedSpeech = "यहाँ रास्ते पर बहुत बड़ा गड्ढा हो गया है, गाड़ियाँ फिसल रही हैं।";
        } else if (language === "Tamil") {
          simulatedSpeech = "தெருவிளக்குகள் எரியவில்லை, இரவு நேரத்தில் மிகவும் இருட்டாக இருக்கிறது.";
        } else if (language === "Marathi") {
          simulatedSpeech = "कचऱ्याची कुंडी पूर्ण भरली आहे आणि घाण वास येत आहे.";
        } else if (language === "Telugu") {
          simulatedSpeech = "మంచినీటి పైపులైన్ పగిలిపోయి నీరు వృధాగా పోతోంది.";
        } else if (language === "Kannada") {
          simulatedSpeech = "ರಸ್ತೆಯ ಪಕ್ಕದಲ್ಲಿ ಕಸದ ರಾಶಿ ಬಿದ್ದಿದೆ, ದುರ್ವಾಸನೆ ಬರುತ್ತಿದೆ.";
        } else {
          simulatedSpeech = "There is a severe water leak here flooding the entire street block near the subway entrance.";
        }
        setDescription(prev => prev ? prev + " " + simulatedSpeech : simulatedSpeech);
        setIsRecording(false);
      }, 2000);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      let langCode = "en-IN";
      if (language === "Hindi") langCode = "hi-IN";
      else if (language === "Tamil") langCode = "ta-IN";
      else if (language === "Telugu") langCode = "te-IN";
      else if (language === "Marathi") langCode = "mr-IN";
      else if (language === "Kannada") langCode = "kn-IN";
      
      rec.lang = langCode;
      
      rec.onstart = () => {
        setIsRecording(true);
      };
      
      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setRecordError("Microphone connection issue. Adding template draft...");
        
        setTimeout(() => {
          let simulatedSpeech = "";
          if (language === "Hindi") {
            simulatedSpeech = "यहाँ रास्ते पर बहुत बड़ा गड्ढा हो गया है, गाड़ियाँ फिसल रही हैं।";
          } else if (language === "Tamil") {
            simulatedSpeech = "தெருவிளக்குகள் எரியவில்லை, இரவு நேரத்தில் மிகவும் இருட்டாக இருக்கிறது.";
          } else if (language === "Marathi") {
            simulatedSpeech = "कचऱ्याची कुंडी पूर्ण भरली आहे आणि घाण वास येत आहे.";
          } else if (language === "Telugu") {
            simulatedSpeech = "మంచినీటి పైపులైన్ పగిలిపోయి నీరు వృధాగా పోతోంది.";
          } else if (language === "Kannada") {
            simulatedSpeech = "ರಸ್ತೆಯ ಪಕ್ಕದಲ್ಲಿ ಕಸದ ರಾಶಿ ಬಿದ್ದಿದೆ, ದುರ್ವಾಸನೆ ಬರುತ್ತಿದೆ.";
          } else {
            simulatedSpeech = "There is a severe water leak here flooding the entire street block near the subway entrance.";
          }
          setDescription(prev => prev ? prev + " " + simulatedSpeech : simulatedSpeech);
          setIsRecording(false);
          setRecordError(null);
        }, 1800);
      };
      
      rec.onend = () => {
        setIsRecording(false);
      };
      
      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          setDescription(prev => prev ? prev + " " + resultText : resultText);
        }
      };
      
      rec.start();
      setRecognitionInstance(rec);
    } catch (err: any) {
      console.error("Speech init error:", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (err) {
        console.error(err);
      }
    }
    setIsRecording(false);
  };

  const handleAiScan = async (forcedType?: string) => {
    if (!description.trim()) return;
    setAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, typeHint: forcedType || selectedType }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data);
        if (data.type) {
          setSelectedType(data.type);
        }
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Mock File Selection & Simulated Upload Pipeline
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadProgress(10);
      
      // Simulate modern upload progress bar
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // Assign beautiful visual stock image
            const categoryPreset = defaultThumbnails[selectedType] || defaultThumbnails["Other"];
            setUploadedUrl(categoryPreset);
            return 100;
          }
          return prev + 30;
        });
      }, 250);
    }
  };

  // Simulated GPS auto-detection
  const handleAutoLocation = () => {
    setDetectingLocation(true);
    setTimeout(() => {
      // Place at a highly populated area in our 2d matrix coordinate space
      const mockLat = Math.floor(Math.random() * 45) + 20;
      const mockLng = Math.floor(Math.random() * 50) + 25;
      setLat(mockLat);
      setLng(mockLng);
      
      const landmarks = [
        "Kurla Bus Terminus Crossroad",
        "Andheri West Metro Exit Lane",
        "Gate 3 Community Garden Avenue",
        "Bandra Promenade Junction",
        "State Bank Subway Roadway",
        "Sector 4 Vegetable Market Alley"
      ];
      const selectedLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];
      setLocationName(selectedLandmark);
      setDetectingLocation(false);

      // Trigger instant duplicate warning search
      checkDuplicate(mockLat, mockLng, selectedType);
    }, 1200);
  };

  // Duplicate Check Trigger
  const checkDuplicate = async (latitude: number, longitude: number, type: string) => {
    if (!type) return;
    setCheckingDuplicate(true);
    setDuplicateFound(null);
    try {
      const res = await fetch("/api/issues/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: latitude, lng: longitude, type })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.found) {
          setDuplicateFound(data.issue);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  // Upvote Existing duplicate and close
  const handleUpvoteDuplicate = async () => {
    if (!duplicateFound) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/issues/${duplicateFound.id}/upvote`, {
        method: "POST"
      });
      if (response.ok) {
        // Trigger gamification points
        if ("localStorage" in window) {
          const stored = localStorage.getItem("civicpulse_profile");
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.score = (parsed.score || 0) + 50; // Award 50 points for validating
            localStorage.setItem("civicpulse_profile", JSON.stringify(parsed));
          }
        }
        
        // Return full blocks to main component
        const mockBlock: BlockLog = {
          blockNumber: 4821048,
          transactionHash: "0x" + Math.random().toString(16).substr(2, 40),
          issueId: duplicateFound.id,
          action: "VALIDATED",
          details: `Community upvote logged on existing issue. Received +50 CivicScore.`,
          timestamp: new Date().toISOString()
        };
        onSuccess(duplicateFound, [mockBlock]);
        
        // Reset and close
        setDuplicateFound(null);
        setDescription("");
        setSelectedType("");
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger duplicate check when map coordinates or category shifts
  useEffect(() => {
    if (selectedType) {
      checkDuplicate(lat, lng, selectedType);
    }
  }, [lat, lng, selectedType]);

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const applyTemplate = (type: string) => {
    setSelectedType(type);
    
    // Assign template description
    if (type === "Pothole") {
      setDescription("Large deep pothole crater formed near the pedestrian pathway crossing. Vehicles are swerving dangerously to avoid it.");
    } else if (type === "Water Leakage") {
      setDescription("High-pressure clean water pipe ruptured on the main road walkway, spraying water high and flooding the surrounding pavements.");
    } else if (type === "Streetlight Damage") {
      setDescription("Two adjacent streetlights have gone completely black since last weekend. Lane is unsafe for women and children at night.");
    } else if (type === "Waste Management") {
      setDescription("Strong odor and disease risks as an illegal garbage heap has piled up unchecked near the public bus terminal corner.");
    } else if (type === "Public Safety") {
      setDescription("A high-voltage underground municipal electric distribution cabinet has its metal door hanging loose, exposing wire terminals.");
    } else {
      setDescription(`Report regarding a civic ${type.toLowerCase()} issue that requires municipal attention.`);
    }

    // Set matching stock thumbnail automatically
    setUploadedUrl(defaultThumbnails[type] || defaultThumbnails["Other"]);

    // Delay scan to avoid race state
    setTimeout(() => {
      handleAiScan(type);
    }, 150);
  };

  const handleNextStep = async () => {
    if (!description.trim() || !selectedType) return;
    if (!locationName.trim()) {
      setLocationName("Zonal Ward " + Math.floor(Math.random() * 10 + 1));
    }
    if (!aiAnalysis) {
      await handleAiScan();
    }
    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    setSubmitting(true);
    try {
      let analysis = aiAnalysis;
      if (!analysis) {
        const response = await fetch("/api/analyze-issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description, typeHint: selectedType }),
        });
        if (response.ok) {
          analysis = await response.json();
        }
      }

      const finalType = selectedType || analysis?.type || "Other";
      const finalSeverity = analysis?.severity || 5;
      const finalDept = analysis?.department || "Municipal Corporation";
      const finalCost = analysis?.estimatedCost || 5000;
      const finalTechnique = analysis?.technique || "Standard Repair Patch";
      const finalCrewSize = analysis?.crewSize || 2;
      const finalHours = analysis?.hoursEstimate || 3;
      const finalUrgency = analysis?.urgencyScore || 50;

      const submitResponse = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedType ? `${selectedType} Incident` : "Civic Complaint",
          description,
          type: finalType,
          severity: finalSeverity,
          urgencyScore: finalUrgency,
          department: finalDept,
          estimatedCost: finalCost,
          technique: finalTechnique,
          crewSize: finalCrewSize,
          hoursEstimate: finalHours,
          language,
          locationName,
          reporter: reporterName.trim() || "Active Citizen",
          lat,
          lng,
          beforeImage: uploadedUrl || defaultThumbnails[finalType] || defaultThumbnails["Other"]
        }),
      });

      if (submitResponse.ok) {
        const result = await submitResponse.json();
        onSuccess(result.issue, result.blocks);
        
        // Reset states
        setDescription("");
        setSelectedType("");
        setReporterName("");
        setLocationName("");
        setUploadedUrl("");
        setSelectedFile(null);
        setUploadProgress(0);
        setAiAnalysis(null);
        setCurrentStep(1);
        onClose();
      }
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative bg-[#080808] border border-white/10 rounded-3xl p-5 sm:p-7 w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl z-10 animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-sans tracking-tight">Report Zonal Incident</h3>
              <p className="text-[10px] text-neutral-400 font-sans">AI Triage Classification & Immutable Ledger Reporting</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-sans text-neutral-500 mb-5 bg-white/[0.01] border border-white/5 p-2 rounded-xl">
          <div className="flex items-center gap-1.5">
            <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
              currentStep === 1 ? "bg-orange-500 text-white" : "bg-green-500/20 text-green-400 border border-green-500/30"
            }`}>1</span>
            <span className={currentStep === 1 ? "text-white font-semibold text-[11px]" : "text-neutral-400 text-[11px]"}>Filing Details</span>
          </div>
          <div className="w-8 h-[1px] bg-white/10"></div>
          <div className="flex items-center gap-1.5">
            <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
              currentStep === 2 ? "bg-orange-500 text-white" : "bg-white/5 border border-white/10"
            }`}>2</span>
            <span className={currentStep === 2 ? "text-white font-semibold text-[11px]" : "text-neutral-400 text-[11px]"}>AI Diagnostics & Trust</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {currentStep === 1 ? (
            <div className="space-y-4">
              
              {/* Reporter Identity */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[9px] text-neutral-400 font-sans mb-1 block uppercase tracking-wider font-semibold">Reporter Name</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500/50 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-neutral-400 font-sans mb-1 block uppercase tracking-wider font-semibold">Dialect Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50 transition-all font-sans appearance-none"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value} className="bg-neutral-950 text-white">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Quick Selectors */}
              <div>
                <label className="text-[9px] text-neutral-400 font-sans mb-1.5 block uppercase tracking-wider font-semibold">Select Category</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {issueTypes.slice(0, 4).map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => applyTemplate(type.value)}
                      className={`py-2 px-1 rounded-xl border text-[10px] font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                        selectedType === type.value
                          ? "border-orange-500 bg-orange-500/15 text-white shadow-md"
                          : "border-white/5 bg-white/5 text-neutral-400 hover:border-white/10 hover:text-neutral-200"
                      }`}
                    >
                      <span className="text-sm">{type.icon}</span>
                      <span className="font-sans text-[9px] truncate w-full text-center">{type.label.split(" ")[0]}</span>
                    </button>
                  ))}
                  {issueTypes.slice(4).map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => applyTemplate(type.value)}
                      className={`py-2 px-1 rounded-xl border text-[10px] font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                        selectedType === type.value
                          ? "border-orange-500 bg-orange-500/15 text-white shadow-md"
                          : "border-white/5 bg-white/5 text-neutral-400 hover:border-white/10 hover:text-neutral-200"
                      }`}
                    >
                      <span className="text-sm">{type.icon}</span>
                      <span className="font-sans text-[9px] truncate w-full text-center">{type.label.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Issue Description with Voice dictation */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] text-neutral-400 font-sans block uppercase tracking-wider font-semibold">Incident Description</label>
                  <span className="text-[9px] text-neutral-500 font-sans">Voice dictation available</span>
                </div>
                
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={`Describe what's wrong. Click the microphone to speak in ${language}.`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-12 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500/50 resize-none font-sans h-20"
                    required
                  ></textarea>
                  
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`absolute bottom-3.5 right-3 p-2 rounded-xl transition-all border flex items-center justify-center cursor-pointer ${
                      isRecording 
                        ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse scale-105" 
                        : "bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {isRecording && (
                  <div className="mt-1 flex items-center gap-1.5 text-[9px] text-red-400 font-sans animate-pulse">
                    <span className="w-1 h-1 rounded-full bg-red-500"></span>
                    Dictating in {language}... Speak clearly now!
                  </div>
                )}
                {recordError && (
                  <div className="mt-1 text-[9px] text-amber-500 font-sans">
                    ⚠️ {recordError}
                  </div>
                )}
              </div>

              {/* Interactive Visual Map Location Selector & Geolocation Pin */}
              <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase text-neutral-400 tracking-wider font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
                    Geolocation Map Pin Dropper
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoLocation}
                    disabled={detectingLocation}
                    className="text-[9px] bg-white/5 hover:bg-white/10 text-white font-sans font-semibold border border-white/10 rounded-lg px-2 py-1 flex items-center gap-1 cursor-pointer"
                  >
                    {detectingLocation ? (
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    ) : (
                      <Navigation className="w-2.5 h-2.5 text-orange-400" />
                    )}
                    Detect GPS
                  </button>
                </div>

                {/* 2D Mini interactive matrix map canvas */}
                <div
                  className="relative h-28 bg-[#151515] border border-white/10 rounded-xl overflow-hidden cursor-crosshair group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                    // Constrain within safe grid borders
                    setLng(Math.max(15, Math.min(85, clickX)));
                    setLat(Math.max(15, Math.min(80, clickY)));
                  }}
                >
                  {/* Grid visual overlay */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                    backgroundSize: "16px 16px"
                  }}></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.02),transparent)] pointer-events-none"></div>

                  <span className="absolute top-2 left-2 text-[8px] font-mono text-neutral-600 uppercase">
                    Interactive Grid (Click to Drop Pin)
                  </span>

                  {/* Placed Interactive Pin with coordinate label */}
                  <div
                    className="absolute transition-all duration-300 pointer-events-none"
                    style={{ left: `${lng}%`, top: `${lat}%`, transform: "translate(-50%, -100%)" }}
                  >
                    <div className="relative flex flex-col items-center">
                      <span className="text-orange-500 text-lg filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">📍</span>
                      <div className="bg-black/80 text-[8px] font-mono text-orange-400 border border-orange-500/20 px-1 py-0.2 rounded mt-0.5 whitespace-nowrap">
                        {lat.toFixed(1)}°N, {lng.toFixed(1)}°E
                      </div>
                    </div>
                  </div>
                </div>

                {/* Human location manual field */}
                <div>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Describe landmark or street name manually..."
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none font-sans"
                    required
                  />
                </div>
              </div>

              {/* Upload Image & Video Section with Presets */}
              <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-3 space-y-2.5">
                <span className="text-[9px] uppercase text-neutral-400 tracking-wider font-bold flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                  Visual Incident Evidence (Image / Video)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <label className="border border-white/5 border-dashed bg-white/[0.01] hover:bg-white/[0.02] p-3 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer min-h-16 relative">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <ImageIcon className="w-5 h-5 text-neutral-500 mb-1" />
                    <span className="text-[9px] text-neutral-400 font-sans">Choose photo/video or drag-and-drop</span>
                  </label>

                  {selectedFile ? (
                    <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl text-xs space-y-1">
                      <p className="font-semibold text-neutral-200 truncate">{selectedFile.name}</p>
                      <p className="text-[9px] text-neutral-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <span className="text-[9px] text-orange-400 font-semibold">{uploadProgress === 100 ? "Sealed Evidence Ready" : "Simulating scan..."}</span>
                    </div>
                  ) : (
                    <div className="text-[9px] text-neutral-500 leading-relaxed font-sans">
                      Providing a sharp, well-lit photo of the hazard significantly boosts Gemini AI categorization confidence, budget approximations, and dispatch speed.
                    </div>
                  )}
                </div>
              </div>

              {/* DUPLICATE WARNING BLOCK */}
              {duplicateFound && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl text-xs space-y-2 animate-in fade-in slide-in-from-bottom duration-300">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <p className="font-bold text-amber-300">Similar Nearby Report Detected!</p>
                      <p className="text-[10px] text-neutral-300 leading-relaxed font-sans mt-0.5">
                        A pending report (<strong>#{duplicateFound.id} - {duplicateFound.type}</strong>) is already active within 35 meters at {duplicateFound.locationName}. Avoid duplicate logs to keep municipal resources aligned!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-amber-500/10">
                    <button
                      type="button"
                      onClick={handleUpvoteDuplicate}
                      disabled={submitting}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-sans font-bold text-[9px] uppercase px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {submitting ? "Processing..." : "👍 Upvote Existing (+50 Score)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuplicateFound(null)}
                      className="text-[9px] text-neutral-400 hover:text-white font-sans px-2"
                    >
                      File anyway
                    </button>
                  </div>
                </div>
              )}

              {/* Proceed Action */}
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!description.trim() || !selectedType || analyzing || duplicateFound !== null}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-sans font-medium text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    Running Gemini AI Diagnostic Scan...
                  </>
                ) : (
                  <>
                    Proceed to AI Diagnosis
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Step 2: AI Diagnostic Trust & Auditing Panel */}
              <div className="rounded-2xl border border-orange-500/15 bg-gradient-to-r from-orange-500/[0.02] to-transparent p-4 relative overflow-hidden space-y-4">
                <div className="absolute right-3 top-3 opacity-5 pointer-events-none">
                  <Sparkles className="w-16 h-16 text-orange-500" />
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-bold text-orange-400 tracking-wider uppercase flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                    Gemini AI Triage Report
                  </span>
                  <span className="text-[9px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded font-sans flex items-center gap-1 font-semibold">
                    <CheckCircle className="w-3 h-3" />
                    Audit Sealed
                  </span>
                </div>

                {/* Edit options */}
                <div className="grid grid-cols-2 gap-3.5 text-xs font-sans">
                  <div>
                    <label className="text-[9px] text-neutral-400 block uppercase tracking-wider mb-1 font-semibold">Validated Category</label>
                    <select
                      value={selectedType}
                      onChange={(e) => {
                        setSelectedType(e.target.value);
                        if (aiAnalysis) setAiAnalysis({ ...aiAnalysis, type: e.target.value });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-sans appearance-none"
                    >
                      {issueTypes.map(it => (
                        <option key={it.value} value={it.value} className="bg-neutral-950 text-white">{it.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] text-neutral-400 block uppercase tracking-wider mb-1 font-semibold">Severity Override (1-10)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={aiAnalysis?.severity || 5}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (aiAnalysis) setAiAnalysis({ ...aiAnalysis, severity: val });
                        }}
                        className="w-full accent-orange-500"
                      />
                      <span className="font-semibold text-white w-6 text-center">{aiAnalysis?.severity || 5}/10</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-neutral-400 block uppercase tracking-wider mb-1 font-semibold">Cost Estimate (₹)</label>
                    <input
                      type="number"
                      value={aiAnalysis?.estimatedCost || 5000}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        if (aiAnalysis) setAiAnalysis({ ...aiAnalysis, estimatedCost: val });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-neutral-400 block uppercase tracking-wider mb-1 font-semibold">Assigned Ward Dept</label>
                    <input
                      type="text"
                      value={aiAnalysis?.department || "Municipal Corporation"}
                      onChange={(e) => {
                        if (aiAnalysis) setAiAnalysis({ ...aiAnalysis, department: e.target.value });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-sans"
                    />
                  </div>
                </div>

                {/* Repair action plan overview */}
                {aiAnalysis && (
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                    <p className="font-medium text-neutral-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                      Technique & Resource Formulation:
                    </p>
                    <p className="text-neutral-400 text-[11px] leading-relaxed font-sans">{aiAnalysis.technique}</p>
                    <div className="text-[9px] text-neutral-500 pt-0.5 flex items-center gap-4">
                      <span>👥 Dispatch Crew: {aiAnalysis.crewSize} workers</span>
                      <span>⏱️ Project Hours: {aiAnalysis.hoursEstimate}h</span>
                      <span>⚡ Urgency Score: {Math.min(100, Math.max(10, (aiAnalysis.severity || 5) * 10 + 12))}%</span>
                    </div>
                  </div>
                )}

                {/* Prompt Veracity & Sandbox Ledger Index */}
                <div className="bg-orange-500/[0.01] border border-orange-500/10 rounded-xl p-3 text-[10px] font-mono space-y-1.5 leading-relaxed">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Source Model:</span>
                    <span className="text-white">gemini-3.5-flash (Dual RPC)</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Severity Label:</span>
                    <span className="text-orange-400 font-bold">
                      {(() => {
                        const s = aiAnalysis?.severity || 5;
                        if (s >= 9) return "Critical";
                        if (s >= 7) return "High";
                        if (s >= 4) return "Medium";
                        return "Low";
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Ledger Hash:</span>
                    <span className="text-white truncate max-w-[120px]">0x3f9a...8be2b (Simulated)</span>
                  </div>
                  <div className="text-[9px] text-neutral-500 italic pt-1 leading-normal border-t border-white/5">
                    * Automated categorization is powered by Google Gemini and backed by standard citizen reporting override rules.
                  </div>
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 font-sans text-xs transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:brightness-110 text-white font-sans font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sealing into Ledger...
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5" />
                      Seal on-chain & Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
