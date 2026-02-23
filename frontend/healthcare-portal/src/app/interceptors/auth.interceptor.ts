import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
     const token = localStorage.getItem('TokenUserConnect');
    if (!token) {
      return next.handle(request);
    }
    const cleanToken = token.replace(/"/g, '');
    const authRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${cleanToken}`
      }
    });
    return next.handle(authRequest);
  }
}