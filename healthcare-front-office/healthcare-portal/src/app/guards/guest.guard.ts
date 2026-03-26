import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('TokenUserConnect');
    if (!token) return true;

    const role = localStorage.getItem('RoleUserConnect')?.replace(/"/g, '');

    switch (role) {
      case 'ROLE_PATIENT':
        return this.router.parseUrl('/patient');
      case 'ROLE_DOCTOR':
        return this.router.parseUrl('/doctor');
      case 'ROLE_PHARMACIST':
        return this.router.parseUrl('/pharmacist');
      case 'ROLE_PHYSIOTHERAPIST':
        return this.router.parseUrl('/physio');
      case 'ROLE_LABORATORY':
        return this.router.parseUrl('/laboratory');
      default:
        return this.router.parseUrl('/login');
    }
  }
}
