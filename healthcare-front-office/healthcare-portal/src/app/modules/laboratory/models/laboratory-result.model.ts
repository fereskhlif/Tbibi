export interface LaboratoryResultResponse {
  labId: number;
  testName: string;
  location: string;
  nameLabo: string;
  resultValue: string;
  status: string;
  testDate: string;

  // Laborantin
  laboratoryUserId: number;
  laboratoryUserName: string;

  // ✅ Patient
  patientId?: number;
  patientName?: string;

  // ✅ Médecin prescripteur
  prescribedByDoctorId?: number;
  prescribedByDoctorName?: string;

  // Notification
  notificationMessage?: string;
  notificationSent: boolean;
  notificationDate?: string;
  
  // ✅ Gestion des priorités
  priority?: string; // Normal, Urgent, Critical
  requestedAt?: string;
  requestNotes?: string;
}

export interface LaboratoryResultRequest {
  testName: string;
  location: string;
  nameLabo: string;
  resultValue: string;
  status: string;
  testDate: string;
  laboratoryUserId: number;
  patientId?: number;  // ✅ optionnel
  prescribedByDoctorId?: number;  // ✅ optionnel - médecin prescripteur
  priority?: string; // ✅ Normal, Urgent, Critical
  requestedAt?: string;
  requestNotes?: string;
}
