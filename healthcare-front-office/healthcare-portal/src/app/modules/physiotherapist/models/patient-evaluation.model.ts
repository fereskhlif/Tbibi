export interface PatientEvaluation {
  evaluationId?: number;
  patientId: number;
  patientName?: string;
  patientEmail?: string;
  physiotherapistId: number;
  physiotherapistName?: string;
  evaluationDate: string;
  painScale: number; // 0-10
  painDescription: string;
  flexionDegrees: number;
  extensionDegrees: number;
  jointLocation: string;
  functionalLimitations: string;
  generalObservations?: string;
  treatmentGoals?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientEvaluationRequest {
  patientId: number;
  physiotherapistId: number;
  evaluationDate: string;
  painScale: number;
  painDescription: string;
  flexionDegrees: number;
  extensionDegrees: number;
  jointLocation: string;
  functionalLimitations: string;
  generalObservations?: string;
  treatmentGoals?: string;
}
