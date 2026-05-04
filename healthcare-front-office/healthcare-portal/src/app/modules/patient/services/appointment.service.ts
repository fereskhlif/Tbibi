import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface Doctor {
    userId: number;
    name: string;
    specialty: string;
    email?: string;
    adresse?: string;
    profilPicture?: string;
}

export interface ScheduleSlot {
    scheduleId: number;
    doctorId: number;
    doctorName: string;
    date: string;    // LocalDate → "YYYY-MM-DD"
    startTime: string; // LocalTime → "HH:mm:ss"
    isAvailable: boolean;
}

export interface AppointmentRequest {
    userId: number;
    doctor: string;
    service: string;
    specialty: string;
    reasonForVisit: string;
    statusAppointement: string;
    scheduleId: number;
}

export interface VerificationRequest {
    userId?: number;
    patientName: string;
    patientPhone?: string;
    patientEmail?: string;
    scheduleId: number;
    doctor: string;
    specialty: string;
    reasonForVisit: string;
}

export interface AppointmentResponse {
    appointmentId: number;
    userId: number;
    doctorId?: number;
    patientName: string;
    doctor: string;
    service: string;
    specialty: string;
    reasonForVisit: string;
    statusAppointement: string;
    scheduleId: number;
    scheduleDate: string;
    scheduleTime: string;
    meetingLink?: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
    private readonly base = `${environment.baseUrl}`;

    constructor(private http: HttpClient) { }

    /** Returns list of distinct doctor specialties */
    getSpecialties(): Observable<string[]> {
        return this.http.get<string[]>(`${this.base}/api/public/doctors/specialties`);
    }

    /** Returns doctors filtered by specialty */
    getDoctorsBySpecialty(specialty: string): Observable<Doctor[]> {
        return this.http.get<Doctor[]>(
            `${this.base}/api/public/doctors?specialty=${encodeURIComponent(specialty)}`
        );
    }

    /** Returns doctors filtered by name */
    getDoctorsByName(name: string): Observable<Doctor[]> {
        return this.http.get<Doctor[]>(
            `${this.base}/api/public/doctors?name=${encodeURIComponent(name)}`
        );
    }

    /** Returns available (unbooked) schedule slots for a doctor */
    getAvailableSchedules(doctorId: number): Observable<ScheduleSlot[]> {
        return this.http.get<ScheduleSlot[]>(
            `${this.base}/api/doctor/schedules/doctor/${doctorId}/available?t=${new Date().getTime()}`
        );
    }

    /** Returns all appointments for a patient by userId */
    getPatientAppointments(userId: number): Observable<AppointmentResponse[]> {
        return this.http.get<AppointmentResponse[]>(
            `${this.base}/appointement/patient/${userId}`
        );
    }

    /** Creates a new appointment */
    createAppointment(req: AppointmentRequest): Observable<AppointmentResponse> {
        return this.http.post<AppointmentResponse>(`${this.base}/appointement`, req);
    }

    /** Send SMS verification code before confirming */
    sendVerification(req: VerificationRequest): Observable<{ verificationId: string }> {
        return this.http.post<{ verificationId: string }>(`${this.base}/appointement/send-verification`, req);
    }

    /** Verify code and confirm appointment (sends confirmation email) */
    verifyAndConfirm(verificationId: string, code: string): Observable<AppointmentResponse> {
        return this.http.post<AppointmentResponse>(`${this.base}/appointement/verify-and-confirm`, { verificationId, code });
    }

    /** Validate OTP code only (for Physio/Lab flows — does NOT create an appointment) */
    validateCode(verificationId: string, code: string): Observable<{ valid: boolean }> {
        return this.http.post<{ valid: boolean }>(`${this.base}/appointement/validate-code`, { verificationId, code });
    }

    /** Cancels an appointment (sets status to CANCELLED) */
    cancelAppointment(appointmentId: number): Observable<AppointmentResponse> {
        return this.http.patch<AppointmentResponse>(
            `${this.base}/appointement/${appointmentId}/status?status=CANCELLED`,
            {}
        );
    }

    /** Patient accepts the doctor's proposed new time */
    acceptReschedule(appointmentId: number): Observable<AppointmentResponse> {
        return this.http.patch<AppointmentResponse>(
            `${this.base}/appointement/${appointmentId}/accept-reschedule`,
            {}
        );
    }

    /** Patient rejects the doctor's proposed new time */
    rejectReschedule(appointmentId: number): Observable<AppointmentResponse> {
        return this.http.patch<AppointmentResponse>(
            `${this.base}/appointement/${appointmentId}/reject-reschedule`,
            {}
        );
    }

    /** Updates appointment status (PENDING, CONFIRMED, CANCELLED) */
    updateAppointmentStatus(appointmentId: number, status: string): Observable<AppointmentResponse> {
        return this.http.patch<AppointmentResponse>(
            `${this.base}/appointement/${appointmentId}/status?status=${status}`,
            {}
        );
    }

    /** Deletes an appointment by ID */
    deleteAppointment(appointmentId: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/appointement/${appointmentId}`);
    }

    /** Updates appointment reason/details */
    updateAppointment(appointmentId: number, req: Partial<AppointmentRequest>): Observable<AppointmentResponse> {
        return this.http.put<AppointmentResponse>(`${this.base}/appointement/${appointmentId}`, req);
    }

    /** Returns list of all physiotherapists */
    getPhysiotherapists(): Observable<Doctor[]> {
        return this.http.get<Doctor[]>(`${this.base}/appointement/api/public/physiotherapists`);
    }

    /** Returns list of all laboratories */
    getLaboratories(): Observable<Doctor[]> {
        return this.http.get<Doctor[]>(`${this.base}/appointement/api/public/laboratories`);
    }

    /** Books a physiotherapy session */
    bookPhysio(req: {
        patientId: number; physiotherapistId: number; scheduleId: number;
        therapyType: string; reasonForVisit: string; preferredDate: string;
        patientName: string; patientEmail: string; patientPhone: string;
    }): Observable<AppointmentResponse> {
        return this.http.post<AppointmentResponse>(`${this.base}/appointement/physio-booking`, req);
    }

    /** Books a laboratory analysis */
    bookLab(req: {
        patientId: number; laboratoryId: number; scheduleId: number;
        analysisType: string; notes: string; preferredDate: string;
        patientName: string; patientEmail: string; patientPhone: string;
    }): Observable<AppointmentResponse> {
        return this.http.post<AppointmentResponse>(`${this.base}/appointement/lab-booking`, req);
    }
}
