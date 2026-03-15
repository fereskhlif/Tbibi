import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('🔍 Requête interceptée:', request.method, request.url);
    
    // Exclure les endpoints d'authentification (optionnel)
    if (request.url.includes('/auth/')) {
      return next.handle(request);
    }
    
    let token = localStorage.getItem('TokenUserConnect');
    console.log('🔍 Token brut du localStorage:', token);
    
    if (!token) {
      console.warn('⚠️ Aucun token trouvé');
      return next.handle(request);
    }
    
    // NETTOYAGE DU TOKEN
    // Enlever les guillemets au début et à la fin
    token = token.replace(/^"|"$/g, '');
    // Enlever les espaces
    token = token.trim();
    
    console.log('🔍 Token nettoyé:', token.substring(0, 30) + '...');
    
    const authRequest = request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        
        ...(request.body instanceof FormData ? {} : { 'Content-Type': 'application/json' })
      }
    });
    
    console.log('🔍 Headers de la requête:', authRequest.headers.keys());
    
    return next.handle(authRequest);
  }
}