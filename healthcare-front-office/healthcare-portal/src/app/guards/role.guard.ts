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

    // Normaliser le rôle (enlever le préfixe ROLE_ si présent)
    const normalizedUserRole = userRole.startsWith('ROLE_') ? userRole.substring(5) : userRole;
    const normalizedExpectedRole = expectedRole.startsWith('ROLE_') ? expectedRole.substring(5) : expectedRole;

    if (normalizedUserRole === normalizedExpectedRole) return true;

    // Rediriger vers la bonne page selon le rôle réel
    switch (normalizedUserRole) {
      case 'PATIENT': return this.router.parseUrl('/patient');
      case 'DOCTEUR': return this.router.parseUrl('/doctor');
      case 'PHARMASIS': return this.router.parseUrl('/pharmacist');
      case 'KINE': return this.router.parseUrl('/physio');
      case 'LABORATORY': return this.router.parseUrl('/laboratory');
      case 'ADMIN': return this.router.parseUrl('/admin/dashboard');
      default: return this.router.parseUrl('/login');
    }
  }
};
