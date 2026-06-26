import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely using lazy initialization style
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err);
      }
    }
  }
  return aiClient;
}

// Updated In-Memory Database Structure
interface Issue {
  id: string;
  title?: string;
  type: "Pothole" | "Water Leakage" | "Waste Management" | "Streetlight Damage" | "Public Safety" | "Drainage" | "Other" | "Water Leak" | "Streetlight" | "Garbage";
  description: string;
  language: string;
  status: "Reported" | "Under Review" | "Verified" | "Assigned" | "In Progress" | "Resolved" | "Active" | "Escalated";
  severity: number;
  urgencyScore?: number;
  department: string;
  estimatedCost: number;
  lat: number;
  lng: number;
  locationName: string;
  reporter: string;
  civicScoreEarned: number;
  reportedAt: string;
  resolvedAt?: string;
  contractor?: string;
  progress?: number;
  aiPlan?: {
    technique: string;
    crewSize: number;
    hoursEstimate: number;
  };
  upvotes?: number;
  comments?: Array<{
    id: string;
    author: string;
    text: string;
    timestamp: string;
    imageUrl?: string;
  }>;
  beforeImage?: string;
  afterImage?: string;
  completionNotes?: string;
  timeline?: Array<{
    status: string;
    timestamp: string;
    details: string;
  }>;
}

interface BlockLog {
  blockNumber: number;
  transactionHash: string;
  issueId: string;
  action: "CREATED" | "VALIDATED" | "ESCALATED" | "RESOLVED" | "CONTRACTOR_ASSIGNED" | "WORK_STARTED";
  details: string;
  timestamp: string;
}

// Global state variables
let currentBlockNumber = 4821047;

// Generate 20 highly detailed realistic civic issues
let issues: Issue[] = [
  {
    id: "CP-1001",
    title: "Deep Crater at Gate 3 Crossroads",
    type: "Pothole",
    description: "Extremely deep and dangerous pothole measuring nearly 2 meters across. Formed right at the main crossroad of Gate 3, forcing vehicles to swerve dangerously into oncoming lanes.",
    language: "English",
    status: "Reported",
    severity: 7,
    urgencyScore: 72,
    department: "PWD Roads",
    estimatedCost: 14000,
    lat: 35.0,
    lng: 22.0,
    locationName: "Gate 3 Crossroad, Ward 7",
    reporter: "Ramesh Patel",
    civicScoreEarned: 120,
    reportedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    upvotes: 12,
    beforeImage: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80",
    comments: [
      { id: "c1", author: "Sunita Deshmukh", text: "Nearly lost my scooter balance here yesterday evening. Glad someone filed this!", timestamp: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString() }
    ],
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), details: "Issue filed by Ramesh Patel. Verified category Pothole." }
    ],
    aiPlan: {
      technique: "Hot-mix asphalt filling and roll press",
      crewSize: 3,
      hoursEstimate: 4
    }
  },
  {
    id: "CP-1002",
    title: "Burst Water Main near Bank Street",
    type: "Water Leakage",
    description: "High-pressure municipal water main has cracked under the sidewalk near State Bank branch. Thousands of gallons of clean drinking water are flooding the street and draining directly into the canal.",
    language: "English",
    status: "Under Review",
    severity: 8,
    urgencyScore: 85,
    department: "BMC Water Dept",
    estimatedCost: 22500,
    lat: 20.0,
    lng: 58.0,
    locationName: "Bank Street, Andheri East",
    reporter: "Priya Nair",
    civicScoreEarned: 150,
    reportedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), // 12 hours ago
    upvotes: 18,
    beforeImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
    comments: [
      { id: "c2", author: "Rajesh Kumar", text: "The flooding has spread right up to the storefront entries. Needs immediate municipal shutoff.", timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString() }
    ],
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), details: "Filed by Priya Nair via regional Telugu dictation translation." },
      { status: "Under Review", timestamp: new Date(Date.now() - 11 * 3600 * 1000).toISOString(), details: "Assigned to Water Engineering division for pressure check." }
    ],
    aiPlan: {
      technique: "Main valve shutting & pipe welding segment",
      crewSize: 3,
      hoursEstimate: 3.5
    }
  },
  {
    id: "CP-1003",
    title: "Unauthorized Garbage Pile on Sector 4 Corner",
    type: "Waste Management",
    description: "Massive pile of commercial food boxes, plastic wastes, and general rotting garbage rotting at the street corner of Sector 4. Stray dogs and cows are tearing the plastic open, multiplying health hazards.",
    language: "Hindi",
    status: "Verified",
    severity: 4,
    urgencyScore: 50,
    department: "BMC Sanitation",
    estimatedCost: 3200,
    lat: 70.0,
    lng: 38.0,
    locationName: "Sector 4 Corner, Kurla West",
    reporter: "Ahmed Khan",
    civicScoreEarned: 60,
    reportedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), // 1 day ago
    upvotes: 9,
    beforeImage: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    comments: [],
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), details: "Filed by Ahmed Khan with simulated photo evidence." },
      { status: "Under Review", timestamp: new Date(Date.now() - 22 * 3600 * 1000).toISOString(), details: "Classified into Sanitation department routing." },
      { status: "Verified", timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), details: "Community upvotes reached verification threshold." }
    ],
    aiPlan: {
      technique: "Compactor vehicle clearance and sanitization spray",
      crewSize: 2,
      hoursEstimate: 2
    }
  },
  {
    id: "CP-1004",
    title: "Three Broken Streetlights on Park Path",
    type: "Streetlight Damage",
    description: "The entire stretch of walkway inside the central children park is completely pitch dark as three overhead streetlights are fully broken. Extremely risky for children playing after sunset.",
    language: "Tamil",
    status: "Assigned",
    severity: 5,
    urgencyScore: 45,
    department: "BEST Electricity",
    estimatedCost: 5500,
    lat: 62.0,
    lng: 75.0,
    locationName: "Central Playground, Chennai Zone 4",
    reporter: "Priya Nair",
    civicScoreEarned: 80,
    reportedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), // 2 days ago
    upvotes: 5,
    contractor: "Bright Electric Ltd.",
    beforeImage: "https://images.unsplash.com/photo-1501901614258-907e4d444b43?auto=format&fit=crop&w=600&q=80",
    comments: [],
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), details: "Reported in Tamil, translated and categorized automatically." },
      { status: "Verified", timestamp: new Date(Date.now() - 1.8 * 24 * 3600 * 1000).toISOString(), details: "Automated community confirmation via geolocation proximity matches." },
      { status: "Assigned", timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), details: "Zonal Officer assigned Bright Electric Ltd to replace bulbs." }
    ],
    aiPlan: {
      technique: "LED bulb replacement & wiring fix",
      crewSize: 1,
      hoursEstimate: 1.5
    }
  },
  {
    id: "CP-1005",
    title: "Exposed High-Voltage Electrical Cabinet",
    type: "Public Safety",
    description: "The metal door of the power grid box near the main bus stop has rusted completely and fallen off. Live copper wires of high voltage are fully exposed right next to pedestrians.",
    language: "English",
    status: "In Progress",
    severity: 9,
    urgencyScore: 95,
    department: "BEST Electricity",
    estimatedCost: 12000,
    lat: 45.0,
    lng: 50.0,
    locationName: "Bus Stop 7, Bandra West",
    reporter: "Anjali Rao",
    civicScoreEarned: 200,
    reportedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
    upvotes: 34,
    contractor: "Bright Electric Ltd.",
    progress: 45,
    beforeImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
    comments: [
      { id: "c3", author: "Karan Johar", text: "Extremely scary! It's raining today and water is splashing onto that electrical box. Urgent fixing required!", timestamp: new Date(Date.now() - 2.5 * 24 * 3600 * 1000).toISOString() }
    ],
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), details: "Exposed high-voltage report logged by citizen." },
      { status: "Verified", timestamp: new Date(Date.now() - 2.8 * 24 * 3600 * 1000).toISOString(), details: "Fast-track community audit threshold met." },
      { status: "Assigned", timestamp: new Date(Date.now() - 2.5 * 24 * 3600 * 1000).toISOString(), details: "Dispatched to emergency maintenance contractor Bright Electric." },
      { status: "In Progress", timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), details: "Contractor team on-site. Insulating tape applied, manufacturing replacement steel cover door." }
    ],
    aiPlan: {
      technique: "Electrical box replacement and wiring insulation lock",
      crewSize: 2,
      hoursEstimate: 3
    }
  },
  {
    id: "CP-1006",
    title: "Clogged Sewer Grate Flooding Subway Entrance",
    type: "Drainage",
    description: "The storm drainage grates are completely clogged with plastic packaging and construction sand. Ankle-deep stinking sewer water is logging around the main subway entry, forcing commuters to jump over blocks.",
    language: "English",
    status: "Resolved",
    severity: 8,
    urgencyScore: 80,
    department: "BMC Drainage",
    estimatedCost: 8500,
    lat: 30.0,
    lng: 40.0,
    locationName: "Subway Exit A, Kurla Sector 1",
    reporter: "Siddharth Sen",
    civicScoreEarned: 110,
    reportedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(), // 6 days ago
    resolvedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    upvotes: 22,
    contractor: "Rajesh Plumbing Co.",
    progress: 100,
    beforeImage: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=600&q=80",
    afterImage: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&w=600&q=80",
    completionNotes: "Cleared 120kg of solid plastic bottles from the primary storm channel, repaired metal grates, and treated with deodorizer.",
    comments: [
      { id: "c4", author: "Deepika P", text: "Commuted today and it is fully clean and cleared. Excellent work by the sanitation team!", timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString() }
    ],
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(), details: "Drainage clog logged." },
      { status: "Assigned", timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), details: "Assigned to Rajesh Plumbing Co." },
      { status: "In Progress", timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), details: "Mechanical water suction deployed." },
      { status: "Resolved", timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), details: "Water logging cleared. Verification complete." }
    ],
    aiPlan: {
      technique: "Suction machine de-clogging and grate clearing",
      crewSize: 2,
      hoursEstimate: 2.5
    }
  },
  // Add 14 more realistic issues to reach a solid pool of 20
  {
    id: "CP-1007",
    title: "Crumbled Asphalt and Pothole near School Gate",
    type: "Pothole",
    description: "Multiple potholes have opened up directly in front of the main gate of St. Mary School, causing severe traffic jams as buses navigate carefully.",
    language: "English",
    status: "Reported",
    severity: 5,
    urgencyScore: 55,
    department: "PWD Roads",
    estimatedCost: 9500,
    lat: 50.0,
    lng: 28.0,
    locationName: "School Lane, Sector C",
    reporter: "Vivek Roy",
    civicScoreEarned: 45,
    reportedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    upvotes: 7,
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), details: "Reported by Vivek Roy." }
    ],
    aiPlan: { technique: "Cold-patch asphalt compound layering", crewSize: 2, hoursEstimate: 2 }
  },
  {
    id: "CP-1008",
    title: "Slow Leak from Control Valve Box",
    type: "Water Leakage",
    description: "Minor but continuous water seepage from the underground municipal control valve. Sidewalk paving slabs are becoming slippery.",
    language: "English",
    status: "Under Review",
    severity: 3,
    urgencyScore: 30,
    department: "BMC Water Dept",
    estimatedCost: 2800,
    lat: 25.0,
    lng: 65.0,
    locationName: "Greenwood Boulevard, Ward 12",
    reporter: "Sanjay Shah",
    civicScoreEarned: 35,
    reportedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    upvotes: 4,
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), details: "Minor leakage reported." },
      { status: "Under Review", timestamp: new Date(Date.now() - 16 * 3600 * 1000).toISOString(), details: "Assigned for manual inspection." }
    ],
    aiPlan: { technique: "Gasket replacement & valve tightening", crewSize: 1, hoursEstimate: 1 }
  },
  {
    id: "CP-1009",
    title: "Overflowing Smart Dustbin near Bus Stand",
    type: "Waste Management",
    description: "The public waste container near the metro bus stand is fully overflowing. Cardboards and beverage cans are rolling onto the road.",
    language: "Hindi",
    status: "Verified",
    severity: 5,
    urgencyScore: 60,
    department: "BMC Sanitation",
    estimatedCost: 1500,
    lat: 18.0,
    lng: 32.0,
    locationName: "Metro Bus Stand, Sector F",
    reporter: "Rajesh Shinde",
    civicScoreEarned: 50,
    reportedAt: new Date(Date.now() - 1.5 * 24 * 3600 * 1000).toISOString(),
    upvotes: 15,
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 1.5 * 24 * 3600 * 1000).toISOString(), details: "Dustbin overflow logged." },
      { status: "Verified", timestamp: new Date(Date.now() - 1.2 * 24 * 3600 * 1000).toISOString(), details: "Community verified." }
    ],
    aiPlan: { technique: "Sanitation skip loading and cleaning", crewSize: 1, hoursEstimate: 0.8 }
  },
  {
    id: "CP-1010",
    title: "Flickering Overhead Light at Dark Crossroad",
    type: "Streetlight Damage",
    description: "The main streetlight lamp at Crossroad 4 is continuously flickering like a strobe light, causing severe eye strain and leaving the corner mostly dark.",
    language: "English",
    status: "Assigned",
    severity: 4,
    urgencyScore: 40,
    department: "BEST Electricity",
    estimatedCost: 3500,
    lat: 58.0,
    lng: 80.0,
    locationName: "Crossroad 4, Kurla East",
    reporter: "Amit Trivedi",
    civicScoreEarned: 40,
    reportedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    upvotes: 3,
    contractor: "Bright Electric Ltd.",
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), details: "Flickering lamp reported." },
      { status: "Assigned", timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), details: "Bright Electric contractor assigned." }
    ],
    aiPlan: { technique: "Fluorescent blast ballast conversion to LED", crewSize: 1, hoursEstimate: 1.2 }
  },
  {
    id: "CP-1011",
    title: "Loose Scaffolding along Public Footpath",
    type: "Public Safety",
    description: "A commercial building renovation project has left metal pipes of scaffolding hanging loosely over the pedestrian walkway. Hazardous during winds.",
    language: "English",
    status: "In Progress",
    severity: 8,
    urgencyScore: 88,
    department: "PWD Roads",
    estimatedCost: 6200,
    lat: 40.0,
    lng: 15.0,
    locationName: "Renovation Site, Bandra Road",
    reporter: "Neha Mehta",
    civicScoreEarned: 90,
    reportedAt: new Date(Date.now() - 2.5 * 24 * 3600 * 1000).toISOString(),
    upvotes: 28,
    contractor: "Metro Road Works",
    progress: 30,
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 2.5 * 24 * 3600 * 1000).toISOString(), details: "Loose scaffolding hazard filed." },
      { status: "Assigned", timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), details: "Assigned to regional supervisor." },
      { status: "In Progress", timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), details: "Contractors sealing off scaffold poles." }
    ],
    aiPlan: { technique: "Hazard tape sealing and structural strapping", crewSize: 2, hoursEstimate: 2 }
  },
  {
    id: "CP-1012",
    title: "Construction Debris in Storm Canal",
    type: "Drainage",
    description: "Renovation concrete block rubble and soil bags have been dumped inside the main stormwater drainage canal, severely restricting exit flow.",
    language: "Marathi",
    status: "Resolved",
    severity: 6,
    urgencyScore: 65,
    department: "BMC Drainage",
    estimatedCost: 7000,
    lat: 68.0,
    lng: 45.0,
    locationName: "Canal Side Pathway, Ward 9",
    reporter: "Vijay Chavan",
    civicScoreEarned: 80,
    reportedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    upvotes: 11,
    contractor: "Rajesh Plumbing Co.",
    progress: 100,
    beforeImage: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80",
    afterImage: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&w=600&q=80",
    completionNotes: "Extracted 15 bags of cement slag and cleared the primary flow lines of debris.",
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), details: "Debris clog reported in Marathi." },
      { status: "Assigned", timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), details: "Assigned to Rajesh Plumbing." },
      { status: "Resolved", timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), details: "Debris extracted successfully." }
    ],
    aiPlan: { technique: "Excavator grab clearing & canal siltation wash", crewSize: 3, hoursEstimate: 4 }
  },
  {
    id: "CP-1013",
    title: "Sunken Manhole Cover creating Wheel Hazard",
    type: "Pothole",
    description: "The concrete round slab holding the heavy iron manhole cover has sunk nearly 10cm below asphalt grade level, creating a sudden severe wheel dip.",
    language: "English",
    status: "Verified",
    severity: 6,
    urgencyScore: 70,
    department: "PWD Roads",
    estimatedCost: 4500,
    lat: 38.0,
    lng: 48.0,
    locationName: "Sector 3 Main Avenue",
    reporter: "Girish Sharma",
    civicScoreEarned: 55,
    reportedAt: new Date(Date.now() - 1.2 * 24 * 3600 * 1000).toISOString(),
    upvotes: 19,
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 1.2 * 24 * 3600 * 1000).toISOString(), details: "Sunken manhole reported." },
      { status: "Verified", timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), details: "Verification threshold passed." }
    ],
    aiPlan: { technique: "Concrete slab leveling and asphalt matching", crewSize: 2, hoursEstimate: 3 }
  },
  {
    id: "CP-1014",
    title: "Sprinkler Pipe Joint Fracture",
    type: "Water Leakage",
    description: "Public park garden sprinkler connection pipe joint fractured, constantly spraying water onto the public walking path and flooding the grass.",
    language: "English",
    status: "Resolved",
    severity: 4,
    urgencyScore: 42,
    department: "BMC Water Dept",
    estimatedCost: 1800,
    lat: 15.0,
    lng: 72.0,
    locationName: "Park Side Walkway, Kurla B",
    reporter: "Sneha Patil",
    civicScoreEarned: 30,
    reportedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    upvotes: 8,
    contractor: "Rajesh Plumbing Co.",
    progress: 100,
    completionNotes: "Replaced 1-inch PVC elbow connector joint and optimized pressure valves.",
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), details: "Sprinkler leakage filed." },
      { status: "Resolved", timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), details: "Elbow joint replaced, testing ok." }
    ],
    aiPlan: { technique: "PVC coupling replacement & valve tightening", crewSize: 1, hoursEstimate: 1 }
  },
  {
    id: "CP-1015",
    title: "Illegal Slag Dump in Vacant Plot",
    type: "Waste Management",
    description: "A commercial mini-truck has dumped loads of industrial construction slag and dry tiles in the vacant municipal plot. Hazardous cement powder blowing around.",
    language: "English",
    status: "Assigned",
    severity: 7,
    urgencyScore: 75,
    department: "BMC Sanitation",
    estimatedCost: 8500,
    lat: 75.0,
    lng: 62.0,
    locationName: "Vacant Plot 41, Sector H",
    reporter: "Vikram Malhotra",
    civicScoreEarned: 90,
    reportedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    upvotes: 21,
    contractor: "Mumbai Waste Clear",
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), details: "Illegal dumping logged." },
      { status: "Assigned", timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(), details: "Assigned to Mumbai Waste Clear." }
    ],
    aiPlan: { technique: "Rotary skip loader extraction and plot fencing suggestion", crewSize: 3, hoursEstimate: 3 }
  },
  {
    id: "CP-1016",
    title: "Fully Dark Lane behind Market Yard",
    type: "Streetlight Damage",
    description: "The entire rear service alley behind the vegetable market has zero operating streetlights. Multiple instances of minor theft reported last week.",
    language: "English",
    status: "Reported",
    severity: 6,
    urgencyScore: 62,
    department: "BEST Electricity",
    estimatedCost: 11000,
    lat: 52.0,
    lng: 68.0,
    locationName: "Market Rear Alley, Ward 7",
    reporter: "Harish Rao",
    civicScoreEarned: 70,
    reportedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    upvotes: 6,
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), details: "Market alley black out reported." }
    ],
    aiPlan: { technique: "Mercury bulb replacement to solar LED pods", crewSize: 2, hoursEstimate: 2.5 }
  },
  {
    id: "CP-1017",
    title: "Collapsed Wall Blocking Footpath",
    type: "Public Safety",
    description: "Rubble bricks from a collapsed private plot boundary wall have spilled entirely across the walking pathway, forcing pedestrians to walk on the fast main road.",
    language: "Marathi",
    status: "Under Review",
    severity: 7,
    urgencyScore: 78,
    department: "PWD Roads",
    estimatedCost: 4000,
    lat: 48.0,
    lng: 35.0,
    locationName: "Bandra Promenade Side",
    reporter: "Ashok Patil",
    civicScoreEarned: 60,
    reportedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    upvotes: 14,
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), details: "Boundary wall crumble logged." },
      { status: "Under Review", timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), details: "Notice issued to private owner while routing clearance team." }
    ],
    aiPlan: { technique: "Mechanical rubble displacement & debris boarding", crewSize: 2, hoursEstimate: 2 }
  },
  {
    id: "CP-1018",
    title: "Stagnant Water Breeding mosquito cluster",
    type: "Drainage",
    description: "Large pool of stinking stagnant water has formed in the open drainage canal block behind Sector 3 shops, triggering mosquito plague.",
    language: "English",
    status: "In Progress",
    severity: 7,
    urgencyScore: 82,
    department: "BMC Drainage",
    estimatedCost: 9000,
    lat: 28.0,
    lng: 52.0,
    locationName: "Open Canal, Sector 3 Shops",
    reporter: "Nisha Kamath",
    civicScoreEarned: 85,
    reportedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    upvotes: 25,
    contractor: "Rajesh Plumbing Co.",
    progress: 70,
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), details: "Open stagnation logged." },
      { status: "Assigned", timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), details: "Rajesh Plumbing assigned for drainage pump-out." },
      { status: "In Progress", timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), details: "Water pumping active, bio-larvicide oil spraying in progress." }
    ],
    aiPlan: { technique: "Drain siphoning & pesticide fogging combination", crewSize: 3, hoursEstimate: 3.5 }
  },
  {
    id: "CP-1019",
    title: "Asphalt Cracks and Wear from Heavy Loads",
    type: "Pothole",
    description: "The main avenue road is cracking heavily and crumbling into gravel under constant construction truck logistics. Starting to form potholes.",
    language: "English",
    status: "Resolved",
    severity: 7,
    urgencyScore: 68,
    department: "PWD Roads",
    estimatedCost: 15000,
    lat: 42.0,
    lng: 24.0,
    locationName: "Main Ave, Ward 7",
    reporter: "Anupama Rao",
    civicScoreEarned: 100,
    reportedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    upvotes: 13,
    contractor: "Metro Road Works",
    progress: 100,
    completionNotes: "Re-layered 50 meters of asphalt, compressed with heavy road roller, and re-painted yellow division line.",
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(), details: "Asphalt breakdown logged." },
      { status: "Assigned", timestamp: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), details: "Metro Road Works dispatched." },
      { status: "Resolved", timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), details: "Asphalt fully paved and certified open." }
    ],
    aiPlan: { technique: "Milling and hot-mix overlay paving", crewSize: 4, hoursEstimate: 6 }
  },
  {
    id: "CP-1020",
    title: "Sprinkler Pipe Burst near Subway Station",
    type: "Water Leakage",
    description: "A secondary pipeline split spraying high pressure water right across the exit stairway of Andheri subway station, blocking passengers.",
    language: "English",
    status: "Reported",
    severity: 8,
    urgencyScore: 85,
    department: "BMC Water Dept",
    estimatedCost: 6500,
    lat: 22.0,
    lng: 50.0,
    locationName: "Station Stairway, Andheri West",
    reporter: "Deepak Joshi",
    civicScoreEarned: 120,
    reportedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    upvotes: 10,
    timeline: [
      { status: "Reported", timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), details: "Subway entry flooding reported." }
    ],
    aiPlan: { technique: "Shutoff valve seal and sleeve pipe lock", crewSize: 2, hoursEstimate: 1.5 }
  }
];

let blockchainLogs: BlockLog[] = [
  {
    blockNumber: 4821047,
    transactionHash: "0x3f7ad92cb847cf99eef099eef4d2ab3c8e4d1d9a8e2",
    issueId: "CP-1006",
    action: "RESOLVED",
    details: "Issue verified resolved by reporter and sealed on ledger.",
    timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    blockNumber: 4820951,
    transactionHash: "0x1a9f33de8c749f99eef10abc38a4d1d9a8e2be31f",
    issueId: "CP-1001",
    action: "CREATED",
    details: "Civic issue submitted and recorded on Polygon network.",
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
];

// Helper to generate transaction hash
function generateTxHash() {
  const characters = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 40; i++) {
    hash += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return hash;
}

// Rules-based fallback for AI classification
function getFallbackAnalysis(description: string, typeInput?: string): any {
  const text = description.toLowerCase();
  let type: Issue["type"] = "Other";
  
  if (typeInput && ["Pothole", "Water Leakage", "Waste Management", "Streetlight Damage", "Public Safety", "Drainage", "Other", "Water Leak", "Streetlight", "Garbage"].includes(typeInput)) {
    // Standardize inputs
    if (typeInput === "Water Leak") type = "Water Leakage";
    else if (typeInput === "Streetlight") type = "Streetlight Damage";
    else if (typeInput === "Garbage") type = "Waste Management";
    else type = typeInput as Issue["type"];
  } else if (text.includes("pothole") || text.includes("road") || text.includes("cracks") || text.includes("asphalt")) {
    type = "Pothole";
  } else if (text.includes("leak") || text.includes("pipe") || text.includes("flooding") || text.includes("water supply") || text.includes("sprinkler")) {
    type = "Water Leakage";
  } else if (text.includes("light") || text.includes("dark") || text.includes("lamp") || text.includes("electricity") || text.includes("bulb")) {
    type = "Streetlight Damage";
  } else if (text.includes("garbage") || text.includes("trash") || text.includes("smell") || text.includes("waste") || text.includes("cleaning") || text.includes("dumping") || text.includes("dustbin")) {
    type = "Waste Management";
  } else if (text.includes("drain") || text.includes("sewer") || text.includes("gutter") || text.includes("overflow") || text.includes("canal")) {
    type = "Drainage";
  } else if (text.includes("wire") || text.includes("scaffolding") || text.includes("exposed") || text.includes("shock") || text.includes("danger")) {
    type = "Public Safety";
  }

  const severities = { Pothole: 7, "Water Leakage": 8, "Streetlight Damage": 5, "Waste Management": 4, Drainage: 8, "Public Safety": 9, Other: 4, "Water Leak": 8, Streetlight: 5, Garbage: 4 };
  const depts = {
    Pothole: "PWD Roads",
    "Water Leakage": "BMC Water Dept",
    "Streetlight Damage": "BEST Electricity",
    "Waste Management": "BMC Sanitation",
    Drainage: "BMC Drainage",
    "Public Safety": "BEST Electricity",
    Other: "Municipal Corporation",
    "Water Leak": "BMC Water Dept",
    Streetlight: "BEST Electricity",
    Garbage: "BMC Sanitation"
  };
  const costs = { Pothole: 12000, "Water Leakage": 9500, "Streetlight Damage": 4000, "Waste Management": 1500, Drainage: 18000, "Public Safety": 11000, Other: 5000, "Water Leak": 9500, Streetlight: 4000, Garbage: 1500 };
  const techniques = {
    Pothole: "Hot-mix asphalt filling and roll press",
    "Water Leakage": "Section cut, pipe replacement, and reinforcement clamp",
    "Streetlight Damage": "LED block bulb change and circuit check",
    "Waste Management": "Compactor vehicle clearance and sanitation spraying",
    Drainage: "Suction machine de-clogging and grate fixing",
    "Public Safety": "Emergency cabinet replacement & wiring insulation",
    Other: "On-site assessment and community assistance plan",
    "Water Leak": "Section cut, pipe replacement, and reinforcement clamp",
    Streetlight: "LED block bulb change and circuit check",
    Garbage: "Compactor vehicle clearance and sanitation spraying"
  };

  const baseSeverity = severities[type] || 5;
  const department = depts[type] || "Municipal Corporation";
  const estimatedCost = costs[type] || 6000;
  const technique = techniques[type] || "General municipal repair procedure";
  
  const urgencyScore = Math.min(100, Math.max(10, baseSeverity * 10 + Math.floor(Math.random() * 15) - 5));
  let severityLabel = "Medium";
  if (baseSeverity >= 8) severityLabel = "Critical";
  else if (baseSeverity >= 7) severityLabel = "High";
  else if (baseSeverity <= 3) severityLabel = "Low";

  return {
    type,
    severity: baseSeverity,
    severityLabel,
    urgencyScore,
    department,
    estimatedCost,
    technique,
    crewSize: Math.floor(Math.random() * 3) + 1,
    hoursEstimate: parseFloat((Math.random() * 4 + 1.5).toFixed(1))
  };
}

// Helper to call Gemini with exponential backoff, jitter, and model rotation for transient errors
async function callGeminiWithRetry(client: any, options: any, maxRetries = 3, initialDelayMs = 1500): Promise<any> {
  let attempt = 0;
  const modelsToTry = [options.model || "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let modelIndex = 0;

  while (true) {
    const currentModel = modelsToTry[modelIndex];
    const currentOptions = {
      ...options,
      model: currentModel
    };

    try {
      console.log(`[Gemini API] Dispatching content generation request using model: ${currentModel} (Attempt ${attempt + 1}/${maxRetries})`);
      return await client.models.generateContent(currentOptions);
    } catch (error: any) {
      attempt++;
      const errorMsg = error?.message || "";
      const errorStatus = error?.status || error?.code || 0;
      const errorString = (String(error) + " " + JSON.stringify(error) + " " + errorMsg).toLowerCase();
      
      const isTransient = (
        errorStatus === 503 ||
        errorStatus === 429 ||
        errorString.includes("503") ||
        errorString.includes("429") ||
        errorString.includes("unavailable") ||
        errorString.includes("high demand") ||
        errorString.includes("exhausted") ||
        errorString.includes("rate limit") ||
        errorString.includes("overloaded") ||
        errorString.includes("busy")
      );
      
      if (isTransient && attempt < maxRetries) {
        const oldModel = currentModel;
        if (modelIndex < modelsToTry.length - 1) {
          modelIndex++;
        }
        console.warn(`[Gemini API] Attempt ${attempt} failed with model ${oldModel} (Transient issue). Rotating to: ${modelsToTry[modelIndex]}`);
        const delay = initialDelayMs * Math.pow(2, attempt - 1) * (1 + Math.random() * 0.15);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(`[Gemini API] All retries exhausted. Failed with model ${currentModel}:`, error);
        throw error;
      }
    }
  }
}

// REST API Endpoints

// 1. Analyze issue with Gemini AI or Fallback
app.post("/api/analyze-issue", async (req, res) => {
  const { description, typeHint } = req.body;
  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  const client = getGeminiClient();
  if (!client) {
    console.log("No active Gemini API key found, running fallback rule-based analysis");
    const fallback = getFallbackAnalysis(description, typeHint);
    return res.json(fallback);
  }

  try {
    const prompt = `Analyze this citizen report of a city issue in a municipal area:
"${description}"
Identify:
1. Category/Type of issue (Choose exactly one of: "Pothole", "Water Leakage", "Waste Management", "Streetlight Damage", "Public Safety", "Drainage", "Other")
2. Severity score on a scale from 1 to 10 (Critical is 8-10, medium 4-7, minor 1-3)
3. Urgency score on a scale from 1 to 100
4. Severity label ("Low", "Medium", "High", "Critical")
5. Department in charge (e.g., PWD Roads, BMC Water Dept, BEST Electricity, BMC Sanitation, BMC Drainage, Municipal Corporation)
6. Estimated Repair Cost in Indian Rupees (₹) as a solid number (e.g. 15000)
7. Optimal Resolution Technique (a short 4-8 word repair action, e.g. "Cold-mix asphalt patching")
8. Recommended Crew Size (integer)
9. Estimated Hours to Repair (number of hours, can be float)

Return strictly the structured JSON data matching the requested schema. Use reasonable estimates.`;

    const response = await callGeminiWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              description: "Must be exactly one of: Pothole, Water Leakage, Waste Management, Streetlight Damage, Public Safety, Drainage, Other"
            },
            severity: {
              type: Type.INTEGER,
              description: "Integer from 1 to 10"
            },
            urgencyScore: {
              type: Type.INTEGER,
              description: "Integer from 1 to 100"
            },
            severityLabel: {
              type: Type.STRING,
              description: "Low, Medium, High, or Critical"
            },
            department: {
              type: Type.STRING,
              description: "Responsible city department"
            },
            estimatedCost: {
              type: Type.INTEGER,
              description: "Cost estimate in Rupees"
            },
            technique: {
              type: Type.STRING,
              description: "Resolution method"
            },
            crewSize: {
              type: Type.INTEGER,
              description: "Required crew size"
            },
            hoursEstimate: {
              type: Type.NUMBER,
              description: "Estimated hours to finish"
            }
          },
          required: ["type", "severity", "urgencyScore", "severityLabel", "department", "estimatedCost", "technique", "crewSize", "hoursEstimate"]
        }
      }
    });

    const parsedResult = JSON.parse(response.text || "{}");
    const validTypes = ["Pothole", "Water Leakage", "Waste Management", "Streetlight Damage", "Public Safety", "Drainage", "Other"];
    if (!validTypes.includes(parsedResult.type)) {
      parsedResult.type = typeHint && validTypes.includes(typeHint) ? typeHint : "Other";
    }

    res.json(parsedResult);
  } catch (error) {
    console.error("Gemini API call failed, falling back to local analyzer:", error);
    const fallback = getFallbackAnalysis(description, typeHint);
    res.json(fallback);
  }
});

// 2. Get list of all issues
app.get("/api/issues", (req, res) => {
  res.json(issues);
});

// Check duplicates endpoint (by coordinate distance and category similarity)
app.post("/api/issues/check-duplicate", (req, res) => {
  const { lat, lng, type } = req.body;
  if (lat === undefined || lng === undefined || !type) {
    return res.status(400).json({ error: "Missing lat, lng, or type parameters" });
  }

  // Scan unresolved duplicates within a distance score threshold of 10
  const threshold = 10;
  const duplicate = issues.find(i => {
    if (i.status === "Resolved") return false;
    // Map standard water leak / streetlight / garbage matching
    const normType = (t: string) => {
      if (t === "Water Leak") return "Water Leakage";
      if (t === "Streetlight") return "Streetlight Damage";
      if (t === "Garbage") return "Waste Management";
      return t;
    };

    if (normType(i.type) !== normType(type)) return false;

    const dist = Math.sqrt(Math.pow(i.lat - lat, 2) + Math.pow(i.lng - lng, 2));
    return dist < threshold;
  });

  if (duplicate) {
    return res.json({ found: true, issue: duplicate });
  }
  return res.json({ found: false });
});

// 3. File a new issue with custom inputs & timestamp
app.post("/api/issues", (req, res) => {
  const {
    title,
    description,
    type,
    severity,
    urgencyScore,
    department,
    estimatedCost,
    technique,
    crewSize,
    hoursEstimate,
    language,
    locationName,
    reporter,
    lat,
    lng,
    beforeImage
  } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  const id = `CP-${Math.floor(Math.random() * 9000) + 1000}`;
  
  // Custom coordinates or randomized coordinates
  const finalLat = lat !== undefined ? lat : (Math.floor(Math.random() * 65) + 15);
  const finalLng = lng !== undefined ? lng : (Math.floor(Math.random() * 70) + 15);

  const cleanType = (t: string) => {
    if (t === "Water Leak") return "Water Leakage";
    if (t === "Streetlight") return "Streetlight Damage";
    if (t === "Garbage") return "Waste Management";
    return t || "Other";
  };

  const newIssue: Issue = {
    id,
    title: title || `${cleanType(type)} Hazard`,
    type: cleanType(type) as any,
    description,
    language: language || "English",
    status: "Reported", // Default status is Reported
    severity: severity || 5,
    urgencyScore: urgencyScore || 50,
    department: department || "Municipal Corporation",
    estimatedCost: estimatedCost || 5000,
    lat: finalLat,
    lng: finalLng,
    locationName: locationName || "Mumbai Ward Zone",
    reporter: reporter || "Anonymous Resident",
    civicScoreEarned: Math.floor(Math.random() * 50) + 30,
    reportedAt: new Date().toISOString(),
    upvotes: 1,
    comments: [],
    beforeImage: beforeImage || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80",
    progress: 0,
    timeline: [
      { status: "Reported", timestamp: new Date().toISOString(), details: "Complaint registered in municipal database." }
    ],
    aiPlan: {
      technique: technique || "Standard Repair Patch",
      crewSize: crewSize || 2,
      hoursEstimate: hoursEstimate || 2
    }
  };

  issues.unshift(newIssue);

  // Generate creation block log
  currentBlockNumber += Math.floor(Math.random() * 10) + 3;
  const createBlock: BlockLog = {
    blockNumber: currentBlockNumber,
    transactionHash: generateTxHash(),
    issueId: id,
    action: "CREATED",
    details: `Citizen ${newIssue.reporter} filed ${newIssue.type} report. Locked in block database.`,
    timestamp: new Date().toISOString()
  };
  blockchainLogs.unshift(createBlock);

  res.status(201).json({ issue: newIssue, blocks: [createBlock] });
});

// Upvote an issue
app.post("/api/issues/:id/upvote", (req, res) => {
  const { id } = req.params;
  const issue = issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  issue.upvotes = (issue.upvotes || 0) + 1;
  issue.civicScoreEarned = (issue.civicScoreEarned || 0) + 10;

  // If upvotes exceed 10 and status is reported, auto-triage to Verified
  if (issue.status === "Reported" && issue.upvotes >= 10) {
    issue.status = "Verified";
    issue.timeline?.push({
      status: "Verified",
      timestamp: new Date().toISOString(),
      details: "Community confirmation threshold exceeded. Issue flagged as Verified."
    });

    currentBlockNumber += 1;
    blockchainLogs.unshift({
      blockNumber: currentBlockNumber,
      transactionHash: generateTxHash(),
      issueId: id,
      action: "VALIDATED",
      details: "Crowd consensus reached. Issue verified by multiple local citizens.",
      timestamp: new Date().toISOString()
    });
  }

  res.json({ issue });
});

// Comment on an issue (supports both singular and plural paths)
app.post(["/api/issues/:id/comment", "/api/issues/:id/comments"], (req, res) => {
  const { id } = req.params;
  const { author, text, imageUrl } = req.body;
  const issue = issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  const comment = {
    id: `C-${Math.floor(Math.random() * 90000) + 10000}`,
    author: author || "Anonymous Citizen",
    text: text || "",
    timestamp: new Date().toISOString(),
    imageUrl
  };

  issue.comments = issue.comments || [];
  issue.comments.push(comment);

  res.status(201).json({ comment, issue });
});

// 4. Update status, contractor assignment, or escalate issue with extended timeline logging
app.post("/api/issues/:id/action", (req, res) => {
  const { id } = req.params;
  const { action, contractor, progress, afterImage, completionNotes, statusOverride } = req.body;

  const issue = issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  currentBlockNumber += Math.floor(Math.random() * 5) + 2;
  const txHash = generateTxHash();

  if (action === "ASSIGN_CONTRACTOR") {
    issue.status = "Assigned";
    issue.contractor = contractor || "Assigned Contractor";
    issue.progress = progress || 10;
    
    issue.timeline = issue.timeline || [];
    issue.timeline.push({
      status: "Assigned",
      timestamp: new Date().toISOString(),
      details: `Dispatched to approved local contractor ${issue.contractor}. Repair plan approved.`
    });

    const block: BlockLog = {
      blockNumber: currentBlockNumber,
      transactionHash: txHash,
      issueId: id,
      action: "CONTRACTOR_ASSIGNED",
      details: `Official assigned ${issue.contractor} to resolve issue. Budget approved: ₹${issue.estimatedCost.toLocaleString()}.`,
      timestamp: new Date().toISOString()
    };
    blockchainLogs.unshift(block);
  } else if (action === "ESCALATE") {
    issue.status = "Escalated";
    
    issue.timeline = issue.timeline || [];
    issue.timeline.push({
      status: "Escalated",
      timestamp: new Date().toISOString(),
      details: `System auto-escalated to Zonal Commissioner due to standard 48h response breach.`
    });

    const block: BlockLog = {
      blockNumber: currentBlockNumber,
      transactionHash: txHash,
      issueId: id,
      action: "ESCALATED",
      details: `System auto-escalated complaint to senior zonal officer due to standard timeline breach.`,
      timestamp: new Date().toISOString()
    };
    blockchainLogs.unshift(block);
  } else if (action === "RESOLVE") {
    issue.status = "Resolved";
    issue.progress = 100;
    issue.resolvedAt = new Date().toISOString();
    if (afterImage) issue.afterImage = afterImage;
    if (completionNotes) issue.completionNotes = completionNotes;

    issue.timeline = issue.timeline || [];
    issue.timeline.push({
      status: "Resolved",
      timestamp: new Date().toISOString(),
      details: `Contractor marked completed. Notes: ${completionNotes || "Verified fixed by municipal inspector."}`
    });

    const block: BlockLog = {
      blockNumber: currentBlockNumber,
      transactionHash: txHash,
      issueId: id,
      action: "RESOLVED",
      details: `Contractor reported repair complete. Verified by community. Issue permanently closed.`,
      timestamp: new Date().toISOString()
    };
    blockchainLogs.unshift(block);
  } else if (action === "SET_PROGRESS") {
    issue.progress = progress;
    if (progress === 100) {
      issue.status = "Resolved";
      issue.resolvedAt = new Date().toISOString();
      if (afterImage) issue.afterImage = afterImage;
      if (completionNotes) issue.completionNotes = completionNotes;
    } else {
      issue.status = "In Progress";
    }

    issue.timeline = issue.timeline || [];
    issue.timeline.push({
      status: progress === 100 ? "Resolved" : "In Progress",
      timestamp: new Date().toISOString(),
      details: progress === 100 
        ? `Marked completed at 100%. Notes: ${completionNotes || "Fully resolved."}` 
        : `Work in progress updated to ${progress}%.`
    });

    const block: BlockLog = {
      blockNumber: currentBlockNumber,
      transactionHash: txHash,
      issueId: id,
      action: progress === 100 ? "RESOLVED" : "WORK_STARTED",
      details: `Contractor updated repair progress to ${progress}%.`,
      timestamp: new Date().toISOString()
    };
    blockchainLogs.unshift(block);
  } else if (action === "UPDATE_STATUS" && statusOverride) {
    issue.status = statusOverride;
    
    issue.timeline = issue.timeline || [];
    issue.timeline.push({
      status: statusOverride,
      timestamp: new Date().toISOString(),
      details: `Zonal administrator manually shifted status to ${statusOverride}.`
    });

    if (statusOverride === "Resolved") {
      issue.progress = 100;
      issue.resolvedAt = new Date().toISOString();
      if (afterImage) issue.afterImage = afterImage;
      if (completionNotes) issue.completionNotes = completionNotes;
    }
  } else if (action === "ADMIN_UPDATE") {
    const { status: newStatus, department: newDept, severity: newSev, contractor: newContractor, progress: newProg, afterImage: newAfterImg, completionNotes: newNotes } = req.body;
    
    let changes: string[] = [];

    if (newDept && issue.department !== newDept) {
      changes.push(`department to "${newDept}"`);
      issue.department = newDept;
    }
    
    if (newStatus && issue.status !== newStatus) {
      changes.push(`status to "${newStatus}"`);
      issue.status = newStatus;
      if (newStatus === "Resolved") {
        issue.progress = 100;
        issue.resolvedAt = new Date().toISOString();
      } else if (newStatus === "In Progress" && (!issue.progress || issue.progress === 100)) {
        issue.progress = 15;
      }
    }

    if (newSev !== undefined && issue.severity !== newSev) {
      changes.push(`severity to ${newSev}/10`);
      issue.severity = newSev;
    }

    if (newContractor !== undefined && issue.contractor !== newContractor) {
      changes.push(`contractor to "${newContractor}"`);
      issue.contractor = newContractor;
    }

    if (newProg !== undefined && issue.progress !== newProg) {
      changes.push(`progress to ${newProg}%`);
      issue.progress = newProg;
      if (newProg === 100 && issue.status !== "Resolved") {
        issue.status = "Resolved";
        issue.resolvedAt = new Date().toISOString();
      }
    }

    if (newAfterImg !== undefined) {
      issue.afterImage = newAfterImg;
    }

    if (newNotes !== undefined) {
      issue.completionNotes = newNotes;
    }

    const changeDetails = changes.length > 0 ? `Admin updated: ${changes.join(", ")}.` : "Admin updated issue details.";
    
    issue.timeline = issue.timeline || [];
    issue.timeline.push({
      status: issue.status,
      timestamp: new Date().toISOString(),
      details: changeDetails + (newNotes ? ` Notes: ${newNotes}` : "")
    });

    const block: BlockLog = {
      blockNumber: currentBlockNumber,
      transactionHash: txHash,
      issueId: id,
      action: issue.status === "Resolved" ? "RESOLVED" : "WORK_STARTED",
      details: changeDetails,
      timestamp: new Date().toISOString()
    };
    blockchainLogs.unshift(block);
  }

  res.json({ issue, logs: blockchainLogs.filter(b => b.issueId === id) });
});

// 5. Get dynamic platform statistics
app.get("/api/stats", (req, res) => {
  const total = issues.length;
  const resolved = issues.filter(i => i.status === "Resolved").length;
  const active = issues.filter(i => i.status === "Reported" || i.status === "Under Review" || i.status === "Verified" || i.status === "Active" || i.status === "Escalated").length;
  const inProgress = issues.filter(i => i.status === "In Progress" || i.status === "Assigned").length;
  const totalCostResolved = issues.filter(i => i.status === "Resolved").reduce((acc, i) => acc + i.estimatedCost, 0);

  res.json({
    total,
    resolved,
    active,
    inProgress,
    resolutionRate: total > 0 ? parseFloat(((resolved / total) * 100).toFixed(1)) : 94.7,
    totalBudgetSpent: totalCostResolved,
    avgFixTimeHours: 28, // optimized speed!
    citizensServed: 2400000 + (total - 20) * 350
  });
});

// 6. Get blockchain logs
app.get("/api/blockchain-logs", (req, res) => {
  res.json(blockchainLogs);
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
