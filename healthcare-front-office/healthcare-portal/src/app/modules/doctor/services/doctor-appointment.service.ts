import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentResponse, ScheduleSlot } from '../../patient/services/appointment.service';

export interface UnavailabilityWindow { from: string; to: string; }

export interface WorkScheduleRequest {
  doctorId: number;
  workStart: string;
  workEnd: string;
  consultationMinutes: number;
  restDays: string[];
  unavailableWindows: UnavailabilityWindow[];
}

export interface DoctorExceptionRequest {
  doctorId: number;
  date: string;       // "yyyy-MM-dd"
  fromTime?: string;  // "HH:mm" — omit for whole day
  toTime?: string;
}

export interface DoctorExceptionResponse {
  id: number;
  doctorId: number;
  date: string;
  fromTime: string | null;
  toTime: string | null;
  wholeDay: boolean;
}

@Injectable({ providedIn: 'root' })
export class DoctorAppointmentService {
    private readonly base = 'http://localhost:8088';

    constructor(private http: HttpClient) { }

    /** Returns all appointments for the logged-in doctor */
    getDoctorAppointments(doctorId: number): Observable<AppointmentResponse[]> {
        return this.http.get<AppointmentResponse[]>(
            `${this.base}/appointement/doctor/${doctorId}`
        );
    }

    /** Confirm (CONFIRMED) an appointment */
    confirm(appointmentId: number): Observable<AppointmentResponse> {
        return this.http.patch<AppointmentResponse>(
            `${this.base}/appointement/${appointmentId}/status?status=CONFIRMED`, {}
        );
    }

    /** Refuse (CANCELLED) an appointment */
    refuse(appointmentId: number): Observable<AppointmentResponse> {
        return this.http.patch<AppointmentResponse>(
            `${this.base}/appointement/${appointmentId}/status?status=CANCELLED`, {}
        );
    }

    /** Reschedule an appointment to a new slot */
    reschedule(appointmentId: number, newScheduleId: number): Observable<AppointmentResponse> {
        return this.http.patch<AppointmentResponse>(
            `${this.base}/appointement/${appointmentId}/reschedule?newScheduleId=${newScheduleId}`, {}
        );
    }

    /** Get all available schedule slots for a doctor */
    getAvailableSlots(doctorId: number): Observable<ScheduleSlot[]> {
        return this.http.get<ScheduleSlot[]>(
            `${this.base}/api/doctor/schedules/doctor/${doctorId}/available`
        );
    }

    /** Delete an appointment completely from the database */
    delete(appointmentId: number): Observable<void> {
        return this.http.delete<void>(
            `${this.base}/appointement/${appointmentId}`
        );
    }

    /** Create a new schedule slot for the doctor (legacy single-slot) */
    createScheduleSlot(payload: { doctorId: number; date: string; startTime: string; isAvailable: boolean }): Observable<any> {
        return this.http.post<any>(`${this.base}/api/doctor/schedules`, payload);
    }

    // ─── Year-round generation ──────────────────────────────────────────────────

    /** Generate slots for the rest of the current year from a work template */
    generateSlots(payload: WorkScheduleRequest): Observable<ScheduleSlot[]> {
        return this.http.post<ScheduleSlot[]>(`${this.base}/api/doctor/schedules/generate`, payload);
    }

    /** Delete all unbooked slots for a doctor (before regenerating) */
    clearAvailableSlots(doctorId: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/api/doctor/schedules/doctor/${doctorId}/available`);
    }

    /** Delete all unbooked slots for a specific date and doctor */
    clearAvailableSlotsByDate(doctorId: number, date: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/api/doctor/schedules/doctor/${doctorId}/available/date/${date}`);
    }

    // ─── Day-specific exceptions ────────────────────────────────────────────────

    /** Add a date-specific unavailability exception */
    addException(payload: DoctorExceptionRequest): Observable<DoctorExceptionResponse> {
        return this.http.post<DoctorExceptionResponse>(`${this.base}/api/doctor/exceptions`, payload);
    }

    /** Get all exceptions for a doctor */
    getExceptions(doctorId: number): Observable<DoctorExceptionResponse[]> {
        return this.http.get<DoctorExceptionResponse[]>(`${this.base}/api/doctor/exceptions/${doctorId}`);
    }

    /** Delete an exception (restores the affected slots) */
    deleteException(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/api/doctor/exceptions/${id}`);
    }
}
