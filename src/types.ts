export interface Issue {
  id: string;
  title?: string;
  type: "Pothole" | "Water Leak" | "Streetlight" | "Garbage" | "Drainage" | "Other" | "Water Leakage" | "Waste Management" | "Streetlight Damage" | "Public Safety";
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

export interface BlockLog {
  blockNumber: number;
  transactionHash: string;
  issueId: string;
  action: "CREATED" | "VALIDATED" | "ESCALATED" | "RESOLVED" | "CONTRACTOR_ASSIGNED" | "WORK_STARTED";
  details: string;
  timestamp: string;
}

export interface PlatformStats {
  total: number;
  resolved: number;
  active: number;
  inProgress: number;
  resolutionRate: number;
  totalBudgetSpent: number;
  avgFixTimeHours: number;
  citizensServed: number;
}
