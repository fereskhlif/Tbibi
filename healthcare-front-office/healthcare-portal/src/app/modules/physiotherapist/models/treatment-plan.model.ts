export interface TreatmentPlan {
  planId?: number;
  patientId: number;
  patientName?: string;
  patientEmail?: string;
  physiotherapistId: number;
  physiotherapistName?: string;
  planName: string;
  diagnosis: string;
  therapeuticGoals: string;
  exercises: string;
  durationWeeks: number;
  startDate: string;
  endDate?: string;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TreatmentPlanRequest {
  patientId: number;
  physiotherapistId: number;
  planName: string;
  diagnosis: string;
  therapeuticGoals: string;
  exercises: string;
  durationWeeks: number;
  startDate: string;
  status?: string;
  notes?: string;
}
