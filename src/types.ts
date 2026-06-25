export interface Issue {
  id: string;
  type: "Pothole" | "Water Leak" | "Streetlight" | "Garbage" | "Drainage" | "Other";
  description: string;
  language: string;
  status: "Active" | "Escalated" | "In Progress" | "Resolved";
  severity: number;
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
