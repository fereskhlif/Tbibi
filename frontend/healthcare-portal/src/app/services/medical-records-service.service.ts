import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordsServiceService {

   constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
  return this.http.get<any[]>(`${environment.baseUrl}/medical-records/getAll`);
}
  add(data: any): Observable<any> {
  return this.http.post<any>(`${environment.baseUrl}/medical-records/add`, data);
}

update(id: number, data: any): Observable<any> {
  return this.http.put<any>(`${environment.baseUrl}/medical-records/${id}`, data);
}

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.baseUrl}/medical-records/${id}`);
  }
}
