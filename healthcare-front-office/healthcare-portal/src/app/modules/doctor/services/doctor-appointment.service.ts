import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentResponse, ScheduleSlot } from '../../patient/services/appointment.service';

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

    /** Create a new schedule slot for the doctor */
    createScheduleSlot(payload: { doctorId: number; date: string; startTime: string; isAvailable: boolean }): Observable<any> {
        return this.http.post<any>(`${this.base}/api/doctor/schedules`, payload);
    }
}
