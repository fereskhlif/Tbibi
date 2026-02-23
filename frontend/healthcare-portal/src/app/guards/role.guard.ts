import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const expectedRole = route.data['role'];
    let userRole = localStorage.getItem('RoleUserConnect');

    if (!userRole) return this.router.parseUrl('/login');

    // Nettoyer les guillemets ajoutés par JSON.stringify
    userRole = userRole.replace(/"/g, '');

    if (userRole === expectedRole) return true;

    // Rediriger vers la bonne page selon le rôle réel
    switch (userRole) {
      case 'ROLE_PATIENT': return this.router.parseUrl('/patient');
      case 'ROLE_DOCTOR': return this.router.parseUrl('/doctor');
      case 'ROLE_PHARMACIST': return this.router.parseUrl('/pharmacist');
      case 'ROLE_PHYSIOTHERAPIST': return this.router.parseUrl('/physio');
      case 'ROLE_LABORATORY': return this.router.parseUrl('/laboratory');
      default: return this.router.parseUrl('/login');
    }
  }
};
