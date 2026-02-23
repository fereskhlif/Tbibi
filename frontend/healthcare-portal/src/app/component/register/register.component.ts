import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm = new FormGroup({
    
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    role: new FormControl('', Validators.required),
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    
    const email = this.registerForm.value.email!;
    const password = this.registerForm.value.password!;
    const role = this.registerForm.value.role! as 'ROLE_PATIENT' | 'ROLE_DOCTOR' | 'ROLE_PHARMACIST' | 'ROLE_PHYSIOTHERAPIST' | 'ROLE_LABORATORY';
    this.authService.register({  email, password, role }).subscribe({
      next: () => {
        alert('Registration successful! Please log in.');
        this.router.navigateByUrl('/login');
      },
      error: (error: HttpErrorResponse) => {
        alert('An error occurred during registration.');
        console.error(error);
      }
    });
  }
  get email()    { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get role()     { return this.registerForm.get('role'); }
}