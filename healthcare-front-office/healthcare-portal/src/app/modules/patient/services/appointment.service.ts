import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    patientName: string;
    doctor: string;
    service: string;
    specialty: string;
    reasonForVisit: string;
    statusAppointement: string;
    scheduleId: number;
    scheduleDate: string;
    scheduleTime: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
    private readonly base = 'http://localhost:8088';

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
            `${this.base}/api/doctor/schedules/doctor/${doctorId}/available`
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

    /** Cancels an appointment (sets status to CANCELLED) */
    cancelAppointment(appointmentId: number): Observable<AppointmentResponse> {
        return this.http.patch<AppointmentResponse>(
            `${this.base}/appointement/${appointmentId}/status?status=CANCELLED`,
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
}
