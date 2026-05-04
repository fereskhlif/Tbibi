import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const expectedRole = route.data['role'];
    let userRole = localStorage.getItem('RoleUserConnect');

    if (!userRole) return this.router.parseUrl('/login');

    // Normalize user role (remove quotes and ROLE_ prefix)
    userRole = userRole.replace(/"/g, '').toUpperCase();
    if (userRole.startsWith('ROLE_')) {
      userRole = userRole.substring(5);
    }

    // Check if user has the expected role
    if (userRole === expectedRole.toUpperCase()) return true;

    // Redirection Map for incorrect access attempts
    const routeMap: Record<string, string> = {
      'PATIENT': '/patient',
      'DOCTEUR': '/doctor',
      'PHARMASIS': '/pharmacist',
      'KINE': '/physio',
      'LABORATORY': '/laboratory',
      'ADMIN': '/admin/dashboard'
    };

    const destination = routeMap[userRole] || '/login';
    return this.router.parseUrl(destination);
  }
};
