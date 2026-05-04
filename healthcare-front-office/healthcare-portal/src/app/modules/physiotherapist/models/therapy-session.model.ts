export interface TherapySessionRequest {
  therapyType?: string;
  progressNote?: string;
  scheduledDate: string;
  evaluationResult?: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  status?: string;
  patientId: number;
  physiotherapistId: number;
  exercisesPerformed?: string;
  sessionNotes?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  actualDurationMinutes?: number;
}

export interface TherapySessionResponse {
  sessionId: number;
  therapyType?: string;
  progressNote?: string;
  scheduledDate: string;
  evaluationResult?: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  status: string;
  patientId: number;
  patientFullName: string;
  physiotherapistId: number;
  physiotherapistFullName: string;
  exercisesPerformed?: string;
  sessionNotes?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  actualDurationMinutes?: number;
}

export interface PatientProgressDTO {
  patientId: number;
  patientName: string;
  patientEmail: string;
  currentTherapyType: string;
  totalSessions: number;
  completedSessions: number;
  scheduledSessions: number;
  cancelledSessions: number;
  progressPercentage: number;
  lastSessionDate: string;
  lastSessionType: string;
  lastSessionNote: string;
  nextSessionDate: string;
  nextSessionTime: string;
  nextSessionType: string;
  status: string;
}