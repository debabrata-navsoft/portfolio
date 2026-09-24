import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './admin-login.html',
})
export class AdminLogin {
  private adminService = inject(AdminService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  touched = signal<{
    email: boolean;
    password: boolean;
  }>({
    email: false,
    password: false,
  });

  markTouched(field: 'email' | 'password') {
    this.touched.update((t) => ({
      ...t,
      [field]: true,
    }));
  }

  isFieldInvalid(field: 'email' | 'password'): boolean {
    const isTouched = this.touched()[field];
    if (!isTouched) return false;

    if (field === 'email') return !this.email().trim();
    if (field === 'password') return !this.password().trim();
    return false;
  }

  login() {
    this.errorMessage.set('');
    this.touched.set({
      email: true,
      password: true,
    });

    if (!this.email().trim() || !this.password().trim()) {
      return;
    }

    this.isLoading.set(true);

    this.adminService.login(this.email(), this.password()).subscribe({
      next: (res) => {
        this.adminService.saveToken(res.token);
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Invalid email or password');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }
}
